import { 
  OperationType, 
  OperationDetails,
  RequestDetails,
  ConnectionDetails,
  RejectionDetails,
  TerminationDetails,
  InfrastructureOperationLog,
  ConnectionTerminationDetail
} from '@/types/infrastructureHistory';
import { InfrastructureType } from '@/lib/services/infrastructureService';

export function createRequestDetails(data: {
  connectionType?: InfrastructureType;
  proposedPath?: { q: number; r: number }[];
  distance?: number;
  operationPointsNeeded?: number;
  proposedUnitPrice?: number;
  annualServiceFee?: number;
  requestMessage?: string;
}): RequestDetails {
  return {
    proposedPath: data.proposedPath,
    distance: data.distance,
    operationPointsNeeded: data.operationPointsNeeded,
    proposedUnitPrice: data.proposedUnitPrice,
    annualServiceFee: data.annualServiceFee,
    requestMessage: data.requestMessage,
  };
}

export function createConnectionDetails(data: {
  agreedUnitPrice?: number;
  annualServiceFee?: number;
  connectionPath?: { q: number; r: number }[];
  coverageTiles?: { q: number; r: number }[];
  effectiveDate: string;
}): ConnectionDetails {
  return {
    agreedUnitPrice: data.agreedUnitPrice,
    annualServiceFee: data.annualServiceFee,
    connectionPath: data.connectionPath,
    coverageTiles: data.coverageTiles,
    effectiveDate: data.effectiveDate,
  };
}

export function createRejectionDetails(data: {
  rejectionReason: string;
  suggestedAlternative?: string;
  canReapplyAfter?: string;
}): RejectionDetails {
  return {
    rejectionReason: data.rejectionReason,
    suggestedAlternative: data.suggestedAlternative,
    canReapplyAfter: data.canReapplyAfter,
  };
}

export function createTerminationDetails(data: {
  disconnectedBy: string;
  disconnectionReason: string;
  finalUsage?: number;
  finalBilling?: number;
  unpaidAmount?: number;
  wasEmergency?: boolean;
}): TerminationDetails {
  return {
    disconnectedBy: data.disconnectedBy,
    disconnectionReason: data.disconnectionReason,
    finalUsage: data.finalUsage,
    finalBilling: data.finalBilling,
    unpaidAmount: data.unpaidAmount,
    wasEmergency: data.wasEmergency || false,
  };
}

export function classifyTerminationType(reason: string): 'VOLUNTARY' | 'FORCED' | 'SYSTEM' {
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes('mutual') || lowerReason.includes('agreement') || lowerReason.includes('voluntary')) {
    return 'VOLUNTARY';
  }
  
  if (lowerReason.includes('breach') || lowerReason.includes('violation') || lowerReason.includes('forced') || lowerReason.includes('unpaid')) {
    return 'FORCED';
  }
  
  if (lowerReason.includes('system') || lowerReason.includes('automatic') || lowerReason.includes('expired')) {
    return 'SYSTEM';
  }
  
  return 'VOLUNTARY';
}

export function calculateConnectionDuration(startDate: string | Date, endDate?: string | Date): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatOperationType(type: OperationType): string {
  const mapping: Record<OperationType, string> = {
    [OperationType.CONNECTION_REQUESTED]: 'Connection Requested',
    [OperationType.CONNECTION_ACCEPTED]: 'Connection Accepted',
    [OperationType.CONNECTION_REJECTED]: 'Connection Rejected',
    [OperationType.CONNECTION_CANCELLED]: 'Connection Cancelled',
    [OperationType.CONNECTION_DISCONNECTED]: 'Connection Disconnected',
    [OperationType.SUBSCRIPTION_REQUESTED]: 'Subscription Requested',
    [OperationType.SUBSCRIPTION_ACCEPTED]: 'Subscription Accepted',
    [OperationType.SUBSCRIPTION_REJECTED]: 'Subscription Rejected',
    [OperationType.SUBSCRIPTION_CANCELLED]: 'Subscription Cancelled',
  };
  
  return mapping[type] || type;
}

export function getOperationTypeColor(type: OperationType): string {
  switch (type) {
    case OperationType.CONNECTION_REQUESTED:
    case OperationType.SUBSCRIPTION_REQUESTED:
      return 'blue';
    case OperationType.CONNECTION_ACCEPTED:
    case OperationType.SUBSCRIPTION_ACCEPTED:
      return 'green';
    case OperationType.CONNECTION_REJECTED:
    case OperationType.SUBSCRIPTION_REJECTED:
      return 'red';
    case OperationType.CONNECTION_CANCELLED:
    case OperationType.SUBSCRIPTION_CANCELLED:
      return 'gray';
    case OperationType.CONNECTION_DISCONNECTED:
      return 'orange';
    default:
      return 'gray';
  }
}

export function isTerminationEvent(type: OperationType): boolean {
  return [
    OperationType.CONNECTION_DISCONNECTED,
    OperationType.CONNECTION_CANCELLED,
    OperationType.SUBSCRIPTION_CANCELLED,
  ].includes(type);
}

export function getEventDescription(log: InfrastructureOperationLog): string {
  const details = log.details;
  const actorName = details.actorRole === 'PROVIDER' 
    ? log.providerTeam?.name 
    : details.actorRole === 'CONSUMER' 
    ? log.consumerTeam?.name 
    : 'System';

  switch (log.operationType) {
    case OperationType.CONNECTION_REQUESTED:
      return `${actorName} requested a ${details.infrastructureType?.toLowerCase()} connection`;
    case OperationType.CONNECTION_ACCEPTED:
      return `${actorName} accepted the connection request`;
    case OperationType.CONNECTION_REJECTED:
      return `${actorName} rejected the connection request`;
    case OperationType.CONNECTION_CANCELLED:
      return `${actorName} cancelled the connection request`;
    case OperationType.CONNECTION_DISCONNECTED:
      return `${actorName} disconnected the connection`;
    case OperationType.SUBSCRIPTION_REQUESTED:
      return `${actorName} requested a ${details.serviceType?.toLowerCase().replace('_', ' ')} subscription`;
    case OperationType.SUBSCRIPTION_ACCEPTED:
      return `${actorName} accepted the subscription request`;
    case OperationType.SUBSCRIPTION_REJECTED:
      return `${actorName} rejected the subscription request`;
    case OperationType.SUBSCRIPTION_CANCELLED:
      return `${actorName} cancelled the subscription`;
    default:
      return formatOperationType(log.operationType);
  }
}

export function aggregateTerminationStatistics(
  terminations: ConnectionTerminationDetail[]
): { reason: string; count: number; percentage: number }[] {
  const reasonCounts = terminations.reduce((acc, term) => {
    const reason = term.terminationReason;
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = terminations.length;
  
  return Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}