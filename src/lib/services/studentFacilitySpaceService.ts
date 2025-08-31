import apiClient from '@/lib/http/api-client';
import type {
  TeamFacilitySpaceOverviewResponse,
  FacilitySpaceDetailsResponse,
  TeamSpaceUtilizationResponse,
  FacilitySpaceTableRow,
  UtilizationSummaryTableRow,
  AlertsTableRow,
  FacilitySpaceInfo,
  SpaceAlert,
  FacilityTypeUtilization,
} from '@/types/studentFacilitySpace';
import {
  UTILIZATION_THRESHOLDS,
  UTILIZATION_COLOR_RANGES,
} from '@/types/studentFacilitySpace';
import { FacilityType } from '@/types/facilities';

/**
 * Student Facility Space Service
 * Handles facility space status retrieval for students
 * Based on the API documentation from docs/facility/facility-space/student-api-mvp.md
 */
export class StudentFacilitySpaceService {
  private static readonly BASE_PATH = '/user/facility-space';

  /**
   * Helper method to extract data from API response wrapper
   */
  private static extractResponseData<T>(response: any): T {
    // The API response comes as { data: { data: {...}, success: true, ... } }
    // We need to extract the inner data object
    if (response?.data) {
      // Return the entire response.data which contains success, data, etc.
      return response.data as T;
    }
    
    // Fallback - return entire response
    return response;
  }

  // ==================== API ENDPOINTS ====================

  /**
   * Get team's facility space overview
   * GET /api/user/facility-space/team/overview
   */
  static async getTeamFacilitySpaceOverview(): Promise<TeamFacilitySpaceOverviewResponse> {
    try {
      const response = await apiClient.get<TeamFacilitySpaceOverviewResponse>(
        `${this.BASE_PATH}/team/overview`
      );
      return this.extractResponseData(response);
    } catch (error) {
      console.error('Error fetching team facility space overview:', error);
      throw error;
    }
  }

  /**
   * Get specific facility space details
   * GET /api/user/facility-space/facilities/{facilityInstanceId}
   */
  static async getFacilitySpaceDetails(
    facilityInstanceId: string
  ): Promise<FacilitySpaceDetailsResponse> {
    try {
      const response = await apiClient.get<FacilitySpaceDetailsResponse>(
        `${this.BASE_PATH}/facilities/${facilityInstanceId}`
      );
      return this.extractResponseData(response);
    } catch (error) {
      console.error('Error fetching facility space details:', error);
      throw error;
    }
  }

  /**
   * Get team space utilization trends
   * GET /api/user/facility-space/team/utilization
   */
  static async getTeamSpaceUtilization(): Promise<TeamSpaceUtilizationResponse> {
    try {
      const response = await apiClient.get<TeamSpaceUtilizationResponse>(
        `${this.BASE_PATH}/team/utilization`
      );
      return this.extractResponseData(response);
    } catch (error) {
      console.error('Error fetching team space utilization:', error);
      throw error;
    }
  }

  // ==================== DATA TRANSFORMATION METHODS ====================

  /**
   * Transform facility space info to table row format
   */
  static transformToTableRow(facility: FacilitySpaceInfo): FacilitySpaceTableRow {
    const { q, r, s } = facility.tileCoordinates;
    return {
      id: facility.facilityInstanceId,
      facilityName: facility.facilityName,
      facilityType: facility.facilityType,
      location: `(${q}, ${r}, ${s})`,
      level: facility.level,
      totalSpace: facility.spaceMetrics.totalSpace,
      usedSpace: facility.spaceMetrics.usedSpace,
      availableSpace: facility.spaceMetrics.availableSpace,
      utilizationRate: facility.spaceMetrics.utilizationRate,
      rawMaterialSpace: facility.spaceMetrics.rawMaterialSpace,
      productSpace: facility.spaceMetrics.productSpace,
    };
  }

  /**
   * Transform utilization data to summary table rows
   */
  static transformToUtilizationSummaryRows(
    utilizationData: FacilityTypeUtilization[]
  ): UtilizationSummaryTableRow[] {
    return utilizationData.map((item, index) => ({
      id: `util-${index}`,
      category: item.facilityType,
      facilityCount: item.count,
      totalSpace: item.totalSpace,
      usedSpace: item.usedSpace,
      availableSpace: item.totalSpace - item.usedSpace,
      utilizationRate: item.utilizationRate,
    }));
  }

  /**
   * Transform alerts to table rows
   */
  static transformToAlertRows(alerts: SpaceAlert[]): AlertsTableRow[] {
    return alerts.map((alert, index) => ({
      id: `alert-${index}`,
      facilityName: alert.facilityName,
      alertType: alert.type,
      message: alert.message,
      severity: alert.severity,
      facilityInstanceId: alert.facilityInstanceId,
    }));
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get utilization status color based on percentage
   */
  static getUtilizationColor(utilizationRate: number): string {
    if (utilizationRate >= UTILIZATION_THRESHOLDS.CRITICAL) {
      return UTILIZATION_COLOR_RANGES.CRITICAL;
    } else if (utilizationRate >= UTILIZATION_THRESHOLDS.HIGH) {
      return UTILIZATION_COLOR_RANGES.HIGH;
    } else if (utilizationRate >= UTILIZATION_THRESHOLDS.MEDIUM) {
      return UTILIZATION_COLOR_RANGES.MEDIUM;
    }
    return UTILIZATION_COLOR_RANGES.LOW;
  }

  /**
   * Format space value with units
   */
  static formatSpaceValue(value: number, showUnit: boolean = true): string {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
    
    return showUnit ? `${formatted} Carbon Units` : formatted;
  }

  /**
   * Format utilization percentage
   */
  static formatUtilizationRate(rate: number): string {
    return `${rate.toFixed(1)}%`;
  }

  /**
   * Calculate total space metrics from facilities array
   */
  static calculateTotalMetrics(facilities: FacilitySpaceInfo[]): {
    totalSpace: number;
    totalUsed: number;
    totalAvailable: number;
    averageUtilization: number;
  } {
    const totals = facilities.reduce(
      (acc, facility) => ({
        totalSpace: acc.totalSpace + facility.spaceMetrics.totalSpace,
        totalUsed: acc.totalUsed + facility.spaceMetrics.usedSpace,
        totalAvailable: acc.totalAvailable + facility.spaceMetrics.availableSpace,
      }),
      { totalSpace: 0, totalUsed: 0, totalAvailable: 0 }
    );

    const averageUtilization = totals.totalSpace > 0
      ? (totals.totalUsed / totals.totalSpace) * 100
      : 0;

    return {
      ...totals,
      averageUtilization,
    };
  }

  /**
   * Filter facilities by utilization threshold
   */
  static filterByUtilization(
    facilities: FacilitySpaceInfo[],
    minUtilization?: number,
    maxUtilization?: number
  ): FacilitySpaceInfo[] {
    return facilities.filter(facility => {
      const rate = facility.spaceMetrics.utilizationRate;
      const meetsMin = minUtilization === undefined || rate >= minUtilization;
      const meetsMax = maxUtilization === undefined || rate <= maxUtilization;
      return meetsMin && meetsMax;
    });
  }

  /**
   * Sort facilities by specified field
   */
  static sortFacilities(
    facilities: FacilitySpaceTableRow[],
    sortBy: keyof FacilitySpaceTableRow,
    direction: 'asc' | 'desc' = 'asc'
  ): FacilitySpaceTableRow[] {
    return [...facilities].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Get facility type display name
   */
  static getFacilityTypeName(type: FacilityType): string {
    const typeNames: Record<FacilityType, string> = {
      [FacilityType.MINE]: 'Mine',
      [FacilityType.QUARRY]: 'Quarry',
      [FacilityType.FOREST]: 'Forest',
      [FacilityType.FARM]: 'Farm',
      [FacilityType.RANCH]: 'Ranch',
      [FacilityType.FISHERY]: 'Fishery',
      [FacilityType.FACTORY]: 'Factory',
      [FacilityType.MALL]: 'Mall',
      [FacilityType.WAREHOUSE]: 'Warehouse',
      [FacilityType.WATER_PLANT]: 'Water Plant',
      [FacilityType.POWER_PLANT]: 'Power Plant',
      [FacilityType.BASE_STATION]: 'Base Station',
      [FacilityType.FIRE_STATION]: 'Fire Station',
      [FacilityType.SCHOOL]: 'School',
      [FacilityType.HOSPITAL]: 'Hospital',
      [FacilityType.PARK]: 'Park',
      [FacilityType.CINEMA]: 'Cinema',
    };
    return typeNames[type] || type;
  }

  /**
   * Check if facility needs attention based on utilization
   */
  static needsAttention(utilizationRate: number): boolean {
    return utilizationRate >= UTILIZATION_THRESHOLDS.HIGH;
  }

  /**
   * Group facilities by type
   */
  static groupByFacilityType(
    facilities: FacilitySpaceInfo[]
  ): Map<FacilityType, FacilitySpaceInfo[]> {
    const grouped = new Map<FacilityType, FacilitySpaceInfo[]>();
    
    facilities.forEach(facility => {
      const type = facility.facilityType;
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(facility);
    });
    
    return grouped;
  }

  /**
   * Export table data to CSV
   */
  static exportToCSV(data: FacilitySpaceTableRow[], filename: string = 'facility-space-data.csv'): void {
    const headers = [
      'Facility Name',
      'Type',
      'Location',
      'Level',
      'Total Space',
      'Used Space',
      'Available Space',
      'Utilization Rate (%)',
      'Raw Material Space',
      'Product Space',
    ];

    const rows = data.map(row => [
      row.facilityName,
      row.facilityType,
      row.location,
      row.level.toString(),
      row.totalSpace.toString(),
      row.usedSpace.toString(),
      row.availableSpace.toString(),
      row.utilizationRate.toFixed(2),
      row.rawMaterialSpace.toString(),
      row.productSpace.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default StudentFacilitySpaceService;