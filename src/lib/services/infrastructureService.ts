import apiClient from '@/lib/http/api-client';

// Enums
export enum InfrastructureType {
  WATER = 'WATER',
  POWER = 'POWER',
  BASE_STATION = 'BASE_STATION',
  FIRE_STATION = 'FIRE_STATION',
}

export enum ConnectionStatus {
  ACTIVE = 'ACTIVE',
  DISCONNECTED = 'DISCONNECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export enum OperationalStatus {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  NON_OPERATIONAL = 'NON_OPERATIONAL',
}

// Interfaces
export interface Coordinates {
  q: number;
  r: number;
}

export interface ProviderInfo {
  facilityId: string;
  teamId: string;
  teamName: string;
  facilityLevel: number;
  unitPrice?: number;
  annualFee?: number;
}

export interface ConnectionDetails {
  distance: number;
  operationPointsCost: number;
  connectedAt: string;
}

export interface SubscriptionDetails {
  distance: number;
  subscribedAt: string;
  nextBillingDate: string;
}

export interface InfrastructureStatus {
  water: {
    required: boolean;
    connected: boolean;
    provider: ProviderInfo | null;
    connectionDetails: ConnectionDetails | null;
  };
  power: {
    required: boolean;
    connected: boolean;
    provider: ProviderInfo | null;
    connectionDetails: ConnectionDetails | null;
  };
  baseStation: {
    required: boolean;
    covered: boolean;
    provider: ProviderInfo | null;
    subscriptionDetails: SubscriptionDetails | null;
  };
  fireStation: {
    required: boolean;
    covered: boolean;
    provider: ProviderInfo | null;
    subscriptionDetails: SubscriptionDetails | null;
  };
}

export interface FacilityInfrastructureStatus {
  facilityId: string;
  facilityType: string;
  category: string;
  requiresInfrastructure: boolean;
  infrastructureStatus: InfrastructureStatus;
  operationalStatus: OperationalStatus;
  missingInfrastructure: InfrastructureType[];
  operationalPercentage: number;
}

export interface TeamFacility {
  facilityId: string;
  facilityType: string;
  tileCoordinates: Coordinates;
  level: number;
  operationalStatus: OperationalStatus;
  infrastructureStatus?: {
    water?: { connected: boolean; providerTeam?: string };
    power?: { connected: boolean; providerTeam?: string };
    baseStation?: { covered: boolean; providerTeam?: string };
    fireStation?: { covered: boolean; providerTeam?: string };
  };
  missingInfrastructure?: InfrastructureType[];
}

export interface TeamFacilitiesStatus {
  teamId: string;
  teamName: string;
  facilities: TeamFacility[];
  summary: {
    totalFacilities: number;
    fullyOperational: number;
    partiallyOperational: number;
    nonOperational: number;
  };
}

export interface ProviderInfo {
  providerId: string;
  providerTeamId: string;
  providerTeamName: string;
  facilityLevel: number;
  location: Coordinates;
  distance: number;
  operationPointsCost: number;
  unitPrice: number;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  pathValid: boolean;
  pathCrossesMarine: boolean;
  estimatedPath?: Coordinates[];
}

export interface ServiceProvider {
  serviceId: string;
  providerId: string;
  providerTeamId: string;
  providerTeamName: string;
  facilityLevel: number;
  location: Coordinates;
  distance: number;
  influenceRange: number;
  inRange: boolean;
  annualFee: number;
  currentSubscribers?: number;
}

export interface ConnectionRequest {
  requestId: string;
  connectionType: InfrastructureType;
  consumerTeam: {
    teamId: string;
    teamName: string;
  };
  consumerFacility: {
    facilityId: string;
    type: string;
    location: Coordinates;
  };
  providerTeam?: {
    teamId: string;
    teamName: string;
  };
  providerFacility?: {
    facilityId: string;
    type: string;
    location: Coordinates;
  };
  distance: number;
  operationPointsNeeded: number;
  proposedUnitPrice?: number;
  status: RequestStatus;
  createdAt: string;
}

export interface Connection {
  connectionId: string;
  connectionType: InfrastructureType;
  providerFacility: {
    facilityId: string;
    type: string;
    level: number;
  };
  consumerFacility: {
    facilityId: string;
    teamName: string;
    type: string;
  };
  operationPointsCost: number;
  unitPrice: number;
  status: ConnectionStatus;
  connectedAt: string;
}

export interface ServiceSubscription {
  subscriptionId: string;
  serviceType: InfrastructureType;
  consumerFacility: {
    facilityId: string;
    teamName: string;
    type: string;
    location: Coordinates;
  };
  annualFee: number;
  status: SubscriptionStatus;
  activatedAt?: string;
  nextBillingDate?: string;
}

export interface ProviderCapacity {
  facilityId: string;
  facilityType: string;
  level: number;
  baseOperationPoints: number;
  levelMultiplier: number;
  totalOperationPoints: number;
  connections: Array<{
    consumerId: string;
    distance: number;
    operationPointsCost: number;
  }>;
  usedOperationPoints: number;
  availableOperationPoints: number;
  maxAdditionalConnections: number;
}

export interface ConsumerRequirements {
  facilityId: string;
  facilityType: string;
  category: string;
  requirements: {
    water?: {
      required: boolean;
      dailyConsumption?: number;
      currentProvider?: string;
      unitPrice?: number;
    };
    power?: {
      required: boolean;
      dailyConsumption?: number;
      currentProvider?: string;
      unitPrice?: number;
    };
    baseStation?: {
      required: boolean;
      currentProvider?: string;
      annualFee?: number;
    };
    fireStation?: {
      required: boolean;
      currentProvider?: string;
      annualFee?: number;
    };
  };
  operationalStatus: OperationalStatus;
  estimatedDailyCost?: number;
  estimatedAnnualServiceCost?: number;
}

export interface PathValidation {
  from: Coordinates;
  to: Coordinates;
  distance: number;
  pathValid: boolean;
  crossesMarine: boolean;
  suggestedPath?: Coordinates[];
  alternativePaths?: Coordinates[][];
}

export interface InfluenceRange {
  facilityId: string;
  facilityType: string;
  level: number;
  location: Coordinates;
  influenceRange: number;
  coveredTiles: Array<Coordinates & { distance: number }>;
  facilitiesInRange: Array<{
    facilityId: string;
    teamName: string;
    facilityType: string;
    distance: number;
    subscriptionStatus?: SubscriptionStatus;
  }>;
}

class InfrastructureService {
  // Status APIs
  async getFacilityStatus(facilityId: string): Promise<FacilityInfrastructureStatus> {
    const response = await apiClient.get(`/infrastructure/status/facility/${facilityId}`);
    return response.data.data;
  }

  async getTeamFacilitiesStatus(activityId?: string): Promise<TeamFacilitiesStatus> {
    const params = activityId ? { activityId } : {};
    const response = await apiClient.get('/infrastructure/status/team/facilities', { params });
    return response.data.data;
  }

  async getActivityOverview(): Promise<any> {
    const response = await apiClient.get('/infrastructure/status/activity/overview');
    return response.data.data;
  }

  // Discovery APIs
  async discoverConnections(
    facilityId: string,
    type?: 'WATER' | 'POWER',
    maxDistance?: number,
    sortBy?: 'distance' | 'price' | 'capacity'
  ): Promise<{
    consumerFacility: any;
    waterProviders?: ProviderInfo[];
    powerProviders?: ProviderInfo[];
  }> {
    const params = { type, maxDistance, sortBy };
    const response = await apiClient.get(`/infrastructure/discovery/available/connections/${facilityId}`, { params });
    return response.data.data;
  }

  async discoverServices(
    facilityId: string,
    type?: 'BASE_STATION' | 'FIRE_STATION'
  ): Promise<{
    consumerFacility: any;
    baseStations?: ServiceProvider[];
    fireStations?: ServiceProvider[];
  }> {
    const params = type ? { type } : {};
    const response = await apiClient.get(`/infrastructure/discovery/available/services/${facilityId}`, { params });
    return response.data.data;
  }

  async getReachableFacilities(
    facilityId: string,
    facilityCategory?: string
  ): Promise<any> {
    const params = facilityCategory ? { facilityCategory } : {};
    const response = await apiClient.get(`/infrastructure/discovery/reachable/${facilityId}`, { params });
    return response.data.data;
  }

  // Connection APIs
  async requestConnection(
    consumerFacilityId: string,
    providerFacilityId: string,
    connectionType: 'WATER' | 'POWER',
    proposedUnitPrice?: number
  ): Promise<any> {
    const response = await apiClient.post('/infrastructure/connections/request', {
      consumerFacilityId,
      providerFacilityId,
      connectionType,
      proposedUnitPrice,
    });
    return response.data.data;
  }

  async getProviderRequests(
    status?: RequestStatus,
    connectionType?: 'WATER' | 'POWER',
    page?: number,
    limit?: number
  ): Promise<{ requests: ConnectionRequest[]; pagination: any }> {
    const params = { status, connectionType, page, limit };
    const response = await apiClient.get('/infrastructure/connections/requests/provider', { params });
    // Handle both response formats
    const data = response.data.data;
    if (Array.isArray(data)) {
      // If data is directly an array, wrap it
      return { 
        requests: data.map(req => ({
          ...req,
          requestId: req.id, // Map id to requestId for compatibility
        })), 
        pagination: null 
      };
    }
    // If data already has the expected structure
    return data;
  }

  async getConsumerRequests(
    status?: RequestStatus,
    connectionType?: 'WATER' | 'POWER',
    page?: number,
    limit?: number
  ): Promise<{ requests: ConnectionRequest[]; pagination: any }> {
    const params = { status, connectionType, page, limit };
    const response = await apiClient.get('/infrastructure/connections/requests/consumer', { params });
    // Handle both response formats
    const data = response.data.data;
    if (Array.isArray(data)) {
      // If data is directly an array, wrap it
      return { 
        requests: data.map(req => ({
          ...req,
          requestId: req.id, // Map id to requestId for compatibility
        })), 
        pagination: null 
      };
    }
    // If data already has the expected structure
    return data;
  }

  async acceptConnectionRequest(requestId: string, unitPrice: number): Promise<any> {
    const response = await apiClient.put(`/infrastructure/connections/requests/${requestId}/accept`, { unitPrice });
    return response.data.data;
  }

  async rejectConnectionRequest(requestId: string, reason?: string): Promise<any> {
    const response = await apiClient.put(`/infrastructure/connections/requests/${requestId}/reject`, { reason });
    return response.data.data;
  }

  async cancelConnectionRequest(requestId: string, reason?: string): Promise<any> {
    const response = await apiClient.put(`/infrastructure/connections/requests/${requestId}/cancel`, { reason });
    return response.data.data;
  }

  async disconnectConnection(connectionId: string, reason?: string): Promise<any> {
    const response = await apiClient.delete(`/infrastructure/connections/${connectionId}`, {
      data: { reason },
    });
    return response.data.data;
  }

  async getProviderConnections(
    facilityId?: string,
    connectionType?: 'WATER' | 'POWER',
    status?: ConnectionStatus
  ): Promise<{ connections: Connection[]; summary: any }> {
    const params = { facilityId, connectionType, status };
    const response = await apiClient.get('/infrastructure/connections/provider', { params });
    // Handle both response formats
    const data = response.data.data;
    if (Array.isArray(data)) {
      // If data is directly an array, wrap it
      return { 
        connections: data.map(conn => ({
          ...conn,
          connectionId: conn.id || conn.connectionId, // Map id to connectionId for compatibility
        })), 
        summary: null 
      };
    }
    // If data already has the expected structure
    return data;
  }

  async getConsumerConnections(
    facilityId?: string,
    connectionType?: 'WATER' | 'POWER',
    status?: ConnectionStatus
  ): Promise<{ connections: Connection[]; summary: any }> {
    const params = { facilityId, connectionType, status };
    const response = await apiClient.get('/infrastructure/connections/consumer', { params });
    // Handle both response formats
    const data = response.data.data;
    if (Array.isArray(data)) {
      // If data is directly an array, wrap it
      return { 
        connections: data.map(conn => ({
          ...conn,
          connectionId: conn.id || conn.connectionId, // Map id to connectionId for compatibility
        })), 
        summary: null 
      };
    }
    // If data already has the expected structure
    return data;
  }

  // Service APIs
  async subscribeToService(
    consumerFacilityId: string,
    serviceId: string,
    proposedAnnualFee?: number
  ): Promise<any> {
    const response = await apiClient.post('/infrastructure/services/subscribe', {
      consumerFacilityId,
      serviceId,
      proposedAnnualFee,
    });
    return response.data.data;
  }

  async getProviderSubscriptions(
    serviceType?: 'BASE_STATION' | 'FIRE_STATION',
    status?: SubscriptionStatus
  ): Promise<{ subscriptions: ServiceSubscription[]; summary: any }> {
    const params = { serviceType, status };
    const response = await apiClient.get('/infrastructure/services/subscriptions/provider', { params });
    const data = response.data.data;
    return { 
      subscriptions: data?.subscriptions || [], 
      summary: data?.summary || null 
    };
  }

  async getConsumerSubscriptions(
    serviceType?: 'BASE_STATION' | 'FIRE_STATION',
    status?: SubscriptionStatus
  ): Promise<{ subscriptions: ServiceSubscription[]; summary: any }> {
    const params = { serviceType, status };
    const response = await apiClient.get('/infrastructure/services/subscriptions/consumer', { params });
    const data = response.data.data;
    return { 
      subscriptions: data?.subscriptions || [], 
      summary: data?.summary || null 
    };
  }

  async acceptSubscription(
    subscriptionId: string,
    annualFee: number,
    startDate?: string
  ): Promise<any> {
    const response = await apiClient.put(`/infrastructure/services/subscriptions/${subscriptionId}/accept`, {
      annualFee,
      startDate,
    });
    return response.data.data;
  }

  async cancelSubscription(
    subscriptionId: string,
    reason?: string,
    effectiveDate?: string
  ): Promise<any> {
    const response = await apiClient.put(`/infrastructure/services/subscriptions/${subscriptionId}/cancel`, {
      reason,
      effectiveDate,
    });
    return response.data.data;
  }

  // Operation APIs
  async getProviderCapacity(facilityId: string): Promise<ProviderCapacity> {
    const response = await apiClient.get(`/infrastructure/operations/provider/capacity/${facilityId}`);
    return response.data.data;
  }

  async getConsumerRequirements(facilityId: string): Promise<ConsumerRequirements> {
    const response = await apiClient.get(`/infrastructure/operations/consumer/requirements/${facilityId}`);
    return response.data.data;
  }

  async validatePath(
    fromQ: number,
    fromR: number,
    toQ: number,
    toR: number,
    activityId: string
  ): Promise<PathValidation> {
    const params = { fromQ, fromR, toQ, toR, activityId };
    const response = await apiClient.get('/infrastructure/operations/path-validation', { params });
    return response.data.data;
  }

  async calculateDistance(
    fromQ: number,
    fromR: number,
    toQ: number,
    toR: number
  ): Promise<{ from: Coordinates; to: Coordinates; distance: number; operationPointsCost: number }> {
    const params = { fromQ, fromR, toQ, toR };
    const response = await apiClient.get('/infrastructure/operations/distance', { params });
    return response.data.data;
  }

  async getInfluenceRange(facilityId: string): Promise<InfluenceRange> {
    const response = await apiClient.get(`/infrastructure/operations/influence-range/${facilityId}`);
    return response.data.data;
  }
}

export default new InfrastructureService();