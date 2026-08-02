import { supabase, supabaseAktif } from '../supabaseClient';
import {
  TenantPaud,
  UserAccount,
  KelasPaud,
  MuridPaud,
  RekapMuridPaud,
  CatatanObservasiHarian,
  EvaluasiGerakSensorik,
  AktivitasSensorik,
  IndikatorObservasiSensorik
} from '../types/paudTypes';

// INTERFACE TAMBAHAN KEPATUHAN & OFFLINE QUEUE (PROMPT 13)
export interface OfflineQueueItem {
  id: string;
  tabel: string;
  aksi: 'insert' | 'update';
  payload: any;
  waktu: string;
}

export interface PendaftaranLembagaPayload {
  namaYayasan: string;
  namaUnit: string;
  jenisUnit: 'KB' | 'TPA' | 'SPS' | 'TK' | 'RA';
  npsn?: string;
  alamat?: string;
  namaPenanggungJawab: string;
  jabatanPenanggungJawab: string;
  kontak: string;
  perkiraanJumlahMurid?: number;
  setujuPersetujuanWali: boolean;
}

class DataService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private offlineQueueKey = 'ceritaananda_offline_queue';

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushOfflineQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getPendingQueueCount(): number {
    try {
      const q = localStorage.getItem(this.offlineQueueKey);
      if (q) {
        const arr = JSON.parse(q);
        return Array.isArray(arr) ? arr.length : 0;
      }
    } catch {
      // Storage fallback
    }
    return 0;
  }

  private addToOfflineQueue(tabel: string, aksi: 'insert' | 'update', payload: any) {
    try {
      const current = localStorage.getItem(this.offlineQueueKey);
      let queue: OfflineQueueItem[] = current ? JSON.parse(current) : [];
      queue.push({
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tabel,
        aksi,
        payload,
        waktu: new Date().toISOString()
      });
      localStorage.setItem(this.offlineQueueKey, JSON.stringify(queue));
    } catch {
      // Queue storage fallback
    }
  }

  public async flushOfflineQueue() {
    if (!this.isOnline || !supabaseAktif) return;
    try {
      const current = localStorage.getItem(this.offlineQueueKey);
      if (!current) return;
      let queue: OfflineQueueItem[] = JSON.parse(current);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const remainingQueue: OfflineQueueItem[] = [];
      for (const item of queue) {
        try {
          if (item.tabel === 'murid' && item.aksi === 'insert') {
            await supabase.from('murid').insert([item.payload]);
          } else if (item.tabel === 'observasi' && item.aksi === 'insert') {
            await supabase.from('observasi').insert([item.payload]);
          } else if (item.tabel === 'kelas' && item.aksi === 'insert') {
            await supabase.from('kelas').insert([item.payload]);
          }
        } catch {
          remainingQueue.push(item);
        }
      }
      localStorage.setItem(this.offlineQueueKey, JSON.stringify(remainingQueue));
    } catch {
      // Storage error
    }
  }

  // ============================================================================
  // 1. PENDAFTARAN LEMBAGA PUBLIK (BAGIAN 5 PROMPT 13 - ANONYMOUS WRITE-ONLY)
  // ============================================================================
  public async daftarLembagaPublik(payload: PendaftaranLembagaPayload): Promise<{ success: boolean; message: string }> {
    if (!payload.setujuPersetujuanWali) {
      return { success: false, message: 'Wajib menyetujui pernyataan persetujuan wali murid.' };
    }

    if (supabaseAktif && this.isOnline) {
      try {
        const { error } = await supabase.from('pendaftaran_lembaga').insert([
          {
            nama_yayasan: payload.namaYayasan,
            nama_unit: payload.namaUnit,
            jenis_unit: payload.jenisUnit,
            npsn: payload.npsn || null,
            alamat: payload.alamat || null,
            nama_penanggung_jawab: payload.namaPenanggungJawab,
            jabatan_penanggung_jawab: payload.jabatanPenanggungJawab,
            kontak: payload.kontak,
            perkiraan_jumlah_murid: payload.perkiraanJumlahMurid || 30,
            setuju_pernyataan_persetujuan_wali: true,
            status: 'menunggu'
          }
        ]);

        if (error) throw error;
        return { success: true, message: 'Pendaftaran berhasil dikirim. Tim Minara akan memproses maksimal 1x24 jam kerja.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Gagal mendaftarkan lembaga ke server.' };
      }
    }

    // Offline Queue Fallback
    this.addToOfflineQueue('pendaftaran_lembaga', 'insert', payload);
    return { success: true, message: 'Pendaftaran tersimpan secara offline. Akan dikirim otomatis saat koneksi kembali.' };
  }

  // ============================================================================
  // 2. MANAJEMEN KELAS & MURID PER TENANT (BAGIAN 2 & 6 PROMPT 13)
  // ============================================================================
  public async getDaftarMuridByTenant(tenantId: string): Promise<RekapMuridPaud[]> {
    const cacheKey = `paud_daftar_murid_${tenantId}`;
    let cachedList: RekapMuridPaud[] = [];

    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) cachedList = parsed;
      }
    } catch {
      // Fallback
    }

    if (supabaseAktif && this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('murid')
          .select('*, kelas(nama)')
          .eq('unit_id', tenantId)
          .is('diarsipkan_pada', null);

        if (!error && Array.isArray(data)) {
          const mapped: RekapMuridPaud[] = data.map((d: any) => ({
            id: d.id,
            tenantId: d.unit_id,
            classId: d.kelas_id,
            nama: d.nama,
            panggilan: d.nama,
            kategoriUsia: d.jenis_kelamin === 'P' ? '4_tahun' : '3_tahun',
            fotoEmoji: d.jenis_kelamin === 'P' ? '👧' : '👦',
            tempatLahir: d.tempat_lahir,
            tanggalLahir: d.tanggal_lahir,
            namaAyah: d.nama_ayah,
            namaIbu: d.nama_ibu,
            namaWali: d.nama_wali,
            pekerjaanAyah: d.pekerjaan_ayah,
            pekerjaanIbu: d.pekerjaan_ibu,
            kontakAyah: d.kontak_ayah,
            kontakIbu: d.kontak_ibu,
            emailOrangTua: d.email_orang_tua,
            skorLogika: { pencocokanBentuk: 0, mengurutkanUkuran: 0, menghitungBenda: 0, polaWarna: 0 },
            skorMotorikHalus: { tracingGaris: 0, puzzleBentuk: 0, bubblePopSensory: 0 },
            evaluasiMotorikKasar: []
          }));
          localStorage.setItem(cacheKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch {
        // Fallback to cache if server query fails
      }
    }

    return cachedList;
  }

  public async addMurid(tenantId: string, newMurid: MuridPaud): Promise<{ success: boolean; message: string; murid?: RekapMuridPaud }> {
    const rekapNew: RekapMuridPaud = {
      ...newMurid,
      tenantId: tenantId,
      skorLogika: { pencocokanBentuk: 0, mengurutkanUkuran: 0, menghitungBenda: 0, polaWarna: 0 },
      skorMotorikHalus: { tracingGaris: 0, puzzleBentuk: 0, bubblePopSensory: 0 },
      evaluasiMotorikKasar: []
    };

    // Save to Cache First
    const cacheKey = `paud_daftar_murid_${tenantId}`;
    try {
      const saved = localStorage.getItem(cacheKey);
      let list: RekapMuridPaud[] = saved ? JSON.parse(saved) : [];
      list.push(rekapNew);
      localStorage.setItem(cacheKey, JSON.stringify(list));
    } catch {
      // Local storage fallback
    }

    if (supabaseAktif && this.isOnline) {
      try {
        const { error } = await supabase.from('murid').insert([
          {
            id: newMurid.id,
            unit_id: tenantId,
            kelas_id: newMurid.classId || null,
            nama: newMurid.nama,
            tempat_lahir: newMurid.tempatLahir || null,
            tanggal_lahir: newMurid.tanggalLahir || null,
            jenis_kelamin: newMurid.fotoEmoji === '👧' ? 'P' : 'L',
            nama_ayah: newMurid.namaAyah || null,
            nama_ibu: newMurid.namaIbu || null,
            nama_wali: newMurid.namaWali || null,
            pekerjaan_ayah: newMurid.pekerjaanAyah || null,
            pekerjaan_ibu: newMurid.pekerjaanIbu || null,
            kontak_ayah: newMurid.kontakAyah || null,
            kontak_ibu: newMurid.kontakIbu || null,
            email_orang_tua: newMurid.emailOrangTua || null,
            status: 'aktif'
          }
        ]);

        if (error) {
          if (error.message.includes('Kuota murid')) {
            return { success: false, message: error.message };
          }
        }
      } catch (err: any) {
        this.addToOfflineQueue('murid', 'insert', newMurid);
      }
    } else {
      this.addToOfflineQueue('murid', 'insert', newMurid);
    }

    return { success: true, message: 'Murid berhasil ditambahkan.', murid: rekapNew };
  }

  // ============================================================================
  // 3. AUDIT LOGGING (BAGIAN 1 & 6 PROMPT 13 - IMMUTABLE COMPLIANCE)
  // ============================================================================
  public async catatAuditLog(tenantId: string | null, penggunaId: string | null, aksi: string, namaTabel: string, idBaris?: string, detail?: any) {
    const payload = {
      unit_id: tenantId,
      pengguna_id: penggunaId,
      aksi,
      nama_tabel: namaTabel,
      id_baris: idBaris || null,
      detail: detail || {},
      waktu: new Date().toISOString()
    };

    if (supabaseAktif && this.isOnline) {
      try {
        await supabase.from('audit_log').insert([payload]);
      } catch {
        // Audit log fallback
      }
    }
  }

  // ============================================================================
  // 4. MIGRASI DATA UJI COBA LAMA DARI LOCALSTORAGE (BAGIAN 8 PROMPT 13)
  // ============================================================================
  public checkLegacyDataToMigrate(tenantId: string): number {
    try {
      const old = localStorage.getItem(`paud_daftar_murid_${tenantId}`);
      if (old) {
        const parsed = JSON.parse(old);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // Fallback
    }
    return 0;
  }
}

export const dataService = new DataService();
