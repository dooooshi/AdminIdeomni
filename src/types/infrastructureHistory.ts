import { 
  InfrastructureType, 
  ConnectionStatus, 
  RequestStatus, 
  SubscriptionStatus 
} from '@/lib/services/infrastructureService';

export enum OperationType {
  CONNECTION_REQUESTED = 'CONNECTION_REQUESTED',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  CONNECTION_REJECTED = 'CONNECTION_REJECTED',
  CONNECTION_CANCELLED = 'CONNECTION_CANCELLED',
  CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED',
  
  SUBSCRIPTION_REQUESTED = 'SUBSCRIPTION_REQUESTED',
  SUBSCRIPTION_ACCEPTED = 'SUBSCRIPTION_ACCEPTED',
  SUBSCRIPTION_REJECTED = 'SUBSCRIPTION_REJECTED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
}

export enum ServiceType {
  BASE_STATION = 'BASE_STATION',
  FIRE_STATION = 'FIRE_STATION',
}

export interface Coordinate {
  q: number;
  r: number;
}

export interface FacilityInfo {
  facilityId: string;
  facilityType: string;
  facilityLevel: number;
  teamId: string;
  teamName: string;
}

export interface BaseOperationDetails {
  infrastructureType?: InfrastructureType;
  serviceType?: ServiceType;
  providerFacilityId: string;
  providerFacilityType: string;
  providerFacilityLevel: number;
  consumerFacilityId: string;
  consumerFacilityType: string;
  consumerFacilityLevel: number;
  actorTeamId: string;
  actorRole: 'PROVIDER' | 'CONSUMER' | 'SYSTEM';
  reason?: string;
}

export interface RequestDetails {
  proposedPath?: Coordinate[];
  distance?: number;
  operationPointsNeeded?: number;
  proposedUnitPrice?: number;
  annualServiceFee?: number;
  requestMessage?: string;
}

export interface ConnectionDetails {
  agreedUnitPrice?: number;
  annualServiceFee?: number;
  connectionPath?: Coordinate[];
  coverageTiles?: Coordinate[];
  effectiveDate: string;
}

export interface RejectionDetails {
  rejectionReason: string;
  suggestedAlternative?: string;
  canReapplyAfter?: string;
}

export interface TerminationDetails {
  disconnectedBy: string;
  disconnectionReason: string;
  finalUsage?: number;
  finalBilling?: number;
  unpaidAmount?: number;
  wasEmergency: boolean;
}

export type EventData = 
  | RequestDetails 
  | ConnectionDetails 
  | RejectionDetails 
  | TerminationDetails;

export interface OperationDetails extends BaseOperationDetails {
  eventData: EventData;
}

export interface InfrastructureOperationLog {
  id: string;
  operationType: OperationType;
  providerTeamId?: string;
  providerTeam?: {
    id: string;
    name: string;
  };
  consumerTeamId?: string;
  consumerTeam?: {
    id: string;
    name: string;
  };
  entityType: string;
  entityId: string;
  details: OperationDetails;
  performedBy: string;
  performedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  activityId: string;
  timestamp: string;
  infrastructureType?: InfrastructureType;
  serviceType?: ServiceType;
  actorRole?: string;
  providerFacilityId?: string;
  consumerFacilityId?: string;
  terminationDetail?: ConnectionTerminationDetail;
}

export interface ConnectionTerminationDetail {
  id: string;
  operationLogId: string;
  terminationType: 'VOLUNTARY' | 'FORCED' | 'SYSTEM';
  initiatedBy: 'PROVIDER' | 'CONSUMER' | 'SYSTEM';
  terminationReason: string;
  detailedReason?: string;
  penaltyAmount?: number;
  refundAmount?: number;
  outstandingBalance?: number;
  connectionDuration: number;
  totalResourcesUsed?: number;
  totalServiceFeesPaid?: number;
  connectionId?: string;
  subscriptionId?: string;
  createdAt: string;
}

export interface InfrastructureHistoryQuery {
  teamId?: string;
  activityId?: string;
  role?: 'PROVIDER' | 'CONSUMER';
  infrastructureType?: InfrastructureType;
  serviceType?: ServiceType;
  operationType?: OperationType;
  dateFrom?: string;
  dateTo?: string;
  entityId?: string;
  entityType?: string;
  page?: number;
  pageSize?: number;
}

export interface ConnectionLifecycle {
  connectionId: string;
  connectionType: InfrastructureType;
  providerTeam: FacilityInfo;
  consumerTeam: FacilityInfo;
  events: InfrastructureOperationLog[];
  currentStatus: ConnectionStatus | SubscriptionStatus;
  createdAt: string;
  terminatedAt?: string;
  terminationDetail?: ConnectionTerminationDetail;
}

export interface HistoryStatistics {
  totalConnections: number;
  activeConnections: number;
  terminatedConnections: number;
  averageConnectionDuration: number;
  totalRevenue?: number;
  totalResourcesProvided?: number;
  terminationReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}