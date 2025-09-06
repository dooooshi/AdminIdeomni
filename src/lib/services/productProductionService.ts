import apiClient from '@/lib/http/api-client';
import {
  Factory,
  FactoryListResponse,
  CalculateCostRequest,
  CostCalculationResponse,
  ProductionRequest,
  ProductionResponse,
  HistoryParams,
  HistoryResponse,
  ApiResponse
} from '@/lib/types/productProduction';

export class ProductProductionService {
  private static readonly BASE_PATH = '/user/product-production';

  // Removed extractResponseData - now returning response.data directly in each method

  /**
   * Get available factories for production
   */
  static async getFactories(): Promise<any> {
    try {
      const response = await apiClient.get<any>(
        `${this.BASE_PATH}/factories`
      );
      
      // The API returns the full response with data at top level
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch factories:', error);
      throw error;
    }
  }

  /**
   * Calculate production cost
   */
  static async calculateCost(request: CalculateCostRequest): Promise<any> {
    try {
      const response = await apiClient.post<any>(
        `${this.BASE_PATH}/calculate-cost`,
        request
      );
      
      // The API returns the full response with data at top level
      return response.data || response;
    } catch (error) {
      console.error('Failed to calculate cost:', error);
      throw error;
    }
  }

  /**
   * Execute production
   */
  static async executeProduction(request: ProductionRequest): Promise<any> {
    try {
      const response = await apiClient.post<any>(
        `${this.BASE_PATH}/produce`,
        request
      );
      
      // The API returns the full response with data at top level
      return response.data || response;
    } catch (error) {
      console.error('Failed to execute production:', error);
      throw error;
    }
  }

  /**
   * Get production history
   */
  static async getHistory(params: HistoryParams = {}): Promise<any> {
    try {
      const {
        factoryId,
        formulaId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = params;

      const queryParams = new URLSearchParams();
      if (factoryId) queryParams.append('factoryId', factoryId);
      if (formulaId) queryParams.append('formulaId', formulaId.toString());
      if (status) queryParams.append('status', status);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await apiClient.get<any>(
        `${this.BASE_PATH}/history?${queryParams.toString()}`
      );
      
      // The API returns the full response with data at top level
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch production history:', error);
      throw error;
    }
  }

  /**
   * Get production summary statistics
   */
  static async getProductionStats(): Promise<{
    activeProductions: number;
    todayOutput: number;
    resourceUsage: {
      water: number;
      power: number;
      gold: number;
    };
    successRate: number;
  }> {
    try {
      // Get today's history for stats
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const response = await this.getHistory({
        startDate,
        endDate,
        limit: 100
      });

      if (!response.data) {
        return {
          activeProductions: 0,
          todayOutput: 0,
          resourceUsage: { water: 0, power: 0, gold: 0 },
          successRate: 0
        };
      }

      const { summary, history } = response.data;
      
      // Calculate resource usage from history
      const resourceUsage = history.reduce((acc, item) => ({
        water: acc.water + item.resources.waterConsumed,
        power: acc.power + item.resources.powerConsumed,
        gold: acc.gold + item.costs.gold
      }), { water: 0, power: 0, gold: 0 });

      return {
        activeProductions: history.filter(h => h.status === 'PROCESSING').length,
        todayOutput: summary.totalQuantityProduced || 0,
        resourceUsage,
        successRate: summary.totalProductions > 0 
          ? (summary.successfulProductions / summary.totalProductions) * 100
          : 0
      };
    } catch (error) {
      console.error('Failed to fetch production stats:', error);
      return {
        activeProductions: 0,
        todayOutput: 0,
        resourceUsage: { water: 0, power: 0, gold: 0 },
        successRate: 0
      };
    }
  }

  /**
   * Check if a formula can be produced in a factory
   */
  static async checkProductionCapability(
    factoryId: string, 
    formulaId: number
  ): Promise<{
    canProduce: boolean;
    maxQuantity: number;
    missingMaterials: Array<{
      materialId: string;
      materialName: string;
      shortage: number;
    }>;
  }> {
    try {
      // Get factory details
      const factoriesResponse = await this.getFactories();
      const factory = factoriesResponse.data?.factories.find(f => f.id === factoryId);
      
      if (!factory || !factory.productionCapability) {
        return {
          canProduce: false,
          maxQuantity: 0,
          missingMaterials: []
        };
      }

      return {
        canProduce: factory.productionCapability.canProduce,
        maxQuantity: factory.productionCapability.maxQuantity,
        missingMaterials: factory.productionCapability.missingMaterials || []
      };
    } catch (error) {
      console.error('Failed to check production capability:', error);
      return {
        canProduce: false,
        maxQuantity: 0,
        missingMaterials: []
      };
    }
  }
}

export default ProductProductionService;