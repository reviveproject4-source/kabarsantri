// Pondok biasanya punya asrama putra & putri terpisah, jadi jabatan yang
// sama secara fungsi bisa punya nama berbeda tergantung asrama mana yang
// diampu. Daftar di bawah menampung semua variasi nama yang dianggap sama
// secara kewenangan di sistem.
const JABATAN_MUSYRIF = ['musyrif', 'musyrifah'];

const JABATAN_KESANTRIAN = [
  'kesantrian',
  'kesantrian ikhwan',
  'kesantrian banin',
  'kesantrian akhwat',
  'kesantrian banat',
];

function normalisasiJabatan(jabatan: string): string {
  return jabatan.trim().toLowerCase();
}

export function isJabatanMusyrif(jabatan: string): boolean {
  const j = normalisasiJabatan(jabatan);
  return JABATAN_MUSYRIF.some((m) => j.includes(m));
}

export function isJabatanKesantrian(jabatan: string): boolean {
  const j = normalisasiJabatan(jabatan);
  return JABATAN_KESANTRIAN.some((k) => j.includes(k));
}

const JABATAN_KEUANGAN = ['keuangan', 'bendahara', 'bendahara/keuangan', 'staf keuangan', 'kasir'];

export function isJabatanKeuangan(jabatan: string): boolean {
  const j = normalisasiJabatan(jabatan);
  return JABATAN_KEUANGAN.some((k) => j.includes(k));
}

// Nebak "Santri Diampu" dari nama jabatan, supaya Yayasan tidak perlu isi 2
// field terpisah (jabatan + gender) untuk peran yang sudah jelas gendernya
// dari namanya sendiri. Hasil tebakan ini masih bisa diubah manual di form.
export function tebakGenderDariJabatan(jabatan: string): string {
  const j = normalisasiJabatan(jabatan);

  if (j.includes('akhwat') || j.includes('banat') || j === 'musyrifah') {
    return 'Akhwat';
  }

  if (j.includes('ikhwan') || j.includes('banin') || j === 'musyrif') {
    return 'Ikhwan';
  }

  return '';
}

// Jabatan yang sehari-hari berhubungan langsung dengan santri (kelas/asrama)
// -- di pondok yang asrama & kelasnya terpisah gender, jabatan ini WAJIB
// diampu ke satu gender saja, tidak boleh "Semua".
export function butuhGenderDiampu(jabatan: string): boolean {
  const j = normalisasiJabatan(jabatan);
  return j === 'guru' || isJabatanMusyrif(j) || isJabatanKesantrian(j);
}

// NIP dipakai juga sebagai identitas login (lihat cari_email_pegawai di
// schema.sql) -- seragam 7 digit untuk semua jabatan.
export function syaratPanjangNip(_jabatan: string): { min: number; max: number } {
  return { min: 7, max: 7 };
}

export function nipValid(jabatan: string, nip: string): boolean {
  if (!nip) return true;
  if (!/^[0-9]+$/.test(nip)) return false;
  const { min, max } = syaratPanjangNip(jabatan);
  return nip.length >= min && nip.length <= max;
}
