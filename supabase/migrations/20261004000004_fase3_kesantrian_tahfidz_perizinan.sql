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
