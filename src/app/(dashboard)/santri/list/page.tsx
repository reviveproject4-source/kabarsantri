'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  GraduationCap, 
  Building2, 
  Phone, 
  MoreVertical, 
  CheckCircle2, 
  FileText,
  UserPlus
} from 'lucide-react';

export default function DataIndukSantriPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('semua');

  const santriList = [
    {
      id: 's-1',
      nis: '202601001',
      nama: 'Muhammad Al-Fatih',
      gender: 'Laki-laki',
      kelas: '7A Tahfidz Sains',
      asrama: 'Gedung Abu Bakar - Kamar 101',
      wali: 'H. Syamsul Bahri',
      no_hp_wali: '081234567890',
      status: 'Aktif',
      hafalan: '2.5 Juz',
    },
    {
      id: 's-2',
      nis: '202602004',
      nama: 'Fathimah Az-Zahra',
      gender: 'Perempuan',
      kelas: '7B Tahfidz Sains',
      asrama: 'Gedung Khadijah - Kamar 201',
      wali: 'Hj. Siti Aminah',
      no_hp_wali: '081298765432',
      status: 'Aktif',
      hafalan: '3.0 Juz',
    },
    {
      id: 's-3',
      nis: '202601015',
      nama: 'Ahmad Zaki Mubarak',
      gender: 'Laki-laki',
      kelas: '8A Unggulan',
      asrama: 'Gedung Abu Bakar - Kamar 102',
      wali: 'Dr. Hendra Gunawan',
      no_hp_wali: '081345678901',
      status: 'Aktif',
      hafalan: '5.2 Juz',
    },
    {
      id: 's-4',
      nis: '202601018',
      nama: 'Bilal Habasyi',
      gender: 'Laki-laki',
      kelas: '8B Unggulan',
      asrama: 'Gedung Umar bin Khattab - Kamar 105',
      wali: 'Ust. Zaid',
      no_hp_wali: '081387654321',
      status: 'Aktif',
      hafalan: '4.8 Juz',
    },
    {
      id: 's-5',
      nis: '202601021',
      nama: 'Fatih Al-Ayyubi',
      gender: 'Laki-laki',
      kelas: '9 Putra',
      asrama: 'Gedung Utsman - Kamar 301',
      wali: 'H. Ridwan',
      no_hp_wali: '081223344556',
      status: 'Aktif',
      hafalan: '10.5 Juz',
    },
  ];

  const filtered = santriList.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
    const matchKelas = filterKelas === 'semua' || s.kelas.includes(filterKelas);
    return matchSearch && matchKelas;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Induk Santri (Master Kesiswaan)</h1>
          <p className="text-xs text-slate-500">Pangkalan Data Profil, Riwayat Akademik, Penempatan Asrama, dan Data Wali Santri</p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/santri/assign-kelas"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition flex items-center space-x-1.5"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Plotting Kelas & Kamar</span>
          </Link>
          <Link
            href="/santri/create"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Santri Baru</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari santri berdasarkan nama atau NIS..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-500 font-semibold whitespace-nowrap">Filter Tingkat:</span>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
          >
            <option value="semua">Semua Tingkat</option>
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
          </select>
        </div>
      </div>

      {/* Table Data Induk */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Daftar Santri Terdaftar ({filtered.length} Santri)</h3>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
            Terhubung RLS Multi-Tenant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Kelas &amp; Rombel</th>
                <th className="py-3 px-4">Penempatan Asrama</th>
                <th className="py-3 px-4">Wali Santri</th>
                <th className="py-3 px-4">Capaian Tahfidz</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{s.nis}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{s.nama}</span>
                    <span className="text-[10px] text-slate-400">{s.gender}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px]">
                      {s.kelas}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{s.asrama}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 block">{s.wali}</span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{s.no_hp_wali}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{s.hafalan}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
