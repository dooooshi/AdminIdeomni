import apiClient from '@/lib/http/api-client';

/**
 * Admin Tile State Management Service
 * Handles administrative operations for activity tile states
 */

// Types for admin tile state operations
export interface TileStateConfig {
  activityId: string;
  tileId: number;
  currentPrice: number;
  currentPopulation: number;
  changeReason: string;
}

export interface BulkTileStateConfig {
  activityId: string;
  configurations: Array<{
    tileId: number;
    currentPrice?: number;
    currentPopulation?: number;
    changeReason: string;
  }>;
  globalReason: string;
}

export interface TileStateSearchParams {
  activityId?: string;
  minCurrentPrice?: number;
  maxCurrentPrice?: number;
  minCurrentPopulation?: number;
  maxCurrentPopulation?: number;
  landType?: 'MARINE' | 'COASTAL' | 'PLAIN';
  updatedBy?: string;
  reasonSearch?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  sortBy?: 'lastUpdated' | 'currentPrice' | 'currentPopulation' | 'tileId';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TileStateAnalytics {
  activitySummary: {
    activityId: string;
    activityName: string;
    totalTiles: number;
    averagePrice: number;
    averagePopulation: number;
    totalValue: number;
  };
  landTypeBreakdown: {
    [key in 'MARINE' | 'COASTAL' | 'PLAIN']: {
      count: number;
      averagePrice: number;
      averagePopulation: number;
      totalValue: number;
      priceRange: { min: number; max: number };
      populationRange: { min: number; max: number };
    };
  };
  topTiles: Array<{
    tileId: number;
    currentPrice: number;
    currentPopulation: number;
    totalValue: number;
    landType: string;
    coordinates: { q: number; r: number };
  }>;
  recentChanges: {
    last24Hours: number;
    lastWeek: number;
    lastMonth: number;
    mostActiveAdmin: string;
  };
}

export interface TileStateTemplate {
  id?: number;
  templateName: string;
  description: string;
  configurationByLandType: {
    [key in 'MARINE' | 'COASTAL' | 'PLAIN']: {
      priceMultiplier: number;
      populationMultiplier: number;
    };
  };
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TileStateTemplateApplication {
  templateId: number;
  activityId: string;
  reason: string;
  overwriteExisting: boolean;
}

export interface AdminDashboard {
  overview: {
    totalActivities: number;
    totalTileStates: number;
    activeConfigurations: number;
    recentChanges: number;
  };
  topActivities: Array<{
    activityId: string;
    activityName: string;
    totalValue: number;
    changeCount: number;
    lastModified: string;
  }>;
  templates: {
    totalTemplates: number;
    activeTemplates: number;
    mostUsedTemplate: string;
  };
  recentActivity: Array<{
    adminId: string;
    adminName: string;
    action: string;
    timestamp: string;
    activityId: string;
    tilesAffected: number;
  }>;
}

export interface Activity {
  id: string;
  name: string;
  activityType: string;
  startAt: string;
  endAt: string;
  description?: string;
  isActive: boolean;
  mapTemplateId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface DetailedTileState {
  id: number;
  activityId: string;
  tileId: number;
  previousPrice: number;
  newPrice: number;
  previousPopulation: number;
  newPopulation: number;
  updatedBy: string;
  changeReason: string;
  changedAt: string;
  tile: {
    id: number;
    axialQ: number;
    axialR: number;
    landType: 'MARINE' | 'COASTAL' | 'PLAIN';
    templateId: number;
    initialPrice: number;
    initialPopulation: number;
    transportationCostUnit: number;
  };
}

export class AdminTileStateService {
  private static readonly BASE_PATH = '/admin/tile-states';

  /**
   * Helper method to extract data from nested API response structure
   */
  private static extractResponseData<T>(response: any): T {
    return response.data?.data?.data || response.data?.data || response.data;
  }

  // ==================== INDIVIDUAL TILE CONFIGURATION ====================

  /**
   * Update a single tile state configuration
   */
  static async updateTileState(config: TileStateConfig): Promise<DetailedTileState> {
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/configure`,
      config
    );
    return this.extractResponseData<DetailedTileState>(response);
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk update multiple tile states
   */
  static async bulkUpdateTileStates(config: BulkTileStateConfig): Promise<{
    success: number;
    failed: number;
    details: Array<{ tileId: number; success: boolean; error?: string }>;
  }> {
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/bulk-configure`,
      config
    );
    return this.extractResponseData(response);
  }

  /**
   * Reset all tile states in an activity to template defaults
   */
  static async resetActivityTileStates(
    activityId: string, 
    reason: string
  ): Promise<{ updatedCount: number }> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/${activityId}/reset`,
      { reason }
    );
    return this.extractResponseData(response);
  }

  // ==================== SEARCH AND FILTERING ====================

  /**
   * Advanced search for tile states with filtering
   */
  static async searchTileStates(params: TileStateSearchParams): Promise<{
    data: DetailedTileState[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    // Use the correct endpoint from the documentation: /api/map/activity-tile-states
    const response = await apiClient.get<any>(
      '/map/activity-tile-states',
      { params }
    );
    
    // Handle the nested response structure specifically for tile states
    const responseData = response.data?.data || response.data;
    
    return {
      data: responseData.data || responseData || [],
      total: responseData.total || 0,
      page: responseData.page || 1,
      pageSize: responseData.pageSize || 20,
      totalPages: responseData.totalPages || 1,
      hasNext: responseData.hasNext || false,
      hasPrevious: responseData.hasPrevious || false,
    };
  }

  // ==================== ANALYTICS AND REPORTING ====================

  /**
   * Get comprehensive analytics for an activity's tile states
   */
  static async getActivityAnalytics(
    activityId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      landType?: 'MARINE' | 'COASTAL' | 'PLAIN';
      groupBy?: 'hour' | 'day' | 'week' | 'month';
    }
  ): Promise<TileStateAnalytics> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${activityId}/analytics`,
      { params }
    );
    return this.extractResponseData<TileStateAnalytics>(response);
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  /**
   * Create a new tile state template
   */
  static async createTemplate(template: Omit<TileStateTemplate, 'id'>): Promise<TileStateTemplate> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/templates`,
      template
    );
    return this.extractResponseData<TileStateTemplate>(response);
  }

  /**
   * Get all tile state templates
   */
  static async getTemplates(params?: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
    createdBy?: string;
  }): Promise<{
    data: TileStateTemplate[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/templates`,
      { params }
    );
    return this.extractResponseData(response);
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(
    templateId: number,
    template: Partial<TileStateTemplate>
  ): Promise<TileStateTemplate> {
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/templates/${templateId}`,
      template
    );
    return this.extractResponseData<TileStateTemplate>(response);
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(templateId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/templates/${templateId}`);
  }

  /**
   * Apply a template to an activity
   */
  static async applyTemplate(application: TileStateTemplateApplication): Promise<{
    success: number;
    failed: number;
    details: Array<{ tileId: number; success: boolean; error?: string }>;
  }> {
    const response = await apiClient.post<any>(
      `${this.BASE_PATH}/templates/apply`,
      application
    );
    return this.extractResponseData(response);
  }

  // ==================== DASHBOARD ====================

  /**
   * Get admin dashboard data
   */
  static async getDashboard(): Promise<AdminDashboard> {
    const response = await apiClient.get<any>(`${this.BASE_PATH}/dashboard`);
    return this.extractResponseData<AdminDashboard>(response);
  }

  // ==================== ACTIVITY MANAGEMENT ====================

  /**
   * Get list of activities for tile state management
   */
  static async getActivities(params?: {
    page?: number;
    pageSize?: number;
    name?: string;
    activityType?: string;
    isActive?: boolean;
    includeDeleted?: boolean;
  }): Promise<{
    data: Activity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const response = await apiClient.get<any>('/activity', { params });
    
    // Handle the nested response structure specifically for activities
    const responseData = response.data?.data || response.data;
    
    return {
      data: responseData.data || responseData || [],
      total: responseData.total || 0,
      page: responseData.page || 1,
      pageSize: responseData.pageSize || 20,
      totalPages: responseData.totalPages || 1,
      hasNext: responseData.hasNext || false,
      hasPrevious: responseData.hasPrevious || false,
    };
  }

  /**
   * Get a specific activity by ID
   */
  static async getActivity(activityId: string): Promise<Activity> {
    const response = await apiClient.get<any>(`/api/activities/${activityId}`);
    return this.extractResponseData<Activity>(response);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate tile state configuration values
   */
  static validateTileConfig(config: Partial<TileStateConfig>): string[] {
    const errors: string[] = [];

    if (config.currentPrice !== undefined) {
      if (config.currentPrice < 0) {
        errors.push('Current price cannot be negative');
      }
      if (config.currentPrice > 10000) {
        errors.push('Current price cannot exceed $10,000');
      }
    }

    if (config.currentPopulation !== undefined) {
      if (config.currentPopulation < 0) {
        errors.push('Current population cannot be negative');
      }
      if (config.currentPopulation > 100000) {
        errors.push('Current population cannot exceed 100,000');
      }
    }

    if (config.changeReason && config.changeReason.trim().length < 3) {
      errors.push('Change reason must be at least 3 characters');
    }

    return errors;
  }

  /**
   * Calculate total value for a tile (price * population multiplier)
   */
  static calculateTileValue(price: number, population: number): number {
    // Simple value calculation - can be enhanced based on business logic
    return price * (1 + population / 10000);
  }

  /**
   * Get default template configurations
   */
  static getDefaultTemplates(): Omit<TileStateTemplate, 'id'>[] {
    return [
      {
        templateName: 'Economic Boom',
        description: 'Simulate economic growth across all land types',
        configurationByLandType: {
          MARINE: { priceMultiplier: 1.2, populationMultiplier: 1.0 },
          COASTAL: { priceMultiplier: 1.5, populationMultiplier: 1.3 },
          PLAIN: { priceMultiplier: 1.8, populationMultiplier: 1.6 }
        },
        isActive: true
      },
      {
        templateName: 'Market Recession',
        description: 'Simulate economic downturn and reduced activity',
        configurationByLandType: {
          MARINE: { priceMultiplier: 0.8, populationMultiplier: 0.9 },
          COASTAL: { priceMultiplier: 0.7, populationMultiplier: 0.8 },
          PLAIN: { priceMultiplier: 0.6, populationMultiplier: 0.7 }
        },
        isActive: true
      },
      {
        templateName: 'Coastal Development',
        description: 'Focus development on coastal areas',
        configurationByLandType: {
          MARINE: { priceMultiplier: 1.0, populationMultiplier: 1.0 },
          COASTAL: { priceMultiplier: 2.0, populationMultiplier: 1.8 },
          PLAIN: { priceMultiplier: 1.1, populationMultiplier: 1.2 }
        },
        isActive: true
      }
    ];
  }
}

export default AdminTileStateService; 