import apiClient from '@/lib/http/api-client';
import {
  TileFacilityBuildConfig,
  CreateTileFacilityBuildConfigDto,
  UpdateTileFacilityBuildConfigDto,
  BulkUpdateByLandTypeDto,
  BulkUpdateResult,
  GetTileFacilityConfigsQueryParams,
  UpgradeCostCalculation,
  TileFacilityConfigStatistics,
  LandType,
  FacilityType,
  ApiResponse,
  PaginatedResponse
} from '@/components/map/types';

/**
 * Tile Facility Build Configuration Service
 * Handles all API operations for managing facility build configurations within map templates
 */
export class TileFacilityBuildConfigService {
  private static readonly BASE_PATH = '/admin/map-templates';

  /**
   * Helper method to extract data from nested API response structure
   */
  private static extractResponseData<T>(response: any): T {
    return response.data?.data?.data || response.data?.data || response.data;
  }

  // ==================== FACILITY BUILD CONFIGURATION MANAGEMENT ====================

  /**
   * Create a new facility build configuration for a template
   */
  static async createTileFacilityConfig(
    templateId: number,
    configData: CreateTileFacilityBuildConfigDto
  ): Promise<TileFacilityBuildConfig> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs`,
      configData
    );
    return this.extractResponseData<TileFacilityBuildConfig>(response);
  }

  /**
   * Get all facility build configurations for a template with optional filtering
   */
  static async getTileFacilityConfigs(
    templateId: number,
    params?: GetTileFacilityConfigsQueryParams
  ): Promise<PaginatedResponse<TileFacilityBuildConfig>> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs`,
      { params }
    );
    
    // Handle nested response structure
    if (response.data?.data?.data) {
      return {
        data: response.data.data.data,
        meta: {
          total: response.data.data.total || 0,
          page: response.data.data.page || 1,
          pageSize: response.data.data.pageSize || 20,
          totalPages: response.data.data.totalPages || 1,
          hasNext: response.data.data.hasNext || false,
          hasPrev: response.data.data.hasPrevious || false,
        }
      };
    }
    
    return response.data?.data || { 
      data: [], 
      meta: { total: 0, page: 1, pageSize: 20, totalPages: 1, hasNext: false, hasPrev: false } 
    };
  }

  /**
   * Get configurations by land type
   */
  static async getConfigsByLandType(
    templateId: number,
    landType: LandType
  ): Promise<TileFacilityBuildConfig[]> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/by-land-type/${landType}`
    );
    return this.extractResponseData<TileFacilityBuildConfig[]>(response);
  }

  /**
   * Get configurations by facility type
   */
  static async getConfigsByFacilityType(
    templateId: number,
    facilityType: FacilityType
  ): Promise<TileFacilityBuildConfig[]> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/by-facility-type/${facilityType}`
    );
    return this.extractResponseData<TileFacilityBuildConfig[]>(response);
  }

  /**
   * Get a specific configuration by ID
   */
  static async getTileFacilityConfig(
    templateId: number,
    configId: string
  ): Promise<TileFacilityBuildConfig> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/${configId}`
    );
    return this.extractResponseData<TileFacilityBuildConfig>(response);
  }

  /**
   * Update an existing facility build configuration
   */
  static async updateTileFacilityConfig(
    templateId: number,
    configId: string,
    updateData: UpdateTileFacilityBuildConfigDto
  ): Promise<TileFacilityBuildConfig> {
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/${configId}`,
      updateData
    );
    return this.extractResponseData<TileFacilityBuildConfig>(response);
  }

  /**
   * Delete a facility build configuration (soft delete)
   */
  static async deleteTileFacilityConfig(
    templateId: number,
    configId: string
  ): Promise<void> {
    await apiClient.delete(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/${configId}`
    );
  }

  /**
   * Restore a previously deleted configuration
   */
  static async restoreTileFacilityConfig(
    templateId: number,
    configId: string
  ): Promise<TileFacilityBuildConfig> {
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/${configId}/restore`
    );
    return this.extractResponseData<TileFacilityBuildConfig>(response);
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Initialize default configurations for all facility+land combinations
   */
  static async initializeDefaultConfigs(templateId: number): Promise<{ count: number }> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/initialize-defaults`
    );
    return this.extractResponseData<{ count: number }>(response);
  }

  /**
   * Bulk update configurations by land type
   */
  static async bulkUpdateByLandType(
    templateId: number,
    landType: LandType,
    updateData: BulkUpdateByLandTypeDto
  ): Promise<BulkUpdateResult> {
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/land-type/${landType}/bulk-update`,
      updateData
    );
    return this.extractResponseData<BulkUpdateResult>(response);
  }

  // ==================== ANALYTICS AND CALCULATIONS ====================

  /**
   * Calculate upgrade costs for a facility from level 1 to target level
   */
  static async calculateUpgradeCosts(
    templateId: number,
    landType: LandType,
    facilityType: FacilityType,
    targetLevel: number
  ): Promise<UpgradeCostCalculation> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/upgrade-calculator/${landType}/${facilityType}`,
      { params: { targetLevel } }
    );
    return this.extractResponseData<UpgradeCostCalculation>(response);
  }

  /**
   * Get comprehensive statistics for template facility configurations
   */
  static async getConfigStatistics(templateId: number): Promise<TileFacilityConfigStatistics> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${templateId}/tile-facility-configs/statistics`
    );
    return this.extractResponseData<TileFacilityConfigStatistics>(response);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get default configuration values based on facility and land type
   */
  static getDefaultConfigurationValues(
    facilityType: FacilityType,
    landType: LandType
  ): Partial<CreateTileFacilityBuildConfigDto> {
    // Base configurations by facility type
    const facilityDefaults: Record<FacilityType, {
      requiredGold: number;
      requiredCarbon: number;
      requiredAreas: number;
      maxLevel: number;
      upgradeGoldCost: number;
      upgradeCarbonCost: number;
      upgradeMultiplier: number;
      maxInstances: number;
    }> = {
      // Resource Extraction
      [FacilityType.MINE]: {
        requiredGold: 120000,
        requiredCarbon: 1600,
        requiredAreas: 1,
        maxLevel: 4,
        upgradeGoldCost: 48000,
        upgradeCarbonCost: 640,
        upgradeMultiplier: 1.4,
        maxInstances: 100
      },
      [FacilityType.QUARRY]: {
        requiredGold: 80000,
        requiredCarbon: 1200,
        requiredAreas: 1,
        maxLevel: 4,
        upgradeGoldCost: 32000,
        upgradeCarbonCost: 480,
        upgradeMultiplier: 1.3,
        maxInstances: 100
      },
      [FacilityType.FOREST]: {
        requiredGold: 60000,
        requiredCarbon: 800,
        requiredAreas: 2,
        maxLevel: 4,
        upgradeGoldCost: 24000,
        upgradeCarbonCost: 320,
        upgradeMultiplier: 1.3,
        maxInstances: 100
      },
      [FacilityType.FARM]: {
        requiredGold: 50000,
        requiredCarbon: 600,
        requiredAreas: 2,
        maxLevel: 4,
        upgradeGoldCost: 20000,
        upgradeCarbonCost: 240,
        upgradeMultiplier: 1.3,
        maxInstances: 100
      },
      [FacilityType.RANCH]: {
        requiredGold: 70000,
        requiredCarbon: 900,
        requiredAreas: 3,
        maxLevel: 4,
        upgradeGoldCost: 28000,
        upgradeCarbonCost: 360,
        upgradeMultiplier: 1.4,
        maxInstances: 100
      },
      [FacilityType.FISHERY]: {
        requiredGold: 56000,
        requiredCarbon: 1800,
        requiredAreas: 2,
        maxLevel: 4,
        upgradeGoldCost: 22400,
        upgradeCarbonCost: 720,
        upgradeMultiplier: 1.4,
        maxInstances: 100
      },

      // Manufacturing
      [FacilityType.FACTORY]: {
        requiredGold: 150000,
        requiredCarbon: 3000,
        requiredAreas: 1,
        maxLevel: 4,
        upgradeGoldCost: 60000,
        upgradeCarbonCost: 1200,
        upgradeMultiplier: 1.5,
        maxInstances: 100
      },
      [FacilityType.WAREHOUSE]: {
        requiredGold: 100000,
        requiredCarbon: 1500,
        requiredAreas: 1,
        maxLevel: 4,
        upgradeGoldCost: 40000,
        upgradeCarbonCost: 600,
        upgradeMultiplier: 1.3,
        maxInstances: 100
      },

      // Commercial
      [FacilityType.MALL]: {
        requiredGold: 200000,
        requiredCarbon: 4000,
        requiredAreas: 2,
        maxLevel: 4,
        upgradeGoldCost: 80000,
        upgradeCarbonCost: 1600,
        upgradeMultiplier: 1.4,
        maxInstances: 100
      },
      [FacilityType.CINEMA]: {
        requiredGold: 120000,
        requiredCarbon: 2500,
        requiredAreas: 1,
        maxLevel: 4,
        upgradeGoldCost: 48000,
        upgradeCarbonCost: 1000,
        upgradeMultiplier: 1.3,
        maxInstances: 100
      },

      // Infrastructure
      [FacilityType.WATER_PLANT]: {
        requiredGold: 250000,
        requiredCarbon: 5000,
        requiredAreas: 2,
        maxLevel: 4,
        upgradeGoldCost: 100000,
        upgradeCarbonCost: 2000,
        upgradeMultiplier: 1.5,
        maxInstances: 100
      },
      [FacilityType.POWER_PLANT]: {
        requiredGold: 300000,
        requiredCarbon: 6000,
        requiredAreas: 3,
        maxLevel: 4,
        upgradeGoldCost: 120000,
        upgradeCarbonCost: 2400,
        upgradeMultiplier: 1.6,
        maxInstances: 100
      },
      [FacilityType.BASE_STATION]: {
        requiredGold: 150000,
        requiredCarbon: 2000,
        requiredAreas: 1,
        maxLevel: 4,
        upgradeGoldCost: 60000,
        upgradeCarbonCost: 800,
        upgradeMultiplier: 1.4,
        maxInstances: 100
      },

      // Services
      [FacilityType.FIRE_STATION]: {
        requiredGold: 180000,
        requiredCarbon: 3000,
        requiredAreas: 1,
        maxLevel: 4,
        upgradeGoldCost: 72000,
        upgradeCarbonCost: 1200,
        upgradeMultiplier: 1.3,
        maxInstances: 100
      },
      [FacilityType.SCHOOL]: {
        requiredGold: 200000,
        requiredCarbon: 3500,
        requiredAreas: 2,
        maxLevel: 4,
        upgradeGoldCost: 80000,
        upgradeCarbonCost: 1400,
        upgradeMultiplier: 1.4,
        maxInstances: 100
      },
      [FacilityType.HOSPITAL]: {
        requiredGold: 350000,
        requiredCarbon: 7000,
        requiredAreas: 3,
        maxLevel: 4,
        upgradeGoldCost: 140000,
        upgradeCarbonCost: 2800,
        upgradeMultiplier: 1.5,
        maxInstances: 100
      },
      [FacilityType.PARK]: {
        requiredGold: 80000,
        requiredCarbon: 1000,
        requiredAreas: 2,
        maxLevel: 4,
        upgradeGoldCost: 32000,
        upgradeCarbonCost: 400,
        upgradeMultiplier: 1.2,
        maxInstances: 100
      }
    };

    // Land type multipliers
    const landTypeMultipliers: Record<LandType, {
      goldMultiplier: number;
      carbonMultiplier: number;
      isAllowed: boolean;
    }> = {
      [LandType.MARINE]: {
        goldMultiplier: 0.8, // Cheaper due to lower accessibility
        carbonMultiplier: 1.8, // Higher carbon cost due to transport
        isAllowed: facilityType === FacilityType.FISHERY // Only fisheries allowed
      },
      [LandType.COASTAL]: {
        goldMultiplier: 1.0, // Balanced costs
        carbonMultiplier: 1.0,
        isAllowed: facilityType !== FacilityType.MINE // All except mines
      },
      [LandType.PLAIN]: {
        goldMultiplier: 1.2, // Higher gold cost due to land value
        carbonMultiplier: 0.8, // Lower carbon cost due to better access
        isAllowed: true // All facilities allowed
      }
    };

    const baseConfig = facilityDefaults[facilityType];
    const landMultiplier = landTypeMultipliers[landType];

    return {
      landType,
      facilityType,
      requiredGold: Math.round(baseConfig.requiredGold * landMultiplier.goldMultiplier),
      requiredCarbon: Math.round(baseConfig.requiredCarbon * landMultiplier.carbonMultiplier),
      requiredAreas: baseConfig.requiredAreas,
      maxLevel: baseConfig.maxLevel,
      upgradeGoldCost: Math.round(baseConfig.upgradeGoldCost * landMultiplier.goldMultiplier),
      upgradeCarbonCost: Math.round(baseConfig.upgradeCarbonCost * landMultiplier.carbonMultiplier),
      upgradeMultiplier: baseConfig.upgradeMultiplier,
      isAllowed: landMultiplier.isAllowed,
      maxInstances: baseConfig.maxInstances
    };
  }

  /**
   * Validate facility build configuration data
   */
  static validateConfigurationData(
    config: CreateTileFacilityBuildConfigDto | UpdateTileFacilityBuildConfigDto
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if ('requiredGold' in config && config.requiredGold !== undefined) {
      if (config.requiredGold < 0) {
        errors.requiredGold = 'Required gold must be non-negative';
      } else if (config.requiredGold > 1000000) {
        errors.requiredGold = 'Required gold cannot exceed 1,000,000';
      }
    }

    if ('requiredCarbon' in config && config.requiredCarbon !== undefined) {
      if (config.requiredCarbon < 0) {
        errors.requiredCarbon = 'Required carbon must be non-negative';
      } else if (config.requiredCarbon > 20000) {
        errors.requiredCarbon = 'Required carbon cannot exceed 20,000';
      }
    }

    if ('maxLevel' in config && config.maxLevel !== undefined) {
      if (config.maxLevel < 1 || config.maxLevel > 10) {
        errors.maxLevel = 'Max level must be between 1 and 10';
      }
    }

    if ('upgradeMultiplier' in config && config.upgradeMultiplier !== undefined) {
      if (config.upgradeMultiplier < 1.0 || config.upgradeMultiplier > 3.0) {
        errors.upgradeMultiplier = 'Upgrade multiplier must be between 1.0 and 3.0';
      }
    }

    if ('maxInstances' in config && config.maxInstances !== undefined) {
      if (config.maxInstances < 1 || config.maxInstances > 100) {
        errors.maxInstances = 'Max instances must be between 1 and 100';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Calculate total upgrade cost from current level to target level
   */
  static calculateTotalUpgradeCost(
    config: TileFacilityBuildConfig,
    fromLevel: number,
    toLevel: number
  ): { goldCost: number; carbonCost: number } {
    let totalGold = 0;
    let totalCarbon = 0;

    for (let level = fromLevel + 1; level <= toLevel; level++) {
      const levelMultiplier = Math.pow(config.upgradeMultiplier, level - 2);
      totalGold += Math.round(config.upgradeGoldCost * levelMultiplier);
      totalCarbon += Math.round(config.upgradeCarbonCost * levelMultiplier);
    }

    return { goldCost: totalGold, carbonCost: totalCarbon };
  }

  /**
   * Get land type restrictions for facility types
   */
  static getLandTypeRestrictions(): Record<FacilityType, LandType[]> {
    return {
      // Resource Extraction - Land type specific restrictions
      [FacilityType.MINE]: [LandType.PLAIN], // Only on plain land
      [FacilityType.QUARRY]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.FOREST]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.FARM]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.RANCH]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.FISHERY]: [LandType.MARINE, LandType.COASTAL], // Only water access

      // Manufacturing - Avoid marine
      [FacilityType.FACTORY]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.WAREHOUSE]: [LandType.COASTAL, LandType.PLAIN],

      // Commercial - All land types
      [FacilityType.MALL]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.CINEMA]: [LandType.COASTAL, LandType.PLAIN],

      // Infrastructure - All land types
      [FacilityType.WATER_PLANT]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.POWER_PLANT]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.BASE_STATION]: [LandType.COASTAL, LandType.PLAIN],

      // Services - Avoid marine
      [FacilityType.FIRE_STATION]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.SCHOOL]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.HOSPITAL]: [LandType.COASTAL, LandType.PLAIN],
      [FacilityType.PARK]: [LandType.COASTAL, LandType.PLAIN]
    };
  }

  /**
   * Format currency values for display
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Format large numbers with appropriate suffixes
   */
  static formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }
}

export default TileFacilityBuildConfigService;