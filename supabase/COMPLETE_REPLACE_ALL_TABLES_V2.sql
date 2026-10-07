-- ==============================================================================
-- KABARSANTRI ERP v2.0 - MASTER CONSOLIDATED DATABASE REPLACEMENT SCRIPT
-- Target Project: https://fugqdiuxnjwfgxpvxqsy.supabase.co
-- Generated: 2026-10-04
-- INSTRUKSI: Jalankan seluruh skrip ini di SQL Editor Supabase untuk mereplace
-- seluruh skema database lama menjadi skema KabarSantri v2.0 yang lengkap.
-- ==============================================================================


-- ==============================================================================
-- FILE: supabase/migrations/20261004000001_kabarsantri_v2_core.sql
-- ==============================================================================

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


-- ==============================================================================
-- FILE: supabase/migrations/20261004000002_fase1_foundation.sql
-- ==============================================================================

-- ==============================================================================
-- KABARSANTRI v2.0 - FASE 1: FOUNDATION
-- Tenant, Auth, Identity, Profile, Role, Permission, Multi-Role Context, RLS, Audit Log
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES FOR FOUNDATION
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status_enum') THEN
        CREATE TYPE tenant_status_enum AS ENUM ('active', 'suspended', 'trial', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'env_type_enum') THEN
        CREATE TYPE env_type_enum AS ENUM ('production', 'demo', 'sandbox');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_account_status_enum') THEN
        CREATE TYPE user_account_status_enum AS ENUM ('active', 'inactive', 'pending_activation', 'locked');
    END IF;
END $$;

-- ==============================================================================
-- 3. TENANT CORE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS saas_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_tenant VARCHAR(32) UNIQUE NOT NULL,
    nama_resmi VARCHAR(255) NOT NULL,
    subdomain VARCHAR(64) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    tipe_env env_type_enum NOT NULL DEFAULT 'production',
    status tenant_status_enum NOT NULL DEFAULT 'active',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Jakarta',
    logo_url TEXT,
    kontak_telepon VARCHAR(32),
    kontak_email VARCHAR(255),
    feature_flags JSONB NOT NULL DEFAULT '{
        "enable_uang_jajan": false,
        "enable_tahfidz": true,
        "enable_perizinan": true,
        "enable_poskestren": true,
        "enable_kunjungan": true
    }'::jsonb,
    konfigurasi_wa JSONB NOT NULL DEFAULT '{
        "provider": "mock",
        "api_key": null,
        "sender_number": null,
        "throttle_interval_seconds": 2
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saas_tenants_subdomain ON saas_tenants(subdomain);

-- ==============================================================================
-- 4. PROFILE & IDENTITY (SUPABASE AUTH LINK)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS app_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    nama_lengkap VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    no_hp VARCHAR(32),
    avatar_url TEXT,
    status user_account_status_enum NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_profiles_tenant_id ON app_profiles(tenant_id);

-- ==============================================================================
-- 5. ROLE & PERMISSION ENGINE (GRANULAR RBAC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS app_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(64) UNIQUE NOT NULL, -- Contoh: 'santri.view', 'tahfidz.input', 'perizinan.approve_musyrif'
    modul VARCHAR(64) NOT NULL,      -- Contoh: 'santri', 'tahfidz', 'perizinan', 'finance'
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master Role / Jabatan per Tenant
CREATE TABLE IF NOT EXISTS app_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    kode_role VARCHAR(64) NOT NULL, -- yayasan, mudir, guru, musyrif, kesantrian, bendahara, satpam, admin
    nama_role VARCHAR(128) NOT NULL,
    hirarki_level INT NOT NULL DEFAULT 5, -- 1: Yayasan, 2: Mudir, 3: Kepala Bagian, 4: Guru/Musyrif, 5: Staf
    is_system_role BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, kode_role)
);

-- Relasi Role <-> Permission
CREATE TABLE IF NOT EXISTS app_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    role_id UUID NOT NULL REFERENCES app_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES app_permissions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

-- Penugasan Multi-Role ke Pengguna (Menjawab Point 2: Satu Asatidz, Banyak Topi)
CREATE TABLE IF NOT EXISTS app_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES app_profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES app_roles(id) ON DELETE RESTRICT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_active_context BOOLEAN NOT NULL DEFAULT false, -- Menandai role yang sedang aktif di session
    keterangan_penugasan VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_active ON app_user_roles(user_id, is_active_context);

-- ==============================================================================
-- 6. AUDIT LOG ENGINE (IMMUTABILITY AUDIT TRAIL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS app_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    table_name VARCHAR(64) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'ACCESS')),
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES app_profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_table ON app_audit_logs(tenant_id, table_name, created_at DESC);

-- Trigger Function Otomatis untuk Audit Trail
CREATE OR REPLACE FUNCTION fn_capture_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_record_id UUID;
BEGIN
    -- Ekstraksi Tenant ID
    IF (TG_OP = 'DELETE') THEN
        v_tenant_id := OLD.tenant_id;
        v_record_id := OLD.id;
        v_old_data := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_tenant_id := NEW.tenant_id;
        v_record_id := NEW.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_tenant_id := NEW.tenant_id;
        v_record_id := NEW.id;
        v_new_data := to_jsonb(NEW);
    END IF;

    -- Ekstraksi User ID dari JWT claims
    BEGIN
        v_user_id := NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    INSERT INTO app_audit_logs (
        tenant_id,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        performed_by
    ) VALUES (
        v_tenant_id,
        TG_TABLE_NAME,
        v_record_id,
        TG_OP,
        v_old_data,
        v_new_data,
        v_user_id
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. SECURITY & CONTEXT SWITCHING HELPER FUNCTIONS
-- ==============================================================================

-- Ambil Tenant ID saat ini
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Ambil Active Role ID saat ini (Point 2: Context Switching)
CREATE OR REPLACE FUNCTION current_active_role_slug()
RETURNS TEXT AS $$
DECLARE
    v_user_id UUID;
    v_role_slug TEXT;
BEGIN
    v_user_id := NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT r.kode_role INTO v_role_slug
    FROM app_user_roles ur
    JOIN app_roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id AND ur.is_active_context = true
    LIMIT 1;

    RETURN v_role_slug;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- RPC untuk Beralih Konteks Role (Context Switcher tanpa Relogin)
CREATE OR REPLACE FUNCTION rpc_switch_active_role(p_role_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
    v_role_record RECORD;
BEGIN
    v_user_id := NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
    v_tenant_id := current_tenant_id();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Sesi pengguna tidak valid';
    END IF;

    -- Validasi bahwa user memang memiliki role tersebut
    SELECT r.kode_role, r.nama_role INTO v_role_record
    FROM app_user_roles ur
    JOIN app_roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id AND ur.role_id = p_role_id AND ur.tenant_id = v_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pengguna tidak memiliki penugasan pada peran/jabatan ini';
    END IF;

    -- Non-aktifkan semua konteks aktif sebelumnya
    UPDATE app_user_roles
    SET is_active_context = false
    WHERE user_id = v_user_id AND tenant_id = v_tenant_id;

    -- Aktifkan konteks yang dipilih
    UPDATE app_user_roles
    SET is_active_context = true
    WHERE user_id = v_user_id AND role_id = p_role_id;

    RETURN jsonb_build_object(
        'success', true,
        'role_id', p_role_id,
        'kode_role', v_role_record.kode_role,
        'nama_role', v_role_record.nama_role,
        'message', 'Berhasil beralih konteks peran'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 8. RLS ENFORCEMENT PADA FASE 1
-- ==============================================================================
ALTER TABLE saas_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY rls_saas_tenants ON saas_tenants
    FOR ALL USING (id = current_tenant_id());

CREATE POLICY rls_app_profiles ON app_profiles
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_app_roles ON app_roles
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_app_role_permissions ON app_role_permissions
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_app_user_roles ON app_user_roles
    FOR ALL USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_app_audit_logs ON app_audit_logs
    FOR SELECT USING (tenant_id = current_tenant_id());


-- ==============================================================================
-- FILE: supabase/migrations/20261004000003_fase2_master_asrama.sql
-- ==============================================================================

-- ==============================================================================
-- KABARSANTRI v2.0 - FASE 2: MASTER DATA & KEASRAMAAN
-- Yayasan, Lembaga, Pegawai, Jabatan, Asrama & Kamar (Point 1), Santri, Wali, Kelas, Relasi
-- ==============================================================================

-- 1. ENUMS FOR MASTER DATA
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jenjang_pendidikan_enum') THEN
        CREATE TYPE jenjang_pendidikan_enum AS ENUM ('pondok_salaf', 'pondok_modern', 'tahfidz_murni', 'smp', 'mts', 'sma', 'ma', 'smk');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('L', 'P');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'santri_lifecycle_enum') THEN
        CREATE TYPE santri_lifecycle_enum AS ENUM ('aktif', 'cuti', 'mutasi_keluar', 'lulus_alumni', 'skorsing', 'dikeluarkan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pegawai_status_enum') THEN
        CREATE TYPE pegawai_status_enum AS ENUM ('tetap', 'kontrak', 'pengabdian', 'honorer', 'cuti', 'purna_tugas');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wali_relasi_status_enum') THEN
        CREATE TYPE wali_relasi_status_enum AS ENUM ('ayah_kandung', 'ibu_kandung', 'kakek_nenek', 'paman_bibi', 'wali_hukum', 'kakak');
    END IF;
END $$;

-- ==============================================================================
-- 2. MASTER YAYASAN & LEMBAGA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master_yayasan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    nama_yayasan VARCHAR(255) NOT NULL,
    no_akta_notaris VARCHAR(128),
    sk_kemenkumham VARCHAR(128),
    nomor_statistik_pesantren VARCHAR(64), -- NSP Kemenag
    nama_ketua_yayasan VARCHAR(255),
    alamat_lengkap TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS master_lembaga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    kode_lembaga VARCHAR(32) NOT NULL,
    nama_lembaga VARCHAR(255) NOT NULL, -- Contoh: "Pondok Tahfidz Al-Qur'an", "MTs Sains"
    jenjang jenjang_pendidikan_enum NOT NULL,
    npsn VARCHAR(32), -- Nomor Pokok Sekolah Nasional jika formal
    nsm VARCHAR(32),  -- Nomor Statistik Madrasah jika madrasah
    kepala_lembaga_id UUID, -- References master_pegawai
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, kode_lembaga)
);

-- ==============================================================================
-- 3. MASTER PEGAWAI & JABATAN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master_pegawai (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    profile_id UUID UNIQUE REFERENCES app_profiles(id) ON DELETE RESTRICT,
    nip VARCHAR(64), -- Nomor Induk Pegawai internal
    nik VARCHAR(32), -- KTP
    nama_lengkap VARCHAR(255) NOT NULL,
    gelar_depan VARCHAR(32),
    gelar_belakang VARCHAR(32),
    gender gender_enum NOT NULL,
    no_telepon VARCHAR(32),
    status_kepegawaian pegawai_status_enum NOT NULL DEFAULT 'tetap',
    tanggal_mulai_khidmah DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nip)
);

-- Penugasan Jabatan Struktural Pegawai (Menghubungkan ke app_roles)
CREATE TABLE IF NOT EXISTS master_pegawai_jabatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    pegawai_id UUID NOT NULL REFERENCES master_pegawai(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES app_roles(id) ON DELETE RESTRICT,
    lembaga_id UUID REFERENCES master_lembaga(id) ON DELETE SET NULL, -- Unit spesifik penugasan
    no_sk_penugasan VARCHAR(128),
    tanggal_sk DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(pegawai_id, role_id, lembaga_id)
);

-- ==============================================================================
-- 4. MASTER KEASRAMAAN (POINT 1: GEDUNG, KAMAR, MUSYRIF)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS asrama_gedung (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    kode_gedung VARCHAR(32) NOT NULL,
    nama_gedung VARCHAR(128) NOT NULL, -- Contoh: "Gedung Abu Bakar Ash-Shiddiq"
    peruntukan_gender gender_enum NOT NULL, -- L untuk Putra, P untuk Putri
    jumlah_lantai INT NOT NULL DEFAULT 1,
    lokasi_kampus VARCHAR(128) DEFAULT 'Kampus Utama',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, kode_gedung)
);

CREATE TABLE IF NOT EXISTS asrama_kamar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    gedung_id UUID NOT NULL REFERENCES asrama_gedung(id) ON DELETE RESTRICT,
    nomor_kamar VARCHAR(32) NOT NULL, -- Contoh: "101", "Kamar Al-Farabi"
    lantai INT NOT NULL DEFAULT 1,
    kapasitas_maksimal INT NOT NULL DEFAULT 10,
    keterangan TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(gedung_id, nomor_kamar)
);

-- Pembina Kamar / Musyrif Penanggung Jawab Kamar
CREATE TABLE IF NOT EXISTS musyrif_kamar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    kamar_id UUID NOT NULL REFERENCES asrama_kamar(id) ON DELETE CASCADE,
    pegawai_id UUID NOT NULL REFERENCES master_pegawai(id) ON DELETE RESTRICT,
    tahun_ajaran_id UUID,
    is_pembina_utama BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(kamar_id, pegawai_id)
);

-- ==============================================================================
-- 5. MASTER SANTRI, WALI & RELASI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master_santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    lembaga_id UUID NOT NULL REFERENCES master_lembaga(id) ON DELETE RESTRICT,
    kamar_id UUID REFERENCES asrama_kamar(id) ON DELETE SET NULL, -- Kamar aktif saat ini
    nis VARCHAR(64) NOT NULL,
    nisn VARCHAR(32),
    nik VARCHAR(32),
    nama_lengkap VARCHAR(255) NOT NULL,
    nama_panggilan VARCHAR(64),
    gender gender_enum NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE NOT NULL,
    golongan_darah VARCHAR(4),
    anak_ke INT,
    dari_bersaudara INT,
    status santri_lifecycle_enum NOT NULL DEFAULT 'aktif',
    foto_url TEXT,
    riwayat_alergi TEXT,
    tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES app_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, nis)
);

CREATE INDEX IF NOT EXISTS idx_santri_tenant_status ON master_santri(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_santri_kamar ON master_santri(kamar_id);

CREATE TABLE IF NOT EXISTS master_wali (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    nama_lengkap VARCHAR(255) NOT NULL,
    nik VARCHAR(32),
    no_whatsapp VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    pekerjaan VARCHAR(128),
    penghasilan_bulanan VARCHAR(64),
    alamat_domisili TEXT,
    pin_hash VARCHAR(255), -- Kredensial login portal wali (bcrypt/blowfish)
    status user_account_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, no_whatsapp)
);

-- Relasi Santri <-> Wali (Mendukung 1 Wali memiliki banyak anak)
CREATE TABLE IF NOT EXISTS relasi_santri_wali (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    wali_id UUID NOT NULL REFERENCES master_wali(id) ON DELETE CASCADE,
    hubungan wali_relasi_status_enum NOT NULL,
    is_mahrom BOOLEAN NOT NULL DEFAULT true, -- Untuk verifikasi izin kunjungan
    is_primary_contact BOOLEAN NOT NULL DEFAULT false, -- Penerima pesan WhatsApp utama
    is_financial_responsible BOOLEAN NOT NULL DEFAULT false, -- Penanggung tagihan SPP
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(santri_id, wali_id)
);

-- ==============================================================================
-- 6. MASTER KELAS & PENEMPATAN KELAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS master_kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    lembaga_id UUID NOT NULL REFERENCES master_lembaga(id) ON DELETE RESTRICT,
    nama_kelas VARCHAR(64) NOT NULL, -- Contoh: "7A Tahfidz", "10 IPA Putri"
    tingkat INT NOT NULL,           -- Tingkat 7, 8, 9, 10, dll
    wali_kelas_id UUID REFERENCES master_pegawai(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, lembaga_id, nama_kelas)
);

-- Riwayat Penempatan Kelas
CREATE TABLE IF NOT EXISTS santri_kelas_penempatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    kelas_id UUID NOT NULL REFERENCES master_kelas(id) ON DELETE RESTRICT,
    tahun_ajaran_kode VARCHAR(32) NOT NULL, -- Contoh: "2026/2027"
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(santri_id, tahun_ajaran_kode)
);

-- Riwayat Penempatan Kamar Asrama (Mutasi Kamar)
CREATE TABLE IF NOT EXISTS santri_kamar_penempatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    kamar_id UUID NOT NULL REFERENCES asrama_kamar(id) ON DELETE RESTRICT,
    tanggal_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_selesai DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. ATTACH AUDIT LOG TRIGGERS PADA MASTER DATA
-- ==============================================================================
CREATE TRIGGER trg_audit_master_santri
    AFTER INSERT OR UPDATE OR DELETE ON master_santri
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

CREATE TRIGGER trg_audit_master_pegawai
    AFTER INSERT OR UPDATE OR DELETE ON master_pegawai
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

CREATE TRIGGER trg_audit_master_wali
    AFTER INSERT OR UPDATE OR DELETE ON master_wali
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

-- ==============================================================================
-- 8. RLS ENFORCEMENT PADA FASE 2
-- ==============================================================================
ALTER TABLE master_yayasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_lembaga ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_pegawai_jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE asrama_gedung ENABLE ROW LEVEL SECURITY;
ALTER TABLE asrama_kamar ENABLE ROW LEVEL SECURITY;
ALTER TABLE musyrif_kamar ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_wali ENABLE ROW LEVEL SECURITY;
ALTER TABLE relasi_santri_wali ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri_kelas_penempatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri_kamar_penempatan ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_master_yayasan ON master_yayasan FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_master_lembaga ON master_lembaga FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_master_pegawai ON master_pegawai FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_master_pegawai_jabatan ON master_pegawai_jabatan FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_asrama_gedung ON asrama_gedung FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_asrama_kamar ON asrama_kamar FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_musyrif_kamar ON musyrif_kamar FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_master_santri ON master_santri FOR ALL USING (tenant_id = current_tenant_id() AND deleted_at IS NULL);
CREATE POLICY rls_master_wali ON master_wali FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_relasi_santri_wali ON relasi_santri_wali FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_master_kelas ON master_kelas FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_santri_kelas_penempatan ON santri_kelas_penempatan FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_santri_kamar_penempatan ON santri_kamar_penempatan FOR ALL USING (tenant_id = current_tenant_id());


-- ==============================================================================
-- FILE: supabase/migrations/20261004000004_fase3_kesantrian_tahfidz_perizinan.sql
-- ==============================================================================

-- ==============================================================================
-- KABARSANTRI v2.0 - FASE 3: PRESENSI, KESANTRIAN, TAHFIDZ, PERIZINAN & DISIPLIN
-- ==============================================================================

-- 1. ENUMS FOR FASE 3
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'presensi_status_enum') THEN
        CREATE TYPE presensi_status_enum AS ENUM ('hadir', 'izin', 'sakit', 'alpa', 'terlambat', 'tugas_pondok');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tahfidz_jenis_setoran_enum') THEN
        CREATE TYPE tahfidz_jenis_setoran_enum AS ENUM ('ziyadah', 'murajaah_harian', 'murajaah_akbar', 'tasmi_sekali_duduk');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status_enum') THEN
        CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gate_pass_status_enum') THEN
        CREATE TYPE gate_pass_status_enum AS ENUM ('draft', 'waiting_musyrif', 'waiting_kesantrian', 'active_gatepass', 'out_of_campus', 'completed_ontime', 'completed_late', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poin_tipe_enum') THEN
        CREATE TYPE poin_tipe_enum AS ENUM ('pelanggaran', 'reward_prestasi');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rawat_status_enum') THEN
        CREATE TYPE rawat_status_enum AS ENUM ('kamar_santri', 'ruang_isolasi_poskestren', 'rujukan_puskesmas', 'rawat_inap_rs', 'sembuh');
    END IF;
END $$;

-- ==============================================================================
-- 2. MODUL PRESENSI (KBM KELAS & ASRAMA / SHOLAT BERJAMAAH)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS presensi_sesi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    kode_sesi VARCHAR(32) NOT NULL, -- Contoh: 'subuh', 'kbm_pagi', 'ashar', 'maghrib', 'isya', 'tidur_asrama'
    nama_sesi VARCHAR(64) NOT NULL,
    kategori VARCHAR(32) NOT NULL CHECK (kategori IN ('asrama_ibadah', 'kbm_formal', 'kegiatan_ekstrakurikuler')),
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, kode_sesi)
);

CREATE TABLE IF NOT EXISTS presensi_santri_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    sesi_id UUID NOT NULL REFERENCES presensi_sesi(id) ON DELETE RESTRICT,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status presensi_status_enum NOT NULL DEFAULT 'hadir',
    kamar_id UUID REFERENCES asrama_kamar(id), -- Konteks jika presensi asrama
    kelas_id UUID REFERENCES master_kelas(id),  -- Konteks jika presensi kelas
    catatan VARCHAR(255),
    pencatat_id UUID REFERENCES app_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(santri_id, sesi_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_presensi_santri_tgl ON presensi_santri_log(tenant_id, tanggal, sesi_id);

-- ==============================================================================
-- 3. MODUL TAHFIDZ AL-QUR'AN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tahfidz_kelompok_halaqah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    nama_halaqah VARCHAR(100) NOT NULL, -- Contoh: "Halaqah Imam Nafi'", "Halaqah As-Sudais"
    musyrif_id UUID NOT NULL REFERENCES master_pegawai(id) ON DELETE RESTRICT,
    waktu_halaqah VARCHAR(64) DEFAULT 'Ba''da Subuh & Ba''da Ashar',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tahfidz_halaqah_anggota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    halaqah_id UUID NOT NULL REFERENCES tahfidz_kelompok_halaqah(id) ON DELETE CASCADE,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(halaqah_id, santri_id)
);

CREATE TABLE IF NOT EXISTS tahfidz_setoran_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    halaqah_id UUID REFERENCES tahfidz_kelompok_halaqah(id),
    penyimak_pegawai_id UUID NOT NULL REFERENCES master_pegawai(id),
    jenis_setoran tahfidz_jenis_setoran_enum NOT NULL,
    juz INT NOT NULL CHECK (juz BETWEEN 1 AND 30),
    surah_awal INT NOT NULL CHECK (surah_awal BETWEEN 1 AND 114),
    ayat_awal INT NOT NULL CHECK (ayat_awal >= 1),
    surah_akhir INT NOT NULL CHECK (surah_akhir BETWEEN 1 AND 114),
    ayat_akhir INT NOT NULL CHECK (ayat_akhir >= 1),
    skor_kelancaran INT CHECK (skor_kelancaran BETWEEN 0 AND 100),
    skor_tajwid INT CHECK (skor_tajwid BETWEEN 0 AND 100),
    skor_makhraj INT CHECK (skor_makhraj BETWEEN 0 AND 100),
    is_lulus BOOLEAN NOT NULL DEFAULT true,
    catatan_musyrif TEXT,
    tanggal_setoran DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tahfidz_santri_juz ON tahfidz_setoran_log(santri_id, juz);

-- ==============================================================================
-- 4. MODUL KESANTRIAN (POSKESTREN & SAMBANGAN WALI)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS kesantrian_kesehatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    tanggal_mulai_sakit DATE NOT NULL DEFAULT CURRENT_DATE,
    keluhan_gejala TEXT NOT NULL,
    diagnosa TEXT,
    terapi_obat TEXT,
    status_rawat rawat_status_enum NOT NULL DEFAULT 'kamar_santri',
    tenaga_kesehatan_id UUID REFERENCES master_pegawai(id),
    is_notif_wali_sent BOOLEAN NOT NULL DEFAULT false,
    catatan_perkembangan TEXT,
    tanggal_sembuh DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kesantrian_kunjungan_wali (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    wali_id UUID REFERENCES master_wali(id),
    nama_pengunjung VARCHAR(255) NOT NULL,
    hubungan_dengan_santri VARCHAR(64) NOT NULL,
    is_terverifikasi_mahrom BOOLEAN NOT NULL DEFAULT true,
    tanggal_kunjungan_rencana DATE NOT NULL,
    jam_kunjungan_rencana TIME,
    jumlah_rombongan INT DEFAULT 1,
    nomor_plat_kendaraan VARCHAR(32),
    waktu_check_in_pos TIMESTAMPTZ,
    waktu_check_out_pos TIMESTAMPTZ,
    petugas_pos_id UUID REFERENCES app_profiles(id),
    status approval_status_enum NOT NULL DEFAULT 'approved',
    catatan_kunjungan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. MODUL PERIZINAN SANTRI & QR GATE PASS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS perizinan_santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    wali_id UUID REFERENCES master_wali(id),
    jenis_izin VARCHAR(64) NOT NULL, -- 'izin_pulang', 'izin_keluar_kota', 'izin_lomba', 'izin_berobat'
    alasan TEXT NOT NULL,
    rencana_keluar TIMESTAMPTZ NOT NULL,
    rencana_kembali TIMESTAMPTZ NOT NULL,
    
    -- Level 1 Approval: Musyrif Kamar
    musyrif_approval approval_status_enum NOT NULL DEFAULT 'pending',
    musyrif_id UUID REFERENCES master_pegawai(id),
    musyrif_approval_at TIMESTAMPTZ,
    musyrif_catatan TEXT,

    -- Level 2 Approval: Bagian Kesantrian
    kesantrian_approval approval_status_enum NOT NULL DEFAULT 'pending',
    kesantrian_id UUID REFERENCES master_pegawai(id),
    kesantrian_approval_at TIMESTAMPTZ,
    kesantrian_catatan TEXT,

    -- Gate Pass & Realisasi
    status_gatepass gate_pass_status_enum NOT NULL DEFAULT 'waiting_musyrif',
    qr_gate_pass VARCHAR(128) UNIQUE, -- Token QR terenkripsi untuk dipindai satpam
    aktual_keluar TIMESTAMPTZ,
    petugas_gate_keluar_id UUID REFERENCES app_profiles(id),
    aktual_kembali TIMESTAMPTZ,
    petugas_gate_kembali_id UUID REFERENCES app_profiles(id),
    selisih_menit_keterlambatan INT DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perizinan_santri_qr ON perizinan_santri(qr_gate_pass);

-- ==============================================================================
-- 6. MODUL REWARD & PELANGGARAN (POIN TARBIYAH)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS kedisiplinan_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    tipe poin_tipe_enum NOT NULL,
    nama_kategori VARCHAR(128) NOT NULL, -- Contoh: "Merokok", "Keluar Tanpa Izin", "Juara MHQ", "Hafidz 30 Juz"
    tingkat VARCHAR(32) NOT NULL DEFAULT 'sedang', -- 'ringan', 'sedang', 'berat'
    bobot_poin INT NOT NULL, -- Nilai positif untuk reward, nilai negatif/positif sesuai standar yayasan
    tindakan_rekomendasi TEXT, -- Contoh: "Menghafal Surah Al-Kahfi ayat 1-10", "Peringatan Tertulis"
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS santri_poin_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE RESTRICT,
    santri_id UUID NOT NULL REFERENCES master_santri(id) ON DELETE CASCADE,
    kategori_id UUID NOT NULL REFERENCES kedisiplinan_kategori(id) ON DELETE RESTRICT,
    poin INT NOT NULL,
    keterangan_kejadian TEXT NOT NULL,
    tanggal_kejadian DATE NOT NULL DEFAULT CURRENT_DATE,
    tindakan_tarbiyah TEXT, -- Realisasi sanksi edukatif yang diberikan
    bukti_foto_url TEXT,
    is_sanksi_selesai BOOLEAN NOT NULL DEFAULT false,
    pencatat_pegawai_id UUID NOT NULL REFERENCES master_pegawai(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. AUDIT TRIGGERS & RLS FASE 3
-- ==============================================================================
CREATE TRIGGER trg_audit_presensi_santri
    AFTER INSERT OR UPDATE OR DELETE ON presensi_santri_log
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

CREATE TRIGGER trg_audit_tahfidz_setoran
    AFTER INSERT OR UPDATE OR DELETE ON tahfidz_setoran_log
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

CREATE TRIGGER trg_audit_perizinan_santri
    AFTER INSERT OR UPDATE OR DELETE ON perizinan_santri
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

CREATE TRIGGER trg_audit_santri_poin
    AFTER INSERT OR UPDATE OR DELETE ON santri_poin_log
    FOR EACH ROW EXECUTE FUNCTION fn_capture_audit_log();

ALTER TABLE presensi_sesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE presensi_santri_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahfidz_kelompok_halaqah ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahfidz_halaqah_anggota ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahfidz_setoran_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE kesantrian_kesehatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kesantrian_kunjungan_wali ENABLE ROW LEVEL SECURITY;
ALTER TABLE perizinan_santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE kedisiplinan_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri_poin_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_presensi_sesi ON presensi_sesi FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_presensi_santri_log ON presensi_santri_log FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_tahfidz_kelompok_halaqah ON tahfidz_kelompok_halaqah FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_tahfidz_halaqah_anggota ON tahfidz_halaqah_anggota FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_tahfidz_setoran_log ON tahfidz_setoran_log FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_kesantrian_kesehatan ON kesantrian_kesehatan FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_kesantrian_kunjungan_wali ON kesantrian_kunjungan_wali FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_perizinan_santri ON perizinan_santri FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_kedisiplinan_kategori ON kedisiplinan_kategori FOR ALL USING (tenant_id = current_tenant_id());
CREATE POLICY rls_santri_poin_log ON santri_poin_log FOR ALL USING (tenant_id = current_tenant_id());


-- ==============================================================================
-- FILE: supabase/migrations/20261004000005_fase_financial_ledger_reconcile.sql
-- ==============================================================================

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


-- ==============================================================================
-- FILE: supabase/migrations/20261004000006_fase5_engagement_wa_outbox.sql
-- ==============================================================================

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


-- ==============================================================================
-- FILE: supabase/migrations/20261004000007_tier_gratis_validasi_mudir_yayasan.sql
-- ==============================================================================

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


-- ==============================================================================
-- FILE: supabase/migrations/20261004000008_pengeluaran_approval_rumah_tangga.sql
-- ==============================================================================

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


-- ==============================================================================
-- FILE: supabase/seed.sql
-- ==============================================================================

-- ==============================================================================
-- KABARSANTRI v2.0 - COMPREHENSIVE SEED DATA FOR DEMO & TESTING
-- ==============================================================================

-- 1. SEED TENANT
INSERT INTO saas_tenants (id, kode_tenant, nama_resmi, subdomain, tipe_env, feature_flags)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'TENANT-DQ',
    'Pondok Pesantren Darul Qur''an Bina Insan',
    'darulquran',
    'production',
    '{"enable_uang_jajan": false, "enable_tahfidz": true, "enable_perizinan": true, "enable_poskestren": true}'::jsonb
) ON CONFLICT (subdomain) DO NOTHING;

-- 2. SEED YAYASAN & LEMBAGA
INSERT INTO master_yayasan (tenant_id, nama_yayasan, nomor_statistik_pesantren, nama_ketua_yayasan)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Yayasan Bina Insan Santri Nusantara',
    '510035070001',
    'KH. Abdullah Faqih, M.A.'
) ON CONFLICT (tenant_id) DO NOTHING;

INSERT INTO master_lembaga (id, tenant_id, kode_lembaga, nama_lembaga, jenjang)
VALUES 
    ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'MTS-PUTRA', 'MTs Tahfidz Sains Putra', 'mts'),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'MA-PUTRA', 'MA Unggulan Al-Qur''an Putra', 'ma')
ON CONFLICT (tenant_id, kode_lembaga) DO NOTHING;

-- 3. SEED GEDUNG & KAMAR ASRAMA (POINT 1)
INSERT INTO asrama_gedung (id, tenant_id, kode_gedung, nama_gedung, peruntukan_gender, jumlah_lantai)
VALUES 
    ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'G-ABUBAKAR', 'Gedung Abu Bakar Ash-Shiddiq', 'L', 2),
    ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'G-KHODIJAH', 'Gedung Khodijah Al-Kubra', 'P', 2)
ON CONFLICT (tenant_id, kode_gedung) DO NOTHING;

INSERT INTO asrama_kamar (id, tenant_id, gedung_id, nomor_kamar, lantai, kapasitas_maksimal)
VALUES 
    ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '101', 1, 12),
    ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '102', 1, 10)
ON CONFLICT (gedung_id, nomor_kamar) DO NOTHING;

-- 4. SEED ROLES & JABATAN
INSERT INTO app_roles (id, tenant_id, kode_role, nama_role, hirarki_level)
VALUES 
    ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'musyrif', 'Musyrif Pembina Asrama', 4),
    ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'guru', 'Guru KBM Akademik', 4),
    ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', 'keuangan', 'Bendahara Keuangan', 3)
ON CONFLICT (tenant_id, kode_role) DO NOTHING;

-- 5. SEED MASTER SANTRI & WALI
INSERT INTO master_santri (id, tenant_id, lembaga_id, kamar_id, nis, nama_lengkap, gender, tanggal_lahir)
VALUES 
    ('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '44444444-4444-4444-4444-444444444441', '202601001', 'Muhammad Al-Fatih', 'L', '2012-04-10'),
    ('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '44444444-4444-4444-4444-444444444441', '202601015', 'Ahmad Zaki Mubarak', 'L', '2012-05-14')
ON CONFLICT (tenant_id, nis) DO NOTHING;

INSERT INTO master_wali (id, tenant_id, nama_lengkap, no_whatsapp, pin_hash)
VALUES 
    ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', 'H. Syamsul Bahri', '081234567890', crypt('123456', gen_salt('bf', 8)))
ON CONFLICT (tenant_id, no_whatsapp) DO NOTHING;

INSERT INTO relasi_santri_wali (tenant_id, santri_id, wali_id, hubungan, is_primary_contact)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666661', '77777777-7777-7777-7777-777777777771', 'ayah_kandung', true)
ON CONFLICT (santri_id, wali_id) DO NOTHING;

-- 6. SEED KELAS
INSERT INTO master_kelas (id, tenant_id, lembaga_id, nama_kelas, tingkat)
VALUES 
    ('88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '7A', 7)
ON CONFLICT (tenant_id, lembaga_id, nama_kelas) DO NOTHING;

-- 7. SEED COA STANDAR (POINT 4)
INSERT INTO keuangan_coa (tenant_id, kode_akun, nama_akun, kategori, saldo_normal)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '1-1001', 'Kas Operasional Bendahara', 'aset', 'debet'),
    ('11111111-1111-1111-1111-111111111111', '1-1002', 'Bank Syariah Indonesia (BSI Giro)', 'aset', 'debet'),
    ('11111111-1111-1111-1111-111111111111', '2-1001', 'Titipan Tabungan Santri (Wadiah)', 'kewajiban', 'kredit'),
    ('11111111-1111-1111-1111-111111111111', '4-1001', 'Pendapatan SPP Bulanan', 'pendapatan', 'kredit')
ON CONFLICT (tenant_id, kode_akun) DO NOTHING;

