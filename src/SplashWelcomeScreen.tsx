interface Props {
  onConfirm: () => void;
  onBukaPendaftaranLembaga?: () => void;
  onBukaSuperAdmin?: () => void;
}

export const SplashWelcomeScreen: React.FC<Props> = ({
  onConfirm,
  onBukaPendaftaranLembaga,
  onBukaSuperAdmin,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 p-4 font-sans select-none overflow-y-auto">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-slate-200 relative my-auto animate-in fade-in zoom-in duration-200">
        {/* Header Logo Image */}
        <img
          src="/logo-kabarsantri.png"
          alt="Logo KabarSantri"
          className="w-20 h-20 rounded-3xl mx-auto mb-4 shadow-xl shadow-blue-600/30 object-cover border-2 border-white/80"
        />

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-2 tracking-tight">
            Selamat Datang di KabarSantri
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Solusi digital terpadu untuk Pengawasan Yayasan, Manajemen Santri, Tahfidz, Keuangan, & Ruang Diskusi Google Chat.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-5 text-left text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span>🏫</span> Multi-Tenant Unit
            </div>
            <p className="text-[11px] text-slate-500">Kelola Pesantren, Sekolah & PAUD terisolasi.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span>📖</span> Tahfidz & Character
            </div>
            <p className="text-[11px] text-slate-500">Jurnal hafalan & rekap poin akhlak santri.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span>💳</span> Transparansi SPP
            </div>
            <p className="text-[11px] text-slate-500">Validasi resi transfer & tabungan santri.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span>💬</span> Google Chat Space
            </div>
            <p className="text-[11px] text-slate-500">Ruang obrolan terkelompok per peran.</p>
          </div>
        </div>

        {/* Prospect Action Buttons */}
        <div className="space-y-3 pt-1">
          {onBukaPendaftaranLembaga && (
            <button
              onClick={onBukaPendaftaranLembaga}
              className="w-full bg-[#0A4ABF] hover:bg-blue-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-transform active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span>📝</span> Form Pendaftaran & Prospek Lembaga Baru
            </button>
          )}

          <button
            onClick={onConfirm}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl text-xs transition"
          >
            🔑 Masuk ke Portal Login & Manajemen Utama
          </button>
        </div>
      </div>
    </div>
  );
};