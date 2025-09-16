// Trade System Type Definitions
// Based on docs/trade/*.md specifications

// ==================== ENUMS ====================

export enum TradeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum TradeOperation {
  CREATED = 'CREATED',
  PREVIEWED = 'PREVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum InventoryItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  PRODUCT = 'PRODUCT'
}

// ==================== CORE ENTITIES ====================

export interface TradeOrder {
  id: string;

  // Activity context
  activityId: string;

  // Sender information
  senderTeamId: string;
  senderTeam?: TeamInfo;
  sourceFacilityId: string;
  sourceFacility?: FacilityInfo;
  sourceInventoryId: string; // FacilitySpaceInventory ID

  // Receiver information
  targetTeamId: string;
  targetTeam?: TeamInfo;
  destInventoryId?: string; // Set when receiver accepts
  destInventory?: FacilityInventoryInfo;

  // Trade details
  message?: string;
  totalPrice: number; // Price for items only (no transport)
  status: TradeStatus;

  // Metadata
  createdBy: string;
  createdByUser?: UserInfo;
  respondedAt?: string;
  respondedBy?: string;
  respondedByUser?: UserInfo;
  responseReason?: string;

  // Relations
  items: TradeItem[];
  transaction?: TradeTransaction;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface TradeItem {
  id: string;
  tradeOrderId: string;

  // Item reference
  inventoryItemId: string;
  sourceInventoryId: string;

  // Item details
  itemName: string;
  itemType: InventoryItemType;
  quantity: number;
  unitSpace: number; // Space per unit
  totalSpace?: number; // quantity * unitSpace
}

export interface TradeTransaction {
  id: string;
  tradeOrderId: string;
  activityId: string;

  // Teams
  senderTeamId: string;
  senderTeam?: TeamInfo;
  receiverTeamId: string;
  receiverTeam?: TeamInfo;

  // Inventory locations
  sourceInventoryId: string;
  destInventoryId: string; // Chosen by receiver

  // Amounts (receiver pays all)
  itemsCost: number;
  transportCost: number;
  totalPaid: number; // items + transport
  sellerReceived: number; // items cost only

  // Transportation tracking
  transportationOrderId?: string;

  // Execution
  executedBy: string;
  executedByUser?: UserInfo;
  executedAt: string;
}

export interface TradeHistory {
  id: string;
  tradeOrderId: string;

  // Operation tracking
  operation: TradeOperation;
  previousStatus?: TradeStatus;
  newStatus: TradeStatus;

  // Actor information
  actorId: string;
  actor?: UserInfo;
  actorTeamId: string;
  actorTeam?: TeamInfo;

  // Additional context
  description: string;
  metadata?: {
    transportCost?: number;
    destinationInventoryId?: string;
    rejectionReason?: string;
    failureDetails?: any;
    totalCost?: number;
    transactionId?: string;
    transportationOrderId?: string;
  };

  createdAt: string;
}

// ==================== HELPER INTERFACES ====================

export interface TeamInfo {
  id: string;
  name: string;
  description?: string;
  leader?: UserInfo;
  memberCount?: number;
  maxMembers?: number;
  isOpen?: boolean;
}

export interface UserInfo {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface FacilityInfo {
  id: string;
  type: string;
  name?: string;
  location: TileCoordinates;
  level?: number;
}

export interface FacilityInventoryInfo {
  id: string;
  facilityId: string;
  facilityType: string;
  facilityName?: string;
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
  location?: TileCoordinates;
}

export interface TileCoordinates {
  q: number;
  r: number;
  s?: number;
}

// ==================== API REQUEST TYPES ====================

export interface CreateTradeRequest {
  targetTeamId: string;
  sourceFacilityId: string;
  sourceInventoryId: string;
  items: CreateTradeItem[];
  totalPrice: number;
  message?: string;
}

export interface CreateTradeItem {
  inventoryItemId: string;
  quantity: number;
}

export interface TradeListQuery {
  type?: 'incoming' | 'outgoing' | 'all';
  status?: TradeStatus;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  teamId?: string;
}

export interface PreviewTradeRequest {
  destinationInventoryId: string;
}

export interface AcceptTradeRequest {
  destinationInventoryId: string;
}

export interface RejectTradeRequest {
  reason?: string;
}

export interface TradeHistoryQuery {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export interface TradeOperationHistoryQuery {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

// ==================== API RESPONSE TYPES ====================

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
    errors?: string[];
  };
}

export interface TradeListResponse {
  trades: TradeSummary[];
  pagination: PaginationInfo;
}

export interface TradeSummary {
  id: string;
  type?: 'incoming' | 'outgoing';
  senderTeam: TeamInfo;
  targetTeam?: TeamInfo;
  partnerTeam: TeamInfo;
  totalPrice: number;
  totalValue: number;
  itemCount: number;
  totalQuantity: number;
  status: TradeStatus;
  createdAt: string;
  message?: string;
}

export interface TradeDetailResponse {
  id: string;
  senderTeam: TeamInfo;
  targetTeam?: TeamInfo;
  totalPrice: number;
  items: TradeItem[];
  sourceFacility: FacilityInfo;
  message?: string;
  status: TradeStatus;
  createdAt: string;
  history?: TradeHistory[];
}

export interface TradeStats {
  totalTrades: number;
  pendingCount: number;
  incomingCount: number;
  outgoingCount: number;
  completedCount: number;
  rejectedCount: number;
  totalValue: number;
  transportCosts: number;
  growth?: {
    trades: number;
    value: number;
  };
}

export interface TradeStatistics {
  teamId: string;
  period: {
    start: string;
    end: string;
  };
  sales: {
    count: number;
    totalAmount: number;
    averageAmount: number;
    topBuyers: TradePartner[];
  };
  purchases: {
    count: number;
    totalAmount: number;
    averageAmount: number;
    transportCosts: number;
    topSellers: TradePartner[];
  };
  netPosition: number;
  mostTradedItems: TradedItem[];
}

export interface TradePartner {
  teamId: string;
  teamName: string;
  tradeCount: number;
  totalAmount: number;
}

export interface TradedItem {
  itemName: string;
  quantity: number;
  tradeCount: number;
}

export interface TeamOperationHistory {
  id: string;
  operationType: string;
  amount: number;
  resourceType: 'GOLD' | 'CARBON';
  balanceBefore: number;
  balanceAfter: number;
  targetTeam?: TeamInfo;
  sourceTeam?: TeamInfo;
  description: string;
  metadata?: {
    tradeOrderId?: string;
    itemsCost?: number;
    transportCost?: number;
    items?: TradeItem[];
  };
  createdAt: string;
}

// ==================== DESTINATION SELECTION TYPES ====================

export interface DestinationOption {
  inventoryId: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  location: TileCoordinates;
  availableSpace: number;
  currentUtilization: number;
  estimatedTransportCost?: number;
  distance?: number;
}

export interface DestinationSelectionResult {
  selectedInventoryId: string;
  facility: FacilityInventoryInfo;
  transportPreview: {
    cost: number;
    distance: number;
    tier: string;
  };
}

// ==================== UTILITY TYPES ====================

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  businessCode?: number;
  message?: string;
  data: T;
  timestamp?: string;
  path?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ==================== ERROR TYPES ====================

export enum TradeErrorCode {
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_SPACE = 'INSUFFICIENT_SPACE',
  TEAMS_NOT_IN_SAME_ACTIVITY = 'TEAMS_NOT_IN_SAME_ACTIVITY',
  TRADE_NOT_FOUND = 'TRADE_NOT_FOUND',
  TRADE_ALREADY_PROCESSED = 'TRADE_ALREADY_PROCESSED',
  INVALID_TRADE_STATUS = 'INVALID_TRADE_STATUS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface TradeError {
  code: TradeErrorCode;
  message: string;
  details?: any;
}