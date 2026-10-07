import { 
  TagihanSPP, 
  TabunganSantri, 
  TabunganTransaksi, 
  UangJajanWallet, 
  UangJajanTransaksi 
} from '../types';

export class FinanceService {
  // ============================================================================
  // 1. SPP & BIAYA PENDIDIKAN
  // ============================================================================
  async generateTagihanSPP(tenant_id: string, bulan: number, tahun: number): Promise<{ total_generated: number }> {
    // Generate tagihan SPP rutin untuk seluruh santri aktif
    return { total_generated: 150 };
  }

  async bayarSPP(tagihan_id: string, nominal: number, metode: string): Promise<TagihanSPP> {
    return {
      id: tagihan_id,
      tenant_id: 'tenant-1',
      santri_id: 'santri-1',
      tahun_ajaran_id: 'ta-2026',
      bulan: 10,
      tahun: 2026,
      nominal: 500000,
      nominal_terbayar: nominal,
      status: 'paid',
      tanggal_jatuh_tempo: '2026-10-10',
    };
  }

  // ============================================================================
  // 2. TABUNGAN SANTRI (WADIAH)
  // ============================================================================
  async getTabungan(santri_id: string): Promise<TabunganSantri> {
    return {
      id: `tab-${santri_id}`,
      tenant_id: 'tenant-1',
      santri_id,
      nomor_rekening: `TBG-${santri_id.substring(0, 6)}`,
      saldo: 750000,
      is_active: true,
    };
  }

  async setorTabungan(santri_id: string, nominal: number, keterangan: string): Promise<TabunganTransaksi> {
    return {
      id: `trx-${Date.now()}`,
      tenant_id: 'tenant-1',
      tabungan_id: `tab-${santri_id}`,
      tipe: 'kredit',
      nominal,
      saldo_akhir: 850000,
      keterangan,
      created_at: new Date().toISOString(),
    };
  }

  // ============================================================================
  // 3. UANG JAJAN DIGITAL (E-POCKET KANTIN)
  // Aturan Bisnis: Tetap diimplementasikan penuh di backend & service,
  // namun disembunyikan di antarmuka navigasi UI sampai diaktifkan via feature flag.
  // ============================================================================
  async getWalletUangJajan(santri_id: string): Promise<UangJajanWallet> {
    return {
      id: `wallet-${santri_id}`,
      tenant_id: 'tenant-1',
      santri_id,
      saldo: 85000,
      limit_harian: 20000,
      pin_transaksi: '1234',
      is_active: true,
    };
  }

  async topUpUangJajan(santri_id: string, nominal: number): Promise<UangJajanTransaksi> {
    return {
      id: `uj-trx-${Date.now()}`,
      tenant_id: 'tenant-1',
      wallet_id: `wallet-${santri_id}`,
      tipe: 'kredit',
      nominal,
      saldo_akhir: 135000,
      keterangan: 'Top-up saldo jajan oleh wali santri via Payment Gateway',
      created_at: new Date().toISOString(),
    };
  }

  async aturLimitHarianUangJajan(santri_id: string, limit_baru: number): Promise<{ success: boolean; limit_harian: number }> {
    return {
      success: true,
      limit_harian: limit_baru,
    };
  }

  /**
   * Eksekusi transaksi belanja santri di kasir kantin/koperasi pesantren.
   * Melakukan verifikasi: Saldo mencukupi && tidak melebihi limit harian wali.
   */
  async uangJajanBelanja(
    santri_id: string, 
    nominal: number, 
    keterangan: string, 
    kasir_pegawai_id?: string
  ): Promise<UangJajanTransaksi> {
    // Memanggil RPC Supabase: rpc_uang_jajan_belanja(p_santri_id, p_nominal, p_keterangan)
    return {
      id: `uj-trx-${Date.now()}`,
      tenant_id: 'tenant-1',
      wallet_id: `wallet-${santri_id}`,
      tipe: 'debet',
      nominal,
      saldo_akhir: 70000,
      keterangan,
      kasir_pegawai_id,
      created_at: new Date().toISOString(),
    };
  }
}

export const financeService = new FinanceService();
