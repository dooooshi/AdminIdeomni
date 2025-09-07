import apiClient from '@/lib/http/api-client';
import {
  ApiResponse,
  PaginatedResponse,
  LandPurchaseRequest,
  LandPurchase,
  LandPurchaseHistoryQuery,
  PurchaseValidation,
  PurchaseCostCalculation,
  TeamLandSummary,
  AvailableTile,
  OwnedTileForBuilding,
  TileDetailsWithOwnership,
  ActivityLandOverview,
  ManagerTileOwnership,
  ManagerTileOwnershipQuery,
  LandPurchaseAnalytics,
  LandStatusSummary,
  LandError,
  LandErrorCodes
} from '@/types/land';

/**
 * Land Management Service
 * Implements all land-related API operations for both students/workers and managers
 * Based on the comprehensive land management API documentation
 */
export class LandService {
  private static readonly STUDENT_BASE_PATH = '/user/land-purchase';
  private static readonly MANAGER_BASE_PATH = '/user/manager/land-status';

  // ==========================================
  // STUDENT/WORKER LAND API ENDPOINTS (8 endpoints)
  // ==========================================

  /**
   * Purchase land area on a specific tile
   * POST /user/land-purchase/purchase
   */
  static async purchaseLand(purchaseData: LandPurchaseRequest): Promise<LandPurchase> {
    try {
      const response = await apiClient.post<ApiResponse<LandPurchase>>(
        `${this.STUDENT_BASE_PATH}/purchase`,
        purchaseData
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.purchaseLand error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get team's land purchase history with filtering
   * GET /user/land-purchase/history
   */
  static async getPurchaseHistory(
    query: LandPurchaseHistoryQuery = {}
  ): Promise<PaginatedResponse<LandPurchase>> {
    try {
      const { page = 1, pageSize = 20, tileId, status, startDate, endDate } = query;

      const queryParams: Record<string, any> = {
        page,
        pageSize
      };

      if (tileId !== undefined) queryParams.tileId = tileId;
      if (status) queryParams.status = status;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;

      const response = await apiClient.get<ApiResponse<PaginatedResponse<LandPurchase>>>(
        `${this.STUDENT_BASE_PATH}/history`,
        { params: queryParams }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getPurchaseHistory error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get team's land ownership summary
   * GET /user/land-purchase/owned-lands
   */
  static async getTeamLandOwnership(): Promise<TeamLandSummary> {
    try {
      const response = await apiClient.get<ApiResponse<TeamLandSummary>>(
        `${this.STUDENT_BASE_PATH}/owned-lands`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getTeamLandOwnership error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get available tiles for purchase
   * GET /user/land-purchase/available-tiles
   */
  static async getAvailableTiles(): Promise<{ data: AvailableTile[]; count: number }> {
    try {
      const response = await apiClient.get<ApiResponse<{ success: boolean; data: AvailableTile[] }>>(
        `${this.STUDENT_BASE_PATH}/available-tiles`
      );
      
      // Handle the actual API response structure: { data: { success: true, data: [...] } }
      const apiData = response.data.data;
      if (apiData && apiData.success && Array.isArray(apiData.data)) {
        // Sanitize the tile data to handle null prices
        const sanitizedTiles = apiData.data.map(tile => ({
          ...tile,
          currentGoldPrice: tile.currentGoldPrice ?? 0,
          currentCarbonPrice: tile.currentCarbonPrice ?? 0,
          currentPopulation: tile.currentPopulation ?? 0
        }));
        
        return {
          data: sanitizedTiles,
          count: sanitizedTiles.length
        };
      }
      
      // Fallback for unexpected response structure
      console.warn('Unexpected API response structure:', response.data);
      return {
        data: [],
        count: 0
      };
    } catch (error: any) {
      console.error('LandService.getAvailableTiles error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get team owned tiles for building facilities
   * GET /user/land-purchase/owned-tiles-for-building
   */
  static async getOwnedTilesForBuilding(): Promise<{ data: OwnedTileForBuilding[]; count: number }> {
    try {
      const response = await apiClient.get<ApiResponse<{ success: boolean; data: OwnedTileForBuilding[]; count: number }>>(
        `${this.STUDENT_BASE_PATH}/owned-tiles-for-building`
      );
      
      // Handle the actual API response structure: response.data.data contains {success, data, count}
      if (response.data && response.data.data) {
        const innerData = response.data.data;
        if (innerData.success && Array.isArray(innerData.data)) {
          return {
            data: innerData.data,
            count: innerData.count || innerData.data.length
          };
        }
      }
      
      return { data: [], count: 0 };
    } catch (error: any) {
      console.error('LandService.getOwnedTilesForBuilding error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get detailed tile information with ownership
   * GET /user/land-purchase/tiles/:tileId/details
   */
  static async getTileDetails(tileId: number): Promise<TileDetailsWithOwnership> {
    try {
      const response = await apiClient.get<ApiResponse<TileDetailsWithOwnership>>(
        `${this.STUDENT_BASE_PATH}/tiles/${tileId}/details`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getTileDetails error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Validate purchase capability
   * GET /user/land-purchase/validate-purchase/:tileId/:area
   */
  static async validatePurchase(tileId: number, area: number): Promise<PurchaseValidation> {
    try {
      const response = await apiClient.get(
        `${this.STUDENT_BASE_PATH}/validate-purchase/${tileId}/${area}`
      );
      
      // Handle nested API response structure: { data: { data: { ... } } }
      const apiData = response.data;
      if (apiData && apiData.data && apiData.data.data) {
        return apiData.data.data;
      }
      
      // Fallback for direct data structure
      if (apiData && apiData.data) {
        return apiData.data;
      }
      
      // Final fallback
      return apiData;
    } catch (error: any) {
      console.error('LandService.validatePurchase error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Calculate purchase cost
   * GET /user/land-purchase/calculate-cost/:tileId/:area
   */
  static async calculatePurchaseCost(tileId: number, area: number): Promise<PurchaseCostCalculation> {
    try {
      const response = await apiClient.get<ApiResponse<PurchaseCostCalculation>>(
        `${this.STUDENT_BASE_PATH}/calculate-cost/${tileId}/${area}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.calculatePurchaseCost error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get team's land ownership summary (alternative endpoint)
   * GET /user/land-purchase/summary
   */
  static async getTeamLandSummary(): Promise<TeamLandSummary> {
    try {
      const response = await apiClient.get<ApiResponse<TeamLandSummary>>(
        `${this.STUDENT_BASE_PATH}/summary`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getTeamLandSummary error:', error);
      throw this.handleLandError(error);
    }
  }

  // ==========================================
  // MANAGER LAND OVERSIGHT API ENDPOINTS (5 endpoints)
  // ==========================================

  /**
   * Get activity-wide land ownership overview
   * GET /user/manager/land-status/overview
   */
  static async getActivityLandOverview(): Promise<ActivityLandOverview> {
    try {
      const response = await apiClient.get<ApiResponse<ActivityLandOverview>>(
        `${this.MANAGER_BASE_PATH}/overview`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getActivityLandOverview error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get detailed tile ownership with pagination
   * GET /user/manager/land-status/tiles
   */
  static async getManagerTileOwnership(
    query: ManagerTileOwnershipQuery = {}
  ): Promise<PaginatedResponse<ManagerTileOwnership>> {
    try {
      const { page = 1, pageSize = 20, tileId, landType } = query;

      const queryParams: Record<string, any> = {
        page,
        pageSize
      };

      if (tileId !== undefined) queryParams.tileId = tileId;
      if (landType) queryParams.landType = landType;

      const response = await apiClient.get<ApiResponse<PaginatedResponse<ManagerTileOwnership>>>(
        `${this.MANAGER_BASE_PATH}/tiles`,
        { params: queryParams }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getManagerTileOwnership error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get specific tile ownership information
   * GET /user/manager/land-status/tiles/:tileId/ownership
   */
  static async getSpecificTileOwnership(tileId: number): Promise<ManagerTileOwnership> {
    try {
      const response = await apiClient.get<ApiResponse<ManagerTileOwnership>>(
        `${this.MANAGER_BASE_PATH}/tiles/${tileId}/ownership`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getSpecificTileOwnership error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get comprehensive land purchase analytics
   * GET /user/manager/land-status/analytics
   */
  static async getLandPurchaseAnalytics(): Promise<LandPurchaseAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<LandPurchaseAnalytics>>(
        `${this.MANAGER_BASE_PATH}/analytics`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getLandPurchaseAnalytics error:', error);
      throw this.handleLandError(error);
    }
  }

  /**
   * Get high-level summary statistics
   * GET /user/manager/land-status/summary
   */
  static async getLandStatusSummary(): Promise<LandStatusSummary> {
    try {
      const response = await apiClient.get<ApiResponse<LandStatusSummary>>(
        `${this.MANAGER_BASE_PATH}/summary`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('LandService.getLandStatusSummary error:', error);
      throw this.handleLandError(error);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get effective available area - Updated for unlimited purchases
   */
  static getEffectiveAvailableArea(tile: AvailableTile): number {
    // NEW: If backend hasn't been updated yet, we simulate unlimited area
    // Backend should return 999999 for unlimited, but we handle legacy data
    if (tile.availableArea && tile.availableArea >= 999000) {
      return 999999; // Unlimited
    }
    // For display purposes, treat any tile as having unlimited area
    return 999999;
  }

  /**
   * Check if user can purchase land on a tile - Updated for unlimited areas
   */
  static canPurchaseLand(tile: AvailableTile, area: number): boolean {
    // NEW: Area availability is unlimited, only check basic conditions
    return tile.canPurchase && area > 0 && Number.isInteger(area);
  }

  /**
   * Format land type for display
   */
  static formatLandType(landType: 'PLAIN' | 'COASTAL' | 'MARINE'): string {
    switch (landType) {
      case 'PLAIN':
        return 'Plain';
      case 'COASTAL':
        return 'Coastal';
      case 'MARINE':
        return 'Marine';
      default:
        return 'Unknown';
    }
  }

  /**
   * Calculate ownership percentage for a tile
   */
  static calculateOwnershipPercentage(ownedArea: number, maxArea: number = 25): number {
    return maxArea > 0 ? Math.round((ownedArea / maxArea) * 100) : 0;
  }

  /**
   * Get land type color for UI display
   */
  static getLandTypeColor(landType: 'PLAIN' | 'COASTAL' | 'MARINE'): string {
    switch (landType) {
      case 'PLAIN':
        return '#4CAF50'; // Green
      case 'COASTAL':
        return '#2196F3'; // Blue
      case 'MARINE':
        return '#1976D2'; // Dark Blue
      default:
        return '#9E9E9E'; // Grey
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: 'gold' | 'carbon' | 'total' = 'total'): string {
    // Handle null, undefined, or NaN values
    const safeAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);

    // Return just the formatted amount without currency suffix
    return formattedAmount;
  }

  /**
   * Format area for display - Updated for integer-only areas
   */
  static formatArea(area: number): string {
    // Handle null, undefined, or NaN values
    const safeArea = (typeof area === 'number' && !isNaN(area)) ? area : 0;
    
    // NEW: For integer-only areas, check if it's a whole number
    if (Number.isInteger(safeArea)) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(safeArea);
    }
    
    // Legacy: Still support decimal display for existing data
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 3,
    }).format(safeArea);
  }

  /**
   * Get purchase status color
   */
  static getPurchaseStatusColor(status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'): string {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50'; // Green
      case 'CANCELLED':
        return '#FF9800'; // Orange
      case 'EXPIRED':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  }

  /**
   * Calculate price change percentage
   */
  static calculatePriceChange(currentPrice: number, initialPrice: number): number {
    if (initialPrice === 0) return 0;
    return Math.round(((currentPrice - initialPrice) / initialPrice) * 100);
  }

  /**
   * Validate purchase input - Updated to enforce integer-only areas
   */
  static validatePurchaseInput(area: number, maxGoldCost?: number, maxCarbonCost?: number): string[] {
    const errors: string[] = [];

    if (area <= 0) {
      errors.push('Area must be greater than 0');
    }

    // NEW: Enforce integer-only areas
    if (!Number.isInteger(area)) {
      errors.push('Area must be a whole number (no decimals allowed)');
    }

    if (area < 1) {
      errors.push('Minimum area purchase is 1 unit');
    }

    // REMOVED: Maximum area limit (now unlimited based on resources only)

    if (maxGoldCost !== undefined && maxGoldCost < 0) {
      errors.push('Maximum gold cost cannot be negative');
    }

    if (maxCarbonCost !== undefined && maxCarbonCost < 0) {
      errors.push('Maximum carbon cost cannot be negative');
    }

    return errors;
  }

  /**
   * Handle land service errors consistently
   */
  private static handleLandError(error: any): LandError {
    const errorCode = error?.response?.data?.details?.code || 'UNKNOWN_ERROR';
    const errorMessage = error?.response?.data?.message || error?.message || 'An unknown error occurred';
    
    return {
      code: LandErrorCodes[errorCode as keyof typeof LandErrorCodes] || errorCode,
      message: errorMessage,
      details: error?.response?.data?.details || error
    };
  }

  /**
   * Get error message for display
   */
  static getErrorMessage(error: LandError): string {
    switch (error.code) {
      case LandErrorCodes.TEAM_NOT_MEMBER:
        return 'You must be a team member to purchase land.';
      case LandErrorCodes.TEAM_NOT_ACTIVE_MEMBER:
        return 'You must be an active team member to purchase land.';
      case LandErrorCodes.USER_NO_ACTIVITY:
        return 'You must be enrolled in an activity to purchase land.';
      case LandErrorCodes.TILE_NO_PRICING:
        return 'This tile does not have current pricing information.';
      case LandErrorCodes.INSUFFICIENT_RESOURCES:
        return 'Your team does not have sufficient resources for this purchase.';
      case LandErrorCodes.PRICE_PROTECTION_EXCEEDED:
        return 'The purchase cost exceeds your maximum price limits.';
      case LandErrorCodes.INVALID_AREA_AMOUNT:
        return 'The area amount is invalid for purchase.';
      case LandErrorCodes.TILE_NOT_FOUND:
        return 'The requested tile was not found.';
      default:
        return error.message || 'An error occurred while processing your request.';
    }
  }
}

export default LandService;