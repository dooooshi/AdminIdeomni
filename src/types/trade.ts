// ==================== TYPES ====================
// Using number | string to handle decimal values from API
type DecimalValue = number | string;

// ==================== ENUMS ====================

export enum TradeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum TradeOperation {
  CREATED = 'CREATED',
  PREVIEWED = 'PREVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum InventoryItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  PRODUCT = 'PRODUCT',
}

export interface TradeTeamSummary {
  id: string;
  name: string;
}

export interface TradeFacilityLocation {
  q: number;
  r: number;
}

export interface TradeFacilitySummary {
  id: string;
  type: string;
  name?: string;
  location?: TradeFacilityLocation;
}

export interface TradeFormulaMaterial {
  materialId: number;
  materialName: string;
  quantity: number;
  unit: string;
  materialCost: number;
  carbonEmission?: number;
}

export interface TradeFormulaCraftCategory {
  categoryId: number;
  categoryName: string;
  categoryType: string;
}

export interface TradeFormulaSetupCosts {
  [key: string]: number | undefined;
  water?: number;
  power?: number;
  gold?: number;
}

export interface TradeFormulaVariableCostPercents {
  [key: string]: number | undefined;
  water?: number;
  power?: number;
  gold?: number;
  total?: number;
}

export interface TradeFormulaDetails {
  formulaNumber?: number;
  description?: string | null;
  totalMaterialCost?: number;
  materials?: TradeFormulaMaterial[];
  craftCategories?: TradeFormulaCraftCategory[];
  setupCosts?: TradeFormulaSetupCosts;
  variableCostPercents?: TradeFormulaVariableCostPercents;
  carbonEmission?: number;
}

// ==================== CORE MODELS ====================

export interface TradeOrder {
  id: string;
  activityId?: string;
  senderTeamId?: string;
  senderTeam?: TradeTeamSummary;
  sourceFacilityId?: string;
  sourceFacility?: TradeFacilitySummary;
  targetTeamId?: string;
  targetTeam?: TradeTeamSummary;
  destInventoryId?: string;
  destInventory?: FacilitySpaceInventory;
  message?: string;
  totalPrice: DecimalValue;
  status: TradeStatus;
  createdBy?: string;
  createdByUser?: User;
  respondedAt?: Date | string;
  respondedBy?: string;
  respondedByUser?: User;
  responseReason?: string;
  items?: TradeItem[];
  transaction?: TradeTransaction;
  history?: TradeHistory[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface TradeItem {
  id?: string;
  tradeOrderId?: string;
  inventoryItemId?: string;
  inventoryItem?: FacilityInventoryItem;
  sourceInventoryId?: string;
  sourceInventory?: FacilitySpaceInventory;
  itemName: string;
  itemType: InventoryItemType | string;
  quantity: DecimalValue;
  unitSpace?: DecimalValue;
  createdAt?: Date | string;
  formulaDetails?: TradeFormulaDetails | null;
}

export interface TradeTransaction {
  id: string;
  tradeOrderId: string;
  activityId: string;
  senderTeamId: string;
  senderTeam?: Team;
  receiverTeamId: string;
  receiverTeam?: Team;
  sourceInventoryId: string;
  sourceInventory?: FacilitySpaceInventory;
  destInventoryId: string;
  destInventory?: FacilitySpaceInventory;
  itemsCost: DecimalValue;
  transportCost: DecimalValue;
  totalPaid: DecimalValue;
  sellerReceived: DecimalValue;
  transportationOrderId?: string;
  executedBy: string;
  executedByUser?: User;
  executedAt: Date | string;
}

export interface TradeHistory {
  id: string;
  tradeOrderId: string;
  operation: TradeOperation;
  previousStatus?: TradeStatus;
  newStatus: TradeStatus;
  actorId: string;
  actor?: User;
  actorTeamId: string;
  actorTeam?: Team;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface CreateTradeRequest {
  targetTeamId: string;
  sourceFacilityId: string;
  sourceInventoryId: string;
  items: Array<{
    inventoryItemId: string;
    quantity: number;
  }>;
  totalPrice: number;
  message?: string;
}

export interface AcceptTradeRequest {
  destinationInventoryId: string;
}

export interface RejectTradeRequest {
  reason?: string;
}

export interface PreviewTradeRequest {
  destinationInventoryId: string;
}

export interface TradePreviewResponse {
  itemsCost: number;
  transportCost: number;
  totalCost: number;
  transport: {
    distance: number;
    tier: string;
    method: string;
  };
  validation: {
    hasSpace: boolean;
    hasFunds: boolean;
    canAccept: boolean;
  };
}

export interface TradeListParams {
  type?: 'incoming' | 'outgoing' | 'all';
  status?: TradeStatus | TradeStatus[];
  page?: number;
  limit?: number;
}

export interface TradePaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export interface TradeListResponse {
  success: boolean;
  data: TradeListItem[];
  total?: number;
  page?: number;
  limit?: number;
  pagination?: TradePaginationInfo;
}

export interface TradeListItem {
  id: string;
  senderTeam: {
    id: string;
    name: string;
  };
  targetTeam?: {
    id: string;
    name: string;
  };
  totalPrice: number;
  itemCount: number;
  totalQuantity: number;
  status: TradeStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
  message?: string;
}

export interface TradeDetailsResponse {
  success: boolean;
  data: TradeOrder;
  message?: string;
  businessCode?: number;
  timestamp?: string;
  extra?: Record<string, any>;
  path?: string;
}

// ==================== SUPPORTING TYPES ====================

export interface Team {
  id: string;
  name: string;
  activityId: string;
  resources?: {
    gold: number;
    carbon: number;
  };
  statistics?: {
    memberCount: number;
    landCount: number;
    facilityCount: number;
  };
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface TileFacilityInstance {
  id: string;
  name: string;
  type: string;
  level: number;
  location?: {
    q: number;
    r: number;
  };
}

export interface FacilitySpaceInventory {
  id?: string;
  inventoryId?: string; // For destination inventories (single inventory)
  inventoryIds?: string[]; // For source inventories (grouped by facility)
  facility?: {
    id: string;
    name: string;
    type: string;
    level: number;
    teamId?: string;
    location?: {
      q: number;
      r: number;
    };
    tileId?: number;
    uniqueKey?: string;
  };
  space?: {
    total: number;
    used: number;
    available: number;
    utilization: string;
  };
  itemCount?: number;
  canReceive?: boolean;
  items?: Array<{
    inventoryItemId: string;
    inventoryId?: string; // Which inventory this item belongs to
    itemType: string;
    name: string;
    description?: string | null;
    quantity: number;
    unitSpace: number;
    totalSpace: number;
    materialInfo?: {
      id: number;
      nameZh: string;
      carbonEmission: number;
    };
    productInfo?: {
      id: number;
      description: string;
      formulaNumber: number;
    };
  }>;
}

export interface FacilityInventoryItem {
  id: string;
  name: string;
  type: InventoryItemType;
  quantity: number;
  unitSpace: number;
  inventoryId?: string; // Track which inventory this item belongs to
}

export interface AvailableTeamsResponse {
  success: boolean;
  data: Team[];
}

export interface AvailableDestinationsResponse {
  success: boolean;
  data: FacilitySpaceInventory[];
}

// ==================== ERROR TYPES ====================

export interface TradeError {
  success: false;
  businessCode: number;
  message: string;
  details?: {
    required?: number;
    available?: number;
    [key: string]: any;
  };
}

// ==================== UTILITY TYPES ====================

export type TradeType = 'incoming' | 'outgoing';

export interface TradeFilters {
  status?: TradeStatus;
  type?: TradeType;
  startDate?: Date;
  endDate?: Date;
  teamId?: string;
}

export interface TradeSummary {
  totalTrades: number;
  pendingTrades: number;
  completedTrades: number;
  totalVolume: number;
  totalTransportCosts: number;
  averageTradeValue: number;
}

// ==================== HELPER TYPE GUARDS ====================

export function isTradeError(response: any): response is TradeError {
  return response && response.success === false && response.businessCode !== undefined;
}

// Helper function to convert DecimalValue to number
export function toNumber(value: DecimalValue): number {
  if (typeof value === 'string') {
    return parseFloat(value);
  }
  return value;
}

// ==================== STATUS HELPERS ====================

export const TradeStatusColors: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: 'warning',
  [TradeStatus.ACCEPTED]: 'info',
  [TradeStatus.REJECTED]: 'error',
  [TradeStatus.CANCELLED]: 'default',
  [TradeStatus.COMPLETED]: 'success',
};

export const TradeStatusTranslationKeys: Record<TradeStatus, string> = {
  [TradeStatus.PENDING]: 'trade.status.pending',
  [TradeStatus.ACCEPTED]: 'trade.status.accepted',
  [TradeStatus.REJECTED]: 'trade.status.rejected',
  [TradeStatus.CANCELLED]: 'trade.status.cancelled',
  [TradeStatus.COMPLETED]: 'trade.status.completed',
};

export const TradeOperationTranslationKeys: Record<TradeOperation, string> = {
  [TradeOperation.CREATED]: 'trade.operation.created',
  [TradeOperation.PREVIEWED]: 'trade.operation.previewed',
  [TradeOperation.ACCEPTED]: 'trade.operation.accepted',
  [TradeOperation.REJECTED]: 'trade.operation.rejected',
  [TradeOperation.CANCELLED]: 'trade.operation.cancelled',
  [TradeOperation.COMPLETED]: 'trade.operation.completed',
  [TradeOperation.FAILED]: 'trade.operation.failed',
};
