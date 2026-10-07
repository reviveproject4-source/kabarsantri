'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, X, ArrowRight, ShieldAlert } from 'lucide-react';

interface LockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
}

export default function LockedFeatureModal({
  isOpen,
  onClose,
  featureTitle = 'Fitur Ini'
}: LockedFeatureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            Paket Gratis (Free Tier)
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            Fitur Belum Diaktifkan
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Pada <strong>Paket Gratis</strong>, hanya fitur <strong>Laporan Hafalan Santri</strong> (dibatasi kuota 50 santri) yang dapat diakses. Fitur <em>{featureTitle}</em> terkunci.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 text-left space-y-1.5">
          <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Manfaat Paket Premium:</span>
          </div>
          <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
            <li>Santri tak terbatas (unlimited kuota)</li>
            <li>Validasi SPP, Tabungan, Donasi & E-Pocket</li>
            <li>Presensi Guru & Santri + QR Gate Pass Satpam</li>
            <li>Portal Wali Santri PWA & WhatsApp Notifikasi</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
          <Link
            href="/dashboard/yayasan"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition inline-flex items-center justify-center space-x-1"
          >
            <span>Aktifkan Premium</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
