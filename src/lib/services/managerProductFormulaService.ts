import apiClient from '@/lib/http/api-client';
import {
  ManagerProductFormula,
  CreateManagerProductFormulaDto,
  UpdateManagerProductFormulaDto,
  ManagerProductFormulaSearchParams,
  ManagerProductFormulaSearchResponse,
  ApiResponse,
  CostCalculation,
  ManagerRawMaterial,
  ManagerCraftCategory,
  CloneManagerProductFormulaDto,
  ValidateFormulaDto,
  ValidateFormulaResponse,
  RawMaterialSearchParams,
  RawMaterialSearchResponse,
  CraftCategorySearchParams
} from '@/lib/types/managerProductFormula';

export class ManagerProductFormulaService {
  private static readonly BASE_PATH = '/user/manager/mto/formulas';
  private static readonly RAW_MATERIALS_PATH = '/user/manager/mto/raw-materials';
  private static readonly CRAFT_CATEGORIES_PATH = '/user/manager/mto/craft-categories';

  private static extractResponseData<T>(response: any): T {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data || response;
  }

  static async searchProductFormulas(
    params: ManagerProductFormulaSearchParams
  ): Promise<ManagerProductFormulaSearchResponse> {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      isLocked,
      sort = 'formulaNumber',
      order = 'desc'
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (searchTerm) queryParams.append('search', searchTerm);
    if (isLocked !== undefined) queryParams.append('isLocked', isLocked.toString());
    queryParams.append('sort', sort);
    queryParams.append('order', order);

    const response = await apiClient.get<ApiResponse<any>>(
      `${this.BASE_PATH}?${queryParams.toString()}`
    );

    const data = this.extractResponseData<any>(response);

    if (data?.data && Array.isArray(data.data)) {
      return {
        items: data.data,
        pagination: data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    }

    return {
      items: data?.items || [],
      pagination: data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    };
  }

  static async getProductFormulaById(id: number): Promise<ManagerProductFormula> {
    const response = await apiClient.get<ApiResponse<ManagerProductFormula>>(
      `${this.BASE_PATH}/${id}`
    );
    return this.extractResponseData<ManagerProductFormula>(response);
  }

  static async createProductFormula(
    data: CreateManagerProductFormulaDto
  ): Promise<ManagerProductFormula> {
    const response = await apiClient.post<ApiResponse<ManagerProductFormula>>(
      this.BASE_PATH,
      data
    );
    return this.extractResponseData<ManagerProductFormula>(response);
  }

  static async updateProductFormula(
    id: number,
    data: UpdateManagerProductFormulaDto
  ): Promise<ManagerProductFormula> {
    const response = await apiClient.put<ApiResponse<ManagerProductFormula>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return this.extractResponseData<ManagerProductFormula>(response);
  }

  static async deleteProductFormula(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  static async cloneProductFormula(
    id: number,
    data?: CloneManagerProductFormulaDto
  ): Promise<ManagerProductFormula> {
    const response = await apiClient.post<ApiResponse<ManagerProductFormula>>(
      `${this.BASE_PATH}/${id}/duplicate`,
      data || {}
    );
    return this.extractResponseData<ManagerProductFormula>(response);
  }

  static async validateFormula(
    id: number,
    data: ValidateFormulaDto
  ): Promise<ValidateFormulaResponse> {
    const response = await apiClient.post<ApiResponse<ValidateFormulaResponse>>(
      `${this.BASE_PATH}/${id}/validate`,
      data
    );
    return this.extractResponseData<ValidateFormulaResponse>(response);
  }

  static async searchRawMaterials(
    params: RawMaterialSearchParams = {}
  ): Promise<RawMaterialSearchResponse> {
    const {
      page = 1,
      limit = 50,
      search,
      origin,
      sortBy = 'materialNumber',
      sortOrder = 'asc'
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (origin) queryParams.append('origin', origin);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);

    const response = await apiClient.get<ApiResponse<any>>(
      `${this.RAW_MATERIALS_PATH}?${queryParams.toString()}`
    );

    const data = this.extractResponseData<any>(response);

    // Handle the nested structure from API response
    if (data?.materials && Array.isArray(data.materials)) {
      return {
        items: data.materials,
        pagination: data.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      };
    }

    // Fallback for other possible structures
    if (data?.data && Array.isArray(data.data)) {
      return {
        items: data.data,
        pagination: data.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      };
    }

    return {
      items: data?.items || [],
      pagination: data?.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      }
    };
  }

  static async getCraftCategories(
    params: CraftCategorySearchParams = {}
  ): Promise<ManagerCraftCategory[]> {
    const { categoryType, technologyLevel } = params;

    const queryParams = new URLSearchParams();
    if (categoryType) queryParams.append('categoryType', categoryType);
    if (technologyLevel) queryParams.append('technologyLevel', technologyLevel);
    // Get all craft categories
    queryParams.append('limit', '100');

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.CRAFT_CATEGORIES_PATH}?${queryString}`
      : this.CRAFT_CATEGORIES_PATH;

    const response = await apiClient.get<ApiResponse<any>>(url);
    const data = this.extractResponseData<any>(response);

    // Handle paginated response with items array
    if (data?.items && Array.isArray(data.items)) {
      return data.items;
    }

    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }

    if (data?.categories && Array.isArray(data.categories)) {
      return data.categories;
    }

    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }

    console.warn('Unexpected craft categories response structure:', data);
    return [];
  }

  static calculateCosts(
    materials: Array<{ rawMaterialId: number; quantity: number }>,
    craftCategories: Array<{ craftCategoryId: number }>,
    rawMaterialsData: ManagerRawMaterial[],
    craftCategoriesData: ManagerCraftCategory[]
  ): CostCalculation {
    let totalMaterialCost = 0;
    let totalSetupWaterCost = 0;
    let totalSetupPowerCost = 0;
    let totalSetupGoldCost = 0;
    let totalWaterPercent = 0;
    let totalPowerPercent = 0;
    let totalGoldPercent = 0;
    let productFormulaCarbonEmission = 0;

    materials.forEach(material => {
      const rawMaterial = rawMaterialsData.find(rm => rm.id === material.rawMaterialId);
      if (rawMaterial) {
        const materialCost = material.quantity * Number(rawMaterial.totalCost);
        totalMaterialCost += materialCost;
        productFormulaCarbonEmission += material.quantity * Number(rawMaterial.carbonEmission);
      }
    });

    craftCategories.forEach(cc => {
      const craftCategory = craftCategoriesData.find(c => c.id === cc.craftCategoryId);
      if (craftCategory) {
        totalSetupWaterCost += Number(craftCategory.fixedWaterCost);
        totalSetupPowerCost += Number(craftCategory.fixedPowerCost);
        totalSetupGoldCost += Number(craftCategory.fixedGoldCost);
        totalWaterPercent += Number(craftCategory.variableWaterPercent);
        totalPowerPercent += Number(craftCategory.variablePowerPercent);
        totalGoldPercent += Number(craftCategory.variableGoldPercent);
      }
    });

    const totalPercent = totalWaterPercent + totalPowerPercent + totalGoldPercent;
    productFormulaCarbonEmission = productFormulaCarbonEmission * (1 + totalPercent / 100);

    return {
      totalMaterialCost: Math.round(totalMaterialCost * 100) / 100,
      totalSetupWaterCost: Math.round(totalSetupWaterCost),
      totalSetupPowerCost: Math.round(totalSetupPowerCost),
      totalSetupGoldCost: Math.round(totalSetupGoldCost * 100) / 100,
      totalWaterPercent: Math.round(totalWaterPercent * 100) / 100,
      totalPowerPercent: Math.round(totalPowerPercent * 100) / 100,
      totalGoldPercent: Math.round(totalGoldPercent * 100) / 100,
      totalPercent: Math.round(totalPercent * 100) / 100,
      productFormulaCarbonEmission: Math.round(productFormulaCarbonEmission * 1000) / 1000
    };
  }
}

export default ManagerProductFormulaService;