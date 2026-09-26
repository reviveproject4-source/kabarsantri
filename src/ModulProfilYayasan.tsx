import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import { openDirectWA } from './teleponUtils';

const NOMOR_WA_MINARA = '6281215566630';

interface ModulProfilYayasanProps {
  onTutup?: () => void;
}

export function ModulProfilYayasan({ onTutup }: ModulProfilYayasanProps) {
  const { yayasan, muatUlangYayasan } = useAuth();

  const isPremium = yayasan?.paket === 'Premium';

  const [namaYayasan, setNamaYayasan] = useState(yayasan?.namaYayasan || '');
  const [logoUrl, setLogoUrl] = useState(yayasan?.logoUrl || '');
  const [alamat, setAlamat] = useState(yayasan?.alamat || '');
  const [namaPenanggungJawab, setNamaPenanggungJawab] = useState(
    yayasan?.namaPenanggungJawab || ''
  );
  const [jabatanPenanggungJawab, setJabatanPenanggungJawab] = useState(
    yayasan?.jabatanPenanggungJawab || ''
  );
  const [noHp, setNoHp] = useState(yayasan?.noHp || '');
  const [email, setEmail] = useState(yayasan?.email || '');

  const [menyimpan, setMenyimpan] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const [pesanBerhasil, setPesanBerhasil] = useState('');

  // Handle local image file upload to Supabase Storage or DataURL fallback
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      alert(
        '🔒 Fitur Kustomisasi Logo Lembaga hanya tersedia untuk pengguna Paket Premium.\n\nSilakan upgrade paket langganan Anda untuk mengunggah logo internal pesantren.'
      );
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar dari galeri (PNG / JPG / WEBP).');
      return;
    }

    setMengunggah(true);

    try {
      // Try uploading to Supabase storage bucket 'bukti-bayar' or converting to Base64 DataURL
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${yayasan?.id || 'default'}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('bukti-bayar')
        .upload(filePath, file, { upsert: true });

      if (!error && data) {
        const { data: pubData } = supabase.storage
          .from('bukti-bayar')
          .getPublicUrl(filePath);
        setLogoUrl(pubData.publicUrl);
      } else {
        // Fallback: FileReader Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setMengunggah(false);
    }
  };

  const simpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaYayasan.trim()) {
      alert('Nama Yayasan / Pesantren tidak boleh kosong.');
      return;
    }

    setMenyimpan(true);
    setPesanBerhasil('');

    try {
      if (yayasan?.id) {
        const { error } = await supabase
          .from('yayasan')
          .update({
            nama_yayasan: namaYayasan,
            alamat: alamat,
            nama_penanggung_jawab: namaPenanggungJawab,
            jabatan_penanggung_jawab: jabatanPenanggungJawab,
            no_hp: noHp,
            email: email,
            ...(isPremium ? { logo_url: logoUrl } : {}),
          })
          .eq('id', yayasan.id);

        if (error) {
          console.warn('Simpan database Supabase (offline fallback):', error);
        }
      }

      // Update in-memory yayasan object
      if (yayasan) {
        yayasan.namaYayasan = namaYayasan;
        yayasan.alamat = alamat;
        if (isPremium) {
          yayasan.logoUrl = logoUrl;
        }
        yayasan.namaPenanggungJawab = namaPenanggungJawab;
        yayasan.jabatanPenanggungJawab = jabatanPenanggungJawab;
        yayasan.noHp = noHp;
        yayasan.email = email;
      }

      await muatUlangYayasan();
      setPesanBerhasil('✅ Identitas Logo, Nama, & Alamat Lembaga berhasil diperbarui!');
      setTimeout(() => setPesanBerhasil(''), 4000);
    } catch (err) {
      alert('Gagal menyimpan perubahan: ' + String(err));
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ⚙️ Pengaturan Identitas & Logo Pesantren
            </h1>
            <span className="bg-[#0A4ABF]/10 text-[#0A4ABF] font-bold text-xs px-3 py-1 rounded-full border border-[#0A4ABF]/30">
              Profil Yayasan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur nama resmi lembaga, logo internal pesantren/sekolah, alamat lengkap, dan kontak penanggung jawab.
          </p>
        </div>

        {onTutup && (
          <button
            onClick={onTutup}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            ✕ Tutup
          </button>
        )}
      </div>

      {pesanBerhasil && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span>🎉</span> {pesanBerhasil}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <form onSubmit={simpanProfil} className="space-y-6 text-xs">
          {/* Logo Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <label className="font-black text-slate-800 text-sm block">
                🖼️ Logo Internal Lembaga / Pesantren
              </label>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isPremium
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isPremium ? '👑 Paket Premium Active' : '🔒 Khusus Paket Premium'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              Logo Aplikasi KabarSantri tetap menjadi brand utama. Logo internal tenant ini akan tampil sebagai pendamping di Sidebar, Header Mobile, & Kop Surat Cetak.
            </p>

            {!isPremium && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">👑</span>
                  <div>
                    <p className="font-bold">Ganti Logo Lembaga Khusus Paket Premium</p>
                    <p className="text-amber-700 text-[11px]">
                      Status Paket Saat Ini: <span className="font-bold uppercase text-slate-800">{yayasan?.paket || 'Gratis'}</span>. Upgrade ke Paket Premium untuk memasang Logo Internal Lembaga Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pesan = `Assalamua'laikum Admin KabarSantri, saya (${yayasan?.namaYayasan || 'Lembaga'}) ingin upgrade ke Paket Premium untuk kustomisasi logo internal lembaga.`;
                    openDirectWA(NOMOR_WA_MINARA, pesan);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl shrink-0 transition active:scale-95 shadow-xs flex items-center gap-1.5"
                >
                  <span>💬</span> Upgrade via WhatsApp
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Preview Both Logos */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <div className="relative">
                    <img
                      src="/logo-kabarsantri.png"
                      alt="Logo Utama KabarSantri"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md bg-white mx-auto"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-blue-600 block mt-1">Logo App Utama</span>
                </div>

                <span className="text-slate-400 font-bold text-lg">+</span>

                <div className="text-center">
                  <div className="relative">
                    <img
                      src={logoUrl || '/logo-kabarsantri.png'}
                      alt="Logo Tenant Lembaga"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-white mx-auto"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-amber-600 block mt-1">Logo Internal Tenant</span>
                </div>
              </div>

              <div className="space-y-3 flex-1 w-full">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    📁 Upload Gambar Logo dari Galeri Device / HP
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    disabled={mengunggah || !isPremium}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0A4ABF] file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {mengunggah && <span className="text-[11px] text-blue-600 font-bold mt-1 block">Mengunggah logo...</span>}
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Klik tombol di atas untuk membuka galeri foto/file secara langsung di perangkat HP/Laptop Anda.
                  </span>
                </div>

                <div className="pt-1">
                  <label className="font-bold text-slate-700 block mb-1">Atau Masukkan URL Link Gambar Logo</label>
                  <input
                    type="text"
                    placeholder="https://domain-pesantren.id/logo.png"
                    value={logoUrl}
                    onChange={(e) => {
                      if (!isPremium) {
                        alert(
                          '🔒 Fitur Kustomisasi Logo Lembaga hanya tersedia untuk Paket Premium. Silakan upgrade paket langganan Anda.'
                        );
                        return;
                      }
                      setLogoUrl(e.target.value);
                    }}
                    disabled={!isPremium}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Lembaga Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Nama Resmi Yayasan / Pondok Pesantren</label>
              <input
                type="text"
                placeholder="Contoh: Pondok Pesantren Darussalam / Yayasan Al-Hikmah"
                value={namaYayasan}
                onChange={(e) => setNamaYayasan(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Lembaga / Pesantren</label>
              <textarea
                rows={3}
                placeholder="Contoh: Jl. KH. Ahmad Dahlan No. 12, RT 02/05, Desa Sukamaju, Kec. Cilodong, Kota Depok, Jawa Barat 16413"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Alamat ini akan ditampilkan di header aplikasi & kop surat laporan resmi.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Penanggung Jawab / Pimpinan</label>
              <input
                type="text"
                placeholder="Nama Pimpinan / Pengasuh"
                value={namaPenanggungJawab}
                onChange={(e) => setNamaPenanggungJawab(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Jabatan Pimpinan</label>
              <input
                type="text"
                placeholder="Misal: Ketua Yayasan / Pengasuh Pesantren"
                value={jabatanPenanggungJawab}
                onChange={(e) => setJabatanPenanggungJawab(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Resmi Lembaga</label>
              <input
                type="text"
                placeholder="08123456789"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Resmi Lembaga</label>
              <input
                type="email"
                placeholder="info@pesantren.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="submit"
              disabled={menyimpan}
              className="bg-[#0A4ABF] hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-blue-600/30 text-xs transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <span>💾</span> {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan Identitas Lembaga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
