import { UserWithActivityDto, UserActivityStatistics } from '@/lib/services/adminUserActivityService';
import { Activity } from '@/lib/services/activityService';

export interface UserSearchAndAssignmentProps {
  onDataChange: () => void;
  statistics?: UserActivityStatistics | null;
}

export interface SearchFilters {
  q: string;
  userType: number | '';
  activityStatus: 'assigned' | 'unassigned' | 'all';
  activityId: string;
  enrollmentStatus: string;
  includeInactive: boolean;
  sortBy: 'username' | 'email' | 'createdAt' | 'enrolledAt' | 'firstName' | 'lastName';
  sortOrder: 'asc' | 'desc';
}

export interface AssignDialogState {
  open: boolean;
  user: UserWithActivityDto | null;
  selectedActivity: string;
  reason: string;
  forceAssignment: boolean;
}

export interface TransferDialogState {
  open: boolean;
  user: UserWithActivityDto | null;
  newActivity: string;
  reason: string;
}

export interface BulkAssignDialogState {
  open: boolean;
  activityId: string;
  reason: string;
  forceAssignment: boolean;
}