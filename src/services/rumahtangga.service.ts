/**
 * DOMAIN SERVICE: RUMAH TANGGA / OPERATIONAL SUPPORT & FACILITY MANAGEMENT
 * Encapsulates business operations, rule validations, and transitions.
 */

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
} from '../lib/rumahTanggaStore';
import {
  ServiceRequest,
  ServiceRequestPriority,
  AssetItem,
  AssetLifecycleStatus,
  StockMovementType,
  InventoryItem,
  FacilityBooking,
  CleaningTask,
  RtDashboardMetrics,
} from '../types/rumahtangga';

export class RumahTanggaService {
  /**
   * 1. Dashboard & Visibility (RT-VIS)
   */
  getDashboardMetrics(): RtDashboardMetrics {
    return getRtDashboardMetrics();
  }

  /**
   * 2. Service Request Operations (RT-SERVICE)
   */
  getAllRequests(): ServiceRequest[] {
    return getRtStore().service_requests;
  }

  submitNewRequest(params: {
    requester_name: string;
    requester_unit: string;
    category: ServiceRequest['category'];
    title: string;
    description: string;
    location_building: string;
    location_room: string;
    priority: ServiceRequestPriority;
    linked_asset_id?: string;
  }): ServiceRequest {
    return createServiceRequest(params);
  }

  assignRequest(requestId: string, picName: string, costEstimate: number = 0): ServiceRequest | null {
    return assignServiceRequest(requestId, picName, costEstimate);
  }

  completeRequest(
    requestId: string, 
    actualCost: number = 0, 
    notes: string = '', 
    stockUsed?: { item_id: string; item_name: string; qty: number }[]
  ): ServiceRequest | null {
    return completeServiceRequest(requestId, actualCost, notes, stockUsed);
  }

  verifyRequest(requestId: string, action: 'ACCEPT' | 'REJECT', notes: string = ''): ServiceRequest | null {
    return verifyServiceRequest(requestId, action, notes);
  }

  /**
   * 3. Asset Lifecycle Operations (RT-ASSET)
   */
  getAllAssets(): AssetItem[] {
    return getRtStore().assets;
  }

  registerAsset(asset: Omit<AssetItem, 'id' | 'asset_code'>): AssetItem {
    return registerAsset(asset);
  }

  relocateAsset(assetId: string, newBuilding: string, newRoom: string, newPic: string, reason: string): AssetItem | null {
    return relocateAsset(assetId, newBuilding, newRoom, newPic, reason);
  }

  updateAssetStatus(assetId: string, status: AssetLifecycleStatus, reason: string): AssetItem | null {
    return updateAssetStatus(assetId, status, reason);
  }

  /**
   * 4. Stock & Inventory Management (RT-STOCK)
   */
  getAllInventory(): InventoryItem[] {
    return getRtStore().inventory;
  }

  recordStockMovement(params: {
    item_id: string;
    movement_type: StockMovementType;
    quantity: number;
    pic_operator: string;
    reason: string;
    recipient_unit?: string;
  }) {
    return recordStockMovement(params);
  }

  requestItemWithCheck(params: {
    item_id: string;
    qty: number;
    requester_name: string;
    requester_unit: string;
    purpose: string;
  }) {
    return processItemRequestWithStockCheck(params);
  }

  /**
   * 5. Room & Facility Booking (RT-FACILITY)
   */
  getBookings(): FacilityBooking[] {
    return getRtStore().facility_bookings;
  }

  bookFacility(params: {
    room_id: string;
    requester_name: string;
    requester_unit: string;
    event_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    participants_count: number;
    equipment_needed?: string;
  }) {
    return createFacilityBooking(params);
  }

  /**
   * 6. Cleaning Tasks (RT-CLEAN)
   */
  getCleaningTasks(): CleaningTask[] {
    return getRtStore().cleaning_tasks;
  }

  toggleCleaningItem(taskId: string, itemIdx: number): CleaningTask | null {
    return toggleCleaningChecklistItem(taskId, itemIdx);
  }

  verifyCleaningTask(taskId: string, verifierName?: string, notes?: string): CleaningTask | null {
    return verifyCleaningTask(taskId, verifierName, notes);
  }
}

export const rumahTanggaService = new RumahTanggaService();
