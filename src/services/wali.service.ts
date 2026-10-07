import { Wali, WaliHubungan, WaliSantriRelasi } from '../types';

export interface TambahWaliDTO {
  tenant_id: string;
  nama_lengkap: string;
  no_whatsapp: string;
  email?: string;
  alamat?: string;
  santri_ids?: { santri_id: string; hubungan: WaliHubungan; is_primary: boolean }[];
}

export class WaliService {
  /**
   * Langkah 2 dalam Journey: Tambah Wali
   * Mendaftarkan biodata wali dan merelasikannya ke satu atau lebih santri.
   */
  async tambahWali(dto: TambahWaliDTO): Promise<Wali> {
    const newWali: Wali = {
      id: `wali-${Date.now()}`,
      tenant_id: dto.tenant_id,
      nama_lengkap: dto.nama_lengkap,
      no_whatsapp: dto.no_whatsapp,
      email: dto.email,
      alamat: dto.alamat,
      has_pin: false,
      status: 'aktif',
    };

    return newWali;
  }

  /**
   * Langkah 3 dalam Journey: Buat Akun Wali
   * Mengenerate initial PIN dan mengaktifkan kredensial akses wali.
   */
  async buatAkunWali(tenant_id: string, wali_id: string, initial_pin: string): Promise<{ success: boolean; message: string }> {
    // Memanggil RPC Supabase: rpc_buat_akun_wali(p_wali_id, p_initial_pin)
    return {
      success: true,
      message: `Akun Wali berhasil diaktifkan dengan PIN: ${initial_pin}. Notifikasi PIN siap dikirimkan via WhatsApp.`,
    };
  }

  /**
   * Langkah 4 dalam Journey: Reset Akun / Reset PIN Wali
   * Mengatur ulang PIN jika wali lupa PIN atau perlu reset keamanan.
   */
  async resetAkunWali(tenant_id: string, wali_id: string, new_pin: string): Promise<{ success: boolean; message: string }> {
    // Memanggil RPC Supabase: rpc_reset_akun_wali(p_wali_id, p_new_pin)
    return {
      success: true,
      message: 'PIN Wali Santri berhasil di-reset.',
    };
  }
}

export const waliService = new WaliService();
