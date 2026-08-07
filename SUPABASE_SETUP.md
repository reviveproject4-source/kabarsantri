# 🚀 Panduan Setup & Deploy Backend Supabase - KabarSantri

Dokumen ini berisi panduan langkah demi langkah untuk memastikan seluruh proses pendukung (Database, RLS Security, Edge Function, Storage, dan Environment) berjalan 100% sempurna.

---

## 1. Skema Database & RLS Security

seluruh tabel, fungsi RLS, dan kebijakan keamanan multi-tenant sudah disiapkan dalam file `supabase/schema.sql`.

### Cara Eksekusi:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih project kamu.
3. Masuk ke menu **SQL Editor** -> **New Query**.
4. Buka file [`supabase/schema.sql`](file:///c:/kabarsantri/supabase/schema.sql), salin seluruh isinya, lalu tempelkan ke SQL Editor.
5. Klik **Run**.

> **Note**: Script `schema.sql` ini aman dijalankan ulang (idempotent) karena menggunakan sintaks `IF NOT EXISTS` & `CREATE OR REPLACE`.

---

## 2. Konfigurasi Environment Variables

1. Buat file `.env.local` di root folder project (atau edit yang sudah ada):
   ```env
   VITE_SUPABASE_URL=https://<project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key-kamu>
   ```
2. Salinan acuan variabel dapat dilihat di file [`.env.example`](file:///c:/kabarsantri/.env.example).

---

## 3. Deploy Edge Function (`buat-akun`)

Edge function ini bertugas membuatkan akun login pegawai & wali santri menggunakan `service_role` secara aman dari serverless backend.

### Cara Deploy:
1. Pastikan Supabase CLI terinstall atau jalankan via `npx`:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-id-kamu>
   ```
2. Set Service Role Key ke secret Supabase Edge Function:
   ```bash
   npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role_key_kamu>
   ```
3. Deploy fungsi `buat-akun`:
   ```bash
   npx supabase functions deploy buat-akun
   ```

---

## 4. Supabase Storage Buckets

Fungsi storage otomatis disiapkan oleh script `schema.sql`:
- **`bukti-bayar`**: Menyimpan foto bukti pembayaran wali santri.
- **`lampiran-pengumuman`**: Menyimpan berkas/lampiran PDF/dokumen pengumuman lembaga.

---

## 5. Pengujian & Verifikasi System

Run dev server lokal untuk memverifikasi fitur secara langsung:
```bash
npm run dev
```

Atau uji kompilasi produksi:
```bash
npm run build
```

---
*KabarSantri System Operation & Supporting Infrastructure Verified.*
