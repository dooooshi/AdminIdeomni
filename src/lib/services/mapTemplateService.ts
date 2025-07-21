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
  PaginatedResponse
} from '@/components/map/types';

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
  private static extractResponseData<T>(response: any): T {
    // Handle nested response structure: { data: { data: { data: T } } }
    return response.data?.data?.data || response.data?.data || response.data;
  }

  // ==================== MAP TEMPLATE MANAGEMENT ====================

  /**
   * Get all map templates with optional pagination and filtering
   */
  static async getMapTemplates(params?: GetMapTemplatesQueryParams): Promise<PaginatedResponse<MapTemplate>> {
    const response = await apiClient.get<any>(
      this.BASE_PATH,
      { params }
    );
    
    // Handle nested response structure: { data: { data: { data: [...], meta: {...} } } }
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
    
    // Fallback for different response structures
    return response.data?.data || { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 1, hasNext: false, hasPrev: false } };
  }

  /**
   * Get a specific map template by ID with optional tile and statistics data
   */
  static async getMapTemplate(
    id: number, 
    options?: {
      includeTiles?: boolean;
      includeStatistics?: boolean;
    }
  ): Promise<MapTemplate> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${id}`,
      { params: options }
    );
    
    // Handle nested response structure: { data: { data: {...} } }
    return this.extractResponseData<MapTemplate>(response);
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
   * Clone an existing map template (Admin only)
   */
  static async cloneMapTemplate(id: number, newName: string): Promise<MapTemplate> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/${id}/clone`,
      { name: newName }
    );
    return this.extractResponseData<MapTemplate>(response);
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
   * Get template statistics for analytics (Admin only)
   */
  static async getTemplateStatistics(id: number): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `${this.BASE_PATH}/${id}/statistics`
    );
    return response.data.data;
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
   */
  static getDefaultConfiguration(landType: 'MARINE' | 'COASTAL' | 'PLAIN') {
    const defaults = {
      MARINE: {
        initialPrice: 50.00,
        initialPopulation: 0,
        transportationCostUnit: 8.00
      },
      COASTAL: {
        initialPrice: 100.00,
        initialPopulation: 500,
        transportationCostUnit: 5.00
      },
      PLAIN: {
        initialPrice: 150.00,
        initialPopulation: 1000,
        transportationCostUnit: 3.00
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
}

export default MapTemplateService; 