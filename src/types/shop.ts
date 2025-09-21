/**
 * Shop Module Type Definitions
 * Based on backend API specification from docs/shop/
 */

// ==================== Core Enums ====================

export enum MaterialOrigin {
  MINE = 'MINE',
  QUARRY = 'QUARRY',
  FOREST = 'FOREST',
  FARM = 'FARM',
  RANCH = 'RANCH',
  FISHERY = 'FISHERY',
  SHOPS = 'SHOPS',
  FACTORY = 'FACTORY',
  OTHER = 'OTHER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

export enum ShopActionType {
  SHOP_CREATED = 'SHOP_CREATED',
  MATERIAL_ADDED = 'MATERIAL_ADDED',
  MATERIAL_REMOVED = 'MATERIAL_REMOVED',
  MATERIAL_PRICE_SET = 'MATERIAL_PRICE_SET',
  MATERIAL_STOCK_UPDATED = 'MATERIAL_STOCK_UPDATED',
  PURCHASE_COMPLETED = 'PURCHASE_COMPLETED',
  PURCHASE_FAILED = 'PURCHASE_FAILED',
  PURCHASE_REFUNDED = 'PURCHASE_REFUNDED'
}

export enum ActionCategory {
  MATERIAL_MGMT = 'MATERIAL_MGMT',
  PRICING = 'PRICING',
  TRANSACTION = 'TRANSACTION'
}

// ==================== Core Data Models ====================

export interface RawMaterial {
  id: number;
  materialNumber: number;
  name: string; // Chinese name from API
  nameEn?: string; // English name (optional)
  nameZh?: string; // Chinese name (optional, for compatibility)
  origin: string; // 'MINE' | 'QUARRY' | 'FOREST' | 'FARM' | 'RANCH' | 'FISHERY' | 'SHOPS'
  totalCost: number;
  waterRequired: number;
  powerRequired: number;
  goldCost: number;
  carbonEmission: number;
  unit?: string;
  description?: string;
}

export interface ActivityShop {
  id: number;
  activityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopMaterial {
  id: number;
  shopId: number;
  rawMaterialId: number;
  material: RawMaterial;
  unitPrice: string;
  quantityToSell: number | null;
  quantitySold: number;
  addedAt?: string;
  addedBy?: string;
  lastPriceSetAt?: string;
  lastPriceSetBy?: string;
}

export interface ShopTransaction {
  id: number;
  transactionCode: string;
  shopId: number;
  material: {
    id: number;
    nameEn: string;
    nameZh: string;
    origin: MaterialOrigin;
  };
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  buyer?: {
    userId: number;
    username: string;
    teamId?: number;
    teamName?: string;
  };
  purchasedBy?: {
    userId: number;
    username: string;
  };
  delivery: {
    facilitySpaceId: number;
    facilityName: string;
    status: DeliveryStatus;
  };
  status: TransactionStatus;
  purchasedAt: string;
  createdAt: string;
}

export interface ShopHistory {
  id: number;
  actionType: ShopActionType;
  actionCategory: ActionCategory;
  actor: {
    id: number;
    username: string;
    role: string;
  };
  entityType: string;
  entityId: number;
  previousValue?: any;
  newValue?: any;
  changeDescription: string;
  createdAt: string;
}

export interface ShopPriceHistory {
  id: number;
  shopId: number;
  materialId: number;
  oldPrice: string | null;
  newPrice: string;
  changedBy: string;
  managerName: string;
  changeReason?: string;
  changedAt: string;
}

// ==================== API Request DTOs ====================

export interface MaterialQueryParams {
  origin?: MaterialOrigin;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'materialNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface AddMaterialRequest {
  rawMaterialId: number;
  unitPrice: number;
  quantityToSell?: number; // Optional - undefined means unlimited
}

export interface UpdatePriceRequest {
  unitPrice: number;
  reason?: string;
}

export interface PurchaseRequest {
  materialId: number;
  quantity: number;
  facilitySpaceId: number | string; // Can be either number or string based on backend implementation
}

export interface HistoryQueryParams {
  actionType?: ShopActionType;
  actorId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TeamTransactionQueryParams {
  materialId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ==================== API Response DTOs ====================

export interface BrowseMaterialsResponse {
  shopId: number;
  materials: ShopMaterial[];
  totalMaterials: number;
}

export interface AddMaterialResponse {
  id: number;
  material: {
    nameEn: string;
    nameZh: string;
    origin: MaterialOrigin;
  };
  unitPrice: string;
  quantityToSell: number | null;
  addedBy: number;
  addedAt: string;
}

export interface RemoveMaterialResponse {
  materialId: number;
  materialName: string;
  removedBy: number;
  removedAt: string;
}

export interface UpdatePriceResponse {
  materialId: number;
  material: {
    nameEn: string;
    nameZh: string;
    origin: MaterialOrigin;
  };
  oldPrice: string | null;
  newPrice: string;
  updatedBy: number;
  updatedAt: string;
}

export interface PurchaseResponse {
  transactionId: number;
  transactionCode: string;
  status: TransactionStatus;
  buyer: {
    userId: number;
    username: string;
    teamId: number;
    teamName: string;
  };
  purchase: {
    materialName: string;
    quantity: number;
    unitPrice: string;
    totalAmount: string;
  };
  delivery: {
    status: DeliveryStatus;
    facilitySpaceId: number;
    facilityName: string;
    deliveredAt: string;
  };
  financials: {
    previousBalance: string;
    amountCharged: string;
    newBalance: string;
    accountHistoryId: number;
  };
}

export interface TeamTransactionsResponse {
  teamInfo: {
    teamId: number;
    teamName: string;
    currentBalance: string;
  };
  transactions: ShopTransaction[];
  summary: {
    totalTransactions: number;
    totalSpent: string;
    uniqueMaterials: number;
    periodStart: string;
    periodEnd: string;
  };
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ShopHistoryResponse {
  history: ShopHistory[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ShopTransactionsResponse {
  transactions: ShopTransaction[];
  summary: {
    totalSpent: string;
    transactionCount: number;
    uniqueMaterials: number;
  };
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ==================== Facility Space Types (Integration) ====================

export interface FacilitySpaceOverview {
  teamId: string;
  teamName: string;
  activityId: string;
  summary: {
    totalFacilities: number;
    storageFacilities: number;
    totalSpaceCapacity: number;
    totalSpaceUsed: number;
    totalSpaceAvailable: number;
    utilizationRate: number;
  };
  facilities: FacilitySpace[];
}

export interface FacilitySpace {
  facilityInstanceId: string;
  inventoryId: string;
  facilityType: string;
  facilityName: string;
  tileCoordinates: {
    q: number;
    r: number;
    s: number;
  };
  level: number;
  spaceMetrics: {
    totalSpace: number;
    usedSpace: number;
    availableSpace: number;
    utilizationRate: number;
    rawMaterialSpace: number;
    productSpace: number;
  };
}

// ==================== UI State Types ====================

export interface ShopUIState {
  isLoading: boolean;
  error: string | null;
  materials: ShopMaterial[];
  selectedMaterial: ShopMaterial | null;
  filters: {
    origin?: MaterialOrigin;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
  };
  sortConfig: {
    field: 'price' | 'name' | 'materialNumber';
    direction: 'asc' | 'desc';
  };
}

export interface PurchaseUIState {
  selectedMaterial: ShopMaterial | null;
  quantity: number;
  selectedFacilityId: number | null;
  isProcessing: boolean;
  error: string | null;
}

// ==================== Utility Types ====================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiError {
  businessCode: number;
  message: string;
  details?: any;
}

export interface StandardApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
  extra?: any;
}