// Raw Material Types and Interfaces

// Raw Material Origin based on facility types
export enum RawMaterialOrigin {
  MINE = 'MINE',           // 矿场 - Mining operations
  QUARRY = 'QUARRY',       // 采石场 - Stone and aggregate extraction
  FOREST = 'FOREST',       // 林场 - Timber and wood products
  FARM = 'FARM',           // 农场 - Agricultural products
  RANCH = 'RANCH',         // 养殖场 - Livestock-based materials
  FISHERY = 'FISHERY',     // 渔场 - Marine-based materials
  SHOPS = 'SHOPS'          // 商店 - Retail and commercial materials
}

// Main Raw Material interface
export interface RawMaterial {
  id: number;
  materialNumber: number;        // Unique identifier
  origin: RawMaterialOrigin;     // Production source facility type
  nameEn: string;                // English name
  nameZh: string;                // Chinese name
  
  // Resource Requirements
  waterRequired: number;         // Water units required
  powerRequired: number;         // Power units required
  
  // Economic Data
  totalCost: number;            // Total production cost
  goldCost: number;             // Gold component cost
  
  // Environmental Impact
  carbonEmission: number;        // Carbon emission value
  
  // Metadata
  isActive: boolean;            // Active/inactive status
  isDeleted: boolean;           // Soft delete flag
  deletedAt?: string;           // Deletion timestamp
  deletedBy?: string;           // Admin who deleted
  deletionReason?: string;      // Reason for deletion
  
  createdAt: string;
  createdBy?: string;           // Admin who created
  updatedAt: string;
  lastModifiedBy?: string;      // Admin who last modified
}

// Audit Log Entry
export interface RawMaterialAuditLog {
  id: number;
  rawMaterialId: number;
  materialName: string;
  action: AuditAction;
  changes?: Record<string, { old: unknown; new: unknown }>;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  modifiedBy: string;
  adminEmail?: string;
  modifiedAt: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Audit Action Types
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE'
}

// Request Interfaces
export interface CreateRawMaterialRequest {
  materialNumber: number;
  origin: RawMaterialOrigin;
  nameEn: string;
  nameZh: string;
  totalCost: number;
  waterRequired: number;
  powerRequired: number;
  goldCost: number;
  carbonEmission: number;
  modificationReason: string;
}

export interface UpdateRawMaterialRequest {
  materialNumber?: number;
  origin?: RawMaterialOrigin;
  nameEn?: string;
  nameZh?: string;
  totalCost?: number;
  waterRequired?: number;
  powerRequired?: number;
  goldCost?: number;
  carbonEmission?: number;
  isActive?: boolean;
  modificationReason: string;
}

export interface DeleteRawMaterialRequest {
  reason: string;
  permanent?: boolean;
}

// Search and Filter Parameters
export interface RawMaterialSearchParams {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: 'materialNumber' | 'nameEn' | 'nameZh' | 'totalCost' | 'carbonEmission';
  order?: 'asc' | 'desc';
  origin?: RawMaterialOrigin;
  isActive?: boolean;
  isDeleted?: boolean;
  search?: string;
  minCost?: number;
  maxCost?: number;
  minCarbon?: number;
  maxCarbon?: number;
}

// Audit Log Search Parameters
export interface AuditLogSearchParams {
  materialId?: number;
  adminId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Response Interfaces
export interface RawMaterialSearchResponse {
  items: RawMaterial[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  filters: {
    origin: RawMaterialOrigin | null;
    isActive: boolean;
    search: string | null;
    costRange: { min?: number; max?: number } | null;
    carbonRange: { min?: number; max?: number } | null;
  };
}

export interface AuditLogSearchResponse {
  logs: RawMaterialAuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
}

// Statistics Interface
export interface RawMaterialStatistics {
  totalMaterials: number;
  activeMaterials: number;
  deletedMaterials: number;
  materialsByOrigin: Record<RawMaterialOrigin, number>;
  averageCost: number;
  averageCarbonEmission: number;
}


// Admin Permission Levels
export interface AdminPermissions {
  canViewMaterials: boolean;
  canCreateMaterial: boolean;
  canUpdateMaterial: boolean;
  canDeleteMaterial: boolean;
  canViewAuditLog: boolean;
}