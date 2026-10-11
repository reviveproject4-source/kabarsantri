-- ==============================================================================
-- KABARSANTRI v2.0 - TABEL REGISTRASI YAYASAN DARI WELCOME SCREEN
-- Jalankan skrip ini langsung di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fugqdiuxnjwfgxpvxqsy/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.yayasan_registrations (
    id VARCHAR(64) PRIMARY KEY,
    nama_yayasan VARCHAR(255) NOT NULL,
    nama_pimpinan VARCHAR(255) NOT NULL,
    no_whatsapp VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    kota VARCHAR(255),
    estimasi_santri VARCHAR(64),
    paket_pilihan VARCHAR(64) NOT NULL DEFAULT 'Gratis', -- Hanya: 'Gratis' atau 'Enterprise'
    catatan TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending' (menunggu ACC) atau 'active' (telah di-ACC)
    features JSONB NOT NULL DEFAULT '["tahfidz", "wali"]'::jsonb,
    activated_tenant_id VARCHAR(128),
    admin_email VARCHAR(255),
    admin_temp_password VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.yayasan_registrations ENABLE ROW LEVEL SECURITY;

-- Berikan izin akses penuh untuk web client (anon & authenticated)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'yayasan_registrations' 
        AND policyname = 'allow_public_all_yayasan_registrations'
    ) THEN
        CREATE POLICY allow_public_all_yayasan_registrations 
        ON public.yayasan_registrations 
        FOR ALL 
        TO anon, authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Contoh Data Awal Referensi (Jika belum ada)
INSERT INTO public.yayasan_registrations (
    id, nama_yayasan, nama_pimpinan, no_whatsapp, email, kota, estimasi_santri, paket_pilihan, status, features
) VALUES 
(
    'reg-001', 
    'Yayasan Pondok Pesantren Bina Insan Qurani', 
    'KH. Dr. Muhammad Syamsul Ma''arif', 
    '081234567890', 
    'sekretariat@binainsan.sch.id', 
    'Bandung, Jawa Barat', 
    '100 - 300 Santri', 
    'Enterprise', 
    'pending', 
    '["tahfidz", "spp", "presensi", "wali", "rumah_tangga", "akuntansi"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
