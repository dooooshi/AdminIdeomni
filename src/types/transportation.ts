export enum TransportationTier {
  A = 'TIER_A',
  B = 'TIER_B', 
  C = 'TIER_C',
  D = 'TIER_D'
}

export enum TransportStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum InventoryItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  PRODUCT = 'PRODUCT'
}

export interface TransportationConfig {
  id: string;
  templateId: number;
  
  tierABaseCost: number;
  tierAEmissionRate: number;
  tierAMinDistance: number;
  tierAMaxDistance: number;
  tierASpaceBasis: number;
  tierAEnabled: boolean;
  
  tierBBaseCost: number;
  tierBEmissionRate: number;
  tierBMinDistance: number;
  tierBMaxDistance: number;
  tierBSpaceBasis: number;
  tierBEnabled: boolean;
  
  tierCBaseCost: number;
  tierCEmissionRate: number;
  tierCMinDistance: number;
  tierCMaxDistance: number;
  tierCSpaceBasis: number;
  tierCEnabled: boolean;
  
  tierDBaseCost: number;
  tierDEmissionRate: number;
  tierDMinDistance: number;
  tierDSpaceBasis: number;
  tierDEnabled: boolean;
  
  enableCrossTeamTransfers: boolean;
  maxTransferQuantity?: number;
  transferCooldownMinutes: number;
  
  distanceAMax: number;
  distanceBMax: number;
  distanceCMax: number;
  
  description?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransportationConfigDto {
  tierABaseCost?: number;
  tierAEmissionRate?: number;
  tierAMinDistance?: number;
  tierAMaxDistance?: number;
  tierASpaceBasis?: number;
  tierAEnabled?: boolean;
  
  tierBBaseCost?: number;
  tierBEmissionRate?: number;
  tierBMinDistance?: number;
  tierBMaxDistance?: number;
  tierBSpaceBasis?: number;
  tierBEnabled?: boolean;
  
  tierCBaseCost?: number;
  tierCEmissionRate?: number;
  tierCMinDistance?: number;
  tierCMaxDistance?: number;
  tierCSpaceBasis?: number;
  tierCEnabled?: boolean;
  
  tierDBaseCost?: number;
  tierDEmissionRate?: number;
  tierDMinDistance?: number;
  tierDSpaceBasis?: number;
  tierDEnabled?: boolean;
  
  enableCrossTeamTransfers?: boolean;
  maxTransferQuantity?: number;
  transferCooldownMinutes?: number;
  
  distanceAMax?: number;
  distanceBMax?: number;
  distanceCMax?: number;
  
  description?: string;
}

export interface UpdateTransportationConfigDto extends CreateTransportationConfigDto {}

export interface TransportationOrder {
  id: string;
  configId: string;
  
  sourceInventoryId: string;
  sourceFacilityId: string;
  destInventoryId: string;
  destFacilityId: string;
  
  inventoryItemId: string;
  itemType: InventoryItemType;
  rawMaterialId?: number;
  productFormulaId?: number;
  
  quantity: number;
  unitSpaceOccupied: number;
  totalSpaceTransferred: number;
  
  tier: string;
  hexDistance: number;
  transportCostUnits: number;
  distanceCategory: string;
  
  unitCost: number;
  totalGoldCost: number;
  carbonEmissionRate: number;
  totalCarbonEmission: number;
  
  senderTeamId: string;
  receiverTeamId: string;
  initiatedBy: string;
  activityId: string;
  
  status: TransportStatus;
  completedAt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TransportationCostPreview {
  id: string;
  sourceInventoryId: string;
  destInventoryId: string;
  itemType: InventoryItemType;
  itemId: number;
  quantity: number;
  
  hexDistance: number;
  distanceCategory: string;
  transportCostUnits: number;
  
  availableTiers: TierCostCalculation[];
  
  teamId: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface TierCostCalculation {
  tier: string;
  available: boolean;
  unitCost?: number;
  totalCost?: number;
  carbonEmission?: number;
  reason?: string;
}

export interface TransferRequest {
  sourceInventoryId: string;
  destInventoryId: string;
  inventoryItemId: string;  // FacilityInventoryItem ID
  quantity: string;         // Quantity as string per API spec
  tier?: string;           // Selected tier (must be available for distance)
}

export interface TransferCostRequest {
  sourceInventoryId: string;
  destInventoryId: string;
  inventoryItemId: string;  // FacilityInventoryItem ID
  quantity: string;         // Quantity as string per API spec
}

export interface TransferResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  goldDeducted?: number;
  carbonEmitted?: number;
}

export interface AvailableRoute {
  sourceFacilityId: string;
  sourceFacilityName: string;
  destFacilityId: string;
  destFacilityName: string;
  hexDistance: number;
  transportCostUnits: number;
  availableTier: string;
  estimatedCostPerSpaceUnit: number;
}

export interface TransportationStatistics {
  totalTransfers: number;
  totalGoldSpent: number;
  totalCarbonEmitted: number;
  transfersByTier: {
    tierA: number;
    tierB: number;
    tierC: number;
    tierD: number;
  };
  averageCostPerTransfer: number;
  averageDistance: number;
  mostUsedTier: string;
}

export interface TransportationConfigResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: TransportationConfig;
  timestamp: string;
}

export interface TransportationConfigListResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: TransportationConfig[];
  timestamp: string;
}

export interface TransportationOrderListResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: {
    items: TransportationOrder[];
    total: number;
    page: number;
    pageSize: number;
  };
  timestamp: string;
}

export interface FacilityForTransport {
  id: string;
  facilityName: string;
  facilityType: string;
  inventoryId: string;
  tileX: number;
  tileY: number;
  currentInventory: number;
  availableSpace: number;
  totalSpace: number;
}

export interface InventoryItemForTransport {
  id: string;
  name: string;
  type: 'RAW_MATERIAL' | 'PRODUCT';
  inventoryItemId: string;
  availableQuantity: number;
}

export interface TransferResult {
  success: boolean;
  orderId: string;
  message?: string;
  goldDeducted: number;
  carbonEmitted: number;
}

// Facility Inventory Response types
export interface FacilityInventoryItem {
  id: string;
  itemType?: string;
  materialId?: number;
  materialNumber?: number;
  formulaId?: number;
  formulaNumber?: number;
  name?: string;
  nameZh?: string;
  nameEn?: string;
  productName?: string;
  productDescription?: string;
  origin?: string;
  quantity: string;
  unitSpaceOccupied: string;
  totalSpaceOccupied: string;
  unitCost: string;
  totalValue: string;
  receivedDate: string;
  expiryDate?: string;
  daysInStorage: number;
  daysUntilExpiry?: number;
  carbonEmission?: string;
  metadata?: Record<string, any>;
}

export interface FacilityInventoryResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: {
    facility: {
      inventoryId: string;
      facilityId: string;
      facilityType: string;
      facilityName?: string;
      level: number;
      teamId: string;
      teamName: string;
      location: {
        axialQ: number;
        axialR: number;
      };
    };
    spaceUtilization: {
      totalSpace: string;
      usedSpace: string;
      availableSpace: string;
      utilizationPercentage: number;
      rawMaterialSpace: string;
      productSpace: string;
    };
    inventory: {
      totalItems: number;
      rawMaterials: {
        count: number;
        items: FacilityInventoryItem[];
      };
      products: {
        count: number;
        items: FacilityInventoryItem[];
      };
    };
    summary: {
      totalValue: string;
      totalCarbonFootprint: string;
      averageStorageDays: number;
      expiringItemsCount: number;
      lowStockItemsCount: number;
    };
  };
}

export const DEFAULT_TRANSPORTATION_CONFIG: Partial<CreateTransportationConfigDto> = {
  tierABaseCost: 5,
  tierAEmissionRate: 1,
  tierAMinDistance: 1,
  tierAMaxDistance: 3,
  tierASpaceBasis: 1,
  tierAEnabled: true,
  
  tierBBaseCost: 30,
  tierBEmissionRate: 5,
  tierBMinDistance: 4,
  tierBMaxDistance: 6,
  tierBSpaceBasis: 10,
  tierBEnabled: true,
  
  tierCBaseCost: 200,
  tierCEmissionRate: 25,
  tierCMinDistance: 7,
  tierCMaxDistance: 9,
  tierCSpaceBasis: 100,
  tierCEnabled: true,
  
  tierDBaseCost: 1000,
  tierDEmissionRate: 100,
  tierDMinDistance: 10,
  tierDSpaceBasis: 1000,
  tierDEnabled: true,
  
  enableCrossTeamTransfers: true,
  maxTransferQuantity: undefined,
  transferCooldownMinutes: 0,
  
  distanceAMax: 3,
  distanceBMax: 6,
  distanceCMax: 9
};