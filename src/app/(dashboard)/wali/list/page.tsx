'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  KeyRound, 
  RefreshCw, 
  Send, 
  Check, 
  ShieldCheck, 
  UserPlus, 
  Search,
  CheckCircle2
} from 'lucide-react';

export default function WaliSantriManagementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWali, setSelectedWali] = useState<any>(null);
  const [modalType, setModalType] = useState<'create_pin' | 'reset_pin' | 'add_wali'>('create_pin');
  const [pinValue, setPinValue] = useState('123456');
  const [notifSuccess, setNotifSuccess] = useState('');

  // Mock list wali santri
  const [waliList, setWaliList] = useState([
    {
      id: 'w-1',
      nama: 'H. Syamsul Bahri',
      no_whatsapp: '081234567890',
      santri: 'Muhammad Al-Fatih (NIS: 202601001)',
      status_akun: 'Aktif',
      has_pin: true,
    },
    {
      id: 'w-2',
      nama: 'Dr. Hendra Gunawan',
      no_whatsapp: '085298765432',
      santri: 'Ahmad Zaki Mubarak (NIS: 202601015)',
      status_akun: 'Belum Aktif',
      has_pin: false,
    },
    {
      id: 'w-3',
      nama: 'Hj. Siti Aminah',
      no_whatsapp: '081398712345',
      santri: 'Fathimah Az-Zahra (NIS: 202602004)',
      status_akun: 'Aktif',
      has_pin: true,
    },
  ]);

  const handleOpenAction = (wali: any, type: 'create_pin' | 'reset_pin') => {
    setSelectedWali(wali);
    setModalType(type);
    // Generate random 6-digit PIN
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPinValue(generatedPin);
    setModalOpen(true);
  };

  const handleConfirmPinAction = () => {
    setModalOpen(false);
    if (modalType === 'create_pin') {
      setWaliList(waliList.map(w => w.id === selectedWali.id ? { ...w, status_akun: 'Aktif', has_pin: true } : w));
      setNotifSuccess(`Akun Wali ${selectedWali.nama} berhasil diaktifkan dengan PIN: ${pinValue}. Pesan konfirmasi telah dimasukkan ke Outbox WhatsApp.`);
    } else {
      setNotifSuccess(`PIN Wali ${selectedWali.nama} berhasil di-reset menjadi: ${pinValue}. Notifikasi WhatsApp terkirim.`);
    }
    setTimeout(() => setNotifSuccess(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Wali Santri & Akun Portal</h1>
          <p className="text-xs text-slate-500">Langkah 4, 5 & 6: Pendaftaran Wali, Aktivasi PIN, dan Reset Akun</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/santri/assign-kelas"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>Lanjut ke Langkah 7: Assign Kelas →</span>
          </Link>
        </div>
      </div>

      {notifSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notifSuccess}</span>
        </div>
      )}

      {/* Table & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama wali, nomor WA, atau nama santri..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {waliList.length} Wali Terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Lengkap Wali</th>
                <th className="py-3 px-4">Nomor WhatsApp</th>
                <th className="py-3 px-4">Santri yang Dihubungkan</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi Akun (PIN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {waliList.map((wali) => (
                <tr key={wali.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800">{wali.nama}</td>
                  <td className="py-3 px-4 font-mono">{wali.no_whatsapp}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {wali.santri}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      wali.status_akun === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {wali.status_akun}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {!wali.has_pin ? (
                      <button
                        onClick={() => handleOpenAction(wali, 'create_pin')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition inline-flex items-center space-x-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Aktivasi Akun (Buat PIN)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenAction(wali, 'reset_pin')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition inline-flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset PIN</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog: Buat / Reset Akun PIN */}
      {modalOpen && selectedWali && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {modalType === 'create_pin' ? 'Buat Akun Wali (Generate PIN)' : 'Reset PIN Wali Santri'}
                </h3>
                <p className="text-xs text-slate-500">{selectedWali.nama}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <label className="text-xs font-semibold text-slate-600">PIN Akses Portal Wali (6 Digit):</label>
              <div className="font-mono text-2xl font-bold tracking-widest text-emerald-700">
                {pinValue}
              </div>
              <p className="text-[11px] text-slate-500">
                PIN ini akan di-hash menggunakan crypt/blowfish sebelum disimpan ke database.
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
              <Send className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>
                Notifikasi kredensial PIN akan otomatis dimasukkan ke antrean <strong>WhatsApp Outbox</strong> menuju nomor <strong>{selectedWali.no_whatsapp}</strong>.
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPinAction}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Konfirmasi & Simpan PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
