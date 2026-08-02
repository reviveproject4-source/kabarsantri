import {
  CatatanObservasiHarian,
  CatatanAdabMingguan,
  DomainUtamaKurikulum,
  LaporanMingguanOtomatis,
  RekapMuridPaud
} from '../types/paudTypes';

export const calculateWeeklyReport = (
  tenantId: string,
  kelasId: string,
  mingguKe: number,
  bulan: number,
  daftarMurid: RekapMuridPaud[],
  obsList: CatatanObservasiHarian[],
  adabList: CatatanAdabMingguan[]
): LaporanMingguanOtomatis => {
  const filteredObs = obsList.filter(
    (o) => o.tenantId === tenantId && o.mingguKe === mingguKe && o.bulan === bulan
  );
  const filteredAdab = adabList.filter((a) => a.tenantId === tenantId && a.mingguKe === mingguKe);

  // 1. Calculate unique days filled (0 - 5)
  const uniqueDays = new Set(filteredObs.map((o) => o.hari));
  const hariTerisiCount = uniqueDays.size;

  // 2. Calculate unique students observed
  const observedMuridIds = new Set(filteredObs.map((o) => o.muridId));
  const muridTerobservasiCount = observedMuridIds.size;

  // 3. Students not yet observed
  const muridBelumDiobservasiList = daftarMurid
    .filter((m) => !observedMuridIds.has(m.id))
    .map((m) => m.nama);

  // 4. Domain score distribution
  const distribusiDomain: Record<DomainUtamaKurikulum, { belum: number; mulai: number; mandiri: number }> = {
    logika: { belum: 0, mulai: 0, mandiri: 0 },
    motorik_halus: { belum: 0, mulai: 0, mandiri: 0 },
    motorik_kasar_olahraga: { belum: 0, mulai: 0, mandiri: 0 },
    sosial_bahasa: { belum: 0, mulai: 0, mandiri: 0 },
    agama_akhlak: { belum: 0, mulai: 0, mandiri: 0 }
  };

  filteredObs.forEach((obs) => {
    const domainKey = obs.domainUtama as DomainUtamaKurikulum;
    if (domainKey && distribusiDomain[domainKey]) {
      if (obs.status === 'belum_terlihat') distribusiDomain[domainKey].belum += 1;
      else if (obs.status === 'mulai_muncul') distribusiDomain[domainKey].mulai += 1;
      else if (obs.status === 'muncul_sendiri') distribusiDomain[domainKey].mandiri += 1;
    }
  });

  // 5. Adab Stats per student
  const adabStats: Record<string, any> = {};
  filteredAdab.forEach((adab) => {
    if (adab.muridId) {
      adabStats[adab.muridId] = adab.status;
    }
  });

  return {
    tenantId,
    kelasId,
    mingguKe,
    bulan,
    hariTerisiCount,
    totalMuridCount: daftarMurid.length,
    muridTerobservasiCount,
    distribusiDomain,
    adabStats,
    muridBelumDiobservasiList
  };
};

export const getCompletionColorBadge = (hariTerisiCount: number) => {
  if (hariTerisiCount >= 5) {
    return { status: '🟢 Lengkap (5/5 Hari)', color: 'bg-emerald-500 text-white', code: 'green' };
  }
  if (hariTerisiCount >= 3) {
    return { status: '🟡 Sebagian (3-4/5 Hari)', color: 'bg-amber-500 text-white', code: 'yellow' };
  }
  return { status: '🔴 Belum Ada Input (<3 Hari)', color: 'bg-rose-500 text-white', code: 'red' };
};
