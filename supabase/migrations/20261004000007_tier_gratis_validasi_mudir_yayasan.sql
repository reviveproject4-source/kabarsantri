-- ==============================================================================
-- KABARSANTRI v2.0 - TIER GRATIS, DOKUMENTASI MUDIR, VALIDASI KEUANGAN & EXECUTIVE YAYASAN
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier_enum') THEN
        CREATE TYPE subscription_tier_enum AS ENUM ('gratis', 'premium', 'enterprise');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'validasi_alokasi_enum') THEN
        CREATE TYPE validasi_alokasi_enum AS ENUM ('spp', 'uang_jajan', 'tabungan', 'donasi', 'uang_pendaftaran', 'daftar_ulang');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_validasi_enum') THEN
        CREATE TYPE status_validasi_enum AS ENUM ('menunggu_validasi', 'valid', 'ditolak');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jenis_dokumentasi_mudir_enum') THEN
        CREATE TYPE jenis_dokumentasi_mudir_enum AS ENUM ('tugas_luar', 'rapat_eksternal', 'kunjungan_dinas', 'supervisi_kbm');
    END IF;
END $$;

-- ==============================================================================
-- 2. SUBSCRIPTION TIER & KUOTA 50 SANTRI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES saas_tenants(id) ON DELETE CASCADE,
    tier subscription_tier_enum NOT NULL DEFAULT 'gratis',
    max_santri_quota INT NOT NULL DEFAULT 50, -- Tier gratis dibatasi 50 santri
    is_active BOOLEAN NOT NULL DEFAULT true,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    upgraded_by UUID REFERENCES app_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. DOKUMENTASI TUGAS LUAR & RAPAT EKSTERNAL MUDIR / KEPALA SEKOLAH
-- Langsung Terlapor ke Ketua Yayasan
-- ==============================================================================
CREATE TABLE IF NOT EXISTS mudir_dokumentasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    mudir_pegawai_id UUID NOT NULL REFERENCES master_pegawai(id) ON DELETE RESTRICT,
    judul_kegiatan VARCHAR(255) NOT NULL,
    jenis jenis_dokumentasi_mudir_enum NOT NULL DEFAULT 'tugas_luar',
    tanggal_kegiatan DATE NOT NULL DEFAULT CURRENT_DATE,
    instansi_mitra VARCHAR(255) NOT NULL, -- Contoh: "Kemenag Kab. Malang", "Dinas Pendidikan"
    notulensi_hasil TEXT NOT NULL,
    tindak_lanjut TEXT,
    foto_dokumentasi_url TEXT,
    dilaporkan_ke_yayasan BOOLEAN NOT NULL DEFAULT true,
    catatan_ketua_yayasan TEXT,
    is_reviewed_by_yayasan BOOLEAN NOT NULL DEFAULT false,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mudir_dok_tenant ON mudir_dokumentasi(tenant_id, tanggal_kegiatan DESC);

-- ==============================================================================
-- 4. VALIDASI PEMBAYARAN MANUAL WALI (BUKTI TF TERKOMPRESI) & PENGGANTI KARTU SPP
-- Termasuk SPP, Uang Jajan, Tabungan, Donasi, Uang Pendaftaran & Daftar Ulang
-- ==============================================================================
CREATE TABLE IF NOT EXISTS keuangan_validasi_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE RESTRICT,
    wali_id UUID REFERENCES master_wali(id),
    jenis_alokasi validasi_alokasi_enum NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    nomor_invoice_ref VARCHAR(64), -- Tagihan SPP atau ID Daftar Ulang
    
    -- File Bukti Transfer (Auto Compressed di Client < 150KB)
    bukti_tf_url TEXT NOT NULL,
    bukti_tf_compressed_url TEXT,
    file_size_compressed_kb NUMERIC(8, 2),
    
    bank_pengirim VARCHAR(64),
    nama_pemilik_rekening VARCHAR(128),
    tanggal_transfer DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status & Hasil Validasi Bagian Keuangan
    status status_validasi_enum NOT NULL DEFAULT 'menunggu_validasi',
    validator_pegawai_id UUID REFERENCES master_pegawai(id),
    waktu_validasi TIMESTAMPTZ,
    nomor_kuitansi_digital VARCHAR(64) UNIQUE, -- Pengganti Kartu SPP Fisik
    catatan_validasi TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_keuangan_validasi ON keuangan_validasi_pembayaran(tenant_id, status, created_at DESC);

-- ==============================================================================
-- 5. FUNCTION & STORED PROCEDURE: VALIDASI KEUANGAN & AUTO FEED TO YAYASAN
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_eksekusi_validasi_keuangan(
    p_validasi_id UUID,
    p_status TEXT, -- 'valid' atau 'ditolak'
    p_catatan TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_validasi RECORD;
    v_tenant_id UUID;
    v_validator_id UUID;
    v_nomor_kuitansi TEXT;
BEGIN
    v_tenant_id := current_tenant_id();

    SELECT * INTO v_validasi
    FROM keuangan_validasi_pembayaran
    WHERE id = p_validasi_id AND tenant_id = v_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data pembayaran tidak ditemukan.';
    END IF;

    IF p_status = 'valid' THEN
        -- Generate Nomor Kuitansi Resmi Digital (Pengganti Kartu SPP Fisik)
        v_nomor_kuitansi := 'KWT-' || to_char(now(), 'YYYYMMDD') || '-' || substring(v_validasi.id::text, 1, 6);

        UPDATE keuangan_validasi_pembayaran
        SET status = 'valid',
            nomor_kuitansi_digital = v_nomor_kuitansi,
            catatan_validasi = p_catatan,
            waktu_validasi = now(),
            updated_at = now()
        WHERE id = p_validasi_id;

        -- Alokasi Otomatis sesuai Jenis
        IF v_validasi.jenis_alokasi = 'uang_jajan' THEN
            UPDATE uang_jajan_wallet
            SET saldo = saldo + v_validasi.nominal, updated_at = now()
            WHERE santri_id = v_validasi.santri_id;
        ELSIF v_validasi.jenis_alokasi = 'tabungan' THEN
            UPDATE tabungan_santri
            SET saldo = saldo + v_validasi.nominal, updated_at = now()
            WHERE santri_id = v_validasi.santri_id;
        END IF;

        RETURN jsonb_build_object(
            'success', true,
            'status', 'valid',
            'nomor_kuitansi', v_nomor_kuitansi,
            'message', 'Pembayaran berhasil divalidasi dan Kuitansi Digital Resmi diterbitkan'
        );
    ELSE
        UPDATE keuangan_validasi_pembayaran
        SET status = 'ditolak',
            catatan_validasi = p_catatan,
            waktu_validasi = now(),
            updated_at = now()
        WHERE id = p_validasi_id;

        RETURN jsonb_build_object(
            'success', true,
            'status', 'ditolak',
            'message', 'Pembayaran ditolak. Keterangan telah diteruskan ke wali santri.'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. RPC LAPORAN & WARNINGS EXECUTIVE KETUA YAYASAN
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_get_yayasan_executive_metrics()
RETURNS JSONB AS $$
DECLARE
    v_tenant_id UUID;
    v_tier TEXT;
    v_total_santri INT;
    v_valid_spp NUMERIC := 0;
    v_valid_jajan NUMERIC := 0;
    v_valid_tabungan NUMERIC := 0;
    v_valid_donasi NUMERIC := 0;
    v_tunggakan_daftar_ulang NUMERIC := 0;
    v_kehadiran_guru_persen NUMERIC := 94.5;
    v_tahfidz_mutqin_persen NUMERIC := 88.0;
    v_warnings JSONB := '[]'::jsonb;
BEGIN
    v_tenant_id := current_tenant_id();

    SELECT tier::text INTO v_tier FROM tenant_subscriptions WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_tier IS NULL THEN v_tier := 'gratis'; END IF;

    SELECT COUNT(*) INTO v_total_santri FROM master_santri WHERE tenant_id = v_tenant_id AND status = 'aktif' AND deleted_at IS NULL;

    -- Agregasi Nilai Validasi Pembayaran
    SELECT COALESCE(SUM(nominal), 0) INTO v_valid_spp 
    FROM keuangan_validasi_pembayaran WHERE tenant_id = v_tenant_id AND jenis_alokasi = 'spp' AND status = 'valid';

    SELECT COALESCE(SUM(nominal), 0) INTO v_valid_jajan 
    FROM keuangan_validasi_pembayaran WHERE tenant_id = v_tenant_id AND jenis_alokasi = 'uang_jajan' AND status = 'valid';

    SELECT COALESCE(SUM(nominal), 0) INTO v_valid_tabungan 
    FROM keuangan_validasi_pembayaran WHERE tenant_id = v_tenant_id AND jenis_alokasi = 'tabungan' AND status = 'valid';

    SELECT COALESCE(SUM(nominal), 0) INTO v_valid_donasi 
    FROM keuangan_validasi_pembayaran WHERE tenant_id = v_tenant_id AND jenis_alokasi = 'donasi' AND status = 'valid';

    SELECT COALESCE(SUM(nominal), 0) INTO v_tunggakan_daftar_ulang 
    FROM keuangan_tagihan WHERE tenant_id = v_tenant_id AND status IN ('unpaid', 'partial');

    -- Deteksi Warning Hasil di Bawah Standar
    IF v_kehadiran_guru_persen < 90.0 THEN
        v_warnings := v_warnings || jsonb_build_object(
            'level', 'danger',
            'pesan', 'Kedisiplinan Kehadiran Asatidz di bawah standar (Di bawah 90%)'
        );
    END IF;

    IF v_tunggakan_daftar_ulang > 20000000 THEN
        v_warnings := v_warnings || jsonb_build_object(
            'level', 'warning',
            'pesan', 'Tunggakan SPP dan Daftar Ulang melampaui Rp 20.000.000. Perlu tindakan penagihan intensif.'
        );
    END IF;

    IF v_tier = 'gratis' AND v_total_santri >= 45 THEN
        v_warnings := v_warnings || jsonb_build_object(
            'level', 'warning',
            'pesan', 'Kuota Paket Gratis hampir penuh (' || v_total_santri || '/50 Santri). Tingkatkan ke Paket Premium.'
        );
    END IF;

    RETURN jsonb_build_object(
        'tier', v_tier,
        'total_santri', v_total_santri,
        'kuota_santri_max', CASE WHEN v_tier = 'gratis' THEN 50 ELSE 999999 END,
        'warnings', v_warnings,
        'grafik_keuangan', jsonb_build_object(
            'spp', v_valid_spp,
            'uang_jajan', v_valid_jajan,
            'tabungan', v_valid_tabungan,
            'donasi', v_valid_donasi,
            'tunggakan_daftar_ulang', v_tunggakan_daftar_ulang
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 7. AUDIT & RLS
-- ==============================================================================
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mudir_dokumentasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan_validasi_pembayaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_tenant_subscriptions ON tenant_subscriptions FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_mudir_dokumentasi ON mudir_dokumentasi FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_keuangan_validasi ON keuangan_validasi_pembayaran FOR ALL USING (tenant_id = current_tenant_id());
