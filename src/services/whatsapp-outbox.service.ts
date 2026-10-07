/**
 * WhatsApp Outbox & Throttling Service (Point 3: Anti-Banned Meta Engine)
 * Menggunakan pola Asynchronous Outbox Queue dengan rate limiting 2-3 detik per pesan.
 */

export interface EnqueueMessagePayload {
  recipient_phone: string;
  message_body: string;
  priority?: number; // 1: Urgent (Kesehatan), 2: Gate Pass, 3: Presensi, 4: SPP
  payload?: Record<string, any>;
}

export class WhatsAppOutboxService {
  private readonly THROTTLE_DELAY_MS = 2500; // Delay 2.5 detik untuk menghindari deteksi spam Meta

  /**
   * Menambahkan pesan ke antrean Outbox (Non-blocking / Asynchronous)
   * Dipanggil oleh modul Perizinan (Gate Pass), Presensi, Poskestren, dan Billing SPP.
   */
  async enqueue(payload: EnqueueMessagePayload): Promise<{ outbox_id: string; status: string }> {
    // Memanggil RPC Supabase: rpc_enqueue_wa_message()
    const outbox_id = `outbox-${Date.now()}`;
    return {
      outbox_id,
      status: 'pending',
    };
  }

  /**
   * Dispatcher Worker (Dijalankan oleh background worker / Edge cron)
   * Mengambil batch antrean secara FIFO sesuai prioritas dan mengirim dengan throttling.
   */
  async dispatchQueue(limit: number = 20): Promise<{ processed: number; sent: number; failed: number }> {
    // 1. Memanggil RPC: rpc_fetch_next_wa_batch(limit)
    // 2. Loop pengiriman dengan async sleep jeda 2.5 detik
    let sentCount = 0;
    let failedCount = 0;

    // Simulasi pengiriman terkontrol
    return {
      processed: limit,
      sent: sentCount,
      failed: failedCount,
    };
  }
}

export const whatsAppOutboxService = new WhatsAppOutboxService();
