import { FacilityType, FacilityInstanceStatus } from './facilities';

// ==================== ENUMS ====================

export enum SpaceAlertType {
  HIGH_UTILIZATION = 'HIGH_UTILIZATION',
  NEAR_CAPACITY = 'NEAR_CAPACITY',
  MAINTENANCE_NEEDED = 'MAINTENANCE_NEEDED',
  SPACE_INEFFICIENT = 'SPACE_INEFFICIENT',
}

export enum SpaceAlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// ==================== FACILITY SPACE METRICS ====================

export interface SpaceMetrics {
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
  utilizationRate: number;
  rawMaterialSpace: number;
  productSpace: number;
}

export interface TileCoordinates {
  q: number;
  r: number;
  s: number;
}

export interface FacilitySpaceInfo {
  facilityInstanceId: string;
  facilityType: FacilityType;
  facilityName: string;
  tileCoordinates: TileCoordinates;
  level: number;
  spaceMetrics: SpaceMetrics;
}

// ==================== INVENTORY SUMMARY ====================

export interface InventoryItem {
  itemType: 'RAW_MATERIAL' | 'PRODUCT';
  name: string;
  quantity: number;
  spaceOccupied: number;
  percentageOfTotal: number;
}

export interface InventorySummary {
  totalItems: number;
  rawMaterialItems: number;
  productItems: number;
  totalValue: number;
  topItemsBySpace: InventoryItem[];
}

// ==================== SPACE CONFIGURATION ====================

export interface SpaceConfiguration {
  initialSpace: number;
  spacePerLevel: number;
  maxSpace: number;
  currentTotalSpace: number;
}

export interface FacilityInfo {
  level: number;
  status: FacilityInstanceStatus;
  category: string;
}

// ==================== UTILIZATION DATA ====================

export interface FacilityTypeUtilization {
  facilityType: FacilityType;
  count: number;
  totalSpace: number;
  usedSpace: number;
  utilizationRate: number;
}

export interface ItemTypeUtilization {
  rawMaterials: {
    totalSpace: number;
    percentage: number;
  };
  products: {
    totalSpace: number;
    percentage: number;
  };
}

export interface SpaceAlert {
  type: SpaceAlertType;
  facilityInstanceId: string;
  facilityName: string;
  message: string;
  severity: SpaceAlertSeverity;
}

export interface TeamSpaceUtilization {
  teamId: string;
  activityId: string;
  timestamp: string;
  utilization: {
    byFacilityType: FacilityTypeUtilization[];
    byItemType: ItemTypeUtilization;
    alerts: SpaceAlert[];
  };
}

// ==================== API RESPONSES ====================

// 1. Team Facility Space Overview Response
export interface TeamFacilitySpaceOverviewResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: {
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
    facilities: FacilitySpaceInfo[];
  };
}

// 2. Facility Space Details Response
export interface FacilitySpaceDetailsResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: {
    facilityInstanceId: string;
    facilityType: FacilityType;
    facilityName: string;
    teamId: string;
    activityId: string;
    tileCoordinates: TileCoordinates;
    facilityInfo: FacilityInfo;
    spaceConfiguration: SpaceConfiguration;
    spaceMetrics: SpaceMetrics;
    inventorySummary: InventorySummary;
    lastUpdated: string;
  };
}

// 3. Team Space Utilization Response
export interface TeamSpaceUtilizationResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: TeamSpaceUtilization;
}

// ==================== ERROR RESPONSE ====================

export interface FacilitySpaceErrorResponse {
  success: false;
  businessCode: number;
  message: string;
  timestamp: string;
}

// ==================== TABLE DATA TYPES ====================

export interface FacilitySpaceTableRow {
  id: string;
  facilityName: string;
  facilityType: FacilityType;
  location: string;
  level: number;
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
  utilizationRate: number;
  rawMaterialSpace: number;
  productSpace: number;
  status?: FacilityInstanceStatus;
}

export interface UtilizationSummaryTableRow {
  id: string;
  category: FacilityType;
  facilityCount: number;
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
  utilizationRate: number;
}

export interface AlertsTableRow {
  id: string;
  facilityName: string;
  alertType: SpaceAlertType;
  message: string;
  severity: SpaceAlertSeverity;
  facilityInstanceId: string;
}

// ==================== UTILITY TYPES ====================

export type SpaceUnit = 'carbon';

export interface SpaceDisplayConfig {
  unit: SpaceUnit;
  decimals: number;
  showPercentage: boolean;
}

export interface FacilitySpaceFilters {
  facilityType?: FacilityType;
  minUtilization?: number;
  maxUtilization?: number;
  hasAlerts?: boolean;
  searchTerm?: string;
}

export interface TableSortConfig {
  field: keyof FacilitySpaceTableRow | keyof UtilizationSummaryTableRow;
  direction: 'asc' | 'desc';
}

// ==================== CONSTANTS ====================

export const UTILIZATION_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
  HIGH: 80,
  CRITICAL: 95,
} as const;

export const SPACE_UNIT_LABELS: Record<SpaceUnit, string> = {
  carbon: 'Carbon Units',
};

export const ALERT_SEVERITY_COLORS: Record<SpaceAlertSeverity, string> = {
  [SpaceAlertSeverity.INFO]: '#0288d1',
  [SpaceAlertSeverity.WARNING]: '#ff9800',
  [SpaceAlertSeverity.ERROR]: '#f44336',
  [SpaceAlertSeverity.CRITICAL]: '#d32f2f',
};

export const UTILIZATION_COLOR_RANGES = {
  LOW: '#4caf50',
  MEDIUM: '#ff9800',
  HIGH: '#ff5722',
  CRITICAL: '#f44336',
} as const;