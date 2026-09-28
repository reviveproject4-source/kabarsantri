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
    if (userId.startsWith('demo-')) {
      return;
    }

    const idPermintaan = ++idPermintaanRef.current;

    const { data: profilBaris } = await supabase
      .from('profil')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (idPermintaan !== idPermintaanRef.current) return;

    if (profilBaris) {
      setProfil(profilBaris as ProfilBaris);
      await muatYayasan(profilBaris.yayasan_id, idPermintaan);
    } else {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      const sessionUserEmail = (activeSession?.user?.email || '').toLowerCase();
      const demoUser = MOCK_DEMO_USERS[sessionUserEmail];

      if (demoUser) {
        const fakeProfil: ProfilBaris = {
          id: userId,
          yayasan_id: 'demo-yayasan-01',
          peran: demoUser.peran,
          pegawai_id: demoUser.pegawaiId,
          santri_id: demoUser.santriId,
        };
        const fakeYayasan: Yayasan = {
          id: 'demo-yayasan-01',
          namaYayasan: 'Pondok Pesantren KabarSantri',
          namaPenanggungJawab: demoUser.nama,
          jabatanPenanggungJawab: 'Pengelola Lembaga',
          noHp: '081234567890',
          email: demoUser.email,
          alamat: 'Jl. Pesantren No. 1, Kota Depok, Jawa Barat',
          perkiraanJumlahSantri: '250',
          sumberInformasi: 'Website',
          paket: 'Premium',
        };
        setProfil(fakeProfil);
        setYayasan(fakeYayasan);
      } else if (userId.startsWith('demo-wali') || sessionUserEmail.includes('wali')) {
        const waliProfil: ProfilBaris = {
          id: userId,
          yayasan_id: 'demo-yayasan-01',
          peran: 'wali',
          pegawai_id: null,
          santri_id: 1,
        };
        setProfil(waliProfil);
      } else {
        setProfil(null);
        setYayasan(null);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session && !data.session.user.id.startsWith('demo-')) {
        userIdRef.current = data.session.user.id;
        setSession(data.session);
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
        if (sesiBaru && userIdBaru && !userIdBaru.startsWith('demo-')) {
          if (userIdBaru !== userIdRef.current) {
            queryClient.clear();
          }
          userIdRef.current = userIdBaru;
          setSession(sesiBaru);
          await muatProfil(sesiBaru.user.id);
        } else if (!sesiBaru && !session?.user?.id?.startsWith('demo-')) {
          idPermintaanRef.current++;
          setProfil(null);
          setYayasan(null);
          setSession(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const MOCK_DEMO_USERS: Record<
    string,
    {
      email: string;
      peran: Peran;
      pegawaiId: number | null;
      santriId: number | null;
      nama: string;
    }
  > = {
    'demo.yayasan@kabarsantri.id': {
      email: 'demo.yayasan@kabarsantri.id',
      peran: 'yayasan',
      pegawaiId: null,
      santriId: null,
      nama: 'H. Ahmad Dahlan (Yayasan)',
    },
    'yayasan@kabarsantri.id': {
      email: 'yayasan@kabarsantri.id',
      peran: 'yayasan',
      pegawaiId: null,
      santriId: null,
      nama: 'Operator Yayasan',
    },
    'guru@kabarsantri.id': {
      email: 'guru@kabarsantri.id',
      peran: 'pegawai',
      pegawaiId: 1,
      santriId: null,
      nama: 'Ust. Abdullah',
    },
    'musyrif@kabarsantri.id': {
      email: 'musyrif@kabarsantri.id',
      peran: 'pegawai',
      pegawaiId: 2,
      santriId: null,
      nama: 'Ust. Farhan',
    },
    'keuangan@kabarsantri.id': {
      email: 'keuangan@kabarsantri.id',
      peran: 'pegawai',
      pegawaiId: 3,
      santriId: null,
      nama: 'Ustadzah Fatimah',
    },
    'kepsek@kabarsantri.id': {
      email: 'kepsek@kabarsantri.id',
      peran: 'pegawai',
      pegawaiId: 4,
      santriId: null,
      nama: 'Drs. H. Ridwan, M.Pd',
    },
    'ketuayayasan@kabarsantri.id': {
      email: 'ketuayayasan@kabarsantri.id',
      peran: 'pegawai',
      pegawaiId: 5,
      santriId: null,
      nama: 'KH. Ahmad Dahlan, Lc (Ketua Yayasan)',
    },
    'ketua.yayasan@kabarsantri.id': {
      email: 'ketua.yayasan@kabarsantri.id',
      peran: 'pegawai',
      pegawaiId: 5,
      santriId: null,
      nama: 'KH. Ahmad Dahlan, Lc (Ketua Yayasan)',
    },
    'kesantrian@kabarsantri.id': {
      email: 'kesantrian@kabarsantri.id',
      peran: 'pegawai',
      pegawaiId: 6,
      santriId: null,
      nama: 'Ust. Ahmad Kesantrian',
    },
  };

  const buatSesiDemo = (demoUser: (typeof MOCK_DEMO_USERS)[string]) => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('auth-token')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {}

    const fakeSession: any = {
      user: {
        id: `demo-${demoUser.peran}-${demoUser.pegawaiId || demoUser.santriId || 0}`,
        email: demoUser.email,
      },
      access_token: 'demo-token-123',
    };
    const fakeProfil: ProfilBaris = {
      id: fakeSession.user.id,
      yayasan_id: 'demo-yayasan-01',
      peran: demoUser.peran,
      pegawai_id: demoUser.pegawaiId,
      santri_id: demoUser.santriId,
    };
    const fakeYayasan: Yayasan = {
      id: 'demo-yayasan-01',
      namaYayasan: 'Pondok Pesantren KabarSantri',
      namaPenanggungJawab: demoUser.nama,
      jabatanPenanggungJawab: 'Pengelola Lembaga',
      noHp: '081234567890',
      email: demoUser.email,
      alamat: 'Jl. Pesantren No. 1, Kota Depok, Jawa Barat',
      perkiraanJumlahSantri: '250',
      sumberInformasi: 'Website',
      paket: 'Premium',
    };
    setProfil(fakeProfil);
    setYayasan(fakeYayasan);
    setSession(fakeSession);
  };

  const masuk = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const demoUser = MOCK_DEMO_USERS[cleanEmail];

    if (demoUser && (password === 'password123' || password.length >= 4)) {
      await supabase.auth.signOut().catch(() => {});
      buatSesiDemo(demoUser);
      return null;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (demoUser) {
        buatSesiDemo(demoUser);
        return null;
      }
      return error.message;
    }
    return null;
  };

  const masukPegawaiNip = async (nip: string, password: string) => {
    const cleanNip = nip.trim();
    const nipDemoMap: Record<string, string> = {
      '19900101': 'guru@kabarsantri.id',
      '19900102': 'musyrif@kabarsantri.id',
      '19900103': 'keuangan@kabarsantri.id',
      '19900104': 'kepsek@kabarsantri.id',
      '19900105': 'ketuayayasan@kabarsantri.id',
      '19900106': 'kesantrian@kabarsantri.id',
    };

    const { data: email } = await supabase.rpc('cari_email_pegawai', {
      p_nip: cleanNip,
    });

    const emailTarget = email || nipDemoMap[cleanNip];

    if (!emailTarget) {
      return 'NIP tidak ditemukan. Gunakan NIP Demo: 19900101 (Guru), 19900102 (Musyrif), 19900103 (Keuangan), atau 19900104 (Kepsek).';
    }

    const resError = await masuk(emailTarget, password);
    return resError;
  };

  const masukWali = async (nama: string, nis: string, pin: string) => {
    const cleanNis = nis.trim();
    const cleanNama = nama.trim();

    if (!cleanNis || !cleanNama || !pin) {
      return 'Lengkapi Nama Santri, NIS, dan PIN 6 Digit untuk masuk.';
    }

    // 1. Identity Resolution & Santri Chain (Nama + NIS -> exactly 1 Santri record)
    const { data: santriMatch, error: santriErr } = await supabase
      .from('santri')
      .select('id, yayasan_id, nis, nama')
      .eq('nis', cleanNis)
      .ilike('nama', cleanNama)
      .maybeSingle();

    if (santriErr || !santriMatch) {
      return 'Data Santri dengan Nama dan NIS tersebut tidak ditemukan.';
    }

    const targetSantriId = santriMatch.id;

    // 2. Technical Auth Identifier derived strictly from resolved santri.id
    const { data: emailDariDb } = await supabase.rpc('cari_email_wali', {
      p_nis: cleanNis,
      p_nama: cleanNama,
    });

    const email = emailDariDb || `wali-${targetSantriId}@kabarsantri.internal`;
    const userPassword = pin.length < 6 ? pin.padEnd(6, '0') : pin;

    // 3. Authentication: ONLY signInWithPassword (NO password fallbacks, NO auto-signUp)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: userPassword,
    });

    if (authError || !authData?.session?.user) {
      return 'PIN yang Anda masukkan salah atau akun Wali belum terdaftar.';
    }

    const userId = authData.session.user.id;

    // 4. Link Profil via RPC using the EXACT resolved targetSantriId
    try {
      await supabase.rpc('link_wali_profil', {
        p_santri_id: targetSantriId,
      });
    } catch (e) {
      // Offline / fallback handling
    }

    const { data: existingProfil } = await supabase
      .from('profil')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const waliProfil: ProfilBaris = existingProfil ? (existingProfil as ProfilBaris) : {
      id: userId,
      yayasan_id: santriMatch.yayasan_id || 'demo-yayasan-01',
      peran: 'wali',
      pegawai_id: null,
      santri_id: targetSantriId,
    };

    setProfil(waliProfil);
    setSession(authData.session);
    return null;
  };

  const daftarYayasan = async (
    email: string,
    password: string,
    data: YayasanInput
  ) => {
    try {
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
    } catch (err: any) {
      return err?.message || 'Gagal terhubung ke server Supabase. Periksa koneksi atau kredensial Supabase.';
    }
  };

  const keluar = async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    setProfil(null);
    setYayasan(null);
    setSession(null);
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
