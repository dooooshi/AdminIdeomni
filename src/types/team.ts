/**
 * Team System Type Definitions
 * Based on the API documentation
 */

export type TeamMemberStatus = 'ACTIVE' | 'LEFT' | 'REMOVED';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: number;
}

export interface TeamLeader {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface TeamMember {
  id: string;
  status: TeamMemberStatus;
  joinedAt: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  maxMembers: number;
  isOpen: boolean;
  createdAt: string;
  leader: TeamLeader;
  members: TeamMember[];
}

export interface TeamListItem {
  id: string;
  name: string;
  description: string | null;
  maxMembers: number;
  currentMembers: number;
  isOpen: boolean;
  createdAt: string;
  leader: TeamLeader;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TeamStatistics {
  totalTeams: number;
  totalMembers: number;
  averageTeamSize: number;
  teamsWithOpenSlots: number;
}

// Request DTOs
export interface CreateTeamRequest {
  name: string;
  description?: string;
  maxMembers?: number;
  isOpen?: boolean;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  maxMembers?: number;
  isOpen?: boolean;
}

export interface InviteMembersRequest {
  userIds: string[];
}

export interface TransferLeadershipRequest {
  newLeaderId: string;
}

export interface InviteResult {
  userId: string;
  success: boolean;
  error?: string;
}

export interface InviteResponse {
  successCount: number;
  failedCount: number;
  totalCount: number;
  details: InviteResult[];
}

// Query parameters
export interface TeamListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
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

// User Types enum for role checking
export enum UserType {
  MANAGER = 1,
  USER = 2,
  STUDENT = 3
}