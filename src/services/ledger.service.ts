import { KeuanganCOA, KeuanganJurnalUmum, KeuanganJurnalDetail } from '../types/finance-v2';

export interface CreateJurnalDTO {
  tenant_id: string;
  tanggal: string;
  keterangan: string;
  referensi_transaksi?: string;
  items: {
    coa_id: string;
    debet: number;
    kredit: number;
    memo?: string;
  }[];
}

export class LedgerService {
  /**
   * Menulis Jurnal Umum Double-Entry dengan validasi matematis: Total Debet == Total Kredit.
   */
  async postJurnal(dto: CreateJurnalDTO): Promise<KeuanganJurnalUmum> {
    const totalDebet = dto.items.reduce((sum, item) => sum + item.debet, 0);
    const totalKredit = dto.items.reduce((sum, item) => sum + item.kredit, 0);

    if (Math.abs(totalDebet - totalKredit) > 0.01) {
      throw new Error(`Jurnal tidak seimbang! Total Debet (Rp ${totalDebet}) != Total Kredit (Rp ${totalKredit})`);
    }

    return {
      id: `ju-${Date.now()}`,
      tenant_id: dto.tenant_id,
      nomor_jurnal: `JU-${Date.now()}`,
      tanggal: dto.tanggal,
      keterangan: dto.keterangan,
      referensi_transaksi: dto.referensi_transaksi,
    };
  }

  /**
   * Laporan Neraca Saldo (Trial Balance) Pesantren
   */
  async getTrialBalance(tenant_id: string, periode_bulan: number, periode_tahun: number) {
    return {
      tenant_id,
      periode: `${periode_bulan}/${periode_tahun}`,
      total_aset: 1250000000,
      total_kewajiban: 150000000,
      total_ekuitas: 1100000000,
      is_balanced: true,
    };
  }
}

export const ledgerService = new LedgerService();
