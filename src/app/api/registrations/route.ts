import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fugqdiuxnjwfgxpvxqsy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Z3FkaXV4bmp3Zmd4cHZ4cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjgxODYsImV4cCI6MjA5OTYwNDE4Nn0.3uoylCk9Y4zocDimhvSfCw5_U0JP0Kx9lz1mPkfmyDk';
const supabase = createClient(supabaseUrl, supabaseKey);

// File penyimpanan persisten di src/data
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

// In-memory store fallback
let memoryStore: any[] = [
  {
    id: 'reg-498363',
    nama_yayasan: 'Yayasan Al Kausar',
    nama_pimpinan: 'Ust. Raynd',
    no_whatsapp: '081280320505',
    email: 'admin@al-kausar.kabarsantri.id',
    kota: 'Cibuntu',
    estimasi_santri: '< 50 Santri',
    paket_pilihan: 'Gratis',
    catatan: 'Tenant live resmi teraktivasi (Pusat Kendali Seluruh Fitur Terbuka).',
    status: 'active',
    features: [
      'dashboard', 'tahfidz', 'kbm', 'e_raport', 'presensi', 'adab', 
      'kesiswaan', 'perizinan', 'kepegawaian', 'spp', 'rumah_tangga', 
      'wali', 'laporan', 'wa_gateway', 'akuntansi'
    ],
    created_at: '2026-10-12 02:01',
    activated_tenant_id: 'tenant-al-kausar-9033',
    admin_email: 'admin@al-kausar.kabarsantri.id',
    admin_temp_password: 'Raynd6304!',
  },
  {
    id: 'reg-001',
    nama_yayasan: 'Yayasan Pondok Pesantren Bina Insan Qurani',
    nama_pimpinan: 'KH. Dr. Muhammad Syamsul Ma\'arif',
    no_whatsapp: '081234567890',
    email: 'sekretariat@binainsan.sch.id',
    kota: 'Bandung, Jawa Barat',
    estimasi_santri: '100 - 300 Santri',
    paket_pilihan: 'Enterprise',
    catatan: 'Prioritas aktivasi modul SPP online dan mutaba\'ah tahfidz asrama.',
    status: 'pending',
    features: ['tahfidz', 'spp', 'presensi', 'wali', 'rumah_tangga', 'akuntansi'],
    created_at: '2026-10-10 14:30',
  },
  {
    id: 'reg-002',
    nama_yayasan: 'Pesantren Tahfidz Darul Hikmah',
    nama_pimpinan: 'Ustadz Ahmad Fauzan, Lc.',
    no_whatsapp: '085712345678',
    email: 'info@darulhikmah.id',
    kota: 'Sleman, D.I. Yogyakarta',
    estimasi_santri: '< 50 Santri',
    paket_pilihan: 'Gratis',
    catatan: 'Pesantren baru rintisan, fokus 30 juz dan adab santri.',
    status: 'active',
    features: ['tahfidz', 'wali'],
    created_at: '2026-10-09 09:15',
    activated_tenant_id: 'tenant-darul-hikmah-001',
    admin_email: 'admin@darulhikmah.kabarsantri.id',
    admin_temp_password: 'Fauzan2026!',
  }
];

function loadLocalFile(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryStore = parsed;
        return parsed;
      }
    }
  } catch {}
  return memoryStore;
}

function saveLocalFile(data: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function GET() {
  loadLocalFile();

  // 1. Coba baca dari Supabase jika tabel yayasan_registrations sudah ada
  try {
    const { data, error } = await supabase
      .from('yayasan_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      if (data.length > 0) {
        // Gabungkan data Supabase dengan memoryStore jika ada yang belum terunggah
        const existingIds = new Set(data.map((d: any) => d.id));
        const combined = [...data];
        for (const m of memoryStore) {
          if (!existingIds.has(m.id)) {
            combined.push(m);
          }
        }
        return NextResponse.json({ success: true, source: 'supabase', data: combined });
      } else {
        // Tabel ada tapi masih kosong: unggah cache lokal ke Supabase
        if (memoryStore.length > 0) {
          try {
            const seedItems = memoryStore.map(item => ({
              id: item.id,
              nama_yayasan: item.nama_yayasan,
              nama_pimpinan: item.nama_pimpinan,
              no_whatsapp: item.no_whatsapp,
              email: item.email || null,
              kota: item.kota || 'Indonesia',
              estimasi_santri: item.estimasi_santri || '< 50 Santri',
              paket_pilihan: item.paket_pilihan || 'Gratis',
              catatan: item.catatan || null,
              status: item.status || 'pending',
              features: item.features || ['tahfidz', 'wali'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            await supabase.from('yayasan_registrations').upsert(seedItems);
          } catch {}
        }
        return NextResponse.json({ success: true, source: 'supabase', data: memoryStore });
      }
    }
  } catch {}

  // 2. Fallback memory / file cache
  return NextResponse.json({ success: true, source: 'cache', data: memoryStore });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.nama_yayasan || !body.nama_pimpinan || !body.no_whatsapp) {
      return NextResponse.json(
        { success: false, message: 'Nama Yayasan, Pimpinan, dan No. WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    const newRecord = {
      id: body.id || 'reg-' + Date.now().toString().slice(-6),
      nama_yayasan: String(body.nama_yayasan).trim(),
      nama_pimpinan: String(body.nama_pimpinan).trim(),
      no_whatsapp: String(body.no_whatsapp).trim(),
      email: body.email ? String(body.email).trim() : '',
      kota: body.kota ? String(body.kota).trim() : 'Indonesia',
      estimasi_santri: body.estimasi_santri || '< 50 Santri',
      paket_pilihan: body.paket_pilihan === 'Enterprise' ? 'Enterprise' : 'Gratis',
      catatan: body.catatan ? String(body.catatan).trim() : '',
      status: 'pending', // Wajib pending sampai di-ACC oleh Super Admin
      features: body.paket_pilihan === 'Enterprise'
        ? ['tahfidz', 'spp', 'presensi', 'wali', 'rumah_tangga', 'akuntansi']
        : ['tahfidz', 'wali'],
      created_at: nowIso,
    };

    loadLocalFile();
    memoryStore = [newRecord, ...memoryStore.filter(m => m.id !== newRecord.id)];
    saveLocalFile(memoryStore);

    // Kirim juga ke Supabase dengan format ISO yang valid
    try {
      await supabase.from('yayasan_registrations').upsert({
        id: newRecord.id,
        nama_yayasan: newRecord.nama_yayasan,
        nama_pimpinan: newRecord.nama_pimpinan,
        no_whatsapp: newRecord.no_whatsapp,
        email: newRecord.email || null,
        kota: newRecord.kota || 'Indonesia',
        estimasi_santri: newRecord.estimasi_santri || '< 50 Santri',
        paket_pilihan: newRecord.paket_pilihan,
        catatan: newRecord.catatan || null,
        status: 'pending',
        features: newRecord.features,
        created_at: nowIso,
        updated_at: nowIso,
      });
    } catch {}

    return NextResponse.json({ success: true, data: newRecord });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, features, activated_tenant_id, admin_email, admin_temp_password, paket_pilihan } = body;

    loadLocalFile();
    let updatedTarget: any = null;

    memoryStore = memoryStore.map((item) => {
      if (item.id === id) {
        updatedTarget = {
          ...item,
          ...(status !== undefined && { status }),
          ...(features !== undefined && { features }),
          ...(paket_pilihan !== undefined && { paket_pilihan }),
          ...(activated_tenant_id !== undefined && { activated_tenant_id }),
          ...(admin_email !== undefined && { admin_email }),
          ...(admin_temp_password !== undefined && { admin_temp_password }),
        };
        return updatedTarget;
      }
      return item;
    });

    saveLocalFile(memoryStore);

    // Update di Supabase jika ada
    try {
      await supabase
        .from('yayasan_registrations')
        .update({
          ...(status !== undefined && { status }),
          ...(features !== undefined && { features }),
          ...(paket_pilihan !== undefined && { paket_pilihan }),
          ...(activated_tenant_id !== undefined && { activated_tenant_id }),
          ...(admin_email !== undefined && { admin_email }),
          ...(admin_temp_password !== undefined && { admin_temp_password }),
        })
        .eq('id', id);
    } catch {}

    return NextResponse.json({ success: true, data: updatedTarget });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    loadLocalFile();
    memoryStore = memoryStore.filter((m) => m.id !== id);
    saveLocalFile(memoryStore);

    try {
      await supabase.from('yayasan_registrations').delete().eq('id', id);
    } catch {}

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
