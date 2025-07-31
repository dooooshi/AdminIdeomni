import apiClient from '@/lib/http/api-client';
import type {
  TileFacilityInstance,
  TileFacilityBuildConfig,
  BuildFacilityRequest,
  UpgradeFacilityRequest,
  FacilityInstanceQueryParams,
  BuildValidationResponse,
  TeamFacilitySummary,
  UpgradeCostCalculation,
  AvailableConfigsResponse,
  ConfigurationSummary,
  PaginatedResponse,
  ApiResponse,
  LandType,
} from '@/types/facilities';
import {
  FacilityType,
  FacilityInstanceStatus,
} from '@/types/facilities';

/**
 * Student Facility Service
 * Handles facility building, upgrading, and management for students
 * Based on the API documentation from docs/facility/
 */
export class StudentFacilityService {
  private static readonly FACILITIES_BASE_PATH = '/user/facilities';
  private static readonly CONFIGS_BASE_PATH = '/user/facility-configs';

  /**
   * Helper method to extract data from API response wrapper
   */
  private static extractResponseData<T>(response: any): T {
    // Handle nested response structure: { data: { success: true, data: {...} } }
    if (response.data?.data?.data) {
      return response.data.data.data;
    }
    
    // Handle standard nested response: { data: {...} }
    if (response.data?.data) {
      return response.data.data;
    }
    
    // Handle simple response: { data: {...} }
    if (response.data) {
      return response.data;
    }
    
    // Fallback - return entire response
    return response;
  }

  // ==================== FACILITY BUILDING OPERATIONS ====================

  /**
   * Build a new facility on a tile
   * POST /api/user/facilities/build
   */
  static async buildFacility(request: BuildFacilityRequest): Promise<TileFacilityInstance> {
    const response = await apiClient.post<ApiResponse<TileFacilityInstance>>(
      `${this.FACILITIES_BASE_PATH}/build`,
      request
    );
    return this.extractResponseData(response);
  }

  /**
   * Upgrade an existing facility
   * PUT /api/user/facilities/{facilityId}/upgrade
   */
  static async upgradeFacility(
    facilityId: string,
    request: UpgradeFacilityRequest
  ): Promise<TileFacilityInstance> {
    const response = await apiClient.put<ApiResponse<TileFacilityInstance>>(
      `${this.FACILITIES_BASE_PATH}/${facilityId}/upgrade`,
      request
    );
    return this.extractResponseData(response);
  }

  /**
   * Validate if facility can be built on a tile
   * GET /api/user/facilities/validate-build/{tileId}/{facilityType}
   */
  static async validateBuildCapability(
    tileId: number,
    facilityType: FacilityType
  ): Promise<BuildValidationResponse> {
    const response = await apiClient.get<ApiResponse<BuildValidationResponse>>(
      `${this.FACILITIES_BASE_PATH}/validate-build/${tileId}/${facilityType}`
    );
    
    // Debug: Log the raw response
    console.log('🔍 Raw API response:', response);
    console.log('🔍 Response.data:', response.data);
    console.log('🔍 Response.data.data:', response.data?.data);
    
    let extracted = this.extractResponseData<BuildValidationResponse>(response);
    console.log('🔍 Extracted data:', extracted);
    
    // Ensure canBuild is properly typed as boolean
    if (extracted && typeof extracted.canBuild !== 'undefined') {
      extracted.canBuild = Boolean(extracted.canBuild);
      console.log('🔍 Final canBuild value:', extracted.canBuild);
    }
    
    // Return with default values if extraction failed
    return extracted || {
      canBuild: false,
      goldCost: 0,
      carbonCost: 0,
      totalCost: 0,
      teamGoldBalance: 0,
      teamCarbonBalance: 0,
      requiredAreas: 0,
      availableLandArea: 0,
      currentInstances: 0,
      maxInstances: 0,
      errors: ['Failed to validate build capability']
    };
  }

  // ==================== FACILITY RETRIEVAL OPERATIONS ====================

  /**
   * Get team's owned facilities with pagination and filtering
   * GET /api/user/facilities/owned
   */
  static async getTeamFacilities(
    params: FacilityInstanceQueryParams = {}
  ): Promise<PaginatedResponse<TileFacilityInstance>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    };

    if (params.tileId) queryParams.tileId = params.tileId;
    if (params.facilityType) queryParams.facilityType = params.facilityType;
    if (params.status) queryParams.status = params.status;

    const response = await apiClient.get<ApiResponse<PaginatedResponse<TileFacilityInstance>>>(
      `${this.FACILITIES_BASE_PATH}/owned`,
      { params: queryParams }
    );
    
    const extractedData = this.extractResponseData(response);
    
    // Ensure we always return a proper paginated response structure
    if (!extractedData || typeof extractedData !== 'object') {
      return {
        data: [],
        total: 0,
        page: queryParams.page || 1,
        pageSize: queryParams.pageSize || 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      } as T;
    }
    
    // If extractedData is an array, wrap it in pagination structure
    if (Array.isArray(extractedData)) {
      return {
        data: extractedData,
        total: extractedData.length,
        page: queryParams.page || 1,
        pageSize: queryParams.pageSize || 20,
        totalPages: Math.ceil(extractedData.length / (queryParams.pageSize || 20)),
        hasNext: false,
        hasPrevious: false,
      } as T;
    }
    
    return extractedData;
  }

  /**
   * Get detailed information about a specific facility
   * GET /api/user/facilities/{facilityId}
   */
  static async getFacilityDetails(facilityId: string): Promise<TileFacilityInstance> {
    const response = await apiClient.get<ApiResponse<TileFacilityInstance>>(
      `${this.FACILITIES_BASE_PATH}/${facilityId}`
    );
    return this.extractResponseData(response);
  }

  /**
   * Get team facility summary with statistics
   * GET /api/user/facilities/summary
   */
  static async getTeamFacilitySummary(): Promise<TeamFacilitySummary> {
    const response = await apiClient.get<ApiResponse<TeamFacilitySummary>>(
      `${this.FACILITIES_BASE_PATH}/summary`
    );
    return this.extractResponseData(response);
  }

  /**
   * Get all facilities on a specific tile
   * GET /api/user/facilities/tile/{tileId}
   */
  static async getFacilitiesOnTile(tileId: number): Promise<TileFacilityInstance[]> {
    const response = await apiClient.get<ApiResponse<TileFacilityInstance[]>>(
      `${this.FACILITIES_BASE_PATH}/tile/${tileId}`
    );
    return this.extractResponseData(response);
  }

  /**
   * Get facilities by type
   * GET /api/user/facilities/type/{facilityType}
   */
  static async getFacilitiesByType(facilityType: FacilityType): Promise<TileFacilityInstance[]> {
    const response = await apiClient.get<ApiResponse<TileFacilityInstance[]>>(
      `${this.FACILITIES_BASE_PATH}/type/${facilityType}`
    );
    return this.extractResponseData(response);
  }

  /**
   * Get facilities needing attention (maintenance, damaged)
   * GET /api/user/facilities/attention
   */
  static async getFacilitiesNeedingAttention(): Promise<TileFacilityInstance[]> {
    const response = await apiClient.get<ApiResponse<TileFacilityInstance[]>>(
      `${this.FACILITIES_BASE_PATH}/attention`
    );
    return this.extractResponseData(response);
  }

  // ==================== FACILITY CONFIGURATION OPERATIONS ====================

  /**
   * Get available facility configurations
   * GET /api/user/facility-configs/available
   */
  static async getAvailableConfigurations(filters?: {
    landType?: LandType;
    facilityType?: FacilityType;
    category?: string;
  }): Promise<AvailableConfigsResponse> {
    const params: Record<string, any> = {};
    if (filters?.landType) params.landType = filters.landType;
    if (filters?.facilityType) params.facilityType = filters.facilityType;
    if (filters?.category) params.category = filters.category;

    const response = await apiClient.get<ApiResponse<AvailableConfigsResponse>>(
      `${this.CONFIGS_BASE_PATH}/available`,
      { params }
    );
    return this.extractResponseData(response);
  }

  /**
   * Get configurations by land type
   * GET /api/user/facility-configs/by-land-type
   */
  static async getConfigurationsByLandType(landType: LandType): Promise<{
    landType: LandType;
    configurations: TileFacilityBuildConfig[];
    totalConfigurations: number;
    summary: {
      cheapestFacility: { facilityType: FacilityType; totalCost: number };
      mostExpensiveFacility: { facilityType: FacilityType; totalCost: number };
      averageCost: { gold: number; carbon: number };
    };
  }> {
    const response = await apiClient.get(
      `${this.CONFIGS_BASE_PATH}/by-land-type`,
      { params: { landType } }
    );
    return this.extractResponseData(response);
  }

  /**
   * Calculate upgrade costs for a facility
   * GET /api/user/facility-configs/upgrade-costs
   */
  static async calculateUpgradeCosts(params: {
    facilityType: FacilityType;
    fromLevel?: number;
    toLevel: number;
    landType?: LandType;
  }): Promise<UpgradeCostCalculation> {
    const queryParams: Record<string, any> = {
      facilityType: params.facilityType,
      toLevel: params.toLevel,
    };

    if (params.fromLevel) queryParams.fromLevel = params.fromLevel;
    if (params.landType) queryParams.landType = params.landType;

    const response = await apiClient.get<ApiResponse<UpgradeCostCalculation>>(
      `${this.CONFIGS_BASE_PATH}/upgrade-costs`,
      { params: queryParams }
    );
    return this.extractResponseData(response);
  }

  /**
   * Get configuration summary with analysis
   * GET /api/user/facility-configs/summary
   */
  static async getConfigurationSummary(): Promise<ConfigurationSummary> {
    const response = await apiClient.get<ApiResponse<ConfigurationSummary>>(
      `${this.CONFIGS_BASE_PATH}/summary`
    );
    return this.extractResponseData(response);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get human-readable facility type name
   */
  static getFacilityTypeName(type: FacilityType): string {
    const typeNames: Record<FacilityType, string> = {
      [FacilityType.MINE]: 'Mining Facility',
      [FacilityType.QUARRY]: 'Quarry',
      [FacilityType.FOREST]: 'Forest',
      [FacilityType.FARM]: 'Farm',
      [FacilityType.RANCH]: 'Ranch',
      [FacilityType.FISHERY]: 'Fishery',
      [FacilityType.FACTORY]: 'Factory',
      [FacilityType.MALL]: 'Shopping Mall',
      [FacilityType.WAREHOUSE]: 'Warehouse',
      [FacilityType.MEDIA_BUILDING]: 'Media Building',
      [FacilityType.WATER_PLANT]: 'Water Plant',
      [FacilityType.POWER_PLANT]: 'Power Plant',
      [FacilityType.BASE_STATION]: 'Base Station',
      [FacilityType.FIRE_STATION]: 'Fire Station',
      [FacilityType.SCHOOL]: 'School',
      [FacilityType.HOSPITAL]: 'Hospital',
      [FacilityType.PARK]: 'Park',
      [FacilityType.CINEMA]: 'Cinema',
    };
    return typeNames[type] || type;
  }

  /**
   * Get status display color
   */
  static getStatusColor(status: FacilityInstanceStatus): string {
    const colors: Record<FacilityInstanceStatus, string> = {
      [FacilityInstanceStatus.ACTIVE]: 'success',
      [FacilityInstanceStatus.UNDER_CONSTRUCTION]: 'info',
      [FacilityInstanceStatus.MAINTENANCE]: 'warning',
      [FacilityInstanceStatus.DAMAGED]: 'error',
      [FacilityInstanceStatus.DECOMMISSIONED]: 'default',
    };
    return colors[status] || 'default';
  }

  /**
   * Get status display text
   */
  static getStatusText(status: FacilityInstanceStatus): string {
    const statusTexts: Record<FacilityInstanceStatus, string> = {
      [FacilityInstanceStatus.ACTIVE]: 'Active',
      [FacilityInstanceStatus.UNDER_CONSTRUCTION]: 'Under Construction',
      [FacilityInstanceStatus.MAINTENANCE]: 'Maintenance',
      [FacilityInstanceStatus.DAMAGED]: 'Damaged',
      [FacilityInstanceStatus.DECOMMISSIONED]: 'Decommissioned',
    };
    return statusTexts[status] || status;
  }

  /**
   * Format currency value
   */
  static formatCurrency(value: number, decimals = 2): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format resource value (Gold/Carbon)
   */
  static formatResource(value: number, type: 'gold' | 'carbon'): string {
    const symbol = type === 'gold' ? '🪙' : '🔥';
    return `${symbol} ${new Intl.NumberFormat('en-US').format(value)}`;
  }

  /**
   * Calculate total facility investment
   */
  static calculateTotalInvestment(facility: TileFacilityInstance): number {
    return facility.buildGoldCost + facility.buildCarbonCost + facility.totalUpgradeCost;
  }

  /**
   * Get facility category from type
   */
  static getFacilityCategory(type: FacilityType): string {
    const rawMaterialTypes = [
      FacilityType.MINE, FacilityType.QUARRY, FacilityType.FOREST,
      FacilityType.FARM, FacilityType.RANCH, FacilityType.FISHERY
    ];
    const functionalTypes = [
      FacilityType.FACTORY, FacilityType.MALL, FacilityType.WAREHOUSE, FacilityType.MEDIA_BUILDING
    ];
    const infrastructureTypes = [
      FacilityType.WATER_PLANT, FacilityType.POWER_PLANT, FacilityType.BASE_STATION
    ];

    if (rawMaterialTypes.includes(type)) return 'Raw Material Production';
    if (functionalTypes.includes(type)) return 'Functional Facilities';
    if (infrastructureTypes.includes(type)) return 'Infrastructure';
    return 'Other Facilities';
  }

  /**
   * Check if facility needs attention
   */
  static needsAttention(facility: TileFacilityInstance): boolean {
    return facility.status === FacilityInstanceStatus.MAINTENANCE ||
           facility.status === FacilityInstanceStatus.DAMAGED;
  }

  /**
   * Get facility type icon/emoji
   */
  static getFacilityIcon(type: FacilityType): string {
    const icons: Record<FacilityType, string> = {
      [FacilityType.MINE]: '⛏️',
      [FacilityType.QUARRY]: '🪨',
      [FacilityType.FOREST]: '🌲',
      [FacilityType.FARM]: '🚜',
      [FacilityType.RANCH]: '🐄',
      [FacilityType.FISHERY]: '🐟',
      [FacilityType.FACTORY]: '🏭',
      [FacilityType.MALL]: '🏬',
      [FacilityType.WAREHOUSE]: '📦',
      [FacilityType.MEDIA_BUILDING]: '📺',
      [FacilityType.WATER_PLANT]: '💧',
      [FacilityType.POWER_PLANT]: '⚡',
      [FacilityType.BASE_STATION]: '📡',
      [FacilityType.FIRE_STATION]: '🚒',
      [FacilityType.SCHOOL]: '🏫',
      [FacilityType.HOSPITAL]: '🏥',
      [FacilityType.PARK]: '🏞️',
      [FacilityType.CINEMA]: '🎬',
    };
    return icons[type] || '🏢';
  }
}

export default StudentFacilityService;