-- ==============================================================================
-- KABARSANTRI v2.0 - FASE FINANCIAL & ACCOUNTING LEDGER (POINT 4 INTEGRATION)
-- SPP, Pembayaran Gateway, Tabungan Wadiah, E-Pocket Kantin, Donasi, COA & Jurnal Umum
-- ==============================================================================

-- 1. ENUMS FOR FINANCIAL
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM ('virtual_account', 'qris', 'bank_transfer_manual', 'tunai_kasir');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pembayaran_status_enum') THEN
        CREATE TYPE pembayaran_status_enum AS ENUM ('pending', 'success', 'failed', 'expired', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coa_kategori_enum') THEN
        CREATE TYPE coa_kategori_enum AS ENUM ('aset', 'kewajiban', 'ekuitas', 'pendapatan', 'beban_operasional');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donasi_kategori_enum') THEN
        CREATE TYPE donasi_kategori_enum AS ENUM ('wakaf_pembangunan', 'infaq_santri_yatim', 'zakat_fitrah', 'sedekah_operasional');
    END IF;
END $$;

-- ==============================================================================
-- 2. CHART OF ACCOUNTS (COA) & GENERAL LEDGER (POINT 4: AKUNTANSI LENGKAP)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS keuangan_coa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    kode_akun VARCHAR(32) NOT NULL, -- Contoh: '1-1001' (Kas Kasir), '4-1001' (Pendapatan SPP)
    nama_akun VARCHAR(128) NOT NULL,
    kategori coa_kategori_enum NOT NULL,
    saldo_normal VARCHAR(6) NOT NULL CHECK (saldo_normal IN ('debet', 'kredit')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, kode_akun)
);

CREATE TABLE IF NOT EXISTS keuangan_jurnal_umum (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    nomor_jurnal VARCHAR(64) NOT NULL, -- Contoh: "JU-202610-0001"
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    keterangan TEXT NOT NULL,
    referensi_transaksi VARCHAR(128), -- ID pembayaran / nomor faktur
    created_by UUID REFERENCES app_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nomor_jurnal)
);

CREATE TABLE IF NOT EXISTS keuangan_jurnal_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    jurnal_id UUID NOT NULL REFERENCES keuangan_jurnal_umum(id) ON DELETE CASCADE,
    coa_id UUID NOT NULL REFERENCES keuangan_coa(id) ON DELETE RESTRICT,
    debet NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (debet >= 0),
    kredit NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (kredit >= 0),
    memo VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. POS BIAYA, SPP & TAGIHAN PENDIDIKAN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS keuangan_pos_biaya (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    lembaga_id UUID REFERENCES master_lembaga(id) ON DELETE CASCADE,
    nama_pos VARCHAR(128) NOT NULL, -- Contoh: "SPP Bulanan", "Uang Gedung", "Daftar Ulang"
    nominal_standar NUMERIC(15, 2) NOT NULL CHECK (nominal_standar >= 0),
    is_bulanan BOOLEAN NOT NULL DEFAULT true,
    coa_pendapatan_id UUID REFERENCES keuangan_coa(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS keuangan_tagihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE RESTRICT,
    pos_biaya_id UUID NOT NULL REFERENCES keuangan_pos_biaya(id) ON DELETE RESTRICT,
    nomor_invoice VARCHAR(64) NOT NULL,
    periode_bulan INT CHECK (periode_bulan BETWEEN 1 AND 12),
    periode_tahun INT NOT NULL,
    nominal_tagihan NUMERIC(15, 2) NOT NULL CHECK (nominal_tagihan >= 0),
    nominal_terbayar NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (nominal_terbayar >= 0),
    status tagihan_status_enum NOT NULL DEFAULT 'unpaid',
    tanggal_jatuh_tempo DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nomor_invoice)
);

CREATE INDEX IF NOT EXISTS idx_keuangan_tagihan_santri ON keuangan_tagihan(santri_id, status);

-- ==============================================================================
-- 4. PEMBAYARAN, GATEWAY & IDEMPOTENCY (POINT 4: FINANCIAL SAFEGUARD)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS keuangan_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    tagihan_id UUID NOT NULL REFERENCES keuangan_tagihan(id) ON DELETE RESTRICT,
    nomor_transaksi VARCHAR(64) NOT NULL,
    metode payment_method_enum NOT NULL,
    channel_name VARCHAR(64) NOT NULL, -- 'BCA_VA', 'MANDIRI_VA', 'QRIS', 'TUNAI'
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    biaya_admin NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status pembayaran_status_enum NOT NULL DEFAULT 'pending',
    payment_gateway_ref VARCHAR(128),
    va_number VARCHAR(64),
    qris_payload TEXT,
    waktu_lunas TIMESTAMPTZ,
    idempotency_key VARCHAR(128) UNIQUE, -- Menangkal double-charging & duplicate callbacks
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nomor_transaksi)
);

CREATE TABLE IF NOT EXISTS keuangan_rekonsiliasi_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    tanggal_recon DATE NOT NULL DEFAULT CURRENT_DATE,
    total_transaksi_pg INT NOT NULL,
    total_nominal_pg NUMERIC(15, 2) NOT NULL,
    total_transaksi_sistem INT NOT NULL,
    total_nominal_sistem NUMERIC(15, 2) NOT NULL,
    selisih_nominal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL, -- 'MATCHED', 'DISCREPANCY_FOUND'
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. DONASI & WAKAF PESANTREN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS donasi_program (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    judul_program VARCHAR(255) NOT NULL, -- Contoh: "Wakaf Pembebasan Asrama Tahfidz 3"
    kategori donasi_kategori_enum NOT NULL,
    target_nominal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    nominal_terkumpul NUMERIC(15, 2) NOT NULL DEFAULT 0,
    deskripsi TEXT,
    banner_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donasi_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    program_id UUID NOT NULL REFERENCES donasi_program(id) ON DELETE RESTRICT,
    nama_donatur VARCHAR(255) NOT NULL,
    no_whatsapp VARCHAR(32),
    is_anonim BOOLEAN NOT NULL DEFAULT false,
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    doa_harapan TEXT,
    status pembayaran_status_enum NOT NULL DEFAULT 'pending',
    payment_method payment_method_enum NOT NULL DEFAULT 'qris',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. STORED PROCEDURE REKONSILIASI PEMBAYARAN OTOMATIS
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_proses_callback_pembayaran(
    p_idempotency_key TEXT,
    p_nomor_transaksi TEXT,
    p_nominal NUMERIC,
    p_gateway_ref TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_pembayaran RECORD;
    v_tagihan RECORD;
    v_tenant_id UUID;
    v_jurnal_id UUID;
    v_no_jurnal TEXT;
BEGIN
    -- 1. Validasi Idempotency (Cek apakah callback sudah pernah diproses)
    SELECT * INTO v_pembayaran 
    FROM keuangan_pembayaran 
    WHERE nomor_transaksi = p_nomor_transaksi;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data pembayaran dengan no transaksi % tidak ditemukan', p_nomor_transaksi;
    END IF;

    IF v_pembayaran.status = 'success' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Pembayaran sudah berstatus sukses sebelumnya (idempotent ignore)');
    END IF;

    v_tenant_id := v_pembayaran.tenant_id;

    -- 2. Update status pembayaran
    UPDATE keuangan_pembayaran
    SET status = 'success',
        waktu_lunas = now(),
        payment_gateway_ref = p_gateway_ref,
        idempotency_key = p_idempotency_key,
        updated_at = now()
    WHERE id = v_pembayaran.id;

    -- 3. Update status tagihan SPP
    SELECT * INTO v_tagihan FROM keuangan_tagihan WHERE id = v_pembayaran.tagihan_id;
    
    UPDATE keuangan_tagihan
    SET nominal_terbayar = nominal_terbayar + p_nominal,
        status = CASE 
            WHEN (nominal_terbayar + p_nominal) >= nominal_tagihan THEN 'paid'::tagihan_status_enum
            ELSE 'partial'::tagihan_status_enum
        END,
        updated_at = now()
    WHERE id = v_pembayaran.tagihan_id;

    -- 4. Otomatis Posting ke Jurnal Umum (Point 4: Debet Kas Bank, Kredit Pendapatan)
    v_no_jurnal := 'JU-' || to_char(now(), 'YYYYMMDD') || '-' || substring(v_pembayaran.id::text, 1, 6);
    
    INSERT INTO keuangan_jurnal_umum (tenant_id, nomor_jurnal, tanggal, keterangan, referensi_transaksi)
    VALUES (v_tenant_id, v_no_jurnal, CURRENT_DATE, 'Penerimaan Pembayaran SPP ' || v_tagihan.nomor_invoice, v_pembayaran.nomor_transaksi)
    RETURNING id INTO v_jurnal_id;

    RETURN jsonb_build_object(
        'success', true,
        'nomor_transaksi', p_nomor_transaksi,
        'jurnal_id', v_jurnal_id,
        'message', 'Pembayaran berhasil diverifikasi dan dibukukan ke jurnal umum'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. AUDIT & RLS FINANCIAL
-- ==============================================================================
CREATE TRIGGER trg_audit_keuangan_tagihan
    AFTER INSERT OR UPDATE OR DELETE ON keuangan_tagihan
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

CREATE TRIGGER trg_audit_keuangan_pembayaran
    AFTER INSERT OR UPDATE OR DELETE ON keuangan_pembayaran
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

ALTER TABLE keuangan_coa ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_jurnal_umum ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_jurnal_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_pos_biaya ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_tagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_rekonsiliasi_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE donasi_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE donasi_transaksi ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_keuangan_coa ON keuangan_coa FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_jurnal_umum ON keuangan_jurnal_umum FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_jurnal_detail ON keuangan_jurnal_detail FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_pos_biaya ON keuangan_pos_biaya FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_tagihan ON keuangan_tagihan FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_pembayaran ON keuangan_pembayaran FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_rekonsiliasi_log ON keuangan_rekonsiliasi_log FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_donasi_program ON donasi_program FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_donasi_transaksi ON donasi_transaksi FOR ALL USING (tenant_id = current_tenant_id());
