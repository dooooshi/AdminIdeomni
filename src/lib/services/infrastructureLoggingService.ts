import apiClient from '@/lib/http/api-client';
import {
  OperationType,
  OperationDetails,
  InfrastructureOperationLog,
  ConnectionTerminationDetail,
  ServiceType,
} from '@/types/infrastructureHistory';
import { InfrastructureType } from './infrastructureService';
import {
  createRequestDetails,
  createConnectionDetails,
  createRejectionDetails,
  createTerminationDetails,
  classifyTerminationType,
  calculateConnectionDuration,
} from '@/lib/utils/infrastructureHistoryHelpers';

export interface LogConnectionRequestParams {
  connectionType: InfrastructureType;
  consumerTeamId: string;
  consumerTeamName: string;
  providerTeamId: string;
  providerTeamName: string;
  consumerFacility: {
    id: string;
    type: string;
    level: number;
  };
  providerFacility: {
    id: string;
    type: string;
    level: number;
  };
  proposedPath: { q: number; r: number }[];
  distance: number;
  operationPointsNeeded: number;
  proposedUnitPrice?: number;
  performedBy: string;
  activityId: string;
}

export interface LogConnectionAcceptanceParams {
  connectionId: string;
  connectionType: InfrastructureType;
  consumerTeamId: string;
  providerTeamId: string;
  consumerFacility: {
    id: string;
    type: string;
    level: number;
  };
  providerFacility: {
    id: string;
    type: string;
    level: number;
  };
  agreedUnitPrice: number;
  connectionPath: { q: number; r: number }[];
  performedBy: string;
  activityId: string;
}

export interface LogConnectionRejectionParams {
  requestId: string;
  connectionType: InfrastructureType;
  consumerTeamId: string;
  providerTeamId: string;
  consumerFacility: {
    id: string;
    type: string;
    level: number;
  };
  providerFacility: {
    id: string;
    type: string;
    level: number;
  };
  rejectionReason: string;
  suggestedAlternative?: string;
  performedBy: string;
  activityId: string;
}

export interface LogConnectionTerminationParams {
  connectionId: string;
  connectionType: InfrastructureType;
  consumerTeamId: string;
  providerTeamId: string;
  consumerFacility: {
    id: string;
    type: string;
    level: number;
  };
  providerFacility: {
    id: string;
    type: string;
    level: number;
  };
  disconnectedBy: string;
  disconnectionReason: string;
  performedBy: string;
  activityId: string;
  connectedAt: string;
  finalUsage?: number;
  unpaidAmount?: number;
}

export interface LogServiceSubscriptionParams {
  serviceType: ServiceType;
  consumerTeamId: string;
  providerTeamId: string;
  consumerFacility: {
    id: string;
    type: string;
    level: number;
  };
  providerFacility: {
    id: string;
    type: string;
    level: number;
  };
  annualServiceFee: number;
  performedBy: string;
  activityId: string;
}

export interface LogServiceTerminationParams {
  subscriptionId: string;
  serviceType: ServiceType;
  consumerTeamId: string;
  providerTeamId: string;
  consumerFacility: {
    id: string;
    type: string;
    level: number;
  };
  providerFacility: {
    id: string;
    type: string;
    level: number;
  };
  disconnectedBy: string;
  disconnectionReason: string;
  performedBy: string;
  activityId: string;
  subscribedAt: string;
  totalServiceFeesPaid?: number;
}

class InfrastructureLoggingService {
  async logConnectionRequest(params: LogConnectionRequestParams): Promise<InfrastructureOperationLog> {
    const details: OperationDetails = {
      infrastructureType: params.connectionType,
      providerFacilityId: params.providerFacility.id,
      providerFacilityType: params.providerFacility.type,
      providerFacilityLevel: params.providerFacility.level,
      consumerFacilityId: params.consumerFacility.id,
      consumerFacilityType: params.consumerFacility.type,
      consumerFacilityLevel: params.consumerFacility.level,
      actorTeamId: params.consumerTeamId,
      actorRole: 'CONSUMER',
      eventData: createRequestDetails({
        proposedPath: params.proposedPath,
        distance: params.distance,
        operationPointsNeeded: params.operationPointsNeeded,
        proposedUnitPrice: params.proposedUnitPrice,
      }),
    };

    const response = await apiClient.post('/infrastructure/operations/log', {
      operationType: OperationType.CONNECTION_REQUESTED,
      providerTeamId: params.providerTeamId,
      consumerTeamId: params.consumerTeamId,
      entityType: 'ConnectionRequest',
      entityId: '', // Will be set by the backend
      details,
      performedBy: params.performedBy,
      activityId: params.activityId,
      infrastructureType: params.connectionType,
      actorRole: 'CONSUMER',
      providerFacilityId: params.providerFacility.id,
      consumerFacilityId: params.consumerFacility.id,
    });

    return response.data;
  }

  async logConnectionAcceptance(params: LogConnectionAcceptanceParams): Promise<InfrastructureOperationLog> {
    const details: OperationDetails = {
      infrastructureType: params.connectionType,
      providerFacilityId: params.providerFacility.id,
      providerFacilityType: params.providerFacility.type,
      providerFacilityLevel: params.providerFacility.level,
      consumerFacilityId: params.consumerFacility.id,
      consumerFacilityType: params.consumerFacility.type,
      consumerFacilityLevel: params.consumerFacility.level,
      actorTeamId: params.providerTeamId,
      actorRole: 'PROVIDER',
      eventData: createConnectionDetails({
        agreedUnitPrice: params.agreedUnitPrice,
        connectionPath: params.connectionPath,
        effectiveDate: new Date().toISOString(),
      }),
    };

    const response = await apiClient.post('/infrastructure/operations/log', {
      operationType: OperationType.CONNECTION_ACCEPTED,
      providerTeamId: params.providerTeamId,
      consumerTeamId: params.consumerTeamId,
      entityType: 'Connection',
      entityId: params.connectionId,
      details,
      performedBy: params.performedBy,
      activityId: params.activityId,
      infrastructureType: params.connectionType,
      actorRole: 'PROVIDER',
      providerFacilityId: params.providerFacility.id,
      consumerFacilityId: params.consumerFacility.id,
    });

    return response.data;
  }

  async logConnectionRejection(params: LogConnectionRejectionParams): Promise<InfrastructureOperationLog> {
    const details: OperationDetails = {
      infrastructureType: params.connectionType,
      providerFacilityId: params.providerFacility.id,
      providerFacilityType: params.providerFacility.type,
      providerFacilityLevel: params.providerFacility.level,
      consumerFacilityId: params.consumerFacility.id,
      consumerFacilityType: params.consumerFacility.type,
      consumerFacilityLevel: params.consumerFacility.level,
      actorTeamId: params.providerTeamId,
      actorRole: 'PROVIDER',
      eventData: createRejectionDetails({
        rejectionReason: params.rejectionReason,
        suggestedAlternative: params.suggestedAlternative,
      }),
    };

    const response = await apiClient.post('/infrastructure/operations/log', {
      operationType: OperationType.CONNECTION_REJECTED,
      providerTeamId: params.providerTeamId,
      consumerTeamId: params.consumerTeamId,
      entityType: 'ConnectionRequest',
      entityId: params.requestId,
      details,
      performedBy: params.performedBy,
      activityId: params.activityId,
      infrastructureType: params.connectionType,
      actorRole: 'PROVIDER',
      providerFacilityId: params.providerFacility.id,
      consumerFacilityId: params.consumerFacility.id,
    });

    return response.data;
  }

  async logConnectionTermination(params: LogConnectionTerminationParams): Promise<{
    operationLog: InfrastructureOperationLog;
    terminationDetail: ConnectionTerminationDetail;
  }> {
    const actorRole = params.disconnectedBy === params.providerTeamId ? 'PROVIDER' : 'CONSUMER';
    
    const details: OperationDetails = {
      infrastructureType: params.connectionType,
      providerFacilityId: params.providerFacility.id,
      providerFacilityType: params.providerFacility.type,
      providerFacilityLevel: params.providerFacility.level,
      consumerFacilityId: params.consumerFacility.id,
      consumerFacilityType: params.consumerFacility.type,
      consumerFacilityLevel: params.consumerFacility.level,
      actorTeamId: params.disconnectedBy,
      actorRole,
      eventData: createTerminationDetails({
        disconnectedBy: params.disconnectedBy,
        disconnectionReason: params.disconnectionReason,
        finalUsage: params.finalUsage,
        unpaidAmount: params.unpaidAmount,
      }),
    };

    const terminationData: ConnectionTerminationDetail = {
      id: '', // Will be set by backend
      operationLogId: '', // Will be set by backend
      terminationType: classifyTerminationType(params.disconnectionReason),
      initiatedBy: actorRole,
      terminationReason: params.disconnectionReason,
      connectionDuration: calculateConnectionDuration(params.connectedAt),
      totalResourcesUsed: params.finalUsage,
      outstandingBalance: params.unpaidAmount,
      connectionId: params.connectionId,
      createdAt: new Date().toISOString(),
    };

    const response = await apiClient.post('/infrastructure/operations/terminate', {
      operationType: OperationType.CONNECTION_DISCONNECTED,
      providerTeamId: params.providerTeamId,
      consumerTeamId: params.consumerTeamId,
      entityType: 'Connection',
      entityId: params.connectionId,
      details,
      performedBy: params.performedBy,
      activityId: params.activityId,
      infrastructureType: params.connectionType,
      actorRole,
      providerFacilityId: params.providerFacility.id,
      consumerFacilityId: params.consumerFacility.id,
      terminationDetail: terminationData,
    });

    return response.data;
  }

  async logServiceSubscriptionRequest(params: LogServiceSubscriptionParams): Promise<InfrastructureOperationLog> {
    const details: OperationDetails = {
      serviceType: params.serviceType,
      providerFacilityId: params.providerFacility.id,
      providerFacilityType: params.providerFacility.type,
      providerFacilityLevel: params.providerFacility.level,
      consumerFacilityId: params.consumerFacility.id,
      consumerFacilityType: params.consumerFacility.type,
      consumerFacilityLevel: params.consumerFacility.level,
      actorTeamId: params.consumerTeamId,
      actorRole: 'CONSUMER',
      eventData: createRequestDetails({
        annualServiceFee: params.annualServiceFee,
      }),
    };

    const response = await apiClient.post('/infrastructure/operations/log', {
      operationType: OperationType.SUBSCRIPTION_REQUESTED,
      providerTeamId: params.providerTeamId,
      consumerTeamId: params.consumerTeamId,
      entityType: 'SubscriptionRequest',
      entityId: '', // Will be set by the backend
      details,
      performedBy: params.performedBy,
      activityId: params.activityId,
      serviceType: params.serviceType,
      actorRole: 'CONSUMER',
      providerFacilityId: params.providerFacility.id,
      consumerFacilityId: params.consumerFacility.id,
    });

    return response.data;
  }

  async logServiceTermination(params: LogServiceTerminationParams): Promise<{
    operationLog: InfrastructureOperationLog;
    terminationDetail: ConnectionTerminationDetail;
  }> {
    const actorRole = params.disconnectedBy === params.providerTeamId ? 'PROVIDER' : 'CONSUMER';
    
    const details: OperationDetails = {
      serviceType: params.serviceType,
      providerFacilityId: params.providerFacility.id,
      providerFacilityType: params.providerFacility.type,
      providerFacilityLevel: params.providerFacility.level,
      consumerFacilityId: params.consumerFacility.id,
      consumerFacilityType: params.consumerFacility.type,
      consumerFacilityLevel: params.consumerFacility.level,
      actorTeamId: params.disconnectedBy,
      actorRole,
      eventData: createTerminationDetails({
        disconnectedBy: params.disconnectedBy,
        disconnectionReason: params.disconnectionReason,
      }),
    };

    const terminationData: ConnectionTerminationDetail = {
      id: '', // Will be set by backend
      operationLogId: '', // Will be set by backend
      terminationType: classifyTerminationType(params.disconnectionReason),
      initiatedBy: actorRole,
      terminationReason: params.disconnectionReason,
      connectionDuration: calculateConnectionDuration(params.subscribedAt),
      totalServiceFeesPaid: params.totalServiceFeesPaid,
      subscriptionId: params.subscriptionId,
      createdAt: new Date().toISOString(),
    };

    const response = await apiClient.post('/infrastructure/operations/terminate', {
      operationType: OperationType.SUBSCRIPTION_CANCELLED,
      providerTeamId: params.providerTeamId,
      consumerTeamId: params.consumerTeamId,
      entityType: 'Subscription',
      entityId: params.subscriptionId,
      details,
      performedBy: params.performedBy,
      activityId: params.activityId,
      serviceType: params.serviceType,
      actorRole,
      providerFacilityId: params.providerFacility.id,
      consumerFacilityId: params.consumerFacility.id,
      terminationDetail: terminationData,
    });

    return response.data;
  }
}

export default new InfrastructureLoggingService();