// Edge Function: buat-akun
//
// Dipanggil dari frontend saat Yayasan menambah Pegawai atau Santri (untuk
// membuat akun login Wali) baru. Membuat baris auth.users + profil sekaligus,
// pakai service_role key -- makanya HARUS jalan di server (Edge Function),
// tidak pernah di kode frontend.
//
// Deploy: supabase functions deploy buat-akun
// Perlu secret: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role key>
//   (SUPABASE_URL sudah otomatis tersedia di semua Edge Function)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Permintaan {
  email?: string;
  // Opsional saat RESET akun pegawai yang sudah ada (kosongkan supaya
  // password lama tidak ikut berubah, misal cuma mau update email/NIP).
  // Tetap wajib untuk akun baru dan untuk akun Wali.
  password?: string;
  peran: 'pegawai' | 'wali';
  pegawaiId?: number;
  santriId?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return respon({ error: 'Tidak ada token otorisasi' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Klien "sebagai pemanggil" -- dipakai untuk memastikan yang memanggil
    // fungsi ini benar-benar user Yayasan yang sudah login (bukan sembarang
    // orang yang kebetulan tahu URL fungsi ini).
    const supabasePemanggil = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: pemanggil },
    } = await supabasePemanggil.auth.getUser();

    if (!pemanggil) {
      return respon({ error: 'Sesi tidak valid' }, 401);
    }

    // Klien admin (service_role) -- yang punya izin membuat user baru.
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profilPemanggil } = await supabaseAdmin
      .from('profil')
      .select('yayasan_id, peran')
      .eq('id', pemanggil.id)
      .single();

    if (!profilPemanggil || profilPemanggil.peran !== 'yayasan') {
      return respon(
        { error: 'Hanya Yayasan yang boleh membuat akun baru' },
        403
      );
    }

    const body: Permintaan = await req.json();

    if (!body.peran) {
      return respon({ error: 'peran wajib diisi' }, 400);
    }

    if (body.peran === 'pegawai' && !body.pegawaiId) {
      return respon({ error: 'pegawaiId wajib untuk peran pegawai' }, 400);
    }

    if (body.peran === 'wali' && !body.santriId) {
      return respon({ error: 'santriId wajib untuk peran wali' }, 400);
    }

    if (body.peran === 'pegawai' && !body.email) {
      return respon({ error: 'email wajib untuk peran pegawai' }, 400);
    }

    // Akun Wali selalu wajib isi PIN -- tidak ada skenario "reset tanpa
    // ubah PIN" untuk wali seperti pegawai.
    if (body.peran === 'wali' && (!body.password || body.password.length < 6)) {
      return respon({ error: 'PIN minimal 6 digit' }, 400);
    }

    // Wali login pakai Nama+NIS+PIN (bukan email), jadi email dibuat
    // otomatis di sini -- deterministik dari santriId, tidak pernah
    // ditampilkan/diminta dari Yayasan.
    const email =
      body.peran === 'wali' ? `wali-${body.santriId}@kabarsantri.internal` : body.email!;

    // Cek apakah akun untuk pegawai/santri ini sudah pernah dibuat
    // sebelumnya -- kalau sudah, ini jadi RESET akun yang ada, bukan bikin
    // akun baru (yang pasti gagal karena email sudah dipakai).
    const { data: profilLama } = await supabaseAdmin
      .from('profil')
      .select('id')
      .eq('yayasan_id', profilPemanggil.yayasan_id)
      .eq('peran', body.peran)
      .eq(
        body.peran === 'pegawai' ? 'pegawai_id' : 'santri_id',
        body.peran === 'pegawai' ? body.pegawaiId : body.santriId
      )
      .maybeSingle();

    if (profilLama) {
      // Untuk Pegawai, email boleh diganti sekalian saat reset -- misalnya
      // kalau email lama lupa/salah ketik, Yayasan cukup isi email baru
      // tanpa perlu tahu email lamanya. Untuk Wali, email tetap email
      // sintetis berdasarkan santriId dan tidak pernah diubah dari sini.
      // Password HANYA diikutkan kalau memang diisi -- kosongkan supaya
      // password lama tidak ikut ter-reset saat cuma mau update email.
      const atribut: { password?: string; email?: string; email_confirm?: boolean } = {};

      if (body.password) {
        atribut.password = body.password;
      }

      if (body.peran === 'pegawai' && body.email) {
        atribut.email = body.email;
        atribut.email_confirm = true;
      }

      if (Object.keys(atribut).length === 0) {
        return respon({ error: 'Tidak ada perubahan untuk disimpan' }, 400);
      }

      const { error: errorUbah } =
        await supabaseAdmin.auth.admin.updateUserById(profilLama.id, atribut);

      if (errorUbah) {
        return respon({ error: errorUbah.message }, 400);
      }

      // Simpan salinan email ke tabel pegawai supaya kelihatan di Data
      // Pegawai tanpa perlu buka Supabase Auth -- email aslinya tetap
      // dikelola lewat auth.users di atas, ini cuma cermin untuk tampilan.
      if (body.peran === 'pegawai' && body.email && body.pegawaiId) {
        const { error: errorSalinEmail } = await supabaseAdmin
          .from('pegawai')
          .update({ email: body.email })
          .eq('id', body.pegawaiId);

        if (errorSalinEmail) {
          return respon(
            {
              error: `Akun login berhasil dibuat, tapi gagal menyimpan email ke data pegawai: ${errorSalinEmail.message}`,
            },
            400
          );
        }
      }

      return respon({ ok: true, userId: profilLama.id }, 200);
    }

    if (!body.password) {
      return respon({ error: 'Password wajib diisi untuk akun baru' }, 400);
    }

    const { data: userBaru, error: errorBuatUser } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
      });

    if (errorBuatUser || !userBaru.user) {
      return respon(
        { error: errorBuatUser?.message ?? 'Gagal membuat akun' },
        400
      );
    }

    const { error: errorProfil } = await supabaseAdmin.from('profil').insert({
      id: userBaru.user.id,
      yayasan_id: profilPemanggil.yayasan_id,
      peran: body.peran,
      pegawai_id: body.peran === 'pegawai' ? body.pegawaiId : null,
      santri_id: body.peran === 'wali' ? body.santriId : null,
    });

    if (errorProfil) {
      // Bersihkan user auth yang sudah terlanjur dibuat supaya tidak jadi akun "yatim".
      await supabaseAdmin.auth.admin.deleteUser(userBaru.user.id);
      return respon({ error: errorProfil.message }, 400);
    }

    if (body.peran === 'pegawai' && body.email) {
      const { error: errorSalinEmailBaru } = await supabaseAdmin
        .from('pegawai')
        .update({ email: body.email })
        .eq('id', body.pegawaiId);

      if (errorSalinEmailBaru) {
        return respon(
          {
            error: `Akun login berhasil dibuat, tapi gagal menyimpan email ke data pegawai: ${errorSalinEmailBaru.message}`,
          },
          400
        );
      }
    }

    return respon({ ok: true, userId: userBaru.user.id }, 200);
  } catch (err) {
    return respon({ error: String(err) }, 500);
  }
});

function respon(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
