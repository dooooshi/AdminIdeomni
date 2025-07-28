/**
 * Team Account System Type Definitions
 * Based on the API documentation in docs/teams/
 */

import { Team, TeamLeader, PaginatedResponse } from './team';

// Core Team Account Interface
export interface TeamAccount {
  id: string;
  teamId: string;
  gold: number;
  carbon: number;
  createdAt: string;
  updatedAt: string;
  team?: Team;
}

// Team Account with Team Information (for detailed views)
export interface TeamAccountWithTeam extends Omit<TeamAccount, 'team'> {
  team: {
    id: string;
    name: string;
    description: string | null;
    leader: TeamLeader;
    members?: Array<{
      id: string;
      status: string;
      user: {
        id: string;
        username: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      };
    }>;
    _count?: {
      members: number;
    };
  };
}

// Manager List Item (for paginated team accounts list)
export interface TeamAccountListItem {
  id: string;
  teamId: string;
  gold: number;
  carbon: number;
  createdAt: string;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    description: string | null;
    leader: TeamLeader;
    _count: {
      members: number;
    };
  };
}

// Request DTOs
export interface UpdateBalancesRequest {
  goldDelta?: number;    // Amount to add/subtract from gold (can be negative)
  carbonDelta?: number;  // Amount to add/subtract from carbon (can be negative)
}

export interface SetBalancesRequest {
  gold: number;    // New gold amount (must be >= 0)
  carbon: number;  // New carbon amount (must be >= 0)
}

// Response DTOs
export interface AccountSummaryStatistics {
  totalTeamsWithAccounts: number;
  totalGold: number;
  totalCarbon: number;
  averageGold: number;
  averageCarbon: number;
}

// Query Parameters
export interface TeamAccountListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

// API Response wrapper (consistent with existing team API)
export interface TeamAccountApiResponse<T> {
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

// Paginated responses
export type PaginatedTeamAccounts = PaginatedResponse<TeamAccountListItem>;

// Resource display helpers
export interface ResourceDisplayConfig {
  showGold: boolean;
  showCarbon: boolean;
  format: 'compact' | 'full';
  theme: 'light' | 'dark';
}

// Balance change tracking (for UI state)
export interface BalanceChangePreview {
  currentGold: number;
  currentCarbon: number;
  newGold: number;
  newCarbon: number;
  goldDelta: number;
  carbonDelta: number;
  operation: 'delta' | 'absolute';
}

// Error types specific to team accounts
export enum TeamAccountErrorCode {
  TEAM_NO_ACTIVITY = 'TEAM_NO_ACTIVITY',
  TEAM_ACCESS_DENIED = 'TEAM_ACCESS_DENIED',
  TEAM_ACCOUNT_NOT_FOUND = 'TEAM_ACCOUNT_NOT_FOUND',
  TEAM_ACCOUNT_ALREADY_EXISTS = 'TEAM_ACCOUNT_ALREADY_EXISTS',
  INVALID_BALANCE_CHANGES = 'INVALID_BALANCE_CHANGES'
}

// UI State types
export interface TeamAccountUIState {
  selectedTeamId: string | null;
  editMode: 'delta' | 'absolute' | null;
  pendingChanges: Partial<UpdateBalancesRequest | SetBalancesRequest> | null;
}

// Manager operation results
export interface BalanceUpdateResult {
  success: boolean;
  teamId: string;
  previousGold: number;
  previousCarbon: number;
  newGold: number;
  newCarbon: number;
  error?: string;
}