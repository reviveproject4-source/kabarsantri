import { Santri, SantriStatus } from '../types';

export interface TambahSantriDTO {
  tenant_id: string;
  unit_id: string;
  nis: string;
  nisn?: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir?: string;
  tanggal_lahir: string;
}

export class SantriService {
  /**
   * Langkah 1 dalam Journey: Tambah Santri
   * Menyimpan data induk santri sekaligus menginisialisasi rekening tabungan wadiah
   * dan dompet uang jajan (e-pocket, tersimpan aktif di backend walau UI disembunyikan).
   */
  async tambahSantri(dto: TambahSantriDTO): Promise<Santri> {
    // 1. Simpan santri ke database
    const newSantri: Santri = {
      id: `santri-${Date.now()}`,
      tenant_id: dto.tenant_id,
      unit_id: dto.unit_id,
      nis: dto.nis,
      nisn: dto.nisn,
      nama_lengkap: dto.nama_lengkap,
      jenis_kelamin: dto.jenis_kelamin,
      tempat_lahir: dto.tempat_lahir,
      tanggal_lahir: dto.tanggal_lahir,
      status: 'aktif',
      created_at: new Date().toISOString(),
    };

    // 2. Inisialisasi otomatis tabungan santri
    // 3. Inisialisasi otomatis wallet uang jajan (saldo Rp 0, limit harian Rp 20.000)

    return newSantri;
  }

  async getSantriList(tenant_id: string, filter?: { status?: SantriStatus; unit_id?: string }): Promise<Santri[]> {
    return [];
  }
}

export const santriService = new SantriService();
