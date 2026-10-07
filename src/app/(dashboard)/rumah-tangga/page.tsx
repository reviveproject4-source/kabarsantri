'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  Package, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Users, 
  Building2, 
  DoorOpen, 
  Flame, 
  Sparkles, 
  Layers, 
  History, 
  Check, 
  X, 
  PhoneCall, 
  FileText, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  HardHat, 
  Trash2, 
  RefreshCw,
  QrCode,
  AlertCircle,
  Truck,
  Eye,
  CheckSquare,
  Square,
  Filter,
  UserCheck
} from 'lucide-react';

import { 
  getRtStore, 
  getRtDashboardMetrics, 
  createServiceRequest, 
  assignServiceRequest, 
  completeServiceRequest, 
  verifyServiceRequest, 
  recordStockMovement, 
  processItemRequestWithStockCheck, 
  createFacilityBooking, 
  registerAsset, 
  relocateAsset, 
  updateAssetStatus, 
  toggleCleaningChecklistItem, 
  verifyCleaningTask,
  RtStoreData 
} from '@/lib/rumahTanggaStore';

import { 
  ServiceRequest, 
  ServiceRequestPriority, 
  AssetItem, 
  AssetLifecycleStatus, 
  InventoryItem, 
  StockMovementType, 
  FacilityBooking, 
  CleaningTask, 
  RtDashboardMetrics,
  SafetyInspection,
  VendorProfile,
  RtAuditEntry
} from '@/types/rumahtangga';
import { useActiveActor } from '@/lib/sessionStore';

export default function RumahTanggaHubPage() {
  const activeActor = useActiveActor();
  const isKaBidRT = activeActor.role_key === 'kepala_rumah_tangga' || 
                    activeActor.role_key === 'keuangan' || 
                    activeActor.role_key === 'wakil_yayasan' || 
                    activeActor.role_key === 'yayasan';

  const [storeData, setStoreData] = useState<RtStoreData | null>(null);
  const [metrics, setMetrics] = useState<RtDashboardMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'requests' | 'assets' | 'inventory' | 'maintenance' | 'booking' | 'cleaning' | 'safety' | 'vendors' | 'audit'
  >('overview');

  const [notif, setNotif] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalNewRequest, setModalNewRequest] = useState(false);
  const [modalAssignRequest, setModalAssignRequest] = useState<ServiceRequest | null>(null);
  const [modalCompleteRequest, setModalCompleteRequest] = useState<ServiceRequest | null>(null);
  const [modalVerifyRequest, setModalVerifyRequest] = useState<ServiceRequest | null>(null);
  const [modalStockMovement, setModalStockMovement] = useState<InventoryItem | null>(null);
  const [modalStockRequestCheck, setModalStockRequestCheck] = useState<InventoryItem | null>(null);
  const [modalRelocateAsset, setModalRelocateAsset] = useState<AssetItem | null>(null);
  const [modalAssetStatus, setModalAssetStatus] = useState<AssetItem | null>(null);
  const [modalNewAsset, setModalNewAsset] = useState(false);
  const [modalNewBooking, setModalNewBooking] = useState(false);

  // Form states: New Request
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState<ServiceRequest['category']>('KERUSAKAN_AC');
  const [reqPriority, setReqPriority] = useState<ServiceRequestPriority>('HIGH');
  const [reqBuilding, setReqBuilding] = useState('Gedung Asrama Putra Utsman');
  const [reqRoom, setReqRoom] = useState('Kamar Asrama 201');
  const [reqRequester, setReqRequester] = useState('Ust. Hamzah, Lc.');
  const [reqUnit, setReqUnit] = useState('Musyrif Asrama Putra');
  const [reqDesc, setReqDesc] = useState('');

  // Form states: Assign Request
  const [assignPic, setAssignPic] = useState('Pak Rusli (Teknisi AC)');
  const [assignCostEst, setAssignCostEst] = useState(250000);

  // Form states: Complete Request
  const [completeCost, setCompleteCost] = useState(200000);
  const [completeNotes, setCompleteNotes] = useState('Perbaikan tuntas, kompresor berfungsi normal dan suhu kembali dingin 20°C.');

  // Form states: Verify Request
  const [verifyAction, setVerifyAction] = useState<'ACCEPT' | 'REJECT'>('ACCEPT');
  const [verifyNotes, setVerifyNotes] = useState('Pengecekan fisik di kamar 201 telah sesuai SOP. Hasil pengerjaan disetujui.');

  // Form states: Stock Movement
  const [stockMovType, setStockMovType] = useState<StockMovementType>('STOCK_IN');
  const [stockMovQty, setStockMovQty] = useState(5);
  const [stockMovReason, setStockMovReason] = useState('Restock pengadaan barang baru dari toko');
  const [stockMovUnit, setStockMovUnit] = useState('Gudang Sentral');

  // Form states: Booking
  const [bookRoomId, setBookRoomId] = useState('rm-1');
  const [bookRequester, setBookRequester] = useState('Ust. Lukman (Sekretariat Yayasan)');
  const [bookUnit, setBookUnit] = useState('Yayasan & Humas');
  const [bookEvent, setBookEvent] = useState('Kajian Bulanan Wali Santri & Donatur');
  const [bookDate, setBookDate] = useState('2026-10-06');
  const [bookStart, setBookStart] = useState('08:30');
  const [bookEnd, setBookEnd] = useState('11:30');
  const [bookParticipants, setBookParticipants] = useState(50);
  const [bookEquip, setBookEquip] = useState('Mic Wireless, Proyektor, AC dinyalakan');

  // Form states: Relocate Asset
  const [relocBuilding, setRelocBuilding] = useState('Gedung Utama Abu Bakar');
  const [relocRoom, setRelocRoom] = useState('Ruang Rapat Pleno Lantai 2');
  const [relocPic, setRelocPic] = useState('Pak Slamet (Kepala RT)');
  const [relocReason, setRelocReason] = useState('Penyesuaian kebutuhan operasional rapat');

  // Load and refresh
  const loadData = () => {
    setStoreData(getRtStore());
    setMetrics(getRtDashboardMetrics());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('ks_rt_updated', handleUpdate);
    window.addEventListener('ks_expense_updated', handleUpdate);

    return () => {
      window.removeEventListener('ks_rt_updated', handleUpdate);
      window.removeEventListener('ks_expense_updated', handleUpdate);
    };
  }, []);

  if (!storeData || !metrics) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
        <span>Memuat data operasional Rumah Tangga...</span>
      </div>
    );
  }

  // Action Handlers
  const handleCreateRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createServiceRequest({
      requester_name: reqRequester,
      requester_unit: reqUnit,
      category: reqCategory,
      title: reqTitle,
      description: reqDesc,
      location_building: reqBuilding,
      location_room: reqRoom,
      priority: reqPriority,
    });
    setModalNewRequest(false);
    setReqTitle('');
    setReqDesc('');
    setNotif('✓ Service Request berhasil dibuat dan tercatat dalam sistem dengan SLA otomatis.');
    setTimeout(() => setNotif(''), 6000);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAssignRequest) return;
    assignServiceRequest(modalAssignRequest.id, assignPic, Number(assignCostEst));
    setModalAssignRequest(null);
    setNotif(`✓ Tiket ${modalAssignRequest.ticket_no} berhasil ditugaskan ke ${assignPic} dengan status IN_PROGRESS.`);
    setTimeout(() => setNotif(''), 6000);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCompleteRequest) return;
    completeServiceRequest(modalCompleteRequest.id, Number(completeCost), completeNotes);
    setModalCompleteRequest(null);
    setNotif(`✓ Pekerjaan tiket ${modalCompleteRequest.ticket_no} selesai dikerjakan! Status beralih ke COMPLETED (Menunggu verifikasi atasan).`);
    setTimeout(() => setNotif(''), 7000);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalVerifyRequest) return;
    verifyServiceRequest(modalVerifyRequest.id, verifyAction, verifyNotes);
    setModalVerifyRequest(null);
    if (verifyAction === 'ACCEPT') {
      setNotif(`✓ Tiket ${modalVerifyRequest.ticket_no} terverifikasi tuntas! Status resmi CLOSED.`);
    } else {
      setNotif(`⚠️ Hasil verifikasi ditolak: Tiket ${modalVerifyRequest.ticket_no} dibuka kembali (REOPENED / IN_PROGRESS).`);
    }
    setTimeout(() => setNotif(''), 7000);
  };

  const handleStockMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStockMovement) return;
    const res = recordStockMovement({
      item_id: modalStockMovement.id,
      movement_type: stockMovType,
      quantity: Number(stockMovQty),
      pic_operator: 'Pak Slamet (Kepala RT)',
      reason: stockMovReason,
      recipient_unit: stockMovUnit,
    });
    setModalStockMovement(null);
    if (res.success) {
      setNotif(`✓ Transaksi stok ${stockMovType} (${stockMovQty} ${modalStockMovement.unit}) berhasil dicatat. Sisa stok: ${res.item?.current_stock} ${modalStockMovement.unit}.`);
    } else {
      setNotif(`❌ Gagal mencatat transaksi: ${res.error}`);
    }
    setTimeout(() => setNotif(''), 7000);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createFacilityBooking({
      room_id: bookRoomId,
      requester_name: bookRequester,
      requester_unit: bookUnit,
      event_name: bookEvent,
      booking_date: bookDate,
      start_time: bookStart,
      end_time: bookEnd,
      participants_count: Number(bookParticipants),
      equipment_needed: bookEquip,
    });
    setModalNewBooking(false);
    if (res.success) {
      setNotif(`✓ Pemesanan fasilitas berhasil diamankan (RESERVED) untuk tanggal ${bookDate} pk ${bookStart}-${bookEnd}.`);
    } else {
      setNotif(`❌ ${res.error}`);
    }
    setTimeout(() => setNotif(''), 8000);
  };

  const handleRelocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRelocateAsset) return;
    relocateAsset(modalRelocateAsset.id, relocBuilding, relocRoom, relocPic, relocReason);
    setModalRelocateAsset(null);
    setNotif(`✓ Aset ${modalRelocateAsset.name} berhasil direlokasi ke ${relocBuilding} / ${relocRoom}. Riwayat tercatat di audit trail.`);
    setTimeout(() => setNotif(''), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Hub Rumah Tangga */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600/80 border border-emerald-400/40 text-emerald-100">
              Operational Support & Facility Management
            </span>
            {metrics.critical_issues_count > 0 && (
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{metrics.critical_issues_count} Masalah Kritis</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-2">Pusat Rumah Tangga & Sarana Prasarana</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Pengendalian Terpadu: <strong>Service Requests (SLA)</strong> ➔ <strong>Asset Lifecycle</strong> ➔ <strong>Inventory & Stock Movement</strong> ➔ <strong>Preventive Maintenance</strong> ➔ <strong>Double-Booking Prevention</strong> ➔ <strong>Safety K3</strong> ➔ <strong>Audit Trail</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalNewRequest(true)}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Lapor Kerusakan / Request</span>
          </button>

          <Link
            href="/rumah-tangga/pengajuan"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Pengajuan Dana ke Keuangan</span>
          </Link>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notif && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm animate-pulse ${
          notif.includes('❌') 
            ? 'bg-rose-50 border border-rose-300 text-rose-900' 
            : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
        }`}>
          {notif.includes('❌') ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{notif}</span>
        </div>
      )}

      {/* 6 Metrik Eksekutif Kepala Rumah Tangga (RT-VIS & RT-BUDGET) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Metric 1: Active Requests */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-[11px]">Active Requests</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{metrics.total_active_requests} Tiket</div>
          <span className="text-[10px] text-rose-600 font-bold block">{metrics.critical_issues_count} Kritis • {metrics.high_priority_issues_count} High</span>
        </div>

        {/* Metric 2: SLA Compliance */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-[11px]">SLA Kepatuhan</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{metrics.sla_compliance_percentage}%</div>
          <span className="text-[10px] text-slate-400 block">Avg: {metrics.average_resolution_hours} Jam Selesai</span>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-[11px]">Stok Kritis Gudang</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">{metrics.low_stock_items_count} Item</div>
          <span className="text-[10px] text-amber-600 block">Perlu Restock / Pengadaan</span>
        </div>

        {/* Metric 4: Assets Under Maintenance */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-[11px]">Aset Perbaikan</span>
            <HardHat className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-700">{metrics.assets_under_maintenance_count} Unit</div>
          <span className="text-[10px] text-slate-400 block">{metrics.maintenance_due_count} Jadwal Preventive</span>
        </div>

        {/* Metric 5: Safety Findings */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-[11px]">Temuan Safety K3</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700">{metrics.safety_unresolved_findings} Temuan</div>
          <span className="text-[10px] text-rose-600 block">APAR / Listrik / Fisik</span>
        </div>

        {/* Metric 6: Budget Realization (KaBid RT Only) vs Operational Readiness (Staff / Team) */}
        {isKaBidRT ? (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold text-[11px]">Sisa Anggaran RT</span>
              <DollarSign className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-sm font-bold font-mono text-teal-800">
              Rp {(metrics.remaining_budget / 1000000).toFixed(1)} Jt
            </div>
            <span className="text-[10px] text-slate-400 block">
              Terpakai: Rp {(metrics.actual_spent / 1000000).toFixed(1)} Jt
            </span>
          </div>
        ) : (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold text-[11px]">Kesiapan Operasional</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-sm font-bold text-emerald-800">
              100% Siap Layanan
            </div>
            <span className="text-[10px] text-slate-400 block">
              {storeData?.inventory.length || 0} Item Terpantau di Gudang & Unit
            </span>
          </div>
        )}
      </div>

      {/* Navigasi Tab Menu Utama */}
      <div className="flex overflow-x-auto bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm gap-1 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Ringkasan & Dashboard', icon: TrendingUp },
          { id: 'requests', label: `Service Requests (${storeData.service_requests.length})`, icon: Wrench },
          { id: 'assets', label: `Aset & Fasilitas (${storeData.assets.length})`, icon: Building2 },
          { id: 'inventory', label: `Gudang & Stok (${storeData.inventory.length})`, icon: Package },
          { id: 'maintenance', label: `Maintenance (${storeData.maintenance.length})`, icon: HardHat },
          { id: 'booking', label: `Booking Ruangan (${storeData.facility_bookings.length})`, icon: Calendar },
          { id: 'cleaning', label: 'Checklist Kebersihan', icon: Sparkles },
          { id: 'safety', label: 'Inspeksi K3 & Safety', icon: ShieldAlert },
          { id: 'vendors', label: `Vendor (${storeData.vendors.length})`, icon: Truck },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: OVERVIEW & DASHBOARD KEPALA RUMAH TANGGA (RT-VIS & RT-BUDGET) */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Kolom 1 & 2: Status Pekerjaan Penting & Low Stock Alerts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Banner Low Stock Alert (BR-RT-004) */}
            {metrics.low_stock_items_count > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-950">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm block">Peringatan Stok Gudang Kritis ({metrics.low_stock_items_count} Item Di Bawah Batas Minimum)</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Segera lakukan pengadaan atau restock agar kegiatan operasional kebersihan dan kelistrikan tidak terhenti.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {storeData.inventory
                        .filter(i => i.is_low_stock)
                        .map(i => (
                          <span key={i.id} className="px-2 py-0.5 bg-white border border-amber-300 rounded-lg text-[10px] font-mono font-bold text-amber-900">
                            {i.name}: {i.current_stock} {i.unit} (Min: {i.minimum_stock})
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition"
                >
                  Buka Gudang ➔
                </button>
              </div>
            )}

            {/* Service Requests Aktif (Prioritas Kritis / High) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Permintaan Penanganan Kerusakan Aktif (Service Requests)</h3>
                  <p className="text-xs text-slate-500">Tiket keluhan fasilitas dengan pemantauan SLA dan penugasan teknisi</p>
                </div>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  Lihat Semua ({storeData.service_requests.length}) ➔
                </button>
              </div>

              <div className="space-y-2.5">
                {storeData.service_requests.slice(0, 4).map(req => (
                  <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          req.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          req.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.priority}
                        </span>
                        <span className="font-bold text-slate-900">{req.title}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({req.ticket_no})</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{req.location_building} • {req.location_room} • Pemohon: {req.requester_name}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        req.status === 'CLOSED' ? 'bg-slate-200 text-slate-800' :
                        req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                      {req.status === 'SUBMITTED' && (
                        <button
                          onClick={() => setModalAssignRequest(req)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                        >
                          Tugaskan PIC
                        </button>
                      )}
                      {req.status === 'COMPLETED' && (
                        <button
                          onClick={() => setModalVerifyRequest(req)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                        >
                          Verifikasi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jadwal Pemeliharaan Rutin & Preventive Maintenance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Jadwal Preventive Maintenance Fasilitas Utama</h3>
                  <p className="text-xs text-slate-500">Mencegah kerusakan kritis genset, AC asrama, dan pompa air sebelum rusak</p>
                </div>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  Kelola Jadwal ➔
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {storeData.maintenance.map(m => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.asset_name}</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[9px] font-bold">
                        {m.type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-tight">{m.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200 font-mono">
                      <span>Jatuh Tempo: <strong>{m.scheduled_date}</strong></span>
                      <span>Est: Rp {m.cost.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom 3: Finansial Rumah Tangga, Checklist Kebersihan & K3 */}
          <div className="space-y-4">
            {/* Kartu Kontrol Anggaran (Hanya Kepala Bidang RT) vs Status Tugas Operasional & Absensi (Staff) */}
            {isKaBidRT ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 text-sm">Alokasi Anggaran RT</span>
                  <span className="font-mono text-emerald-700 font-bold">T.A 2026</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plafon Anggaran:</span>
                    <span className="font-mono font-bold text-slate-900">Rp {metrics.total_budget_allocated.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Realisasi Pengeluaran:</span>
                    <span className="font-mono font-bold text-rose-700">Rp {metrics.actual_spent.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Komitmen Berjalan:</span>
                    <span className="font-mono font-bold text-amber-700">Rp {metrics.committed_spent.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-900">
                    <span>Sisa Saldo Operasional:</span>
                    <span className="font-mono">Rp {metrics.remaining_budget.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, Math.round(((metrics.actual_spent + metrics.committed_spent) / metrics.total_budget_allocated) * 100))}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  *Tersinkronisasi otomatis dengan Modul Keuangan & Pengeluaran Yayasan.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 text-sm">Status Operasional & Tugas Harian</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Tim RT & Laundry</span>
                </div>

                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Tiket Permintaan Terbuka:</span>
                    <span className="font-bold text-amber-600">{metrics.total_active_requests} Tiket</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Item Terpantau di Unit:</span>
                    <span className="font-bold text-slate-800">{storeData?.inventory.length || 0} Item</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Kesiapan Sarpras & Sanitasi:</span>
                    <span className="font-bold text-emerald-600">Optimal & Terawat</span>
                  </div>
                </div>

                {/* Tombol Langsung Absen Diri untuk Team Laundry / Dapur */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] text-slate-500">
                    Mau absen masuk / pulang kerja hari ini?
                  </div>
                  <Link
                    href="/presensi/diri"
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Absen Diri Sekarang (GPS Mandiri) &rarr;</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Checklist Kebersihan Hari Ini (RT-CLEAN) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 text-sm">Status Kebersihan Area</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-2">
                {storeData.cleaning_tasks.map(t => (
                  <div key={t.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{t.area_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        t.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Petugas: {t.assigned_staff} ({t.shift})</p>
                    <div className="text-[10px] text-slate-600">
                      Checklist: {t.checklist.filter(i => i.is_checked).length} dari {t.checklist.length} item selesai
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Booking Fasilitas Mendatang */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 text-sm">Reservasi Ruangan Terdekat</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>

              {storeData.facility_bookings.map(b => (
                <div key={b.id} className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{b.room_name}</span>
                    <span className="font-mono text-[10px] text-blue-800 font-bold">{b.booking_date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold">{b.event_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">pk {b.start_time} - {b.end_time} • {b.participants_count} Peserta</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SERVICE REQUESTS & KERUSAKAN (RT-SERVICE) */}
      {/* ===================================================================== */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Manajemen Service Request & Kerusakan Fisik</h3>
              <p className="text-slate-500 text-xs">
                Siklus Transisi: SUBMITTED ➔ ASSIGNED (IN_PROGRESS) ➔ COMPLETED ➔ VERIFIED ➔ CLOSED (BR-RT-005)
              </p>
            </div>

            <button
              onClick={() => setModalNewRequest(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Request Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Tiket & Pemohon</th>
                  <th className="p-3">Kategori & Kerusakan</th>
                  <th className="p-3">Lokasi Fisik</th>
                  <th className="p-3 text-center">Prioritas & SLA</th>
                  <th className="p-3 text-center">Status Lifecycle</th>
                  <th className="p-3">Teknisi / PIC</th>
                  <th className="p-3 text-right">Aksi Alur Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storeData.service_requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold font-mono text-slate-900">{req.ticket_no}</div>
                      <div className="text-[10px] text-slate-500">{req.requester_name} ({req.requester_unit})</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.submitted_at}</div>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="font-bold text-slate-800">{req.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{req.description}</div>
                      {req.stock_used && req.stock_used.length > 0 && (
                        <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                          Stok Gudang: {req.stock_used.map(s => `${s.qty} ${s.item_name}`).join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{req.location_building}</div>
                      <div className="text-[10px] text-slate-500">{req.location_room}</div>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        req.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        req.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.priority}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">SLA: {req.sla_hours} Jam</div>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        req.status === 'CLOSED' ? 'bg-slate-200 text-slate-800' :
                        req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{req.assigned_pic || '-'}</div>
                      {req.cost_estimate ? (
                        <div className="text-[10px] text-slate-400 font-mono">Est: Rp {req.cost_estimate.toLocaleString('id-ID')}</div>
                      ) : null}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {req.status === 'SUBMITTED' && (
                          <button
                            onClick={() => setModalAssignRequest(req)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                          >
                            Assign PIC
                          </button>
                        )}

                        {req.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => setModalCompleteRequest(req)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                          >
                            Lapor Selesai
                          </button>
                        )}

                        {req.status === 'COMPLETED' && (
                          <button
                            onClick={() => setModalVerifyRequest(req)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition"
                          >
                            Verifikasi Tiket
                          </button>
                        )}

                        {req.status === 'CLOSED' && (
                          <span className="text-[11px] text-slate-400 font-semibold italic">Tuntas & Terverifikasi</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: ASET & FASILITAS PESANTREN (RT-ASSET & RT-DATA) */}
      {/* ===================================================================== */}
      {activeTab === 'assets' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Register Aset Fisik & Fasilitas Pesantren (BR-RT-003)</h3>
              <p className="text-slate-500 text-xs">
                Setiap aset memiliki identitas (Asset Code), lokasi aktual, kondisi fisik, dan rekam jejak relokasi/lifecycle
              </p>
            </div>

            <button
              onClick={() => setModalNewAsset(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Daftarkan Aset Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Kode & Nama Aset</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Lokasi Ruangan Aktual</th>
                  <th className="p-3 text-center">Kondisi Fisik</th>
                  <th className="p-3 text-center">Status Lifecycle</th>
                  <th className="p-3">Nilai Pembelian & PIC</th>
                  <th className="p-3 text-right">Aksi Kelola Aset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storeData.assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{asset.name}</div>
                      <div className="font-mono text-emerald-700 font-bold text-[10px]">{asset.asset_code}</div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                        {asset.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{asset.building_name}</div>
                      <div className="text-[10px] text-slate-500">{asset.room_name} ({asset.location_detail})</div>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asset.condition === 'SANGAT_BAIK' ? 'bg-emerald-100 text-emerald-800' :
                        asset.condition === 'BAIK' ? 'bg-blue-100 text-blue-800' :
                        asset.condition === 'RUSAK_RINGAN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        asset.lifecycle_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        asset.lifecycle_status === 'UNDER_MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                        asset.lifecycle_status === 'REPAIR' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {asset.lifecycle_status}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800">Rp {asset.purchase_cost.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-slate-500">PIC: {asset.pic_name}</div>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setModalRelocateAsset(asset);
                            setRelocBuilding(asset.building_name);
                            setRelocRoom(asset.room_name);
                            setRelocPic(asset.pic_name);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                          title="Relokasi Pindah Ruangan (Catat Audit Trail)"
                        >
                          Relokasi
                        </button>

                        <button
                          onClick={() => setModalAssetStatus(asset)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs rounded-lg transition"
                        >
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: GUDANG & INVENTARIS STOK (RT-STOCK & RT-PROCUREMENT) */}
      {/* ===================================================================== */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Gudang & Inventaris Stok Rumah Tangga (BR-RT-004)</h3>
              <p className="text-slate-500 text-xs">
                Prinsip Inti: Tidak ada perubahan stok tanpa transaksi movement (STOCK_IN, STOCK_OUT, RETURN, ADJUSTMENT)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg">
                Total SKU: {storeData.inventory.length} Item
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">SKU & Nama Barang</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-center">Stok Saat Ini</th>
                  <th className="p-3 text-center">Batas Min - Max</th>
                  <th className="p-3">Harga Satuan & Rak</th>
                  <th className="p-3 text-center">Status Stok</th>
                  <th className="p-3 text-right">Aksi Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storeData.inventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="font-mono text-slate-400 text-[10px]">SKU: {item.id}</div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <div className="text-base font-bold font-mono text-slate-900">
                        {item.current_stock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </div>
                    </td>

                    <td className="p-3 text-center font-mono text-slate-600">
                      Min: {item.minimum_stock} | Max: {item.maximum_stock}
                    </td>

                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800">Rp {item.unit_price.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-slate-500">{item.location_rack}</div>
                    </td>

                    <td className="p-3 text-center">
                      {item.is_low_stock ? (
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          AMAN
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setModalStockMovement(item);
                            setStockMovType('STOCK_OUT');
                            setStockMovQty(1);
                            setStockMovReason('Pengeluaran rutin unit');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition"
                        >
                          Catat Transaksi
                        </button>

                        <button
                          onClick={() => {
                            const res = processItemRequestWithStockCheck({
                              item_id: item.id,
                              qty: item.minimum_stock * 2,
                              requester_name: 'Pak Slamet (Kepala RT)',
                              requester_unit: 'Gudang Logistik Sentral',
                              purpose: `Restock otomatis item ${item.name}`,
                            });
                            setNotif(res.message);
                            setTimeout(() => setNotif(''), 8000);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                          title="Cek ketersediaan; jika kosong eskalasi otomatis ke pengadaan keuangan"
                        >
                          Minta Barang
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Log Pergerakan Stok Terkini */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Riwayat Transaksi Mutasi Stok (Audit Trail Stok)</h4>
            <div className="space-y-1.5">
              {storeData.stock_movements.slice(0, 5).map(m => (
                <div key={m.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">{m.item_name}</span>
                    <span className="text-slate-500 block">{m.reason} • Penerima: {m.recipient_unit || '-'}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${m.movement_type === 'STOCK_IN' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {m.movement_type === 'STOCK_IN' ? `+${m.quantity}` : `-${m.quantity}`} ({m.movement_type})
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">{m.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: PEMELIHARAAN & MAINTENANCE (RT-MAINT) */}
      {/* ===================================================================== */}
      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Jadwal & Histori Pemeliharaan (Preventive & Corrective Maintenance)</h3>
            <p className="text-slate-500 text-xs">Pemantauan siklus servis berkala, pengujian genset, cuci AC, dan perawatan pompa air</p>
          </div>

          <div className="space-y-3">
            {storeData.maintenance.map(m => (
              <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{m.title}</span>
                    <p className="text-slate-500 text-[11px]">Aset: <strong>{m.asset_name}</strong> • Tipe: {m.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800">
                      {m.status}
                    </span>
                    <span className="font-mono text-slate-700 font-bold">Jadwal: {m.scheduled_date}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>Teknisi: <strong>{m.technician_name}</strong></div>
                  <div>Vendor Rekanan: <strong>{m.vendor_name || '-'}</strong></div>
                  <div>Estimasi Biaya: <strong className="font-mono">Rp {m.cost.toLocaleString('id-ID')}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: PEMINJAMAN & BOOKING FASILITAS (RT-LOAN & RT-FACILITY) */}
      {/* ===================================================================== */}
      {activeTab === 'booking' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Peminjaman Ruangan & Peralatan Pesantren (Double-Booking Prevention)</h3>
              <p className="text-slate-500 text-xs">
                Sistem secara otomatis memblokir jadwal yang tumpang tindih untuk aula, lab, dan proyektor
              </p>
            </div>

            <button
              onClick={() => setModalNewBooking(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Booking Ruangan Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Ruangan & Gedung</th>
                  <th className="p-3">Nama Acara / Kegiatan</th>
                  <th className="p-3">Pemohon & Unit</th>
                  <th className="p-3 text-center">Tanggal & Jam</th>
                  <th className="p-3 text-center">Peserta</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storeData.facility_bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.room_name}</div>
                      <div className="text-[10px] text-slate-400">{b.building_name}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{b.event_name}</div>
                      {b.equipment_needed && (
                        <div className="text-[10px] text-blue-700 italic">Peralatan: {b.equipment_needed}</div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-800">{b.requester_name}</div>
                      <div className="text-[10px] text-slate-500">{b.requester_unit}</div>
                    </td>

                    <td className="p-3 text-center font-mono">
                      <div className="font-bold text-slate-900">{b.booking_date}</div>
                      <div className="text-[10px] text-slate-500">pk {b.start_time} - {b.end_time}</div>
                    </td>

                    <td className="p-3 text-center font-bold">
                      {b.participants_count} Orang
                    </td>

                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: KEBERSIHAN & CHECKLIST AREA (RT-CLEAN) */}
      {/* ===================================================================== */}
      {activeTab === 'cleaning' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Checklist & Kontrol Kebersihan Harian (RT-CLEAN)</h3>
            <p className="text-slate-500 text-xs">Setiap area dipantau item-per-item dan wajib diverifikasi oleh supervisor RT</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {storeData.cleaning_tasks.map(task => (
              <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{task.area_name}</h4>
                    <p className="text-[10px] text-slate-500">{task.building_name} (Lantai {task.floor}) • Shift {task.shift}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    task.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                    task.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Item Checklist:</span>
                  {task.checklist.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toggleCleaningChecklistItem(task.id, idx)}
                      className="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-white rounded-lg transition"
                    >
                      {item.is_checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={`text-[11px] ${item.is_checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.item_name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Petugas: <strong>{task.assigned_staff}</strong></span>
                  {task.status === 'COMPLETED' && (
                    <button
                      onClick={() => {
                        verifyCleaningTask(task.id, 'Pak Slamet (Supervisor RT)', 'Pemeriksaan fisik lolos standar');
                        setNotif(`✓ Kebersihan ${task.area_name} berhasil diverifikasi!`);
                        setTimeout(() => setNotif(''), 6000);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                    >
                      Verifikasi Selesai
                    </button>
                  )}
                  {task.status === 'VERIFIED' && (
                    <span className="text-emerald-700 font-bold">Terverifikasi: {task.verified_by}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 8: KESELAMATAN & INSPEKSI K3 (RT-SAFETY) */}
      {/* ===================================================================== */}
      {activeTab === 'safety' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Inspeksi Keselamatan Fasilitas & Mitigasi Risiko K3 (RT-SAFETY)</h3>
            <p className="text-slate-500 text-xs">Pencegahan risiko kebakaran, instalasi listrik, dan integritas fisik gedung pesantren</p>
          </div>

          <div className="space-y-3">
            {storeData.safety_inspections.map(insp => (
              <div key={insp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      insp.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                      insp.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      RISK: {insp.risk_level}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{insp.category}</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{insp.inspection_date} • {insp.location}</span>
                </div>

                <p className="text-slate-800 text-xs"><strong>Temuan:</strong> {insp.findings_description}</p>
                <p className="text-slate-600 text-xs"><strong>Tindakan Mitigasi:</strong> {insp.action_plan}</p>
                
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Inspektor: <strong>{insp.inspector_name}</strong> • PIC: {insp.assigned_pic}</span>
                  <span className="font-bold text-slate-800">Status: {insp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 9: VENDOR REKANAN (RT-VENDOR) */}
      {/* ===================================================================== */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Direktori Vendor Rekanan & Evaluasi Kinerja (RT-VENDOR)</h3>
            <p className="text-slate-500 text-xs">Evaluasi SLA pengerjaan, total biaya yang dikeluarkan, dan peringkat kepuasan pekerjaan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {storeData.vendors.map(v => (
              <div key={v.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                    <p className="text-slate-500 text-[10px]">{v.service_category}</p>
                  </div>
                  <div className="flex items-center space-x-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold text-xs">
                    <span>★ {v.performance_rating}</span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div>Kontak: <strong>{v.contact_person}</strong> ({v.phone})</div>
                  <div>Kontrak: <span className="font-mono">{v.contract_period}</span></div>
                  <div>Pekerjaan Selesai: <strong>{v.total_jobs_completed} SPK</strong></div>
                  <div>Total Pengeluaran: <strong className="font-mono text-slate-900">Rp {v.total_spent.toLocaleString('id-ID')}</strong></div>
                </div>

                {v.notes && (
                  <p className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                    "{v.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 10: AUDIT TRAIL HISTORIS (RT-AUDIT) */}
      {/* ===================================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Audit Trail Aktivitas & Perubahan Data (BR-RT-006)</h3>
            <p className="text-slate-500 text-xs">Rekam jejak tidak dapat dimanipulasi: Siapa, Kapan, Aksi, Entitas, Nilai Lama, Nilai Baru, dan Alasan</p>
          </div>

          <div className="space-y-3">
            {storeData.audit_logs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono text-[9px] font-bold">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">{log.entity} #{log.entity_id}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px]">{log.timestamp}</span>
                </div>

                <div className="text-[11px] text-slate-600">
                  Oleh: <strong>{log.who}</strong> ({log.role})
                </div>

                {log.old_value && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Semula: {log.old_value}
                  </div>
                )}

                <div className="text-[11px] text-slate-800 font-semibold">
                  Menjadi: {log.new_value}
                </div>

                {log.reason && (
                  <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-200">
                    Keterangan/Alasan: {log.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: FORM BUAT SERVICE REQUEST BARU */}
      {/* ===================================================================== */}
      {modalNewRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Buat Permintaan Layanan / Lapor Kerusakan</h3>
                <p className="text-xs text-slate-500">Mencatat keluhan fasilitas untuk diproses sesuai alur SLA</p>
              </div>
              <button onClick={() => setModalNewRequest(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Keluhan / Kebutuhan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AC Kamar 201 Bocor Air / Lampu Tangga Mati"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Masalah *</label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="KERUSAKAN_AC">Kerusakan AC & Pendingin</option>
                    <option value="LISTRIK_LAMPU">Listrik & Lampu Penerangan</option>
                    <option value="PLUMBING_AIR">Plumbing & Pipa Air</option>
                    <option value="KEBERSIHAN">Kebersihan & Sanitasi</option>
                    <option value="PERBAIKAN_FASILITAS">Perbaikan Fasilitas / Pintu / Jendela</option>
                    <option value="KEBUTUHAN_BARANG">Permintaan Kebutuhan Barang</option>
                    <option value="PERSIAPAN_RUANGAN">Persiapan Acara & Ruangan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Prioritas (SLA) *</label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-rose-800"
                  >
                    <option value="CRITICAL">CRITICAL (SLA 4 Jam)</option>
                    <option value="HIGH">HIGH (SLA 24 Jam)</option>
                    <option value="MEDIUM">MEDIUM (SLA 48 Jam)</option>
                    <option value="LOW">LOW (SLA 72 Jam)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gedung *</label>
                  <input
                    type="text"
                    required
                    value={reqBuilding}
                    onChange={(e) => setReqBuilding(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruangan / Titik Lokasi *</label>
                  <input
                    type="text"
                    required
                    value={reqRoom}
                    onChange={(e) => setReqRoom(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pemohon *</label>
                  <input
                    type="text"
                    required
                    value={reqRequester}
                    onChange={(e) => setReqRequester(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Bagian *</label>
                  <input
                    type="text"
                    required
                    value={reqUnit}
                    onChange={(e) => setReqUnit(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Detail Masalah *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kondisi kerusakan secara rinci..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewRequest(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  Kirim Request (SUBMITTED)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: TUGASKAN TEKNISI (ASSIGN PIC) */}
      {/* ===================================================================== */}
      {modalAssignRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Penugasan Teknisi (Work Order)</h3>
              <button onClick={() => setModalAssignRequest(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{modalAssignRequest.title}</div>
              <div className="text-slate-500 font-mono text-[10px]">{modalAssignRequest.ticket_no} • {modalAssignRequest.location_building}</div>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Teknisi / PIC Pelaksana *</label>
                <select
                  value={assignPic}
                  onChange={(e) => setAssignPic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="Pak Rusli (Teknisi AC & Pendingin)">Pak Rusli (Teknisi AC & Pendingin)</option>
                  <option value="Pak Slamet (Kepala RT / Listrik)">Pak Slamet (Kepala RT / Listrik)</option>
                  <option value="Kang Junaedi (Teknisi Sipil / Plafon)">Kang Junaedi (Teknisi Sipil / Plafon)</option>
                  <option value="CV. Sinar Jaya Teknik (Vendor Rekanan)">CV. Sinar Jaya Teknik (Vendor Rekanan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimasi Biaya Perbaikan (Rp)</label>
                <input
                  type="number"
                  value={assignCostEst}
                  onChange={(e) => setAssignCostEst(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAssignRequest(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
                >
                  Tugaskan (IN_PROGRESS)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: LAPOR PEKERJAAN SELESAI (COMPLETED) */}
      {/* ===================================================================== */}
      {modalCompleteRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Lapor Hasil Pengerjaan Teknisi</h3>
              <button onClick={() => setModalCompleteRequest(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Hasil Pengerjaan *</label>
                <textarea
                  rows={3}
                  required
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Realisasi Biaya Akhir (Rp)</label>
                <input
                  type="number"
                  value={completeCost}
                  onChange={(e) => setCompleteCost(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                ℹ Sesuai aturan <strong>BR-RT-005</strong>, penekanan tombol ini akan mengubah status ke <strong>COMPLETED</strong> (belum CLOSED) sampai diverifikasi oleh supervisor RT.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalCompleteRequest(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  Kirim Laporan (COMPLETED)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: VERIFIKASI PEKERJAAN OLEH SUPERVISOR (VERIFIED -> CLOSED) */}
      {/* ===================================================================== */}
      {modalVerifyRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Verifikasi Hasil Pekerjaan (BR-RT-005)</h3>
              <button onClick={() => setModalVerifyRequest(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyAction('ACCEPT')}
                  className={`p-3 rounded-xl border text-left font-bold ${
                    verifyAction === 'ACCEPT'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                  <span>Setujui (CLOSED)</span>
                  <p className="text-[10px] text-slate-500 font-normal">Pekerjaan sesuai standar</p>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyAction('REJECT')}
                  className={`p-3 rounded-xl border text-left font-bold ${
                    verifyAction === 'REJECT'
                      ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 mb-1" />
                  <span>Tolak (REOPEN)</span>
                  <p className="text-[10px] text-slate-500 font-normal">Perlu perbaikan ulang</p>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Verifikasi Supervisor *</label>
                <textarea
                  rows={3}
                  required
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalVerifyRequest(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: MUTASI STOK GUDANG (BR-RT-004) */}
      {/* ===================================================================== */}
      {modalStockMovement && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Catat Transaksi Mutasi Stok</h3>
                <p className="text-xs text-slate-500">{modalStockMovement.name}</p>
              </div>
              <button onClick={() => setModalStockMovement(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockMovementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Mutasi Stok *</label>
                <select
                  value={stockMovType}
                  onChange={(e) => setStockMovType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="STOCK_IN">STOCK_IN (Penerimaan Barang Masuk / Restock)</option>
                  <option value="STOCK_OUT">STOCK_OUT (Pengeluaran Barang untuk Unit)</option>
                  <option value="RETURN">RETURN (Pengembalian Sisa Barang ke Gudang)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Penyesuaian Opname Fisik)</option>
                  <option value="DAMAGED">DAMAGED (Barang Rusak di Gudang)</option>
                  <option value="LOST">LOST (Barang Hilang / Selisih)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Kuantitas ({modalStockMovement.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockMovQty}
                  onChange={(e) => setStockMovQty(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Penerima / Lokasi Penggunaan</label>
                <input
                  type="text"
                  placeholder="Contoh: Asrama Putra Lantai 2 / Dapur Sentral"
                  value={stockMovUnit}
                  onChange={(e) => setStockMovUnit(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Transaksi / Bukti Kebutuhan *</label>
                <input
                  type="text"
                  required
                  value={stockMovReason}
                  onChange={(e) => setStockMovReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalStockMovement(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Transaksi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: BOOKING RUANGAN (DENGAN DOUBLE-BOOKING CHECK) */}
      {/* ===================================================================== */}
      {modalNewBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Booking Ruangan / Fasilitas</h3>
              <button onClick={() => setModalNewBooking(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Ruangan Fasilitas *</label>
                <select
                  value={bookRoomId}
                  onChange={(e) => setBookRoomId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  {storeData.rooms.filter(r => r.is_bookable).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.room_name} ({r.building_name} - Kapasitas {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Acara / Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={bookEvent}
                  onChange={(e) => setBookEvent(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    required
                    value={bookStart}
                    onChange={(e) => setBookStart(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    required
                    value={bookEnd}
                    onChange={(e) => setBookEnd(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pemohon *</label>
                  <input
                    type="text"
                    required
                    value={bookRequester}
                    onChange={(e) => setBookRequester(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Pemohon *</label>
                  <input
                    type="text"
                    required
                    value={bookUnit}
                    onChange={(e) => setBookUnit(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewBooking(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Booking Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: RELOKASI ASET (BR-RT-003 & BR-RT-006 AUDIT TRAIL) */}
      {/* ===================================================================== */}
      {modalRelocateAsset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Relokasi Ruangan Aset</h3>
                <p className="text-xs text-slate-500">{modalRelocateAsset.name} ({modalRelocateAsset.asset_code})</p>
              </div>
              <button onClick={() => setModalRelocateAsset(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRelocateSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div>Lokasi Saat Ini: <strong>{modalRelocateAsset.building_name} / {modalRelocateAsset.room_name}</strong></div>
                <div>PIC Lama: <strong>{modalRelocateAsset.pic_name}</strong></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gedung Baru *</label>
                <input
                  type="text"
                  required
                  value={relocBuilding}
                  onChange={(e) => setRelocBuilding(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ruangan Baru *</label>
                <input
                  type="text"
                  required
                  value={relocRoom}
                  onChange={(e) => setRelocRoom(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIC Baru Penanggung Jawab *</label>
                <input
                  type="text"
                  required
                  value={relocPic}
                  onChange={(e) => setRelocPic(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Pemindahan / Relokasi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kebutuhan kelas santri baru / pergantian inventaris rusak"
                  value={relocReason}
                  onChange={(e) => setRelocReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRelocateAsset(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Relokasi (Catat Audit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: UPDATE STATUS LIFECYCLE ASET (BR-RT-002: NO HARD DELETE) */}
      {/* ===================================================================== */}
      {modalAssetStatus && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Transisi Status Lifecycle Aset</h3>
                <p className="text-xs text-slate-500">{modalAssetStatus.name}</p>
              </div>
              <button onClick={() => setModalAssetStatus(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">Pilih Status Baru (Sesuai Aturan Transisi):</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ACTIVE', label: 'ACTIVE (Siap Pakai)' },
                  { id: 'UNDER_MAINTENANCE', label: 'UNDER_MAINTENANCE' },
                  { id: 'DAMAGED', label: 'DAMAGED (Rusak)' },
                  { id: 'REPAIR', label: 'REPAIR (Sedang Diperbaiki)' },
                  { id: 'RETIRED', label: 'RETIRED (Purna Tugas)' },
                  { id: 'DISPOSED', label: 'DISPOSED (Dilelang/Dibuang)' },
                  { id: 'LOST', label: 'LOST (Hilang)' },
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      updateAssetStatus(modalAssetStatus.id, st.id as any, `Perubahan status aset ke ${st.id}`);
                      setModalAssetStatus(null);
                      setNotif(`✓ Status aset ${modalAssetStatus.name} berhasil diubah ke ${st.id}.`);
                      setTimeout(() => setNotif(''), 6000);
                    }}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                      modalAssetStatus.lifecycle_status === st.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
