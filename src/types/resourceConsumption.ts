// Resource Consumption Types

export enum ResourceType {
  WATER = 'WATER',
  POWER = 'POWER'
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum TransactionRole {
  CONSUMER = 'CONSUMER',
  PROVIDER = 'PROVIDER'
}

export interface ResourceTransaction {
  id: string;
  resourceType: ResourceType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  connectionId: string;
  consumerFacilityId: string;
  consumerTeamId: string;
  providerFacilityId: string;
  providerTeamId: string;
  purpose: string;
  referenceType?: string;
  referenceId?: string;
  status: TransactionStatus;
  failureReason?: string;
  operationHistoryId?: string;
  balanceHistoryId?: string;
  activityId: string;
  initiatedBy: string;
  transactionDate: Date;
  metadata?: Record<string, any>;
}

export interface ResourceConsumptionRequest {
  facilityId: string;
  resourceRequirements: ResourceRequirementItem[];
  purpose: string;
  referenceType?: string;
  referenceId?: string;
  teamId: string;
  activityId: string;
  userId: string;
  rawMaterialId?: number;
  quantity?: number;
}

export interface ResourceRequirementItem {
  type: ResourceType;
  quantity: number;
}

export interface ResourceConsumptionResult {
  success: boolean;
  transactions: ResourceTransaction[];
  totalCost: number;
  error?: string;
}

export interface ResourceCostBreakdown {
  total: number;
  breakdown: {
    [key in ResourceType]?: number;
  };
}

export interface ResourceTransactionView {
  id: string;
  resourceType: ResourceType;
  role: TransactionRole;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  counterparty: CounterpartyInfo;
  productionId?: string;
  transactionDate: string;
  reference: string;
  status: TransactionStatus;
}

export interface CounterpartyInfo {
  facilityId: string;
  facilityName: string;
  teamId: string;
  teamName: string;
}

export interface ResourceHistoryFilter {
  facilityId?: string;
  teamId?: string;
  resourceType?: ResourceType;
  transactionType?: TransactionRole;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ResourceHistoryResponse {
  success: boolean;
  businessCode: number;
  message: string;
  data: {
    transactions: ResourceTransactionView[];
    summary: ResourceSummary;
    pagination: PaginationInfo;
  };
}

export interface ResourceSummary {
  totalTransactions: number;
  totalAmount: number;
  byType: {
    water: ResourceTypeSummary;
    power: ResourceTypeSummary;
  };
}

export interface ResourceTypeSummary {
  count: number;
  amount: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface InfrastructureConnection {
  id: string;
  type: ResourceType;
  unitPrice: number;
  providerFacilityId: string;
  providerTeamId: string;
  consumerFacilityId: string;
  consumerTeamId: string;
  isActive: boolean;
}

export interface TeamOperationHistory {
  id: string;
  teamId: string;
  userId: string;
  operationType: string;
  amount: number;
  resourceType: 'GOLD' | 'CARBON';
  sourceTeamId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface TeamBalanceHistory {
  id: string;
  teamId: string;
  goldChange: number;
  carbonChange: number;
  operationId: string;
  goldBalance: number;
  carbonBalance: number;
}