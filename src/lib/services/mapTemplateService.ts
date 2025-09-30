import apiClient from '@/lib/http/api-client';
import { 
  MapTemplate, 
  CreateMapTemplateDto, 
  UpdateMapTemplateDto, 
  GenerateMapTemplateDto,
  MapTile,
  CreateTileDto,
  UpdateTileDto,
  ActivityTileState,
  CreateActivityTileStateDto,
  UpdateActivityTileStateDto,
  BulkUpdateActivityTileStatesDto,
  ActivityTileStatistics,
  GetMapTemplatesQueryParams,
  GetTilesQueryParams,
  GetActivityTileStatesQueryParams,
  ApiResponse,
  PaginatedResponse,
  EnhancedMapTemplate,
  TileFacilityConfigStatistics,
  BulkUpdateTilesByLandTypeDto,
  MapTileBulkUpdateResponseDto
} from '@/components/map/types';
import TileFacilityBuildConfigService from './tileFacilityBuildConfigService';

/**
 * Map Template Service
 * Handles all API operations for map template management and tile configuration
 */
export class MapTemplateService {
  private static readonly BASE_PATH = '/admin/map-templates';
  private static readonly TILES_PATH = '/map/tiles';
  private static readonly ACTIVITY_STATES_BASE = '/map/activities';

  /**
   * Helper method to extract data from nested API response structure
   */
  private static extractResponseData<T>(response: { data?: { data?: { data?: T } | T } | T }): T {
    // Handle nested response structure: { data: { data: { data: T } } }
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as { data: unknown }).data;
      if (innerData && typeof innerData === 'object' && 'data' in innerData) {
        return (innerData as { data: T }).data;
      }
      return innerData as T;
    }
    return data as T;
  }

  // ==================== MAP TEMPLATE MANAGEMENT ====================

  /**
   * Get all map templates with optional pagination and filtering
   */
  static async getMapTemplates(params?: GetMapTemplatesQueryParams): Promise<PaginatedResponse<MapTemplate>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<MapTemplate>>>(
      this.BASE_PATH,
      { params }
    );
    
    // Handle nested response structure
    const responseData = response.data?.data;
    if (responseData) {
      // Check if it already has the correct structure
      if ('data' in responseData && 'meta' in responseData) {
        return responseData as PaginatedResponse<MapTemplate>;
      }
      // Handle flat structure with properties at root level
      if ('data' in responseData || Array.isArray(responseData)) {
        const items = Array.isArray(responseData) ? responseData : (responseData as any).data || [];
        return {
          data: items,
          meta: {
            total: (responseData as any).total || items.length,
            page: (responseData as any).page || 1,
            pageSize: (responseData as any).pageSize || 20,
            totalPages: (responseData as any).totalPages || 1,
            hasNext: (responseData as any).hasNext || false,
            hasPrev: (responseData as any).hasPrevious || (responseData as any).hasPrev || false,
          }
        };
      }
    }
    
    // Fallback for empty response
    return { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 1, hasNext: false, hasPrev: false } };
  }

  /**
   * Get a specific map template by ID with optional tile and statistics data
   */
  static async getMapTemplate(
    id: number, 
    options?: {
      includeTiles?: boolean;
      includeStatistics?: boolean;
      includeFacilityConfigs?: boolean;
    }
  ): Promise<EnhancedMapTemplate> {
    const response = await apiClient.get<ApiResponse<MapTemplate>>(
      `${this.BASE_PATH}/${id}`,
      { params: options }
    );
    
    const template = this.extractResponseData<MapTemplate>(response);
    
    // Enhance template with facility configuration statistics if requested
    if (options?.includeFacilityConfigs) {
      try {
        const facilityConfigStats = await TileFacilityBuildConfigService.getConfigStatistics(id);
        return {
          ...template,
          facilityConfigStatistics: facilityConfigStats
        } as EnhancedMapTemplate;
      } catch (error) {
        console.warn('Failed to load facility config statistics:', error);
      }
    }
    
    return template as EnhancedMapTemplate;
  }

  /**
   * Create a new map template (Admin only)
   */
  static async createMapTemplate(templateData: CreateMapTemplateDto): Promise<MapTemplate> {
    const response = await apiClient.post<any>(
      this.BASE_PATH,
      templateData
    );
    return this.extractResponseData<MapTemplate>(response);
  }

  /**
   * Update an existing map template (Admin only)
   */
  static async updateMapTemplate(id: number, templateData: UpdateMapTemplateDto): Promise<MapTemplate> {
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/${id}`,
      templateData
    );
    return this.extractResponseData<MapTemplate>(response);
  }

  /**
   * Delete a map template (Admin only)
   */
  static async deleteMapTemplate(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Generate a map template with procedural tile generation (Admin only)
   */
  static async generateMapTemplate(params: GenerateMapTemplateDto): Promise<MapTemplate> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/generate`,
      params
    );
    return this.extractResponseData<MapTemplate>(response);
  }

  /**
   * Clone an existing map template with facility configurations (Admin only)
   */
  static async cloneMapTemplate(
    id: number, 
    newName: string, 
    options?: {
      description?: string;
      includeFacilityConfigs?: boolean;
      initializeDefaultConfigs?: boolean;
    }
  ): Promise<MapTemplate> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/${id}/clone`,
      { 
        name: newName,
        description: options?.description,
        includeFacilityConfigs: options?.includeFacilityConfigs ?? true
      }
    );
    
    const clonedTemplate = this.extractResponseData<MapTemplate>(response);
    
    // Initialize default facility configurations if requested and not included in clone
    if (options?.initializeDefaultConfigs && !options?.includeFacilityConfigs) {
      try {
        await TileFacilityBuildConfigService.initializeDefaultConfigs(clonedTemplate.id);
      } catch (error) {
        console.warn('Failed to initialize default configurations for cloned template:', error);
      }
    }
    
    return clonedTemplate;
  }

  /**
   * Set a template as default (Admin only)
   */
  static async setDefaultTemplate(id: number): Promise<MapTemplate> {
    const response = await apiClient.patch<any>(
      `${this.BASE_PATH}/${id}/set-default`
    );
    return this.extractResponseData<MapTemplate>(response);
  }

  /**
   * Get comprehensive template statistics including facility configurations (Admin only)
   */
  static async getTemplateStatistics(id: number): Promise<{
    template: MapTemplate;
    tileStatistics?: any;
    facilityStatistics?: TileFacilityConfigStatistics;
  }> {
    try {
      const [templateResponse, facilityStatsResponse] = await Promise.all([
        apiClient.get<ApiResponse<any>>(`${this.BASE_PATH}/${id}/statistics`),
        TileFacilityBuildConfigService.getConfigStatistics(id).catch(() => null)
      ]);
      
      return {
        template: templateResponse.data.data.template,
        tileStatistics: templateResponse.data.data.tileStatistics,
        facilityStatistics: facilityStatsResponse || undefined
      };
    } catch (error) {
      console.error('Failed to get template statistics:', error);
      throw error;
    }
  }

  // ==================== TILE CONFIGURATION MANAGEMENT ====================

  /**
   * Get tiles for a specific template with optional filtering
   */
  static async getTiles(params?: GetTilesQueryParams): Promise<PaginatedResponse<MapTile>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<MapTile>>>(
      this.TILES_PATH,
      { params }
    );
    return response.data.data;
  }

  /**
   * Get a specific tile by ID
   */
  static async getTile(id: number): Promise<MapTile> {
    const response = await apiClient.get<ApiResponse<MapTile>>(
      `${this.TILES_PATH}/${id}`
    );
    return response.data.data;
  }

  /**
   * Create a new tile with custom configuration (Admin only)
   */
  static async createTile(tileData: CreateTileDto): Promise<MapTile> {
    const response = await apiClient.post<ApiResponse<MapTile>>(
      this.TILES_PATH,
      tileData
    );
    return response.data.data;
  }

  /**
   * Update an existing tile configuration (Admin only)
   */
  static async updateTile(id: number, tileData: UpdateTileDto): Promise<MapTile> {
    const response = await apiClient.put<ApiResponse<MapTile>>(
      `${this.TILES_PATH}/${id}`,
      tileData
    );
    return response.data.data;
  }

  /**
   * Update individual tile configuration within a template (Admin only)
   */
  static async updateTileConfig(templateId: number, tileId: number, configData: UpdateTileDto): Promise<MapTile> {
    const response = await apiClient.put<ApiResponse<MapTile>>(
      `${this.BASE_PATH}/${templateId}/tiles/${tileId}/config`,
      configData
    );
    return this.extractResponseData<MapTile>(response);
  }

  /**
   * Delete a tile (Admin only)
   */
  static async deleteTile(id: number): Promise<void> {
    await apiClient.delete(`${this.TILES_PATH}/${id}`);
  }

  /**
   * Bulk update multiple tiles (Admin only)
   */
  static async bulkUpdateTiles(updates: Array<{ tileId: number; updates: UpdateTileDto }>): Promise<{
    updated: number;
    failed: number;
    details: Array<{ tileId: number; success: boolean; error?: string }>;
  }> {
    const response = await apiClient.put<ApiResponse<any>>(
      `${this.TILES_PATH}/bulk-update`,
      { updates }
    );
    return response.data.data;
  }

  /**
   * Bulk update tile configurations within a template (Admin only)
   */
  static async bulkUpdateTileConfigs(templateId: number, tiles: Array<{
    tileId: number;
    landType?: 'MARINE' | 'COASTAL' | 'PLAIN';
    initialPrice?: number;
    initialPopulation?: number;
    transportationCostUnit?: number;
  }>): Promise<{
    updated: number;
    failed: number;
    details: Array<{ tileId: number; success: boolean; error?: string }>;
  }> {
    const response = await apiClient.put<ApiResponse<any>>(
      `${this.BASE_PATH}/${templateId}/tiles/bulk-update`,
      { tiles }
    );
    return this.extractResponseData<any>(response);
  }

  /**
   * Update all tiles of a specific land type using multipliers or fixed values (Admin only)
   * NEW: Support for dual pricing system (gold + carbon)
   */
  static async updateTilesByLandType(
    templateId: number,
    landType: 'MARINE' | 'COASTAL' | 'PLAIN' | 'GRASSLANDS' | 'FORESTS' | 'HILLS' | 'MOUNTAINS' | 'PLATEAUS' | 'DESERTS' | 'WETLANDS',
    updateData: BulkUpdateTilesByLandTypeDto
  ): Promise<MapTileBulkUpdateResponseDto> {
    const response = await apiClient.put<ApiResponse<MapTileBulkUpdateResponseDto>>(
      `${this.BASE_PATH}/${templateId}/tiles/land-type/${landType}/bulk-update`,
      updateData
    );
    return this.extractResponseData<MapTileBulkUpdateResponseDto>(response);
  }

  /**
   * Reset all tiles in a template to default configuration based on land type (Admin only)
   */
  static async resetTilesToDefaults(templateId: number): Promise<{
    updated: number;
    failed: number;
    details: Array<{ tileId: number; success: boolean; error?: string }>;
  }> {
    const response = await apiClient.put<ApiResponse<any>>(
      `${this.BASE_PATH}/${templateId}/tiles/reset-defaults`
    );
    return this.extractResponseData<any>(response);
  }

  // ==================== ACTIVITY TILE STATE MANAGEMENT ====================

  /**
   * Initialize tile states for an activity based on its map template
   */
  static async initializeActivityTileStates(activityId: string): Promise<ActivityTileState[]> {
    const response = await apiClient.post<ApiResponse<ActivityTileState[]>>(
      `${this.ACTIVITY_STATES_BASE}/${activityId}/tile-states/initialize`
    );
    return response.data.data;
  }

  /**
   * Get tile states for a specific activity with optional filtering
   */
  static async getActivityTileStates(params: GetActivityTileStatesQueryParams): Promise<PaginatedResponse<ActivityTileState>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ActivityTileState>>>(
      '/map/activity-tile-states',
      { params }
    );
    return response.data.data;
  }

  /**
   * Get all tile states for a specific activity (without pagination)
   */
  static async getActivityTileStatesByActivity(activityId: string): Promise<ActivityTileState[]> {
    const response = await apiClient.get<ApiResponse<ActivityTileState[]>>(
      `${this.ACTIVITY_STATES_BASE}/${activityId}/tile-states`
    );
    return response.data.data;
  }

  /**
   * Get a specific tile state for an activity
   */
  static async getActivityTileState(activityId: string, tileId: number): Promise<ActivityTileState> {
    const response = await apiClient.get<ApiResponse<ActivityTileState>>(
      `${this.ACTIVITY_STATES_BASE}/${activityId}/tiles/${tileId}/state`
    );
    return response.data.data;
  }

  /**
   * Update a specific tile state for an activity
   */
  static async updateActivityTileState(
    activityId: string, 
    tileId: number, 
    updates: UpdateActivityTileStateDto
  ): Promise<ActivityTileState> {
    const response = await apiClient.put<ApiResponse<ActivityTileState>>(
      `${this.ACTIVITY_STATES_BASE}/${activityId}/tiles/${tileId}/state`,
      updates
    );
    return response.data.data;
  }

  /**
   * Bulk update multiple tile states for an activity
   */
  static async bulkUpdateActivityTileStates(
    activityId: string, 
    updateData: BulkUpdateActivityTileStatesDto
  ): Promise<{
    updated: number;
    failed: number;
    details: Array<{ tileId: number; success: boolean; error?: string }>;
  }> {
    const response = await apiClient.put<ApiResponse<any>>(
      `${this.ACTIVITY_STATES_BASE}/${activityId}/tile-states/bulk`,
      updateData
    );
    return response.data.data;
  }

  /**
   * Reset all tile states for an activity to initial template values
   */
  static async resetActivityTileStates(activityId: string): Promise<{ updatedCount: number }> {
    const response = await apiClient.post<ApiResponse<{ updatedCount: number }>>(
      `${this.ACTIVITY_STATES_BASE}/${activityId}/tile-states/reset`
    );
    return response.data.data;
  }

  /**
   * Get comprehensive statistics for an activity's tile states
   */
  static async getActivityTileStatistics(activityId: string): Promise<ActivityTileStatistics> {
    const response = await apiClient.get<ApiResponse<ActivityTileStatistics>>(
      `${this.ACTIVITY_STATES_BASE}/${activityId}/tile-statistics`
    );
    return response.data.data;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get default land type configuration values
   * NEW: Updated for dual pricing system - all tiles start with zero pricing
   * NEW: Added availableLand defaults based on land type
   */
  static getDefaultConfiguration(landType: 'MARINE' | 'COASTAL' | 'PLAIN' | 'GRASSLANDS' | 'FORESTS' | 'HILLS' | 'MOUNTAINS' | 'PLATEAUS' | 'DESERTS' | 'WETLANDS') {
    const defaults = {
      MARINE: {
        // NEW: Dual pricing system
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 0,
        transportationCostUnit: 8.00,
        // NEW: Available land for student purchases (marine tiles cannot be purchased)
        availableLand: 0,
      },
      COASTAL: {
        // NEW: Dual pricing system
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 500,
        transportationCostUnit: 5.00,
        availableLand: 8,
      },
      PLAIN: {
        // NEW: Dual pricing system
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 1000,
        transportationCostUnit: 3.00,
        availableLand: 10,
      },
      GRASSLANDS: {
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 800,
        transportationCostUnit: 3.50,
        availableLand: 10,
      },
      FORESTS: {
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 300,
        transportationCostUnit: 4.50,
        availableLand: 5,
      },
      HILLS: {
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 400,
        transportationCostUnit: 5.50,
        availableLand: 3,
      },
      MOUNTAINS: {
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 100,
        transportationCostUnit: 7.00,
        availableLand: 2,
      },
      PLATEAUS: {
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 600,
        transportationCostUnit: 4.00,
        availableLand: 8,
      },
      DESERTS: {
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 50,
        transportationCostUnit: 6.00,
        availableLand: 3,
      },
      WETLANDS: {
        initialGoldPrice: 0.0,
        initialCarbonPrice: 0.0,
        initialPopulation: 200,
        transportationCostUnit: 5.00,
        availableLand: 8,
      }
    };
    return defaults[landType];
  }

  /**
   * Validate template generation parameters
   */
  static validateGenerationParameters(params: GenerateMapTemplateDto): string[] {
    const errors: string[] = [];

    if (params.width < 5 || params.width > 20) {
      errors.push('Width must be between 5 and 20');
    }

    if (params.height < 3 || params.height > 15) {
      errors.push('Height must be between 3 and 15');
    }

    const totalPercentage = params.marinePercentage + params.coastalPercentage + params.plainPercentage;
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push('Land type percentages must sum to 100%');
    }

    if (params.marinePercentage < 0 || params.marinePercentage > 100) {
      errors.push('Marine percentage must be between 0 and 100');
    }

    if (params.coastalPercentage < 0 || params.coastalPercentage > 100) {
      errors.push('Coastal percentage must be between 0 and 100');
    }

    if (params.plainPercentage < 0 || params.plainPercentage > 100) {
      errors.push('Plain percentage must be between 0 and 100');
    }

    return errors;
  }

  /**
   * Calculate estimated tile count for generation parameters
   */
  static calculateEstimatedTileCount(width: number, height: number): number {
    // Hexagonal grid calculation: approximate tile count for width x height
    return width * height;
  }

  /**
   * Format economic statistics for display
   */
  static formatEconomicValue(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Format population numbers for display
   */
  static formatPopulation(population: number): string {
    return new Intl.NumberFormat('en-US').format(population);
  }

  /**
   * Calculate price change percentage
   */
  static calculatePriceChange(currentPrice: number, initialPrice: number): number {
    if (initialPrice === 0) return 0;
    return ((currentPrice - initialPrice) / initialPrice) * 100;
  }

  /**
   * Calculate population growth percentage
   */
  static calculatePopulationGrowth(currentPopulation: number, initialPopulation: number): number {
    if (initialPopulation === 0) return currentPopulation > 0 ? 100 : 0;
    return ((currentPopulation - initialPopulation) / initialPopulation) * 100;
  }

  // ==================== TEMPLATE WORKFLOW HELPERS ====================

  /**
   * Create a complete template with tiles and facility configurations
   */
  static async createCompleteTemplate(templateData: {
    name: string;
    description?: string;
    generateParams?: Omit<GenerateMapTemplateDto, 'templateName' | 'description'>;
    initializeFacilityConfigs?: boolean;
  }): Promise<{
    template: MapTemplate;
    facilityConfigCount?: number;
  }> {
    try {
      let template: MapTemplate;
      
      if (templateData.generateParams) {
        // Generate template with tiles
        template = await this.generateMapTemplate({
          ...templateData.generateParams,
          name: templateData.name,
          description: templateData.description
        });
      } else {
        // Create basic template
        template = await this.createMapTemplate({
          name: templateData.name,
          description: templateData.description,
          width: 15,
          height: 7
        });
      }
      
      // Initialize facility configurations if requested
      let facilityConfigCount: number | undefined;
      if (templateData.initializeFacilityConfigs !== false) {
        try {
          const result = await TileFacilityBuildConfigService.initializeDefaultConfigs(template.id);
          facilityConfigCount = result.count;
        } catch (error) {
          console.warn('Failed to initialize facility configurations:', error);
        }
      }
      
      return {
        template,
        facilityConfigCount
      };
    } catch (error) {
      console.error('Failed to create complete template:', error);
      throw error;
    }
  }

  /**
   * Apply preset difficulty settings to a template's facility configurations
   */
  static async applyDifficultyPreset(
    templateId: number,
    difficulty: 'easy' | 'normal' | 'hard',
    landTypes?: ('MARINE' | 'COASTAL' | 'PLAIN')[]
  ): Promise<{
    landType: string;
    updated: number;
    failed: number;
  }[]> {
    const difficultyMultipliers = {
      easy: {
        requiredGoldMultiplier: 0.75,
        requiredCarbonMultiplier: 0.75,
        upgradeGoldCostMultiplier: 0.8,
        upgradeCarbonCostMultiplier: 0.8
      },
      normal: {
        requiredGoldMultiplier: 1.0,
        requiredCarbonMultiplier: 1.0,
        upgradeGoldCostMultiplier: 1.0,
        upgradeCarbonCostMultiplier: 1.0
      },
      hard: {
        requiredGoldMultiplier: 1.5,
        requiredCarbonMultiplier: 1.75,
        upgradeGoldCostMultiplier: 2.0,
        upgradeCarbonCostMultiplier: 1.8
      }
    };

    const targetLandTypes = landTypes || ['MARINE', 'COASTAL', 'PLAIN'];
    const results = [];

    for (const landType of targetLandTypes) {
      try {
        const result = await TileFacilityBuildConfigService.bulkUpdateByLandType(
          templateId,
          landType as any,
          difficultyMultipliers[difficulty]
        );
        results.push({
          landType,
          updated: result.updated,
          failed: result.failed
        });
      } catch (error) {
        console.error(`Failed to apply difficulty preset to ${landType}:`, error);
        results.push({
          landType,
          updated: 0,
          failed: 1
        });
      }
    }

    return results;
  }

  /**
   * Get template comparison data for A/B testing
   */
  static async compareTemplates(templateIds: number[]): Promise<{
    templateId: number;
    template: MapTemplate;
    tileCount: number;
    facilityStats?: TileFacilityConfigStatistics;
    averageCosts?: {
      buildCost: number;
      upgradeCost: number;
    };
  }[]> {
    const comparisons = await Promise.all(
      templateIds.map(async (templateId) => {
        try {
          const [template, facilityStats] = await Promise.all([
            this.getMapTemplate(templateId, { includeTiles: true }),
            TileFacilityBuildConfigService.getConfigStatistics(templateId).catch(() => null)
          ]);

          const averageCosts = facilityStats ? {
            buildCost: facilityStats.averageCosts.requiredGold,
            upgradeCost: facilityStats.averageCosts.upgradeGoldCost
          } : undefined;

          return {
            templateId,
            template,
            tileCount: template.tiles?.length || 0,
            facilityStats: facilityStats || undefined,
            averageCosts
          };
        } catch (error) {
          console.error(`Failed to load template ${templateId} for comparison:`, error);
          return null;
        }
      })
    );

    return comparisons.filter((c): c is NonNullable<typeof c> => c !== null);
  }

  /**
   * Validate tile configuration values
   * NEW: Updated for dual pricing system
   * NEW: Added availableLand validation
   */
  static validateTileConfiguration(config: UpdateTileDto): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // NEW: Dual pricing validation
    if (config.initialGoldPrice !== undefined) {
      if (config.initialGoldPrice < 0) {
        errors.initialGoldPrice = 'Gold price cannot be negative';
      } else if (config.initialGoldPrice > 10000) {
        errors.initialGoldPrice = 'Gold price cannot exceed $10,000';
      }
    }

    if (config.initialCarbonPrice !== undefined) {
      if (config.initialCarbonPrice < 0) {
        errors.initialCarbonPrice = 'Carbon price cannot be negative';
      } else if (config.initialCarbonPrice > 10000) {
        errors.initialCarbonPrice = 'Carbon price cannot exceed $10,000';
      }
    }

    if (config.initialPopulation !== undefined) {
      if (config.initialPopulation < 0) {
        errors.initialPopulation = 'Population cannot be negative';
      } else if (config.initialPopulation > 100000) {
        errors.initialPopulation = 'Population cannot exceed 100,000';
      }
    }

    if (config.transportationCostUnit !== undefined) {
      if (config.transportationCostUnit < 0) {
        errors.transportationCostUnit = 'Transportation cost cannot be negative';
      } else if (config.transportationCostUnit > 50) {
        errors.transportationCostUnit = 'Transportation cost cannot exceed $50';
      }
    }

    // NEW: Available land validation
    if (config.availableLand !== undefined) {
      if (config.availableLand < 0) {
        errors.availableLand = 'Available land cannot be negative';
      } else if (config.availableLand > 1000) {
        errors.availableLand = 'Available land cannot exceed 1000 units';
      }
      // Note: Marine tiles should have availableLand = 0, but this is enforced at the UI level
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate bulk tile update parameters for dual pricing system
   * NEW: Updated to support gold/carbon pricing
   * NEW: Added availableLand validation
   */
  static validateBulkTileUpdateByLandType(updateData: BulkUpdateTilesByLandTypeDto): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validate multipliers
    if (updateData.goldPriceMultiplier !== undefined && (updateData.goldPriceMultiplier < 0.1 || updateData.goldPriceMultiplier > 10)) {
      errors.goldPriceMultiplier = 'Gold price multiplier must be between 0.1 and 10';
    }

    if (updateData.carbonPriceMultiplier !== undefined && (updateData.carbonPriceMultiplier < 0.1 || updateData.carbonPriceMultiplier > 10)) {
      errors.carbonPriceMultiplier = 'Carbon price multiplier must be between 0.1 and 10';
    }

    if (updateData.populationMultiplier !== undefined && (updateData.populationMultiplier < 0 || updateData.populationMultiplier > 10)) {
      errors.populationMultiplier = 'Population multiplier must be between 0 and 10';
    }

    if (updateData.transportationCostMultiplier !== undefined && (updateData.transportationCostMultiplier < 0.1 || updateData.transportationCostMultiplier > 10)) {
      errors.transportationCostMultiplier = 'Transportation cost multiplier must be between 0.1 and 10';
    }

    // Validate fixed values
    if (updateData.fixedGoldPrice !== undefined) {
      const goldValidation = this.validateTileConfiguration({ initialGoldPrice: updateData.fixedGoldPrice });
      if (!goldValidation.isValid && goldValidation.errors.initialGoldPrice) {
        errors.fixedGoldPrice = goldValidation.errors.initialGoldPrice;
      }
    }

    if (updateData.fixedCarbonPrice !== undefined) {
      const carbonValidation = this.validateTileConfiguration({ initialCarbonPrice: updateData.fixedCarbonPrice });
      if (!carbonValidation.isValid && carbonValidation.errors.initialCarbonPrice) {
        errors.fixedCarbonPrice = carbonValidation.errors.initialCarbonPrice;
      }
    }

    if (updateData.fixedPopulation !== undefined) {
      const populationValidation = this.validateTileConfiguration({ initialPopulation: updateData.fixedPopulation });
      if (!populationValidation.isValid && populationValidation.errors.initialPopulation) {
        errors.fixedPopulation = populationValidation.errors.initialPopulation;
      }
    }

    if (updateData.fixedTransportationCost !== undefined) {
      const transportValidation = this.validateTileConfiguration({ transportationCostUnit: updateData.fixedTransportationCost });
      if (!transportValidation.isValid && transportValidation.errors.transportationCostUnit) {
        errors.fixedTransportationCost = transportValidation.errors.transportationCostUnit;
      }
    }

    // NEW: Validate fixedAvailableLand
    if (updateData.fixedAvailableLand !== undefined) {
      const availableLandValidation = this.validateTileConfiguration({ availableLand: updateData.fixedAvailableLand });
      if (!availableLandValidation.isValid && availableLandValidation.errors.availableLand) {
        errors.fixedAvailableLand = availableLandValidation.errors.availableLand;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default MapTemplateService;

// Export enhanced types for better integration
export type {
  EnhancedMapTemplate,
  TileFacilityConfigStatistics
} from '@/components/map/types'; 