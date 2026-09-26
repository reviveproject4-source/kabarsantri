-- ========================================================
-- CRM MINARA (RETAIL) - FASE 0 RPC AUTHORIZATION FIX
-- Migration: 20260807000200_fase0_rpc_authz_fix.sql
-- ========================================================

-- Perbaiki dua fungsi RPC dengan menambahkan pengecekan otorisasi manual
-- di dalam body fungsi (karena SECURITY DEFINER melewati RLS secara default).

create or replace function public.request_delete_transaction(
  p_transaction_id uuid,
  p_alasan text
) returns uuid
language plpgsql security definer as $$
declare
  v_tx transactions%rowtype;
  v_deleted_id uuid;
  v_employee_id uuid;
begin
  v_employee_id := public.get_current_employee_id();

  select * into v_tx from transactions where id = p_transaction_id;
  if not found then
    raise exception 'Transaksi tidak ditemukan';
  end if;

  if v_tx.status <> 'active' then
    raise exception 'Transaksi tidak dalam status aktif, tidak bisa diajukan hapus';
  end if;

  if not (
    v_tx.cabang_id in (select public.get_user_cabang_ids())
    or public.is_owner_of_cabang(v_tx.cabang_id)
  ) then
    raise exception 'Tidak punya akses ke cabang transaksi ini';
  end if;

  update transactions set status = 'pending_delete' where id = p_transaction_id;

  insert into deleted_transactions (
    original_transaction_id, customer_id, cabang_id, kasir_id,
    nominal, layanan_id, alasan_hapus, requested_by
  ) values (
    v_tx.id, v_tx.customer_id, v_tx.cabang_id, v_tx.kasir_id,
    v_tx.nominal, v_tx.layanan_id, p_alasan, v_employee_id
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
  select * into v_row from deleted_transactions where id = p_deleted_transaction_id;
  if not found then
    raise exception 'Pengajuan hapus tidak ditemukan';
  end if;

  if v_row.approved_at is not null then
    raise exception 'Pengajuan ini sudah pernah diapprove';
  end if;

  if not (
    (public.get_user_role() in ('owner','kepala_cabang')
      and v_row.cabang_id in (select public.get_user_cabang_ids()))
    or public.is_owner_of_cabang(v_row.cabang_id)
  ) then
    raise exception 'Tidak punya izin approve penghapusan transaksi untuk cabang ini';
  end if;

  update deleted_transactions
  set approved_by = public.get_current_employee_id(),
      approved_at = now(),
      flag_suspicious = p_flag_suspicious
  where id = p_deleted_transaction_id;

  update transactions set status = 'deleted' where id = v_row.original_transaction_id;
end;
$$;
