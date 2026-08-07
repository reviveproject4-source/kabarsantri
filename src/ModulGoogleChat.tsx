import React, { useState, useEffect } from 'react';
import { GoogleChatSpace } from './types';

interface ModulGoogleChatProps {
  isYayasan: boolean;
  isKepsek: boolean;
  labelPeran: string;
  namaAktif: string;
  peranAktif: string;
}

const STORAGE_KEY_GC_SPACES = 'kabarsantri_google_chat_spaces';

const RUANG_DEFAULT: GoogleChatSpace[] = [
  {
    id: 'space-1',
    namaRuang: '🏢 Ruang Eksekutif Yayasan & Kepsek',
    kategori: 'Yayasan & Kepsek',
    linkGoogleChat: 'https://chat.google.com/',
    webhookUrl: '',
    deskripsi: 'Diskusi strategi, evaluasi kinerja lembaga, & pengawasan eksekutif.',
    anggotaTerdaftar: ['Ketua Yayasan', 'Kepala Sekolah', 'Sekretaris Lembaga'],
    aksesPeran: ['yayasan', 'kepsek'],
    dibuatOleh: 'Sistem KabarSantri',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'space-2',
    namaRuang: '👨‍🏫 Ruang Diskusi Majelis Guru & Pengajar',
    kategori: 'Guru & Pengajar',
    linkGoogleChat: 'https://chat.google.com/',
    webhookUrl: '',
    deskripsi: 'Koordinasi kurikulum, jurnal harian, & presensi kegiatan belajar mengajar.',
    anggotaTerdaftar: ['Kepala Sekolah', 'Guru Rombel', 'Guru Tahfidz', 'Staf Kurikulum'],
    aksesPeran: ['yayasan', 'kepsek', 'guru'],
    dibuatOleh: 'Sistem KabarSantri',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'space-3',
    namaRuang: '🛖 Ruang Musyrif & Kesantrian Asrama',
    kategori: 'Musyrif & Kesantrian',
    linkGoogleChat: 'https://chat.google.com/',
    webhookUrl: '',
    deskripsi: 'Pengawasan ibadah harian santri, kedisiplinan, akhlak, & perizinan pulang.',
    anggotaTerdaftar: ['Kepala Kesantrian', 'Musyrif Asrama Ikhwan', 'Musyrifah Asrama Akhwat'],
    aksesPeran: ['yayasan', 'kepsek', 'musyrif', 'kesantrian'],
    dibuatOleh: 'Sistem KabarSantri',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'space-4',
    namaRuang: '💳 Ruang Layanan Keuangan & Bendahara',
    kategori: 'Keuangan',
    linkGoogleChat: 'https://chat.google.com/',
    webhookUrl: '',
    deskripsi: 'Konfirmasi bukti transfer SPP, verifikasi donasi, & pengelolaan anggaran.',
    anggotaTerdaftar: ['Bendahara Yayasan', 'Staf Keuangan', 'Kasir Pembayaran'],
    aksesPeran: ['yayasan', 'kepsek', 'keuangan'],
    dibuatOleh: 'Sistem KabarSantri',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'space-5',
    namaRuang: '📢 Ruang Informasi Wali Santri',
    kategori: 'Wali Santri',
    linkGoogleChat: 'https://chat.google.com/',
    webhookUrl: '',
    deskripsi: 'Broadcast pengumuman resmi pesantren, kalender akademik, & pengingat kegiatan.',
    anggotaTerdaftar: ['Humas Pesantren', 'Pengurus Wali Santri', 'Seluruh Wali Santri'],
    aksesPeran: ['semua'],
    dibuatOleh: 'Sistem KabarSantri',
    createdAt: new Date().toISOString(),
  },
];

export function ModulGoogleChat({
  isYayasan,
  isKepsek,
  labelPeran,
  namaAktif,
  peranAktif,
}: ModulGoogleChatProps) {
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [showModalForm, setShowModalForm] = useState(false);
  const [spaceDiedit, setSpaceDiedit] = useState<GoogleChatSpace | null>(null);

  // Form State
  const [namaRuang, setNamaRuang] = useState('');
  const [kategori, setKategori] = useState('Guru & Pengajar');
  const [linkGoogleChat, setLinkGoogleChat] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [inputAnggota, setInputAnggota] = useState('');
  const [aksesPeran, setAksesPeran] = useState<string[]>(['guru']);

  // Load from localStorage or initialize defaults
  useEffect(() => {
    const simpanan = localStorage.getItem(STORAGE_KEY_GC_SPACES);
    if (simpanan) {
      try {
        setSpaces(JSON.parse(simpanan));
      } catch {
        setSpaces(RUANG_DEFAULT);
      }
    } else {
      setSpaces(RUANG_DEFAULT);
      localStorage.setItem(STORAGE_KEY_GC_SPACES, JSON.stringify(RUANG_DEFAULT));
    }
  }, []);

  const simpanKeStorage = (data: GoogleChatSpace[]) => {
    setSpaces(data);
    localStorage.setItem(STORAGE_KEY_GC_SPACES, JSON.stringify(data));
  };

  const bukaTambahForm = () => {
    setSpaceDiedit(null);
    setNamaRuang('');
    setKategori('Guru & Pengajar');
    setLinkGoogleChat('https://chat.google.com/');
    setWebhookUrl('');
    setDeskripsi('');
    setInputAnggota('');
    setAksesPeran(['guru']);
    setShowModalForm(true);
  };

  const bukaEditForm = (space: GoogleChatSpace) => {
    setSpaceDiedit(space);
    setNamaRuang(space.namaRuang);
    setKategori(space.kategori);
    setLinkGoogleChat(space.linkGoogleChat);
    setWebhookUrl(space.webhookUrl || '');
    setDeskripsi(space.deskripsi);
    setInputAnggota(space.anggotaTerdaftar.join(', '));
    setAksesPeran(space.aksesPeran);
    setShowModalForm(true);
  };

  const simpanRuang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRuang.trim() || !linkGoogleChat.trim()) {
      alert('Nama Ruang dan Link Google Chat wajib diisi.');
      return;
    }

    const daftarAnggotaArray = inputAnggota
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (spaceDiedit) {
      const diperbarui = spaces.map((s) =>
        s.id === spaceDiedit.id
          ? {
              ...s,
              namaRuang,
              kategori,
              linkGoogleChat,
              webhookUrl,
              deskripsi,
              anggotaTerdaftar: daftarAnggotaArray,
              aksesPeran: aksesPeran as any,
            }
          : s
      );
      simpanKeStorage(diperbarui);
    } else {
      const baru: GoogleChatSpace = {
        id: `space-${Date.now()}`,
        namaRuang,
        kategori,
        linkGoogleChat,
        webhookUrl,
        deskripsi,
        anggotaTerdaftar: daftarAnggotaArray,
        aksesPeran: aksesPeran as any,
        dibuatOleh: namaAktif,
        createdAt: new Date().toISOString(),
      };
      simpanKeStorage([...spaces, baru]);
    }

    setShowModalForm(false);
  };

  const hapusRuang = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ruang Google Chat ini?')) {
      const sisa = spaces.filter((s) => s.id !== id);
      simpanKeStorage(sisa);
    }
  };

  const testWebhook = async (space: GoogleChatSpace) => {
    if (!space.webhookUrl) {
      alert('Webhook URL belum diisi untuk ruang ini. Silakan tambahkan Webhook URL dari Google Chat!');
      return;
    }

    try {
      const res = await fetch(space.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 *Uji Coba Notifikasi KabarSantri*\nHallo dari *KabarSantri Bot*! Ruang *${space.namaRuang}* telah terhubung secara otomatis dengan Dashboard.`,
        }),
      });

      if (res.ok) {
        alert('✅ Pesan berhasil dikirimkan ke Google Chat Space!');
      } else {
        alert('⚠️ Gagal mengirim pesan. Pastikan Webhook URL Google Chat aktif.');
      }
    } catch (err) {
      alert('Gagal menghubungi Webhook Google Chat: ' + String(err));
    }
  };

  const toggleAksesPeran = (role: string) => {
    if (aksesPeran.includes(role)) {
      setAksesPeran(aksesPeran.filter((r) => r !== role));
    } else {
      setAksesPeran([...aksesPeran, role]);
    }
  };

  const bisaKelola = isYayasan || isKepsek;

  // Filter spaces based on user role
  const filteredSpaces = spaces.filter((s) => {
    if (bisaKelola) return true;
    if (s.aksesPeran.includes('semua')) return true;
    return s.aksesPeran.includes(peranAktif as any);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              💬 Ruang Google Chat & Komunikasi
            </h1>
            <span className="bg-[#00A3C4]/10 text-[#00A3C4] font-bold text-xs px-3 py-1 rounded-full border border-[#00A3C4]/30">
              {filteredSpaces.length} Ruang Terdaftar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengelompokan ruang percakapan resmi di Google Chat berdasarkan peran (Yayasan, Kepsek, Guru, Musyrif, Keuangan, & Wali Santri).
          </p>
        </div>

        {bisaKelola && (
          <button
            onClick={bukaTambahForm}
            className="bg-[#00A3C4] hover:bg-sky-600 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-[#00A3C4]/20 transition-transform active:scale-95 flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span className="text-lg">➕</span> Buat Ruang Chat Baru
          </button>
        )}
      </div>

      {/* Info Banner for Kepala Sekolah / Yayasan */}
      {bisaKelola && (
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 p-5 rounded-3xl text-white shadow-md border border-sky-700/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A3C4]/30 text-[#00A3C4] font-bold flex items-center justify-center text-xl shrink-0 border border-[#00A3C4]/40">
              👑
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Panel Kelola Ruang Chat (Khusus Yayasan & Kepsek)</h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Anda dapat menambahkan link Google Chat Space, menentukan siapa saja personil/guru yang berada dalam ruang tersebut, serta mengatur hak akses sesuai peran di dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Ruang Chat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSpaces.length === 0 ? (
          <div className="col-span-2 bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            Belum ada ruang Google Chat yang didaftarkan untuk peran Anda.
          </div>
        ) : (
          filteredSpaces.map((space) => (
            <div
              key={space.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="bg-[#00A3C4]/10 text-[#00A3C4] font-bold text-[11px] px-3 py-1 rounded-full border border-[#00A3C4]/30 uppercase tracking-wider">
                    {space.kategori}
                  </span>

                  {bisaKelola && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => bukaEditForm(space)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => hapusRuang(space.id)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2">{space.namaRuang}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{space.deskripsi}</p>

                {/* Anggota Terdaftar Badge List */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <span>👥 Personil / Anggota Terdaftar:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {space.anggotaTerdaftar.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Belum ada anggota diisi</span>
                    ) : (
                      space.anggotaTerdaftar.map((anggota, i) => (
                        <span
                          key={i}
                          className="bg-white text-slate-700 font-semibold text-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs"
                        >
                          👤 {anggota}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                <a
                  href={space.linkGoogleChat}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-[#00A3C4] hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-[#00A3C4]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <span>💬 Buka Google Chat Space</span>
                  <span className="text-xs">↗</span>
                </a>

                {bisaKelola && space.webhookUrl && (
                  <button
                    onClick={() => testWebhook(space)}
                    className="w-full sm:w-auto text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3.5 py-2.5 rounded-xl border border-cyan-200 transition text-center"
                  >
                    🔔 Tes Webhook Bot
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form Tambah / Edit Ruang Chat */}
      {showModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {spaceDiedit ? '✏️ Edit Ruang Google Chat' : '➕ Buat Ruang Google Chat Baru'}
              </h3>
              <button
                onClick={() => setShowModalForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={simpanRuang} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Ruang Google Chat</label>
                <input
                  type="text"
                  placeholder="Misal: 👨‍🏫 Ruang Diskusi Guru Rombel A"
                  value={namaRuang}
                  onChange={(e) => setNamaRuang(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#00A3C4] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Ruang</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#00A3C4] focus:outline-none bg-white font-medium"
                >
                  <option value="Yayasan & Kepsek">Yayasan & Kepsek</option>
                  <option value="Guru & Pengajar">Guru & Pengajar</option>
                  <option value="Musyrif & Kesantrian">Musyrif & Kesantrian</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Wali Santri">Wali Santri</option>
                  <option value="Umum">Umum / Semua Unit</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link Google Chat Space (URL)</label>
                <input
                  type="url"
                  placeholder="https://chat.google.com/room/..."
                  value={linkGoogleChat}
                  onChange={(e) => setLinkGoogleChat(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-xs focus:ring-2 focus:ring-[#00A3C4] focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Link ruang obrolan dari aplikasi Google Chat (dapatkan dari menu 'Copy link to space').
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Anggota Terdaftar Dalam Ruang (Pisahkan dengan koma)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pak Ustadz Ahmad (Kepsek), Ibu Nurul (Guru A), Ustadz Faisal (Musyrif)"
                  value={inputAnggota}
                  onChange={(e) => setInputAnggota(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#00A3C4] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi & Peruntukan Ruang</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan singkat mengenai tujuan dan aturan di dalam ruang chat ini..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#00A3C4] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Akses Peran Yang Diizinkan Melihat Ruang Ini</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'semua', label: '🌐 Semua User' },
                    { id: 'yayasan', label: '🏛️ Yayasan' },
                    { id: 'kepsek', label: '🎓 Kepsek' },
                    { id: 'guru', label: '👨‍🏫 Guru' },
                    { id: 'musyrif', label: '🛖 Musyrif' },
                    { id: 'keuangan', label: '💳 Keuangan' },
                    { id: 'kesantrian', label: '📋 Kesantrian' },
                    { id: 'wali', label: '👪 Wali Santri' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none text-xs font-semibold ${
                        aksesPeran.includes(item.id)
                          ? 'bg-[#00A3C4]/10 border-[#00A3C4] text-[#00A3C4]'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={aksesPeran.includes(item.id)}
                        onChange={() => toggleAksesPeran(item.id)}
                        className="rounded text-[#00A3C4] focus:ring-[#00A3C4]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Webhook URL Bot Google Chat (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://chat.googleapis.com/v1/spaces/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-xs focus:ring-2 focus:ring-[#00A3C4] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Dipakai untuk pengiriman notifikasi otomatis dari sistem KabarSantri.
                </span>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#00A3C4] hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  {spaceDiedit ? 'Simpan Perubahan' : 'Buat Ruang Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
