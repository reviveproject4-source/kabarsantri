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
