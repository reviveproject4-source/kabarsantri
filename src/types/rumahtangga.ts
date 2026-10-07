/**
 * DOMAIN: RUMAH TANGGA / OPERATIONAL SUPPORT & FACILITY MANAGEMENT
 * Specification: V2.0-PROD
 * Framework: AS-IS -> TO-BE -> THEN
 */

// ============================================================================
// 1. RT-DATA: MASTER DATA ENTITIES (GEDUNG, RUANGAN, ASET, INVENTARIS, VENDOR)
// ============================================================================

export interface Building {
  id: string;
  code: string;
  name: string;
  total_floors: number;
  pic_name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RENOVATION';
}

export interface RoomFacility {
  id: string;
  building_id: string;
  building_name: string;
  floor: number;
  room_code: string;
  room_name: string;
  capacity: number;
  is_bookable: boolean;
  pic_name: string;
  condition: 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
}

export type AssetCategory = 
  | 'ELEKTRONIK_AC' 
  | 'ELEKTRONIK_AUDIO' 
  | 'FURNITUR_KANTOR' 
  | 'FURNITUR_ASRAMA' 
  | 'KENDARAAN_OPERASIONAL' 
  | 'MESIN_LAUNDRY' 
  | 'PERALATAN_DAPUR' 
  | 'SARANA_IBADAH';

export type AssetCondition = 'SANGAT_BAIK' | 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';

export type AssetLifecycleStatus = 
  | 'PLANNED' 
  | 'ORDERED' 
  | 'RECEIVED' 
  | 'REGISTERED' 
  | 'ACTIVE' 
  | 'UNDER_MAINTENANCE' 
  | 'DAMAGED' 
  | 'REPAIR' 
  | 'RETIRED' 
  | 'DISPOSED' 
  | 'LOST' 
  | 'BORROWED';

export interface AssetItem {
  id: string; // e.g. AST-AC-001
  asset_code: string;
  name: string;
  category: AssetCategory;
  building_name: string;
  room_name: string;
  location_detail: string;
  condition: AssetCondition;
  lifecycle_status: AssetLifecycleStatus;
  pic_name: string;
  purchase_date: string;
  purchase_cost: number;
  warranty_until?: string;
  vendor_name?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  notes?: string;
}

// ============================================================================
// 2. RT-STOCK: INVENTORY & STOCK TRANSACTIONS
// ============================================================================

export type InventoryCategory = 
  | 'ALAT_KEBERSIHAN' 
  | 'CONSUMABLE_SANITASI' 
  | 'SPARE_PART_LISTRIK' 
  | 'SPARE_PART_PLUMBING' 
  | 'PERLENGKAPAN_KAMAR' 
  | 'LOGISTIK_DAPUR' 
  | 'PERLENGKAPAN_LAUNDRY';

export interface InventoryItem {
  id: string; // SKU e.g. INV-LMP-01
  name: string;
  category: InventoryCategory;
  unit: string; // pcs, rol, botol, liter, paket
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_price: number;
  location_rack: string;
  last_restock_date: string;
  is_low_stock: boolean;
}

export type StockMovementType = 
  | 'STOCK_IN' 
  | 'STOCK_OUT' 
  | 'RETURN' 
  | 'ADJUSTMENT' 
  | 'DAMAGED' 
  | 'LOST';

export interface StockMovementRecord {
  id: string;
  item_id: string;
  item_name: string;
  movement_type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  recipient_unit?: string;
  pic_operator: string;
  reason: string;
  reference_no?: string; // Request ID or PO ID
  timestamp: string;
  evidence_note?: string;
}

// ============================================================================
// 3. RT-SERVICE: SERVICE REQUEST LIFECYCLE
// ============================================================================

export type ServiceRequestCategory = 
  | 'KERUSAKAN_AC' 
  | 'LISTRIK_LAMPU' 
  | 'PLUMBING_AIR' 
  | 'KEBERSIHAN' 
  | 'PERBAIKAN_FASILITAS' 
  | 'KEBUTUHAN_BARANG' 
  | 'PERSIAPAN_RUANGAN'
  | 'LAINNYA';

export type ServiceRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ServiceRequestStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'VALIDATED' 
  | 'PRIORITIZED' 
  | 'APPROVED' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'WAITING' 
  | 'COMPLETED' 
  | 'VERIFIED' 
  | 'CLOSED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'ESCALATED';

export interface ServiceRequest {
  id: string;
  ticket_no: string; // e.g. SR-202610-001
  requester_name: string;
  requester_unit: string;
  category: ServiceRequestCategory;
  title: string;
  description: string;
  location_building: string;
  location_room: string;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  sla_hours: number;
  assigned_pic?: string;
  submitted_at: string;
  approved_at?: string;
  assigned_at?: string;
  completed_at?: string;
  verified_at?: string;
  closed_at?: string;
  verification_status?: 'ACCEPTED' | 'REJECTED';
  verification_notes?: string;
  cost_estimate?: number;
  actual_cost?: number;
  linked_finance_id?: string;
  linked_asset_id?: string;
  stock_used?: { item_id: string; item_name: string; qty: number }[];
  audit_trail: RtAuditEntry[];
}

// ============================================================================
// 4. RT-MAINT: MAINTENANCE (CORRECTIVE & PREVENTIVE)
// ============================================================================

export type MaintenanceType = 'CORRECTIVE' | 'PREVENTIVE';

export type MaintenanceStatus = 
  | 'SCHEDULED' 
  | 'REMINDER_SENT' 
  | 'INSPECTION' 
  | 'IN_PROGRESS' 
  | 'TESTING' 
  | 'VERIFIED' 
  | 'CLOSED';

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  type: MaintenanceType;
  title: string;
  scheduled_date: string;
  performed_date?: string;
  technician_name: string;
  vendor_name?: string;
  status: MaintenanceStatus;
  cost: number;
  actions_taken?: string;
  result?: 'SATISFACTORY' | 'NEEDS_FOLLOWUP' | 'FAILED';
  verification_notes?: string;
  next_scheduled_date?: string;
}

// ============================================================================
// 5. RT-CLEAN: CLEANING MANAGEMENT
// ============================================================================

export interface CleaningChecklistItem {
  item_name: string;
  is_checked: boolean;
  notes?: string;
}

export interface CleaningTask {
  id: string;
  area_name: string;
  building_name: string;
  floor: number;
  shift: 'PAGI' | 'SIANG' | 'SORE';
  scheduled_date: string;
  assigned_staff: string;
  checklist: CleaningChecklistItem[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'REJECTED';
  completed_at?: string;
  verified_by?: string;
  verified_at?: string;
  evidence_notes?: string;
}

// ============================================================================
// 6. RT-FACILITY: ROOM & FACILITY BOOKING (DOUBLE-BOOKING PREVENTION)
// ============================================================================

export interface FacilityBooking {
  id: string;
  room_id: string;
  room_name: string;
  building_name: string;
  requester_name: string;
  requester_unit: string;
  event_name: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  participants_count: number;
  equipment_needed?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'RESERVED' | 'IN_USE' | 'INSPECTED' | 'RELEASED' | 'REJECTED';
  post_inspection_condition?: string;
  notes?: string;
}

// ============================================================================
// 7. RT-LOAN: EQUIPMENT & ITEM LOAN
// ============================================================================

export interface EquipmentLoan {
  id: string;
  item_name: string;
  borrower_name: string;
  borrower_unit: string;
  borrow_date: string;
  return_due_date: string;
  actual_return_date?: string;
  quantity: number;
  status: 'SUBMITTED' | 'APPROVED' | 'CHECKED_OUT' | 'BORROWED' | 'RETURNED' | 'INSPECTED' | 'OVERDUE' | 'DAMAGED' | 'CLOSED';
  condition_out: string;
  condition_in?: string;
  responsibility_notes?: string;
}

// ============================================================================
// 8. RT-SAFETY: SAFETY INSPECTION & RISK MITIGATION
// ============================================================================

export type SafetyCategory = 'GEDUNG_STRUKTUR' | 'LISTRIK_INSTALASI' | 'FIRE_SAFETY_APAR' | 'SANITASI_LINGKUNGAN';
export type SafetyRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SafetyInspection {
  id: string;
  category: SafetyCategory;
  location: string;
  inspector_name: string;
  inspection_date: string;
  findings_description: string;
  risk_level: SafetyRiskLevel;
  action_plan: string;
  assigned_pic: string;
  status: 'INSPECTION' | 'FINDING_LOGGED' | 'ACTION_ASSIGNED' | 'RESOLVED' | 'VERIFIED';
  resolution_date?: string;
  verified_by?: string;
}

// ============================================================================
// 9. RT-VENDOR: VENDOR PROFILE & WORK ORDERS
// ============================================================================

export interface VendorProfile {
  id: string;
  name: string;
  service_category: string;
  contact_person: string;
  phone: string;
  email: string;
  contract_period: string;
  status: 'ACTIVE' | 'INACTIVE';
  performance_rating: number; // 1 to 5
  total_jobs_completed: number;
  total_spent: number;
  notes?: string;
}

// ============================================================================
// 10. RT-AUDIT: SYSTEM-WIDE AUDIT TRAIL
// ============================================================================

export interface RtAuditEntry {
  id: string;
  timestamp: string;
  who: string;
  role: string;
  action: string;
  entity: string;
  entity_id: string;
  old_value?: string;
  new_value: string;
  reason?: string;
}

// ============================================================================
// 11. RT-VIS & RT-BUDGET: DASHBOARD SUMMARY
// ============================================================================

export interface RtDashboardMetrics {
  total_active_requests: number;
  critical_issues_count: number;
  high_priority_issues_count: number;
  overdue_requests_count: number;
  maintenance_due_count: number;
  low_stock_items_count: number;
  assets_under_maintenance_count: number;
  sla_compliance_percentage: number;
  average_resolution_hours: number;
  total_budget_allocated: number;
  actual_spent: number;
  committed_spent: number;
  remaining_budget: number;
  safety_unresolved_findings: number;
}
