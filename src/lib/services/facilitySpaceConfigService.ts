import axiosInstance from '@/lib/http/axios-config';
import {
  FacilitySpaceConfig,
  CreateFacilitySpaceConfigDto,
  UpdateFacilitySpaceConfigDto,
  GetFacilitySpaceConfigsQueryParams,
  BatchUpdateFacilitySpaceConfigDto,
  CategorySpaceConfigDto,
  TemplateSpaceSummary,
  SpaceCalculationResult,
  DEFAULT_SPACE_CONFIGS,
  getFacilityCategory,
  calculateFacilitySpace,
  canHaveStorage,
} from '@/types/facilitySpace';
import { FacilityType, FacilityCategory } from '@/types/facilities';
import { PaginatedResponse } from '@/components/map/types';

class FacilitySpaceConfigService {
  /**
   * Get facility space configurations for a template
   */
  static async getFacilitySpaceConfigs(
    templateId: number,
    params?: GetFacilitySpaceConfigsQueryParams
  ): Promise<PaginatedResponse<FacilitySpaceConfig>> {
    try {
      const response = await axiosInstance.get(
        `/admin/facility-space-configs/templates/${templateId}`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching facility space configs:', error);
      throw error;
    }
  }

  /**
   * Get a single facility space configuration
   */
  static async getFacilitySpaceConfig(configId: string): Promise<FacilitySpaceConfig> {
    try {
      const response = await axiosInstance.get(`/admin/facility-space-configs/${configId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching facility space config:', error);
      throw error;
    }
  }

  /**
   * Create a new facility space configuration
   */
  static async createFacilitySpaceConfig(
    templateId: number,
    config: CreateFacilitySpaceConfigDto
  ): Promise<FacilitySpaceConfig> {
    try {
      // Enforce business rules
      const category = getFacilityCategory(config.facilityType);
      const enforedConfig = {
        templateId,
        ...config,
        isStorageFacility: canHaveStorage(category),
      };

      // Force zero space for non-storage facilities
      if (!enforedConfig.isStorageFacility) {
        enforedConfig.initialSpace = 0;
        enforedConfig.spacePerLevel = 0;
        enforedConfig.maxSpace = 0;
      }

      const response = await axiosInstance.post(
        `/admin/facility-space-configs`,
        enforedConfig
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating facility space config:', error);
      throw error;
    }
  }

  /**
   * Update a facility space configuration
   */
  static async updateFacilitySpaceConfig(
    configId: string,
    updates: UpdateFacilitySpaceConfigDto
  ): Promise<FacilitySpaceConfig> {
    try {
      const response = await axiosInstance.put(
        `/admin/facility-space-configs/${configId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating facility space config:', error);
      throw error;
    }
  }

  /**
   * Delete a facility space configuration
   */
  static async deleteFacilitySpaceConfig(configId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/admin/facility-space-configs/${configId}`);
    } catch (error) {
      console.error('Error deleting facility space config:', error);
      throw error;
    }
  }

  /**
   * Batch update facility space configurations
   */
  static async batchUpdateFacilitySpaceConfigs(
    templateId: number,
    batch: BatchUpdateFacilitySpaceConfigDto
  ): Promise<FacilitySpaceConfig[]> {
    try {
      const response = await axiosInstance.put(
        `/admin/facility-space-configs/templates/${templateId}/batch`,
        batch
      );
      return response.data.data;
    } catch (error) {
      console.error('Error batch updating facility space configs:', error);
      throw error;
    }
  }

  /**
   * Update all facilities in a category with the same space settings
   */
  static async updateCategorySpaceConfigs(
    templateId: number,
    categoryConfig: CategorySpaceConfigDto
  ): Promise<FacilitySpaceConfig[]> {
    try {
      // Get all facility types for this category
      const facilityTypes = this.getFacilityTypesByCategory(categoryConfig.category);
      
      // Enforce business rules
      const isStorageCategory = canHaveStorage(categoryConfig.category);
      const updates = isStorageCategory ? {
        initialSpace: categoryConfig.initialSpace,
        spacePerLevel: categoryConfig.spacePerLevel,
        maxSpace: categoryConfig.maxSpace,
        isStorageFacility: true,
      } : {
        initialSpace: 0,
        spacePerLevel: 0,
        maxSpace: 0,
        isStorageFacility: false,
      };

      const batch: BatchUpdateFacilitySpaceConfigDto = {
        facilityTypes,
        updates,
      };

      return await this.batchUpdateFacilitySpaceConfigs(templateId, batch);
    } catch (error) {
      console.error('Error updating category space configs:', error);
      throw error;
    }
  }

  /**
   * Initialize default space configurations for a template
   */
  static async initializeDefaultSpaceConfigs(templateId: number): Promise<FacilitySpaceConfig[]> {
    try {
      const response = await axiosInstance.post(
        `/admin/facility-space-configs/templates/${templateId}/initialize-defaults`,
        {}
      );
      return response.data.data;
    } catch (error) {
      console.error('Error initializing default space configs:', error);
      throw error;
    }
  }

  /**
   * Copy space configurations from another template
   */
  static async copySpaceConfigs(
    targetTemplateId: number,
    sourceTemplateId: number
  ): Promise<FacilitySpaceConfig[]> {
    try {
      const response = await axiosInstance.post(
        `/admin/facility-space-configs/templates/${targetTemplateId}/copy`,
        { sourceTemplateId }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error copying space configs:', error);
      throw error;
    }
  }

  /**
   * Get template space summary statistics
   */
  static async getTemplateSpaceSummary(templateId: number): Promise<TemplateSpaceSummary> {
    try {
      const response = await axiosInstance.get(
        `/admin/facility-space-configs/templates/${templateId}/summary`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching template space summary:', error);
      throw error;
    }
  }

  /**
   * Calculate space for a facility at a specific level
   */
  static calculateSpace(
    config: FacilitySpaceConfig,
    level: number
  ): SpaceCalculationResult {
    return calculateFacilitySpace(config, level);
  }

  /**
   * Validate space configuration values
   */
  static validateSpaceConfig(config: CreateFacilitySpaceConfigDto | UpdateFacilitySpaceConfigDto): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};
    
    if ('facilityType' in config) {
      const category = getFacilityCategory(config.facilityType as FacilityType);
      const isStorageCategory = canHaveStorage(category);
      
      if (!isStorageCategory && (
        (config.initialSpace && config.initialSpace > 0) ||
        (config.spacePerLevel && config.spacePerLevel > 0) ||
        (config.maxSpace && config.maxSpace > 0)
      )) {
        errors.facilityType = 'Infrastructure and Other facilities cannot have storage space';
      }
    }

    if (config.initialSpace !== undefined && config.initialSpace < 0) {
      errors.initialSpace = 'Initial space must be non-negative';
    }

    if (config.spacePerLevel !== undefined && config.spacePerLevel < 0) {
      errors.spacePerLevel = 'Space per level must be non-negative';
    }

    if (config.maxSpace !== undefined && config.maxSpace < 0) {
      errors.maxSpace = 'Max space must be non-negative';
    }

    if (
      config.initialSpace !== undefined &&
      config.maxSpace !== undefined &&
      config.initialSpace > config.maxSpace
    ) {
      errors.maxSpace = 'Max space must be greater than or equal to initial space';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Get default configuration for a facility type
   */
  static getDefaultConfig(facilityType: FacilityType): CreateFacilitySpaceConfigDto {
    return {
      facilityType,
      ...DEFAULT_SPACE_CONFIGS[facilityType],
    };
  }

  /**
   * Get all facility types for a category
   */
  static getFacilityTypesByCategory(category: FacilityCategory): FacilityType[] {
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
        FacilityType.FIRE_STATION,
      ],
      [FacilityCategory.OTHER]: [
        FacilityType.SCHOOL,
        FacilityType.HOSPITAL,
        FacilityType.PARK,
        FacilityType.CINEMA,
      ],
    };

    return typesByCategory[category] || [];
  }

  /**
   * Export space configurations to JSON
   */
  static exportConfigs(configs: FacilitySpaceConfig[]): string {
    const exportData = configs.map(config => ({
      facilityType: config.facilityType,
      initialSpace: config.initialSpace,
      spacePerLevel: config.spacePerLevel,
      maxSpace: config.maxSpace,
      isStorageFacility: config.isStorageFacility,
      description: config.description,
    }));
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import space configurations from JSON
   */
  static async importConfigs(
    templateId: number,
    jsonData: string
  ): Promise<FacilitySpaceConfig[]> {
    try {
      const configs = JSON.parse(jsonData) as CreateFacilitySpaceConfigDto[];
      
      // Validate all configs before importing
      for (const config of configs) {
        const validation = this.validateSpaceConfig(config);
        if (!validation.isValid) {
          throw new Error(`Invalid config for ${config.facilityType}: ${Object.values(validation.errors).join(', ')}`);
        }
      }

      const response = await axiosInstance.post(
        `/admin/facility-space-configs/templates/${templateId}/import`,
        { configs }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error importing space configs:', error);
      throw error;
    }
  }
}

export default FacilitySpaceConfigService;