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
