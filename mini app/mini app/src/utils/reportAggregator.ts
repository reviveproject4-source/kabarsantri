import {
  CatatanObservasiHarian,
  CatatanAdabMingguan,
  DomainUtamaKurikulum,
  LaporanMingguanOtomatis,
  RekapMuridPaud
} from '../types/paudTypes';

// ============================================================================
// HELPER USIA DETAIL (PROMPT 12 - TUGAS B)
// ============================================================================
export const hitungUsiaDetail = (tanggalLahir?: string): { formatted: string; tahun: number; bulan: number } | null => {
  if (!tanggalLahir || !tanggalLahir.trim()) return null;
  const birth = new Date(tanggalLahir);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();

  let ageYears = today.getFullYear() - birth.getFullYear();
  let ageMonths = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    ageMonths -= 1;
  }
  if (ageMonths < 0) {
    ageYears -= 1;
    ageMonths += 12;
  }

  if (ageYears < 0) return null;

  return {
    formatted: `${ageYears} thn ${ageMonths} bln`,
    tahun: ageYears,
    bulan: ageMonths
  };
};

// ============================================================================
// HELPER KEJUJURAN ANGKA & PERSENTASE (PROMPT 12 - BAGIAN 5)
// ============================================================================
export interface FormatKejujuranAngkaResult {
  hasData: boolean;
  displayText: string;
  isPartial: boolean;
  percentage: number;
  observedCount: number;
  totalCount: number;
}

export const formatPercentageHonest = (observedCount: number, totalCount: number): FormatKejujuranAngkaResult => {
  if (totalCount <= 0 || observedCount <= 0) {
    return {
      hasData: false,
      displayText: 'Belum ada data',
      isPartial: false,
      percentage: 0,
      observedCount: 0,
      totalCount
    };
  }

  const pct = Math.round((observedCount / totalCount) * 100);
  const isPartial = observedCount < totalCount / 2;

  return {
    hasData: true,
    displayText: `${pct}% (${observedCount} dari ${totalCount} murid)`,
    isPartial,
    percentage: pct,
    observedCount,
    totalCount
  };
};

// ============================================================================
// CALCULATE WEEKLY REPORT PER KELAS / TENANT
// ============================================================================
export const calculateWeeklyReport = (
  tenantId: string,
  kelasId: string,
  mingguKe: number,
  bulan: number,
  daftarMurid: RekapMuridPaud[],
  obsList: CatatanObservasiHarian[],
  adabList: CatatanAdabMingguan[]
): LaporanMingguanOtomatis => {
  // Filter murid by kelasId if specified, or all murid in tenant if kelasId is empty
  const muridKelas = kelasId
    ? daftarMurid.filter((m) => m.classId === kelasId || (m.tenantId === tenantId && !m.classId))
    : daftarMurid.filter((m) => m.tenantId === tenantId);

  const muridIdsKelas = new Set(muridKelas.map((m) => m.id));

  const filteredObs = obsList.filter(
    (o) => o.tenantId === tenantId && o.mingguKe === mingguKe && o.bulan === bulan && (muridIdsKelas.size === 0 || (!!o.muridId && muridIdsKelas.has(o.muridId)))
  );
  const filteredAdab = adabList.filter((a) => a.tenantId === tenantId && a.mingguKe === mingguKe && (muridIdsKelas.size === 0 || (!!a.muridId && muridIdsKelas.has(a.muridId))));

  // 1. Calculate unique days filled (0 - 5)
  const uniqueDays = new Set(filteredObs.map((o) => o.hari));
  const hariTerisiCount = uniqueDays.size;

  // 2. Calculate unique students observed
  const observedMuridIds = new Set(filteredObs.map((o) => o.muridId));
  const muridTerobservasiCount = observedMuridIds.size;

  // 3. Students not yet observed
  const muridBelumDiobservasiList = muridKelas
    .filter((m) => !observedMuridIds.has(m.id))
    .map((m) => m.nama);

  // 4. Domain score distribution (Excluding 'belum_waktunya')
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
      else if (obs.status === 'muncul_sendiri' || obs.status === 'terbiasa_mandiri') distribusiDomain[domainKey].mandiri += 1;
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
    totalMuridCount: muridKelas.length,
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
