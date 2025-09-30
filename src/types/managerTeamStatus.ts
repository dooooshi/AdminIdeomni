/**
 * Manager Team Status Types
 * Type definitions for the Manager Team Status Dashboard feature
 * Based on API specification from docs/manager/team-status/
 */

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  extra?: Record<string, any>;
}

// ============================================================================
// Team List Types
// ============================================================================

export interface TeamSummary {
  id: string;
  name: string;
  description: string | null;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  maxMembers: number;
  isOpen: boolean;
  goldBalance: string;
  carbonBalance: string;
  lastActivityAt: string;
  createdAt: string;
}

export interface ListTeamsQuery {
  page?: number;
  limit?: number;
  sort?: 'name' | 'createdAt' | 'goldBalance' | 'carbonBalance';
  order?: 'ASC' | 'DESC';
  search?: string;
  isOpen?: boolean;
}

// ============================================================================
// Team Status Types
// ============================================================================

export interface TeamLeader {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface TeamAccount {
  goldBalance: string;
  carbonBalance: string;
  lastUpdated: string;
}

export interface TeamStatistics {
  totalMembers: number;
  activeMembers: number;
  totalLandOwned: string;
  totalFacilities: number;
  activeFacilities: number;
  totalOperations: number;
  operationsToday: number;
  operationsThisWeek: number;
}

export interface RecentOperation {
  type: string;
  amount: string;
  resourceType: 'GOLD' | 'CARBON';
  timestamp: string;
}

export interface TeamStatus {
  id: string;
  name: string;
  description: string | null;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  leader: TeamLeader;
  account: TeamAccount;
  statistics: TeamStatistics;
  recentOperations: RecentOperation[];
}

// ============================================================================
// Team Operations Types
// ============================================================================

export enum TeamOperationType {
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  FACILITY_BUILD = 'FACILITY_BUILD',
  FACILITY_UPGRADE = 'FACILITY_UPGRADE',
  LAND_PURCHASE = 'LAND_PURCHASE',
  RAW_MATERIAL_PRODUCTION = 'RAW_MATERIAL_PRODUCTION',
  PRODUCT_SALE = 'PRODUCT_SALE',
  UTILITY_CONSUMPTION = 'UTILITY_CONSUMPTION',
  TRADE_PURCHASE = 'TRADE_PURCHASE',
}

export interface TeamOperationUser {
  id: string;
  username: string;
}

export interface TeamOperationTeam {
  id: string;
  name: string;
}

export interface TeamOperation {
  id: string;
  operationType: TeamOperationType;
  amount: string;
  resourceType: 'GOLD' | 'CARBON';
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  user: TeamOperationUser | null;
  targetTeam: TeamOperationTeam | null;
  sourceTeam: TeamOperationTeam | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface OperationsQuery {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'amount';
  order?: 'ASC' | 'DESC';
  operationType?: TeamOperationType;
  resourceType?: 'GOLD' | 'CARBON';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================================================
// Team Facilities Types
// ============================================================================

export enum FacilityType {
  MINE = 'MINE',
  QUARRY = 'QUARRY',
  FOREST = 'FOREST',
  FARM = 'FARM',
  RANCH = 'RANCH',
  FISHERY = 'FISHERY',
  FACTORY = 'FACTORY',
  MALL = 'MALL',
  WAREHOUSE = 'WAREHOUSE',
  WATER_PLANT = 'WATER_PLANT',
  POWER_PLANT = 'POWER_PLANT',
  BASE_STATION = 'BASE_STATION',
  FIRE_STATION = 'FIRE_STATION',
  SCHOOL = 'SCHOOL',
  HOSPITAL = 'HOSPITAL',
  PARK = 'PARK',
  CINEMA = 'CINEMA',
}

export enum FacilityInstanceStatus {
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DAMAGED = 'DAMAGED',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export interface FacilityTile {
  id: number;
  q: number;
  r: number;
  landType: string;
}

export interface FacilityBuilder {
  id: string;
  username: string;
}

export interface TeamFacility {
  id: string;
  facilityType: string;
  level: number;
  occupiedLandArea: number;
  status: string;
  buildGoldCost: string;
  buildCarbonCost: string;
  totalUpgradeCost: string;
  productionRate: string | null;
  capacity: number | null;
  efficiency: string | null;
  tile: FacilityTile;
  constructionStarted: string;
  constructionCompleted: string | null;
  builtBy: FacilityBuilder;
  hasInfrastructureConnections: boolean;
  infrastructureConnectionCount: number;
}

export interface FacilitiesQuery {
  page?: number;
  limit?: number;
  sort?: 'constructionStarted' | 'facilityType' | 'level';
  order?: 'ASC' | 'DESC';
  facilityType?: FacilityType;
  status?: FacilityInstanceStatus;
  tileId?: number;
  minLevel?: number;
}

// ============================================================================
// Team Land Ownership Types
// ============================================================================

export interface LandTile {
  id: number;
  q: number;
  r: number;
  landType: string;
  totalArea: number;
}

export interface LandPurchaser {
  id: string;
  username: string;
}

export interface RecentPurchase {
  id: string;
  purchasedArea: string;
  goldCost: string;
  carbonCost: string;
  purchaseDate: string;
  purchasedBy: LandPurchaser;
}

export interface TeamLandOwnership {
  id: string;
  ownedArea: string;
  totalGoldSpent: string;
  totalCarbonSpent: string;
  purchaseCount: number;
  tile: LandTile;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  recentPurchases: RecentPurchase[];
}

export interface LandQuery {
  page?: number;
  limit?: number;
  sort?: 'purchaseDate' | 'ownedArea' | 'totalSpent';
  order?: 'ASC' | 'DESC';
  tileId?: number;
  dateFrom?: string;
  dateTo?: string;
  minArea?: number;
}

// ============================================================================
// Team Members Types
// ============================================================================

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export enum UserType {
  MANAGER = 1,
  WORKER = 2,
  STUDENT = 3,
}

export interface TeamMemberUser {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: number;
  userTypeLabel: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface MembershipInfo {
  status: MemberStatus;
  joinedAt: string;
  leftAt: string | null;
  isLeader: boolean;
}

export interface MemberStatistics {
  operationsCount: number;
  landPurchasesCount: number;
  facilitiesBuiltCount: number;
}

export interface TeamMemberDetail {
  id: string;
  user: TeamMemberUser;
  membership: MembershipInfo;
  statistics: MemberStatistics;
}

export interface MembersQuery {
  page?: number;
  limit?: number;
  sort?: 'joinedAt' | 'username' | 'userType';
  order?: 'ASC' | 'DESC';
  status?: MemberStatus;
  userType?: UserType;
}

// ============================================================================
// Team Balance History Types
// ============================================================================

export interface BalanceOperation {
  type: string;
  description: string | null;
}

export interface TeamBalanceHistory {
  id: string;
  goldBalance: string;
  carbonBalance: string;
  goldChange: string;
  carbonChange: string;
  operationId: string | null;
  operation: BalanceOperation | null;
  createdAt: string;
}

export interface BalanceHistoryQuery {
  page?: number;
  limit?: number;
  sort?: 'createdAt';
  order?: 'ASC' | 'DESC';
  dateFrom?: string;
  dateTo?: string;
  minChange?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  success: false;
  businessCode: number;
  message: string;
  error: {
    code: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  path: string;
}

// ============================================================================
// Filter State Types (for Redux/Component State)
// ============================================================================

export interface TeamListFilters {
  search: string;
  isOpen?: boolean;
  sort: 'name' | 'createdAt' | 'goldBalance' | 'carbonBalance';
  order: 'ASC' | 'DESC';
}

export interface OperationFilters {
  operationType?: TeamOperationType;
  resourceType?: 'GOLD' | 'CARBON';
  dateFrom?: string;
  dateTo?: string;
}

export interface FacilityFilters {
  facilityType?: FacilityType;
  status?: FacilityInstanceStatus;
  tileId?: number;
}

export interface LandFilters {
  tileId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface MemberFilters {
  status?: MemberStatus;
  userType?: UserType;
}