-- ========================================================
-- CRM MINARA (RETAIL) - INITIAL DATABASE SCHEMA
-- Migration: 20260807000000_initial_schema.sql
-- ========================================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- ============ 1. AUTH & PEGAWAI ============

create table if not exists cabang (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  owner_id uuid, -- references employees(id) added via alter table below
  salam_penutup text,
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete set null,
  nama text not null,
  jabatan text,
  no_wa text,
  role text not null check (role in ('owner','kepala_cabang','kasir')),
  auth_user_id uuid references auth.users(id) on delete cascade unique,
  created_at timestamptz default now()
);

-- Circular FK link for owner_id in cabang
alter table cabang drop constraint if exists fk_cabang_owner;
alter table cabang add constraint fk_cabang_owner foreign key (owner_id) references employees(id) on delete set null;

create table if not exists presensi (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  cabang_id uuid references cabang(id) on delete cascade,
  login_at timestamptz default now(),
  login_lat numeric,
  login_lng numeric,
  logout_at timestamptz,
  logout_lat numeric,
  logout_lng numeric,
  tanggal date default current_date,
  unique (employee_id, tanggal)
);

-- ============ 2. PELANGGAN ============

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  nama text not null,
  no_hp text,
  alamat text,
  email text,
  source_pos text,
  tags text[],
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz default now()
);

-- ============ 3. LAYANAN ============

create table if not exists layanan (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  nama text not null,
  harga numeric not null default 0,
  hpp numeric default 0,
  margin numeric generated always as (harga - coalesce(hpp,0)) stored,
  created_at timestamptz default now()
);

-- ============ 4. TRANSAKSI & AUDIT DELETE ============

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  cabang_id uuid references cabang(id) on delete cascade,
  kasir_id uuid references employees(id) on delete set null,
  layanan_id uuid references layanan(id) on delete set null,
  qty int default 1,
  nominal numeric not null default 0,
  metode_bayar text check (metode_bayar in ('cash','transfer')),
  catatan text,
  status text default 'active' check (status in ('active','pending_delete','deleted')),
  created_at timestamptz default now()
);

create table if not exists deleted_transactions (
  id uuid primary key default gen_random_uuid(),
  original_transaction_id uuid,
  customer_id uuid,
  cabang_id uuid references cabang(id) on delete cascade,
  kasir_id uuid references employees(id) on delete set null,
  nominal numeric,
  layanan_id uuid,
  alasan_hapus text,
  requested_at timestamptz default now(),
  requested_by uuid references employees(id) on delete set null,
  approved_at timestamptz,
  approved_by uuid references employees(id) on delete set null,
  flag_suspicious boolean default false
);

-- ============ 5. REMINDER ============

create table if not exists reminder_rules (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  layanan_id uuid references layanan(id) on delete cascade,
  hari_setelah int not null,
  created_at timestamptz default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete cascade,
  due_date date not null,
  status text default 'pending' check (status in ('pending','sent','cancelled','failed')),
  sent_at timestamptz,
  retry_count int default 0,
  error_message text,
  created_at timestamptz default now()
);

-- ============ 6. HYPNOSELLING ============

create table if not exists sapaan_templates (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  jenis text check (jenis in ('sapaan_pagi','quotes')),
  isi_pesan text not null,
  aktif boolean default true,
  created_at timestamptz default now()
);

create table if not exists sapaan_schedule (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  cabang_id uuid references cabang(id) on delete cascade,
  first_reminder_sent_at timestamptz,
  next_send_at date,
  last_sent_at timestamptz,
  status text default 'active' check (status in ('active','paused')),
  created_at timestamptz default now()
);

create table if not exists sapaan_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  cabang_id uuid references cabang(id) on delete cascade,
  template_id uuid references sapaan_templates(id) on delete set null,
  sent_at timestamptz default now(),
  retry_count int default 0,
  error_message text
);

-- ============ 7. BLAST ============

create table if not exists blast_logs (
  id uuid primary key default gen_random_uuid(),
  sent_by uuid references employees(id) on delete set null,
  segment_filter jsonb,
  pesan text,
  total_target int default 0,
  total_terkirim int default 0,
  retry_count int default 0,
  error_message text,
  created_at timestamptz default now()
);

-- ============ 8. NOTIFIKASI ============

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  type text not null,
  message text not null,
  ref_transaction_id uuid,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============ 9. AUTO PROMO ============

create table if not exists promo_rules (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  ambang_sepi_persen numeric default 50,
  jam_mulai time,
  jam_selesai time,
  jenis_promo text,
  tgl_kecuali_mulai int default 15,
  tgl_kecuali_selesai int default 23,
  layanan_id_manual uuid references layanan(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists promo_requests (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  layanan_id uuid references layanan(id) on delete cascade,
  alasan text,
  diusulkan_oleh uuid references employees(id) on delete set null,
  diusulkan_at timestamptz default now(),
  status text default 'pending' check (status in ('pending','approved','rejected')),
  disetujui_oleh uuid references employees(id) on delete set null,
  disetujui_at timestamptz
);

create table if not exists promo_events (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  generated_at timestamptz default now(),
  promo_code text,
  layanan_id uuid references layanan(id) on delete set null,
  status text default 'active',
  expired_at timestamptz
);

-- ============ 10. PEMBUKUAN ============

create table if not exists pengeluaran (
  id uuid primary key default gen_random_uuid(),
  cabang_id uuid references cabang(id) on delete cascade,
  kategori text,
  nominal numeric not null default 0,
  keterangan text,
  tanggal date default current_date,
  input_by uuid references employees(id) on delete set null,
  created_at timestamptz default now()
);

-- ============ 11. GAMIFIKASI ============

create table if not exists customer_points (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade unique,
  poin int default 0,
  updated_at timestamptz default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  syarat_poin int not null default 0,
  created_at timestamptz default now()
);

-- ========================================================
-- INDEXES FOR PERFORMANCE (BAB 8.1)
-- ========================================================

create index if not exists idx_customers_cabang_hp on customers(cabang_id, no_hp);
create index if not exists idx_transactions_cabang_status_created on transactions(cabang_id, status, created_at);
create index if not exists idx_reminders_due_status on reminders(due_date, status);
create index if not exists idx_deleted_tx_requestedby_at on deleted_transactions(requested_by, requested_at);

-- ========================================================
-- HELPER FUNCTIONS FOR RLS (BAB 8.4)
-- ========================================================

create or replace function public.get_user_cabang_ids()
returns setof uuid as $$
begin
  return query select (jsonb_array_elements_text(coalesce(auth.jwt() -> 'app_metadata' -> 'cabang_ids', '[]'::jsonb)))::uuid;
end;
$$ language plpgsql stable security definer;

create or replace function public.get_user_role()
returns text as $$
begin
  return coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'kasir');
end;
$$ language plpgsql stable security definer;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

alter table cabang enable row level security;
alter table employees enable row level security;
alter table presensi enable row level security;
alter table customers enable row level security;
alter table layanan enable row level security;
alter table transactions enable row level security;
alter table deleted_transactions enable row level security;
alter table reminder_rules enable row level security;
alter table reminders enable row level security;
alter table sapaan_templates enable row level security;
alter table sapaan_schedule enable row level security;
alter table sapaan_logs enable row level security;
alter table blast_logs enable row level security;
alter table notifications enable row level security;
alter table promo_rules enable row level security;
alter table promo_requests enable row level security;
alter table promo_events enable row level security;
alter table pengeluaran enable row level security;
alter table customer_points enable row level security;
alter table badges enable row level security;

-- CABANG POLICY
create policy "cabang_select" on cabang for select using (
  id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);

-- EMPLOYEES POLICY
create policy "employees_select" on employees for select using (
  cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);

-- PRESENSI POLICY
create policy "presensi_all" on presensi for all using (
  cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);

-- CUSTOMERS POLICY (Kasir create-only, no delete for kasir)
create policy "customers_select" on customers for select using (
  cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);
create policy "customers_insert" on customers for insert with check (
  cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);
create policy "customers_update" on customers for update using (
  cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);
create policy "customers_delete" on customers for delete using (
  public.get_user_role() in ('owner', 'kepala_cabang')
);

-- TRANSACTIONS POLICY
create policy "transactions_all" on transactions for all using (
  cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);

-- DELETED_TRANSACTIONS POLICY
create policy "deleted_tx_all" on deleted_transactions for all using (
  cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner'
);

-- GENERAL CABANG-SCOPED TABLES POLICY
create policy "layanan_all" on layanan for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "reminder_rules_all" on reminder_rules for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "reminders_all" on reminders for all using (customer_id in (select id from customers where cabang_id in (select public.get_user_cabang_ids())) or public.get_user_role() = 'owner');
create policy "sapaan_templates_all" on sapaan_templates for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "sapaan_schedule_all" on sapaan_schedule for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "sapaan_logs_all" on sapaan_logs for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "blast_logs_all" on blast_logs for all using (public.get_user_role() in ('owner', 'kepala_cabang'));
create policy "notifications_all" on notifications for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "promo_rules_all" on promo_rules for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "promo_requests_all" on promo_requests for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "promo_events_all" on promo_events for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "pengeluaran_all" on pengeluaran for all using (cabang_id in (select public.get_user_cabang_ids()) or public.get_user_role() = 'owner');
create policy "customer_points_all" on customer_points for all using (customer_id in (select id from customers where cabang_id in (select public.get_user_cabang_ids())) or public.get_user_role() = 'owner');
create policy "badges_all" on badges for select using (true);
