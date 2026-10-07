import { AsramaGedung, AsramaKamar, SantriKamarPenempatan } from '../types/asrama';

export class AsramaService {
  /**
   * Menambahkan Gedung Asrama Baru
   */
  async createGedung(tenant_id: string, payload: Partial<AsramaGedung>): Promise<AsramaGedung> {
    return {
      id: `gedung-${Date.now()}`,
      tenant_id,
      kode_gedung: payload.kode_gedung || 'G-01',
      nama_gedung: payload.nama_gedung || 'Gedung Asrama Utama',
      peruntukan_gender: payload.peruntukan_gender || 'L',
      jumlah_lantai: payload.jumlah_lantai || 2,
      lokasi_kampus: payload.lokasi_kampus || 'Kampus Utama',
      is_active: true,
    };
  }

  /**
   * Menambahkan Kamar / Kobong di dalam Gedung
   */
  async createKamar(tenant_id: string, gedung_id: string, nomor_kamar: string, kapasitas: number): Promise<AsramaKamar> {
    return {
      id: `kamar-${Date.now()}`,
      tenant_id,
      gedung_id,
      nomor_kamar,
      lantai: 1,
      kapasitas_maksimal: kapasitas,
      is_active: true,
      jumlah_santri_aktif: 0,
    };
  }

  /**
   * Menugaskan Musyrif Pembina ke Kamar Asrama Tertentu
   */
  async assignMusyrifKamar(tenant_id: string, kamar_id: string, pegawai_id: string, is_pembina_utama: boolean = true) {
    return {
      success: true,
      message: 'Musyrif berhasil ditugaskan sebagai pembina kamar.',
    };
  }

  /**
   * Menempatkan / Mutasi Santri ke Kamar Tertentu
   */
  async assignSantriKamar(tenant_id: string, santri_id: string, kamar_id: string): Promise<SantriKamarPenempatan> {
    return {
      id: `penempatan-${Date.now()}`,
      tenant_id,
      santri_id,
      kamar_id,
      tanggal_mulai: new Date().toISOString().split('T')[0],
      is_active: true,
    };
  }
}

export const asramaService = new AsramaService();
