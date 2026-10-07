/**
 * Extended Financial & General Ledger Types (Point 4: Real ERP Accounting)
 */

export type CoaKategori = 'aset' | 'kewajiban' | 'ekuitas' | 'pendapatan' | 'beban_operasional';
export type PaymentMethod = 'virtual_account' | 'qris' | 'bank_transfer_manual' | 'tunai_kasir';
export type PembayaranStatus = 'pending' | 'success' | 'failed' | 'expired' | 'refunded';

export interface KeuanganCOA {
  id: string;
  tenant_id: string;
  kode_akun: string;
  nama_akun: string;
  kategori: CoaKategori;
  saldo_normal: 'debet' | 'kredit';
  is_active: boolean;
}

export interface KeuanganJurnalUmum {
  id: string;
  tenant_id: string;
  nomor_jurnal: string;
  tanggal: string;
  keterangan: string;
  referensi_transaksi?: string;
  details?: KeuanganJurnalDetail[];
}

export interface KeuanganJurnalDetail {
  id: string;
  jurnal_id: string;
  coa_id: string;
  debet: number;
  kredit: number;
  memo?: string;
  coa?: KeuanganCOA;
}

export interface KeuanganPembayaran {
  id: string;
  tenant_id: string;
  tagihan_id: string;
  nomor_transaksi: string;
  metode: PaymentMethod;
  channel_name: string;
  nominal: number;
  biaya_admin: number;
  status: PembayaranStatus;
  payment_gateway_ref?: string;
  va_number?: string;
  qris_payload?: string;
  waktu_lunas?: string;
  idempotency_key?: string;
}

export interface DonasiProgram {
  id: string;
  tenant_id: string;
  judul_program: string;
  kategori: string;
  target_nominal: number;
  nominal_terkumpul: number;
  deskripsi?: string;
  banner_url?: string;
  is_active: boolean;
}
