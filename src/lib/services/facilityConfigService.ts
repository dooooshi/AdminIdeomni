import apiClient from '@/lib/http/api-client';
import { FacilityType, FacilityCategory } from './facilityService';

// Facility Configuration interface based on API documentation
export interface FacilityConfig {
  id: string;
  facilityType: FacilityType;
  category: FacilityCategory;
  name?: string;
  description?: string;
  defaultCapacity?: number;
  defaultMaintenanceCost?: number;
  defaultBuildCost?: number;
  defaultOperationCost?: number;
  minCapacity?: number;
  maxCapacity?: number;
  minBuildCost?: number;
  maxBuildCost?: number;
  minMaintenanceCost?: number;
  maxMaintenanceCost?: number;
  minOperationCost?: number;
  maxOperationCost?: number;
  configData?: Record<string, any>;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request interfaces
export interface CreateFacilityConfigRequest {
  facilityType: FacilityType;
  category: FacilityCategory;
  name?: string;
  description?: string;
  defaultCapacity?: number;
  defaultMaintenanceCost?: number;
  defaultBuildCost?: number;
  defaultOperationCost?: number;
  minCapacity?: number;
  maxCapacity?: number;
  minBuildCost?: number;
  maxBuildCost?: number;
  minMaintenanceCost?: number;
  maxMaintenanceCost?: number;
  minOperationCost?: number;
  maxOperationCost?: number;
  configData?: Record<string, any>;
}

export interface UpdateFacilityConfigRequest {
  name?: string;
  description?: string;
  defaultCapacity?: number;
  defaultMaintenanceCost?: number;
  defaultBuildCost?: number;
  defaultOperationCost?: number;
  minCapacity?: number;
  maxCapacity?: number;
  minBuildCost?: number;
  maxBuildCost?: number;
  minMaintenanceCost?: number;
  maxMaintenanceCost?: number;
  minOperationCost?: number;
  maxOperationCost?: number;
  configData?: Record<string, any>;
  isActive?: boolean;
}

export interface FacilityConfigSearchParams {
  search?: string;
  facilityType?: FacilityType;
  category?: FacilityCategory;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response interfaces matching API specification
export interface FacilityConfigSearchResponse {
  data: FacilityConfig[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FacilityConfigStatistics {
  totalConfigs: number;
  activeConfigs: number;
  inactiveConfigs: number;
  deletedConfigs?: number;
  configsByCategory: Record<FacilityCategory, number>;
}

export interface FacilityConfigsByCategory {
  [FacilityCategory.RAW_MATERIAL_PRODUCTION]: FacilityConfig[];
  [FacilityCategory.FUNCTIONAL]: FacilityConfig[];
  [FacilityCategory.INFRASTRUCTURE]: FacilityConfig[];
  [FacilityCategory.OTHER]: FacilityConfig[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  businessCode?: number;
  message?: string;
  timestamp?: string;
  path?: string;
}

export class FacilityConfigService {
  private static readonly BASE_PATH = '/facility-configs';
  private static readonly MOCK_BASE_PATH = '/api/mock/facility-configs';

  // Helper method to extract data from API response
  private static extractResponseData<T>(response: any): T {
    if (response?.data?.success && response?.data?.data) {
      return response.data.data;
    }
    return response?.data || response;
  }

  /**
   * Create a new facility configuration
   */
  static async createFacilityConfig(configData: CreateFacilityConfigRequest): Promise<FacilityConfig> {
    const response = await apiClient.post<ApiResponse<FacilityConfig>>(
      this.BASE_PATH,
      configData
    );
    return this.extractResponseData<FacilityConfig>(response);
  }

  /**
   * Search facility configurations with filters and pagination
   */
  static async searchFacilityConfigs(params: FacilityConfigSearchParams = {}): Promise<FacilityConfigSearchResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.facilityType) searchParams.append('facilityType', params.facilityType);
    if (params.category) searchParams.append('category', params.category);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    
    // Try the main API first, then fall back to mock API
    let url = queryString ? `${this.BASE_PATH}/search?${queryString}` : `${this.BASE_PATH}/search`;
    
    console.log('🌐 API Request:', {
      url,
      params,
      queryString
    });
    
    try {
      const response = await apiClient.get<ApiResponse<FacilityConfigSearchResponse>>(url);
      const data = this.extractResponseData<FacilityConfigSearchResponse>(response);
      
      console.log('🌐 API Response:', {
        source: 'main API',
        rawResponse: response.data,
        extractedData: data,
        status: response.status
      });
      
      return this.validateAndReturnResponse(data);
    } catch (error) {
      console.warn('⚠️ Main API failed, trying mock API:', error);
      
      // Fall back to mock API
      const mockUrl = queryString ? `${this.MOCK_BASE_PATH}/search?${queryString}` : `${this.MOCK_BASE_PATH}/search`;
      
      try {
        const mockResponse = await apiClient.get<ApiResponse<FacilityConfigSearchResponse>>(mockUrl);
        const mockData = this.extractResponseData<FacilityConfigSearchResponse>(mockResponse);
        
        console.log('🔄 Mock API Response:', {
          source: 'mock API',
          rawResponse: mockResponse.data,
          extractedData: mockData,
          status: mockResponse.status
        });
        
        return this.validateAndReturnResponse(mockData);
      } catch (mockError) {
        console.error('❌ Both main and mock API failed:', { mainError: error, mockError });
        throw mockError;
      }
    }
  }

  /**
   * Validate and return API response data
   */
  private static validateAndReturnResponse(data: FacilityConfigSearchResponse): FacilityConfigSearchResponse {
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format: Expected object');
    }
    
    if (!Array.isArray(data.data)) {
      throw new Error('Invalid response format: data.data must be an array');
    }
    
    if (typeof data.total !== 'number' || data.total < 0) {
      throw new Error('Invalid response format: total must be a non-negative number');
    }
    
    if (typeof data.page !== 'number' || data.page < 1) {
      throw new Error('Invalid response format: page must be a positive number');
    }
    
    if (typeof data.pageSize !== 'number' || data.pageSize < 1) {
      throw new Error('Invalid response format: pageSize must be a positive number');
    }
    
    if (typeof data.totalPages !== 'number' || data.totalPages < 0) {
      throw new Error('Invalid response format: totalPages must be a non-negative number');
    }
    
    // Calculate expected values for validation
    const expectedTotalPages = Math.ceil(data.total / data.pageSize);
    if (data.totalPages !== expectedTotalPages) {
      console.warn('⚠️ totalPages mismatch:', {
        reported: data.totalPages,
        calculated: expectedTotalPages,
        total: data.total,
        pageSize: data.pageSize
      });
    }
    
    const expectedHasNext = data.page < data.totalPages;
    const expectedHasPrevious = data.page > 1;
    
    if (data.hasNext !== expectedHasNext) {
      console.warn('⚠️ hasNext mismatch:', {
        reported: data.hasNext,
        expected: expectedHasNext,
        currentPage: data.page,
        totalPages: data.totalPages
      });
    }
    
    if (data.hasPrevious !== expectedHasPrevious) {
      console.warn('⚠️ hasPrevious mismatch:', {
        reported: data.hasPrevious,
        expected: expectedHasPrevious,
        currentPage: data.page
      });
    }
    
    return data;
  }

  /**
   * Get facility configuration by ID
   */
  static async getFacilityConfigById(id: string): Promise<FacilityConfig> {
    const response = await apiClient.get<ApiResponse<FacilityConfig>>(`${this.BASE_PATH}/${id}`);
    return this.extractResponseData<FacilityConfig>(response);
  }

  /**
   * Get facility configuration by facility type
   */
  static async getFacilityConfigByType(facilityType: FacilityType): Promise<FacilityConfig> {
    const response = await apiClient.get<ApiResponse<FacilityConfig>>(
      `${this.BASE_PATH}/facility-type/${facilityType}`
    );
    return this.extractResponseData<FacilityConfig>(response);
  }

  /**
   * Get facility configurations by category
   */
  static async getFacilityConfigsByCategory(category: FacilityCategory): Promise<FacilityConfig[]> {
    const response = await apiClient.get<ApiResponse<FacilityConfig[]>>(
      `${this.BASE_PATH}/category/${category}`
    );
    return this.extractResponseData<FacilityConfig[]>(response);
  }

  /**
   * Get all facility configurations grouped by category
   */
  static async getFacilityConfigsByCategories(): Promise<FacilityConfigsByCategory> {
    const response = await apiClient.get<ApiResponse<FacilityConfigsByCategory>>(
      `${this.BASE_PATH}/by-category`
    );
    return this.extractResponseData<FacilityConfigsByCategory>(response);
  }

  /**
   * Get facility configuration statistics
   */
  static async getFacilityConfigStatistics(): Promise<FacilityConfigStatistics> {
    try {
      const response = await apiClient.get<ApiResponse<FacilityConfigStatistics>>(`${this.BASE_PATH}/stats`);
      return this.extractResponseData<FacilityConfigStatistics>(response);
    } catch (error) {
      console.warn('⚠️ Main API stats failed, trying mock API:', error);
      
      // Fall back to mock API
      try {
        const mockResponse = await apiClient.get<ApiResponse<FacilityConfigStatistics>>(`${this.MOCK_BASE_PATH}/stats`);
        return this.extractResponseData<FacilityConfigStatistics>(mockResponse);
      } catch (mockError) {
        console.error('❌ Both main and mock API stats failed:', { mainError: error, mockError });
        throw mockError;
      }
    }
  }

  /**
   * Update facility configuration
   */
  static async updateFacilityConfig(
    id: string, 
    configData: UpdateFacilityConfigRequest
  ): Promise<FacilityConfig> {
    const response = await apiClient.put<ApiResponse<FacilityConfig>>(
      `${this.BASE_PATH}/${id}`,
      configData
    );
    return this.extractResponseData<FacilityConfig>(response);
  }

  /**
   * Toggle facility configuration status (active/inactive)
   */
  static async toggleFacilityConfigStatus(id: string): Promise<FacilityConfig> {
    const response = await apiClient.put<ApiResponse<FacilityConfig>>(
      `${this.BASE_PATH}/${id}/toggle-status`
    );
    return this.extractResponseData<FacilityConfig>(response);
  }

  /**
   * Restore a deleted facility configuration
   */
  static async restoreFacilityConfig(id: string): Promise<FacilityConfig> {
    const response = await apiClient.put<ApiResponse<FacilityConfig>>(
      `${this.BASE_PATH}/${id}/restore`
    );
    return this.extractResponseData<FacilityConfig>(response);
  }

  /**
   * Delete facility configuration (soft delete)
   */
  static async deleteFacilityConfig(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Initialize default configurations for all facility types
   */
  static async initializeDefaultConfigs(): Promise<{ count: number }> {
    const response = await apiClient.post<ApiResponse<{ count: number }>>(
      `${this.BASE_PATH}/initialize-defaults`
    );
    return this.extractResponseData<{ count: number }>(response);
  }

  // Utility methods

  /**
   * Validate capacity constraints
   */
  static validateCapacityConstraints(
    defaultCapacity?: number,
    minCapacity?: number,
    maxCapacity?: number
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (minCapacity !== undefined && maxCapacity !== undefined && minCapacity > maxCapacity) {
      errors.push('Minimum capacity cannot be greater than maximum capacity');
    }

    if (defaultCapacity !== undefined) {
      if (minCapacity !== undefined && defaultCapacity < minCapacity) {
        errors.push('Default capacity cannot be less than minimum capacity');
      }
      if (maxCapacity !== undefined && defaultCapacity > maxCapacity) {
        errors.push('Default capacity cannot be greater than maximum capacity');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate facility type and category combination
   */
  static validateTypeCategory(type: FacilityType, category: FacilityCategory): boolean {
    const typeCategoryMap: Record<FacilityCategory, FacilityType[]> = {
      [FacilityCategory.RAW_MATERIAL_PRODUCTION]: [
        FacilityType.MINE,
        FacilityType.QUARRY,
        FacilityType.FOREST,
        FacilityType.FARM,
        FacilityType.RANCH,
        FacilityType.FISHERY
      ],
      [FacilityCategory.FUNCTIONAL]: [
        FacilityType.FACTORY,
        FacilityType.MALL,
        FacilityType.WAREHOUSE,
        FacilityType.MEDIA_BUILDING
      ],
      [FacilityCategory.INFRASTRUCTURE]: [
        FacilityType.WATER_PLANT,
        FacilityType.POWER_PLANT,
        FacilityType.BASE_STATION
      ],
      [FacilityCategory.OTHER]: [
        FacilityType.FIRE_STATION,
        FacilityType.SCHOOL,
        FacilityType.HOSPITAL,
        FacilityType.PARK,
        FacilityType.CINEMA
      ]
    };

    return typeCategoryMap[category]?.includes(type) ?? false;
  }

  /**
   * Get default configuration data template for a facility type
   */
  static getDefaultConfigDataTemplate(facilityType: FacilityType): Record<string, any> {
    const templates: Record<FacilityType, Record<string, any>> = {
      // Raw Material Production
      [FacilityType.MINE]: {
        productionRate: 100,
        energyConsumption: 800,
        requiredWorkers: 50,
        environmentalImpact: 'high',
        specialRequirements: ['water_access', 'transport_link'],
        upgradeOptions: ['efficiency', 'capacity', 'safety']
      },
      [FacilityType.QUARRY]: {
        productionRate: 80,
        energyConsumption: 600,
        requiredWorkers: 40,
        environmentalImpact: 'high'
      },
      [FacilityType.FOREST]: {
        productionRate: 60,
        energyConsumption: 200,
        requiredWorkers: 30,
        environmentalImpact: 'medium'
      },
      [FacilityType.FARM]: {
        productionRate: 120,
        energyConsumption: 300,
        requiredWorkers: 25,
        environmentalImpact: 'low'
      },
      [FacilityType.RANCH]: {
        productionRate: 90,
        energyConsumption: 250,
        requiredWorkers: 20,
        environmentalImpact: 'low'
      },
      [FacilityType.FISHERY]: {
        productionRate: 70,
        energyConsumption: 150,
        requiredWorkers: 15,
        environmentalImpact: 'medium'
      },

      // Functional
      [FacilityType.FACTORY]: {
        productionRate: 200,
        energyConsumption: 1200,
        requiredWorkers: 100,
        environmentalImpact: 'high'
      },
      [FacilityType.MALL]: {
        serviceCapacity: 5000,
        energyConsumption: 800,
        requiredWorkers: 80,
        environmentalImpact: 'low'
      },
      [FacilityType.WAREHOUSE]: {
        storageCapacity: 10000,
        energyConsumption: 400,
        requiredWorkers: 30,
        environmentalImpact: 'low'
      },
      [FacilityType.MEDIA_BUILDING]: {
        broadcastRange: 100000,
        energyConsumption: 600,
        requiredWorkers: 40,
        environmentalImpact: 'low'
      },

      // Infrastructure
      [FacilityType.WATER_PLANT]: {
        serviceArea: 50000,
        energyConsumption: 1500,
        requiredWorkers: 30,
        environmentalImpact: 'positive',
        specialRequirements: ['water_source', 'distribution_network'],
        upgradeOptions: ['capacity', 'efficiency', 'automation']
      },
      [FacilityType.POWER_PLANT]: {
        powerOutput: 10000,
        energyConsumption: 0,
        requiredWorkers: 50,
        environmentalImpact: 'high'
      },
      [FacilityType.BASE_STATION]: {
        coverageArea: 25000,
        energyConsumption: 300,
        requiredWorkers: 10,
        environmentalImpact: 'low'
      },

      // Other
      [FacilityType.FIRE_STATION]: {
        responseArea: 20000,
        energyConsumption: 200,
        requiredWorkers: 25,
        environmentalImpact: 'positive'
      },
      [FacilityType.SCHOOL]: {
        studentCapacity: 1000,
        energyConsumption: 500,
        requiredWorkers: 60,
        environmentalImpact: 'positive'
      },
      [FacilityType.HOSPITAL]: {
        bedCapacity: 200,
        energyConsumption: 1000,
        requiredWorkers: 150,
        environmentalImpact: 'positive'
      },
      [FacilityType.PARK]: {
        visitorCapacity: 2000,
        energyConsumption: 100,
        requiredWorkers: 10,
        environmentalImpact: 'positive'
      },
      [FacilityType.CINEMA]: {
        seatCapacity: 300,
        energyConsumption: 400,
        requiredWorkers: 20,
        environmentalImpact: 'neutral'
      }
    };

    return templates[facilityType] || {};
  }

  // Formatting utilities
  static formatCurrency(value?: number): string {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  static formatCapacity(value?: number): string {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  }
}

export default FacilityConfigService; 