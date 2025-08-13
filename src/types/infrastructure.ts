export interface InfrastructureConfig {
  id: string;
  templateId: number;
  waterResourceBasePrice: string;
  electricityResourceBasePrice: string;
  waterPlantIndex: string;
  powerPlantIndex: string;
  waterPlantBaseOperationPoints: number;
  powerPlantBaseOperationPoints: number;
  waterPlantUpgradeOperationPoints: number;
  powerPlantUpgradeOperationPoints: number;
  baseStationBaseCost: string;
  fireStationBaseCost: string;
  configData?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  template?: {
    id: number;
    name: string;
    description?: string;
    version: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  };
}

export interface CreateInfrastructureConfigDto {
  waterResourceBasePrice: number;
  electricityResourceBasePrice: number;
  waterPlantIndex: number;
  powerPlantIndex: number;
  waterPlantBaseOperationPoints: number;
  powerPlantBaseOperationPoints: number;
  waterPlantUpgradeOperationPoints: number;
  powerPlantUpgradeOperationPoints: number;
  baseStationBaseCost: number;
  fireStationBaseCost: number;
  configData?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateInfrastructureConfigDto {
  waterResourceBasePrice?: number;
  electricityResourceBasePrice?: number;
  waterPlantIndex?: number;
  powerPlantIndex?: number;
  waterPlantBaseOperationPoints?: number;
  powerPlantBaseOperationPoints?: number;
  waterPlantUpgradeOperationPoints?: number;
  powerPlantUpgradeOperationPoints?: number;
  baseStationBaseCost?: number;
  fireStationBaseCost?: number;
  configData?: Record<string, any>;
  isActive?: boolean;
}

export interface InfrastructureConfigStatistics {
  totalConfigured: number;
  avgWaterPrice: number;
  avgElectricityPrice: number;
  avgWaterPlantIndex: number;
  avgPowerPlantIndex: number;
  unconfiguredTemplates: number;
}

export interface InfrastructureConfigResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: InfrastructureConfig | InfrastructureConfig[] | InfrastructureConfigStatistics;
  total?: number;
}

export interface BulkUpdateResult {
  updated: number;
  failed: number;
  details: Array<{
    templateId: number;
    success: boolean;
    error?: string;
  }>;
}

export const DEFAULT_INFRASTRUCTURE_CONFIG: CreateInfrastructureConfigDto = {
  waterResourceBasePrice: 10.0,
  electricityResourceBasePrice: 15.0,
  waterPlantIndex: 1.5,
  powerPlantIndex: 1.8,
  waterPlantBaseOperationPoints: 100,
  powerPlantBaseOperationPoints: 120,
  waterPlantUpgradeOperationPoints: 20,
  powerPlantUpgradeOperationPoints: 25,
  baseStationBaseCost: 50000,
  fireStationBaseCost: 60000,
  isActive: true
};

export const INFRASTRUCTURE_CONFIG_CONSTRAINTS = {
  waterResourceBasePrice: { min: 0, max: undefined },
  electricityResourceBasePrice: { min: 0, max: undefined },
  waterPlantIndex: { min: 0.1, max: 10 },
  powerPlantIndex: { min: 0.1, max: 10 },
  waterPlantBaseOperationPoints: { min: 1, max: undefined },
  powerPlantBaseOperationPoints: { min: 1, max: undefined },
  waterPlantUpgradeOperationPoints: { min: 0, max: undefined },
  powerPlantUpgradeOperationPoints: { min: 0, max: undefined },
  baseStationBaseCost: { min: 0, max: undefined },
  fireStationBaseCost: { min: 0, max: undefined }
};