// Contract System Type Definitions (Ultra Simple)

// Contract status enum with Chinese labels
export enum ContractStatus {
  PENDING_APPROVAL = '等待全部队伍同意',
  REJECTED = '队伍取消或拒绝',
  SIGNED = '成功签署'
}

// Contract operation type for history tracking
export enum ContractOperationType {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED'
}

// Main contract interface
export interface Contract {
  id: string;
  contractNumber: string; // Format: CTR-YYYY-NNNN
  title: string;
  content: string;
  status: ContractStatus;
  activityId: string;
  createdBy: string;
  createdByUser?: User;
  teams?: ContractTeam[];
  history?: ContractHistory[];
  signedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Contract team relationship
export interface ContractTeam {
  id: string;
  contractId: string;
  teamId: string;
  team?: Team;
  approved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  joinedAt: string;
  addedBy: string;
  createdAt: string;
}

// Contract history entry
export interface ContractHistory {
  id: string;
  contractId: string;
  operationType: ContractOperationType;
  description: string;
  operatorId: string;
  operator?: User;
  operatorTeamId: string;
  operatorTeam?: Team;
  previousStatus?: ContractStatus | null;
  newStatus?: ContractStatus | null;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

// User interface (simplified)
export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: number; // 1: Manager, 2: Coordinator, 3: Student
}

// Team interface (simplified)
export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  activityId?: string;
  status?: string;
}

// Contract list item for display
export interface ContractListItem {
  contractId: string;
  contractNumber: string;
  title: string;
  status: ContractStatus | string; // API returns string like "PENDING_APPROVAL", "REJECTED", etc.
  teamCount: number;
  teams: {
    teamId: string;
    teamName: string;
    approved?: boolean;
    approvedAt?: string | null;
    joinedAt?: string;
  }[];
  createdBy?: {
    userId: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  signedAt?: string | null;
  rejectedAt?: string | null;
}

// Contract details for full view
export interface ContractDetails extends Contract {
  teams: Array<{
    teamId: string;
    teamName: string;
    approved: boolean;
    approvedAt?: string | null;
    approvedBy?: string | null;
    joinedAt: string;
  }>;
  createdByUser: {
    userId: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

// Request types
export interface CreateContractRequest {
  title: string;
  content: string;
  teamIds: string[]; // Array of team IDs to include
}

export interface ContractListRequest {
  status?: ContractStatus;
  page?: number;
  limit?: number;
}

export interface ContractHistoryRequest {
  contractId: string;
  page?: number;
  limit?: number;
}

// Response types
export interface CreateContractResponse {
  contractId: string;
  contractNumber: string;
  status: ContractStatus;
  createdAt: string;
}

export interface ContractListResponse {
  contracts: ContractListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ContractDetailsResponse {
  contractId: string;
  contractNumber: string;
  title: string;
  content: string;
  status: ContractStatus;
  teams: Array<{
    teamId: string;
    teamName: string;
    approved: boolean;
    approvedAt?: string | null;
    joinedAt: string;
  }>;
  createdBy: {
    userId: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  signedAt?: string | null;
  rejectedAt?: string | null;
}

export interface ApproveContractResponse {
  contractId: string;
  status: ContractStatus;
  signedAt?: string | null;
  allTeamsApproved: boolean;
}

export interface RejectContractResponse {
  contractId: string;
  status: ContractStatus;
  rejectedAt: string;
}

export interface AvailableTeamsResponse {
  teams: Array<{
    teamId: string;
    teamName: string;
  }>;
  total: number;
}

export interface ContractHistoryResponse {
  history: ContractHistory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Validation constants
export const CONTRACT_VALIDATION = {
  title: {
    minLength: 10,
    maxLength: 200
  },
  content: {
    minLength: 50,
    maxLength: 10000
  },
  teams: {
    minCount: 2,
    maxCount: 10
  }
} as const;

// Error codes
export enum ContractErrorCode {
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  CONTRACT_ACCESS_DENIED = 'CONTRACT_ACCESS_DENIED',
  CONTRACT_INVALID_STATUS = 'CONTRACT_INVALID_STATUS',
  CONTRACT_VALIDATION_ERROR = 'CONTRACT_VALIDATION_ERROR',
  CONTRACT_ALREADY_APPROVED = 'CONTRACT_ALREADY_APPROVED',
  CONTRACT_ALREADY_REJECTED = 'CONTRACT_ALREADY_REJECTED',
  TEAM_NOT_FOUND = 'TEAM_NOT_FOUND',
  TEAM_NOT_IN_ACTIVITY = 'TEAM_NOT_IN_ACTIVITY',
  CONTRACT_LIMIT_EXCEEDED = 'CONTRACT_LIMIT_EXCEEDED',
  UNAUTHORIZED_ROLE = 'UNAUTHORIZED_ROLE'
}