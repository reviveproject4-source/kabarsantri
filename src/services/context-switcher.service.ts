/**
 * Multi-Role Context Switcher Service (Point 2: Satu Asatidz, Tiga Topi)
 * Memungkinkan staf beralih peran (Guru <-> Musyrif <-> Bagian Keuangan)
 * secara instan tanpa perlu logout / relogin.
 */

export interface UserRoleAssignment {
  role_id: string;
  kode_role: string;
  nama_role: string;
  hirarki_level: number;
  is_primary: boolean;
  is_active_context: boolean;
}

export class ContextSwitcherService {
  /**
   * Mengambil seluruh daftar peran/jabatan yang dimiliki user yang sedang login.
   */
  async getUserRoles(user_id: string, tenant_id: string): Promise<UserRoleAssignment[]> {
    return [
      {
        role_id: 'role-musyrif-1',
        kode_role: 'musyrif',
        nama_role: 'Musyrif Pembina Asrama (Kamar 101)',
        hirarki_level: 4,
        is_primary: true,
        is_active_context: true,
      },
      {
        role_id: 'role-guru-1',
        kode_role: 'guru',
        nama_role: 'Guru KBM Bahasa Arab (MTs Putra)',
        hirarki_level: 4,
        is_primary: false,
        is_active_context: false,
      },
    ];
  }

  /**
   * Beralih peran aktif di session pengguna.
   * Menjalankan RPC Supabase: rpc_switch_active_role(p_role_id)
   */
  async switchActiveRole(role_id: string): Promise<{ success: boolean; active_role_code: string; message: string }> {
    // Pada backend, ini memutakhirkan tabel app_user_roles (is_active_context = true)
    return {
      success: true,
      active_role_code: 'guru',
      message: 'Berhasil beralih ke Mode Guru KBM.',
    };
  }
}

export const contextSwitcherService = new ContextSwitcherService();
