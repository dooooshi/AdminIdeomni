export interface PopulationHistoryEntry {
  id: string;
  tileId: number;
  tileCoordinates: {
    x: number;
    y: number;
  };
  teamId: string;
  teamName: string;
  timestamp: string;
  previousPopulation: number;
  newPopulation: number;
  changeAmount: number;
  changeType: PopulationChangeType;
  changeReason: string;
  facilityType?: string;
  calculationStep: number;
  triggeredBy?: {
    userId: string;
    username: string;
    action: string;
  };
}

export enum PopulationChangeType {
  SIPHON_EFFECT = 'SIPHON_EFFECT',
  SPILLOVER_EFFECT = 'SPILLOVER_EFFECT',
  PRODUCTION_FACILITY = 'PRODUCTION_FACILITY',
  GROWTH_FACILITY = 'GROWTH_FACILITY',
  INFRASTRUCTURE_CHANGE = 'INFRASTRUCTURE_CHANGE',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT'
}

export interface PopulationSummary {
  totalChanges: number;
  totalPopulationGain: number;
  totalPopulationLoss: number;
  netChange: number;
  mostActiveTeam: string;
  mostActiveTile: number;
}

export interface PopulationHistoryQuery {
  tileId?: number;
  changeType?: PopulationChangeType;
  teamId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'timestamp' | 'changeAmount' | 'tileId';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PopulationHistoryResponse {
  activityId: string;
  summary: PopulationSummary;
  history: PopulationHistoryEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface TilePopulation {
  tileId: number;
  activityId: string;
  currentPopulation: number;
  initialPopulation: number;
  breakdown: {
    step1: {
      result: number;
      siphonLoss: number;
      spilloverGain: number;
    };
    step2: {
      result: number;
      hasInfrastructure: boolean;
      rawMaterialBonus: number;
      functionalBonus: number;
    };
    step3: {
      result: number;
      multiplier: number;
    };
  };
  lastUpdated: string;
}

export interface FacilityInfluence {
  facilityId: string;
  facilityType: string;
  level: number;
  influenceType: string;
  affectedTiles: Array<{
    tileId: number;
    distance: number;
    influencePercentage: number;
    populationImpact: number;
  }>;
  totalPopulationImpact: number;
  tilesAffected: number;
}

export interface TileInfluenceMap {
  tileId: number;
  productionInfluences: Array<{
    facilityId: string;
    facilityType: string;
    level: number;
    populationBonus: number;
  }>;
  growthInfluences: Array<{
    facilityId: string;
    facilityType: string;
    level: number;
    distance: number;
    multiplierBonus: number;
  }>;
  infrastructureStatus: {
    hasWater: boolean;
    hasPower: boolean;
    hasBaseStation: boolean;
    hasFireStation: boolean;
    allRequirementsMet: boolean;
  };
}