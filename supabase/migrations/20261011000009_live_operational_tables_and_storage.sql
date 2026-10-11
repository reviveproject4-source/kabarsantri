-- ==============================================================================
-- KABARSANTRI v2.0 - TABEL OPERASIONAL REAL-TIME & STORAGE BUCKET
-- Memastikan seluruh fitur interaktif (Tahfidz, Presensi Mandiri, Transaksi
-- Validasi SPP, Antrean WA Kuitansi, e-Pocket Santri, Mudir, dan Cloud Sync)
-- 100% Siap Operasi di Supabase.
-- ==============================================================================

-- 1. Tabel Cloud Snapshot Sync (SyncEngine Dual-Mode)
CREATE TABLE IF NOT EXISTS app_sync_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(128) UNIQUE NOT NULL,
    state_payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Antrean Pesan WhatsApp (WhatsApp Gateway & Kuitansi Otomatis)
CREATE TABLE IF NOT EXISTS wa_outbox_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_destination VARCHAR(64) NOT NULL,
    recipient_name VARCHAR(255),
    template_name VARCHAR(100),
    message_body TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    vendor_message_id VARCHAR(128),
    last_error TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Transaksi Validasi Pembayaran SPP / Infaq (Portal Wali & Bagian Keuangan)
CREATE TABLE IF NOT EXISTS transaksi_validasi_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_invoice VARCHAR(64),
    jenis VARCHAR(100) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    bank_tujuan VARCHAR(64),
    bukti_img_url TEXT,
    file_size_compressed VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'MENUNGGU_VALIDASI',
    nomor_kuitansi VARCHAR(64),
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Setoran Hafalan Al-Qur'an & Hadis (Musyrif & Modul Akademik Tahfidz)
CREATE TABLE IF NOT EXISTS tahfidz_setoran_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id VARCHAR(64),
    jenis_setoran VARCHAR(64) NOT NULL,
    juz INT,
    halaman_mulai INT,
    halaman_selesai INT,
    skor_tajwid INT DEFAULT 0,
    skor_kelancaran INT DEFAULT 0,
    skor_makhraj INT DEFAULT 0,
    catatan_musyrif TEXT,
    status_kelulusan VARCHAR(32) DEFAULT 'lulus',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Dokumentasi Tugas Luar & Notulensi Mudir (Pimpinan Lembaga & Yayasan)
CREATE TABLE IF NOT EXISTS dokumentasi_mudir_yayasan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    jenis VARCHAR(64),
    tanggal DATE NOT NULL,
    mitra VARCHAR(255),
    notulensi TEXT,
    tindak_lanjut TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Presensi Sesi Harian Mandiri (Guru KBM, Staf, & Mudir)
CREATE TABLE IF NOT EXISTS presensi_sesi_harian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe_presensi VARCHAR(64) NOT NULL,
    status_kehadiran VARCHAR(64) NOT NULL,
    keterangan TEXT,
    waktu_scan TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Dompet Santri & e-Pocket Uang Jajan Koperasi
CREATE TABLE IF NOT EXISTS dompet_santri_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    santri_id VARCHAR(64) NOT NULL,
    jenis_transaksi VARCHAR(64) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES UNTUK OPERASIONAL CLIENT
-- Memastikan aplikasi web dapat melakukan SELECT, INSERT, dan UPDATE tanpa ditolak.
-- ==============================================================================

ALTER TABLE app_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_outbox_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_validasi_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahfidz_setoran_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumentasi_mudir_yayasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE presensi_sesi_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE dompet_santri_v2 ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- app_sync_state
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_sync_state' AND policyname = 'allow_all_app_sync_state') THEN
        CREATE POLICY allow_all_app_sync_state ON app_sync_state FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- wa_outbox_queue
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wa_outbox_queue' AND policyname = 'allow_all_wa_outbox_queue') THEN
        CREATE POLICY allow_all_wa_outbox_queue ON wa_outbox_queue FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- transaksi_validasi_v2
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaksi_validasi_v2' AND policyname = 'allow_all_transaksi_validasi_v2') THEN
        CREATE POLICY allow_all_transaksi_validasi_v2 ON transaksi_validasi_v2 FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- tahfidz_setoran_v2
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tahfidz_setoran_v2' AND policyname = 'allow_all_tahfidz_setoran_v2') THEN
        CREATE POLICY allow_all_tahfidz_setoran_v2 ON tahfidz_setoran_v2 FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- dokumentasi_mudir_yayasan
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dokumentasi_mudir_yayasan' AND policyname = 'allow_all_dokumentasi_mudir_yayasan') THEN
        CREATE POLICY allow_all_dokumentasi_mudir_yayasan ON dokumentasi_mudir_yayasan FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- presensi_sesi_harian
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'presensi_sesi_harian' AND policyname = 'allow_all_presensi_sesi_harian') THEN
        CREATE POLICY allow_all_presensi_sesi_harian ON presensi_sesi_harian FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- dompet_santri_v2
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dompet_santri_v2' AND policyname = 'allow_all_dompet_santri_v2') THEN
        CREATE POLICY allow_all_dompet_santri_v2 ON dompet_santri_v2 FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ==============================================================================
-- STORAGE BUCKET UNTUK BUKTI TRANSFER SPP/INFAQ (KOMPRESI <150KB)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'bukti-transfer',
    'bukti-transfer',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'allow_public_read_bukti_transfer') THEN
        CREATE POLICY allow_public_read_bukti_transfer ON storage.objects FOR SELECT USING (bucket_id = 'bukti-transfer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'allow_anon_upload_bukti_transfer') THEN
        CREATE POLICY allow_anon_upload_bukti_transfer ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bukti-transfer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'allow_anon_update_bukti_transfer') THEN
        CREATE POLICY allow_anon_update_bukti_transfer ON storage.objects FOR UPDATE USING (bucket_id = 'bukti-transfer');
    END IF;
END $$;
