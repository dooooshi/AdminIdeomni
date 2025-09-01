// Resource Consumption Service - Uses API endpoints
import apiClient from '@/lib/http/api-client';
import { 
  ResourceType, 
  TransactionStatus, 
  ResourceTransaction,
  ResourceHistoryFilter
} from '@/types/resourceConsumption';

interface ConsumptionSummary {
  teamId: string;
  teamName: string;
  totalTransactions: number;
  totalCost: number;
  byResourceType: {
    WATER?: {
      count: number;
      amount: number;
    };
    POWER?: {
      count: number;
      amount: number;
    };
  };
  period?: {
    startDate: string;
    endDate: string;
  };
}

interface HistoryTransaction {
  id: string;
  resourceType: ResourceType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  purpose: string;
  status: TransactionStatus;
  facilityId: string;
  facilityName: string;
  providerFacilityId: string;
  providerFacilityName: string;
  providerTeamId: string;
  providerTeamName: string;
  referenceType?: string;
  referenceId?: string;
  transactionDate: string;
  initiatedBy: string;
}

export class ResourceConsumptionService {
  private static instance: ResourceConsumptionService;

  private constructor() {}

  static getInstance(): ResourceConsumptionService {
    if (!ResourceConsumptionService.instance) {
      ResourceConsumptionService.instance = new ResourceConsumptionService();
    }
    return ResourceConsumptionService.instance;
  }

  /**
   * Get team resource consumption history
   */
  async getConsumptionHistory(params: ResourceHistoryFilter): Promise<ResourceTransaction[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.resourceType) queryParams.append('resourceType', params.resourceType);
      if (params.purpose) queryParams.append('purpose', params.purpose);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await apiClient.get(`/user/team/resource-consumption/history?${queryParams.toString()}`);
      
      // Transform API response to match our ResourceTransaction interface
      const transactions: HistoryTransaction[] = response.data.data || response.data || [];
      
      return transactions.map(tx => ({
        id: tx.id,
        resourceType: tx.resourceType,
        quantity: tx.quantity,
        unitPrice: tx.unitPrice,
        totalAmount: tx.totalAmount,
        connectionId: '',
        consumerFacilityId: tx.facilityId,
        consumerTeamId: '',
        providerFacilityId: tx.providerFacilityId,
        providerTeamId: tx.providerTeamId,
        purpose: tx.purpose,
        referenceType: tx.referenceType,
        referenceId: tx.referenceId,
        status: tx.status,
        failureReason: undefined,
        operationHistoryId: undefined,
        balanceHistoryId: undefined,
        activityId: '',
        initiatedBy: tx.initiatedBy,
        transactionDate: new Date(tx.transactionDate),
        metadata: {
          facilityName: tx.facilityName,
          providerFacilityName: tx.providerFacilityName,
          providerTeamName: tx.providerTeamName
        }
      }));
    } catch (error) {
      console.error('Error fetching consumption history:', error);
      return [];
    }
  }

  /**
   * Get facility-specific resource consumption history
   */
  async getFacilityConsumptionHistory(
    facilityId: string, 
    params: ResourceHistoryFilter
  ): Promise<ResourceTransaction[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.resourceType) queryParams.append('resourceType', params.resourceType);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await apiClient.get(
        `/user/facility/${facilityId}/resource-consumption/history?${queryParams.toString()}`
      );
      
      const transactions: HistoryTransaction[] = response.data.data || response.data || [];
      
      return transactions.map(tx => ({
        id: tx.id,
        resourceType: tx.resourceType,
        quantity: tx.quantity,
        unitPrice: tx.unitPrice,
        totalAmount: tx.totalAmount,
        connectionId: '',
        consumerFacilityId: tx.facilityId,
        consumerTeamId: '',
        providerFacilityId: tx.providerFacilityId,
        providerTeamId: tx.providerTeamId,
        purpose: tx.purpose,
        referenceType: tx.referenceType,
        referenceId: tx.referenceId,
        status: tx.status,
        failureReason: undefined,
        operationHistoryId: undefined,
        balanceHistoryId: undefined,
        activityId: '',
        initiatedBy: tx.initiatedBy,
        transactionDate: new Date(tx.transactionDate),
        metadata: {
          facilityName: tx.facilityName,
          providerFacilityName: tx.providerFacilityName,
          providerTeamName: tx.providerTeamName
        }
      }));
    } catch (error) {
      console.error('Error fetching facility consumption history:', error);
      return [];
    }
  }

  /**
   * Get team resource consumption summary
   */
  async getConsumptionSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ConsumptionSummary | null> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const response = await apiClient.get(
        `/user/team/resource-consumption/summary?${queryParams.toString()}`
      );
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching consumption summary:', error);
      return null;
    }
  }

  /**
   * Get team resource provision history (income from providing resources)
   */
  async getProvisionHistory(params: ResourceHistoryFilter): Promise<ResourceTransaction[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.resourceType) queryParams.append('resourceType', params.resourceType);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await apiClient.get(
        `/user/team/resource-provision/history?${queryParams.toString()}`
      );
      
      const transactions: HistoryTransaction[] = response.data.data || response.data || [];
      
      return transactions.map(tx => ({
        id: tx.id,
        resourceType: tx.resourceType,
        quantity: tx.quantity,
        unitPrice: tx.unitPrice,
        totalAmount: tx.totalAmount,
        connectionId: '',
        consumerFacilityId: tx.facilityId,
        consumerTeamId: '',
        providerFacilityId: tx.providerFacilityId,
        providerTeamId: tx.providerTeamId,
        purpose: tx.purpose,
        referenceType: tx.referenceType,
        referenceId: tx.referenceId,
        status: tx.status,
        failureReason: undefined,
        operationHistoryId: undefined,
        balanceHistoryId: undefined,
        activityId: '',
        initiatedBy: tx.initiatedBy,
        transactionDate: new Date(tx.transactionDate),
        metadata: {
          facilityName: tx.facilityName,
          providerFacilityName: tx.providerFacilityName,
          providerTeamName: tx.providerTeamName
        }
      }));
    } catch (error) {
      console.error('Error fetching provision history:', error);
      return [];
    }
  }
}

export default ResourceConsumptionService.getInstance();