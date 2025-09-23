import apiClient from '@/lib/http/api-client';
import {
  InfrastructureHistoryQuery,
  InfrastructureOperationLog,
  ConnectionLifecycle,
  ConnectionTerminationDetail,
  HistoryStatistics,
} from '@/types/infrastructureHistory';

class InfrastructureHistoryService {
  async getConnectionLifecycle(connectionId: string): Promise<ConnectionLifecycle> {
    const response = await apiClient.get(`/infrastructure/history/connection/${connectionId}`);

    // Handle nested data structure from API
    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  async getTeamInfrastructureHistory(query: InfrastructureHistoryQuery): Promise<{
    logs: InfrastructureOperationLog[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const params = new URLSearchParams();
    
    if (query.role) params.append('role', query.role);
    if (query.infrastructureType) params.append('infrastructureType', query.infrastructureType);
    if (query.serviceType) params.append('serviceType', query.serviceType);
    if (query.operationType) params.append('operationType', query.operationType);
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    if (query.entityId) params.append('entityId', query.entityId);
    if (query.entityType) params.append('entityType', query.entityType);
    
    // Add pagination parameters
    if (query.page && query.pageSize) {
      const offset = (query.page - 1) * query.pageSize;
      params.append('limit', query.pageSize.toString());
      params.append('offset', offset.toString());
    } else if (query.pageSize) {
      params.append('limit', query.pageSize.toString());
      params.append('offset', '0');
    }

    const response = await apiClient.get(`/infrastructure/history/team?${params.toString()}`);

    // Handle the actual API response structure: response.data.data contains { data: [], total, limit, offset }
    if (response.data && response.data.data) {
      const responseData = response.data.data;
      return {
        logs: responseData.data || responseData || [],
        total: responseData.total || 0,
        page: query.page || 1,
        pageSize: responseData.limit || query.pageSize || 50
      };
    }

    // Fallback for direct data structure
    return {
      logs: response.data || [],
      total: response.data?.length || 0,
      page: query.page || 1,
      pageSize: 50
    };
  }

  async getTerminationDetails(connectionId: string): Promise<ConnectionTerminationDetail | null> {
    const response = await apiClient.get(`/infrastructure/history/termination/${connectionId}`);

    // Handle nested data structure from API
    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  async getHistoryStatistics(query: {
    teamId?: string;
    activityId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<HistoryStatistics> {
    const params = new URLSearchParams();

    if (query.teamId) params.append('teamId', query.teamId);
    if (query.activityId) params.append('activityId', query.activityId);
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);

    const response = await apiClient.get(`/infrastructure/history/statistics?${params.toString()}`);

    // Handle nested data structure from API
    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  async getRecentOperations(limit: number = 10): Promise<InfrastructureOperationLog[]> {
    const response = await apiClient.get(`/infrastructure/history/recent?limit=${limit}`);

    // Handle the actual API response structure: response.data.data contains the array
    if (response.data && response.data.data) {
      // If data.data is an object with a data property (triple nesting)
      if (typeof response.data.data === 'object' && response.data.data.data) {
        return response.data.data.data || [];
      }
      // If data.data is the array directly
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // If data.data is an object with items/logs property
      if (response.data.data.items) {
        return response.data.data.items;
      }
      if (response.data.data.logs) {
        return response.data.data.logs;
      }
    }

    // Fallback for direct data structure
    return response.data || [];
  }

  async exportHistory(query: InfrastructureHistoryQuery & { format: 'csv' | 'json' | 'xlsx' }): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (query.role) params.append('role', query.role);
    if (query.infrastructureType) params.append('infrastructureType', query.infrastructureType);
    if (query.serviceType) params.append('serviceType', query.serviceType);
    if (query.operationType) params.append('operationType', query.operationType);
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    params.append('format', query.format);

    const response = await apiClient.get(`/infrastructure/history/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  async searchHistory(searchTerm: string, filters?: {
    entityType?: string;
    operationType?: string;
  }): Promise<InfrastructureOperationLog[]> {
    const params = new URLSearchParams();
    params.append('search', searchTerm);

    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.operationType) params.append('operationType', filters.operationType);

    const response = await apiClient.get(`/infrastructure/history/search?${params.toString()}`);

    // Handle the nested data structure from API
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // If data.data is an object with items/logs property
      if (response.data.data.items) {
        return response.data.data.items;
      }
      if (response.data.data.logs) {
        return response.data.data.logs;
      }
    }

    return response.data || [];
  }

  async getConnectionsByFacility(facilityId: string, role: 'provider' | 'consumer'): Promise<{
    active: InfrastructureOperationLog[];
    terminated: InfrastructureOperationLog[];
    pending: InfrastructureOperationLog[];
  }> {
    const response = await apiClient.get(`/infrastructure/history/facility/${facilityId}?role=${role}`);

    // Handle nested data structure from API
    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  async getTerminationTrends(query: {
    activityId?: string;
    dateFrom?: string;
    dateTo?: string;
    groupBy: 'day' | 'week' | 'month';
  }): Promise<{
    date: string;
    voluntary: number;
    forced: number;
    system: number;
    total: number;
  }[]> {
    const params = new URLSearchParams();

    if (query.activityId) params.append('activityId', query.activityId);
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    params.append('groupBy', query.groupBy);

    const response = await apiClient.get(`/infrastructure/history/termination-trends?${params.toString()}`);

    // Handle nested data structure from API
    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  formatHistoryForTimeline(logs: InfrastructureOperationLog[]): {
    date: string;
    events: InfrastructureOperationLog[];
  }[] {
    const grouped = logs.reduce((acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {} as Record<string, InfrastructureOperationLog[]>);

    return Object.entries(grouped)
      .map(([date, events]) => ({ date, events }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getActivitySummary(activityId: string): Promise<{
    totalOperations: number;
    activeConnections: number;
    activeSubscriptions: number;
    pendingRequests: number;
    recentTerminations: number;
    topProviders: { teamId: string; teamName: string; connectionCount: number }[];
    topConsumers: { teamId: string; teamName: string; connectionCount: number }[];
  }> {
    const response = await apiClient.get(`/infrastructure/history/activity-summary/${activityId}`);

    // Handle nested data structure from API
    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }
}

export default new InfrastructureHistoryService();