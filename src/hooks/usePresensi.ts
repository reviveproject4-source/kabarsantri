import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { PresensiPegawai, PresensiSantri, StatusPresensi } from '../types';
import { tanggalLokal } from '../tanggal';

function pemetaanPresensiSantri(baris: any): PresensiSantri {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    tanggal: baris.tanggal,
    status: baris.status,
    dicatatOleh: baris.dicatat_oleh ?? '',
  };
}

function pemetaanPresensiPegawai(baris: any): PresensiPegawai {
  return {
    id: baris.id,
    pegawaiId: baris.pegawai_id,
    tanggal: baris.tanggal,
    status: baris.status,
    dicatatPada: baris.dicatat_pada,
    lokasiLat: baris.lokasi_lat,
    lokasiLng: baris.lokasi_lng,
  };
}

const KUNCI_PRESENSI_SANTRI = ['presensiSantri'];
const KUNCI_PRESENSI_PEGAWAI = ['presensiPegawai'];

export function usePresensiSantriList() {
  return useQuery({
    queryKey: KUNCI_PRESENSI_SANTRI,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presensi_santri')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(pemetaanPresensiSantri);
    },
  });
}

export function useCatatPresensiSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      santriId,
      status,
      dicatatOleh,
    }: {
      santriId: number;
      status: StatusPresensi;
      dicatatOleh: string;
    }) => {
      const tanggal = tanggalLokal();

      const { error } = await supabase
        .from('presensi_santri')
        .upsert(
          {
            santri_id: santriId,
            tanggal,
            status,
            dicatat_oleh: dicatatOleh,
          },
          { onConflict: 'santri_id,tanggal' }
        );

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PRESENSI_SANTRI }),
  });
}

export function usePresensiPegawaiList() {
  return useQuery({
    queryKey: KUNCI_PRESENSI_PEGAWAI,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presensi_pegawai')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(pemetaanPresensiPegawai);
    },
  });
}

export function useCatatPresensiPegawai() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pegawaiId,
      status,
      lokasiLat,
      lokasiLng,
    }: {
      // null berarti ini presensi Yayasan sendiri (bukan pegawai biasa).
      pegawaiId: number | null;
      status: StatusPresensi;
      lokasiLat?: number | null;
      lokasiLng?: number | null;
    }) => {
      const tanggal = tanggalLokal();
      const kolom = {
        status,
        dicatat_pada: new Date().toISOString(),
        lokasi_lat: lokasiLat ?? null,
        lokasi_lng: lokasiLng ?? null,
      };

      if (pegawaiId !== null) {
        // Jalur pegawai biasa: ada unique constraint (pegawai_id, tanggal)
        // jadi upsert-nya atomik di level database, aman dari race condition.
        const { error } = await supabase
          .from('presensi_pegawai')
          .upsert(
            { pegawai_id: pegawaiId, tanggal, ...kolom },
            { onConflict: 'pegawai_id,tanggal' }
          );
        if (error) throw error;
        return;
      }

      // Yayasan sendiri (pegawai_id null): tidak ada unique constraint yang
      // bisa dipakai upsert (NULL tidak pernah dianggap "sama"), jadi dicek
      // manual. Pemanggil (lihat PresensiSaya.tsx) WAJIB menunggu panggilan
      // pertama selesai sebelum memanggil lagi untuk update lokasi, supaya
      // tidak lomba dan bikin baris dobel.
      const { data: barisLama } = await supabase
        .from('presensi_pegawai')
        .select('id')
        .eq('tanggal', tanggal)
        .is('pegawai_id', null)
        .maybeSingle();

      if (barisLama) {
        const { error } = await supabase
          .from('presensi_pegawai')
          .update(kolom)
          .eq('id', barisLama.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from('presensi_pegawai')
        .insert({ pegawai_id: null, tanggal, ...kolom });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PRESENSI_PEGAWAI }),
  });
}
