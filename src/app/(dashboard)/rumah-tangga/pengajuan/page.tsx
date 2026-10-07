'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck, 
  Utensils, 
  Shirt, 
  Shield, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  getSharedPengajuanList, 
  saveSharedPengajuan, 
  getSharedThresholds,
  PengajuanItem,
  DEFAULT_THRESHOLDS
} from '@/lib/sharedDataStore';
import { useActiveActor } from '@/lib/sessionStore';

export default function PengajuanRumahTanggaPage() {
  const activeActor = useActiveActor();
  const isKaBid = activeActor.role_key === 'kepala_rumah_tangga' || 
                  activeActor.role_key === 'keuangan' || 
                  activeActor.role_key === 'wakil_yayasan' || 
                  activeActor.role_key === 'yayasan';

  const [modalOpen, setModalOpen] = useState(false);
  const [notif, setNotif] = useState('');

  const [divisi, setDivisi] = useState<'Dapur' | 'Laundry' | 'Keamanan'>('Dapur');
  const [pemohon, setPemohon] = useState('Pak Maryono (Koki Dapur)');
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState(750000);
  const [deskripsi, setDeskripsi] = useState('');

  const [pengajuanHistory, setPengajuanHistory] = useState<PengajuanItem[]>([]);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

  // Sinkronisasi dengan Shared Store
  useEffect(() => {
    setPengajuanHistory(getSharedPengajuanList());
    setThresholds(getSharedThresholds());

    const handleUpdate = () => {
      setPengajuanHistory(getSharedPengajuanList());
      setThresholds(getSharedThresholds());
    };

    window.addEventListener('ks_expense_updated', handleUpdate);
    window.addEventListener('ks_threshold_updated', handleUpdate);

    return () => {
      window.removeEventListener('ks_expense_updated', handleUpdate);
      window.removeEventListener('ks_threshold_updated', handleUpdate);
    };
  }, []);

  const handleDivisiChange = (newDivisi: 'Dapur' | 'Laundry' | 'Keamanan') => {
    setDivisi(newDivisi);
    if (newDivisi === 'Dapur') setPemohon('Pak Maryono (Koki Dapur)');
    else if (newDivisi === 'Laundry') setPemohon('Ibu Sumiati (Koordinator Laundry)');
    else setPemohon('Pak Subandi (Danru Satpam)');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);

    let levelText = `Cukup Bagian Keuangan (< Rp ${(thresholds.max_keuangan_rumah_tangga / 1000000).toFixed(0)} Jt)`;
    let targetStatus: PengajuanItem['status'] = 'MENUNGGU_KEUANGAN';

    if (nominal >= thresholds.min_yayasan_approval) {
      levelText = `Wajib ACC Wakil & Ketua Yayasan (> Rp ${(thresholds.min_yayasan_approval / 1000000).toFixed(0)} Jt)`;
      targetStatus = 'MENUNGGU_WAKIL_YAYASAN';
    } else if (nominal >= thresholds.max_keuangan_rumah_tangga) {
      levelText = 'Butuh ACC Keuangan & Notif Wakil Ketua Yayasan';
      targetStatus = 'MENUNGGU_WAKIL_YAYASAN';
    }

    // Simpan ke Shared Store (Tersinkronisasi otomatis ke Halaman Keuangan & Yayasan)
    const saved = saveSharedPengajuan({
      divisi,
      pemohon,
      judul,
      nominal: Number(nominal),
      status: targetStatus,
      level_approval: levelText,
      deskripsi: deskripsi || judul,
    });

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('pengeluaran_pengajuan').insert({
        nomor_pengajuan: saved.nomor,
        divisi_pemohon: divisi.toLowerCase(),
        judul_keperluan: judul,
        deskripsi_rincian: deskripsi || judul,
        nominal_diajukan: Number(nominal),
        target_approval_level: targetStatus,
        status: targetStatus.toLowerCase(),
      });
    } catch (err) {
      console.warn('Supabase pengajuan sync notice:', err);
    }

    setNotif(`✓ Permohonan dana divisi ${divisi} sebesar Rp ${Number(nominal).toLocaleString('id-ID')} BERHASIL DIAJUKAN dan LANGSUNG TERDAFTAR di Bagian Keuangan!`);
    setJudul('');
    setDeskripsi('');
    setTimeout(() => setNotif(''), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 uppercase">
            Operasional Logistik & Akomodasi
          </span>
          <h1 className="text-xl font-bold mt-2">Bagian Rumah Tangga Pesantren</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Pengajuan Kebutuhan Logistik: Divisi Dapur Santri, Laundry Asrama, dan Satpam/Keamanan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/rumah-tangga"
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Hub Fasilitas & Gudang RT</span>
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition inline-flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Permohonan Kebutuhan Dana</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start space-x-2.5 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="leading-relaxed font-bold">{notif}</span>
            <div className="text-[11px] text-emerald-700">
              Antum dapat memeriksa daftar pengajuan ini langsung di halaman{' '}
              <Link href="/finance/pengeluaran" className="underline font-bold hover:text-emerald-950">
                Keuangan & Pengeluaran ➔
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3 Divisi Rumah Tangga Card Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div 
          onClick={() => { handleDivisiChange('Dapur'); setModalOpen(true); }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 cursor-pointer hover:border-emerald-500 hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Divisi Dapur Santri</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Beras, lauk, bumbu, & gas LPG</p>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">+ Ajukan Kebutuhan</span>
          </div>
        </div>

        <div 
          onClick={() => { handleDivisiChange('Laundry'); setModalOpen(true); }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 cursor-pointer hover:border-emerald-500 hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Divisi Laundry Asrama</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Deterjen matic, pewangi & mesin</p>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">+ Ajukan Kebutuhan</span>
          </div>
        </div>

        <div 
          onClick={() => { handleDivisiChange('Keamanan'); setModalOpen(true); }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 cursor-pointer hover:border-emerald-500 hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Divisi Keamanan / Satpam</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">HT, senter, CCTV & seragam</p>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">+ Ajukan Kebutuhan</span>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Pengajuan Rumah Tangga */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Pengajuan Kebutuhan Rumah Tangga</span>
          </h2>
          {isKaBid && (
            <Link
              href="/finance/pengeluaran"
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Buka Dashboard Approval Keuangan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">No. Pengajuan</th>
                <th className="p-3">Divisi & Pemohon</th>
                <th className="p-3">Judul Keperluan</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Tingkat Persetujuan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pengajuanHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                    {item.nomor}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-800">{item.divisi}</span>
                    <div className="text-[10px] text-slate-500">{item.pemohon}</div>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-medium text-slate-800">{item.judul}</div>
                    {item.deskripsi && (
                      <div className="text-[10px] text-slate-400 truncate">{item.deskripsi}</div>
                    )}
                  </td>
                  <td className="p-3 font-bold font-mono text-emerald-700">
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-[11px] text-slate-600">
                    {item.level_approval}
                  </td>
                  <td className="p-3">
                    {item.status === 'DISETUJUI' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Disetujui
                      </span>
                    ) : item.status === 'MENUNGGU_KEUANGAN' ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                        Menunggu Keuangan
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                        Menunggu Yayasan
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {item.tanggal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengajuan Kebutuhan */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Formulir Pengajuan Kebutuhan Dana</h3>
                <p className="text-xs text-slate-500">Akan langsung diteruskan ke Bagian Keuangan</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Divisi Pemohon</label>
                <select
                  value={divisi}
                  onChange={(e) => handleDivisiChange(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Dapur">Divisi Dapur Santri</option>
                  <option value="Laundry">Divisi Laundry Asrama</option>
                  <option value="Keamanan">Divisi Keamanan / Satpam</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pemohon (PIC)</label>
                <input
                  type="text"
                  required
                  value={pemohon}
                  onChange={(e) => setPemohon(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Keperluan / Item</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Belanja Bumbu & Sayuran Pekanan"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal yang Diajukan (Rp)</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={10000}
                  value={nominal}
                  onChange={(e) => setNominal(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  {nominal < thresholds.max_keuangan_rumah_tangga ? (
                    <span className="text-emerald-600 font-semibold">
                      ✓ &lt; Rp {(thresholds.max_keuangan_rumah_tangga / 1000000).toFixed(0)} Jt: Cukup di-ACC Bagian Keuangan
                    </span>
                  ) : nominal < thresholds.min_yayasan_approval ? (
                    <span className="text-blue-600 font-semibold">
                      ℹ Rp {(thresholds.max_keuangan_rumah_tangga / 1000000).toFixed(0)} - {(thresholds.min_yayasan_approval / 1000000).toFixed(0)} Jt: Butuh Notif/ACC Wakil Ketua Yayasan
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold">
                      ⚠️ &gt; Rp {(thresholds.min_yayasan_approval / 1000000).toFixed(0)} Jt: Wajib ACC Wakil Ketua & Ketua Yayasan
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rincian Deskripsi (Opsional)</label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Rincian harga barang, supplier, atau urgensi kebutuhan..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
                >
                  Kirim Pengajuan Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
