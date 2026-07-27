export type JenisPembayaran =
  | 'SPP'
  | 'Tunggakan SPP'
  | 'Tunggakan Daftar Ulang'
  | 'Tunggakan Uang Pendaftaran'
  | 'Donasi';

export type StatusSubmission = 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface PembayaranSubmission {
  id: string;
  santri_id: number;
  nama_santri: string;
  jenis: JenisPembayaran;
  nominal: number;
  keterangan: string | null;
  bukti_url: string;
  status: StatusSubmission;
  dikirim_oleh: string | null;
  created_at: string;
  diverifikasi_pada: string | null;
  catatan_verifikasi: string | null;
}

export const JENIS_PEMBAYARAN_OPTIONS: JenisPembayaran[] = [
  'SPP',
  'Tunggakan SPP',
  'Tunggakan Daftar Ulang',
  'Tunggakan Uang Pendaftaran',
  'Donasi',
];
