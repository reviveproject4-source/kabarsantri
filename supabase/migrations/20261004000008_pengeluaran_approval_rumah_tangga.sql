-- ==============================================================================
-- KABARSANTRI v2.0 - MODUL PENGELUARAN, APPROVAL BERJENJANG & RUMAH TANGGA
-- Rumah Tangga (Dapur, Laundry, Keamanan), Kebutuhan KBM Mudir, Input Manual Keuangan,
-- Threshold Nominal Mandiri per Tenant, dan Notifikasi Yayasan.
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'divisi_pemohon_enum') THEN
        CREATE TYPE divisi_pemohon_enum AS ENUM ('dapur', 'laundry', 'keamanan', 'mudir_kbm', 'keuangan', 'sarpras');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_approval_pengeluaran_enum') THEN
        CREATE TYPE status_approval_pengeluaran_enum AS ENUM (
            'menunggu_keuangan',
            'menunggu_wakil_yayasan',
            'menunggu_ketua_yayasan',
            'disetujui',
            'ditolak',
            'dicairkan'
        );
    END IF;
END $$;

-- ==============================================================================
-- 2. PENGATURAN THRESHOLD BATAS PENGELUARAN MANDIRI PER TENANT
-- Tenant dapat mengatur sendiri batasan nominal yang harus di-ACC Keuangan vs Yayasan
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tenant_pengeluaran_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES saas_tenants(id) ON DELETE CASCADE,
    -- Batas pengeluaran rumah tangga (Dapur, Laundry, Keamanan) yang bisa di-ACC langsung Bagian Keuangan
    max_keuangan_rumah_tangga NUMERIC(15, 2) NOT NULL DEFAULT 1000000, -- Default: < 1 Juta
    -- Batas pengeluaran kebutuhan KBM oleh Mudir yang bisa di-ACC langsung Bagian Keuangan
    max_keuangan_kbm_mudir NUMERIC(15, 2) NOT NULL DEFAULT 3000000,   -- Default: < 3 Juta
    -- Batas pengeluaran yang WAJIB di-ACC oleh Wakil Ketua dan Ketua Yayasan
    min_yayasan_approval NUMERIC(15, 2) NOT NULL DEFAULT 5000000,     -- Default: > 5 Juta
    is_custom_configured BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES app_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. PERMINTAAN KEBUTUHAN / PENGAJUAN PENGELUARAN BERJENJANG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pengeluaran_pengajuan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    nomor_pengajuan VARCHAR(64) NOT NULL, -- Contoh: "REQ-202610-001"
    pemohon_pegawai_id UUID NOT NULL REFERENCES master_pegawai(id) ON DELETE RESTRICT,
    divisi_pemohon divisi_pemohon_enum NOT NULL, -- dapur, laundry, keamanan, mudir_kbm
    judul_keperluan VARCHAR(255) NOT NULL,
    deskripsi_rincian TEXT NOT NULL,
    nominal_diajukan NUMERIC(15, 2) NOT NULL CHECK (nominal_diajukan > 0),
    
    -- Level Approval yang Dibutuhkan (Dihitung Otomatis Berdasarkan Threshold Tenant)
    target_approval_level VARCHAR(32) NOT NULL, -- 'keuangan_only', 'keuangan_dan_yayasan'
    
    -- Status Approval Berjenjang
    status status_approval_pengeluaran_enum NOT NULL DEFAULT 'menunggu_keuangan',
    
    -- 1. ACC Bagian Keuangan
    acc_keuangan_status VARCHAR(16) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    acc_keuangan_by UUID REFERENCES master_pegawai(id),
    acc_keuangan_at TIMESTAMPTZ,
    acc_keuangan_catatan TEXT,
    
    -- 2. ACC Wakil Ketua Yayasan (jika nominal > batas)
    acc_wakil_yayasan_status VARCHAR(16) NOT NULL DEFAULT 'none', -- none, pending, approved, rejected
    acc_wakil_yayasan_by UUID REFERENCES app_profiles(id),
    acc_wakil_yayasan_at TIMESTAMPTZ,
    
    -- 3. ACC Ketua Yayasan (jika nominal > 5 Juta atau melebihi batas)
    acc_ketua_yayasan_status VARCHAR(16) NOT NULL DEFAULT 'none', -- none, pending, approved, rejected
    acc_ketua_yayasan_by UUID REFERENCES app_profiles(id),
    acc_ketua_yayasan_at TIMESTAMPTZ,
    acc_ketua_yayasan_catatan TEXT,
    
    -- Realisasi & Pencairan
    tanggal_cair DATE,
    bukti_struk_realisasi_url TEXT,
    nomor_jurnal_ref VARCHAR(64),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nomor_pengajuan)
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_divisi ON pengeluaran_pengajuan(tenant_id, divisi_pemohon, status);

-- ==============================================================================
-- 4. PENGELUARAN MANUAL OLEH BAGIAN KEUANGAN (OPERASIONAL LANGSUNG)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS keuangan_pengeluaran_manual (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    nomor_transaksi VARCHAR(64) NOT NULL,
    coa_beban_id UUID REFERENCES keuangan_coa(id), -- Akun Beban (Listrik, Air, Dapur, dll)
    coa_kas_id UUID REFERENCES keuangan_coa(id),   -- Akun Kas / Bank Pengeluaran
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    tanggal_transaksi DATE NOT NULL DEFAULT CURRENT_DATE,
    penerima VARCHAR(255) NOT NULL, -- Nama Toko / Vendor / Penerima
    keterangan TEXT NOT NULL,
    bukti_struk_url TEXT,
    dicatat_oleh UUID REFERENCES app_profiles(id),
    nomor_jurnal_ref VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nomor_transaksi)
);

-- ==============================================================================
-- 5. FUNCTION: SUBMIT PENGAJUAN DENGAN EVALUASI THRESHOLD OTOMATIS
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_submit_pengajuan_kebutuhan(
    p_divisi TEXT, -- 'dapur', 'laundry', 'keamanan', 'mudir_kbm'
    p_judul TEXT,
    p_deskripsi TEXT,
    p_nominal NUMERIC,
    p_pegawai_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_tenant_id UUID;
    v_threshold RECORD;
    v_target_level TEXT;
    v_status status_approval_pengeluaran_enum;
    v_nomor_pengajuan TEXT;
    v_new_id UUID;
    v_acc_wakil TEXT := 'none';
    v_acc_ketua TEXT := 'none';
BEGIN
    v_tenant_id := current_tenant_id();

    -- Ambil konfigurasi threshold tenant (atau gunakan nilai default)
    SELECT * INTO v_threshold 
    FROM tenant_pengeluaran_thresholds 
    WHERE tenant_id = v_tenant_id;

    IF NOT FOUND THEN
        -- Default jika belum diatur tenant
        v_threshold.max_keuangan_rumah_tangga := 1000000;
        v_threshold.max_kbm_mudir := 3000000;
        v_threshold.min_yayasan_approval := 5000000;
    END IF;

    -- Evaluasi Rule Bisnis Berdasarkan Divisi & Nominal:
    IF p_divisi IN ('dapur', 'laundry', 'keamanan') THEN
        IF p_nominal < v_threshold.max_keuangan_rumah_tangga THEN
            -- < 1 Juta: Cukup di-ACC oleh Bagian Keuangan
            v_target_level := 'keuangan_only';
            v_status := 'menunggu_keuangan';
        ELSIF p_nominal >= v_threshold.min_yayasan_approval THEN
            -- > 5 Juta: Harus ada ACC dari Wakil Ketua dan Ketua Yayasan
            v_target_level := 'keuangan_dan_yayasan';
            v_status := 'menunggu_keuangan';
            v_acc_wakil := 'pending';
            v_acc_ketua := 'pending';
        ELSE
            -- Antara 1 Jt - 5 Jt: Butuh ACC Keuangan & Notif / ACC Wakil Yayasan
            v_target_level := 'keuangan_dan_wakil';
            v_status := 'menunggu_keuangan';
            v_acc_wakil := 'pending';
        END IF;
    ELSIF p_divisi = 'mudir_kbm' THEN
        IF p_nominal < v_threshold.max_keuangan_kbm_mudir THEN
            -- < 3 Juta: Bagian Keuangan bisa ACC langsung
            v_target_level := 'keuangan_only';
            v_status := 'menunggu_keuangan';
        ELSE
            -- >= 3 Juta: Butuh ACC Ketua / Wakil Ketua Yayasan
            v_target_level := 'keuangan_dan_yayasan';
            v_status := 'menunggu_keuangan';
            v_acc_ketua := 'pending';
        END IF;
    END IF;

    v_nomor_pengajuan := 'REQ-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 4);

    INSERT INTO pengeluaran_pengajuan (
        tenant_id,
        nomor_pengajuan,
        pemohon_pegawai_id,
        divisi_pemohon,
        judul_keperluan,
        deskripsi_rincian,
        nominal_diajukan,
        target_approval_level,
        status,
        acc_wakil_yayasan_status,
        acc_ketua_yayasan_status
    ) VALUES (
        v_tenant_id,
        v_nomor_pengajuan,
        p_pegawai_id,
        p_divisi::divisi_pemohon_enum,
        p_judul,
        p_deskripsi,
        p_nominal,
        v_target_level,
        v_status,
        v_acc_wakil,
        v_acc_ketua
    ) RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'success', true,
        'pengajuan_id', v_new_id,
        'nomor_pengajuan', v_nomor_pengajuan,
        'target_level', v_target_level,
        'message', 'Pengajuan berhasil diajukan dan notifikasi diteruskan ke Keuangan & Yayasan'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. AUDIT & RLS
-- ==============================================================================
ALTER TABLE tenant_pengeluaran_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengeluaran_pengajuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_pengeluaran_manual ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_tenant_pengeluaran_thresholds ON tenant_pengeluaran_thresholds FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_pengeluaran_pengajuan ON pengeluaran_pengajuan FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_pengeluaran_manual ON keuangan_pengeluaran_manual FOR ALL USING (tenant_id = current_tenant_id());
