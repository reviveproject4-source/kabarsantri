'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Settings, 
  AlertTriangle, 
  Building2, 
  Receipt,
  Check,
  X,
  ArrowRight,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { 
  getSharedPengajuanList, 
  updatePengajuanStatus, 
  saveSharedPengajuan, 
  getSharedThresholds,
  PengajuanItem,
  DEFAULT_THRESHOLDS 
} from '@/lib/sharedDataStore';

export default function PengeluaranApprovalPage() {
  const [activeTab, setActiveTab] = useState<'pengajuan' | 'input_manual'>('pengajuan');
  const [modalInputManual, setModalInputManual] = useState(false);
  const [notif, setNotif] = useState('');

  // Threshold Dinamis Tenant dari Shared Store (SSR Safe)
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

  // Daftar Pengajuan Kebutuhan dari Rumah Tangga & Mudir (Live Shared Data)
  const [pengajuanList, setPengajuanList] = useState<PengajuanItem[]>([]);

  // Form state input manual pengeluaran oleh keuangan
  const [formDataManual, setFormDataManual] = useState({
    penerima: '',
    kategori: 'Listrik & Air PLN',
    nominal: 1250000,
    keterangan: '',
  });

  // Sinkronisasi dengan Shared Store
  useEffect(() => {
    setPengajuanList(getSharedPengajuanList());
    setThresholds(getSharedThresholds());

    const handleUpdate = () => {
      setPengajuanList(getSharedPengajuanList());
      setThresholds(getSharedThresholds());
    };

    window.addEventListener('ks_expense_updated', handleUpdate);
    window.addEventListener('ks_threshold_updated', handleUpdate);

    return () => {
      window.removeEventListener('ks_expense_updated', handleUpdate);
      window.removeEventListener('ks_threshold_updated', handleUpdate);
    };
  }, []);

  const handleAccKeuangan = (id: string, nominal: number, divisi: string) => {
    const isMudir = divisi === 'Mudir KBM';
    const maxLimit = isMudir ? thresholds.max_keuangan_kbm_mudir : thresholds.max_keuangan_rumah_tangga;

    if (nominal > maxLimit) {
      alert(`Pemberitahuan: Nominal Rp ${nominal.toLocaleString('id-ID')} melampaui batas kewenangan Keuangan (Rp ${maxLimit.toLocaleString('id-ID')}). Pengajuan ini diteruskan ke Wakil Ketua & Ketua Yayasan untuk persetujuan.`);
      updatePengajuanStatus(id, 'MENUNGGU_WAKIL_YAYASAN', 'Menunggu Persetujuan Yayasan');
      return;
    }

    updatePengajuanStatus(id, 'DISETUJUI', 'Telah di-ACC Bagian Keuangan');
    setNotif(`✓ Pengeluaran sebesar Rp ${nominal.toLocaleString('id-ID')} berhasil disetujui (ACC) oleh Bagian Keuangan!`);
    setTimeout(() => setNotif(''), 6000);
  };

  const handleTolakKeuangan = (id: string) => {
    updatePengajuanStatus(id, 'DITOLAK', 'Ditolak oleh Bagian Keuangan');
    setNotif('⚠️ Pengajuan pengeluaran telah ditolak.');
    setTimeout(() => setNotif(''), 5000);
  };

  const handleSimpanManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalInputManual(false);

    saveSharedPengajuan({
      divisi: 'Mudir KBM',
      pemohon: formDataManual.penerima || 'Bagian Keuangan',
      judul: `[Input Manual Keuangan] ${formDataManual.kategori}`,
      nominal: Number(formDataManual.nominal),
      status: 'DISETUJUI',
      level_approval: 'Input Langsung Kasir Keuangan (Sah)',
      deskripsi: formDataManual.keterangan || formDataManual.kategori,
    });

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('pengeluaran_pengajuan').insert({
        nomor_pengajuan: `MNL-${Date.now().toString().slice(-6)}`,
        divisi_pemohon: 'keuangan',
        judul_keperluan: `[Input Manual] ${formDataManual.kategori} - ${formDataManual.penerima}`,
        deskripsi_rincian: formDataManual.keterangan,
        nominal_diajukan: Number(formDataManual.nominal),
        target_approval_level: 'keuangan_only',
        status: 'disetujui',
      });
    } catch (err) {
      console.warn('Supabase expense manual sync notice:', err);
    }

    setNotif(`✓ Pengeluaran manual kategori "${formDataManual.kategori}" sebesar Rp ${Number(formDataManual.nominal).toLocaleString('id-ID')} berhasil dicatat ke buku kas!`);
    setFormDataManual({ penerima: '', kategori: 'Listrik & Air PLN', nominal: 1250000, keterangan: '' });
    setTimeout(() => setNotif(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600 uppercase">
            Kasir & Perbendaharaan
          </span>
          <h1 className="text-xl font-bold mt-2">Persetujuan & Pengeluaran Dana Pesantren</h1>
          <p className="text-xs text-slate-300 mt-1">
            Validasi pengajuan dana Rumah Tangga (Dapur, Laundry, Satpam) & KBM Mudir, serta Input Manual Kasir
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Tombol Kebijakan Batas Mandiri */}
          <Link
            href="/finance/pengaturan-threshold"
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
            title="Lihat Kebijakan Batas Nominal Pengeluaran (Read-Only bagi Keuangan)"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Kebijakan Batas Pengeluaran (Read-Only)</span>
          </Link>

          {/* Tombol Input Manual Keuangan */}
          <button
            onClick={() => setModalInputManual(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Pengeluaran Manual</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{notif}</span>
        </div>
      )}

      {/* Ringkasan Matriks Batas Persetujuan (Threshold) Aktif */}
      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Rumah Tangga (Dapur/Laundry/Satpam)</span>
          <div className="text-lg font-bold font-mono text-emerald-700">
            &lt; Rp {thresholds.max_keuangan_rumah_tangga.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-600">
            Bisa di-ACC langsung oleh Bagian Keuangan tanpa menunggu pimpinan yayasan.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">KBM Kepala Sekolah (Mudir)</span>
          <div className="text-lg font-bold font-mono text-blue-700">
            &lt; Rp {thresholds.max_keuangan_kbm_mudir.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-600">
            Pengadaan modul & KBM Mudir bisa di-ACC langsung oleh Keuangan.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Eskalasi Pimpinan Yayasan</span>
          <div className="text-lg font-bold font-mono text-amber-600">
            &gt; Rp {thresholds.min_yayasan_approval.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-600">
            Wajib notifikasi dan persetujuan dari Wakil Ketua & Ketua Yayasan.
          </p>
        </div>
      </div>

      {/* Tabel Live Daftar Pengajuan Dana */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Daftar Pengajuan Dana Masuk (Live Shared Data)</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Setiap pengajuan baru dari Rumah Tangga atau Mudir langsung tampil secara otomatis di sini
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            {pengajuanList.length} Pengajuan Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">No. Pengajuan</th>
                <th className="p-3">Divisi & Pemohon</th>
                <th className="p-3">Judul Pengeluaran</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Level Persetujuan</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi Keuangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pengajuanList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Receipt className="w-8 h-8 text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700">Belum ada pengajuan dana</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Pengajuan dana baru dari divisi operasional atau akademik akan langsung muncul di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pengajuanList.map((item) => {
                const isMudir = item.divisi === 'Mudir KBM';
                const maxDirectAcc = isMudir ? thresholds.max_keuangan_kbm_mudir : thresholds.max_keuangan_rumah_tangga;
                const canDirectAcc = item.nominal <= maxDirectAcc;

                return (
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
                          ✓ Disetujui
                        </span>
                      ) : item.status === 'MENUNGGU_KEUANGAN' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                          Menunggu ACC Keuangan
                        </span>
                      ) : item.status === 'DITOLAK' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                          Ditolak
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                          Menunggu Yayasan
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {item.status === 'DISETUJUI' ? (
                        <span className="text-[11px] text-emerald-600 font-bold">Siap Dicairkan</span>
                      ) : item.status === 'DITOLAK' ? (
                        <span className="text-[11px] text-rose-500">Dibatalkan</span>
                      ) : (
                        <div className="flex items-center justify-center space-x-1.5">
                          {canDirectAcc ? (
                            <button
                              onClick={() => handleAccKeuangan(item.id, item.nominal, item.divisi)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition text-[11px] flex items-center space-x-1"
                              title="Setujui langsung (Sesuai batas threshold)"
                            >
                              <Check className="w-3 h-3" />
                              <span>ACC Langsung</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAccKeuangan(item.id, item.nominal, item.divisi)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs transition text-[11px] flex items-center space-x-1"
                              title="Nominal besar (> threshold), teruskan ke Yayasan"
                            >
                              <span>Teruskan Yayasan</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleTolakKeuangan(item.id)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 transition"
                            title="Tolak Pengajuan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Pengeluaran Manual oleh Keuangan */}
      {modalInputManual && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Input Manual Pengeluaran Kasir</h3>
                <p className="text-xs text-slate-500">Pencatatan langsung beban operasional & utilitas pondok</p>
              </div>
              <button onClick={() => setModalInputManual(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanManual} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={formDataManual.kategori}
                  onChange={(e) => setFormDataManual({ ...formDataManual, kategori: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Listrik & Air PLN">Listrik & Air PLN Kampus</option>
                  <option value="Internet Wifi & Kuota">Internet Dedicated Fiber & Wifi</option>
                  <option value="Bahan Bakar & Kendaraan">BBM & Perawatan Mobil Operasional</option>
                  <option value="ATK & Percetakan KBM">ATK Kantor & Fotokopi Ujian</option>
                  <option value="Kesehatan Santri & Obat">Obat-Obatan Poskestren</option>
                  <option value="Honor Narasumber Tamu">Honor Kajian & Asatidz Tamu</option>
                  <option value="Lainnya">Pengeluaran Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pihak Penerima / Vendor</label>
                <input
                  type="text"
                  required
                  value={formDataManual.penerima}
                  onChange={(e) => setFormDataManual({ ...formDataManual, penerima: e.target.value })}
                  placeholder="Contoh: PT PLN (Persero) / Toko Barokah ATK"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Pengeluaran (Rp)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={formDataManual.nominal}
                  onChange={(e) => setFormDataManual({ ...formDataManual, nominal: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Bukti Nota Fisik</label>
                <textarea
                  rows={2}
                  value={formDataManual.keterangan}
                  onChange={(e) => setFormDataManual({ ...formDataManual, keterangan: e.target.value })}
                  placeholder="Nomor struk, bukti nota kwitansi, atau rincian transaksi..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalInputManual(false)}
                  className="flex-1 py-2.5 font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
                >
                  Simpan Pengeluaran Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
