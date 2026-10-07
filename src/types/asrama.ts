/**
 * Asrama & Keasramaan Types for KabarSantri v2.0 (Point 1 Integration)
 */

export interface AsramaGedung {
  id: string;
  tenant_id: string;
  kode_gedung: string;
  nama_gedung: string;
  peruntukan_gender: 'L' | 'P';
  jumlah_lantai: number;
  lokasi_kampus: string;
  is_active: boolean;
}

export interface AsramaKamar {
  id: string;
  tenant_id: string;
  gedung_id: string;
  nomor_kamar: string;
  lantai: number;
  kapasitas_maksimal: number;
  keterangan?: string;
  is_active: boolean;
  gedung?: AsramaGedung;
  musyrif_pembina?: MusyrifKamar[];
  jumlah_santri_aktif?: number;
}

export interface MusyrifKamar {
  id: string;
  tenant_id: string;
  kamar_id: string;
  pegawai_id: string;
  is_pembina_utama: boolean;
  pegawai?: {
    nama_lengkap: string;
    no_telepon?: string;
  };
}

export interface SantriKamarPenempatan {
  id: string;
  tenant_id: string;
  santri_id: string;
  kamar_id: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  is_active: boolean;
  keterangan?: string;
}
