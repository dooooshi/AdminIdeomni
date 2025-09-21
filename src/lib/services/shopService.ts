import apiClient from '@/lib/http/api-client';
import type {
  ActivityShop,
  ShopMaterial,
  ShopTransaction,
  ShopHistory,
  MaterialQueryParams,
  AddMaterialRequest,
  UpdatePriceRequest,
  PurchaseRequest,
  HistoryQueryParams,
  TeamTransactionQueryParams,
  BrowseMaterialsResponse,
  AddMaterialResponse,
  RemoveMaterialResponse,
  UpdatePriceResponse,
  PurchaseResponse,
  TeamTransactionsResponse,
  ShopHistoryResponse,
  ShopTransactionsResponse,
  FacilitySpaceOverview,
  StandardApiResponse,
  ApiResponse,
  RawMaterial,
} from '@/types/shop';

/**
 * Shop Service
 * Handles all Raw Material Shop API operations for both managers and students
 * Based on the API documentation from docs/shop/
 */
export class ShopService {
  private static readonly SHOP_BASE_PATH = '/shop';
  private static readonly USER_BASE_PATH = '/user';

  /**
   * Helper method to extract data from API response wrapper
   */
  private static extractResponseData<T>(response: any): T {
    // Handle nested response structure: { data: { success: true, data: {...} } }
    if (response.data?.data?.data) {
      return response.data.data.data;
    }

    // Handle standard nested response: { data: {...} }
    if (response.data?.data) {
      return response.data.data;
    }

    // Handle simple response: { data: {...} }
    if (response.data) {
      return response.data;
    }

    // Fallback - return entire response
    return response;
  }

  // ==================== SHOP BROWSING (All Users) ====================

  /**
   * Get all materials in the activity shop
   * GET /api/shop/materials
   * Activity context is determined from user authentication
   */
  static async getMaterials(params?: MaterialQueryParams): Promise<BrowseMaterialsResponse> {
    const response = await apiClient.get<ApiResponse<BrowseMaterialsResponse>>(
      `${this.SHOP_BASE_PATH}/materials`,
      { params }
    );
    return this.extractResponseData(response);
  }

  /**
   * Get the current activity's shop
   * Activity context is determined from user authentication
   */
  static async getCurrentShop(): Promise<ActivityShop> {
    const response = await apiClient.get<ApiResponse<ActivityShop>>(
      `${this.SHOP_BASE_PATH}/current`
    );
    return this.extractResponseData(response);
  }

  /**
   * Get all available raw materials (for adding to shop)
   * GET /api/raw-materials
   * Returns all raw materials available in the system
   * Handles pagination to fetch all materials
   */
  static async getAvailableRawMaterials(): Promise<RawMaterial[]> {
    const allMaterials: RawMaterial[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await apiClient.get('/raw-materials', {
          params: { limit: 100, page }
        });

        // Handle the actual API response structure
        if (response.data?.data?.materials && Array.isArray(response.data.data.materials)) {
          const materials = response.data.data.materials;

          // Map to ensure compatibility - API returns 'name' field which is in Chinese
          const mappedMaterials = materials.map((m: any) => ({
            id: m.id,
            materialNumber: m.materialNumber,
            name: m.name, // Keep original Chinese name
            nameZh: m.name, // Store Chinese name as nameZh for compatibility
            nameEn: m.name, // For now, use Chinese name as English too (can be updated later)
            origin: m.origin,
            totalCost: m.totalCost,
            waterRequired: m.waterRequired,
            powerRequired: m.powerRequired,
            goldCost: m.goldCost,
            carbonEmission: m.carbonEmission,
            unit: m.unit,
            description: m.description
          }));

          allMaterials.push(...mappedMaterials);

          // Check if there are more pages
          const pagination = response.data.data.pagination;
          if (pagination && pagination.hasNext) {
            hasMore = true;
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching materials page ${page}:`, error);
        hasMore = false;
      }
    }

    console.log(`Fetched total ${allMaterials.length} raw materials`);
    return allMaterials;
  }

  // ==================== MATERIAL MANAGEMENT (Manager Only) ====================

  /**
   * Add a new raw material to current activity's shop
   * POST /api/shop/materials/add
   * Requires MANAGER role
   */
  static async addMaterial(request: AddMaterialRequest): Promise<AddMaterialResponse> {
    console.log('Adding material with request:', request);

    try {
      const response = await apiClient.post<ApiResponse<AddMaterialResponse>>(
        `${this.SHOP_BASE_PATH}/materials/add`,
        request
      );

      console.log('Add material response:', response);
      return this.extractResponseData(response);
    } catch (error: any) {
      console.error('Add material error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Remove a material from current activity's shop
   * DELETE /api/shop/materials/:materialId
   * Requires MANAGER role
   */
  static async removeMaterial(materialId: number): Promise<RemoveMaterialResponse> {
    const response = await apiClient.delete<ApiResponse<RemoveMaterialResponse>>(
      `${this.SHOP_BASE_PATH}/materials/${materialId}`
    );
    return this.extractResponseData(response);
  }

  /**
   * Update price for an existing material in current activity's shop
   * POST /api/shop/materials/:materialId/price
   * Requires MANAGER role
   */
  static async updateMaterialPrice(
    materialId: number,
    request: UpdatePriceRequest
  ): Promise<UpdatePriceResponse> {
    const response = await apiClient.post<ApiResponse<UpdatePriceResponse>>(
      `${this.SHOP_BASE_PATH}/materials/${materialId}/price`,
      request
    );
    return this.extractResponseData(response);
  }

  // ==================== PURCHASE TRANSACTIONS (Students) ====================

  /**
   * Get team's facility space overview
   * GET /api/user/facility-space/team/overview
   * Team context is determined from user authentication
   */
  static async getTeamFacilitySpaces(): Promise<FacilitySpaceOverview> {
    const response = await apiClient.get<ApiResponse<FacilitySpaceOverview>>(
      `${this.USER_BASE_PATH}/facility-space/team/overview`
    );
    return this.extractResponseData(response);
  }

  /**
   * Purchase materials from shop with instant delivery
   * POST /api/shop/purchase
   * Requires STUDENT role
   */
  static async purchaseMaterial(request: PurchaseRequest): Promise<PurchaseResponse> {
    const response = await apiClient.post<ApiResponse<PurchaseResponse>>(
      `${this.SHOP_BASE_PATH}/purchase`,
      request
    );
    return this.extractResponseData(response);
  }

  /**
   * Get purchase history for student's own team
   * GET /api/shop/team-transactions
   * Requires STUDENT role
   * Team context is determined from authentication
   */
  static async getTeamTransactions(
    params?: TeamTransactionQueryParams
  ): Promise<TeamTransactionsResponse> {
    const response = await apiClient.get<ApiResponse<TeamTransactionsResponse>>(
      `${this.SHOP_BASE_PATH}/team-transactions`,
      { params }
    );
    return this.extractResponseData(response);
  }

  // ==================== SHOP HISTORY (Manager) ====================

  /**
   * Get complete shop activity history for current activity
   * GET /api/shop/history
   * Requires MANAGER role
   */
  static async getShopHistory(params?: HistoryQueryParams): Promise<ShopHistoryResponse> {
    const response = await apiClient.get<ApiResponse<ShopHistoryResponse>>(
      `${this.SHOP_BASE_PATH}/history`,
      { params }
    );
    return this.extractResponseData(response);
  }

  /**
   * Get purchase transactions (filtered by role)
   * GET /api/shop/transactions
   * Managers see all, students see own team
   */
  static async getTransactions(
    params?: HistoryQueryParams
  ): Promise<ShopTransactionsResponse> {
    const response = await apiClient.get<ApiResponse<ShopTransactionsResponse>>(
      `${this.SHOP_BASE_PATH}/transactions`,
      { params }
    );
    return this.extractResponseData(response);
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Calculate total cost for a purchase
   */
  static calculateTotalCost(unitPrice: string, quantity: number): number {
    return parseFloat(unitPrice) * quantity;
  }

  /**
   * Check if material is in stock
   */
  static isMaterialInStock(material: ShopMaterial, requestedQuantity: number): boolean {
    if (material.quantityToSell === null) {
      // Unlimited stock
      return true;
    }
    const remaining = material.quantityToSell - material.quantitySold;
    return remaining >= requestedQuantity;
  }

  /**
   * Format price for display (without currency symbol)
   */
  static formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  }

  /**
   * Get remaining stock for a material
   */
  static getRemainingStock(material: ShopMaterial): number | null {
    if (material.quantityToSell === null) {
      return null; // Unlimited
    }
    return material.quantityToSell - material.quantitySold;
  }

  /**
   * Group materials by origin
   */
  static groupMaterialsByOrigin(materials: ShopMaterial[]): Map<string, ShopMaterial[]> {
    const grouped = new Map<string, ShopMaterial[]>();

    // Guard against null/undefined materials
    if (!materials || !Array.isArray(materials)) {
      return grouped;
    }

    materials.forEach(material => {
      const origin = material.material.origin;
      if (!grouped.has(origin)) {
        grouped.set(origin, []);
      }
      grouped.get(origin)!.push(material);
    });

    return grouped;
  }

  /**
   * Sort materials by field
   */
  static sortMaterials(
    materials: ShopMaterial[],
    field: 'price' | 'name' | 'materialNumber',
    direction: 'asc' | 'desc' = 'asc'
  ): ShopMaterial[] {
    // Guard against null/undefined materials
    if (!materials || !Array.isArray(materials)) {
      return [];
    }

    const sorted = [...materials].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'price':
          comparison = parseFloat(a.unitPrice) - parseFloat(b.unitPrice);
          break;
        case 'name':
          comparison = a.material.nameEn.localeCompare(b.material.nameEn);
          break;
        case 'materialNumber':
          comparison = a.material.materialNumber - b.material.materialNumber;
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Filter materials by criteria
   */
  static filterMaterials(
    materials: ShopMaterial[],
    filters: {
      origin?: string;
      minPrice?: number;
      maxPrice?: number;
      searchTerm?: string;
      inStock?: boolean;
    }
  ): ShopMaterial[] {
    // Guard against null/undefined materials
    if (!materials || !Array.isArray(materials)) {
      return [];
    }

    let filtered = [...materials];

    if (filters.origin) {
      filtered = filtered.filter(m => m.material.origin === filters.origin);
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(m => parseFloat(m.unitPrice) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(m => parseFloat(m.unitPrice) <= filters.maxPrice!);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.material.nameEn.toLowerCase().includes(term) ||
          m.material.nameZh.includes(term) ||
          m.material.materialNumber.toString().includes(term)
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter(m => {
        if (m.quantityToSell === null) return true;
        return m.quantityToSell > m.quantitySold;
      });
    }

    return filtered;
  }

  /**
   * Validate purchase request (without balance check)
   */
  static validatePurchase(
    material: ShopMaterial,
    quantity: number
  ): { valid: boolean; error?: string } {
    // Check quantity is positive
    if (quantity <= 0) {
      return { valid: false, error: 'Quantity must be greater than 0' };
    }

    // Check stock availability
    if (!this.isMaterialInStock(material, quantity)) {
      return { valid: false, error: 'Insufficient stock available' };
    }

    return { valid: true };
  }
}

export default ShopService;