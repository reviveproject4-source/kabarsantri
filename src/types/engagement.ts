/**
 * Engagement, WhatsApp Outbox (Anti-Banned), and Portal Wali Types (Fase 5 & Point 3)
 */

export type WaMessageStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'rate_limited' | 'cancelled';
export type TargetAudiens = 'semua' | 'per_lembaga' | 'per_kamar' | 'per_kelas' | 'staf_internal';

export interface WaTemplate {
  id: string;
  tenant_id: string;
  kode_template: string;
  judul: string;
  template_body: string;
  is_active: boolean;
}

export interface WaMessageOutbox {
  id: string;
  tenant_id: string;
  recipient_phone: string;
  message_body: string;
  template_id?: string;
  priority: number; // 1: Emergency (Kesehatan), 2: Gate Pass, 3: Presensi/Tahfidz, 4: SPP Broadcast
  status: WaMessageStatus;
  attempt_count: number;
  scheduled_at: string;
  sent_at?: string;
  last_error?: string;
}

export interface PengumumanBroadcast {
  id: string;
  tenant_id: string;
  judul: string;
  slug: string;
  konten_markdown: string;
  target_audiens: TargetAudiens;
  target_lembaga_id?: string;
  target_kamar_id?: string;
  target_kelas_id?: string;
  lampiran_dokumen_url?: string;
  is_published: boolean;
  published_at: string;
  author_id?: string;
}

export interface PortalWaliFeed {
  santri_id: string;
  nama_santri: string;
  kamar: string;
  kelas: string;
  ringkasan: {
    tahfidz_terakhir: string;
    status_presensi_hari_ini: string;
    saldo_uang_jajan: number;
    tagihan_spp_pending: number;
    kondisi_kesehatan: string;
  };
}
