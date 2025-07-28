/**
 * Team Transfer and History System Type Definitions
 * Based on the API documentation in docs/teams/team-history-tracking.md
 * and docs/teams/team-transfer-api.md
 */

import { Team, TeamLeader, PaginatedResponse } from './team';

// ===============================
// ENUMS
// ===============================

export enum TeamOperationType {
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  MANAGER_ADJUSTMENT = 'MANAGER_ADJUSTMENT',
  SYSTEM_GRANT = 'SYSTEM_GRANT',
  SYSTEM_DEDUCTION = 'SYSTEM_DEDUCTION',
  ACTIVITY_REWARD = 'ACTIVITY_REWARD',
  FACILITY_INCOME = 'FACILITY_INCOME',
  FACILITY_EXPENSE = 'FACILITY_EXPENSE'
}

export enum TeamResourceType {
  GOLD = 'GOLD',
  CARBON = 'CARBON'
}

// ===============================
// TRANSFER REQUEST/RESPONSE TYPES
// ===============================

export interface TransferGoldRequest {
  targetTeamId: string;
  amount: number; // Number with maximum 3 decimal places, minimum 0.001
  description?: string;
}

export interface TransferCarbonRequest {
  targetTeamId: string;
  amount: number; // Number with maximum 3 decimal places, minimum 0.001
  description?: string;
}

export interface TransferResponse {
  id: string;
  teamId: string;
  gold: number;
  carbon: number;
  createdAt: string;
  updatedAt: string;
}

// ===============================
// OPERATION HISTORY TYPES
// ===============================

export interface TeamOperationHistory {
  id: string;
  teamId: string;
  userId: string;
  operationType: TeamOperationType;
  amount: number; // Decimal with 3 decimal precision
  resourceType: TeamResourceType;
  
  // For transfers, track the other team involved
  targetTeamId?: string; // For outgoing transfers
  sourceTeamId?: string; // For incoming transfers
  
  // Balance snapshot after operation with decimal precision
  balanceBefore: number; // Balance before operation
  balanceAfter: number; // Balance after operation
  
  // Additional context
  description?: string;
  metadata?: any; // Additional metadata if needed
  
  createdAt: string;
  
  // Relationships
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  targetTeam?: {
    id: string;
    name: string;
  } | null;
  sourceTeam?: {
    id: string;
    name: string;
  } | null;
}

// ===============================
// BALANCE HISTORY TYPES
// ===============================

export interface TeamBalanceHistory {
  id: string;
  teamId: string;
  
  // Balance snapshot with decimal precision
  goldBalance: number; // Gold balance at this point
  carbonBalance: number; // Carbon balance at this point
  
  // Change information with decimal precision
  goldChange: number; // Change in gold (positive or negative)
  carbonChange: number; // Change in carbon (positive or negative)
  
  // Link to the operation that caused this change
  operationId?: string; // References TeamOperationHistory
  
  // Timestamp
  createdAt: string;
}

// ===============================
// QUERY PARAMETERS
// ===============================

export interface OperationHistoryQuery {
  page?: number;
  pageSize?: number;
  operationType?: TeamOperationType;
  resourceType?: TeamResourceType;
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

export interface TransferHistoryQuery {
  page?: number;
  pageSize?: number;
  direction?: 'incoming' | 'outgoing' | 'all';
  resourceType?: TeamResourceType;
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

export interface BalanceHistoryQuery {
  page?: number;
  pageSize?: number;
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

export interface OperationSummaryQuery {
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

// ===============================
// SUMMARY AND STATISTICS TYPES
// ===============================

export interface OperationSummary {
  totalOperations: number;
  totalGoldIn: number;
  totalGoldOut: number;
  totalCarbonIn: number;
  totalCarbonOut: number;
  operationsByType: Record<TeamOperationType, number>;
}

export interface ResourceFlowAnalysis {
  goldFlow: {
    totalIn: number;
    totalOut: number;
    netFlow: number; // positive means net gain, negative means net loss
  };
  carbonFlow: {
    totalIn: number;
    totalOut: number;
    netFlow: number;
  };
  topTransferPartners: Array<{
    teamId: string;
    teamName: string;
    totalGoldExchanged: number;
    totalCarbonExchanged: number;
    transferCount: number;
  }>;
}

// ===============================
// PAGINATED RESPONSES
// ===============================

export type PaginatedOperationHistory = PaginatedResponse<TeamOperationHistory>;
export type PaginatedTransferHistory = PaginatedResponse<TeamOperationHistory>; // Same as operation history but filtered
export type PaginatedBalanceHistory = PaginatedResponse<TeamBalanceHistory>;

// ===============================
// UI STATE TYPES
// ===============================

export interface TransferFormState {
  selectedTeamId: string | null;
  amount: string; // String for form input handling
  description: string;
  isLoading: boolean;
  error: string | null;
}

export interface HistoryFilterState {
  operationType: TeamOperationType | 'all';
  resourceType: TeamResourceType | 'all';
  direction: 'incoming' | 'outgoing' | 'all';
  startDate: string; // YYYY-MM-DD format for input
  endDate: string; // YYYY-MM-DD format for input
  searchTerm: string;
}

export interface TransferValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ===============================
// CHART AND VISUALIZATION TYPES
// ===============================

export interface BalanceTrendData {
  date: string;
  gold: number;
  carbon: number;
}

export interface OperationChartData {
  operationType: TeamOperationType;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface ResourceFlowChartData {
  direction: 'incoming' | 'outgoing';
  resourceType: TeamResourceType;
  amount: number;
  teamName: string;
  date: string;
}

// ===============================
// ERROR TYPES
// ===============================

export enum TransferErrorCode {
  TEAM_NOT_MEMBER = 'TEAM_NOT_MEMBER',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TARGET_TEAM_NOT_FOUND = 'TARGET_TEAM_NOT_FOUND',
  TEAM_DIFFERENT_ACTIVITY = 'TEAM_DIFFERENT_ACTIVITY',
  TEAM_NOT_ACTIVE_MEMBER = 'TEAM_NOT_ACTIVE_MEMBER',
  TEAM_ACCOUNT_NOT_FOUND = 'TEAM_ACCOUNT_NOT_FOUND',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  SAME_TEAM_TRANSFER = 'SAME_TEAM_TRANSFER'
}

export interface TransferError {
  code: TransferErrorCode;
  message: string;
  details?: any;
}

// ===============================
// TEAM SELECTION TYPES
// ===============================

export interface AvailableTeam {
  id: string;
  name: string;
  description?: string;
  leader: TeamLeader;
  memberCount: number;
  maxMembers: number;
  isOpen: boolean;
}

// ===============================
// FORM VALIDATION SCHEMAS
// ===============================

export interface TransferFormValidation {
  targetTeamId: {
    required: boolean;
    message: string;
  };
  amount: {
    required: boolean;
    min: number;
    max?: number;
    decimalPlaces: number;
    message: string;
  };
  description: {
    maxLength: number;
    message: string;
  };
}

// ===============================
// API RESPONSE WRAPPERS
// ===============================

export interface TeamTransferApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T | null;
  timestamp: string;
  path: string;
  details?: {
    message: string;
    error: string;
    statusCode: number;
  };
}