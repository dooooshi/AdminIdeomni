import apiClient from '@/lib/http/api-client';
import {
  InfrastructureConfig,
  CreateInfrastructureConfigDto,
  UpdateInfrastructureConfigDto,
  InfrastructureConfigStatistics,
  InfrastructureConfigResponse,
  DEFAULT_INFRASTRUCTURE_CONFIG
} from '@/types/infrastructure';

export class InfrastructureConfigService {
  private static readonly BASE_PATH = '/admin/map-templates';

  private static extractResponseData<T>(response: any): T {
    return response.data?.data?.data || response.data?.data || response.data;
  }

  static async createConfig(
    templateId: number,
    configData: CreateInfrastructureConfigDto
  ): Promise<InfrastructureConfig> {
    const response = await apiClient.post<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/${templateId}/infrastructure-config`,
      configData
    );
    return this.extractResponseData<InfrastructureConfig>(response);
  }

  static async getConfig(templateId: number): Promise<InfrastructureConfig> {
    const response = await apiClient.get<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/${templateId}/infrastructure-config`
    );
    return this.extractResponseData<InfrastructureConfig>(response);
  }

  static async updateConfig(
    templateId: number,
    configData: UpdateInfrastructureConfigDto
  ): Promise<InfrastructureConfig> {
    const response = await apiClient.put<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/${templateId}/infrastructure-config`,
      configData
    );
    return this.extractResponseData<InfrastructureConfig>(response);
  }

  static async upsertConfig(
    templateId: number,
    configData: CreateInfrastructureConfigDto
  ): Promise<InfrastructureConfig> {
    const response = await apiClient.put<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/${templateId}/infrastructure-config/upsert`,
      configData
    );
    return this.extractResponseData<InfrastructureConfig>(response);
  }

  static async deleteConfig(templateId: number): Promise<void> {
    await apiClient.delete(
      `${this.BASE_PATH}/${templateId}/infrastructure-config`
    );
  }

  static async listConfigs(params?: {
    isActive?: boolean;
    includeDeleted?: boolean;
  }): Promise<{ data: InfrastructureConfig[]; total: number }> {
    const response = await apiClient.get<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/infrastructure-configs`,
      { params }
    );
    const data = this.extractResponseData<any>(response);
    return {
      data: Array.isArray(data) ? data : data.data || [],
      total: data.total || (Array.isArray(data) ? data.length : 0)
    };
  }

  static async getStatistics(): Promise<InfrastructureConfigStatistics> {
    const response = await apiClient.get<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/infrastructure-configs/statistics`
    );
    return this.extractResponseData<InfrastructureConfigStatistics>(response);
  }

  static async copyConfig(
    targetTemplateId: number,
    sourceTemplateId: number
  ): Promise<InfrastructureConfig> {
    const response = await apiClient.post<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/${targetTemplateId}/infrastructure-config/copy-from/${sourceTemplateId}`
    );
    return this.extractResponseData<InfrastructureConfig>(response);
  }

  static async applyDefaults(templateId: number): Promise<InfrastructureConfig> {
    const response = await apiClient.post<InfrastructureConfigResponse>(
      `${this.BASE_PATH}/${templateId}/infrastructure-config/apply-defaults`
    );
    return this.extractResponseData<InfrastructureConfig>(response);
  }

  static validateConfig(config: CreateInfrastructureConfigDto | UpdateInfrastructureConfigDto): string[] {
    const errors: string[] = [];

    if (config.waterResourceBasePrice !== undefined && config.waterResourceBasePrice < 0) {
      errors.push('Water resource base price must be positive');
    }

    if (config.electricityResourceBasePrice !== undefined && config.electricityResourceBasePrice < 0) {
      errors.push('Electricity resource base price must be positive');
    }

    if (config.waterPlantIndex !== undefined) {
      if (config.waterPlantIndex < 0.1 || config.waterPlantIndex > 10) {
        errors.push('Water plant index must be between 0.1 and 10');
      }
    }

    if (config.powerPlantIndex !== undefined) {
      if (config.powerPlantIndex < 0.1 || config.powerPlantIndex > 10) {
        errors.push('Power plant index must be between 0.1 and 10');
      }
    }

    if (config.waterPlantBaseOperationPoints !== undefined && config.waterPlantBaseOperationPoints < 1) {
      errors.push('Water plant base operation points must be at least 1');
    }

    if (config.powerPlantBaseOperationPoints !== undefined && config.powerPlantBaseOperationPoints < 1) {
      errors.push('Power plant base operation points must be at least 1');
    }

    if (config.waterPlantUpgradeOperationPoints !== undefined && config.waterPlantUpgradeOperationPoints < 0) {
      errors.push('Water plant upgrade operation points cannot be negative');
    }

    if (config.powerPlantUpgradeOperationPoints !== undefined && config.powerPlantUpgradeOperationPoints < 0) {
      errors.push('Power plant upgrade operation points cannot be negative');
    }

    if (config.baseStationBaseCost !== undefined && config.baseStationBaseCost < 0) {
      errors.push('Base station base cost cannot be negative');
    }

    if (config.fireStationBaseCost !== undefined && config.fireStationBaseCost < 0) {
      errors.push('Fire station base cost cannot be negative');
    }

    return errors;
  }

  static formatValue(value: number | string, type: 'currency' | 'number' | 'decimal'): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(numValue);
      case 'decimal':
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 3
        }).format(numValue);
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(numValue);
    }
  }

  static getDefaultConfig(): CreateInfrastructureConfigDto {
    return { ...DEFAULT_INFRASTRUCTURE_CONFIG };
  }

  static async checkConfigExists(templateId: number): Promise<boolean> {
    try {
      await this.getConfig(templateId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  static async ensureConfigExists(templateId: number): Promise<InfrastructureConfig> {
    try {
      return await this.getConfig(templateId);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return await this.applyDefaults(templateId);
      }
      throw error;
    }
  }
}

export default InfrastructureConfigService;