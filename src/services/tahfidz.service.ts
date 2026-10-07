import { TahfidzSetoranLog, TahfidzJenisSetoran } from '../types/kesantrian';

export interface SetoranTahfidzDTO {
  tenant_id: string;
  santri_id: string;
  penyimak_pegawai_id: string;
  jenis_setoran: TahfidzJenisSetoran;
  juz: number;
  surah_awal: number;
  ayat_awal: number;
  surah_akhir: number;
  ayat_akhir: number;
  skor_kelancaran?: number;
  skor_tajwid?: number;
  skor_makhraj?: number;
  is_lulus: boolean;
  catatan_musyrif?: string;
}

export class TahfidzService {
  /**
   * Mencatat Setoran Ziyadah / Muraja'ah Santri
   */
  async catatSetoran(dto: SetoranTahfidzDTO): Promise<TahfidzSetoranLog> {
    return {
      id: `tahfidz-${Date.now()}`,
      tenant_id: dto.tenant_id,
      santri_id: dto.santri_id,
      penyimak_pegawai_id: dto.penyimak_pegawai_id,
      jenis_setoran: dto.jenis_setoran,
      juz: dto.juz,
      surah_awal: dto.surah_awal,
      ayat_awal: dto.ayat_awal,
      surah_akhir: dto.surah_akhir,
      ayat_akhir: dto.ayat_akhir,
      skor_kelancaran: dto.skor_kelancaran,
      skor_tajwid: dto.skor_tajwid,
      skor_makhraj: dto.skor_makhraj,
      is_lulus: dto.is_lulus,
      catatan_musyrif: dto.catatan_musyrif,
      tanggal_setoran: new Date().toISOString().split('T')[0],
    };
  }

  /**
   * Rekap Capaian Juz Santri
   */
  async getSantriTahfidzProgress(santri_id: string) {
    return {
      santri_id,
      total_juz_mutqin: 5,
      juz_sedang_dihafal: 6,
      halaman_terakhir: 112,
      persentase_kelulusan: 88,
    };
  }
}

export const tahfidzService = new TahfidzService();
