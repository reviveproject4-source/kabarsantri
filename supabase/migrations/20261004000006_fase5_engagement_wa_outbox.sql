-- ==============================================================================
-- KABARSANTRI v2.0 - FASE 5: ENGAGEMENT & WHATSAPP OUTBOX ENGINE (POINT 3 INTEGRATION)
-- Portal Wali, Notifikasi, Pengumuman, dan WhatsApp Asynchronous Throttling (Anti-Banned)
-- ==============================================================================

-- 1. ENUMS FOR ENGAGEMENT
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wa_msg_status_enum') THEN
        CREATE TYPE wa_msg_status_enum AS ENUM ('pending', 'processing', 'sent', 'failed', 'rate_limited', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'target_audiens_enum') THEN
        CREATE TYPE target_audiens_enum AS ENUM ('semua', 'per_lembaga', 'per_kamar', 'per_kelas', 'staf_internal');
    END IF;
END $$;

-- ==============================================================================
-- 2. WHATSAPP OUTBOX & ANTI-BANNED QUEUE ENGINE (POINT 3)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS wa_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    kode_template VARCHAR(64) NOT NULL, -- Contoh: 'NOTIF_SPP', 'NOTIF_GATEPASS_KELUAR', 'NOTIF_TAHFIDZ'
    judul VARCHAR(128) NOT NULL,
    template_body TEXT NOT NULL, -- Format dengan placeholder: "Yth. {{wali_nama}}, ananda {{santri_nama}}..."
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, kode_template)
);

CREATE TABLE IF NOT EXISTS wa_message_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    recipient_phone VARCHAR(32) NOT NULL,
    message_body TEXT NOT NULL,
    template_id UUID REFERENCES wa_templates(id),
    priority INT NOT NULL DEFAULT 3, -- 1: Emergency (Kesehatan), 2: Gate Pass, 3: Presensi/Tahfidz, 4: SPP Broadcast
    status wa_msg_status_enum NOT NULL DEFAULT 'pending',
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    last_error TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_outbox_queue ON wa_message_outbox(tenant_id, status, priority, scheduled_at);

-- ==============================================================================
-- 3. PENGUMUMAN & BOARDCAST PESANTREN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pengumuman_broadcast (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    judul VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    konten_markdown TEXT NOT NULL,
    target_audiens target_audiens_enum NOT NULL DEFAULT 'semua',
    target_lembaga_id UUID REFERENCES master_lembaga(id),
    target_kamar_id UUID REFERENCES asrama_kamar(id),
    target_kelas_id UUID REFERENCES master_kelas(id),
    lampiran_dokumen_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    author_id UUID REFERENCES app_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. PORTAL WALI IDENTITY & AUDIT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS portal_wali_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    wali_id UUID NOT NULL REFERENCES master_wali(id) ON DELETE CASCADE,
    device_info TEXT,
    ip_address INET,
    last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. ASYNCHRONOUS WA DISPATCHER RPCS (THROTTLED & SECURE)
-- ==============================================================================

-- A. Enqueue Pesan ke Outbox (Dipanggil oleh modul perizinan, presensi, SPP)
CREATE OR REPLACE FUNCTION rpc_enqueue_wa_message(
    p_recipient_phone TEXT,
    p_message_body TEXT,
    p_priority INT DEFAULT 3,
    p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_outbox_id UUID;
BEGIN
    v_tenant_id := current_tenant_id();

    INSERT INTO wa_message_outbox (
        tenant_id,
        recipient_phone,
        message_body,
        priority,
        status,
        payload
    ) VALUES (
        v_tenant_id,
        p_recipient_phone,
        p_message_body,
        p_priority,
        'pending',
        p_payload
    ) RETURNING id INTO v_outbox_id;

    RETURN v_outbox_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Ambil Batch Pesan Terantre untuk Dikirim dengan Jeda Waktu (Throttled Fetch)
CREATE OR REPLACE FUNCTION rpc_fetch_next_wa_batch(
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    outbox_id UUID,
    tenant_id UUID,
    recipient_phone VARCHAR(32),
    message_body TEXT,
    attempt_count INT
) AS $$
BEGIN
    RETURN QUERY
    UPDATE wa_message_outbox
    SET status = 'processing',
        attempt_count = wa_message_outbox.attempt_count + 1
    WHERE wa_message_outbox.id IN (
        SELECT id FROM wa_message_outbox
        WHERE wa_message_outbox.status = 'pending'
          AND wa_message_outbox.scheduled_at <= now()
        ORDER BY wa_message_outbox.priority ASC, wa_message_outbox.scheduled_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    RETURNING wa_message_outbox.id, wa_message_outbox.tenant_id, wa_message_outbox.recipient_phone, wa_message_outbox.message_body, wa_message_outbox.attempt_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. AUDIT & RLS FASE 5
-- ==============================================================================
ALTER TABLE wa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_message_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman_broadcast ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_wali_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_wa_templates ON wa_templates FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_wa_message_outbox ON wa_message_outbox FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_pengumuman_broadcast ON pengumuman_broadcast FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_portal_wali_sessions ON portal_wali_sessions FOR ALL USING (tenant_id = current_tenant_id());
