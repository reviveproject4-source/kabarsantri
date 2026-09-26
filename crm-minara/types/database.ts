export type UserRole = 'owner' | 'kepala_cabang' | 'kasir';

export interface Cabang {
  id: string;
  nama: string;
  owner_id?: string | null;
  salam_penutup?: string | null;
  created_at?: string;
}

export interface Employee {
  id: string;
  cabang_id?: string | null;
  nama: string;
  jabatan?: string | null;
  no_wa?: string | null;
  role: UserRole;
  auth_user_id?: string | null;
  created_at?: string;
}

export interface Presensi {
  id: string;
  employee_id: string;
  cabang_id: string;
  login_at: string;
  login_lat?: number | null;
  login_lng?: number | null;
  logout_at?: string | null;
  logout_lat?: number | null;
  logout_lng?: number | null;
  tanggal: string;
}

export interface Customer {
  id: string;
  cabang_id: string;
  nama: string;
  no_hp?: string | null;
  alamat?: string | null;
  email?: string | null;
  source_pos?: string | null;
  tags?: string[] | null;
  created_by?: string | null;
  created_at?: string;
}

export interface Layanan {
  id: string;
  cabang_id: string;
  nama: string;
  harga: number;
  hpp?: number | null;
  margin?: number;
  created_at?: string;
}

export interface Transaction {
  id: string;
  customer_id?: string | null;
  cabang_id: string;
  kasir_id?: string | null;
  layanan_id?: string | null;
  qty: number;
  nominal: number;
  metode_bayar: 'cash' | 'transfer';
  catatan?: string | null;
  status: 'active' | 'pending_delete' | 'deleted';
  created_at?: string;
}

export interface DeletedTransaction {
  id: string;
  original_transaction_id?: string | null;
  customer_id?: string | null;
  cabang_id: string;
  kasir_id?: string | null;
  nominal?: number | null;
  layanan_id?: string | null;
  alasan_hapus?: string | null;
  requested_at?: string;
  requested_by?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  flag_suspicious: boolean;
}

export interface ReminderRule {
  id: string;
  cabang_id: string;
  layanan_id: string;
  hari_setelah: number;
  created_at?: string;
}

export interface Reminder {
  id: string;
  customer_id: string;
  transaction_id: string;
  due_date: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  sent_at?: string | null;
  retry_count: number;
  error_message?: string | null;
  created_at?: string;
}

export interface SapaanTemplate {
  id: string;
  cabang_id: string;
  jenis: 'sapaan_pagi' | 'quotes';
  isi_pesan: string;
  aktif: boolean;
  created_at?: string;
}

export interface SapaanSchedule {
  id: string;
  customer_id: string;
  cabang_id: string;
  first_reminder_sent_at?: string | null;
  next_send_at?: string | null;
  last_sent_at?: string | null;
  status: 'active' | 'paused';
  created_at?: string;
}

export interface BlastLog {
  id: string;
  sent_by?: string | null;
  segment_filter?: any;
  pesan: string;
  total_target: number;
  total_terkirim: number;
  retry_count: number;
  error_message?: string | null;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  cabang_id: string;
  type: string;
  message: string;
  ref_transaction_id?: string | null;
  read_at?: string | null;
  created_at?: string;
}

export interface PromoRule {
  id: string;
  cabang_id: string;
  ambang_sepi_persen: number;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
  jenis_promo?: string | null;
  tgl_kecuali_mulai: number;
  tgl_kecuali_selesai: number;
  layanan_id_manual?: string | null;
  created_at?: string;
}

export interface PromoRequest {
  id: string;
  cabang_id: string;
  layanan_id: string;
  alasan?: string | null;
  diusulkan_oleh?: string | null;
  diusulkan_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  disetujui_oleh?: string | null;
  disetujui_at?: string | null;
}

export interface PromoEvent {
  id: string;
  cabang_id: string;
  generated_at?: string;
  promo_code?: string | null;
  layanan_id?: string | null;
  status: string;
  expired_at?: string | null;
}

export interface Pengeluaran {
  id: string;
  cabang_id: string;
  kategori?: string | null;
  nominal: number;
  keterangan?: string | null;
  tanggal: string;
  input_by?: string | null;
  created_at?: string;
}
