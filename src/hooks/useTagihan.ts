import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { DaftarUlang, Spp, UangPendaftaran } from '../types';

function pemetaanSpp(baris: any): Spp {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    periode: baris.periode,
    nominal: Number(baris.nominal),
    status: baris.status,
    tanggalBayar: baris.tanggal_bayar ?? '',
    keterangan: baris.keterangan ?? '',
  };
}

function pemetaanDaftarUlang(baris: any): DaftarUlang {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    periode: baris.periode,
    nominal: Number(baris.nominal),
    status: baris.status,
    tanggalBayar: baris.tanggal_bayar ?? '',
    keterangan: baris.keterangan ?? '',
  };
}

function pemetaanUangPendaftaran(baris: any): UangPendaftaran {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    nominal: Number(baris.nominal),
    status: baris.status,
    tanggalBayar: baris.tanggal_bayar ?? '',
    keterangan: baris.keterangan ?? '',
  };
}

async function lunaskanTertua(
  tabel: string,
  santriId: number,
  tanggalBayar: string,
  nominal: number,
  periode?: string
) {
  const { data: baris } = await supabase
    .from(tabel)
    .select('id')
    .eq('santri_id', santriId)
    .eq('status', 'Belum Lunas')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (baris) {
    const { error } = await supabase
      .from(tabel)
      .update({ status: 'Lunas', tanggal_bayar: tanggalBayar })
      .eq('id', baris.id);

    if (error) throw error;
    return;
  }

  // Tidak ada tagihan "Belum Lunas" yang cocok -- daripada pembayaran yang
  // sudah disetujui hilang begitu saja, catat langsung sebagai baris Lunas
  // baru memakai nominal yang diajukan wali.
  const dataBaru: Record<string, unknown> = {
    santri_id: santriId,
    nominal,
    status: 'Lunas',
    tanggal_bayar: tanggalBayar,
  };

  if (periode !== undefined) {
    dataBaru.periode = periode;
  }

  const { error } = await supabase.from(tabel).insert(dataBaru);
  if (error) throw error;
}

const KUNCI_SPP = ['spp'];
const KUNCI_DAFTAR_ULANG = ['daftarUlang'];
const KUNCI_UANG_PENDAFTARAN = ['uangPendaftaran'];

export function useSppList() {
  return useQuery({
    queryKey: KUNCI_SPP,
    queryFn: async () => {
      const { data, error } = await supabase.from('spp').select('*');
      if (error) throw error;
      return (data ?? []).map(pemetaanSpp);
    },
  });
}

export function useTambahSpp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Spp, 'id'>) => {
      const { error } = await supabase.from('spp').insert({
        santri_id: input.santriId,
        periode: input.periode,
        nominal: input.nominal,
        status: input.status,
        tanggal_bayar: input.tanggalBayar || null,
        keterangan: input.keterangan || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_SPP }),
  });
}

export function useLunaskanSppTertua() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      santriId,
      tanggalBayar,
      nominal,
    }: {
      santriId: number;
      tanggalBayar: string;
      nominal: number;
    }) =>
      lunaskanTertua(
        'spp',
        santriId,
        tanggalBayar,
        nominal,
        `Pembayaran ${tanggalBayar}`
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_SPP }),
  });
}

export function useDaftarUlangList() {
  return useQuery({
    queryKey: KUNCI_DAFTAR_ULANG,
    queryFn: async () => {
      const { data, error } = await supabase.from('daftar_ulang').select('*');
      if (error) throw error;
      return (data ?? []).map(pemetaanDaftarUlang);
    },
  });
}

export function useTambahDaftarUlang() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<DaftarUlang, 'id'>) => {
      const { error } = await supabase.from('daftar_ulang').insert({
        santri_id: input.santriId,
        periode: input.periode,
        nominal: input.nominal,
        status: input.status,
        tanggal_bayar: input.tanggalBayar || null,
        keterangan: input.keterangan || null,
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_DAFTAR_ULANG }),
  });
}

export function useLunaskanDaftarUlangTertua() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      santriId,
      tanggalBayar,
      nominal,
    }: {
      santriId: number;
      tanggalBayar: string;
      nominal: number;
    }) =>
      lunaskanTertua(
        'daftar_ulang',
        santriId,
        tanggalBayar,
        nominal,
        `Pembayaran ${tanggalBayar}`
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_DAFTAR_ULANG }),
  });
}

export function useUangPendaftaranList() {
  return useQuery({
    queryKey: KUNCI_UANG_PENDAFTARAN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uang_pendaftaran')
        .select('*');
      if (error) throw error;
      return (data ?? []).map(pemetaanUangPendaftaran);
    },
  });
}

export function useTambahUangPendaftaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<UangPendaftaran, 'id'>) => {
      const { error } = await supabase.from('uang_pendaftaran').insert({
        santri_id: input.santriId,
        nominal: input.nominal,
        status: input.status,
        tanggal_bayar: input.tanggalBayar || null,
        keterangan: input.keterangan || null,
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_UANG_PENDAFTARAN }),
  });
}

export function useLunaskanUangPendaftaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      santriId,
      tanggalBayar,
      nominal,
    }: {
      santriId: number;
      tanggalBayar: string;
      nominal: number;
    }) => lunaskanTertua('uang_pendaftaran', santriId, tanggalBayar, nominal),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_UANG_PENDAFTARAN }),
  });
}
