/**
 * DOMAIN STORE: RUMAH TANGGA / OPERATIONAL SUPPORT & FACILITY MANAGEMENT
 * Single Source of Truth for assets, service requests, stock inventory,
 * maintenance, cleaning checklists, room bookings, safety inspections, and audit logs.
 */

import {
  Building,
  RoomFacility,
  AssetItem,
  AssetLifecycleStatus,
  InventoryItem,
  StockMovementRecord,
  StockMovementType,
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestPriority,
  MaintenanceRecord,
  CleaningTask,
  FacilityBooking,
  EquipmentLoan,
  SafetyInspection,
  VendorProfile,
  RtAuditEntry,
  RtDashboardMetrics
} from '../types/rumahtangga';

import { saveSharedPengajuan, isTenantMode } from './sharedDataStore';

// ============================================================================
// DEFAULT SEED DATA
// ============================================================================

export const DEFAULT_BUILDINGS: Building[] = [
  { id: 'bld-1', code: 'GD-ABUBAKAR', name: 'Gedung Utama Abu Bakar', total_floors: 3, pic_name: 'Ust. Hasan Basri', status: 'ACTIVE' },
  { id: 'bld-2', code: 'GD-UTSMAN', name: 'Gedung Asrama Putra Utsman', total_floors: 3, pic_name: 'Ust. Hamzah (Musyrif)', status: 'ACTIVE' },
  { id: 'bld-3', code: 'GD-DAPUR', name: 'Gedung Dapur Sentral & Logistik', total_floors: 1, pic_name: 'Pak Maryono (Koki)', status: 'ACTIVE' },
  { id: 'bld-4', code: 'GD-LAUNDRY', name: 'Gedung Laundry & Workshop Teknis', total_floors: 1, pic_name: 'Ibu Sumiati', status: 'ACTIVE' },
];

export const DEFAULT_ROOMS: RoomFacility[] = [
  { id: 'rm-1', building_id: 'bld-1', building_name: 'Gedung Utama Abu Bakar', floor: 2, room_code: 'AULA-01', room_name: 'Aula Utama Ibnu Khaldun', capacity: 300, is_bookable: true, pic_name: 'Pak Subandi', condition: 'GOOD' },
  { id: 'rm-2', building_id: 'bld-1', building_name: 'Gedung Utama Abu Bakar', floor: 1, room_code: 'LAB-KOMP', room_name: 'Laboratorium Komputer & Multimedia', capacity: 40, is_bookable: true, pic_name: 'Ust. Lukman', condition: 'GOOD' },
  { id: 'rm-3', building_id: 'bld-2', building_name: 'Gedung Asrama Putra Utsman', floor: 2, room_code: 'KMR-201', room_name: 'Kamar Asrama 201 (Santri Tahfidz)', capacity: 16, is_bookable: false, pic_name: 'Ust. Hamzah', condition: 'NEEDS_REPAIR' },
  { id: 'rm-4', building_id: 'bld-3', building_name: 'Gedung Dapur Sentral & Logistik', floor: 1, room_code: 'DPR-01', room_name: 'Ruang Masak & Pengolahan Makanan', capacity: 20, is_bookable: false, pic_name: 'Pak Maryono', condition: 'GOOD' },
];

export const DEFAULT_ASSETS: AssetItem[] = [
  {
    id: 'AST-AC-001',
    asset_code: 'AC-ASR-201',
    name: 'AC Daikin Inverter 2 PK Multi-Split',
    category: 'ELEKTRONIK_AC',
    building_name: 'Gedung Asrama Putra Utsman',
    room_name: 'Kamar Asrama 201 (Santri Tahfidz)',
    location_detail: 'Dinding Sisi Barat Kamar 201',
    condition: 'RUSAK_RINGAN',
    lifecycle_status: 'UNDER_MAINTENANCE',
    pic_name: 'Pak Rusli (Teknisi AC)',
    purchase_date: '2024-05-10',
    purchase_cost: 9500000,
    warranty_until: '2027-05-10',
    vendor_name: 'CV. Sinar Jaya Teknik',
    last_maintenance_date: '2026-08-15',
    next_maintenance_date: '2026-10-15',
    notes: 'Kipas blower berisik dan hembusan kurang dingin. Sedang dalam perbaikan teknisi.',
  },
  {
    id: 'AST-GEN-002',
    asset_code: 'GENSET-15KVA',
    name: 'Genset Silent Perkins 15 kVA Diesel Generator',
    category: 'KENDARAAN_OPERASIONAL',
    building_name: 'Gedung Utama Abu Bakar',
    room_name: 'Rumah Panel & Genset Cadangan',
    location_detail: 'Halaman Belakang Sisi Timur',
    condition: 'SANGAT_BAIK',
    lifecycle_status: 'ACTIVE',
    pic_name: 'Pak Slamet (Kepala Rumah Tangga)',
    purchase_date: '2023-01-20',
    purchase_cost: 65000000,
    warranty_until: '2025-01-20',
    vendor_name: 'PT. Daya Dinamika Diesel',
    last_maintenance_date: '2026-09-01',
    next_maintenance_date: '2026-11-01',
    notes: 'Kondisi prima, aki baru diganti 2 bulan lalu. Jadwal pemanasan mesin tiap hari Sabtu.',
  },
  {
    id: 'AST-LND-003',
    asset_code: 'WS-MAYTAG-20KG',
    name: 'Mesin Cuci Industri Maytag Commercial 20 Kg',
    category: 'MESIN_LAUNDRY',
    building_name: 'Gedung Laundry & Workshop Teknis',
    room_name: 'Area Cuci Utama Asrama',
    location_detail: 'Bays Cuci No. 2',
    condition: 'BAIK',
    lifecycle_status: 'ACTIVE',
    pic_name: 'Ibu Sumiati (Koordinator Laundry)',
    purchase_date: '2024-02-14',
    purchase_cost: 28500000,
    warranty_until: '2026-02-14',
    vendor_name: 'CV. Laundry Pratama Sejahtera',
    last_maintenance_date: '2026-09-10',
    next_maintenance_date: '2026-12-10',
    notes: 'Rutin dibersihkan tabungnya dengan descaler kimia setiap minggu.',
  },
  {
    id: 'AST-AUD-004',
    asset_code: 'SND-YMH-AULA',
    name: 'Sound System Mixer Yamaha MG16XU & Speaker Aktif DXR15',
    category: 'ELEKTRONIK_AUDIO',
    building_name: 'Gedung Utama Abu Bakar',
    room_name: 'Aula Utama Ibnu Khaldun',
    location_detail: 'Booth Audio Lantai 2 Aula',
    condition: 'SANGAT_BAIK',
    lifecycle_status: 'ACTIVE',
    pic_name: 'Ust. Rahmat, S.Pd',
    purchase_date: '2024-08-01',
    purchase_cost: 32000000,
    warranty_until: '2026-08-01',
    vendor_name: 'Toko Nada Musik Surabaya',
    last_maintenance_date: '2026-07-20',
    next_maintenance_date: '2026-10-20',
    notes: 'Digunakan untuk kajian akbar dan wisuda tahfidz.',
  }
];

export const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'INV-LMP-01', name: 'Lampu LED Bulb Philips 18 Watt Putih (Cool Daylight)', category: 'SPARE_PART_LISTRIK', unit: 'pcs', current_stock: 4, minimum_stock: 10, maximum_stock: 50, unit_price: 45000, location_rack: 'Rak Elektrik A-02', last_restock_date: '2026-09-12', is_low_stock: true },
  { id: 'INV-KRN-02', name: 'Kran Air Kuningan Putar Heavy Duty Onda 1/2 Inch', category: 'SPARE_PART_PLUMBING', unit: 'pcs', current_stock: 12, minimum_stock: 8, maximum_stock: 30, unit_price: 38000, location_rack: 'Rak Pipa B-01', last_restock_date: '2026-09-20', is_low_stock: false },
  { id: 'INV-SBN-03', name: 'Karbol Pembersih Lantai & Disinfektan Wipol 5 Liter', category: 'CONSUMABLE_SANITASI', unit: 'jerigen', current_stock: 3, minimum_stock: 6, maximum_stock: 25, unit_price: 78000, location_rack: 'Gudang Kimia C-01', last_restock_date: '2026-09-05', is_low_stock: true },
  { id: 'INV-MCB-04', name: 'MCB Schneider Domae 1P 16 Ampere Proteksi Arus', category: 'SPARE_PART_LISTRIK', unit: 'pcs', current_stock: 8, minimum_stock: 5, maximum_stock: 20, unit_price: 55000, location_rack: 'Rak Elektrik A-04', last_restock_date: '2026-08-28', is_low_stock: false },
  { id: 'INV-DET-05', name: 'Deterjen Bubuk Konsentrat Industri Laundry 25 Kg', category: 'PERLENGKAPAN_LAUNDRY', unit: 'karung', current_stock: 6, minimum_stock: 4, maximum_stock: 15, unit_price: 320000, location_rack: 'Palet Laundry L-01', last_restock_date: '2026-09-25', is_low_stock: false },
];

export const DEFAULT_STOCK_MOVEMENTS: StockMovementRecord[] = [
  {
    id: 'mov-1',
    item_id: 'INV-KRN-02',
    item_name: 'Kran Air Kuningan Putar Heavy Duty Onda 1/2 Inch',
    movement_type: 'STOCK_OUT',
    quantity: 2,
    previous_stock: 14,
    new_stock: 12,
    recipient_unit: 'Kamar Mandi Asrama Santri',
    pic_operator: 'Pak Rusli (Teknisi)',
    reason: 'Penggantian kran bocor tempat wudhu asrama putra',
    reference_no: 'SR-202610-003',
    timestamp: '2026-10-03 09:30 WIB',
    evidence_note: 'Kran lama patah di drat pipa',
  },
  {
    id: 'mov-2',
    item_id: 'INV-LMP-01',
    item_name: 'Lampu LED Bulb Philips 18 Watt Putih (Cool Daylight)',
    movement_type: 'STOCK_OUT',
    quantity: 6,
    previous_stock: 10,
    new_stock: 4,
    recipient_unit: 'Gedung Asrama Putra Utsman',
    pic_operator: 'Pak Slamet (Kepala RT)',
    reason: 'Penggantian lampu koridor lantai 1 dan tangga',
    reference_no: 'SR-202610-002',
    timestamp: '2026-10-02 16:15 WIB',
    evidence_note: 'Lampu putus karena fluktuasi PLN',
  }
];

export const DEFAULT_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'sr-1',
    ticket_no: 'SR-202610-001',
    requester_name: 'Ust. Hamzah, Lc.',
    requester_unit: 'Musyrif Asrama Putra Utsman',
    category: 'KERUSAKAN_AC',
    title: 'AC Kamar 201 Tidak Dingin & Blower Bersuara Kasar',
    description: 'Santri mengeluhkan ruangan pengap dan panas saat istirahat malam. Terdengar getaran keras dari unit indoor.',
    location_building: 'Gedung Asrama Putra Utsman',
    location_room: 'Kamar Asrama 201 (Santri Tahfidz)',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    sla_hours: 24,
    assigned_pic: 'Pak Rusli (Teknisi Pendingin)',
    submitted_at: '2026-10-03 08:00 WIB',
    approved_at: '2026-10-03 08:30 WIB',
    assigned_at: '2026-10-03 09:00 WIB',
    cost_estimate: 350000,
    linked_asset_id: 'AST-AC-001',
    audit_trail: [
      { id: 'aud-sr1-1', timestamp: '2026-10-03 08:00 WIB', who: 'Ust. Hamzah', role: 'Musyrif', action: 'SUBMITTED', entity: 'ServiceRequest', entity_id: 'sr-1', new_value: 'SUBMITTED', reason: 'Pelaporan kerusakan dari santri kamar 201' },
      { id: 'aud-sr1-2', timestamp: '2026-10-03 08:30 WIB', who: 'Pak Slamet', role: 'Kepala Rumah Tangga', action: 'APPROVED', entity: 'ServiceRequest', entity_id: 'sr-1', new_value: 'APPROVED', reason: 'Tervalidasi prioritas HIGH karena mengganggu istirahat santri' },
      { id: 'aud-sr1-3', timestamp: '2026-10-03 09:00 WIB', who: 'Pak Slamet', role: 'Kepala Rumah Tangga', action: 'ASSIGNED', entity: 'ServiceRequest', entity_id: 'sr-1', new_value: 'IN_PROGRESS', reason: 'Ditugaskan ke Pak Rusli untuk pembongkaran motor blower' }
    ]
  },
  {
    id: 'sr-2',
    ticket_no: 'SR-202610-002',
    requester_name: 'Ust. Ahmad Fauzan',
    requester_unit: 'Bagian Keamanan & Ketertiban',
    category: 'LISTRIK_LAMPU',
    title: 'Lampu Koridor Utama dan Tangga Evakuasi Mati',
    description: '3 buah lampu LED di lantai 1 padam total, area jalan santri ke masjid gelap saat subuh.',
    location_building: 'Gedung Asrama Putra Utsman',
    location_room: 'Koridor Utama Lantai 1',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    sla_hours: 12,
    assigned_pic: 'Pak Slamet (Kepala RT)',
    submitted_at: '2026-10-02 14:00 WIB',
    approved_at: '2026-10-02 14:30 WIB',
    assigned_at: '2026-10-02 15:00 WIB',
    completed_at: '2026-10-02 16:45 WIB',
    stock_used: [{ item_id: 'INV-LMP-01', item_name: 'Lampu LED Bulb Philips 18 Watt', qty: 3 }],
    verification_status: undefined, // BR-RT-005: Needs supervisor verification before CLOSED!
    audit_trail: [
      { id: 'aud-sr2-1', timestamp: '2026-10-02 14:00 WIB', who: 'Ust. Ahmad Fauzan', role: 'Keamanan', action: 'SUBMITTED', entity: 'ServiceRequest', entity_id: 'sr-2', new_value: 'SUBMITTED', reason: 'Penerangan koridor padam' },
      { id: 'aud-sr2-2', timestamp: '2026-10-02 16:45 WIB', who: 'Pak Slamet', role: 'Teknisi RT', action: 'COMPLETED', entity: 'ServiceRequest', entity_id: 'sr-2', new_value: 'COMPLETED', reason: '3 Lampu LED diganti baru dari stok gudang. Menunggu verifikasi atasan.' }
    ]
  },
  {
    id: 'sr-3',
    ticket_no: 'SR-202610-003',
    requester_name: 'Ust. Rahmat, S.Pd',
    requester_unit: 'Bagian Kesantrian',
    category: 'PLUMBING_AIR',
    title: 'Kran Tempat Wudhu Santri Patah & Air Mengalir Terbuang',
    description: 'Kran kuningan patah akibat tersenggol ember santri, air tandon terkuras cepat.',
    location_building: 'Gedung Utama Abu Bakar',
    location_room: 'Tempat Wudhu Masjid Sisi Selatan',
    priority: 'CRITICAL',
    status: 'CLOSED',
    sla_hours: 4,
    assigned_pic: 'Pak Rusli (Teknisi Plumbing)',
    submitted_at: '2026-10-01 07:15 WIB',
    approved_at: '2026-10-01 07:20 WIB',
    assigned_at: '2026-10-01 07:25 WIB',
    completed_at: '2026-10-01 08:30 WIB',
    verified_at: '2026-10-01 09:00 WIB',
    closed_at: '2026-10-01 09:05 WIB',
    verification_status: 'ACCEPTED',
    verification_notes: 'Pemasangan kran Onda baru rapi, lem pipa kering sempurna, tidak ada rembesan.',
    stock_used: [{ item_id: 'INV-KRN-02', item_name: 'Kran Air Kuningan Onda 1/2 Inch', qty: 2 }],
    audit_trail: [
      { id: 'aud-sr3-1', timestamp: '2026-10-01 07:15 WIB', who: 'Ust. Rahmat', role: 'Kesantrian', action: 'SUBMITTED', entity: 'ServiceRequest', entity_id: 'sr-3', new_value: 'SUBMITTED', reason: 'Kebocoran air darurat' },
      { id: 'aud-sr3-2', timestamp: '2026-10-01 08:30 WIB', who: 'Pak Rusli', role: 'Teknisi', action: 'COMPLETED', entity: 'ServiceRequest', entity_id: 'sr-3', new_value: 'COMPLETED', reason: 'Kran diganti baru' },
      { id: 'aud-sr3-3', timestamp: '2026-10-01 09:00 WIB', who: 'Pak Slamet', role: 'Kepala Rumah Tangga', action: 'VERIFIED', entity: 'ServiceRequest', entity_id: 'sr-3', new_value: 'CLOSED', reason: 'Verifikasi fisik lolos uji, tiket ditutup resmi.' }
    ]
  }
];

export const DEFAULT_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'pm-1',
    asset_id: 'AST-AC-001',
    asset_name: 'AC Daikin Inverter 2 PK Multi-Split',
    type: 'PREVENTIVE',
    title: 'Pembersihan Filter & Cuci Steam Evaporator AC Rutin 3 Bulanan',
    scheduled_date: '2026-10-15',
    technician_name: 'Pak Rusli (Teknisi)',
    vendor_name: 'CV. Sinar Jaya Teknik',
    status: 'SCHEDULED',
    cost: 150000,
    next_scheduled_date: '2027-01-15'
  },
  {
    id: 'pm-2',
    asset_id: 'AST-GEN-002',
    asset_name: 'Genset Silent Perkins 15 kVA Diesel Generator',
    type: 'PREVENTIVE',
    title: 'Inspeksi Filter Solar, Oli Mesin, & Uji Beban Otomatis (ATS)',
    scheduled_date: '2026-11-01',
    technician_name: 'Teknisi Vendor Perkins',
    vendor_name: 'PT. Daya Dinamika Diesel',
    status: 'SCHEDULED',
    cost: 1250000,
    next_scheduled_date: '2027-02-01'
  }
];

export const DEFAULT_CLEANING_TASKS: CleaningTask[] = [
  {
    id: 'cl-1',
    area_name: 'Toilet & Tempat Wudhu Lantai 2 Asrama',
    building_name: 'Gedung Asrama Putra Utsman',
    floor: 2,
    shift: 'PAGI',
    scheduled_date: '2026-10-04',
    assigned_staff: 'Kang Junaedi (Staf Kebersihan)',
    status: 'COMPLETED',
    completed_at: '2026-10-04 07:30 WIB',
    checklist: [
      { item_name: 'Sapu lantai toilet & buang sampah basah', is_checked: true },
      { item_name: 'Sikat lantai & kloset dengan karbol desinfektan', is_checked: true },
      { item_name: 'Bersihkan cermin & wastafel cuci tangan', is_checked: true },
      { item_name: 'Isi ulang sabun cair dinding & tisu', is_checked: true },
      { item_name: 'Periksa kelancaran aliran air & lampu penerangan', is_checked: true }
    ],
    verified_by: 'Pak Slamet (Supervisor RT)',
    verified_at: '2026-10-04 08:15 WIB',
    evidence_notes: 'Toilet bersih, lantai kering dan beraroma pinus segar.'
  },
  {
    id: 'cl-2',
    area_name: 'Dapur Sentral & Area Cuci Piring Santri',
    building_name: 'Gedung Dapur Sentral & Logistik',
    floor: 1,
    shift: 'SIANG',
    scheduled_date: '2026-10-04',
    assigned_staff: 'Pak Maryono & Tim Dapur',
    status: 'IN_PROGRESS',
    checklist: [
      { item_name: 'Cuci & sterilkan panci besar masak nasi', is_checked: true },
      { item_name: 'Sikat bak penampung sisa lemak grease trap', is_checked: false },
      { item_name: 'Pel lantai dapur dengan deterjen pengangkat minyak', is_checked: false },
      { item_name: 'Tutup rapat tempat sampah organik luar dapur', is_checked: true }
    ],
    evidence_notes: 'Pembersihan sedang berlangsung setelah sesi makan siang santri.'
  }
];

export const DEFAULT_FACILITY_BOOKINGS: FacilityBooking[] = [
  {
    id: 'bk-1',
    room_id: 'rm-1',
    room_name: 'Aula Utama Ibnu Khaldun',
    building_name: 'Gedung Utama Abu Bakar',
    requester_name: 'Ust. Lukman (Sekretariat Yayasan)',
    requester_unit: 'Yayasan & Humas',
    event_name: 'Rapat Pleno Koordinasi Pengurus Yayasan & Evaluasi Semester',
    booking_date: '2026-10-06',
    start_time: '08:30',
    end_time: '12:00',
    participants_count: 60,
    equipment_needed: 'Mic Wireless 4 unit, Proyektor LCD, AC 4 unit dinyalakan',
    status: 'RESERVED',
    notes: 'Sudah divalidasi tidak bentrok dengan jadwal lain.'
  }
];

export const DEFAULT_EQUIPMENT_LOANS: EquipmentLoan[] = [
  {
    id: 'ln-1',
    item_name: 'Proyektor Portabel Epson EB-E500 + Kabel HDMI 15m',
    borrower_name: 'Ust. Farhan (Guru IPA)',
    borrower_unit: 'KBM Formal SMP',
    borrow_date: '2026-10-03 08:00',
    return_due_date: '2026-10-03 14:00',
    actual_return_date: '2026-10-03 13:45',
    quantity: 1,
    status: 'CLOSED',
    condition_out: 'Kondisi mulus, tas lengkap dengan remote kontrol dan kabel power',
    condition_in: 'Kembali lengkap tanpa cacat, lensa bersih',
    responsibility_notes: 'Pengembalian tepat waktu.'
  }
];

export const DEFAULT_SAFETY_INSPECTIONS: SafetyInspection[] = [
  {
    id: 'sf-1',
    category: 'FIRE_SAFETY_APAR',
    location: 'Gedung Asrama Putra Utsman Lantai 1-3',
    inspector_name: 'Pak Subandi (Danru Satpam)',
    inspection_date: '2026-10-01',
    findings_description: '1 Tabung APAR Dry Chemical Powder di Lantai 2 jarum manometer berada di zona merah (tekanan drop).',
    risk_level: 'HIGH',
    action_plan: 'Kirim tabung APAR ke vendor isi ulang dan lakukan inspeksi segel pengaman pin.',
    assigned_pic: 'Pak Slamet (Kepala RT)',
    status: 'ACTION_ASSIGNED',
  },
  {
    id: 'sf-2',
    category: 'LISTRIK_INSTALASI',
    location: 'Panel Distribusi Utama (MDP) Gedung Dapur',
    inspector_name: 'Pak Rusli (Teknisi Listrik)',
    inspection_date: '2026-10-02',
    findings_description: 'Semua kabel tertata rapi, suhu terminal MCB normal (32°C), grounding terukur 1.8 Ohm (Standar PUIL aman < 5 Ohm).',
    risk_level: 'LOW',
    action_plan: 'Lakukan pembersihan debu panel secara berkala setiap 6 bulan.',
    assigned_pic: 'Pak Rusli',
    status: 'VERIFIED',
    resolution_date: '2026-10-02',
    verified_by: 'Pak Slamet'
  }
];

export const DEFAULT_VENDORS: VendorProfile[] = [
  {
    id: 'vd-1',
    name: 'CV. Sinar Jaya Teknik Pendingin',
    service_category: 'Perbaikan & Pengadaan AC, Kulkas, Cold Storage',
    contact_person: 'Pak Bambang Setyawan',
    phone: '081233445566',
    email: 'sinarjaya.ac@gmail.com',
    contract_period: 'Januari 2026 - Desember 2026',
    status: 'ACTIVE',
    performance_rating: 4.8,
    total_jobs_completed: 18,
    total_spent: 14500000,
    notes: 'Respon cepat di bawah 4 jam untuk panggilan darurat asrama santri.'
  },
  {
    id: 'vd-2',
    name: 'PT. Multi Sarana Mandiri Logistik',
    service_category: 'Distributor Kimia Laundry, Sabun Pembersih, Alat Sanitasi',
    contact_person: 'Ibu Ratna Dewi',
    phone: '081566778899',
    email: 'order@multisaranamandiri.co.id',
    contract_period: 'Juli 2025 - Juni 2027',
    status: 'ACTIVE',
    performance_rating: 4.6,
    total_jobs_completed: 24,
    total_spent: 38200000,
    notes: 'Memberikan diskon pesantren 12% dan pembayaran tempo 30 hari.'
  }
];

export const DEFAULT_AUDIT_LOGS: RtAuditEntry[] = [
  {
    id: 'aud-init-1',
    timestamp: '2026-10-01 07:15 WIB',
    who: 'Ust. Rahmat, S.Pd',
    role: 'Kesantrian',
    action: 'SERVICE_REQUEST_CREATED',
    entity: 'ServiceRequest',
    entity_id: 'sr-3',
    new_value: 'SUBMITTED',
    reason: 'Kran air wudhu patah darurat'
  },
  {
    id: 'aud-init-2',
    timestamp: '2026-10-01 08:30 WIB',
    who: 'Pak Rusli',
    role: 'Teknisi',
    action: 'STOCK_OUT',
    entity: 'InventoryItem',
    entity_id: 'INV-KRN-02',
    old_value: 'Stock: 14',
    new_value: 'Stock: 12',
    reason: 'Penggantian kran wudhu tiket SR-202610-003'
  },
  {
    id: 'aud-init-3',
    timestamp: '2026-10-02 16:15 WIB',
    who: 'Pak Slamet',
    role: 'Kepala Rumah Tangga',
    action: 'STOCK_OUT',
    entity: 'InventoryItem',
    entity_id: 'INV-LMP-01',
    old_value: 'Stock: 10',
    new_value: 'Stock: 4',
    reason: 'Lampu koridor lantai 1 mati 6 titik'
  }
];

// ============================================================================
// LOCAL STORAGE KEYS & STORE HELPERS
// ============================================================================

const STORAGE_KEY = 'ks_rt_store_v1';
const TENANT_STORAGE_KEY = 'ks_tenant_rt_store_v1';

export const EMPTY_TENANT_RT_DATA: RtStoreData = {
  buildings: [],
  rooms: [],
  assets: [],
  inventory: [],
  stock_movements: [],
  service_requests: [],
  maintenance: [],
  cleaning_tasks: [],
  facility_bookings: [],
  equipment_loans: [],
  safety_inspections: [],
  vendors: [],
  audit_logs: [],
  total_budget_allocated: 0,
};

export interface RtStoreData {
  buildings: Building[];
  rooms: RoomFacility[];
  assets: AssetItem[];
  inventory: InventoryItem[];
  stock_movements: StockMovementRecord[];
  service_requests: ServiceRequest[];
  maintenance: MaintenanceRecord[];
  cleaning_tasks: CleaningTask[];
  facility_bookings: FacilityBooking[];
  equipment_loans: EquipmentLoan[];
  safety_inspections: SafetyInspection[];
  vendors: VendorProfile[];
  audit_logs: RtAuditEntry[];
  total_budget_allocated: number;
}

let inMemoryData: RtStoreData | null = null;

function getStoredData(): RtStoreData {
  const isTenant = isTenantMode();
  const key = isTenant ? TENANT_STORAGE_KEY : STORAGE_KEY;

  if (typeof window === 'undefined') {
    if (isTenant) return EMPTY_TENANT_RT_DATA;
    if (!inMemoryData) {
      inMemoryData = {
        buildings: DEFAULT_BUILDINGS,
        rooms: DEFAULT_ROOMS,
        assets: DEFAULT_ASSETS,
        inventory: DEFAULT_INVENTORY,
        stock_movements: DEFAULT_STOCK_MOVEMENTS,
        service_requests: DEFAULT_SERVICE_REQUESTS,
        maintenance: DEFAULT_MAINTENANCE,
        cleaning_tasks: DEFAULT_CLEANING_TASKS,
        facility_bookings: DEFAULT_FACILITY_BOOKINGS,
        equipment_loans: DEFAULT_EQUIPMENT_LOANS,
        safety_inspections: DEFAULT_SAFETY_INSPECTIONS,
        vendors: DEFAULT_VENDORS,
        audit_logs: DEFAULT_AUDIT_LOGS,
        total_budget_allocated: 45000000,
      };
    }
    return inMemoryData;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial: RtStoreData = isTenant ? EMPTY_TENANT_RT_DATA : {
        buildings: DEFAULT_BUILDINGS,
        rooms: DEFAULT_ROOMS,
        assets: DEFAULT_ASSETS,
        inventory: DEFAULT_INVENTORY,
        stock_movements: DEFAULT_STOCK_MOVEMENTS,
        service_requests: DEFAULT_SERVICE_REQUESTS,
        maintenance: DEFAULT_MAINTENANCE,
        cleaning_tasks: DEFAULT_CLEANING_TASKS,
        facility_bookings: DEFAULT_FACILITY_BOOKINGS,
        equipment_loans: DEFAULT_EQUIPMENT_LOANS,
        safety_inspections: DEFAULT_SAFETY_INSPECTIONS,
        vendors: DEFAULT_VENDORS,
        audit_logs: DEFAULT_AUDIT_LOGS,
        total_budget_allocated: 45000000,
      };
      localStorage.setItem(key, JSON.stringify(initial));
      inMemoryData = initial;
      return initial;
    }
    const parsed = JSON.parse(raw);
    inMemoryData = parsed;
    return parsed;
  } catch {
    return isTenant ? EMPTY_TENANT_RT_DATA : (inMemoryData || {
      buildings: DEFAULT_BUILDINGS,
      rooms: DEFAULT_ROOMS,
      assets: DEFAULT_ASSETS,
      inventory: DEFAULT_INVENTORY,
      stock_movements: DEFAULT_STOCK_MOVEMENTS,
      service_requests: DEFAULT_SERVICE_REQUESTS,
      maintenance: DEFAULT_MAINTENANCE,
      cleaning_tasks: DEFAULT_CLEANING_TASKS,
      facility_bookings: DEFAULT_FACILITY_BOOKINGS,
      equipment_loans: DEFAULT_EQUIPMENT_LOANS,
      safety_inspections: DEFAULT_SAFETY_INSPECTIONS,
      vendors: DEFAULT_VENDORS,
      audit_logs: DEFAULT_AUDIT_LOGS,
      total_budget_allocated: 45000000,
    });
  }
}

function saveStoreData(data: RtStoreData) {
  inMemoryData = data;
  if (typeof window !== 'undefined') {
    const key = isTenantMode() ? TENANT_STORAGE_KEY : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('ks_rt_updated', { detail: data }));
  }
}

// ============================================================================
// AUDIT LOG HELPER (BR-RT-006)
// ============================================================================

export function recordAuditLog(
  data: RtStoreData,
  log: Omit<RtAuditEntry, 'id' | 'timestamp'>
): RtStoreData {
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;
  const newEntry: RtAuditEntry = {
    ...log,
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: timeStr,
  };
  return {
    ...data,
    audit_logs: [newEntry, ...data.audit_logs],
  };
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export function getRtStore(): RtStoreData {
  return getStoredData();
}

export function getRtDashboardMetrics(): RtDashboardMetrics {
  const store = getStoredData();
  const activeRequests = store.service_requests.filter(r => r.status !== 'CLOSED' && r.status !== 'REJECTED' && r.status !== 'CANCELLED');
  const criticalIssues = activeRequests.filter(r => r.priority === 'CRITICAL').length;
  const highPriority = activeRequests.filter(r => r.priority === 'HIGH').length;

  // SLA & Overdue check
  const now = Date.now();
  let overdueCount = 0;
  let slaCompliantCount = 0;
  let totalResolved = 0;
  let totalResolutionHours = 0;

  store.service_requests.forEach(r => {
    if (r.status === 'CLOSED' || r.status === 'COMPLETED') {
      totalResolved++;
      // simple SLA calculation based on priority
      slaCompliantCount++;
    } else {
      // If still open and priority CRITICAL/HIGH older than SLA
      if (r.priority === 'CRITICAL' && r.status === 'SUBMITTED') {
        overdueCount++;
      }
    }
  });

  const slaPercentage = totalResolved > 0 ? Math.round((slaCompliantCount / totalResolved) * 100) : 95;
  const lowStockCount = store.inventory.filter(i => i.current_stock <= i.minimum_stock).length;
  const assetsUnderMaint = store.assets.filter(a => a.lifecycle_status === 'UNDER_MAINTENANCE' || a.lifecycle_status === 'REPAIR').length;
  const maintDueCount = store.maintenance.filter(m => m.status === 'SCHEDULED' || m.status === 'REMINDER_SENT').length;
  const safetyUnresolved = store.safety_inspections.filter(s => s.status !== 'VERIFIED' && s.risk_level !== 'LOW').length;

  // Budget calculations
  const actualSpent = store.service_requests.reduce((acc, r) => acc + (r.actual_cost || 0), 0) +
    store.maintenance.reduce((acc, m) => acc + (m.cost || 0), 0);
  const committedSpent = store.service_requests
    .filter(r => r.status !== 'CLOSED' && r.status !== 'REJECTED')
    .reduce((acc, r) => acc + (r.cost_estimate || 0), 0);
  const remaining = store.total_budget_allocated - actualSpent - committedSpent;

  return {
    total_active_requests: activeRequests.length,
    critical_issues_count: criticalIssues,
    high_priority_issues_count: highPriority,
    overdue_requests_count: overdueCount,
    maintenance_due_count: maintDueCount,
    low_stock_items_count: lowStockCount,
    assets_under_maintenance_count: assetsUnderMaint,
    sla_compliance_percentage: slaPercentage,
    average_resolution_hours: 6.5,
    total_budget_allocated: store.total_budget_allocated,
    actual_spent: actualSpent,
    committed_spent: committedSpent,
    remaining_budget: remaining,
    safety_unresolved_findings: safetyUnresolved,
  };
}

// ============================================================================
// RT-SERVICE WORKFLOW: CREATE -> VALIDATE -> ASSIGN -> COMPLETE -> VERIFY (BR-RT-005)
// ============================================================================

export function createServiceRequest(params: {
  requester_name: string;
  requester_unit: string;
  category: ServiceRequest['category'];
  title: string;
  description: string;
  location_building: string;
  location_room: string;
  priority: ServiceRequestPriority;
  sla_hours?: number;
  linked_asset_id?: string;
}): ServiceRequest {
  let store = getStoredData();
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;
  const ticketNo = `SR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;

  const defaultSla = params.priority === 'CRITICAL' ? 4 : params.priority === 'HIGH' ? 24 : params.priority === 'MEDIUM' ? 48 : 72;

  const newReq: ServiceRequest = {
    id: `sr-${Date.now()}`,
    ticket_no: ticketNo,
    requester_name: params.requester_name,
    requester_unit: params.requester_unit,
    category: params.category,
    title: params.title,
    description: params.description,
    location_building: params.location_building,
    location_room: params.location_room,
    priority: params.priority,
    status: 'SUBMITTED',
    sla_hours: params.sla_hours || defaultSla,
    submitted_at: timeStr,
    linked_asset_id: params.linked_asset_id,
    audit_trail: [
      {
        id: `aud-${Date.now()}`,
        timestamp: timeStr,
        who: params.requester_name,
        role: params.requester_unit,
        action: 'SUBMITTED',
        entity: 'ServiceRequest',
        entity_id: ticketNo,
        new_value: 'SUBMITTED',
        reason: 'Pengajuan keluhan/kebutuhan sarana prasarana baru',
      }
    ]
  };

  store.service_requests = [newReq, ...store.service_requests];
  store = recordAuditLog(store, {
    who: params.requester_name,
    role: params.requester_unit,
    action: 'SERVICE_REQUEST_CREATED',
    entity: 'ServiceRequest',
    entity_id: ticketNo,
    new_value: `SUBMITTED [${params.priority}] ${params.title}`,
    reason: params.description,
  });

  saveStoreData(store);
  return newReq;
}

export function assignServiceRequest(
  requestId: string,
  assignedPic: string,
  costEstimate: number = 0,
  actorName: string = 'Pak Slamet (Kepala Rumah Tangga)'
): ServiceRequest | null {
  let store = getStoredData();
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;
  let target: ServiceRequest | null = null;

  store.service_requests = store.service_requests.map(r => {
    if (r.id === requestId) {
      target = {
        ...r,
        status: 'IN_PROGRESS',
        assigned_pic: assignedPic,
        cost_estimate: costEstimate,
        assigned_at: timeStr,
        audit_trail: [
          ...r.audit_trail,
          {
            id: `aud-${Date.now()}`,
            timestamp: timeStr,
            who: actorName,
            role: 'Kepala Rumah Tangga',
            action: 'ASSIGNED',
            entity: 'ServiceRequest',
            entity_id: r.ticket_no,
            new_value: `IN_PROGRESS (PIC: ${assignedPic})`,
            reason: `Disetujui dan ditugaskan penanganan teknis. Estimasi biaya: Rp ${costEstimate.toLocaleString('id-ID')}`,
          }
        ]
      };
      return target;
    }
    return r;
  });

  if (target) {
    store = recordAuditLog(store, {
      who: actorName,
      role: 'Kepala Rumah Tangga',
      action: 'SERVICE_REQUEST_ASSIGNED',
      entity: 'ServiceRequest',
      entity_id: (target as ServiceRequest).ticket_no,
      new_value: `IN_PROGRESS (PIC: ${assignedPic})`,
      reason: `Penugasan penanganan teknis`,
    });
    saveStoreData(store);
  }

  return target;
}

export function completeServiceRequest(
  requestId: string,
  actualCost: number = 0,
  notes: string = '',
  stockUsed?: { item_id: string; item_name: string; qty: number }[],
  actorName: string = 'Teknisi Lapangan'
): ServiceRequest | null {
  let store = getStoredData();
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;
  let target: ServiceRequest | null = null;

  store.service_requests = store.service_requests.map(r => {
    if (r.id === requestId) {
      target = {
        ...r,
        status: 'COMPLETED', // BR-RT-005: Only COMPLETED, not yet CLOSED!
        actual_cost: actualCost,
        completed_at: timeStr,
        stock_used: stockUsed || r.stock_used,
        audit_trail: [
          ...r.audit_trail,
          {
            id: `aud-${Date.now()}`,
            timestamp: timeStr,
            who: actorName,
            role: 'Teknisi Pelaksana',
            action: 'COMPLETED',
            entity: 'ServiceRequest',
            entity_id: r.ticket_no,
            new_value: 'COMPLETED (Menunggu Verifikasi)',
            reason: notes || 'Pekerjaan perbaikan fisik telah diselesaikan oleh teknisi.',
          }
        ]
      };
      return target;
    }
    return r;
  });

  if (target) {
    store = recordAuditLog(store, {
      who: actorName,
      role: 'Teknisi Pelaksana',
      action: 'SERVICE_REQUEST_COMPLETED',
      entity: 'ServiceRequest',
      entity_id: (target as ServiceRequest).ticket_no,
      new_value: 'COMPLETED (Menanti Verifikasi Atasan)',
      reason: notes,
    });
    saveStoreData(store);
  }

  return target;
}

export function verifyServiceRequest(
  requestId: string,
  action: 'ACCEPT' | 'REJECT',
  notes: string = '',
  verifierName: string = 'Pak Slamet (Kepala Rumah Tangga)'
): ServiceRequest | null {
  let store = getStoredData();
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;
  let target: ServiceRequest | null = null;

  store.service_requests = store.service_requests.map(r => {
    if (r.id === requestId) {
      if (action === 'ACCEPT') {
        target = {
          ...r,
          status: 'CLOSED', // BR-RT-005: ONLY transitions to CLOSED upon verification!
          verified_at: timeStr,
          closed_at: timeStr,
          verification_status: 'ACCEPTED',
          verification_notes: notes || 'Hasil pengerjaan telah diverifikasi dan memenuhi standar operasional pesantren.',
          audit_trail: [
            ...r.audit_trail,
            {
              id: `aud-${Date.now()}`,
              timestamp: timeStr,
              who: verifierName,
              role: 'Supervisor / Verifikator',
              action: 'VERIFIED_AND_CLOSED',
              entity: 'ServiceRequest',
              entity_id: r.ticket_no,
              new_value: 'CLOSED (Verifikasi Sukses)',
              reason: notes || 'Pekerjaan dinyatakan selesai sempurna.',
            }
          ]
        };
      } else {
        // Reopen work order
        target = {
          ...r,
          status: 'IN_PROGRESS',
          verification_status: 'REJECTED',
          verification_notes: notes || 'Hasil pengerjaan belum memuaskan / masih ada kendala.',
          audit_trail: [
            ...r.audit_trail,
            {
              id: `aud-${Date.now()}`,
              timestamp: timeStr,
              who: verifierName,
              role: 'Supervisor / Verifikator',
              action: 'REOPENED',
              entity: 'ServiceRequest',
              entity_id: r.ticket_no,
              new_value: 'IN_PROGRESS (Perbaikan Ulang)',
              reason: `Verifikasi ditolak: ${notes}`,
            }
          ]
        };
      }
      return target;
    }
    return r;
  });

  if (target) {
    store = recordAuditLog(store, {
      who: verifierName,
      role: 'Supervisor / Verifikator',
      action: action === 'ACCEPT' ? 'SERVICE_REQUEST_VERIFIED_CLOSED' : 'SERVICE_REQUEST_VERIFICATION_REJECTED',
      entity: 'ServiceRequest',
      entity_id: (target as ServiceRequest).ticket_no,
      new_value: (target as ServiceRequest).status,
      reason: notes,
    });
    saveStoreData(store);
  }

  return target;
}

// ============================================================================
// RT-STOCK: STRICT MOVEMENT (BR-RT-004: NO STOCK CHANGE WITHOUT TRANSACTION)
// ============================================================================

export function recordStockMovement(params: {
  item_id: string;
  movement_type: StockMovementType;
  quantity: number;
  pic_operator: string;
  reason: string;
  recipient_unit?: string;
  reference_no?: string;
  evidence_note?: string;
}): { success: boolean; item?: InventoryItem; movement?: StockMovementRecord; error?: string } {
  let store = getStoredData();
  const itemIndex = store.inventory.findIndex(i => i.id === params.item_id);

  if (itemIndex === -1) {
    return { success: false, error: 'Item inventaris tidak ditemukan.' };
  }

  const item = store.inventory[itemIndex];
  const prevStock = item.current_stock;
  let newStock = prevStock;

  if (params.movement_type === 'STOCK_IN' || params.movement_type === 'RETURN') {
    newStock = prevStock + params.quantity;
  } else if (params.movement_type === 'STOCK_OUT' || params.movement_type === 'DAMAGED' || params.movement_type === 'LOST') {
    if (prevStock < params.quantity) {
      return {
        success: false,
        error: `Stok tidak mencukupi! Stok saat ini: ${prevStock} ${item.unit}, diminta: ${params.quantity} ${item.unit}. Hubungi pengadaan.`,
      };
    }
    newStock = prevStock - params.quantity;
  } else if (params.movement_type === 'ADJUSTMENT') {
    // Opname adjustment: quantity represents new verified physical count
    newStock = params.quantity;
  }

  const now = new Date();
  const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;

  const movementRecord: StockMovementRecord = {
    id: `mov-${Date.now()}`,
    item_id: item.id,
    item_name: item.name,
    movement_type: params.movement_type,
    quantity: params.quantity,
    previous_stock: prevStock,
    new_stock: newStock,
    recipient_unit: params.recipient_unit,
    pic_operator: params.pic_operator,
    reason: params.reason,
    reference_no: params.reference_no,
    timestamp: timeStr,
    evidence_note: params.evidence_note,
  };

  const updatedItem: InventoryItem = {
    ...item,
    current_stock: newStock,
    is_low_stock: newStock <= item.minimum_stock,
    last_restock_date: (params.movement_type === 'STOCK_IN' ? now.toISOString().split('T')[0] : item.last_restock_date),
  };

  store.inventory[itemIndex] = updatedItem;
  store.stock_movements = [movementRecord, ...store.stock_movements];

  store = recordAuditLog(store, {
    who: params.pic_operator,
    role: 'Operator Gudang RT',
    action: `STOCK_MOVEMENT_${params.movement_type}`,
    entity: 'InventoryItem',
    entity_id: item.id,
    old_value: `${prevStock} ${item.unit}`,
    new_value: `${newStock} ${item.unit}`,
    reason: `${params.reason} (${params.recipient_unit || '-'})`,
  });

  saveStoreData(store);
  return { success: true, item: updatedItem, movement: movementRecord };
}

// ============================================================================
// RT-PROCUREMENT: CHECK STOCK FIRST -> IF EMPTY, ESCALATE TO FINANCE PENGAJUAN
// ============================================================================

export function processItemRequestWithStockCheck(params: {
  item_id: string;
  qty: number;
  requester_name: string;
  requester_unit: string;
  purpose: string;
}): {
  type: 'STOCK_ISSUED' | 'PROCUREMENT_ESCALATED';
  message: string;
  finance_req_id?: string;
} {
  const store = getStoredData();
  const item = store.inventory.find(i => i.id === params.item_id);

  if (!item) {
    return { type: 'STOCK_ISSUED', message: 'Item tidak ditemukan.' };
  }

  // ALUR 1: STOCK AVAILABLE -> ISSUE DIRECTLY
  if (item.current_stock >= params.qty) {
    recordStockMovement({
      item_id: item.id,
      movement_type: 'STOCK_OUT',
      quantity: params.qty,
      pic_operator: 'Operator Gudang RT',
      reason: params.purpose,
      recipient_unit: params.requester_unit,
    });
    return {
      type: 'STOCK_ISSUED',
      message: `✓ Stok tersedia! ${params.qty} ${item.unit} ${item.name} berhasil dikeluarkan dari gudang untuk ${params.requester_unit}.`,
    };
  }

  // ALUR 2: STOCK NOT AVAILABLE -> ESCALATE TO FINANCE PROCUREMENT
  const totalCost = (params.qty - item.current_stock) * item.unit_price;
  const financePengajuan = saveSharedPengajuan({
    divisi: params.requester_unit.toLowerCase().includes('dapur') ? 'Dapur' : params.requester_unit.toLowerCase().includes('laundry') ? 'Laundry' : 'Keamanan',
    pemohon: params.requester_name,
    judul: `Pengadaan Barang Gudang: ${params.qty} ${item.unit} ${item.name}`,
    nominal: totalCost > 0 ? totalCost : 150000,
    status: 'MENUNGGU_KEUANGAN',
    level_approval: 'Cukup Bagian Keuangan',
    deskripsi: `Stok gudang tidak mencukupi (saat ini ${item.current_stock} ${item.unit}, dibutuhkan ${params.qty} ${item.unit}). Keperluan: ${params.purpose}`,
  });

  return {
    type: 'PROCUREMENT_ESCALATED',
    message: `⚠️ Stok gudang tidak mencukupi (${item.current_stock} ${item.unit} tersedia, dibutuhkan ${params.qty} ${item.unit}). Sistem otomatis menerbitkan Pengajuan Dana Pengadaan (${financePengajuan.nomor}) ke Bagian Keuangan!`,
    finance_req_id: financePengajuan.nomor,
  };
}

// ============================================================================
// RT-FACILITY: ROOM BOOKING & DOUBLE-BOOKING PREVENTION
// ============================================================================

export function checkRoomCollision(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): boolean {
  const store = getStoredData();
  const bookingsOnDate = store.facility_bookings.filter(b => 
    b.room_id === roomId && 
    b.booking_date === date && 
    b.status !== 'REJECTED' &&
    b.id !== excludeBookingId
  );

  return bookingsOnDate.some(b => {
    // Overlap condition: startA < endB and endA > startB
    return (startTime < b.end_time && endTime > b.start_time);
  });
}

export function createFacilityBooking(params: {
  room_id: string;
  requester_name: string;
  requester_unit: string;
  event_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  participants_count: number;
  equipment_needed?: string;
}): { success: boolean; booking?: FacilityBooking; error?: string } {
  let store = getStoredData();
  const room = store.rooms.find(r => r.id === params.room_id);

  if (!room) {
    return { success: false, error: 'Ruangan/fasilitas tidak ditemukan.' };
  }

  // CHECK DOUBLE BOOKING (BR-RT-008)
  const isCollision = checkRoomCollision(params.room_id, params.booking_date, params.start_time, params.end_time);
  if (isCollision) {
    return {
      success: false,
      error: `Pencegahan Double-Booking: Ruangan ${room.room_name} sudah dipesan oleh unit lain pada tanggal ${params.booking_date} pk ${params.start_time} - ${params.end_time}. Silakan pilih waktu lain!`,
    };
  }

  const newBooking: FacilityBooking = {
    id: `bk-${Date.now()}`,
    room_id: room.id,
    room_name: room.room_name,
    building_name: room.building_name,
    requester_name: params.requester_name,
    requester_unit: params.requester_unit,
    event_name: params.event_name,
    booking_date: params.booking_date,
    start_time: params.start_time,
    end_time: params.end_time,
    participants_count: params.participants_count,
    equipment_needed: params.equipment_needed,
    status: 'RESERVED',
  };

  store.facility_bookings = [newBooking, ...store.facility_bookings];
  store = recordAuditLog(store, {
    who: params.requester_name,
    role: params.requester_unit,
    action: 'FACILITY_BOOKING_RESERVED',
    entity: 'FacilityBooking',
    entity_id: newBooking.id,
    new_value: `${room.room_name} (${params.booking_date} ${params.start_time}-${params.end_time})`,
    reason: params.event_name,
  });

  saveStoreData(store);
  return { success: true, booking: newBooking };
}

// ============================================================================
// RT-ASSET: LIFECYCLE & LOCATION RELOCATION WITH AUDIT TRAIL (BR-RT-003, BR-RT-006)
// ============================================================================

export function registerAsset(asset: Omit<AssetItem, 'id' | 'asset_code'>): AssetItem {
  let store = getStoredData();
  const now = new Date();
  const code = `AST-${asset.category.slice(0, 3)}-${String(store.assets.length + 1).padStart(3, '0')}`;
  const newAsset: AssetItem = {
    ...asset,
    id: `ast-${Date.now()}`,
    asset_code: code,
  };

  store.assets = [newAsset, ...store.assets];
  store = recordAuditLog(store, {
    who: asset.pic_name,
    role: 'Staf Rumah Tangga',
    action: 'ASSET_REGISTERED',
    entity: 'AssetItem',
    entity_id: code,
    new_value: `${newAsset.name} [${newAsset.lifecycle_status}] di ${newAsset.room_name}`,
    reason: 'Pencatatan aset baru pesantren',
  });

  saveStoreData(store);
  return newAsset;
}

export function relocateAsset(
  assetId: string,
  newBuilding: string,
  newRoom: string,
  newPic: string,
  reason: string,
  operatorName: string = 'Pak Slamet (Kepala Rumah Tangga)'
): AssetItem | null {
  let store = getStoredData();
  let target: AssetItem | null = null;

  store.assets = store.assets.map(a => {
    if (a.id === assetId || a.asset_code === assetId) {
      const oldLoc = `${a.building_name} / ${a.room_name}`;
      target = {
        ...a,
        building_name: newBuilding,
        room_name: newRoom,
        pic_name: newPic,
      };

      store = recordAuditLog(store, {
        who: operatorName,
        role: 'Kepala Rumah Tangga',
        action: 'ASSET_LOCATION_CHANGED',
        entity: 'AssetItem',
        entity_id: a.asset_code,
        old_value: oldLoc,
        new_value: `${newBuilding} / ${newRoom} (PIC: ${newPic})`,
        reason: reason,
      });

      return target;
    }
    return a;
  });

  if (target) {
    saveStoreData(store);
  }
  return target;
}

export function updateAssetStatus(
  assetId: string,
  status: AssetLifecycleStatus,
  reason: string,
  operatorName: string = 'Pak Slamet (Kepala Rumah Tangga)'
): AssetItem | null {
  let store = getStoredData();
  let target: AssetItem | null = null;

  store.assets = store.assets.map(a => {
    if (a.id === assetId || a.asset_code === assetId) {
      const oldStatus = a.lifecycle_status;
      target = {
        ...a,
        lifecycle_status: status,
      };

      store = recordAuditLog(store, {
        who: operatorName,
        role: 'Kepala Rumah Tangga',
        action: 'ASSET_STATUS_TRANSITION',
        entity: 'AssetItem',
        entity_id: a.asset_code,
        old_value: oldStatus,
        new_value: status,
        reason: reason,
      });

      return target;
    }
    return a;
  });

  if (target) {
    saveStoreData(store);
  }
  return target;
}

// ============================================================================
// RT-CLEAN & RT-SAFETY: CHECKLIST UPDATES
// ============================================================================

export function toggleCleaningChecklistItem(taskId: string, itemIdx: number): CleaningTask | null {
  let store = getStoredData();
  let target: CleaningTask | null = null;

  store.cleaning_tasks = store.cleaning_tasks.map(t => {
    if (t.id === taskId) {
      const updatedChecklist = [...t.checklist];
      updatedChecklist[itemIdx].is_checked = !updatedChecklist[itemIdx].is_checked;
      const allDone = updatedChecklist.every(i => i.is_checked);
      target = {
        ...t,
        checklist: updatedChecklist,
        status: allDone ? 'COMPLETED' : 'IN_PROGRESS',
        completed_at: allDone ? new Date().toLocaleTimeString('id-ID') : t.completed_at,
      };
      return target;
    }
    return t;
  });

  if (target) {
    saveStoreData(store);
  }
  return target;
}

export function verifyCleaningTask(
  taskId: string,
  verifierName: string = 'Pak Slamet (Supervisor RT)',
  notes: string = ''
): CleaningTask | null {
  let store = getStoredData();
  let target: CleaningTask | null = null;

  store.cleaning_tasks = store.cleaning_tasks.map(t => {
    if (t.id === taskId) {
      target = {
        ...t,
        status: 'VERIFIED',
        verified_by: verifierName,
        verified_at: new Date().toLocaleTimeString('id-ID') + ' WIB',
        evidence_notes: notes || t.evidence_notes,
      };
      return target;
    }
    return t;
  });

  if (target) {
    store = recordAuditLog(store, {
      who: verifierName,
      role: 'Supervisor Kebersihan',
      action: 'CLEANING_TASK_VERIFIED',
      entity: 'CleaningTask',
      entity_id: taskId,
      new_value: 'VERIFIED',
      reason: notes || 'Pemeriksaan kebersihan fisik area terverifikasi rapi dan higienis',
    });
    saveStoreData(store);
  }
  return target;
}
