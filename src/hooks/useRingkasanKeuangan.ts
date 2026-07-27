import { bulanDariTanggal, bulanEnamTerakhir } from '../Grafik';
import { useDaftarUlangList, useUangPendaftaranList } from './useTagihan';
import { useDonasiList, usePembayaranSubmissionList } from './useKeuangan';

export function useRingkasanKeuangan() {
  const { data: submissionList = [] } = usePembayaranSubmissionList();
  const { data: daftarUlangList = [] } = useDaftarUlangList();
  const { data: uangPendaftaranList = [] } = useUangPendaftaranList();
  const { data: donasiList = [] } = useDonasiList();

  // Tidak ada tabel tunggakan yang valid untuk SPP, jadi Total SPP dihitung
  // langsung dari pengajuan wali yang sudah divalidasi Keuangan/Yayasan --
  // ini sumber yang paling akurat, bukan dari tabel `spp` (rawan tidak sinkron).
  const submissionSpp = submissionList.filter(
    (s) =>
      s.status === 'Disetujui' &&
      (s.jenis === 'SPP' || s.jenis === 'Tunggakan SPP')
  );
  const tanggalSubmission = (s: (typeof submissionSpp)[number]) =>
    (s.diverifikasi_pada ?? s.created_at).slice(0, 10);

  const daftarUlangLunas = daftarUlangList.filter((d) => d.status === 'Lunas');
  const uangPendaftaranLunas = uangPendaftaranList.filter(
    (u) => u.status === 'Lunas'
  );

  const totalSpp = submissionSpp.reduce((total, s) => total + s.nominal, 0);
  const totalDaftarUlang = daftarUlangLunas.reduce(
    (total, d) => total + d.nominal,
    0
  );
  const totalUangPendaftaran = uangPendaftaranLunas.reduce(
    (total, u) => total + u.nominal,
    0
  );
  const totalDonasi = donasiList.reduce((total, d) => total + d.nominal, 0);
  const totalPemasukan =
    totalSpp + totalDaftarUlang + totalUangPendaftaran + totalDonasi;

  const bulanList = bulanEnamTerakhir();
  const trenPerBulan = bulanList.map((b) => {
    const sppBulan = submissionSpp
      .filter((s) => bulanDariTanggal(tanggalSubmission(s)) === b.key)
      .reduce((total, s) => total + s.nominal, 0);

    const daftarUlangBulan = daftarUlangLunas
      .filter(
        (d) => d.tanggalBayar && bulanDariTanggal(d.tanggalBayar) === b.key
      )
      .reduce((total, d) => total + d.nominal, 0);

    const uangPendaftaranBulan = uangPendaftaranLunas
      .filter(
        (u) => u.tanggalBayar && bulanDariTanggal(u.tanggalBayar) === b.key
      )
      .reduce((total, u) => total + u.nominal, 0);

    const donasiBulan = donasiList
      .filter((d) => bulanDariTanggal(d.tanggal) === b.key)
      .reduce((total, d) => total + d.nominal, 0);

    return {
      label: b.label,
      total: sppBulan + daftarUlangBulan + uangPendaftaranBulan + donasiBulan,
    };
  });

  return {
    totalSpp,
    totalDaftarUlang,
    totalUangPendaftaran,
    totalDonasi,
    totalPemasukan,
    trenPerBulan,
  };
}
