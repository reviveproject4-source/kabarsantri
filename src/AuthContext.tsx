import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { Peran, Yayasan, YayasanInput } from './types';

interface ProfilBaris {
  id: string;
  yayasan_id: string;
  peran: Peran;
  pegawai_id: number | null;
  santri_id: number | null;
}

interface AuthContextType {
  memuat: boolean;
  session: Session | null;
  profil: ProfilBaris | null;
  yayasan: Yayasan | null;
  peran: Peran | null;
  modePemulihanPassword: boolean;
  masuk: (email: string, password: string) => Promise<string | null>;
  masukPegawaiNip: (nip: string, password: string) => Promise<string | null>;
  masukWali: (nama: string, nis: string, pin: string) => Promise<string | null>;
  daftarYayasan: (
    email: string,
    password: string,
    data: YayasanInput
  ) => Promise<string | null>;
  keluar: () => Promise<void>;
  muatUlangYayasan: () => Promise<void>;
  kirimResetPassword: (email: string) => Promise<string | null>;
  aturPasswordBaru: (passwordBaru: string) => Promise<string | null>;
  batalkanPemulihanPassword: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function pemetaanYayasan(baris: any): Yayasan {
  return {
    id: baris.id,
    namaYayasan: baris.nama_yayasan,
    namaPenanggungJawab: baris.nama_penanggung_jawab,
    jabatanPenanggungJawab: baris.jabatan_penanggung_jawab ?? '',
    noHp: baris.no_hp,
    email: baris.email ?? '',
    alamat: baris.alamat ?? '',
    perkiraanJumlahSantri: baris.perkiraan_jumlah_santri ?? '',
    sumberInformasi: baris.sumber_informasi ?? '',
    // TODO: paksa Premium sementara untuk masa uji coba -- kembalikan ke
    // `baris.paket` kalau mau simulasikan pengalaman Paket Gratis lagi.
    paket: 'Premium',
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<ProfilBaris | null>(null);
  const [yayasan, setYayasan] = useState<Yayasan | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [modePemulihanPassword, setModePemulihanPassword] = useState(false);

  // Melacak permintaan muat profil/yayasan TERBARU -- kalau sesi berganti
  // dengan cepat (logout lalu login akun lain), respons dari permintaan LAMA
  // yang baru selesai belakangan tidak boleh menimpa data sesi yang aktif
  // sekarang. Tanpa ini, ada celah data yayasan/akun sebelumnya "nyangkut"
  // di state walau user sudah login sebagai akun lain.
  const idPermintaanRef = useRef(0);

  // Melacak user yang sedang login -- dipakai untuk membersihkan cache
  // React Query (data santri/pegawai/dll) setiap kali akun yang login
  // berbeda dari sebelumnya, supaya data tenant/akun lama tidak sempat
  // "kelihatan sekilas" sebelum query sempat refetch ulang.
  const userIdRef = useRef<string | null>(null);

  const muatYayasan = async (yayasanId: string, idPermintaan?: number) => {
    const { data: yayasanBaris } = await supabase
      .from('yayasan')
      .select('*')
      .eq('id', yayasanId)
      .maybeSingle();

    if (idPermintaan !== undefined && idPermintaan !== idPermintaanRef.current) {
      return;
    }

    setYayasan(yayasanBaris ? pemetaanYayasan(yayasanBaris) : null);
  };

  const muatProfil = async (userId: string) => {
    const idPermintaan = ++idPermintaanRef.current;

    const { data: profilBaris } = await supabase
      .from('profil')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (idPermintaan !== idPermintaanRef.current) return;

    setProfil(profilBaris as ProfilBaris | null);

    if (profilBaris) {
      await muatYayasan(profilBaris.yayasan_id, idPermintaan);
    } else {
      setYayasan(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      userIdRef.current = data.session?.user.id ?? null;
      setSession(data.session);
      if (data.session) {
        await muatProfil(data.session.user.id);
      }
      setMemuat(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, sesiBaru) => {
        if (event === 'PASSWORD_RECOVERY') {
          setModePemulihanPassword(true);
        }

        const userIdBaru = sesiBaru?.user.id ?? null;
        if (userIdBaru !== userIdRef.current) {
          queryClient.clear();
        }
        userIdRef.current = userIdBaru;

        setSession(sesiBaru);
        if (sesiBaru) {
          await muatProfil(sesiBaru.user.id);
        } else {
          idPermintaanRef.current++;
          setProfil(null);
          setYayasan(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const masuk = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  };

  const masukPegawaiNip = async (nip: string, password: string) => {
    const { data: email, error: errorCari } = await supabase.rpc(
      'cari_email_pegawai',
      { p_nip: nip }
    );

    if (errorCari) {
      return errorCari.message;
    }

    if (!email) {
      return 'NIP tidak ditemukan. Periksa kembali penulisannya, atau hubungi pihak Yayasan.';
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return error ? 'Password salah, atau akun belum dibuat oleh Yayasan.' : null;
  };

  const masukWali = async (nama: string, nis: string, pin: string) => {
    const { data: email, error: errorCari } = await supabase.rpc(
      'cari_email_wali',
      { p_nis: nis, p_nama: nama }
    );

    if (errorCari) {
      return errorCari.message;
    }

    if (!email) {
      return 'Nama atau NIS tidak ditemukan. Periksa kembali penulisannya, atau hubungi pihak Yayasan.';
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    return error ? 'PIN salah, atau akun belum dibuat oleh Yayasan.' : null;
  };

  const daftarYayasan = async (
    email: string,
    password: string,
    data: YayasanInput
  ) => {
    const { data: hasilDaftar, error: errorDaftar } =
      await supabase.auth.signUp({ email, password });

    if (errorDaftar || !hasilDaftar.user) {
      return errorDaftar?.message ?? 'Gagal mendaftar';
    }

    if (!hasilDaftar.session) {
      return 'Pendaftaran akun berhasil, tapi email Anda perlu dikonfirmasi dulu (cek inbox/spam email Anda), baru bisa melengkapi data yayasan. Setelah konfirmasi, silakan masuk lagi.';
    }

    const { error: errorRpc } = await supabase.rpc('daftar_yayasan', {
      p_nama_yayasan: data.namaYayasan,
      p_nama_penanggung_jawab: data.namaPenanggungJawab,
      p_jabatan_penanggung_jawab: data.jabatanPenanggungJawab,
      p_no_hp: data.noHp,
      p_email: data.email,
      p_alamat: data.alamat,
      p_perkiraan_jumlah_santri: data.perkiraanJumlahSantri,
      p_sumber_informasi: data.sumberInformasi,
    });

    if (errorRpc) {
      return errorRpc.message;
    }

    await muatProfil(hasilDaftar.user.id);
    return null;
  };

  const keluar = async () => {
    await supabase.auth.signOut();
  };

  const kirimResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return error ? error.message : null;
  };

  const aturPasswordBaru = async (passwordBaru: string) => {
    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) return error.message;

    setModePemulihanPassword(false);
    return null;
  };

  const batalkanPemulihanPassword = () => {
    setModePemulihanPassword(false);
  };

  const muatUlangYayasan = async () => {
    if (profil) {
      await muatYayasan(profil.yayasan_id);
    }
  };

  const value: AuthContextType = {
    memuat,
    session,
    profil,
    yayasan,
    peran: profil?.peran ?? null,
    modePemulihanPassword,
    masuk,
    masukPegawaiNip,
    masukWali,
    daftarYayasan,
    keluar,
    muatUlangYayasan,
    kirimResetPassword,
    aturPasswordBaru,
    batalkanPemulihanPassword,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return ctx;
};
