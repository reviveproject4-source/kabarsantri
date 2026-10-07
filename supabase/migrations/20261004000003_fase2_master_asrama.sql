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
