-- ==============================================================================
-- KABARSANTRI ERP v2.0 - CORE DATABASE SCHEMA & RLS SECURITY ENGINE
-- Multi-Tenant, Dual-Identity, Immutability, Feature-Flagged E-Pocket (Uang Jajan)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TENANT & HIERARCHY
-- ==============================================================================

CREATE TYPE tenant_type_enum AS ENUM ('production', 'demo', 'sandbox');
CREATE TYPE user_status_enum AS ENUM ('aktif', 'nonaktif', 'terkunci');
CREATE TYPE santri_status_enum AS ENUM ('aktif', 'mutasi', 'alumni', 'dikeluarkan');
CREATE TYPE wali_hubungan_enum AS ENUM ('ayah', 'ibu', 'wali');
CREATE TYPE transaksi_tipe_enum AS ENUM ('kredit', 'debet');
CREATE TYPE tagihan_status_enum AS ENUM ('unpaid', 'partial', 'paid', 'cancelled');

-- Tabel Induk Tenant (Yayasan / Lembaga)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_yayasan VARCHAR(255) NOT NULL,
    subdomain VARCHAR(64) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    type tenant_type_enum NOT NULL DEFAULT 'production',
    feature_flags JSONB NOT NULL DEFAULT '{"enable_uang_jajan": false, "enable_tahfidz": true, "enable_perizinan": true}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unit Pendidikan (Pondok, SMP, MTs, SMA, MA)
CREATE TABLE IF NOT EXISTS unit_pendidikan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    nama_unit VARCHAR(100) NOT NULL,
    jenjang VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tahun Ajaran
CREATE TABLE IF NOT EXISTS tahun_ajaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    nama VARCHAR(50) NOT NULL, -- Contoh: "2026/2027 Ganjil"
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. IDENTITY, PROFILE, JABATAN & RBAC
-- ==============================================================================

-- Profil Pengguna Internal (Pegawai / Staf)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    nama_lengkap VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    no_hp VARCHAR(32),
    avatar_url TEXT,
    status user_status_enum NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master Jabatan (Role Terdefinisi oleh Sistem / Yayasan)
CREATE TABLE IF NOT EXISTS jabatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    nama_jabatan VARCHAR(100) NOT NULL,
    slug VARCHAR(64) NOT NULL, -- yayasan, mudir, guru, kesantrian, musyrif, keuangan, admin
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, slug)
);

-- Data Pegawai Internal
CREATE TABLE IF NOT EXISTS pegawai (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE RESTRICT,
    nip VARCHAR(64),
    nik VARCHAR(32),
    status user_status_enum NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relasi Pegawai <-> Jabatan (N:M, Menentukan RBAC tanpa user memilih role sendiri)
CREATE TABLE IF NOT EXISTS pegawai_jabatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    pegawai_id UUID NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    jabatan_id UUID NOT NULL REFERENCES jabatan(id) ON DELETE RESTRICT,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(pegawai_id, jabatan_id)
);

-- ==============================================================================
-- 4. MASTER DATA SANTRI, WALI & KELAS
-- ==============================================================================

-- Data Induk Santri
CREATE TABLE IF NOT EXISTS santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES unit_pendidikan(id) ON DELETE RESTRICT,
    nis VARCHAR(64) NOT NULL,
    nisn VARCHAR(32),
    nama_lengkap VARCHAR(255) NOT NULL,
    jenis_kelamin VARCHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE NOT NULL,
    status santri_status_enum NOT NULL DEFAULT 'aktif',
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nis)
);

-- Master Kelas & Rombel
CREATE TABLE IF NOT EXISTS kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES unit_pendidikan(id) ON DELETE RESTRICT,
    tahun_ajaran_id UUID NOT NULL REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    nama_kelas VARCHAR(64) NOT NULL, -- Contoh: "7A", "10 IPA 1"
    tingkat INT NOT NULL,
    wali_kelas_id UUID REFERENCES pegawai(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, tahun_ajaran_id, nama_kelas)
);

-- Penempatan Kelas Santri (Assign Kelas)
CREATE TABLE IF NOT EXISTS santri_kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    kelas_id UUID NOT NULL REFERENCES kelas(id) ON DELETE RESTRICT,
    tahun_ajaran_id UUID NOT NULL REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(santri_id, tahun_ajaran_id)
);

-- Data Induk Wali Santri
CREATE TABLE IF NOT EXISTS wali (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    nama_lengkap VARCHAR(255) NOT NULL,
    no_whatsapp VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    alamat TEXT,
    pin_hash VARCHAR(255), -- Hashed PIN untuk akses frictionless wali
    auth_user_id UUID UNIQUE REFERENCES auth.users(id),
    status user_status_enum NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, no_whatsapp)
);

-- Relasi Santri <-> Wali (Mendukung 1 Wali memiliki banyak santri)
CREATE TABLE IF NOT EXISTS wali_santri_relasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    wali_id UUID NOT NULL REFERENCES wali(id) ON DELETE CASCADE,
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE CASCADE,
    hubungan wali_hubungan_enum NOT NULL DEFAULT 'ayah',
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(wali_id, santri_id)
);

-- ==============================================================================
-- 5. TRANSAKSI FINANSIAL (SPP, TABUNGAN, & UANG JAJAN)
-- ==============================================================================

-- Tagihan SPP & Biaya Pendidikan
CREATE TABLE IF NOT EXISTS tagihan_spp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES santri(id) ON DELETE RESTRICT,
    tahun_ajaran_id UUID NOT NULL REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun INT NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal >= 0),
    nominal_terbayar NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (nominal_terbayar >= 0),
    status tagihan_status_enum NOT NULL DEFAULT 'unpaid',
    tanggal_jatuh_tempo DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, santri_id, bulan, tahun)
);

-- Tabungan Santri (Wadiah Simpanan)
CREATE TABLE IF NOT EXISTS tabungan_santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    santri_id UUID UNIQUE NOT NULL REFERENCES santri(id) ON DELETE RESTRICT,
    nomor_rekening VARCHAR(64) UNIQUE NOT NULL,
    saldo NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (saldo >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tabungan_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    tabungan_id UUID NOT NULL REFERENCES tabungan_santri(id) ON DELETE RESTRICT,
    tipe transaksi_tipe_enum NOT NULL, -- debet (penarikan) / kredit (setoran)
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    saldo_akhir NUMERIC(15, 2) NOT NULL CHECK (saldo_akhir >= 0),
    keterangan TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. UANG JAJAN (WALLET KANTIN E-POCKET) - FULL ENGINE (DISEMBUNYIKAN DI UI)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS uang_jajan_wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    santri_id UUID UNIQUE NOT NULL REFERENCES santri(id) ON DELETE RESTRICT,
    saldo NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (saldo >= 0),
    limit_harian NUMERIC(15, 2) NOT NULL DEFAULT 20000 CHECK (limit_harian >= 0),
    pin_transaksi VARCHAR(255), -- Barcode/PIN saat jajan di kasir kantin
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS uang_jajan_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    wallet_id UUID NOT NULL REFERENCES uang_jajan_wallet(id) ON DELETE RESTRICT,
    tipe transaksi_tipe_enum NOT NULL, -- kredit: top-up wali, debet: belanja kantin
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    saldo_akhir NUMERIC(15, 2) NOT NULL CHECK (saldo_akhir >= 0),
    keterangan VARCHAR(255) NOT NULL,
    kasir_pegawai_id UUID REFERENCES pegawai(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. AUDIT TRAIL ENGINE (NO HARD DELETE ON CRITICAL DATA)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    table_name VARCHAR(64) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 8. HELPER SECURITY FUNCTIONS & RLS POLICIES
-- ==============================================================================

-- Mendapatkan Tenant ID dari JWT session
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Mendapatkan Role Slug User Saat Ini
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '');
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Mengaktifkan RLS pada seluruh tabel
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_pendidikan ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahun_ajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai_jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE wali ENABLE ROW LEVEL SECURITY;
ALTER TABLE wali_santri_relasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagihan_spp ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabungan_santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabungan_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE uang_jajan_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE uang_jajan_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Template RLS Policy Multi-Tenant Otomatis
CREATE POLICY rls_tenant_isolation_santri ON santri
    FOR ALL USING (tenant_id = current_tenant_id() AND deleted_at IS NULL)
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_tenant_isolation_pegawai ON pegawai
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_tenant_isolation_wali ON wali
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_tenant_isolation_kelas ON kelas
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_tenant_isolation_santri_kelas ON santri_kelas
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_tenant_isolation_spp ON tagihan_spp
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_tenant_isolation_tabungan ON tabungan_santri
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_tenant_isolation_uang_jajan ON uang_jajan_wallet
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- ==============================================================================
-- 9. STORED PROCEDURES & BUSINESS WORKFLOW RPCS
-- ==============================================================================

-- A. Pembuatan Akun Wali Santri (Buat Akun Wali)
CREATE OR REPLACE FUNCTION rpc_buat_akun_wali(
    p_wali_id UUID,
    p_initial_pin TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_tenant_id UUID;
    v_wali RECORD;
    v_pin_hash TEXT;
BEGIN
    v_tenant_id := current_tenant_id();

    SELECT * INTO v_wali FROM wali 
    WHERE id = p_wali_id AND tenant_id = v_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data Wali tidak ditemukan pada tenant ini';
    END IF;

    -- Hash PIN menggunakan crypt blowfish
    v_pin_hash := crypt(p_initial_pin, gen_salt('bf', 8));

    UPDATE wali
    SET pin_hash = v_pin_hash,
        status = 'aktif',
        updated_at = now()
    WHERE id = p_wali_id;

    RETURN jsonb_build_object(
        'success', true,
        'wali_id', p_wali_id,
        'message', 'Akun Wali berhasil diaktivasi dengan PIN baru'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Reset Akun & PIN Wali Santri (Reset Akun)
CREATE OR REPLACE FUNCTION rpc_reset_akun_wali(
    p_wali_id UUID,
    p_new_pin TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_tenant_id UUID;
    v_pin_hash TEXT;
BEGIN
    v_tenant_id := current_tenant_id();
    v_pin_hash := crypt(p_new_pin, gen_salt('bf', 8));

    UPDATE wali
    SET pin_hash = v_pin_hash,
        updated_at = now()
    WHERE id = p_wali_id AND tenant_id = v_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wali tidak ditemukan untuk di-reset';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'PIN akun wali berhasil di-reset'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Assign Kelas Santri
CREATE OR REPLACE FUNCTION rpc_assign_santri_kelas(
    p_santri_id UUID,
    p_kelas_id UUID,
    p_tahun_ajaran_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_tenant_id UUID;
    v_assigned_id UUID;
BEGIN
    v_tenant_id := current_tenant_id();

    -- Deactivate assignment kelas sebelumnya di tahun ajaran yang sama jika ada
    UPDATE santri_kelas
    SET is_active = false
    WHERE tenant_id = v_tenant_id 
      AND santri_id = p_santri_id 
      AND tahun_ajaran_id = p_tahun_ajaran_id;

    -- Insert assignment baru
    INSERT INTO santri_kelas (tenant_id, santri_id, kelas_id, tahun_ajaran_id, is_active)
    VALUES (v_tenant_id, p_santri_id, p_kelas_id, p_tahun_ajaran_id, true)
    ON CONFLICT (santri_id, tahun_ajaran_id) 
    DO UPDATE SET kelas_id = EXCLUDED.kelas_id, is_active = true
    RETURNING id INTO v_assigned_id;

    RETURN jsonb_build_object(
        'success', true,
        'assignment_id', v_assigned_id,
        'message', 'Santri berhasil ditempatkan di kelas'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Engine Uang Jajan Belanja (Hidden in UI via feature flag, but full logic)
CREATE OR REPLACE FUNCTION rpc_uang_jajan_belanja(
    p_santri_id UUID,
    p_nominal NUMERIC,
    p_keterangan TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_tenant_id UUID;
    v_wallet RECORD;
    v_belanja_hari_ini NUMERIC;
    v_saldo_baru NUMERIC;
BEGIN
    v_tenant_id := current_tenant_id();

    -- Lock baris wallet untuk mencegah race condition / double spending
    SELECT * INTO v_wallet 
    FROM uang_jajan_wallet 
    WHERE santri_id = p_santri_id AND tenant_id = v_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet uang jajan santri tidak ditemukan';
    END IF;

    IF NOT v_wallet.is_active THEN
        RAISE EXCEPTION 'Wallet uang jajan sedang dinonaktifkan';
    END IF;

    IF v_wallet.saldo < p_nominal THEN
        RAISE EXCEPTION 'Saldo tidak mencukupi (Sisa Saldo: Rp %)', v_wallet.saldo;
    END IF;

    -- Hitung total belanja hari ini
    SELECT COALESCE(SUM(nominal), 0) INTO v_belanja_hari_ini
    FROM uang_jajan_transaksi
    WHERE wallet_id = v_wallet.id
      AND tipe = 'debet'
      AND created_at >= CURRENT_DATE;

    IF (v_belanja_hari_ini + p_nominal) > v_wallet.limit_harian THEN
        RAISE EXCEPTION 'Transaksi melebihi limit harian (Limit: Rp %, Sudah Belanja: Rp %)', 
            v_wallet.limit_harian, v_belanja_hari_ini;
    END IF;

    v_saldo_baru := v_wallet.saldo - p_nominal;

    -- Update saldo
    UPDATE uang_jajan_wallet
    SET saldo = v_saldo_baru, updated_at = now()
    WHERE id = v_wallet.id;

    -- Catat transaksi
    INSERT INTO uang_jajan_transaksi (tenant_id, wallet_id, tipe, nominal, saldo_akhir, keterangan)
    VALUES (v_tenant_id, v_wallet.id, 'debet', p_nominal, v_saldo_baru, p_keterangan);

    RETURN jsonb_build_object(
        'success', true,
        'saldo_sebelum', v_wallet.saldo,
        'saldo_akhir', v_saldo_baru,
        'nominal', p_nominal,
        'message', 'Transaksi uang jajan berhasil'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- E. Lihat Laporan Ringkasan Eksekutif
CREATE OR REPLACE FUNCTION rpc_get_laporan_ringkasan()
RETURNS JSONB AS $$
DECLARE
    v_tenant_id UUID;
    v_total_santri INT;
    v_total_pegawai INT;
    v_spp_terbayar NUMERIC;
    v_spp_tertunggak NUMERIC;
    v_total_tabungan NUMERIC;
    v_total_uang_jajan NUMERIC;
BEGIN
    v_tenant_id := current_tenant_id();

    SELECT COUNT(*) INTO v_total_santri FROM santri WHERE tenant_id = v_tenant_id AND status = 'aktif' AND deleted_at IS NULL;
    SELECT COUNT(*) INTO v_total_pegawai FROM pegawai WHERE tenant_id = v_tenant_id AND status = 'aktif';

    SELECT 
        COALESCE(SUM(nominal_terbayar), 0),
        COALESCE(SUM(nominal - nominal_terbayar), 0)
    INTO v_spp_terbayar, v_spp_tertunggak
    FROM tagihan_spp WHERE tenant_id = v_tenant_id;

    SELECT COALESCE(SUM(saldo), 0) INTO v_total_tabungan FROM tabungan_santri WHERE tenant_id = v_tenant_id;
    SELECT COALESCE(SUM(saldo), 0) INTO v_total_uang_jajan FROM uang_jajan_wallet WHERE tenant_id = v_tenant_id;

    RETURN jsonb_build_object(
        'tenant_id', v_tenant_id,
        'total_santri', v_total_santri,
        'total_pegawai', v_total_pegawai,
        'keuangan', jsonb_build_object(
            'spp_terbayar', v_spp_terbayar,
            'spp_tertunggak', v_spp_tertunggak,
            'total_tabungan_wadiah', v_total_tabungan,
            'total_saldo_uang_jajan', v_total_uang_jajan
        )
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
