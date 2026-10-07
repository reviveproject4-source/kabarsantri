import { Kelas, SantriKelasAssignment } from '../types';

export interface AssignKelasDTO {
  tenant_id: string;
  santri_id: string;
  kelas_id: string;
  tahun_ajaran_id: string;
}

export class KelasService {
  /**
   * Langkah 5 dalam Journey: Assign Kelas
   * Menempatkan santri ke dalam rombongan belajar / kelas tertentu pada tahun ajaran aktif.
   */
  async assignSantriKelas(dto: AssignKelasDTO): Promise<SantriKelasAssignment> {
    // Memanggil RPC Supabase: rpc_assign_santri_kelas(p_santri_id, p_kelas_id, p_tahun_ajaran_id)
    return {
      id: `assignment-${Date.now()}`,
      tenant_id: dto.tenant_id,
      santri_id: dto.santri_id,
      kelas_id: dto.kelas_id,
      tahun_ajaran_id: dto.tahun_ajaran_id,
      is_active: true,
    };
  }

  async listKelas(tenant_id: string, unit_id?: string): Promise<Kelas[]> {
    return [];
  }
}

export const kelasService = new KelasService();
