-- ========================================================
-- CRM MINARA (RETAIL) - FASE 0 RLS HARDENING & SECURITY FIXES
-- Migration: 20260807000100_fase0_rls_hardening.sql
-- ========================================================

-- ========================================================
-- 1. FIX TENANT ISOLATION — helper baru
-- ========================================================

create or replace function public.get_current_employee_id()
returns uuid as $$
  select id from employees where auth_user_id = auth.uid();
$$ language sql stable security definer;

create or replace function public.is_owner_of_cabang(target_cabang_id uuid)
returns boolean as $$
  select exists (
    select 1 from cabang c
    where c.id = target_cabang_id
    and c.owner_id = public.get_current_employee_id()
  );
$$ language sql stable security definer;

-- ========================================================
-- 2. GANTI SEMUA POLICY YANG PAKAI POLA LAMA
-- ========================================================

-- CABANG
drop policy if exists "cabang_select" on cabang;
create policy "cabang_select" on cabang for select using (
  id in (select public.get_user_cabang_ids())
  or owner_id = public.get_current_employee_id()
);

-- EMPLOYEES
drop policy if exists "employees_select" on employees;
create policy "employees_select" on employees for select using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

-- PRESENSI — pisah per aksi, scope ke employee sendiri untuk kasir
drop policy if exists "presensi_all" on presensi;

create policy "presensi_select" on presensi for select using (
  employee_id = public.get_current_employee_id()
  or cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

create policy "presensi_insert" on presensi for insert with check (
  employee_id = public.get_current_employee_id()
  and cabang_id in (select public.get_user_cabang_ids())
);

create policy "presensi_update" on presensi for update using (
  employee_id = public.get_current_employee_id()
  or public.get_user_role() in ('owner','kepala_cabang')
);

create policy "presensi_delete" on presensi for delete using (
  public.get_user_role() = 'owner' or public.is_owner_of_cabang(cabang_id)
);

-- Drop unique constraint if exists to support custom multi-session validation at app/edge function layer if needed
alter table presensi drop constraint if exists presensi_employee_id_tanggal_key;

-- CUSTOMERS — fix customers_delete yang tidak discope cabang
drop policy if exists "customers_select" on customers;
create policy "customers_select" on customers for select using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "customers_insert" on customers;
create policy "customers_insert" on customers for insert with check (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "customers_update" on customers;
create policy "customers_update" on customers for update using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "customers_delete" on customers;
create policy "customers_delete" on customers for delete using (
  (public.get_user_role() = 'kepala_cabang' and cabang_id in (select public.get_user_cabang_ids()))
  or public.is_owner_of_cabang(cabang_id)
);

-- TRANSACTIONS — pisah insert vs update vs delete, kasir insert-only
drop policy if exists "transactions_all" on transactions;

create policy "transactions_select" on transactions for select using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

create policy "transactions_insert" on transactions for insert with check (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

-- Kasir TIDAK boleh update langsung. Hanya kepala_cabang/owner
-- yang boleh koreksi transaksi (misal salah input qty/harga).
create policy "transactions_update" on transactions for update using (
  (public.get_user_role() in ('owner','kepala_cabang')
    and cabang_id in (select public.get_user_cabang_ids()))
  or public.is_owner_of_cabang(cabang_id)
);

-- DELETED_TRANSACTIONS — pisah siapa boleh request vs approve
drop policy if exists "deleted_tx_all" on deleted_transactions;

create policy "deleted_tx_select" on deleted_transactions for select using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

create policy "deleted_tx_insert" on deleted_transactions for insert with check (
  requested_by = public.get_current_employee_id()
  and cabang_id in (select public.get_user_cabang_ids())
);

create policy "deleted_tx_update" on deleted_transactions for update using (
  (public.get_user_role() in ('owner','kepala_cabang')
    and cabang_id in (select public.get_user_cabang_ids()))
  or public.is_owner_of_cabang(cabang_id)
);

-- ========================================================
-- 3. FUNGSI REQUEST / APPROVE HAPUS TRANSAKSI
-- ========================================================

create or replace function public.request_delete_transaction(
  p_transaction_id uuid,
  p_alasan text
) returns uuid
language plpgsql security definer as $$
declare
  v_tx transactions%rowtype;
  v_deleted_id uuid;
begin
  select * into v_tx from transactions where id = p_transaction_id;
  if not found then
    raise exception 'Transaksi tidak ditemukan';
  end if;

  update transactions set status = 'pending_delete' where id = p_transaction_id;

  insert into deleted_transactions (
    original_transaction_id, customer_id, cabang_id, kasir_id,
    nominal, layanan_id, alasan_hapus, requested_by
  ) values (
    v_tx.id, v_tx.customer_id, v_tx.cabang_id, v_tx.kasir_id,
    v_tx.nominal, v_tx.layanan_id, p_alasan, public.get_current_employee_id()
  ) returning id into v_deleted_id;

  return v_deleted_id;
end;
$$;

create or replace function public.approve_delete_transaction(
  p_deleted_transaction_id uuid,
  p_flag_suspicious boolean default false
) returns void
language plpgsql security definer as $$
declare
  v_row deleted_transactions%rowtype;
begin
  if public.get_user_role() not in ('owner','kepala_cabang') then
    raise exception 'Tidak punya izin approve penghapusan transaksi';
  end if;

  select * into v_row from deleted_transactions where id = p_deleted_transaction_id;
  if not found then
    raise exception 'Pengajuan hapus tidak ditemukan';
  end if;

  update deleted_transactions
  set approved_by = public.get_current_employee_id(),
      approved_at = now(),
      flag_suspicious = p_flag_suspicious
  where id = p_deleted_transaction_id;

  update transactions set status = 'deleted' where id = v_row.original_transaction_id;
end;
$$;

-- ========================================================
-- 4. BLAST_LOGS — tambah cabang_id, fix scoping
-- ========================================================

alter table blast_logs add column if not exists cabang_id uuid references cabang(id) on delete cascade;

drop policy if exists "blast_logs_all" on blast_logs;
create policy "blast_logs_all" on blast_logs for all using (
  (public.get_user_role() in ('owner','kepala_cabang')
    and cabang_id in (select public.get_user_cabang_ids()))
  or public.is_owner_of_cabang(cabang_id)
);

-- ========================================================
-- 5. FIX POLICY LAIN YANG MASIH PAKAI POLA "or role = 'owner'"
-- ========================================================

drop policy if exists "layanan_all" on layanan;
create policy "layanan_all" on layanan for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "reminder_rules_all" on reminder_rules;
create policy "reminder_rules_all" on reminder_rules for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "reminders_all" on reminders;
create policy "reminders_all" on reminders for all using (
  customer_id in (
    select id from customers where cabang_id in (select public.get_user_cabang_ids())
    or public.is_owner_of_cabang(cabang_id)
  )
);

drop policy if exists "sapaan_templates_all" on sapaan_templates;
create policy "sapaan_templates_all" on sapaan_templates for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "sapaan_schedule_all" on sapaan_schedule;
create policy "sapaan_schedule_all" on sapaan_schedule for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "sapaan_logs_all" on sapaan_logs;
create policy "sapaan_logs_all" on sapaan_logs for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "notifications_all" on notifications;
create policy "notifications_all" on notifications for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "promo_rules_all" on promo_rules;
create policy "promo_rules_all" on promo_rules for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "promo_requests_all" on promo_requests;
create policy "promo_requests_all" on promo_requests for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "promo_events_all" on promo_events;
create policy "promo_events_all" on promo_events for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "pengeluaran_all" on pengeluaran;
create policy "pengeluaran_all" on pengeluaran for all using (
  cabang_id in (select public.get_user_cabang_ids())
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "customer_points_all" on customer_points;
create policy "customer_points_all" on customer_points for all using (
  customer_id in (
    select id from customers where cabang_id in (select public.get_user_cabang_ids())
    or public.is_owner_of_cabang(cabang_id)
  )
);

-- ========================================================
-- 6. deleted_transactions.original_transaction_id — tambah FK
-- ========================================================

alter table deleted_transactions drop constraint if exists fk_deleted_tx_original;
alter table deleted_transactions
  add constraint fk_deleted_tx_original
  foreign key (original_transaction_id) references transactions(id)
  on delete set null;

-- ========================================================
-- 7. METODE_BAYAR — perluas pilihan
-- ========================================================

alter table transactions drop constraint if exists transactions_metode_bayar_check;
alter table transactions add constraint transactions_metode_bayar_check
  check (metode_bayar in ('cash','transfer','qris','ewallet','debit','kredit'));
