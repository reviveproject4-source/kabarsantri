-- ========================================================
-- CRM MINARA (RETAIL) - FIX PRESENSI SCOPING POLICIES
-- Migration: 20260807000300_fix_presensi_scope.sql
-- ========================================================

drop policy if exists "presensi_update" on presensi;
create policy "presensi_update" on presensi for update using (
  employee_id = public.get_current_employee_id()
  or (public.get_user_role() in ('owner','kepala_cabang')
      and cabang_id in (select public.get_user_cabang_ids()))
  or public.is_owner_of_cabang(cabang_id)
);

drop policy if exists "presensi_delete" on presensi;
create policy "presensi_delete" on presensi for delete using (
  (public.get_user_role() = 'owner'
    and cabang_id in (select public.get_user_cabang_ids()))
  or public.is_owner_of_cabang(cabang_id)
);
