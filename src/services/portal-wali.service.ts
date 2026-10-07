import { PortalWaliFeed } from '../types/engagement';

export class PortalWaliService {
  /**
   * Mengambil feed monitoring santri untuk ditampilkan di Portal Wali Santri.
   * Mendukung multi-anak (Wali dapat mengganti active child selector).
   */
  async getSantriFeed(wali_id: string, santri_id: string): Promise<PortalWaliFeed> {
    return {
      santri_id,
      nama_santri: 'Muhammad Al-Fatih',
      kamar: 'Kamar 102 - Asrama Abu Bakar',
      kelas: '7A Tahfidz MTs',
      ringkasan: {
        tahfidz_terakhir: 'Juz 30 (Surah An-Naba: 1-40) - Nilai A (Lulus)',
        status_presensi_hari_ini: 'Hadir Lengkap (Subuh, KBM Pagi, Ashar)',
        saldo_uang_jajan: 75000,
        tagihan_spp_pending: 450000,
        kondisi_kesehatan: 'Sehat (Aktif Mengikuti Kegiatan)',
      },
    };
  }

  /**
   * Pembayaran SPP langsung dari Portal Wali via Payment Gateway (VA / QRIS)
   */
  async createPaymentCheckout(tagihan_id: string, channel: 'bca_va' | 'qris'): Promise<{ payment_url: string; va_number?: string; qr_string?: string }> {
    return {
      payment_url: 'https://checkout.kabarsantri.id/pay/INV-202610-001',
      va_number: channel === 'bca_va' ? '88012398471234' : undefined,
      qr_string: channel === 'qris' ? '00020101021226...qris_payload' : undefined,
    };
  }
}

export const portalWaliService = new PortalWaliService();
