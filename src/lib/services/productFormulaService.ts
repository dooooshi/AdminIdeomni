import apiClient from '@/lib/http/api-client';
import {
  ProductFormula,
  CreateProductFormulaDto,
  UpdateProductFormulaDto,
  ProductFormulaSearchParams,
  ProductFormulaSearchResponse,
  ApiResponse,
  CostCalculation,
  RawMaterial,
  CraftCategory
} from '@/lib/types/productFormula';

export class ProductFormulaService {
  private static readonly BASE_PATH = '/user/team/product-formulas';
  private static readonly RAW_MATERIALS_PATH = '/user/team/raw-materials';
  private static readonly CRAFT_CATEGORIES_PATH = '/user/team/craft-categories';

  private static extractResponseData<T>(response: any): T {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data || response;
  }

  static async searchProductFormulas(
    params: ProductFormulaSearchParams = {}
  ): Promise<ProductFormulaSearchResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      sort = 'formulaNumber',
      order = 'asc',
      isActive = true
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    queryParams.append('sort', sort);
    queryParams.append('order', order);
    queryParams.append('isActive', isActive.toString());

    const response = await apiClient.get<ApiResponse<any>>(
      `${this.BASE_PATH}?${queryParams.toString()}`
    );

    const data = this.extractResponseData<any>(response);
    
    // Handle nested data structure from API
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
    
    // Fallback to expected structure
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

  static async getProductFormulaById(id: number): Promise<ProductFormula> {
    const response = await apiClient.get<ApiResponse<ProductFormula>>(
      `${this.BASE_PATH}/${id}`
    );
    return this.extractResponseData<ProductFormula>(response);
  }

  static async createProductFormula(
    data: CreateProductFormulaDto
  ): Promise<ProductFormula> {
    const response = await apiClient.post<ApiResponse<ProductFormula>>(
      this.BASE_PATH,
      data
    );
    return this.extractResponseData<ProductFormula>(response);
  }

  static async updateProductFormula(
    id: number,
    data: UpdateProductFormulaDto
  ): Promise<ProductFormula> {
    const response = await apiClient.put<ApiResponse<ProductFormula>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return this.extractResponseData<ProductFormula>(response);
  }

  static async deleteProductFormula(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  static async getAllRawMaterials(params?: {
    origin?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<{ materials: RawMaterial[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.origin) queryParams.append('origin', params.origin);
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.RAW_MATERIALS_PATH}?${queryString}` : this.RAW_MATERIALS_PATH;
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    const data = this.extractResponseData<any>(response);
    
    // Handle nested data structure
    if (data?.data && Array.isArray(data.data)) {
      return {
        materials: data.data,
        pagination: data.pagination
      };
    }
    
    return {
      materials: data?.materials || [],
      pagination: data?.pagination || {}
    };
  }

  static async getAllCraftCategories(params?: {
    categoryType?: string;
    technologyLevel?: string;
    isActive?: boolean;
  }): Promise<{ categories: CraftCategory[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.categoryType) queryParams.append('categoryType', params.categoryType);
    if (params?.technologyLevel) {
      queryParams.append('technologyLevel', params.technologyLevel);
    }
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${this.CRAFT_CATEGORIES_PATH}?${queryString}` : this.CRAFT_CATEGORIES_PATH;
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    const data = this.extractResponseData<any>(response);
    
    // Handle different response structures
    // If data is already an array, use it directly
    if (Array.isArray(data)) {
      return {
        categories: data,
        pagination: {}
      };
    }
    
    // Handle nested data structure
    if (data?.data && Array.isArray(data.data)) {
      return {
        categories: data.data,
        pagination: data.pagination || {}
      };
    }
    
    return {
      categories: data?.categories || [],
      pagination: data?.pagination || {}
    };
  }

  static calculateFormulaCost(
    materials: Array<{ rawMaterialId: number; quantity: number; rawMaterial?: RawMaterial }>,
    craftCategories: Array<{ craftCategoryId: number; craftCategory?: CraftCategory }>
  ): CostCalculation {
    const totalMaterialCost = materials.reduce((sum, mat) => {
      const cost = mat.rawMaterial ? mat.rawMaterial.totalCost : 0;
      return sum + (mat.quantity * cost);
    }, 0);

    const setupCosts = craftCategories.reduce(
      (total, cc) => {
        // Handle both new nested structure and legacy flat structure
        if (cc.craftCategory?.costs) {
          return {
            water: total.water + (cc.craftCategory.costs.fixed.water || 0),
            power: total.power + (cc.craftCategory.costs.fixed.power || 0),
            gold: total.gold + (cc.craftCategory.costs.fixed.gold || 0)
          };
        } else {
          return {
            water: total.water + (cc.craftCategory?.fixedWaterCost || 0),
            power: total.power + (cc.craftCategory?.fixedPowerCost || 0),
            gold: total.gold + (cc.craftCategory?.fixedGoldCost || 0)
          };
        }
      },
      { water: 0, power: 0, gold: 0 }
    );

    const variablePercents = craftCategories.reduce(
      (total, cc) => {
        // Handle both new nested structure and legacy flat structure
        if (cc.craftCategory?.costs) {
          return {
            waterPercent: total.waterPercent + (cc.craftCategory.costs.variable.water || 0),
            powerPercent: total.powerPercent + (cc.craftCategory.costs.variable.power || 0),
            goldPercent: total.goldPercent + (cc.craftCategory.costs.variable.gold || 0)
          };
        } else {
          return {
            waterPercent: total.waterPercent + (cc.craftCategory?.variableWaterPercent || 0),
            powerPercent: total.powerPercent + (cc.craftCategory?.variablePowerPercent || 0),
            goldPercent: total.goldPercent + (cc.craftCategory?.variableGoldPercent || 0)
          };
        }
      },
      { waterPercent: 0, powerPercent: 0, goldPercent: 0 }
    );

    const totalPercent = 
      variablePercents.waterPercent + 
      variablePercents.powerPercent + 
      variablePercents.goldPercent;

    const baseCarbonEmission = materials.reduce((sum, mat) => {
      const emission = mat.rawMaterial?.carbonEmission || 0;
      return sum + (mat.quantity * emission);
    }, 0);

    const carbonEmission = baseCarbonEmission * (1 + totalPercent / 100);

    const waterCost = Math.ceil(
      setupCosts.water + (totalMaterialCost * variablePercents.waterPercent / 100)
    );
    const powerCost = Math.ceil(
      setupCosts.power + (totalMaterialCost * variablePercents.powerPercent / 100)
    );
    const goldCost = 
      setupCosts.gold + (totalMaterialCost * variablePercents.goldPercent / 100);

    return {
      waterCost,
      powerCost,
      goldCost,
      carbonEmission,
      totalMaterialCost
    };
  }

  static validateFormula(data: CreateProductFormulaDto): string[] {
    const errors: string[] = [];

    if (!data.productName || data.productName.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (data.productName && data.productName.length > 200) {
      errors.push('Product name must be less than 200 characters');
    }

    if (data.materials.length < 1 || data.materials.length > 99) {
      errors.push('Formula must have 1-99 material types');
    }

    const materialIds = data.materials.map(m => m.rawMaterialId);
    if (new Set(materialIds).size !== materialIds.length) {
      errors.push('Formula cannot have duplicate materials');
    }

    data.materials.forEach((mat, index) => {
      if (mat.quantity < 0.001 || mat.quantity > 999.999) {
        errors.push(`Material ${index + 1} quantity must be between 0.001 and 999.999`);
      }
    });

    if (data.craftCategories.length < 1) {
      errors.push('At least one craft category is required');
    }

    return errors;
  }

  static async duplicateFormula(id: number): Promise<ProductFormula> {
    const original = await this.getProductFormulaById(id);
    
    const newFormula: CreateProductFormulaDto = {
      productName: `${original.productName || 'Product'} (Copy)`,
      productDescription: `${original.productDescription || ''} (Copy)`,
      materials: original.materials.map(m => ({
        rawMaterialId: m.rawMaterialId,
        quantity: m.quantity
      })),
      craftCategories: original.craftCategories.map(cc => ({
        craftCategoryId: cc.craftCategoryId
      }))
    };

    return this.createProductFormula(newFormula);
  }
}

export default ProductFormulaService;