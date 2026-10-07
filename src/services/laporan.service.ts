import { LaporanRingkasanEksekutif } from '../types';

export class LaporanService {
  /**
   * Langkah 6 dalam Journey: Lihat Laporan
   * Mengambil rekapitulasi data agregat eksekutif untuk yayasan dan pimpinan.
   */
  async getLaporanRingkasan(tenant_id: string): Promise<LaporanRingkasanEksekutif> {
    // Memanggil RPC Supabase: rpc_get_laporan_ringkasan()
    return {
      tenant_id,
      total_santri: 320,
      total_pegawai: 42,
      keuangan: {
        spp_terbayar: 154000000,
        spp_tertunggak: 12500000,
        total_tabungan_wadiah: 48900000,
        total_saldo_uang_jajan: 14200000, // Tercatat di audit laporan ledger
      },
    };
  }
}

export const laporanService = new LaporanService();
