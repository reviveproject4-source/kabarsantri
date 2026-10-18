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
            Kendali Fitur Super Admin
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            Modul Belum Diaktifkan
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Modul <strong>{featureTitle}</strong> saat ini belum diaktifkan oleh <strong>Super Admin Platform</strong> untuk yayasan Anda. Seluruh hak akses fitur dikendalikan secara terpusat dari Konsol Super Admin.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 text-left space-y-1.5">
          <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Pusat Kendali Lisensi Pesantren:</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Super Admin dapat mengaktifkan modul ini kapan saja melalui <strong>Konsol Super Admin → Kustomisasi Modul &amp; Fitur</strong>.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
          <a
            href="https://wa.me/6281215566630?text=Assalamu'alaikum%20Super%20Admin%20KabarSantri,%20kami%20dari%20yayasan%20ingin%20mengajukan%20aktivasi%20fitur."
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition inline-flex items-center justify-center space-x-1"
          >
            <span>Hubungi Super Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
