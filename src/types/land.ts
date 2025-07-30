// Land Management System Types
// Based on the comprehensive land management API documentation

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  businessCode?: number;
  timestamp?: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Core Land Types
export interface TileInfo {
  id: number;
  axialQ: number;
  axialR: number;
  landType: 'PLAIN' | 'COASTAL' | 'MARINE';
  initialGoldPrice?: number;
  initialCarbonPrice?: number;
  initialPopulation?: number;
  transportationCostUnit?: number;
}

export interface TileCurrentState {
  currentGoldPrice?: number;
  currentCarbonPrice?: number;
  currentPopulation?: number;
  lastUpdated: string;
}

export interface TileOwnershipDetail {
  tileId: number;
  teamId: string;
  teamName: string;
  ownedArea: number;
  totalPurchased: number;
  totalGoldSpent: number;
  totalCarbonSpent: number;
  purchaseCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export interface AvailableTile {
  tileId: number;
  axialQ: number;
  axialR: number;
  landType: 'PLAIN' | 'COASTAL' | 'MARINE';
  currentGoldPrice: number;
  currentCarbonPrice: number;
  currentPopulation?: number; // Optional as it may be null from API
  totalOwnedArea: number;
  teamOwnedArea: number;
  availableArea: number;
  canPurchase: boolean;
}

export interface TileDetailsWithOwnership {
  tile: TileInfo;
  currentState: TileCurrentState;
  ownership: TileOwnershipDetail[];
  totalOwnedArea: number;
  availableArea: number;
}

// Purchase Types
export interface LandPurchaseRequest {
  tileId: number;
  area: number;
  maxGoldCost?: number;
  maxCarbonCost?: number;
  description?: string;
}

export interface LandPurchase {
  id: string;
  tileId: number;
  teamId: string;
  purchasedArea: number;
  goldCost: number;
  carbonCost: number;
  purchaseDate: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  goldPriceAtPurchase?: number;
  carbonPriceAtPurchase?: number;
  description?: string;
  purchasedBy?: string;
}

export interface LandPurchaseHistoryQuery {
  page?: number;
  pageSize?: number;
  tileId?: number;
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate?: string;
  endDate?: string;
}

export interface PurchaseValidation {
  canPurchase: boolean;
  goldCost: number;
  carbonCost: number;
  totalCost: number;
  availableArea: number;
  teamGoldBalance: number;
  teamCarbonBalance: number;
  errors?: string[]; // Optional in case API doesn't always return errors array
}

export interface PurchaseCostCalculation {
  goldCost: number;
  carbonCost: number;
  totalCost: number;
  goldPrice: number;
  carbonPrice: number;
}

// Team Land Ownership Types
export interface TeamLandSummary {
  teamId: string;
  teamName: string;
  totalOwnedArea: number;
  totalSpent: number;
  totalGoldSpent: number;
  totalCarbonSpent: number;
  tilesOwnedCount: number;
  totalPurchases: number;
  firstPurchaseDate?: string;
  lastPurchaseDate?: string;
}

// Manager Analytics Types
export interface ActivityLandOverview {
  activityId: string;
  activityName: string;
  totalLandPurchases: number;
  totalAreaPurchased: number;
  totalGoldSpent: number;
  totalCarbonSpent: number;
  totalRevenue: number;
  teamsWithLand: number;
  tilesWithOwnership: number;
  averageAreaPerTeam: number;
  mostActiveTile: {
    tileId: number;
    purchaseCount: number;
    totalArea: number;
  };
  topTeamByArea: {
    teamId: string;
    teamName: string;
    totalArea: number;
  };
  recentPurchases: RecentPurchase[];
}

export interface RecentPurchase {
  id: string;
  teamName: string;
  tileId: number;
  tileCoordinates: string;
  landType: 'PLAIN' | 'COASTAL' | 'MARINE';
  area: number;
  goldCost: number;
  carbonCost: number;
  totalCost: number;
  purchaseDate: string;
  purchaserName: string;
}

export interface ManagerTileOwnership {
  tileId: number;
  axialQ: number;
  axialR: number;
  landType: 'PLAIN' | 'COASTAL' | 'MARINE';
  currentGoldPrice: number;
  currentCarbonPrice: number;
  currentPopulation: number;
  totalOwnedArea: number;
  availableArea: number;
  totalRevenue: number;
  ownershipBreakdown: TileOwnershipDetail[];
}

export interface ManagerTileOwnershipQuery {
  page?: number;
  pageSize?: number;
  tileId?: number;
  landType?: 'PLAIN' | 'COASTAL' | 'MARINE';
}

export interface LandPurchaseAnalytics {
  activityId: string;
  totalPurchases: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  totalRevenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  purchasesByLandType: {
    landType: 'PLAIN' | 'COASTAL' | 'MARINE';
    purchases: number;
    area: number;
    revenue: number;
  }[];
  topPerformingTiles: {
    tileId: number;
    axialQ: number;
    axialR: number;
    landType: 'PLAIN' | 'COASTAL' | 'MARINE';
    totalRevenue: number;
    totalArea: number;
    purchases: number;
  }[];
  teamRankings: {
    byArea: {
      teamId: string;
      teamName: string;
      totalArea: number;
      rank: number;
    }[];
    bySpending: {
      teamId: string;
      teamName: string;
      totalSpent: number;
      rank: number;
    }[];
  };
  purchaseTrends: {
    date: string;
    purchases: number;
    area: number;
    revenue: number;
  }[];
}

export interface LandStatusSummary {
  totalTiles: number;
  tilesWithOwnership: number;
  totalAreaOwned: number;
  averageAreaPerTile: number;
  utilizationRate: number;
  totalRevenue: number;
  averageRevenuePerTile: number;
  mostPopularLandType: 'PLAIN' | 'COASTAL' | 'MARINE';
  leastPopularLandType: 'PLAIN' | 'COASTAL' | 'MARINE';
}

// UI Component Types
export interface LandMapProps {
  userType: 'manager' | 'student';
  tiles: AvailableTile[] | ManagerTileOwnership[];
  onTileClick?: (tileId: number) => void;
  selectedTileId?: number;
  showOwnership?: boolean;
  showPurchaseInterface?: boolean;
}

export interface LandPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  tile: AvailableTile | null;
  onPurchaseComplete: (purchase: LandPurchase) => void;
}

export interface LandOwnershipCardProps {
  ownership: TileOwnershipDetail;
  showActions?: boolean;
  compact?: boolean;
}

export interface LandAnalyticsChartProps {
  data: LandPurchaseAnalytics;
  chartType: 'purchases' | 'revenue' | 'trends' | 'landTypes';
  height?: number;
}

// Error Types
export interface LandError {
  code: string;
  message: string;
  details?: any;
}

export enum LandErrorCodes {
  TEAM_NOT_MEMBER = 'TEAM_NOT_MEMBER',
  TEAM_NOT_ACTIVE_MEMBER = 'TEAM_NOT_ACTIVE_MEMBER',
  USER_NO_ACTIVITY = 'USER_NO_ACTIVITY',
  TILE_NO_PRICING = 'TILE_NO_PRICING',
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  PRICE_PROTECTION_EXCEEDED = 'PRICE_PROTECTION_EXCEEDED',
  INVALID_AREA_AMOUNT = 'INVALID_AREA_AMOUNT',
  TILE_NOT_FOUND = 'TILE_NOT_FOUND'
}

// Map Integration Types
export interface LandTileState extends AvailableTile {
  // Additional properties for map visualization
  ownershipPercentage: number;
  dominantTeam?: string;
  isHotspot: boolean;
  priceChange: number;
}

export interface LandMapFilters {
  landType?: 'PLAIN' | 'COASTAL' | 'MARINE';
  minPrice?: number;
  maxPrice?: number;
  minAvailableArea?: number;
  showOnlyAvailable?: boolean;
  showOnlyOwned?: boolean;
}

// Export all types as a namespace for easier imports
export * from './land';