import apiClient from '@/lib/http/api-client';
import {
  CraftCategory,
  CraftCategoryType,
  TechnologyLevel,
  CreateCraftCategoryRequest,
  UpdateCraftCategoryRequest,
  CraftCategorySearchParams,
  CraftCategorySearchResponse,
  CraftCategoryStatistics,
  CraftCategoryComparison,
  ProductionCostCalculation
} from '@/types/craftCategory';

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

// Error response interface
interface ApiErrorResponse {
  success: false;
  businessCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
  path: string;
}

export class CraftCategoryService {
  private static readonly BASE_PATH = '/craft-categories';
  private static readonly ADMIN_BASE_PATH = '/admin/craft-categories';

  // Helper method to extract data from API response
  private static extractResponseData<T>(response: any): T {
    if (response?.data?.success && response?.data?.data) {
      return response.data.data;
    }
    return response?.data || response;
  }

  // Admin endpoints

  /**
   * Get all craft categories with pagination and filters
   */
  static async searchCraftCategories(params: CraftCategorySearchParams = {}): Promise<CraftCategorySearchResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.categoryType) searchParams.append('categoryType', params.categoryType);
    if (params.technologyLevel) searchParams.append('technologyLevel', params.technologyLevel);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.order) searchParams.append('order', params.order);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.search) searchParams.append('search', params.search);

    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}?${searchParams.toString()}`
    );
    
    // Extract the nested data structure from the response
    const responseData = response?.data?.data?.data || response?.data?.data || response?.data;
    
    // Convert string numbers to actual numbers for cost fields
    if (responseData?.items) {
      responseData.items = responseData.items.map((item: any) => ({
        ...item,
        fixedWaterCost: parseFloat(item.fixedWaterCost) || 0,
        fixedPowerCost: parseFloat(item.fixedPowerCost) || 0,
        fixedGoldCost: parseFloat(item.fixedGoldCost) || 0,
        variableWaterPercent: parseFloat(item.variableWaterPercent) || 0,
        variablePowerPercent: parseFloat(item.variablePowerPercent) || 0,
        variableGoldPercent: parseFloat(item.variableGoldPercent) || 0,
        yieldPercentage: parseFloat(item.yieldPercentage) || 0
      }));
    }
    
    return responseData;
  }

  /**
   * Get a single craft category by ID
   */
  static async getCraftCategoryById(id: number): Promise<CraftCategory> {
    const response = await apiClient.get(
      `${this.ADMIN_BASE_PATH}/${id}`
    );
    
    // Extract the nested data and convert string numbers
    const data = response?.data?.data?.data || response?.data?.data || response?.data;
    
    if (data) {
      return {
        ...data,
        fixedWaterCost: parseFloat(data.fixedWaterCost) || 0,
        fixedPowerCost: parseFloat(data.fixedPowerCost) || 0,
        fixedGoldCost: parseFloat(data.fixedGoldCost) || 0,
        variableWaterPercent: parseFloat(data.variableWaterPercent) || 0,
        variablePowerPercent: parseFloat(data.variablePowerPercent) || 0,
        variableGoldPercent: parseFloat(data.variableGoldPercent) || 0,
        yieldPercentage: parseFloat(data.yieldPercentage) || 0
      };
    }
    
    return data;
  }

  /**
   * Create a new craft category
   */
  static async createCraftCategory(data: CreateCraftCategoryRequest): Promise<CraftCategory> {
    const response = await apiClient.post(
      this.ADMIN_BASE_PATH,
      data
    );
    
    const responseData = response?.data?.data?.data || response?.data?.data || response?.data;
    
    if (responseData) {
      return {
        ...responseData,
        fixedWaterCost: parseFloat(responseData.fixedWaterCost) || 0,
        fixedPowerCost: parseFloat(responseData.fixedPowerCost) || 0,
        fixedGoldCost: parseFloat(responseData.fixedGoldCost) || 0,
        variableWaterPercent: parseFloat(responseData.variableWaterPercent) || 0,
        variablePowerPercent: parseFloat(responseData.variablePowerPercent) || 0,
        variableGoldPercent: parseFloat(responseData.variableGoldPercent) || 0,
        yieldPercentage: parseFloat(responseData.yieldPercentage) || 0
      };
    }
    
    return responseData;
  }

  /**
   * Update an existing craft category
   */
  static async updateCraftCategory(id: number, data: UpdateCraftCategoryRequest): Promise<CraftCategory> {
    const response = await apiClient.put(
      `${this.ADMIN_BASE_PATH}/${id}`,
      data
    );
    
    const responseData = response?.data?.data?.data || response?.data?.data || response?.data;
    
    if (responseData) {
      return {
        ...responseData,
        fixedWaterCost: parseFloat(responseData.fixedWaterCost) || 0,
        fixedPowerCost: parseFloat(responseData.fixedPowerCost) || 0,
        fixedGoldCost: parseFloat(responseData.fixedGoldCost) || 0,
        variableWaterPercent: parseFloat(responseData.variableWaterPercent) || 0,
        variablePowerPercent: parseFloat(responseData.variablePowerPercent) || 0,
        variableGoldPercent: parseFloat(responseData.variableGoldPercent) || 0,
        yieldPercentage: parseFloat(responseData.yieldPercentage) || 0
      };
    }
    
    return responseData;
  }

  /**
   * Partially update a craft category
   */
  static async patchCraftCategory(id: number, data: Partial<UpdateCraftCategoryRequest>): Promise<CraftCategory> {
    const response = await apiClient.patch(
      `${this.ADMIN_BASE_PATH}/${id}`,
      data
    );
    
    const responseData = response?.data?.data?.data || response?.data?.data || response?.data;
    
    if (responseData) {
      return {
        ...responseData,
        fixedWaterCost: parseFloat(responseData.fixedWaterCost) || 0,
        fixedPowerCost: parseFloat(responseData.fixedPowerCost) || 0,
        fixedGoldCost: parseFloat(responseData.fixedGoldCost) || 0,
        variableWaterPercent: parseFloat(responseData.variableWaterPercent) || 0,
        variablePowerPercent: parseFloat(responseData.variablePowerPercent) || 0,
        variableGoldPercent: parseFloat(responseData.variableGoldPercent) || 0,
        yieldPercentage: parseFloat(responseData.yieldPercentage) || 0
      };
    }
    
    return responseData;
  }

  /**
   * Delete a craft category (soft delete)
   */
  static async deleteCraftCategory(id: number): Promise<void> {
    await apiClient.delete(`${this.ADMIN_BASE_PATH}/${id}`);
  }

  /**
   * Bulk import craft categories from CSV
   */
  static async bulkImportCraftCategories(file: File, overwrite: boolean = false): Promise<{
    imported: number;
    updated: number;
    failed: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwrite', overwrite.toString());

    const response = await apiClient.post<ApiResponse<{
      imported: number;
      updated: number;
      failed: number;
      errors: string[];
    }>>(
      `${this.ADMIN_BASE_PATH}/bulk-import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return this.extractResponseData(response);
  }

  /**
   * Get cost analysis for craft categories
   */
  static async getCostAnalysis(categoryIds?: number[]): Promise<any> {
    const params = categoryIds ? `?ids=${categoryIds.join(',')}` : '';
    const response = await apiClient.get<ApiResponse<any>>(
      `${this.ADMIN_BASE_PATH}/cost-analysis${params}`
    );
    
    return this.extractResponseData(response);
  }

  /**
   * Get craft category statistics
   */
  static async getCraftCategoryStatistics(): Promise<CraftCategoryStatistics> {
    const response = await apiClient.get<ApiResponse<CraftCategoryStatistics>>(
      `${this.ADMIN_BASE_PATH}/statistics`
    );
    
    return this.extractResponseData<CraftCategoryStatistics>(response);
  }

  // User endpoints

  /**
   * Get available craft categories for users
   */
  static async getAvailableCraftCategories(params?: {
    categoryType?: CraftCategoryType;
    technologyLevel?: TechnologyLevel;
    maxGoldCost?: number;
    minYield?: number;
  }): Promise<CraftCategory[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.categoryType) searchParams.append('categoryType', params.categoryType);
    if (params?.technologyLevel) searchParams.append('technologyLevel', params.technologyLevel);
    if (params?.maxGoldCost) searchParams.append('maxGoldCost', params.maxGoldCost.toString());
    if (params?.minYield) searchParams.append('minYield', params.minYield.toString());

    const response = await apiClient.get<ApiResponse<CraftCategory[]>>(
      `${this.BASE_PATH}?${searchParams.toString()}`
    );
    
    return this.extractResponseData<CraftCategory[]>(response);
  }

  /**
   * Compare multiple craft categories
   */
  static async compareCraftCategories(ids: number[]): Promise<CraftCategoryComparison> {
    const response = await apiClient.get<ApiResponse<CraftCategory[]>>(
      `${this.BASE_PATH}/compare?ids=${ids.join(',')}`
    );
    
    const categories = this.extractResponseData<CraftCategory[]>(response);
    
    // Calculate comparison metrics
    const comparison: CraftCategoryComparison = {
      categories,
      maxValues: {
        fixedWaterCost: Math.max(...categories.map(c => c.fixedWaterCost)),
        fixedPowerCost: Math.max(...categories.map(c => c.fixedPowerCost)),
        fixedGoldCost: Math.max(...categories.map(c => c.fixedGoldCost)),
        variableWaterPercent: Math.max(...categories.map(c => c.variableWaterPercent)),
        variablePowerPercent: Math.max(...categories.map(c => c.variablePowerPercent)),
        variableGoldPercent: Math.max(...categories.map(c => c.variableGoldPercent)),
        yieldPercentage: Math.max(...categories.map(c => c.yieldPercentage))
      },
      minValues: {
        fixedWaterCost: Math.min(...categories.map(c => c.fixedWaterCost)),
        fixedPowerCost: Math.min(...categories.map(c => c.fixedPowerCost)),
        fixedGoldCost: Math.min(...categories.map(c => c.fixedGoldCost)),
        variableWaterPercent: Math.min(...categories.map(c => c.variableWaterPercent)),
        variablePowerPercent: Math.min(...categories.map(c => c.variablePowerPercent)),
        variableGoldPercent: Math.min(...categories.map(c => c.variableGoldPercent)),
        yieldPercentage: Math.min(...categories.map(c => c.yieldPercentage))
      }
    };
    
    return comparison;
  }

  /**
   * Calculate production costs for a craft category
   */
  static async calculateProductionCost(
    craftCategoryId: number,
    productionVolume: number
  ): Promise<ProductionCostCalculation> {
    const category = await this.getCraftCategoryById(craftCategoryId);
    
    // Calculate fixed costs
    const fixedCosts = {
      water: category.fixedWaterCost,
      power: category.fixedPowerCost,
      gold: category.fixedGoldCost,
      total: category.fixedWaterCost + category.fixedPowerCost + category.fixedGoldCost
    };
    
    // Calculate variable costs based on production volume
    const variableCosts = {
      water: (category.variableWaterPercent / 100) * productionVolume,
      power: (category.variablePowerPercent / 100) * productionVolume,
      gold: (category.variableGoldPercent / 100) * productionVolume,
      total: 0
    };
    variableCosts.total = variableCosts.water + variableCosts.power + variableCosts.gold;
    
    // Calculate total cost and yield
    const totalCost = fixedCosts.total + variableCosts.total;
    const expectedYield = (category.yieldPercentage / 100) * productionVolume;
    const costPerUnit = expectedYield > 0 ? totalCost / expectedYield : 0;
    
    return {
      craftCategoryId,
      productionVolume,
      fixedCosts,
      variableCosts,
      totalCost,
      expectedYield,
      costPerUnit
    };
  }

  /**
   * Initialize default craft categories from CSV data
   */
  static async initializeDefaultCategories(): Promise<{
    success: boolean;
    message: string;
    imported: number;
  }> {
    const response = await apiClient.post<ApiResponse<{
      success: boolean;
      message: string;
      imported: number;
    }>>(
      `${this.ADMIN_BASE_PATH}/initialize`
    );
    
    return this.extractResponseData(response);
  }

  /**
   * Restore a deleted craft category
   */
  static async restoreCraftCategory(id: number): Promise<CraftCategory> {
    const response = await apiClient.post<ApiResponse<CraftCategory>>(
      `${this.ADMIN_BASE_PATH}/${id}/restore`
    );
    
    return this.extractResponseData<CraftCategory>(response);
  }

  /**
   * Toggle active status of a craft category
   */
  static async toggleCraftCategoryStatus(id: number): Promise<CraftCategory> {
    const response = await apiClient.patch(
      `${this.ADMIN_BASE_PATH}/${id}/toggle-status`
    );
    
    const responseData = response?.data?.data?.data || response?.data?.data || response?.data;
    
    if (responseData) {
      return {
        ...responseData,
        fixedWaterCost: parseFloat(responseData.fixedWaterCost) || 0,
        fixedPowerCost: parseFloat(responseData.fixedPowerCost) || 0,
        fixedGoldCost: parseFloat(responseData.fixedGoldCost) || 0,
        variableWaterPercent: parseFloat(responseData.variableWaterPercent) || 0,
        variablePowerPercent: parseFloat(responseData.variablePowerPercent) || 0,
        variableGoldPercent: parseFloat(responseData.variableGoldPercent) || 0,
        yieldPercentage: parseFloat(responseData.yieldPercentage) || 0
      };
    }
    
    return responseData;
  }

  /**
   * Validate craft category data before submission
   */
  static validateCraftCategoryData(data: Partial<CreateCraftCategoryRequest>): string[] {
    const errors: string[] = [];
    
    // Validate yield percentage
    if (data.yieldPercentage !== undefined) {
      if (data.yieldPercentage < 50 || data.yieldPercentage > 100) {
        errors.push('Yield percentage must be between 50 and 100');
      }
    }
    
    // Validate variable percentages
    const percentFields = ['variableWaterPercent', 'variablePowerPercent', 'variableGoldPercent'];
    percentFields.forEach(field => {
      const value = (data as any)[field];
      if (value !== undefined) {
        if (value < 0 || value > 100) {
          errors.push(`${field} must be between 0 and 100`);
        }
      }
    });
    
    // Validate cost values
    const costFields = ['fixedWaterCost', 'fixedPowerCost', 'fixedGoldCost'];
    costFields.forEach(field => {
      const value = (data as any)[field];
      if (value !== undefined) {
        if (value < 0) {
          errors.push(`${field} must be a positive number`);
        }
      }
    });
    
    return errors;
  }
}

export default CraftCategoryService;