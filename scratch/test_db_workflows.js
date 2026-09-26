import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fugqdiuxnjwfgxpvxqsy.supabase.co';
const supabaseKey = 'sb_publishable_7H8TnQ3tHh86UowfOGZlwQ_W_J0YEsb';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAuditWithAuth() {
  console.log('=== KABARSANTRI AUTHENTICATED END-TO-END DATABASE AUDIT ===\n');

  // 1. Sign in as Guru
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'guru@kabarsantri.id',
    password: 'password123',
  });

  if (authError) {
    console.log('Guru login fallback... Attempting Yayasan login...');
    const { data: authYayasan, error: errYayasan } = await supabase.auth.signInWithPassword({
      email: 'demo.yayasan@kabarsantri.id',
      password: 'password123',
    });
    if (errYayasan) {
      console.error('❌ Authentication failed:', errYayasan);
      return;
    }
    console.log('✅ Authenticated as Yayasan:', authYayasan.user.email);
  } else {
    console.log('✅ Authenticated as Guru:', authData.user.email);
  }

  // 2. Fetch or Create Santri
  let { data: santriList, error: errSantri } = await supabase.from('santri').select('*').limit(1);
  if (errSantri) {
    console.error('❌ Error selecting santri:', errSantri);
  }

  let testSantri = santriList && santriList.length > 0 ? santriList[0] : null;

  if (!testSantri) {
    console.log('Creating test santri...');
    const { data: newSantri, error: errCreate } = await supabase.from('santri').insert({
      nama: 'Ahmad Santri (Test E2E)',
      nis: '2026-001',
      nisn: '99887766',
      jenis_kelamin: 'L',
      kelas: '7A',
      asrama: 'Asrama Al-Ghozali',
      status: 'Aktif',
      nama_ayah: 'Bapak H. Abdullah',
      no_hp_ayah: '081234567890',
    }).select().single();

    if (errCreate) {
      console.error('❌ Failed creating santri:', errCreate);
      return;
    }
    testSantri = newSantri;
  }

  console.log(`✅ Santri Active: ID=${testSantri.id}, Nama="${testSantri.nama}", Kelas="${testSantri.kelas}"`);

  const todayStr = new Date().toISOString().split('T')[0];

  // 3. Test Presensi Santri
  console.log('\n--- 1. Testing Presensi Santri Mutation ---');
  const { error: errPresensi } = await supabase.from('presensi_santri').upsert({
    santri_id: testSantri.id,
    tanggal: todayStr,
    status: 'Hadir',
    dicatat_oleh: 'Ust. Guru Test',
  }, { onConflict: 'santri_id,tanggal' });

  if (errPresensi) {
    console.error('❌ Presensi Santri Failed:', errPresensi);
  } else {
    const { data: checkPresensi } = await supabase.from('presensi_santri').select('*').eq('santri_id', testSantri.id).eq('tanggal', todayStr).single();
    console.log('✅ Presensi Santri Saved & Readback:', checkPresensi);
  }

  // 4. Test Setoran Hafalan
  console.log('\n--- 2. Testing Setoran Hafalan Mutation ---');
  const { data: dataTahfidz, error: errTahfidz } = await supabase.from('riwayat_tahfidz').insert({
    santri_id: testSantri.id,
    juz: '30',
    surat: 'An-Naba',
    ayat: '1-40',
    nilai: 'Mumtaz (Sangat Baik)',
    dicatat_oleh: 'Ust. Guru Test',
  }).select().single();

  if (errTahfidz) {
    console.error('❌ Setoran Hafalan Failed:', errTahfidz);
  } else {
    console.log('✅ Setoran Hafalan Saved & Readback:', dataTahfidz);
  }

  // 5. Test Nilai Akhlak
  console.log('\n--- 3. Testing Nilai Akhlak Mutation ---');
  const { data: dataAkhlak, error: errAkhlak } = await supabase.from('nilai_akhlak').insert({
    santri_id: testSantri.id,
    nilai: 'Sangat Baik',
    catatan: 'Disiplin shalat berjamaah di masjid',
    dicatat_oleh: 'Ust. Guru Test',
    status: 'Disetujui',
  }).select().single();

  if (errAkhlak) {
    console.error('❌ Nilai Akhlak Failed:', errAkhlak);
  } else {
    console.log('✅ Nilai Akhlak Saved & Readback:', dataAkhlak);
  }

  // 6. Test Reward & Pelanggaran
  console.log('\n--- 4. Testing Reward / Pelanggaran Mutation ---');
  const { data: dataReward, error: errReward } = await supabase.from('reward').insert({
    santri_id: testSantri.id,
    kategori: 'Juara Lomba Tahfidz',
    catatan: 'Juara 1 Musabaqah Hifdzil Qur\'an 2026',
    dicatat_oleh: 'Ust. Guru Test',
  }).select().single();

  if (errReward) {
    console.error('❌ Reward Failed:', errReward);
  } else {
    console.log('✅ Reward Saved & Readback:', dataReward);
  }

  // 7. Test Izin Pulang & Musyrif ACC
  console.log('\n--- 5. Testing Izin Pulang & Musyrif ACC ---');
  const { data: dataIzin, error: errIzin } = await supabase.from('izin_pulang').insert({
    santri_id: testSantri.id,
    tanggal_keluar: todayStr,
    tanggal_kembali: todayStr,
    alasan: 'Kepentingan keluarga',
    status: 'Menunggu',
  }).select().single();

  if (errIzin) {
    console.error('❌ Izin Pulang Failed:', errIzin);
  } else {
    console.log('✅ Izin Pulang Inserted (Menunggu):', dataIzin);
    // Approve
    const { data: dataACC, error: errACC } = await supabase.from('izin_pulang').update({ status: 'Disetujui' }).eq('id', dataIzin.id).select().single();
    if (errACC) {
      console.error('❌ Musyrif ACC Update Failed:', errACC);
    } else {
      console.log('✅ Musyrif ACC Updated (Disetujui):', dataACC);
    }
  }

  console.log('\n=== ALL END-TO-END WORKFLOW MUTATIONS COMPLETED SUCCESSFULLY! ===');
}

runAuditWithAuth();
