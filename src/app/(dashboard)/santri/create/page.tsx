'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Check, ShieldCheck } from 'lucide-react';

export default function TambahSantriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nis: '202601015',
    nisn: '0089283741',
    nama_lengkap: 'Ahmad Zaki Mubarak',
    gender: 'L',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '2012-05-14',
    unit_id: 'unit-mts-putra',
    kamar_id: 'kamar-101',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi penyimpanan master santri + inisialisasi tabungan & uang jajan
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tambah Santri Baru</h1>
            <p className="text-xs text-slate-500">Langkah 1: Pendaftaran Data Pokok Santri & Rekening Otomatis</p>
          </div>
        </div>
      </div>

      {success ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Santri Berhasil Didaftarkan!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Data santri <strong>{formData.nama_lengkap}</strong> (NIS: {formData.nis}) telah aktif.
            Rekening tabungan wadiah dan wallet e-pocket telah diinisialisasi otomatis di latar belakang.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/wali/list"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              Lanjut ke Langkah 2: Hubungkan Wali Santri →
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
            >
              Tambah Santri Lain
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Induk Santri (NIS) *
              </label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN (Kemenag / Kemdikbud)
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Santri *
            </label>
            <input
              type="text"
              required
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kelamin *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="L">Laki-laki (Putra)</option>
                <option value="P">Perempuan (Putri)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit / Lembaga Pendidikan *
              </label>
              <select
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="unit-mts-putra">MTs Tahfidz Sains (Putra)</option>
                <option value="unit-ma-putra">MA Unggulan Al-Qur'an (Putra)</option>
                <option value="unit-pondok-salaf">Pondok Pesantren Salafiyah</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penempatan Kamar Asrama (Point 1)
              </label>
              <select
                value={formData.kamar_id}
                onChange={(e) => setFormData({ ...formData, kamar_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="kamar-101">Kamar 101 - Gedung Abu Bakar (Sisa 3 Ranjang)</option>
                <option value="kamar-102">Kamar 102 - Gedung Abu Bakar (Sisa 1 Ranjang)</option>
                <option value="kamar-201">Kamar 201 - Gedung Umar bin Khattab (Tersedia)</option>
              </select>
            </div>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Data dilindungi RLS tenant_id dan otomatis tercatat di audit log.</span>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-2 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Data Santri'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
