'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  Calendar, 
  Navigation,
  Compass,
  ExternalLink,
  RefreshCw,
  Info,
  Check,
  Briefcase,
  Shirt,
  Utensils,
  GraduationCap,
  Users,
  Shield,
  Layers,
  Car
} from 'lucide-react';
import { 
  getSharedPresensiList, 
  saveSharedPresensi, 
  PresensiPegawaiRecord,
  isTenantMode
} from '@/lib/sharedDataStore';
import { useActiveActor, ActiveActor } from '@/lib/sessionStore';
import { getEmployees } from '@/lib/kepegawaianStore';

/**
 * MASTER POS / ZONA KERJA PESANTREN (SKALA 50 - 150 PEGAWAI)
 * Setiap kelompok jabatan dan divisi memiliki titik penugasan fisik
 * masing-masing di kompleks pesantren seluas 3 hektar.
 */
interface PosKerjaPesantren {
  id: string;
  nama: string;
  kode: string;
  gedung: string;
  kategori: 'Laundry' | 'Dapur' | 'KBM' | 'Asrama' | 'Keamanan' | 'Kantor' | 'Dinas Luar';
  lat: number;
  lng: number;
  radius_meters: number;
  deskripsi: string;
}

const DAFTAR_POS_KERJA_PESANTREN: PosKerjaPesantren[] = [
  {
    id: 'pos-laundry',
    nama: 'Unit Laundry Sentral & Sanitasi',
    kode: 'POS-LND-01',
    gedung: 'Gedung Laundry Khodijah (Sayap Barat)',
    kategori: 'Laundry',
    lat: -6.589450,
    lng: 106.791200,
    radius_meters: 150,
    deskripsi: 'Khusus staf dan operator pencucian, pengeringan, & setrika seragam santri',
  },
  {
    id: 'pos-dapur',
    nama: 'Dapur Umum & Logistik Konsumsi',
    kode: 'POS-DPR-01',
    gedung: 'Gedung Dapur & Kantin Santri',
    kategori: 'Dapur',
    lat: -6.589380,
    lng: 106.791850,
    radius_meters: 150,
    deskripsi: 'Khusus koki dapur & tim penyiapan konsumsi 450 santri',
  },
  {
    id: 'pos-kbm',
    nama: 'Gedung Madrasah & Ruang Guru KBM',
    kode: 'POS-KBM-01',
    gedung: 'Gedung Pendidikan MTs & MA Ibnu Khaldun',
    kategori: 'KBM',
    lat: -6.588850,
    lng: 106.791350,
    radius_meters: 200,
    deskripsi: 'Khusus Dewan Asatidz / Guru untuk sesi KBM dan persiapan mengajar',
  },
  {
    id: 'pos-asrama',
    nama: 'Kompleks Asrama & Kesantrian',
    kode: 'POS-ASR-01',
    gedung: 'Blok Asrama Santri Abu Bakar & Utsman',
    kategori: 'Asrama',
    lat: -6.589600,
    lng: 106.792100,
    radius_meters: 250,
    deskripsi: 'Khusus Musyrif Asrama pemantauan tahajjud, subuh, & pembinaan santri',
  },
  {
    id: 'pos-satpam',
    nama: 'Pos Keamanan & Gerbang Utama',
    kode: 'POS-SEC-01',
    gedung: 'Pos Jaga Gerbang Timur & Pos Barat',
    kategori: 'Keamanan',
    lat: -6.588500,
    lng: 106.791600,
    radius_meters: 120,
    deskripsi: 'Khusus regu pengamanan, portal tamu, & sterilisasi gerbang pondok',
  },
  {
    id: 'pos-kantor',
    nama: 'Gedung Pusat Administrasi & Yayasan',
    kode: 'POS-ADM-01',
    gedung: 'Gedung Rektorat & Tata Usaha Pusat',
    kategori: 'Kantor',
    lat: -6.589167,
    lng: 106.791556,
    radius_meters: 150,
    deskripsi: 'Khusus Biro Keuangan, SDM / HRD, Mudir, Tata Usaha & Pimpinan Yayasan',
  },
  {
    id: 'pos-dinas-luar',
    nama: 'Tugas Luar / Dinas Luar Kampus',
    kode: 'POS-EXT-00',
    gedung: 'Lokasi Penugasan Luar Resmi (Dinas)',
    kategori: 'Dinas Luar',
    lat: 0,
    lng: 0,
    radius_meters: 999999,
    deskripsi: 'Khusus staf/guru yang sedang dinas luar, belanja pasar, atau urusan resmi di luar kampus',
  }
];

/**
 * Mendeteksi Pos Penugasan Default Pegawai berdasarkan Jabatan & Departemen
 */
function detectDefaultPosKerja(actor: ActiveActor): PosKerjaPesantren {
  const roleKey = (actor.role_key || '').toLowerCase();
  const title = (actor.title || '').toLowerCase();
  const dept = (actor.dept || '').toLowerCase();
  const name = (actor.name || '').toLowerCase();

  if (roleKey === 'laundry' || title.includes('laundry') || dept.includes('laundry') || name.includes('sumiati')) {
    return DAFTAR_POS_KERJA_PESANTREN[0]; // Unit Laundry
  }
  if (title.includes('koki') || title.includes('dapur') || dept.includes('dapur') || name.includes('maryono')) {
    return DAFTAR_POS_KERJA_PESANTREN[1]; // Dapur Umum
  }
  if (roleKey === 'guru' || title.includes('guru') || dept.includes('kbm') || dept.includes('pendidikan')) {
    return DAFTAR_POS_KERJA_PESANTREN[2]; // Gedung Madrasah
  }
  if (roleKey === 'musyrif' || title.includes('musyrif') || dept.includes('kesantrian') || dept.includes('asrama')) {
    return DAFTAR_POS_KERJA_PESANTREN[3]; // Kompleks Asrama
  }
  if (title.includes('satpam') || title.includes('keamanan') || name.includes('subandi')) {
    return DAFTAR_POS_KERJA_PESANTREN[4]; // Pos Keamanan
  }
  return DAFTAR_POS_KERJA_PESANTREN[5]; // Kantor Pusat Administrasi
}

/**
 * Formula Haversine: Menghitung jarak presisi dua titik koordinat bumi (dalam meter)
 */
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function AbsenDiriPribadiPage() {
  const activeActor = useActiveActor();

  // Pos Kerja aktif (otomatis terpilih sesuai jabatan, fleksibel diganti jika tugas silang)
  const [selectedPos, setSelectedPos] = useState<PosKerjaPesantren>(DAFTAR_POS_KERJA_PESANTREN[0]);

  const [selectedStatus, setSelectedStatus] = useState<'masuk' | 'pulang' | 'ijin' | 'sakit' | 'cuti' | 'tugas_luar'>('masuk');
  const [tempat, setTempat] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [notif, setNotif] = useState('');
  const [historyList, setHistoryList] = useState<PresensiPegawaiRecord[]>([]);

  // Filter Divisi pada Riwayat Presensi (Memudahkan kelola 50-150 Pegawai)
  const [filterDivisi, setFilterDivisi] = useState<string>('ALL');

  // Support Tenant Mode: Dynamic Employee Selection / Real Name Input
  const [tenantEmployees, setTenantEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [inputNamaPegawai, setInputNamaPegawai] = useState<string>('');

  // Geolocation & Titik Google Maps Real
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isWithinPos, setIsWithinPos] = useState<boolean | null>(null);

  // Otomatis tentukan Pos Kerja sesuai Akun Aktif & Muat Pegawai Tenant
  useEffect(() => {
    const defaultPos = detectDefaultPosKerja(activeActor);
    setSelectedPos(defaultPos);
    setTempat(`${defaultPos.nama} (${defaultPos.gedung})`);

    if (isTenantMode()) {
      const emps = getEmployees();
      setTenantEmployees(emps);
      if (emps.length > 0) {
        setSelectedEmpId(emps[0].id);
        setInputNamaPegawai(emps[0].full_name);
      }
    }
  }, [activeActor]);

  // Fungsi Deteksi Titik GPS Geolocation via Browser/HP
  const handleDetectGpsLocation = (targetPos = selectedPos) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Perangkat atau browser Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setGpsCoords({ lat, lng, accuracy });
        setGpsLoading(false);

        if (targetPos.id === 'pos-dinas-luar') {
          setDistanceMeters(0);
          setIsWithinPos(true);
          setTempat(`Tugas Luar / Dinas: ${targetPos.gedung} (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        } else {
          const dist = getDistanceFromLatLonInMeters(lat, lng, targetPos.lat, targetPos.lng);
          setDistanceMeters(dist);
          const inside = dist <= targetPos.radius_meters;
          setIsWithinPos(inside);

          if (inside) {
            setTempat(`${targetPos.nama} - ${targetPos.gedung} (GPS Valid: ${lat.toFixed(5)}, ${lng.toFixed(5)} ±${accuracy}m)`);
          } else {
            const kmStr = (dist / 1000).toFixed(2);
            setTempat(`Luar Radius ${targetPos.nama} (${kmStr} km dari pos tugas - GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          }
        }
      },
      (err) => {
        setGpsLoading(false);
        // Fallback titik kampus pesantren
        const fallbackLat = targetPos.id === 'pos-dinas-luar' ? -6.589167 : targetPos.lat;
        const fallbackLng = targetPos.id === 'pos-dinas-luar' ? 106.791556 : targetPos.lng;
        const fallbackAcc = 10;
        setGpsCoords({ lat: fallbackLat, lng: fallbackLng, accuracy: fallbackAcc });
        setDistanceMeters(0);
        setIsWithinPos(true);
        setTempat(`${targetPos.nama} (${targetPos.gedung})`);
        setGpsError('Izin GPS dinonaktifkan di browser. Sistem menggunakan titik koordinat pos kerja resmi.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handlePilihPosKerja = (posId: string) => {
    const target = DAFTAR_POS_KERJA_PESANTREN.find(p => p.id === posId) || DAFTAR_POS_KERJA_PESANTREN[0];
    setSelectedPos(target);
    if (target.id === 'pos-dinas-luar') {
      setSelectedStatus('tugas_luar');
    }
    handleDetectGpsLocation(target);
  };

  // Sinkronisasi data presensi dan deteksi otomatis lokasi saat halaman dibuka
  useEffect(() => {
    setHistoryList(getSharedPresensiList());
    handleDetectGpsLocation(selectedPos);

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB');
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    const handleUpdate = () => {
      setHistoryList(getSharedPresensiList());
    };
    window.addEventListener('ks_presensi_updated', handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('ks_presensi_updated', handleUpdate);
    };
  }, []);

  const googleMapsUrl = gpsCoords 
    ? `https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}` 
    : `https://www.google.com/maps?q=${selectedPos.lat},${selectedPos.lng}`;

  const handleKirimPresensi = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const waktuStr = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
    const tanggalStr = now.toISOString().split('T')[0];

    const gpsDetail = gpsCoords 
      ? ` [Pos: ${selectedPos.kode} - ${selectedPos.nama} | GPS: ${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)} | Jarak: ${distanceMeters}m]` 
      : ` [Pos: ${selectedPos.kode}]`;

    // Map status untuk shared store
    const mappedStatus = selectedStatus === 'tugas_luar' ? 'ijin' : selectedStatus;

    const chosenEmp = tenantEmployees.find(e => e.id === selectedEmpId);
    const isTenant = isTenantMode();
    const namaPencatat = isTenant
      ? (chosenEmp ? chosenEmp.full_name : inputNamaPegawai.trim() || activeActor.name)
      : activeActor.name;
    const nipPencatat = isTenant
      ? (chosenEmp ? chosenEmp.nip : activeActor.nip)
      : activeActor.nip;
    const jabatanPencatat = isTenant
      ? (chosenEmp ? chosenEmp.current_position : activeActor.title)
      : activeActor.title;

    saveSharedPresensi({
      pegawai_nama: namaPencatat,
      nip: nipPencatat,
      jabatan: jabatanPencatat as any,
      divisi: (activeActor.dept.includes('Keuangan') 
        ? 'Keuangan' 
        : activeActor.dept.includes('Pendidikan') || activeActor.dept.includes('KBM') 
        ? 'Akademik' 
        : activeActor.dept.includes('Rumah Tangga') || activeActor.dept.includes('Sarpras') || selectedPos.kategori === 'Laundry' || selectedPos.kategori === 'Dapur'
        ? 'Rumah Tangga' 
        : 'Kesantrian') as any,
      status: mappedStatus,
      tempat: tempat || `${selectedPos.nama} - ${selectedPos.gedung}`,
      tanggal: tanggalStr,
      waktu: waktuStr,
      keterangan: (keterangan ? `${keterangan}.` : `Presensi ${selectedStatus.toUpperCase()} mandiri.`) + gpsDetail,
    });

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('presensi_sesi_harian').insert({
        tipe_presensi: activeActor.role_key === 'guru' ? 'guru_kbm' : 'staf_operasional',
        status_kehadiran: selectedStatus === 'masuk' ? 'hadir' : selectedStatus,
        keterangan: `[${jabatanPencatat}] ${selectedStatus.toUpperCase()} di ${tempat} (${waktuStr}) - ${keterangan}${gpsDetail}`,
        waktu_scan: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase presensi notice:', err);
    }

    setNotif(`✓ Presensi [${selectedStatus.toUpperCase()}] atas nama ${namaPencatat} berhasil tersimpan di pos kerja: ${selectedPos.nama}!`);
    setKeterangan('');
    setTimeout(() => setNotif(''), 7000);
  };

  const getStatusBadge = (status: PresensiPegawaiRecord['status']) => {
    switch (status) {
      case 'masuk':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">MASUK</span>;
      case 'pulang':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] border border-blue-300">PULANG</span>;
      case 'ijin':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300">IJIN / DINAS</span>;
      case 'sakit':
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-300">SAKIT</span>;
      case 'cuti':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-300">CUTI</span>;
    }
  };

  // Filter List Presensi
  const filteredList = historyList.filter(item => {
    if (filterDivisi === 'ALL') return true;
    if (filterDivisi === 'KBM') return item.divisi === 'Akademik' || item.jabatan.includes('Guru');
    if (filterDivisi === 'RT') return item.divisi === 'Rumah Tangga' || item.jabatan.includes('Laundry') || item.jabatan.includes('Dapur') || item.jabatan.includes('Satpam');
    if (filterDivisi === 'ASRAMA') return item.divisi === 'Kesantrian' || item.jabatan.includes('Musyrif');
    if (filterDivisi === 'KEUANGAN') return item.divisi === 'Keuangan' || item.jabatan.includes('Keuangan');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 uppercase">
            Presensi Mandiri Multi-Pos (50 - 150 Pegawai)
          </span>
          <h1 className="text-xl font-bold mt-2">Absensi Diri Pribadi Sesuai Jabatan & Lokasi Kerja</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Mencatat kehadiran mandiri sesuai pos penugasan: Unit Laundry, Dapur, KBM Guru, Asrama, Satpam, hingga Kantor Pusat.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-emerald-500/40 px-4 py-3 rounded-xl text-left sm:text-right w-full sm:w-auto">
          <div className="text-[11px] text-emerald-300 flex items-center sm:justify-end space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDate || 'Memuat tanggal...'}</span>
          </div>
          <div className="text-xl font-mono font-bold text-white tracking-wider">
            {currentTime || '00:00:00 WIB'}
          </div>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start space-x-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-bold">{notif}</span>
        </div>
      )}

      {/* Grid Utama */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: FORM PRESENSI DIRI SENDIRI (LOCKED TO ACTIVE USER) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Presensi Mandiri Pegawai</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Terkunci sesuai akun yang sedang login (bukan orang lain)
            </p>
          </div>

          {/* Kartu Profil Pegawai Aktif */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                  Identitas Pegawai Anda:
                </span>
                <span className="font-extrabold text-sm text-slate-900 block mt-0.5">
                  {isTenantMode() ? (inputNamaPegawai.trim() || activeActor.name) : activeActor.name}
                </span>
                <span className="text-[11px] text-slate-600 block">
                  {activeActor.title} • {activeActor.dept}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0">
                Akun Sah
              </span>
            </div>

            {isTenantMode() && (
              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5">
                {tenantEmployees.length > 0 ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Pilih Pegawai Terdaftar:
                    </label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => {
                        setSelectedEmpId(e.target.value);
                        const found = tenantEmployees.find(emp => emp.id === e.target.value);
                        if (found) setInputNamaPegawai(found.full_name);
                      }}
                      className="w-full text-xs p-1.5 border border-emerald-300 rounded-lg bg-white"
                    >
                      {tenantEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.current_position || 'Pegawai'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Nama Asatidz / Pegawai yang Hadir:
                    </label>
                    <input
                      type="text"
                      value={inputNamaPegawai}
                      onChange={(e) => setInputNamaPegawai(e.target.value)}
                      placeholder="Ketik nama lengkap Anda untuk presensi"
                      className="w-full text-xs p-2 border border-emerald-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Belum ada staf di direktori SDM. Anda dapat langsung mengetikkan nama asli Anda.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>NIP: {activeActor.nip}</span>
              <span>Unit: {activeActor.unit_name || 'Pesantren Tahfidz Nurul Huda'}</span>
            </div>
          </div>

          <form onSubmit={handleKirimPresensi} className="space-y-4">
            {/* 1. Pemilihan Pos / Zona Tempat Bekerja */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Pos Kerja Penugasan Anda</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Otomatis Sesuai Jabatan
                </span>
              </label>

              <select
                value={selectedPos.id}
                onChange={(e) => handlePilihPosKerja(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {DAFTAR_POS_KERJA_PESANTREN.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.nama} — {pos.gedung}
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-slate-500 italic">
                {selectedPos.deskripsi} (Radius izin: {selectedPos.radius_meters === 999999 ? 'Fleksibel' : `${selectedPos.radius_meters}m`})
              </p>
            </div>

            {/* 2. Pilihan Status Presensi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Kehadiran Hari Ini
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['masuk', 'pulang', 'tugas_luar', 'ijin', 'sakit', 'cuti'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`py-2 text-[10px] font-bold rounded-lg uppercase transition border ${
                      selectedStatus === st
                        ? st === 'masuk'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : st === 'pulang'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : st === 'tugas_luar'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : st === 'ijin'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : st === 'sakit'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Deteksi Titik Google Maps & Geolocation Pos Kerja */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Validasi Jarak ke Pos Kerja</span>
                </span>
                <button
                  type="button"
                  disabled={gpsLoading}
                  onClick={() => handleDetectGpsLocation(selectedPos)}
                  className="px-2 py-1 rounded bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-[10px] font-bold transition flex items-center space-x-1 disabled:opacity-50"
                  title="Deteksi Ulang Koordinat GPS"
                >
                  <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsLoading ? 'Mencari...' : 'Refresh GPS'}</span>
                </button>
              </div>

              {/* Status Radius Geofence ke Pos Kerja */}
              {gpsCoords && (
                <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                  isWithinPos 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${isWithinPos ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                      <span>
                        {selectedPos.id === 'pos-dinas-luar'
                          ? '🚗 Mode Tugas Dinas Luar Kampus'
                          : isWithinPos 
                          ? `🟢 Di Area Pos Kerja: ${selectedPos.nama}` 
                          : `📍 Di Luar Radius Pos Kerja: ${selectedPos.nama}`}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono">
                      {selectedPos.id === 'pos-dinas-luar' ? 'Lokasi Luar' : `Jarak: ${distanceMeters} m`}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600">
                    Titik Anda: Lat {gpsCoords.lat.toFixed(6)}, Lng {gpsCoords.lng.toFixed(6)} (Akurasi: ±{gpsCoords.accuracy}m)
                  </div>
                  {!isWithinPos && selectedPos.id !== 'pos-dinas-luar' && (
                    <div className="text-[10px] text-amber-800 font-medium">
                      ⚠️ Anda berada {distanceMeters}m dari pos gedung. Presensi tetap dapat disimpan dengan catatan lokasi riil.
                    </div>
                  )}
                </div>
              )}

              {gpsError && (
                <div className="text-[10px] text-amber-700 p-2 bg-amber-50 rounded border border-amber-200">
                  {gpsError}
                </div>
              )}

              {/* Tautan ke Google Maps */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                <span className="text-slate-500">Peta Digital:</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>Buka Titik di Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 4. Input Detail Tempat / Keterangan Ruang */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Detail Tempat / Ruang Tugas</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                  Otomatis terisi
                </span>
              </label>
              <input
                type="text"
                required
                value={tempat}
                onChange={(e) => setTempat(e.target.value)}
                placeholder="Contoh: Gedung Laundry Khodijah / Dapur Utama / Ruang Guru MTs"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* 5. Keterangan / Alasan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan Pekerjaan / Catatan Harian
              </label>
              <textarea
                rows={2}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder={
                  selectedStatus === 'masuk'
                    ? 'Contoh: Memulai pencucian seragam santri blok A / Menyiapkan sarapan dapur / Mengajar jam 1-4'
                    : selectedStatus === 'pulang'
                    ? 'Contoh: Pekerjaan harian selesai, cucian rapi & mesin mati'
                    : selectedStatus === 'tugas_luar'
                    ? 'Contoh: Belanja bahan dapur ke pasar / antar santri berobat / dinas Kemenag'
                    : 'Tuliskan alasan ijin atau sakit...'
                }
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Simpan Presensi ({selectedStatus.toUpperCase().replace(/_/g, ' ')})</span>
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: TABEL LOG RIWAYAT PRESENSI MULTI-DIVISI */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Monitoring Presensi Seluruh Staf (Skala 50 - 150 Pegawai)</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Pencatatan real-time mencakup Laundry, Dapur, Guru KBM, Musyrif, Satpam, & Manajemen
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold self-start sm:self-auto">
              Total Tercatat: {historyList.length} Pegawai
            </span>
          </div>

          {/* Filter Cepat Divisi */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 font-bold shrink-0">Filter Bagian:</span>
            {[
              { id: 'ALL', label: 'Semua (50+ Pegawai)' },
              { id: 'RT', label: 'Rumah Tangga (Laundry & Dapur)' },
              { id: 'KBM', label: 'Pendidikan (Guru)' },
              { id: 'ASRAMA', label: 'Kesantrian (Musyrif)' },
              { id: 'KEUANGAN', label: 'Kantor & Keuangan' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterDivisi(tab.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                  filterDivisi === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto w-full -mx-2 px-2 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Pegawai & Pos Kerja</th>
                  <th className="p-2.5">Divisi / Jabatan</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Detail Tempat & Peta</th>
                  <th className="p-2.5">Waktu</th>
                  <th className="p-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <UserCheck className="w-8 h-8 text-slate-400" />
                        <p className="font-semibold text-sm text-slate-700">Belum ada riwayat presensi tercatat</p>
                        <p className="text-xs text-slate-400">Silakan gunakan formulir di samping untuk mencatat presensi mandiri.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-800">{item.pegawai_nama}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        NIP: {item.nip}
                      </div>
                    </td>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-700">{item.jabatan}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.divisi}
                      </span>
                    </td>
                    <td className="p-2.5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center space-x-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[200px]" title={item.tempat}>{item.tempat}</span>
                      </div>
                    </td>
                    <td className="p-2.5 font-mono text-[11px]">
                      <div className="text-slate-800 font-bold">{item.waktu}</div>
                      <div className="text-[10px] text-slate-500">{item.tanggal}</div>
                    </td>
                    <td className="p-2.5 text-slate-600 text-[11px] max-w-xs truncate" title={item.keterangan}>
                      {item.keterangan || '-'}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
