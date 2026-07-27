-- ============================================================================
-- KabarSantri - skema Supabase multi-tenant
-- Jalankan SEKALI di Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Aman dijalankan ulang (pakai "if not exists" / "or replace" di sebagian
-- besar tempat), tapi paling baik dijalankan sekali di project baru/kosong.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TENANT & IDENTITAS
-- ----------------------------------------------------------------------------

create table if not exists yayasan (
  id uuid primary key default gen_random_uuid(),
  nama_yayasan text not null,
  nama_penanggung_jawab text not null,
  jabatan_penanggung_jawab text,
  no_hp text not null,
  email text,
  alamat text,
  perkiraan_jumlah_santri text,
  sumber_informasi text,
  paket text not null default 'Gratis' check (paket in ('Gratis', 'Premium')),
  created_at timestamptz not null default now()
);

-- Baris ini dibuat lebih dulu (kosong dulu, diisi FK setelah tabel santri/pegawai ada).
create table if not exists profil (
  id uuid primary key references auth.users (id) on delete cascade,
  yayasan_id uuid not null references yayasan (id) on delete cascade,
  peran text not null check (peran in ('yayasan', 'pegawai', 'wali')),
  pegawai_id bigint,
  santri_id bigint,
  created_at timestamptz not null default now()
);

-- Fungsi bantu RLS. SECURITY DEFINER supaya lookup ke tabel profil TIDAK
-- kena RLS-nya sendiri (mencegah rekursi kebijakan), search_path dikunci
-- untuk keamanan (praktik standar Supabase untuk fungsi SECURITY DEFINER).
create or replace function current_yayasan_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select yayasan_id from profil where id = auth.uid()
$$;

create or replace function current_peran()
returns text
language sql stable security definer set search_path = public
as $$
  select peran from profil where id = auth.uid()
$$;

create or replace function current_santri_id()
returns bigint
language sql stable security definer set search_path = public
as $$
  select santri_id from profil where id = auth.uid()
$$;

alter table yayasan enable row level security;
alter table profil enable row level security;

-- Yayasan: setelah terdaftar, hanya bisa melihat/mengubah yayasan miliknya
-- sendiri. TIDAK ada kebijakan insert langsung dari client -- pendaftaran
-- yayasan baru HARUS lewat fungsi daftar_yayasan() di bawah (SECURITY
-- DEFINER, satu transaksi, tidak bergantung pada urutan RLS yayasan+profil
-- yang saling mengunci kalau di-insert terpisah dari client).
create policy "yayasan_select_sendiri" on yayasan
  for select using (id = current_yayasan_id());
create policy "yayasan_update_sendiri" on yayasan
  for update using (id = current_yayasan_id());

-- Profil: setiap user boleh membuat baris profilnya SENDIRI (dipakai saat
-- Yayasan mendaftar pertama kali). Pembuatan profil untuk Pegawai/Wali oleh
-- Yayasan dilakukan lewat Edge Function `buat-akun` yang memakai service_role
-- (bypass RLS sepenuhnya), BUKAN lewat kebijakan ini.
create policy "profil_select_terkait" on profil
  for select using (id = auth.uid() or yayasan_id = current_yayasan_id());

-- Pendaftaran Yayasan baru: satu transaksi (baris yayasan + baris profil
-- peran 'yayasan') dijalankan lewat fungsi ini, bukan dua insert terpisah
-- dari client. Menghindari isu RLS mengunci-diri-sendiri dan mencegah
-- kondisi "yayasan ada tapi profil gagal dibuat" (data yatim).
create or replace function daftar_yayasan(
  p_nama_yayasan text,
  p_nama_penanggung_jawab text,
  p_jabatan_penanggung_jawab text,
  p_no_hp text,
  p_email text,
  p_alamat text,
  p_perkiraan_jumlah_santri text,
  p_sumber_informasi text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_yayasan_id uuid;
begin
  if v_uid is null then
    raise exception 'Harus login terlebih dahulu sebelum mendaftarkan yayasan';
  end if;

  if exists (select 1 from profil where id = v_uid) then
    raise exception 'Akun ini sudah terdaftar pada sebuah yayasan';
  end if;

  insert into yayasan (
    nama_yayasan, nama_penanggung_jawab, jabatan_penanggung_jawab,
    no_hp, email, alamat, perkiraan_jumlah_santri, sumber_informasi
  ) values (
    p_nama_yayasan, p_nama_penanggung_jawab, p_jabatan_penanggung_jawab,
    p_no_hp, p_email, p_alamat, p_perkiraan_jumlah_santri, p_sumber_informasi
  ) returning id into v_yayasan_id;

  insert into profil (id, yayasan_id, peran)
  values (v_uid, v_yayasan_id, 'yayasan');

  return v_yayasan_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. SANTRI & PEGAWAI (master data)
-- ----------------------------------------------------------------------------

create table if not exists santri (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  nama text not null,
  nis text not null,
  nisn text,
  jenis_kelamin text,
  tempat_lahir text,
  tanggal_lahir date,
  status text not null default 'Aktif',
  kelas text,
  asrama text,
  nama_ayah text,
  pekerjaan_ayah text,
  no_hp_ayah text,
  nama_ibu text,
  pekerjaan_ibu text,
  no_hp_ibu text,
  alamat_wali text,
  juz_terakhir text,
  surat_terakhir text,
  ayat_terakhir text,
  nilai_tahfidz text,
  created_at timestamptz not null default now()
);

-- Dipanggil dari layar login Wali Santri (SEBELUM login, jadi harus bisa
-- dipanggil oleh role anon). Login Wali pakai Nama + NIS + PIN, bukan email
-- -- fungsi ini mencari santri yang cocok lalu mengembalikan "email sintetis"
-- (wali-<id>@kabarsantri.internal) yang dipakai di baliknya untuk
-- signInWithPassword(). PIN-nya sendiri diverifikasi oleh Supabase Auth, jadi
-- fungsi ini tidak pernah menyentuh/mengungkap password.
-- Mengembalikan null kalau tidak ketemu atau ketemu lebih dari satu (ambigu)
-- supaya tidak salah pilih akun.
create or replace function cari_email_wali(p_nis text, p_nama text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when count(*) = 1 then min('wali-' || id || '@kabarsantri.internal') else null end
  from santri
  where nis = p_nis
    and lower(trim(nama)) = lower(trim(p_nama))
$$;

grant execute on function cari_email_wali(text, text) to anon, authenticated;

create table if not exists pegawai (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  nama text not null,
  nip text,
  jabatan text not null,
  hp text,
  email text,
  status text not null default 'Aktif',
  kelas_diajar text[] not null default '{}',
  akses_semua_kelas boolean not null default false,
  created_at timestamptz not null default now()
);

-- NIP dipakai untuk login (lihat cari_email_pegawai di bawah), jadi harus
-- unik per yayasan -- NULL/'' dikecualikan supaya pegawai yang belum
-- diisi NIP-nya tidak saling bentrok.
create unique index if not exists pegawai_nip_unik on pegawai (yayasan_id, nip)
  where nip is not null and nip <> '';

-- Dipanggil dari layar login Pegawai (SEBELUM login, jadi harus bisa
-- dipanggil oleh role anon) sebagai alternatif dari login pakai email --
-- pegawai bisa masuk pakai NIP + password yang sama dengan akun emailnya.
create or replace function cari_email_pegawai(p_nip text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when count(*) = 1 then min(email) else null end
  from pegawai
  where nip = p_nip and email is not null
$$;

grant execute on function cari_email_pegawai(text) to anon, authenticated;

alter table profil
  add constraint profil_pegawai_id_fkey foreign key (pegawai_id) references pegawai (id),
  add constraint profil_santri_id_fkey foreign key (santri_id) references santri (id);

alter table santri enable row level security;
alter table pegawai enable row level security;

-- Wali hanya boleh melihat/mengubah baris santri miliknya sendiri; staff
-- (yayasan/pegawai) melihat & mengelola semua santri dalam tenant-nya.
create policy "santri_select" on santri
  for select using (
    yayasan_id = current_yayasan_id()
    and (current_peran() <> 'wali' or id = current_santri_id())
  );
create policy "santri_insert" on santri
  for insert with check (yayasan_id = current_yayasan_id() and current_peran() <> 'wali');
create policy "santri_update" on santri
  for update using (yayasan_id = current_yayasan_id() and current_peran() <> 'wali');

-- Pegawai: tidak relevan untuk Wali Santri sama sekali.
create policy "pegawai_select" on pegawai
  for select using (yayasan_id = current_yayasan_id() and current_peran() <> 'wali');
create policy "pegawai_insert" on pegawai
  for insert with check (yayasan_id = current_yayasan_id() and current_peran() = 'yayasan');
create policy "pegawai_update" on pegawai
  for update using (yayasan_id = current_yayasan_id() and current_peran() = 'yayasan');

-- ----------------------------------------------------------------------------
-- 3. TAHFIDZ, PRESENSI, AKHLAK
-- ----------------------------------------------------------------------------

create table if not exists riwayat_tahfidz (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal date not null default current_date,
  juz text,
  surat text,
  ayat text,
  hadits text,
  kitab text,
  nilai text,
  dicatat_oleh text
);

create table if not exists presensi_santri (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal date not null default current_date,
  status text not null check (status in ('Hadir', 'Sakit', 'Izin', 'Alfa')),
  dicatat_oleh text,
  unique (santri_id, tanggal)
);

create table if not exists presensi_pegawai (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  -- null berarti presensi Yayasan sendiri (bukan pegawai biasa).
  pegawai_id bigint references pegawai (id) on delete cascade,
  tanggal date not null default current_date,
  status text not null check (status in ('Hadir', 'Sakit', 'Izin', 'Alfa')),
  dicatat_pada timestamptz,
  lokasi_lat double precision,
  lokasi_lng double precision,
  unique (pegawai_id, tanggal)
);

create table if not exists nilai_akhlak (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal date not null default current_date,
  nilai text not null,
  catatan text,
  dicatat_oleh text,
  status text not null default 'Disetujui' check (status in ('Menunggu', 'Disetujui', 'Ditolak'))
);

alter table riwayat_tahfidz enable row level security;
alter table presensi_santri enable row level security;
alter table presensi_pegawai enable row level security;
alter table nilai_akhlak enable row level security;

create policy "riwayat_tahfidz_select" on riwayat_tahfidz for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "riwayat_tahfidz_insert" on riwayat_tahfidz for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

create policy "presensi_santri_select" on presensi_santri for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "presensi_santri_insert" on presensi_santri for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "presensi_santri_update" on presensi_santri for update using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

create policy "presensi_pegawai_select" on presensi_pegawai for select using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "presensi_pegawai_insert" on presensi_pegawai for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "presensi_pegawai_update" on presensi_pegawai for update using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

create policy "nilai_akhlak_select" on nilai_akhlak for select using (
  yayasan_id = current_yayasan_id()
  and (
    current_peran() <> 'wali'
    or (santri_id = current_santri_id() and status = 'Disetujui')
  )
);
create policy "nilai_akhlak_insert" on nilai_akhlak for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "nilai_akhlak_update" on nilai_akhlak for update using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

-- ----------------------------------------------------------------------------
-- 4. KEUANGAN: SPP, DAFTAR ULANG, UANG PENDAFTARAN
-- ----------------------------------------------------------------------------

create table if not exists spp (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  periode text not null,
  nominal numeric not null,
  status text not null default 'Belum Lunas' check (status in ('Lunas', 'Belum Lunas')),
  tanggal_bayar date,
  keterangan text
);

create table if not exists daftar_ulang (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  periode text not null,
  nominal numeric not null,
  status text not null default 'Belum Lunas' check (status in ('Lunas', 'Belum Lunas')),
  tanggal_bayar date,
  keterangan text
);

create table if not exists uang_pendaftaran (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  nominal numeric not null,
  status text not null default 'Belum Lunas' check (status in ('Lunas', 'Belum Lunas')),
  tanggal_bayar date,
  keterangan text
);

alter table spp enable row level security;
alter table daftar_ulang enable row level security;
alter table uang_pendaftaran enable row level security;

create policy "spp_select" on spp for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "spp_insert" on spp for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "spp_update" on spp for update using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

create policy "daftar_ulang_select" on daftar_ulang for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "daftar_ulang_insert" on daftar_ulang for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "daftar_ulang_update" on daftar_ulang for update using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

create policy "uang_pendaftaran_select" on uang_pendaftaran for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "uang_pendaftaran_insert" on uang_pendaftaran for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "uang_pendaftaran_update" on uang_pendaftaran for update using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

-- ----------------------------------------------------------------------------
-- 5. IZIN PULANG, PELANGGARAN, REWARD
-- ----------------------------------------------------------------------------

create table if not exists izin_pulang (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal_keluar date not null,
  tanggal_kembali date not null,
  alasan text,
  status text not null default 'Menunggu' check (status in ('Menunggu', 'Disetujui', 'Ditolak')),
  diajukan_tanggal date not null default current_date
);

create table if not exists pelanggaran (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal date not null default current_date,
  kategori text not null,
  catatan text,
  dicatat_oleh text,
  status text not null default 'Disetujui' check (status in ('Menunggu', 'Disetujui', 'Ditolak'))
);

create table if not exists reward (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal date not null default current_date,
  kategori text not null,
  catatan text,
  dicatat_oleh text
);

alter table izin_pulang enable row level security;
alter table pelanggaran enable row level security;
alter table reward enable row level security;

create policy "izin_pulang_select" on izin_pulang for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "izin_pulang_insert" on izin_pulang for insert with check (
  yayasan_id = current_yayasan_id()
  and (current_peran() = 'wali' and santri_id = current_santri_id())
);
create policy "izin_pulang_update" on izin_pulang for update using (
  yayasan_id = current_yayasan_id() and current_peran() = 'pegawai'
);

create policy "pelanggaran_select" on pelanggaran for select using (
  yayasan_id = current_yayasan_id()
  and (
    current_peran() <> 'wali'
    or (santri_id = current_santri_id() and status = 'Disetujui')
  )
);
create policy "pelanggaran_insert" on pelanggaran for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() = 'pegawai'
);
create policy "pelanggaran_update" on pelanggaran for update using (
  yayasan_id = current_yayasan_id() and current_peran() = 'pegawai'
);

create policy "reward_select" on reward for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "reward_insert" on reward for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() = 'pegawai'
);

-- Pengumuman: broadcast dari Kesantrian (atau staf lain) ke wali santri.
-- kelas_tujuan null/kosong berarti pengumuman untuk SEMUA kelas.
create table if not exists pengumuman (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  judul text not null,
  isi text not null,
  kelas_tujuan text[],
  lampiran_url text,
  lampiran_nama text,
  dibuat_oleh text,
  created_at timestamptz not null default now()
);

alter table pengumuman enable row level security;

create policy "pengumuman_select" on pengumuman for select using (
  yayasan_id = current_yayasan_id()
  and (
    current_peran() <> 'wali'
    or kelas_tujuan is null
    or array_length(kelas_tujuan, 1) is null
    or exists (
      select 1 from santri s
      where s.id = current_santri_id() and s.kelas = any(kelas_tujuan)
    )
  )
);
create policy "pengumuman_insert" on pengumuman for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "pengumuman_delete" on pengumuman for delete using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

-- ----------------------------------------------------------------------------
-- 6. UANG JAJAN, TABUNGAN, DONASI
-- ----------------------------------------------------------------------------

create table if not exists transaksi_uang_jajan (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal date not null default current_date,
  jenis text not null check (jenis in ('Setor', 'Tarik')),
  nominal numeric not null check (nominal > 0),
  keterangan text
);

create table if not exists transaksi_tabungan (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  tanggal date not null default current_date,
  jenis text not null check (jenis in ('Setor', 'Tarik')),
  nominal numeric not null check (nominal > 0),
  keterangan text
);

create table if not exists donasi (
  id bigint generated always as identity primary key,
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  tanggal date not null default current_date,
  nama_donatur text not null,
  jenis text not null,
  nominal numeric not null,
  keterangan text
);

-- Cegah penarikan melebihi saldo LANGSUNG di database (bukan cuma cek di
-- client) -- mencegah race condition / manipulasi lewat request langsung.
create or replace function cek_saldo_transaksi()
returns trigger
language plpgsql
as $$
declare
  saldo_berjalan numeric;
begin
  if new.jenis = 'Tarik' then
    execute format(
      'select coalesce(sum(case when jenis = %L then nominal else -nominal end), 0) from %I where santri_id = $1',
      'Setor', TG_TABLE_NAME
    ) into saldo_berjalan using new.santri_id;

    if saldo_berjalan < new.nominal then
      raise exception 'Saldo tidak cukup untuk penarikan ini';
    end if;
  end if;
  return new;
end;
$$;

create trigger cek_saldo_uang_jajan
  before insert on transaksi_uang_jajan
  for each row execute function cek_saldo_transaksi();

create trigger cek_saldo_tabungan
  before insert on transaksi_tabungan
  for each row execute function cek_saldo_transaksi();

alter table transaksi_uang_jajan enable row level security;
alter table transaksi_tabungan enable row level security;
alter table donasi enable row level security;

create policy "transaksi_uang_jajan_select" on transaksi_uang_jajan for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "transaksi_uang_jajan_insert" on transaksi_uang_jajan for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() = 'pegawai'
);

create policy "transaksi_tabungan_select" on transaksi_tabungan for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "transaksi_tabungan_insert" on transaksi_tabungan for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() = 'pegawai'
);

create policy "donasi_select" on donasi for select using (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);
create policy "donasi_insert" on donasi for insert with check (
  yayasan_id = current_yayasan_id() and current_peran() <> 'wali'
);

-- ----------------------------------------------------------------------------
-- 7. PENGAJUAN PEMBAYARAN WALI SANTRI (upload bukti bayar)
-- ----------------------------------------------------------------------------

create table if not exists pembayaran_submission (
  id uuid primary key default gen_random_uuid(),
  yayasan_id uuid not null default current_yayasan_id() references yayasan (id) on delete cascade,
  santri_id bigint not null references santri (id) on delete cascade,
  nama_santri text not null,
  jenis text not null check (jenis in (
    'SPP', 'Tunggakan SPP', 'Tunggakan Daftar Ulang',
    'Tunggakan Uang Pendaftaran', 'Uang Jajan', 'Tabungan', 'Donasi'
  )),
  nominal numeric not null,
  keterangan text,
  bukti_url text not null,
  status text not null default 'Menunggu' check (status in ('Menunggu', 'Disetujui', 'Ditolak')),
  dikirim_oleh text,
  created_at timestamptz not null default now(),
  diverifikasi_pada timestamptz,
  catatan_verifikasi text
);

alter table pembayaran_submission enable row level security;

create policy "pembayaran_submission_select" on pembayaran_submission for select using (
  yayasan_id = current_yayasan_id() and (current_peran() <> 'wali' or santri_id = current_santri_id())
);
create policy "pembayaran_submission_insert" on pembayaran_submission for insert with check (
  yayasan_id = current_yayasan_id()
  and current_peran() = 'wali'
  and santri_id = current_santri_id()
);
create policy "pembayaran_submission_update" on pembayaran_submission for update using (
  yayasan_id = current_yayasan_id() and current_peran() in ('pegawai', 'yayasan')
);

-- Storage bucket untuk bukti bayar (foto, dikompres di client sebelum upload).
insert into storage.buckets (id, name, public)
values ('bukti-bayar', 'bukti-bayar', true)
on conflict (id) do nothing;

create policy "bukti_bayar_upload" on storage.objects
  for insert with check (bucket_id = 'bukti-bayar' and auth.role() = 'authenticated');
create policy "bukti_bayar_read" on storage.objects
  for select using (bucket_id = 'bukti-bayar');

-- Storage bucket untuk lampiran pengumuman (surat resmi, undangan, dll --
-- dokumen apa saja, tidak dikompres di client karena bisa berupa PDF).
insert into storage.buckets (id, name, public)
values ('lampiran-pengumuman', 'lampiran-pengumuman', true)
on conflict (id) do nothing;

create policy "lampiran_pengumuman_upload" on storage.objects
  for insert with check (bucket_id = 'lampiran-pengumuman' and auth.role() = 'authenticated');
create policy "lampiran_pengumuman_read" on storage.objects
  for select using (bucket_id = 'lampiran-pengumuman');

-- ============================================================================
-- SELESAI. Setelah ini jalankan Edge Function `buat-akun` (lihat
-- supabase/functions/buat-akun) supaya Yayasan bisa membuat akun login untuk
-- Pegawai dan Wali Santri.
-- ============================================================================
