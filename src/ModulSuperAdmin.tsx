import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { openDirectWA } from './teleponUtils';

export interface DataProspekLembaga {
  id: string;
  namaYayasan: string;
  namaPenanggungJawab: string;
  jabatanPenanggungJawab: string;
  noHp: string;
  email: string;
  alamat: string;
  perkiraanJumlahSantri: string;
  sumberInformasi: string;
  paket: 'Prospek' | 'Gratis' | 'Premium';
  createdAt: string;
  // 2 Jenis Tambah Kuota (Strictly 500 / 1000)
  kuotaSantriMax?: number; // 500 | 1000 | 99999
  kuotaPegawaiMax?: number; // 500 | 1000 | 99999
  // 4 Jenis Fitur Modular Spesifik
  fiturSppKeuangan?: boolean; // Fitur 1: SPP & Validasi Bukti Transfer
  fiturPerizinanDisiplin?: boolean; // Fitur 2: Perizinan Pulang Santri
  fiturCustomBranding?: boolean; // Fitur 3: White-Label Custom Logo & Alamat
  fiturRewardPelanggaran?: boolean; // Fitur 4: Karakter, Reward & Pelanggaran Santri
}

const STORAGE_KEY_PROSPEK = 'kabarsantri_prospek_lembaga_list';

export function ModulSuperAdmin({ onKembali }: { onKembali?: () => void }) {
  const [daftarProspek, setDaftarProspek] = useState<DataProspekLembaga[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [filterPaket, setFilterPaket] = useState<string>('Semua');
  const [cariKata, setCariKata] = useState('');

  // Modal Tambah / Edit Pesantren
  const [showModalTambah, setShowModalTambah] = useState(false);
  const [formNamaYayasan, setFormNamaYayasan] = useState('');
  const [formNamaPenanggungJawab, setFormNamaPenanggungJawab] = useState('');
  const [formJabatan, setFormJabatan] = useState('Pimpinan Pesantren');
  const [formNoHp, setFormNoHp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formJumlahSantri, setFormJumlahSantri] = useState('500 Santri');
  const [formPaket, setFormPaket] = useState<'Prospek' | 'Gratis' | 'Premium'>('Prospek');

  // Modal Pengaturan Modular & Kuota (500 & 1000)
  const [selectedPesantren, setSelectedPesantren] = useState<DataProspekLembaga | null>(null);
  const [editKuotaSantri, setEditKuotaSantri] = useState<number>(500);
  const [editKuotaPegawai, setEditKuotaPegawai] = useState<number>(500);
  const [editFiturSpp, setEditFiturSpp] = useState<boolean>(false);
  const [editFiturDisiplin, setEditFiturDisiplin] = useState<boolean>(false);
  const [editFiturBranding, setEditFiturBranding] = useState<boolean>(false);
  const [editFiturReward, setEditFiturReward] = useState<boolean>(false);

  // Load real data from Supabase + localStorage
  const muatData = async () => {
    setMemuat(true);

    try {
      const { data, error } = await supabase
        .from('yayasan')
        .select('*')
        .order('created_at', { ascending: false });

      let dataLokal: DataProspekLembaga[] = [];
      const simpanan = localStorage.getItem(STORAGE_KEY_PROSPEK);
      if (simpanan) {
        try {
          dataLokal = JSON.parse(simpanan);
        } catch {
          dataLokal = [];
        }
      }

      if (!error && data && data.length > 0) {
        const dipetakan: DataProspekLembaga[] = data.map((d: any) => ({
          id: d.id,
          namaYayasan: d.nama_yayasan || 'Yayasan Tanpa Nama',
          namaPenanggungJawab: d.nama_penanggung_jawab || '-',
          jabatanPenanggungJawab: d.jabatan_penanggung_jawab || '-',
          noHp: d.no_hp || '-',
          email: d.email || '-',
          alamat: d.alamat || '-',
          perkiraanJumlahSantri: d.perkiraan_jumlah_santri || '-',
          sumberInformasi: d.sumber_informasi || '-',
          paket: (d.paket as any) || 'Prospek',
          createdAt: d.created_at || new Date().toISOString(),
          kuotaSantriMax: d.kuota_santri_max || 500,
          kuotaPegawaiMax: d.kuota_pegawai_max || 500,
          fiturSppKeuangan: d.fitur_spp_keuangan ?? false,
          fiturPerizinanDisiplin: d.fitur_perizinan_disiplin ?? false,
          fiturCustomBranding: d.fitur_custom_branding ?? false,
          fiturRewardPelanggaran: d.fitur_reward_pelanggaran ?? false,
        }));

        const gabungan = [...dipetakan];
        dataLokal.forEach((itemLokal) => {
          if (!gabungan.some((g) => g.id === itemLokal.id || g.namaYayasan === itemLokal.namaYayasan)) {
            gabungan.push(itemLokal);
          }
        });

        setDaftarProspek(gabungan);
        localStorage.setItem(STORAGE_KEY_PROSPEK, JSON.stringify(gabungan));
      } else {
        setDaftarProspek(dataLokal);
      }
    } catch {
      const simpanan = localStorage.getItem(STORAGE_KEY_PROSPEK);
      if (simpanan) {
        setDaftarProspek(JSON.parse(simpanan));
      } else {
        setDaftarProspek([]);
      }
    } finally {
      setMemuat(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  const bukaModalPengaturanLisensi = (item: DataProspekLembaga) => {
    setSelectedPesantren(item);
    setEditKuotaSantri(item.kuotaSantriMax ?? 500);
    setEditKuotaPegawai(item.kuotaPegawaiMax ?? 500);
    setEditFiturSpp(item.fiturSppKeuangan ?? (item.paket === 'Premium'));
    setEditFiturDisiplin(item.fiturPerizinanDisiplin ?? (item.paket === 'Premium'));
    setEditFiturBranding(item.fiturCustomBranding ?? (item.paket === 'Premium'));
    setEditFiturReward(item.fiturRewardPelanggaran ?? (item.paket === 'Premium'));
  };

  const simpanPengaturanLisensi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPesantren) return;

    const updatedItem: DataProspekLembaga = {
      ...selectedPesantren,
      kuotaSantriMax: editKuotaSantri,
      kuotaPegawaiMax: editKuotaPegawai,
      fiturSppKeuangan: editFiturSpp,
      fiturPerizinanDisiplin: editFiturDisiplin,
      fiturCustomBranding: editFiturBranding,
      fiturRewardPelanggaran: editFiturReward,
    };

    try {
      await supabase
        .from('yayasan')
        .update({
          kuota_santri_max: editKuotaSantri,
          kuota_pegawai_max: editKuotaPegawai,
          fitur_spp_keuangan: editFiturSpp,
          fitur_perizinan_disiplin: editFiturDisiplin,
          fitur_custom_branding: editFiturBranding,
          fitur_reward_pelanggaran: editFiturReward,
        })
        .eq('id', selectedPesantren.id);
    } catch {
      // offline fallback
    }

    const diperbarui = daftarProspek.map((p) =>
      p.id === selectedPesantren.id ? updatedItem : p
    );

    setDaftarProspek(diperbarui);
    localStorage.setItem(STORAGE_KEY_PROSPEK, JSON.stringify(diperbarui));
    setSelectedPesantren(null);
    alert(`✅ Fitur & Kuota khusus untuk ${selectedPesantren.namaYayasan} berhasil diperbarui!`);
  };

  const simpanPesantrenBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaYayasan.trim()) {
      alert('Nama Pesantren / Yayasan tidak boleh kosong.');
      return;
    }

    const itemBaru: DataProspekLembaga = {
      id: `pesantren-${Date.now()}`,
      namaYayasan: formNamaYayasan,
      namaPenanggungJawab: formNamaPenanggungJawab || '-',
      jabatanPenanggungJawab: formJabatan || 'Pimpinan Pesantren',
      noHp: formNoHp || '-',
      email: formEmail || '-',
      alamat: formAlamat || '-',
      perkiraanJumlahSantri: formJumlahSantri || '-',
      sumberInformasi: 'Input Portal Admin',
      paket: formPaket,
      createdAt: new Date().toISOString(),
      kuotaSantriMax: 500,
      kuotaPegawaiMax: 500,
      fiturSppKeuangan: formPaket === 'Premium',
      fiturPerizinanDisiplin: formPaket === 'Premium',
      fiturCustomBranding: formPaket === 'Premium',
      fiturRewardPelanggaran: formPaket === 'Premium',
    };

    try {
      await supabase.from('yayasan').insert([
        {
          id: itemBaru.id,
          nama_yayasan: itemBaru.namaYayasan,
          nama_penanggung_jawab: itemBaru.namaPenanggungJawab,
          jabatan_penanggung_jawab: itemBaru.jabatanPenanggungJawab,
          no_hp: itemBaru.noHp,
          email: itemBaru.email,
          alamat: itemBaru.alamat,
          perkiraan_jumlah_santri: itemBaru.perkiraanJumlahSantri,
          sumber_informasi: itemBaru.sumberInformasi,
          paket: itemBaru.paket,
        },
      ]);
    } catch {
      // offline fallback
    }

    const dipetakan = [itemBaru, ...daftarProspek];
    setDaftarProspek(dipetakan);
    localStorage.setItem(STORAGE_KEY_PROSPEK, JSON.stringify(dipetakan));

    setFormNamaYayasan('');
    setFormNamaPenanggungJawab('');
    setFormNoHp('');
    setFormEmail('');
    setFormAlamat('');
    setShowModalTambah(false);
    alert('✅ Data Pesantren berhasil disimpan!');
  };

  const ubahStatusPaket = async (id: string, paketBaru: 'Prospek' | 'Gratis' | 'Premium') => {
    const isPrem = paketBaru === 'Premium';
    const diperbarui = daftarProspek.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          paket: paketBaru,
          fiturSppKeuangan: isPrem ? true : p.fiturSppKeuangan,
          fiturPerizinanDisiplin: isPrem ? true : p.fiturPerizinanDisiplin,
          fiturCustomBranding: isPrem ? true : p.fiturCustomBranding,
          fiturRewardPelanggaran: isPrem ? true : p.fiturRewardPelanggaran,
        };
      }
      return p;
    });

    try {
      await supabase
        .from('yayasan')
        .update({ paket: paketBaru })
        .eq('id', id);
    } catch {
      // Offline fallback
    }

    setDaftarProspek(diperbarui);
    localStorage.setItem(STORAGE_KEY_PROSPEK, JSON.stringify(diperbarui));
  };

  const hapusItem = (id: string) => {
    if (!confirm('Yakin ingin menghapus data pesantren ini?')) return;
    const sisa = daftarProspek.filter((p) => p.id !== id);
    setDaftarProspek(sisa);
    localStorage.setItem(STORAGE_KEY_PROSPEK, JSON.stringify(sisa));
  };

  const hubungiWhatsApp = (prospek: DataProspekLembaga) => {
    const pesan = [
      `Assalamu'alaikum Warahmatullahi Wabarakatuh,`,
      ``,
      `Yth. Bapak/Ibu *${prospek.namaPenanggungJawab}* (${prospek.jabatanPenanggungJawab})`,
      `Dari *${prospek.namaYayasan}*`,
      ``,
      `Terima kasih telah melakukan pendaftaran di *KabarSantri*. Saya dari Tim pengelola KabarSantri ingin membantu koordinasi lisensi fitur & kuota kebutuhan pesantren Anda.`,
      ``,
      `Apakah ada waktu untuk kita berdiskusi sejenak?`,
      ``,
      `Terima kasih.`,
      `Wassalam,`,
      `*Tim Operations KabarSantri*`,
    ].join('\n');

    openDirectWA(prospek.noHp, pesan);
  };

  const filtered = daftarProspek.filter((p) => {
    const matchFilter = filterPaket === 'Semua' || p.paket === filterPaket;
    const matchCari =
      !cariKata ||
      p.namaYayasan.toLowerCase().includes(cariKata.toLowerCase()) ||
      p.namaPenanggungJawab.toLowerCase().includes(cariKata.toLowerCase()) ||
      p.alamat.toLowerCase().includes(cariKata.toLowerCase());
    return matchFilter && matchCari;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      {/* Header Banner Super Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-blue-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#0A4ABF] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full border border-blue-400/30 tracking-wider">
              👑 PORTAL SUPER ADMIN PUSAT (INTERNAL)
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/20">
              Pengelola Pusat
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Kelola Fitur Modular (4 Jenis) & Kuota (500 / 1000 Orang)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Aktifkan fitur yang dipesan pesantren (SPP, Perizinan, Custom Logo, atau Karakter/Reward) & set batas kuota 500/1000 orang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowModalTambah(true)}
            className="bg-[#0A4ABF] hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5"
          >
            <span>➕</span> Input Data Pesantren Baru
          </button>

          {onKembali && (
            <button
              onClick={onKembali}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md border border-white/20 transition active:scale-95"
            >
              ← Kembali
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cari Nama Pesantren / Pimpinan / Alamat</label>
          <input
            type="text"
            placeholder="🔍 Cari nama pesantren, pimpinan, atau kota..."
            value={cariKata}
            onChange={(e) => setCariKata(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Filter Paket Lisensi</label>
          <select
            value={filterPaket}
            onChange={(e) => setFilterPaket(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none bg-white font-medium"
          >
            <option value="Semua">Semua Paket</option>
            <option value="Prospek">📝 Prospek Baru</option>
            <option value="Gratis">🏫 Paket Gratis</option>
            <option value="Premium">👑 Paket Custom/Premium</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Pesantren</th>
                <th className="p-4 px-6">Pimpinan & WA</th>
                <th className="p-4 px-6">Kuota Lisensi (500/1000)</th>
                <th className="p-4 px-6">Status Fitur Modular (4 Jenis)</th>
                <th className="p-4 px-6">Paket Lisensi</th>
                <th className="p-4 px-6 text-right">Aksi Kelola</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {memuat ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400 font-medium">
                    Memuat data pesantren...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400">
                    <p className="font-bold text-slate-700">Belum ada data pesantren terdaftar.</p>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol "➕ Input Data Pesantren Baru" di atas untuk memasukkan data 3 Pesantren kamu.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 px-6">
                      <div className="font-black text-slate-900 text-sm">{row.namaYayasan}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">📍 {row.alamat}</div>
                    </td>

                    <td className="p-4 px-6">
                      <div className="font-bold text-slate-800">{row.namaPenanggungJawab}</div>
                      <div className="text-emerald-700 font-mono font-bold mt-0.5">{row.noHp}</div>
                    </td>

                    {/* Kuota 500 / 1000 */}
                    <td className="p-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                        <span>👥 Santri:</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-900 font-bold border">
                          {row.kuotaSantriMax && row.kuotaSantriMax >= 99999 ? 'Unlimited' : `${row.kuotaSantriMax || 500} Orang`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                        <span>👨‍🏫 Staf:</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-900 font-bold border">
                          {row.kuotaPegawaiMax && row.kuotaPegawaiMax >= 99999 ? 'Unlimited' : `${row.kuotaPegawaiMax || 500} Orang`}
                        </span>
                      </div>
                    </td>

                    {/* Fitur Modular 4 Jenis */}
                    <td className="p-4 px-6 space-y-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={row.fiturSppKeuangan ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {row.fiturSppKeuangan ? '✅' : '🔒'} 1. SPP Keuangan
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={row.fiturPerizinanDisiplin ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {row.fiturPerizinanDisiplin ? '✅' : '🔒'} 2. Perizinan Pulang
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={row.fiturCustomBranding ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {row.fiturCustomBranding ? '✅' : '🔒'} 3. Custom Logo Branding
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={row.fiturRewardPelanggaran ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {row.fiturRewardPelanggaran ? '✅' : '🔒'} 4. Karakter, Reward & Pelanggaran
                        </span>
                      </div>
                    </td>

                    <td className="p-4 px-6">
                      <select
                        value={row.paket}
                        onChange={(e) => ubahStatusPaket(row.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                          row.paket === 'Premium'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : row.paket === 'Gratis'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        <option value="Prospek">📝 Prospek</option>
                        <option value="Gratis">🏫 Basic Gratis</option>
                        <option value="Premium">👑 Custom Premium</option>
                      </select>
                    </td>

                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => bukaModalPengaturanLisensi(row)}
                          className="bg-[#0A4ABF] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition active:scale-95 flex items-center gap-1"
                          title="Atur Kuota (500/1000) & Fitur Modular Pesantren Ini"
                        >
                          <span>⚙️</span> Atur Fitur
                        </button>

                        <button
                          onClick={() => hubungiWhatsApp(row)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition active:scale-95 flex items-center gap-1"
                        >
                          <span>💬</span> WA
                        </button>

                        <button
                          onClick={() => hapusItem(row.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg text-xs"
                          title="Hapus Pesantren"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Fitur Modular (4 Jenis) & Kuota (500 / 1000) */}
      {selectedPesantren && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 font-sans">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-[#0A4ABF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Pengaturan Lisensi Pesantren
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  ⚙️ Atur Kuota (500/1000) & Fitur Modular (4 Jenis)
                </h2>
                <p className="text-xs font-bold text-slate-600">{selectedPesantren.namaYayasan}</p>
              </div>
              <button
                onClick={() => setSelectedPesantren(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={simpanPengaturanLisensi} className="space-y-5 text-xs">
              {/* Sección 1: Kuota (Khusus 500 dan 1000 Orang) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <span>📊</span> 1. ATUR PENAMBAHAN KUOTA (KHUSUS 500 & 1.000 ORANG)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kuota Kapasitas Santri</label>
                    <select
                      value={editKuotaSantri}
                      onChange={(e) => setEditKuotaSantri(Number(e.target.value))}
                      className="w-full border rounded-xl px-3 py-2 bg-white font-bold text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                    >
                      <option value={500}>500 Orang / Santri</option>
                      <option value={1000}>1.000 Orang / Santri</option>
                      <option value={99999}>Unlimited (Tanpa Batas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kuota Kapasitas Staf/Pegawai</label>
                    <select
                      value={editKuotaPegawai}
                      onChange={(e) => setEditKuotaPegawai(Number(e.target.value))}
                      className="w-full border rounded-xl px-3 py-2 bg-white font-bold text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                    >
                      <option value={500}>500 Orang / Staf</option>
                      <option value={1000}>1.000 Orang / Staf</option>
                      <option value={99999}>Unlimited (Tanpa Batas)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2: Fitur Modular Spesifik (4 Jenis Fitur) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <span>🧩</span> 2. PILIHAN FITUR MODULAR (4 JENIS FITUR)
                </h3>
                <p className="text-[11px] text-slate-500">Centang hanya fitur yang dibutuhkan oleh pesantren ini:</p>

                <div className="space-y-2.5">
                  <label className="flex items-start gap-3 p-2.5 rounded-xl border bg-white cursor-pointer hover:bg-blue-50/50 transition">
                    <input
                      type="checkbox"
                      checked={editFiturSpp}
                      onChange={(e) => setEditFiturSpp(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0A4ABF] rounded focus:ring-[#0A4ABF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900">💳 Fitur 1: Pembayaran SPP & Validasi Bukti Transfer</div>
                      <div className="text-[11px] text-slate-500">Modul pengelolaan tagihan SPP, tabungan, & validasi transfer wali santri.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border bg-white cursor-pointer hover:bg-blue-50/50 transition">
                    <input
                      type="checkbox"
                      checked={editFiturDisiplin}
                      onChange={(e) => setEditFiturDisiplin(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0A4ABF] rounded focus:ring-[#0A4ABF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900">🚪 Fitur 2: Perizinan Pulang Santri</div>
                      <div className="text-[11px] text-slate-500">Modul perizinan keluar-masuk santri oleh Musyrif & pengurus kesantrian.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border bg-white cursor-pointer hover:bg-blue-50/50 transition">
                    <input
                      type="checkbox"
                      checked={editFiturBranding}
                      onChange={(e) => setEditFiturBranding(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0A4ABF] rounded focus:ring-[#0A4ABF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900">🎨 Fitur 3: Custom Logo Pesantren & White-Label Branding</div>
                      <div className="text-[11px] text-slate-500">Modul mengganti logo KabarSantri dengan Logo Resmi Pesantren & alamat kop surat.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border bg-white cursor-pointer hover:bg-blue-50/50 transition">
                    <input
                      type="checkbox"
                      checked={editFiturReward}
                      onChange={(e) => setEditFiturReward(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0A4ABF] rounded focus:ring-[#0A4ABF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900">⭐ Fitur 4: Karakter, Reward & Catatan Pelanggaran Santri</div>
                      <div className="text-[11px] text-slate-500">Modul pencatatan poin akhlak, reward kebaikan, & rekap pelanggaran disiplin santri.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPesantren(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#0A4ABF] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
                >
                  💾 Simpan Lisensi & Kuota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Data Pesantren Baru */}
      {showModalTambah && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 font-sans">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-black text-slate-900">
                ➕ Input Data Pesantren Pendaftar Baru
              </h2>
              <button
                onClick={() => setShowModalTambah(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={simpanPesantrenBaru} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Yayasan / Pondok Pesantren *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pondok Pesantren Darut Tauhid"
                  value={formNamaYayasan}
                  onChange={(e) => setFormNamaYayasan(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2 font-bold focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Pimpinan / Pengasuh</label>
                  <input
                    type="text"
                    placeholder="KH. Abdullah Gymnastiar"
                    value={formNamaPenanggungJawab}
                    onChange={(e) => setFormNamaPenanggungJawab(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan</label>
                  <input
                    type="text"
                    placeholder="Pengasuh Pesantren"
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formNoHp}
                    onChange={(e) => setFormNoHp(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2 font-mono focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Lembaga</label>
                  <input
                    type="email"
                    placeholder="admin@pesantren.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2 font-mono focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Pesantren</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Gegerkalong Girang No. 38, Bandung"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalTambah(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#0A4ABF] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow transition"
                >
                  💾 Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
