import apiClient from '@/lib/http/api-client';
import {
  PopulationHistoryResponse,
  PopulationHistoryQuery,
  TilePopulation,
  FacilityInfluence,
  TileInfluenceMap,
  PopulationChangeType
} from '@/types/population';

export class PopulationService {
  private static readonly BASE_PATH = '/population';

  static async getMyActivityPopulationHistory(
    query: PopulationHistoryQuery = {}
  ): Promise<PopulationHistoryResponse> {
    try {
      const {
        tileId,
        changeType,
        teamId,
        dateFrom,
        dateTo,
        sortBy = 'timestamp',
        sortOrder = 'desc',
        limit = 100,
        offset = 0
      } = query;

      const queryParams: Record<string, any> = {
        sortBy,
        sortOrder,
        limit,
        offset
      };

      if (tileId !== undefined) queryParams.tileId = tileId;
      if (changeType) queryParams.changeType = changeType;
      // teamId filter removed as per requirement
      // if (teamId) queryParams.teamId = teamId;
      if (dateFrom) queryParams.dateFrom = dateFrom;
      if (dateTo) queryParams.dateTo = dateTo;

      const response = await apiClient.get<{ success: boolean; data: PopulationHistoryResponse }>(
        `${this.BASE_PATH}/my-activity/history`,
        { params: queryParams }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('PopulationService.getMyActivityPopulationHistory error:', error);
      throw this.handleError(error);
    }
  }

  static async getTilePopulation(tileId: number, activityId?: string): Promise<TilePopulation> {
    try {
      const queryParams: Record<string, any> = {};
      if (activityId) queryParams.activityId = activityId;

      const response = await apiClient.get<{ success: boolean; data: TilePopulation }>(
        `${this.BASE_PATH}/tile/${tileId}`,
        { params: queryParams }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('PopulationService.getTilePopulation error:', error);
      throw this.handleError(error);
    }
  }

  static async getFacilityInfluence(facilityId: string): Promise<FacilityInfluence> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FacilityInfluence }>(
        `${this.BASE_PATH}/influence/${facilityId}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error('PopulationService.getFacilityInfluence error:', error);
      throw this.handleError(error);
    }
  }

  static async getTileInfluenceMap(tileId: number): Promise<TileInfluenceMap> {
    try {
      const response = await apiClient.get<{ success: boolean; data: TileInfluenceMap }>(
        `${this.BASE_PATH}/influence-map/${tileId}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error('PopulationService.getTileInfluenceMap error:', error);
      throw this.handleError(error);
    }
  }

  static formatPopulation(population: number): string {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(2)}M`;
    }
    if (population >= 1000) {
      return `${(population / 1000).toFixed(1)}K`;
    }
    return population.toLocaleString();
  }

  static formatChangeAmount(amount: number): string {
    const formatted = this.formatPopulation(Math.abs(amount));
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }

  static getChangeTypeLabel(type: PopulationChangeType, t?: any): string {
    // If translation function is provided, use it
    if (t) {
      const keys: Record<PopulationChangeType, string> = {
        [PopulationChangeType.SIPHON_EFFECT]: 'population.TYPE_SIPHON_EFFECT',
        [PopulationChangeType.SPILLOVER_EFFECT]: 'population.TYPE_SPILLOVER_EFFECT',
        [PopulationChangeType.PRODUCTION_FACILITY]: 'population.TYPE_PRODUCTION_FACILITY',
        [PopulationChangeType.GROWTH_FACILITY]: 'population.TYPE_GROWTH_FACILITY',
        [PopulationChangeType.INFRASTRUCTURE_CHANGE]: 'population.TYPE_INFRASTRUCTURE_CHANGE',
        [PopulationChangeType.MANUAL_ADJUSTMENT]: 'population.TYPE_MANUAL_ADJUSTMENT'
      };
      return t(keys[type] || type);
    }

    // Fallback to English labels
    const labels: Record<PopulationChangeType, string> = {
      [PopulationChangeType.SIPHON_EFFECT]: 'Siphon Effect',
      [PopulationChangeType.SPILLOVER_EFFECT]: 'Spillover Effect',
      [PopulationChangeType.PRODUCTION_FACILITY]: 'Production Facility',
      [PopulationChangeType.GROWTH_FACILITY]: 'Growth Facility',
      [PopulationChangeType.INFRASTRUCTURE_CHANGE]: 'Infrastructure Change',
      [PopulationChangeType.MANUAL_ADJUSTMENT]: 'Manual Adjustment'
    };
    return labels[type] || type;
  }

  static getChangeTypeColor(type: PopulationChangeType): string {
    const colors: Record<PopulationChangeType, string> = {
      [PopulationChangeType.SIPHON_EFFECT]: '#f44336',
      [PopulationChangeType.SPILLOVER_EFFECT]: '#4caf50',
      [PopulationChangeType.PRODUCTION_FACILITY]: '#2196f3',
      [PopulationChangeType.GROWTH_FACILITY]: '#9c27b0',
      [PopulationChangeType.INFRASTRUCTURE_CHANGE]: '#ff9800',
      [PopulationChangeType.MANUAL_ADJUSTMENT]: '#607d8b'
    };
    return colors[type] || '#9e9e9e';
  }

  private static handleError(error: any): Error {
    if (error.response?.data?.error) {
      const { code, message } = error.response.data.error;
      return new Error(message || code || 'Population operation failed');
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }

  static getErrorMessage(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

export default PopulationService;