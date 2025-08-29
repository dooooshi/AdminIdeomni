import apiClient from '@/lib/http/api-client';
import {
  RawMaterial,
  RawMaterialOrigin,
  CreateRawMaterialRequest,
  UpdateRawMaterialRequest,
  DeleteRawMaterialRequest,
  RawMaterialSearchParams,
  RawMaterialSearchResponse,
  AuditLogSearchParams,
  AuditLogSearchResponse,
  RawMaterialStatistics,
  ApiResponse,
  RawMaterialAuditLog
} from '@/lib/types/rawMaterial';

/**
 * Raw Material Service
 * Handles all API interactions for raw material management
 */
export class RawMaterialService {
  private static readonly BASE_PATH = '/admin/raw-materials';
  private static readonly USER_PATH = '/raw-materials';

  /**
   * Helper method to extract data from API response wrapper
   */
  private static extractResponseData<T>(response: any): T {
    // The response from apiClient already has response.data which contains the full API response
    // The actual data is in response.data.data
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data || response;
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * List all raw materials with advanced filtering, sorting, and pagination
   */
  static async searchRawMaterials(params: RawMaterialSearchParams = {}): Promise<RawMaterialSearchResponse> {
    const {
      page = 1,
      limit = 20,
      offset,
      sort = 'materialNumber',
      order = 'asc',
      origin,
      isActive = true,
      isDeleted = false,
      search,
      minCost,
      maxCost,
      minCarbon,
      maxCarbon
    } = params;

    const queryParams: any = {
      page,
      limit,
      sort,
      order,
      isActive,
      isDeleted
    };

    if (offset !== undefined) queryParams.offset = offset;
    if (origin) queryParams.origin = origin;
    if (search) queryParams.search = search;
    if (minCost !== undefined) queryParams.minCost = minCost;
    if (maxCost !== undefined) queryParams.maxCost = maxCost;
    if (minCarbon !== undefined) queryParams.minCarbon = minCarbon;
    if (maxCarbon !== undefined) queryParams.maxCarbon = maxCarbon;

    const response = await apiClient.get<ApiResponse<RawMaterialSearchResponse>>(
      this.BASE_PATH,
      { params: queryParams }
    );

    return this.extractResponseData(response);
  }

  /**
   * Get single raw material by ID
   */
  static async getRawMaterialById(id: number): Promise<RawMaterial> {
    const response = await apiClient.get<ApiResponse<RawMaterial>>(
      `${this.BASE_PATH}/${id}`
    );
    return this.extractResponseData(response);
  }

  /**
   * Create a new raw material
   */
  static async createRawMaterial(data: CreateRawMaterialRequest): Promise<RawMaterial> {
    const response = await apiClient.post<ApiResponse<RawMaterial>>(
      this.BASE_PATH,
      data
    );
    return this.extractResponseData(response);
  }

  /**
   * Update raw material (full update)
   */
  static async updateRawMaterial(id: number, data: UpdateRawMaterialRequest): Promise<RawMaterial> {
    const response = await apiClient.put<ApiResponse<RawMaterial>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return this.extractResponseData(response);
  }

  /**
   * Partial update raw material
   */
  static async patchRawMaterial(id: number, data: Partial<UpdateRawMaterialRequest>): Promise<RawMaterial> {
    const response = await apiClient.patch<ApiResponse<RawMaterial>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return this.extractResponseData(response);
  }

  /**
   * Delete raw material (soft delete)
   */
  static async deleteRawMaterial(id: number, data: DeleteRawMaterialRequest): Promise<{ id: number; deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ id: number; deleted: boolean }>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return this.extractResponseData(response);
  }

  /**
   * Restore deleted raw material
   */
  static async restoreRawMaterial(id: number, reason: string): Promise<RawMaterial> {
    const response = await apiClient.patch<ApiResponse<RawMaterial>>(
      `${this.BASE_PATH}/${id}/restore`,
      { reason }
    );
    return this.extractResponseData(response);
  }

  /**
   * Get audit log for raw materials
   */
  static async getAuditLog(params: AuditLogSearchParams = {}): Promise<AuditLogSearchResponse> {
    const {
      materialId,
      adminId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = params;

    const queryParams: any = {
      page,
      limit
    };

    if (materialId) queryParams.materialId = materialId;
    if (adminId) queryParams.adminId = adminId;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const response = await apiClient.get<ApiResponse<AuditLogSearchResponse>>(
      `${this.BASE_PATH}/audit-log`,
      { params: queryParams }
    );

    return this.extractResponseData(response);
  }

  /**
   * Get raw material statistics
   */
  static async getStatistics(): Promise<RawMaterialStatistics> {
    const response = await apiClient.get<ApiResponse<RawMaterialStatistics>>(
      `${this.BASE_PATH}/statistics`
    );
    return this.extractResponseData(response);
  }

  /**
   * Bulk update raw materials
   */
  static async bulkUpdateRawMaterials(
    ids: number[],
    data: Partial<UpdateRawMaterialRequest>
  ): Promise<{ updated: number; failed: number[] }> {
    const response = await apiClient.patch<ApiResponse<{ updated: number; failed: number[] }>>(
      `${this.BASE_PATH}/bulk`,
      { ids, data }
    );
    return this.extractResponseData(response);
  }

  /**
   * Export raw materials to CSV
   */
  static async exportRawMaterials(params: RawMaterialSearchParams = {}): Promise<Blob> {
    const response = await apiClient.download(
      `${this.BASE_PATH}/export`,
      { params }
    );
    return response.data;
  }

  /**
   * Import raw materials from CSV
   */
  static async importRawMaterials(file: File): Promise<{ imported: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload<ApiResponse<{ imported: number; failed: number; errors: string[] }>>(
      `${this.BASE_PATH}/import`,
      formData
    );
    return this.extractResponseData(response);
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Get available raw materials for users (public view)
   */
  static async getUserRawMaterials(params: RawMaterialSearchParams = {}): Promise<RawMaterialSearchResponse> {
    const {
      page = 1,
      limit = 20,
      sort = 'materialNumber',
      order = 'asc',
      origin,
      search,
      minCost,
      maxCost
    } = params;

    const queryParams: any = {
      page,
      limit,
      sort,
      order
    };

    if (origin) queryParams.origin = origin;
    if (search) queryParams.search = search;
    if (minCost !== undefined) queryParams.minCost = minCost;
    if (maxCost !== undefined) queryParams.maxCost = maxCost;

    const response = await apiClient.get<ApiResponse<RawMaterialSearchResponse>>(
      this.USER_PATH,
      { params: queryParams }
    );

    return this.extractResponseData(response);
  }

  /**
   * Get user-visible material details
   */
  static async getUserMaterialDetails(id: number): Promise<RawMaterial> {
    const response = await apiClient.get<ApiResponse<RawMaterial>>(
      `${this.USER_PATH}/${id}`
    );
    return this.extractResponseData(response);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validate material data before submission
   */
  static validateMaterialData(data: CreateRawMaterialRequest | UpdateRawMaterialRequest): string[] {
    const errors: string[] = [];

    // Check required fields for create
    if ('materialNumber' in data && data.materialNumber !== undefined) {
      if (data.materialNumber < 1) {
        errors.push('Material number must be positive');
      }
    }

    // Validate names
    if ('nameEn' in data && data.nameEn !== undefined) {
      if (!data.nameEn || data.nameEn.trim().length === 0) {
        errors.push('English name is required');
      }
    }

    if ('nameZh' in data && data.nameZh !== undefined) {
      if (!data.nameZh || data.nameZh.trim().length === 0) {
        errors.push('Chinese name is required');
      }
    }

    // Validate costs and resources
    if ('totalCost' in data && data.totalCost !== undefined) {
      if (data.totalCost <= 0) {
        errors.push('Total cost must be positive');
      }
    }

    if ('waterRequired' in data && data.waterRequired !== undefined) {
      if (data.waterRequired < 0) {
        errors.push('Water requirement cannot be negative');
      }
    }

    if ('powerRequired' in data && data.powerRequired !== undefined) {
      if (data.powerRequired < 0) {
        errors.push('Power requirement cannot be negative');
      }
    }

    if ('goldCost' in data && data.goldCost !== undefined) {
      if (data.goldCost < 0) {
        errors.push('Gold cost cannot be negative');
      }
    }

    if ('carbonEmission' in data && data.carbonEmission !== undefined) {
      if (data.carbonEmission < 0) {
        errors.push('Carbon emission cannot be negative');
      }
    }

    // Validate origin
    if ('origin' in data && data.origin) {
      const validOrigins = Object.values(RawMaterialOrigin);
      if (!validOrigins.includes(data.origin)) {
        errors.push('Invalid origin facility type');
      }
    }

    // Validate modification reason
    if (!data.modificationReason || data.modificationReason.trim().length === 0) {
      errors.push('Modification reason is required');
    }

    return errors;
  }

  /**
   * Format material for display
   */
  static formatMaterialDisplay(material: RawMaterial, locale: 'en' | 'zh' = 'en'): string {
    const name = locale === 'zh' ? material.nameZh : material.nameEn;
    return `#${material.materialNumber} - ${name}`;
  }

}

// Export as default
export default RawMaterialService;