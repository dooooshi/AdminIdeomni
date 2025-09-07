import apiClient from '@/lib/http/api-client';
import {
  TransportationConfig,
  CreateTransportationConfigDto,
  UpdateTransportationConfigDto,
  TransportationStatistics,
  TransportationConfigResponse,
  TransportationConfigListResponse,
  DEFAULT_TRANSPORTATION_CONFIG
} from '@/types/transportation';

export class TransportationConfigService {
  private static readonly BASE_PATH = '/admin/transportation-configs';

  private static extractResponseData<T>(response: { data: { data?: { data?: T } | T } | T }): T {
    const data = response.data;
    if (typeof data === 'object' && data !== null && 'data' in data) {
      const innerData = (data as { data: unknown }).data;
      if (typeof innerData === 'object' && innerData !== null && 'data' in innerData) {
        return (innerData as { data: T }).data;
      }
      return innerData as T;
    }
    return data as T;
  }

  static async createConfig(
    templateId: number,
    configData: CreateTransportationConfigDto
  ): Promise<TransportationConfig> {
    const response = await apiClient.post<TransportationConfigResponse>(
      `${this.BASE_PATH}`,
      { ...configData, templateId }
    );
    return this.extractResponseData<TransportationConfig>(response);
  }

  static async getConfig(templateId: number): Promise<TransportationConfig> {
    const response = await apiClient.get<TransportationConfigResponse>(
      `${this.BASE_PATH}/${templateId}`
    );
    return this.extractResponseData<TransportationConfig>(response);
  }

  static async updateConfig(
    configId: string,
    configData: UpdateTransportationConfigDto
  ): Promise<TransportationConfig> {
    // Filter out fields that shouldn't be sent in update request
    const { 
      tierABaseCost,
      tierAEmissionRate,
      tierAMinDistance,
      tierAMaxDistance,
      tierASpaceBasis,
      tierAEnabled,
      tierBBaseCost,
      tierBEmissionRate,
      tierBMinDistance,
      tierBMaxDistance,
      tierBSpaceBasis,
      tierBEnabled,
      tierCBaseCost,
      tierCEmissionRate,
      tierCMinDistance,
      tierCMaxDistance,
      tierCSpaceBasis,
      tierCEnabled,
      tierDBaseCost,
      tierDEmissionRate,
      tierDMinDistance,
      tierDSpaceBasis,
      tierDEnabled,
      enableCrossTeamTransfers,
      maxTransferQuantity,
      transferCooldownMinutes,
      distanceAMax,
      distanceBMax,
      distanceCMax,
      description
    } = configData;
    
    const cleanedData: UpdateTransportationConfigDto = {
      ...(tierABaseCost !== undefined && { tierABaseCost }),
      ...(tierAEmissionRate !== undefined && { tierAEmissionRate }),
      ...(tierAMinDistance !== undefined && { tierAMinDistance }),
      ...(tierAMaxDistance !== undefined && { tierAMaxDistance }),
      ...(tierASpaceBasis !== undefined && { tierASpaceBasis }),
      ...(tierAEnabled !== undefined && { tierAEnabled }),
      ...(tierBBaseCost !== undefined && { tierBBaseCost }),
      ...(tierBEmissionRate !== undefined && { tierBEmissionRate }),
      ...(tierBMinDistance !== undefined && { tierBMinDistance }),
      ...(tierBMaxDistance !== undefined && { tierBMaxDistance }),
      ...(tierBSpaceBasis !== undefined && { tierBSpaceBasis }),
      ...(tierBEnabled !== undefined && { tierBEnabled }),
      ...(tierCBaseCost !== undefined && { tierCBaseCost }),
      ...(tierCEmissionRate !== undefined && { tierCEmissionRate }),
      ...(tierCMinDistance !== undefined && { tierCMinDistance }),
      ...(tierCMaxDistance !== undefined && { tierCMaxDistance }),
      ...(tierCSpaceBasis !== undefined && { tierCSpaceBasis }),
      ...(tierCEnabled !== undefined && { tierCEnabled }),
      ...(tierDBaseCost !== undefined && { tierDBaseCost }),
      ...(tierDEmissionRate !== undefined && { tierDEmissionRate }),
      ...(tierDMinDistance !== undefined && { tierDMinDistance }),
      ...(tierDSpaceBasis !== undefined && { tierDSpaceBasis }),
      ...(tierDEnabled !== undefined && { tierDEnabled }),
      ...(enableCrossTeamTransfers !== undefined && { enableCrossTeamTransfers }),
      ...(maxTransferQuantity !== undefined && { maxTransferQuantity }),
      ...(transferCooldownMinutes !== undefined && { transferCooldownMinutes }),
      ...(distanceAMax !== undefined && { distanceAMax }),
      ...(distanceBMax !== undefined && { distanceBMax }),
      ...(distanceCMax !== undefined && { distanceCMax }),
      ...(description !== undefined && { description })
    };
    
    const response = await apiClient.put<TransportationConfigResponse>(
      `${this.BASE_PATH}/${configId}`,
      cleanedData
    );
    return this.extractResponseData<TransportationConfig>(response);
  }

  static async upsertConfig(
    templateId: number,
    configData: CreateTransportationConfigDto
  ): Promise<TransportationConfig> {
    try {
      const existingConfig = await this.getConfig(templateId);
      if (existingConfig && existingConfig.id) {
        // Clean the config data to remove any fields that might have been added
        // Create a new object with only the allowed fields
        const cleanConfigData: CreateTransportationConfigDto = {
          tierABaseCost: configData.tierABaseCost,
          tierAEmissionRate: configData.tierAEmissionRate,
          tierAMinDistance: configData.tierAMinDistance,
          tierAMaxDistance: configData.tierAMaxDistance,
          tierASpaceBasis: configData.tierASpaceBasis,
          tierAEnabled: configData.tierAEnabled,
          tierBBaseCost: configData.tierBBaseCost,
          tierBEmissionRate: configData.tierBEmissionRate,
          tierBMinDistance: configData.tierBMinDistance,
          tierBMaxDistance: configData.tierBMaxDistance,
          tierBSpaceBasis: configData.tierBSpaceBasis,
          tierBEnabled: configData.tierBEnabled,
          tierCBaseCost: configData.tierCBaseCost,
          tierCEmissionRate: configData.tierCEmissionRate,
          tierCMinDistance: configData.tierCMinDistance,
          tierCMaxDistance: configData.tierCMaxDistance,
          tierCSpaceBasis: configData.tierCSpaceBasis,
          tierCEnabled: configData.tierCEnabled,
          tierDBaseCost: configData.tierDBaseCost,
          tierDEmissionRate: configData.tierDEmissionRate,
          tierDMinDistance: configData.tierDMinDistance,
          tierDSpaceBasis: configData.tierDSpaceBasis,
          tierDEnabled: configData.tierDEnabled,
          enableCrossTeamTransfers: configData.enableCrossTeamTransfers,
          maxTransferQuantity: configData.maxTransferQuantity,
          transferCooldownMinutes: configData.transferCooldownMinutes,
          distanceAMax: configData.distanceAMax,
          distanceBMax: configData.distanceBMax,
          distanceCMax: configData.distanceCMax,
          description: configData.description
        };
        
        // Remove undefined values
        Object.keys(cleanConfigData).forEach(key => {
          if ((cleanConfigData as Record<string, unknown>)[key] === undefined) {
            delete (cleanConfigData as Record<string, unknown>)[key];
          }
        });
        
        return await this.updateConfig(existingConfig.id, cleanConfigData);
      }
    } catch (error) {
      console.log('No existing config, creating new one');
    }
    return await this.createConfig(templateId, configData);
  }

  static async deleteConfig(configId: string): Promise<void> {
    await apiClient.delete(
      `${this.BASE_PATH}/${configId}`
    );
  }

  static async getAllConfigs(): Promise<TransportationConfig[]> {
    const response = await apiClient.get<TransportationConfigListResponse>(
      `${this.BASE_PATH}`
    );
    return this.extractResponseData<TransportationConfig[]>(response) || [];
  }

  static async getStatistics(templateId: number): Promise<TransportationStatistics> {
    // This endpoint might need to be adjusted based on actual backend implementation
    // Using a mock implementation for now
    return {
      totalTransfers: 0,
      totalGoldSpent: 0,
      totalCarbonEmitted: 0,
      transfersByTier: {
        tierA: 0,
        tierB: 0,
        tierC: 0,
        tierD: 0
      },
      averageCostPerTransfer: 0,
      averageDistance: 0,
      mostUsedTier: 'TIER_A'
    };
  }

  static async setDefaultConfig(templateId: number): Promise<TransportationConfig> {
    return await this.upsertConfig(templateId, DEFAULT_TRANSPORTATION_CONFIG);
  }

  static async toggleConfig(
    configId: string,
    isActive: boolean
  ): Promise<TransportationConfig> {
    const response = await apiClient.patch<TransportationConfigResponse>(
      `${this.BASE_PATH}/${configId}/toggle`,
      { isActive }
    );
    return this.extractResponseData<TransportationConfig>(response);
  }

  static async validateConfig(
    configData: CreateTransportationConfigDto
  ): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    if (configData.tierAMaxDistance && configData.tierBMinDistance && 
        configData.tierAMaxDistance >= configData.tierBMinDistance) {
      errors.push('Tier A max distance must be less than Tier B min distance');
    }

    if (configData.tierBMaxDistance && configData.tierCMinDistance && 
        configData.tierBMaxDistance >= configData.tierCMinDistance) {
      errors.push('Tier B max distance must be less than Tier C min distance');
    }

    if (configData.tierCMaxDistance && configData.tierDMinDistance && 
        configData.tierCMaxDistance >= configData.tierDMinDistance) {
      errors.push('Tier C max distance must be less than Tier D min distance');
    }

    if (configData.tierABaseCost && configData.tierABaseCost < 0) {
      errors.push('Tier A base cost must be positive');
    }

    if (configData.tierBBaseCost && configData.tierBBaseCost < 0) {
      errors.push('Tier B base cost must be positive');
    }

    if (configData.tierCBaseCost && configData.tierCBaseCost < 0) {
      errors.push('Tier C base cost must be positive');
    }

    if (configData.tierDBaseCost && configData.tierDBaseCost < 0) {
      errors.push('Tier D base cost must be positive');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export default TransportationConfigService;