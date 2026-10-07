import { Profile, Pegawai, Jabatan } from '../types';

export interface InternalAuthPayload {
  identifier: string; // Email atau NIP
  password: string;
}

export interface WaliAuthPayload {
  nis: string;
  pin: string;
  tanggal_lahir?: string;
}

export interface AuthSessionResponse {
  success: boolean;
  role: 'pegawai' | 'wali';
  tenant_id: string;
  token?: string;
  user: {
    id: string;
    nama: string;
    jabatan?: string;
    permissions?: string[];
    santri_ids?: string[];
  };
  message?: string;
}

export class AuthService {
  /**
   * Jalur 1: Login Staf / Pegawai Internal
   * Email/NIP + Password -> Supabase Auth -> Profil -> Pegawai.Jabatan -> Dashboard RBAC
   * Role TIDAK DIPILIH oleh user.
   */
  async loginInternal(payload: InternalAuthPayload): Promise<AuthSessionResponse> {
    // 1. Supabase Auth signInWithPassword (menggunakan client Supabase)
    // 2. Fetch profile & pegawai_jabatan
    // 3. Inject tenant_id dan roles ke session
    return {
      success: true,
      role: 'pegawai',
      tenant_id: 'tenant-uuid-placeholder',
      token: 'jwt-token-placeholder',
      user: {
        id: 'user-uuid-1',
        nama: 'Ust. Ahmad Dahlan',
        jabatan: 'keuangan',
        permissions: ['keuangan.read', 'keuangan.write', 'santri.read', 'laporan.view'],
      },
    };
  }

  /**
   * Jalur 2: Login Wali Santri (Frictionless)
   * NIS + PIN (+ Tgl Lahir) -> RPC Database cari_identitas_wali -> Technical Auth Identity -> Portal Wali
   */
  async loginWali(payload: WaliAuthPayload): Promise<AuthSessionResponse> {
    // Memanggil database RPC yang memverifikasi kecocokan NIS dan hashed PIN wali
    return {
      success: true,
      role: 'wali',
      tenant_id: 'tenant-uuid-placeholder',
      token: 'technical-wali-session-token',
      user: {
        id: 'wali-uuid-1',
        nama: 'H. Syamsul Bahri',
        santri_ids: ['santri-uuid-1', 'santri-uuid-2'], // Support multi-anak
      },
    };
  }
}

export const authService = new AuthService();
