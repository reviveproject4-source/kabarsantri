import React, { useState, useEffect } from 'react';
import { openDirectWA } from '../teleponUtils';
import { HalamanBeranda } from './HalamanBeranda';
import { HalamanPortalWaliSantri } from './HalamanPortalWaliSantri';
import { HalamanModulOperasional } from './HalamanModulOperasional';
import { HalamanSkemaBiaya } from './HalamanSkemaBiaya';
import { HalamanTentangMinara } from './HalamanTentangMinara';

interface Props {
  onBukaLogin: () => void;
  onBukaPendaftaranLembaga: () => void;
  onBukaSuperAdmin: () => void;
}

export type HalamanType = 'beranda' | 'portal-wali' | 'modul' | 'skema-biaya' | 'tentang';

export const WebsiteKabarSantri: React.FC<Props> = ({
  onBukaLogin,
  onBukaPendaftaranLembaga,
  onBukaSuperAdmin,
}) => {
  const [halamanAktif, setHalamanAktif] = useState<HalamanType>('beranda');

  // Scroll to top when changing page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [halamanAktif]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between overflow-x-hidden">
      {/* BACKGROUND GRADIENT & GLOW EFFECT */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        ></div>
      </div>

      {/* HEADER NAVBAR WEBSITE */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setHalamanAktif('beranda')}
          >
            <img
              src="/logo-kabarsantri.png"
              alt="Logo KabarSantri"
              className="w-11 h-11 rounded-2xl shadow-lg shadow-blue-600/20 object-cover border border-white/20 group-hover:scale-105 transition"
            />
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                KabarSantri
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  by Minara
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                System Operation Pesantren & Yayasan
              </p>
            </div>
          </div>

          {/* Navigasi Utama Website */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold text-slate-300">
            <button
              onClick={() => setHalamanAktif('beranda')}
              className={`px-4 py-2 rounded-xl transition ${
                halamanAktif === 'beranda' ? 'bg-amber-500 text-slate-950 shadow-md' : 'hover:text-white'
              }`}
            >
              🏠 Beranda
            </button>
            <button
              onClick={() => setHalamanAktif('portal-wali')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                halamanAktif === 'portal-wali' ? 'bg-amber-500 text-slate-950 shadow-md' : 'hover:text-amber-400'
              }`}
            >
              📱 Demo Portal Wali
            </button>
            <button
              onClick={() => setHalamanAktif('modul')}
              className={`px-4 py-2 rounded-xl transition ${
                halamanAktif === 'modul' ? 'bg-amber-500 text-slate-950 shadow-md' : 'hover:text-white'
              }`}
            >
              ⚙️ Modul Fitur
            </button>
            <button
              onClick={() => setHalamanAktif('skema-biaya')}
              className={`px-4 py-2 rounded-xl transition ${
                halamanAktif === 'skema-biaya' ? 'bg-amber-500 text-slate-950 shadow-md' : 'hover:text-white'
              }`}
            >
              💰 Skema & Biaya
            </button>
            <button
              onClick={() => setHalamanAktif('tentang')}
              className={`px-4 py-2 rounded-xl transition ${
                halamanAktif === 'tentang' ? 'bg-amber-500 text-slate-950 shadow-md' : 'hover:text-white'
              }`}
            >
              🤝 Tentang Kami
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBukaPendaftaranLembaga}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition"
            >
              <span>📝</span> Daftar Lembaga
            </button>

            <button
              onClick={onBukaLogin}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition transform active:scale-95 flex items-center gap-2"
            >
              <span>🔑</span> Portal App
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <div className="lg:hidden flex overflow-x-auto border-t border-slate-800 bg-slate-900/60 p-2 gap-2 text-xs font-bold text-slate-300">
          <button
            onClick={() => setHalamanAktif('beranda')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              halamanAktif === 'beranda' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => setHalamanAktif('portal-wali')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              halamanAktif === 'portal-wali' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            📱 Demo Portal Wali
          </button>
          <button
            onClick={() => setHalamanAktif('modul')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              halamanAktif === 'modul' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Modul Fitur
          </button>
          <button
            onClick={() => setHalamanAktif('skema-biaya')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              halamanAktif === 'skema-biaya' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Skema & Biaya
          </button>
          <button
            onClick={() => setHalamanAktif('tentang')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              halamanAktif === 'tentang' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Tentang Kami
          </button>
        </div>
      </header>

      {/* MAIN WEBSITE ROUTER BODY */}
      <main className="relative z-10 flex-grow">
        {halamanAktif === 'beranda' && (
          <HalamanBeranda
            onBukaPortalWali={() => setHalamanAktif('portal-wali')}
            onBukaModul={() => setHalamanAktif('modul')}
            onBukaSkemaBiaya={() => setHalamanAktif('skema-biaya')}
            onBukaPendaftaran={onBukaPendaftaranLembaga}
            onBukaLogin={onBukaLogin}
          />
        )}

        {halamanAktif === 'portal-wali' && <HalamanPortalWaliSantri />}

        {halamanAktif === 'modul' && <HalamanModulOperasional />}

        {halamanAktif === 'skema-biaya' && <HalamanSkemaBiaya />}

        {halamanAktif === 'tentang' && <HalamanTentangMinara />}
      </main>

      {/* FLOATING WHATSAPP BUTTON */}
      <button
        onClick={() => openDirectWA('6281215566630', 'Assalamualaikum, saya ingin berdiskusi tentang KabarSantri.')}
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 transition transform hover:scale-105 border border-emerald-300/40 text-xs sm:text-sm"
      >
        <span className="text-lg">💬</span>
        <span className="hidden sm:inline">Diskusi via WhatsApp</span>
      </button>

      {/* UNIVERSAL FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo-kabarsantri.png"
                alt="Logo KabarSantri"
                className="w-10 h-10 rounded-2xl object-cover"
              />
              <div>
                <span className="text-white font-bold text-base block">KabarSantri by Minara</span>
                <p className="text-[11px] text-slate-500">Mitra Transformasi Digital Pesantren Indonesia</p>
              </div>
            </div>

            {/* Quick Links Footer */}
            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium">
              <button onClick={() => setHalamanAktif('beranda')} className="hover:text-amber-400">
                Beranda
              </button>
              <button onClick={() => setHalamanAktif('portal-wali')} className="hover:text-amber-400">
                Portal Wali
              </button>
              <button onClick={() => setHalamanAktif('modul')} className="hover:text-amber-400">
                Modul Fitur
              </button>
              <button onClick={() => setHalamanAktif('skema-biaya')} className="hover:text-amber-400">
                Skema Biaya
              </button>
              <button onClick={() => setHalamanAktif('tentang')} className="hover:text-amber-400">
                Tentang Minara
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => openDirectWA('6281215566630')} className="hover:text-amber-400">
                📞 WhatsApp: 0812 1556 6630
              </button>
              <span>·</span>
              <button onClick={onBukaSuperAdmin} className="hover:text-amber-400 opacity-60 hover:opacity-100">
                🔒 Portal Admin
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} KabarSantri by Minara. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
