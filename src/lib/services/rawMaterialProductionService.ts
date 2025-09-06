// Raw Material Production Service
import apiClient from '@/lib/http/api-client';
import {
  ProductionRequest,
  ProductionResult,
  ProductionEstimate,
  ProductionHistoryFilter,
  RawMaterial,
  RawMaterialFilter
} from '@/types/rawMaterialProduction';

export class RawMaterialProductionService {
  private static instance: RawMaterialProductionService;

  private constructor() {}

  static getInstance(): RawMaterialProductionService {
    if (!RawMaterialProductionService.instance) {
      RawMaterialProductionService.instance = new RawMaterialProductionService();
    }
    return RawMaterialProductionService.instance;
  }

  async produceRawMaterial(
    request: ProductionRequest, 
    material?: RawMaterial
  ): Promise<ProductionResult> {
    try {
      // Simply call the production API endpoint
      // The backend handles everything: validation, resource consumption, inventory update
      const response = await apiClient.post('/facility/production/produce', {
        facilityId: request.facilityId,
        rawMaterialId: request.rawMaterialId,
        quantity: request.quantity
      });

      return response.data;
    } catch (error: any) {
      // If it's an API error with a response, return it as is
      if (error.businessCode) {
        return {
          success: false,
          businessCode: error.businessCode,
          message: error.message || 'Production failed',
          error: error.message
        };
      }
      
      // Otherwise return a generic error
      return {
        success: false,
        businessCode: 5001,
        message: 'Production failed',
        error: error.message || 'Unknown error'
      };
    }
  }

  async estimateProduction(
    request: ProductionRequest, 
    material?: RawMaterial,
    facilityData?: any
  ): Promise<ProductionEstimate> {
    try {
      // Use provided material data or fetch if not provided
      if (!material) {
        material = await this.getMaterial(request.rawMaterialId);
      }
      
      const waterNeeded = (material.requirements?.water || material.waterRequired || 0) * request.quantity;
      const powerNeeded = (material.requirements?.power || material.powerRequired || 0) * request.quantity;
      const spaceNeeded = material.carbonEmission * request.quantity;
      
      // Calculate costs with infrastructure pricing if available
      const waterUnitPrice = facilityData?.infrastructure?.waterUnitPrice || 0;
      const powerUnitPrice = facilityData?.infrastructure?.powerUnitPrice || 0;
      
      const waterCost = waterNeeded * waterUnitPrice;
      const powerCost = powerNeeded * powerUnitPrice;
      const goldCost = (material.requirements?.gold || material.goldCost || 0) * request.quantity;
      const totalCost = material.totalCost * request.quantity + waterCost + powerCost;
      
      // Just return a simple estimate without validation
      // Backend will handle all validation
      return {
        feasible: true, // Assume feasible, backend will validate
        issues: [],
        requirements: {
          water: {
            needed: waterNeeded,
            available: true,
            unitPrice: waterUnitPrice,
            totalCost: waterCost,
            provider: undefined
          },
          power: {
            needed: powerNeeded,
            available: true,
            unitPrice: powerUnitPrice,
            totalCost: powerCost,
            provider: undefined
          },
          space: {
            needed: spaceNeeded,
            available: 999999, // Unknown, backend will check
            sufficient: true
          },
          funds: {
            needed: totalCost,
            available: 999999, // Unknown, backend will check
            sufficient: true
          }
        },
        costs: {
          waterCost,
          powerCost,
          materialBaseCost: goldCost,
          totalCost,
          costPerUnit: totalCost / request.quantity
        }
      };
    } catch (error: any) {
      return {
        feasible: false,
        issues: [error.message],
        requirements: {
          water: { needed: 0, available: false, unitPrice: 0, totalCost: 0 },
          power: { needed: 0, available: false, unitPrice: 0, totalCost: 0 },
          space: { needed: 0, available: 0, sufficient: false },
          funds: { needed: 0, available: 0, sufficient: false }
        },
        costs: {
          waterCost: 0,
          powerCost: 0,
          materialBaseCost: 0,
          totalCost: 0
        }
      };
    }
  }

  async getProductionHistory(filter: ProductionHistoryFilter): Promise<any> {
    // Call the production history endpoint
    const response = await apiClient.get('/facility/production', {
      params: Object.entries(filter)
        .filter(([_, v]) => v !== undefined)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
    });

    return response.data;
  }

  async getRawMaterials(filter?: RawMaterialFilter): Promise<any> {
    const params = filter ? Object.entries(filter)
      .filter(([_, v]) => v !== undefined)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) : {};

    const response = await apiClient.get('/facility/raw-materials', { params });

    return response.data;
  }

  async getMaterial(materialId: number): Promise<RawMaterial> {
    const response = await apiClient.get(`/facility/raw-materials/${materialId}`);
    return response.data.data;
  }

}

export default RawMaterialProductionService.getInstance();