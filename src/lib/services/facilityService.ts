import apiClient from '@/lib/http/api-client';

// Facility Types based on API documentation
export enum FacilityType {
  // Raw Material Production Facilities
  MINE = 'MINE',
  QUARRY = 'QUARRY',
  FOREST = 'FOREST',
  FARM = 'FARM',
  RANCH = 'RANCH',
  FISHERY = 'FISHERY',
  
  // Functional Facilities
  FACTORY = 'FACTORY',
  MALL = 'MALL',
  WAREHOUSE = 'WAREHOUSE',
  
  // Infrastructure
  WATER_PLANT = 'WATER_PLANT',
  POWER_PLANT = 'POWER_PLANT',
  BASE_STATION = 'BASE_STATION',
  
  // Other Facilities
  FIRE_STATION = 'FIRE_STATION',
  SCHOOL = 'SCHOOL',
  HOSPITAL = 'HOSPITAL',
  PARK = 'PARK',
  CINEMA = 'CINEMA',
}

export enum FacilityCategory {
  RAW_MATERIAL_PRODUCTION = 'RAW_MATERIAL_PRODUCTION',
  FUNCTIONAL = 'FUNCTIONAL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  OTHER = 'OTHER',
}

// Facility interface based on API documentation
export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  category: FacilityCategory;
  description?: string;
  capacity?: number;
  maintenanceCost?: number;
  buildCost?: number;
  operationCost?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Request interfaces
export interface CreateFacilityRequest {
  name: string;
  facilityType: FacilityType;
  category: FacilityCategory;
  description?: string;
  capacity?: number;
  maintenanceCost?: number;
  buildCost?: number;
  operationCost?: number;
}

export interface UpdateFacilityRequest {
  name?: string;
  facilityType?: FacilityType;
  category?: FacilityCategory;
  description?: string;
  capacity?: number;
  maintenanceCost?: number;
  buildCost?: number;
  operationCost?: number;
  isActive?: boolean;
}

export interface FacilitySearchParams {
  search?: string;
  facilityType?: FacilityType;
  category?: FacilityCategory;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response interfaces
export interface FacilitySearchResponse {
  data: Facility[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FacilityStatistics {
  totalFacilities: number;
  activeFacilities: number;
  inactiveFacilities: number;
  facilitiesByCategory: Record<FacilityCategory, number>;
  facilitiesByType: Record<FacilityType, number>;
}

export interface FacilityTypesByCategory {
  [FacilityCategory.RAW_MATERIAL_PRODUCTION]: FacilityType[];
  [FacilityCategory.FUNCTIONAL]: FacilityType[];
  [FacilityCategory.INFRASTRUCTURE]: FacilityType[];
  [FacilityCategory.OTHER]: FacilityType[];
}

// API Response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export class FacilityService {
  private static readonly BASE_PATH = '/facilities';

  /**
   * Helper method to extract data from API response wrapper
   */
  private static extractResponseData<T>(response: any): T {
    return response.data?.data || response.data;
  }

  // ==================== FACILITY MANAGEMENT ====================

  /**
   * Create a new facility
   */
  static async createFacility(facilityData: CreateFacilityRequest): Promise<Facility> {
    const response = await apiClient.post<ApiResponse<Facility>>(this.BASE_PATH, facilityData);
    return this.extractResponseData(response);
  }

  /**
   * Search facilities with pagination and filters
   */
  static async searchFacilities(params: FacilitySearchParams = {}): Promise<FacilitySearchResponse> {
    const {
      page = 1,
      pageSize = 20,
      search,
      facilityType,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize,
      sortBy,
      sortOrder
    };

    if (search) queryParams.search = search;
    if (facilityType) queryParams.facilityType = facilityType;
    if (category) queryParams.category = category;
    if (isActive !== undefined) queryParams.isActive = isActive;

    const response = await apiClient.get<ApiResponse<FacilitySearchResponse>>(
      `${this.BASE_PATH}/search`, 
      { params: queryParams }
    );
    
    return this.extractResponseData(response);
  }

  /**
   * Get facility statistics
   */
  static async getFacilityStatistics(): Promise<FacilityStatistics> {
    const response = await apiClient.get<ApiResponse<FacilityStatistics>>(`${this.BASE_PATH}/stats`);
    return this.extractResponseData(response);
  }

  /**
   * Get facility types organized by categories
   */
  static async getFacilityTypesByCategory(): Promise<FacilityTypesByCategory> {
    const response = await apiClient.get<ApiResponse<FacilityTypesByCategory>>(`${this.BASE_PATH}/types-by-category`);
    return this.extractResponseData(response);
  }

  /**
   * Get facilities by type
   */
  static async getFacilitiesByType(facilityType: FacilityType): Promise<Facility[]> {
    const response = await apiClient.get<ApiResponse<Facility[]>>(`${this.BASE_PATH}/by-type/${facilityType}`);
    return this.extractResponseData(response);
  }

  /**
   * Get facilities by category
   */
  static async getFacilitiesByCategory(category: FacilityCategory): Promise<Facility[]> {
    const response = await apiClient.get<ApiResponse<Facility[]>>(`${this.BASE_PATH}/by-category/${category}`);
    return this.extractResponseData(response);
  }

  /**
   * Get facility by ID
   */
  static async getFacilityById(id: string): Promise<Facility> {
    const response = await apiClient.get<ApiResponse<Facility>>(`${this.BASE_PATH}/${id}`);
    return this.extractResponseData(response);
  }

  /**
   * Update facility
   */
  static async updateFacility(id: string, facilityData: UpdateFacilityRequest): Promise<Facility> {
    const response = await apiClient.put<ApiResponse<Facility>>(`${this.BASE_PATH}/${id}`, facilityData);
    return this.extractResponseData(response);
  }

  /**
   * Toggle facility status (active/inactive)
   */
  static async toggleFacilityStatus(id: string): Promise<Facility> {
    const response = await apiClient.put<ApiResponse<Facility>>(`${this.BASE_PATH}/${id}/toggle-status`);
    return this.extractResponseData(response);
  }

  /**
   * Restore facility (undo soft delete)
   */
  static async restoreFacility(id: string): Promise<Facility> {
    const response = await apiClient.put<ApiResponse<Facility>>(`${this.BASE_PATH}/${id}/restore`);
    return this.extractResponseData(response);
  }

  /**
   * Delete facility (soft delete)
   */
  static async deleteFacility(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
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
   * Get human-readable category name
   */
  static getCategoryName(category: FacilityCategory): string {
    const categoryNames: Record<FacilityCategory, string> = {
      [FacilityCategory.RAW_MATERIAL_PRODUCTION]: 'Raw Material Production',
      [FacilityCategory.FUNCTIONAL]: 'Functional Facilities',
      [FacilityCategory.INFRASTRUCTURE]: 'Infrastructure',
      [FacilityCategory.OTHER]: 'Other Facilities',
    };
    return categoryNames[category] || category;
  }

  /**
   * Get facility types for a specific category
   */
  static getFacilityTypesForCategory(category: FacilityCategory): FacilityType[] {
    const typesByCategory: Record<FacilityCategory, FacilityType[]> = {
      [FacilityCategory.RAW_MATERIAL_PRODUCTION]: [
        FacilityType.MINE,
        FacilityType.QUARRY,
        FacilityType.FOREST,
        FacilityType.FARM,
        FacilityType.RANCH,
        FacilityType.FISHERY,
      ],
      [FacilityCategory.FUNCTIONAL]: [
        FacilityType.FACTORY,
        FacilityType.MALL,
        FacilityType.WAREHOUSE,
      ],
      [FacilityCategory.INFRASTRUCTURE]: [
        FacilityType.WATER_PLANT,
        FacilityType.POWER_PLANT,
        FacilityType.BASE_STATION,
      ],
      [FacilityCategory.OTHER]: [
        FacilityType.FIRE_STATION,
        FacilityType.SCHOOL,
        FacilityType.HOSPITAL,
        FacilityType.PARK,
        FacilityType.CINEMA,
      ],
    };
    return typesByCategory[category] || [];
  }

  /**
   * Validate facility type matches category
   */
  static validateTypeCategory(type: FacilityType, category: FacilityCategory): boolean {
    const validTypes = this.getFacilityTypesForCategory(category);
    return validTypes.includes(type);
  }

  /**
   * Format currency value
   */
  static formatCurrency(value?: number): string {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Format capacity value
   */
  static formatCapacity(value?: number): string {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  }
}

export default FacilityService; 