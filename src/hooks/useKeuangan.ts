import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import {
  Donasi,
  DonasiInput,
  TransaksiTabunganInput,
  TransaksiUangJajanInput,
  TransaksiTabungan,
  TransaksiUangJajan,
} from '../types';
import { PembayaranSubmission } from '../pembayaranTypes';

function pemetaanTransaksi(
  baris: any
): TransaksiUangJajan | TransaksiTabungan {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    tanggal: baris.tanggal,
    jenis: baris.jenis,
    nominal: Number(baris.nominal),
    keterangan: baris.keterangan ?? '',
  };
}

function pemetaanDonasi(baris: any): Donasi {
  return {
    id: baris.id,
    tanggal: baris.tanggal,
    namaDonatur: baris.nama_donatur,
    jenis: baris.jenis,
    nominal: Number(baris.nominal),
    keterangan: baris.keterangan ?? '',
  };
}

interface HasilTransaksi {
  berhasil: boolean;
  pesan?: string;
}

async function simpanTransaksi(
  tabel: string,
  input: TransaksiUangJajanInput | TransaksiTabunganInput
): Promise<HasilTransaksi> {
  const { error } = await supabase.from(tabel).insert({
    santri_id: input.santriId,
    jenis: input.jenis,
    nominal: input.nominal,
    keterangan: input.keterangan,
  });

  if (error) {
    if (error.message.includes('Saldo tidak cukup')) {
      return { berhasil: false, pesan: 'Saldo tidak cukup untuk penarikan ini' };
    }
    throw error;
  }

  return { berhasil: true };
}

const KUNCI_UANG_JAJAN = ['transaksiUangJajan'];
const KUNCI_TABUNGAN = ['transaksiTabungan'];
const KUNCI_DONASI = ['donasi'];
const KUNCI_PEMBAYARAN_SUBMISSION = ['pembayaranSubmission'];

export function usePembayaranSubmissionList() {
  return useQuery({
    queryKey: KUNCI_PEMBAYARAN_SUBMISSION,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pembayaran_submission')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as PembayaranSubmission[];
    },
  });
}

export function useTransaksiUangJajanList() {
  return useQuery({
    queryKey: KUNCI_UANG_JAJAN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaksi_uang_jajan')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(pemetaanTransaksi) as TransaksiUangJajan[];
    },
  });
}

export function useTambahTransaksiUangJajan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransaksiUangJajanInput) =>
      simpanTransaksi('transaksi_uang_jajan', input),
    onSuccess: (hasil) => {
      if (hasil.berhasil) {
        queryClient.invalidateQueries({ queryKey: KUNCI_UANG_JAJAN });
      }
    },
  });
}

export function useTransaksiTabunganList() {
  return useQuery({
    queryKey: KUNCI_TABUNGAN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaksi_tabungan')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(pemetaanTransaksi) as TransaksiTabungan[];
    },
  });
}

export function useTambahTransaksiTabungan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransaksiTabunganInput) =>
      simpanTransaksi('transaksi_tabungan', input),
    onSuccess: (hasil) => {
      if (hasil.berhasil) {
        queryClient.invalidateQueries({ queryKey: KUNCI_TABUNGAN });
      }
    },
  });
}

export function useDonasiList() {
  return useQuery({
    queryKey: KUNCI_DONASI,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donasi')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(pemetaanDonasi);
    },
  });
}

export function useTambahDonasi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DonasiInput) => {
      const { error } = await supabase.from('donasi').insert({
        nama_donatur: input.namaDonatur,
        jenis: input.jenis,
        nominal: input.nominal,
        keterangan: input.keterangan,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_DONASI }),
  });
}
