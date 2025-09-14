import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import AdminUserActivityService, {
  AdminUserActivitySearchParams,
  UserWithActivityDto,
  PaginationResult,
  AssignUserToActivityRequest,
  TransferUserActivityRequest,
  BulkAssignUsersRequest,
  BulkOperationResult,
} from '@/lib/services/adminUserActivityService';
import { Activity } from '@/lib/services/activityService';
import ActivityService from '@/lib/services/activityService';
import { SearchFilters } from '../types';

export const useUserSearch = (onDataChange: () => void) => {
  const { t } = useTranslation();

  // State management
  const [users, setUsers] = useState<PaginationResult<UserWithActivityDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    userType: '',
    activityStatus: 'all',
    activityId: '',
    enrollmentStatus: '',
    includeInactive: false,
    sortBy: 'username',
    sortOrder: 'asc',
  });

  // Available activities for selection
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Load available activities for selection
  const loadAvailableActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const response = await ActivityService.searchActivities({
        pageSize: 100,
        isActive: true,
      });
      setAvailableActivities(response.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setError('Failed to load activities for selection');
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  // Load users data
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: AdminUserActivitySearchParams = {
        page: page + 1,
        pageSize,
        q: filters.q || undefined,
        userType: filters.userType || undefined,
        activityStatus: filters.activityStatus === 'all' ? undefined : filters.activityStatus,
        activityId: filters.activityId || undefined,
        enrollmentStatus: filters.enrollmentStatus || undefined,
        includeInactive: filters.includeInactive,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const data = await AdminUserActivityService.searchUsersWithActivityStatus(params);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : t('activityManagement.USERS_LOAD_ERROR'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, t]);

  // Load data when dependencies change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle filter changes
  const handleFilterChange = (field: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Handle pagination
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle selection
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSelectAll = () => {
    if (!users?.data) return;
    
    if (selectedUsers.length === users.data.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.data.map(u => u.user.id));
    }
  };

  // Handle user assignment
  const assignUser = async (userId: string, activityId: string, reason: string, forceAssignment: boolean) => {
    try {
      setOperationLoading(true);
      
      const request: AssignUserToActivityRequest = {
        userId,
        activityId,
        reason: reason.trim() || undefined,
        forceAssignment,
      };

      await AdminUserActivityService.assignUserToActivity(request);
      await loadUsers();
      onDataChange();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('activityManagement.ASSIGNMENT_ERROR'));
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle user transfer
  const transferUser = async (userId: string, newActivityId: string, reason: string) => {
    try {
      setOperationLoading(true);
      
      const request: TransferUserActivityRequest = {
        userId,
        newActivityId,
        reason: reason.trim() || undefined,
      };

      await AdminUserActivityService.transferUserBetweenActivities(request);
      await loadUsers();
      onDataChange();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('activityManagement.TRANSFER_ERROR'));
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle bulk assignment
  const bulkAssignUsers = async (activityId: string, reason: string, forceAssignment: boolean) => {
    if (selectedUsers.length === 0) return false;

    try {
      setOperationLoading(true);
      
      const request: BulkAssignUsersRequest = {
        userIds: selectedUsers,
        activityId,
        reason: reason.trim() || undefined,
        forceAssignment,
      };

      const result = await AdminUserActivityService.bulkAssignUsersToActivity(request);
      setOperationResult(result);
      setShowResults(true);
      
      await loadUsers();
      onDataChange();
      setSelectedUsers([]);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('activityManagement.BULK_ASSIGNMENT_ERROR'));
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle remove user from activity
  const removeUser = async (userWithActivity: UserWithActivityDto) => {
    if (!userWithActivity.currentActivity) return false;

    try {
      setOperationLoading(true);
      await AdminUserActivityService.removeUserFromActivity(userWithActivity.user.id);
      await loadUsers();
      onDataChange();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('activityManagement.REMOVE_USER_ERROR'));
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    setError,
    selectedUsers,
    page,
    pageSize,
    filters,
    availableActivities,
    loadingActivities,
    operationLoading,
    operationResult,
    showResults,
    setShowResults,
    setOperationResult,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSelectUser,
    handleSelectAll,
    loadAvailableActivities,
    loadUsers,
    assignUser,
    transferUser,
    bulkAssignUsers,
    removeUser,
  };
};