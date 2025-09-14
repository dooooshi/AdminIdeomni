'use client';

import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import EnhancedErrorDisplay from '@/components/common/EnhancedErrorDisplay';
import { useUserSearch } from './hooks/useUserSearch';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import AssignmentDialogs from './components/AssignmentDialogs';
import {
  UserSearchAndAssignmentProps,
  AssignDialogState,
  TransferDialogState,
  BulkAssignDialogState,
} from './types';

const UserSearchAndAssignment: React.FC<UserSearchAndAssignmentProps> = ({
  onDataChange,
  statistics,
}) => {
  const { t } = useTranslation();

  // Use the custom hook for all search logic
  const {
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
  } = useUserSearch(onDataChange);

  // Dialog states
  const [assignDialog, setAssignDialog] = useState<AssignDialogState>({
    open: false,
    user: null,
    selectedActivity: '',
    reason: '',
    forceAssignment: false,
  });

  const [transferDialog, setTransferDialog] = useState<TransferDialogState>({
    open: false,
    user: null,
    newActivity: '',
    reason: '',
  });

  const [bulkAssignDialog, setBulkAssignDialog] = useState<BulkAssignDialogState>({
    open: false,
    activityId: '',
    reason: '',
    forceAssignment: false,
  });


  // Dialog handlers
  const handleAssignUser = async () => {
    if (!assignDialog.user || !assignDialog.selectedActivity) return;

    const success = await assignUser(
      assignDialog.user.user.id,
      assignDialog.selectedActivity,
      assignDialog.reason,
      assignDialog.forceAssignment
    );

    if (success) {
      setAssignDialog({
        open: false,
        user: null,
        selectedActivity: '',
        reason: '',
        forceAssignment: false,
      });
    }
  };

  const handleTransferUser = async () => {
    if (!transferDialog.user || !transferDialog.newActivity) return;

    const success = await transferUser(
      transferDialog.user.user.id,
      transferDialog.newActivity,
      transferDialog.reason
    );

    if (success) {
      setTransferDialog({
        open: false,
        user: null,
        newActivity: '',
        reason: '',
      });
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignDialog.activityId) return;

    const success = await bulkAssignUsers(
      bulkAssignDialog.activityId,
      bulkAssignDialog.reason,
      bulkAssignDialog.forceAssignment
    );

    if (success) {
      setBulkAssignDialog({
        open: false,
        activityId: '',
        reason: '',
        forceAssignment: false,
      });
    }
  };

  const handleClearFilters = () => {
    handleFilterChange('q', '');
    handleFilterChange('userType', '');
    handleFilterChange('activityStatus', 'all');
    handleFilterChange('activityId', '');
    handleFilterChange('enrollmentStatus', '');
    handleFilterChange('includeInactive', false);
    handleFilterChange('sortBy', 'username');
    handleFilterChange('sortOrder', 'asc');
  };

  if (loading && !users) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('activityManagement.LOADING_USERS')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* User Filters Component */}
      <UserFilters
        filters={filters}
        loading={loading}
        selectedUsersCount={selectedUsers.length}
        onFilterChange={handleFilterChange}
        onRefresh={loadUsers}
        onClearFilters={handleClearFilters}
        onBulkAssign={() => {
          setBulkAssignDialog({ ...bulkAssignDialog, open: true });
          loadAvailableActivities();
        }}
      />

      {/* Enhanced Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <EnhancedErrorDisplay
            error={error}
            onRetry={loadUsers}
            onDismiss={() => setError(null)}
            showDetails={false}
            context="User Search and Assignment"
          />
        </Box>
      )}

      {/* User Table Component */}
      <UserTable
        users={users}
        selectedUsers={selectedUsers}
        page={page}
        pageSize={pageSize}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onAssignUser={(user) => {
          setAssignDialog({
            open: true,
            user,
            selectedActivity: '',
            reason: '',
            forceAssignment: false,
          });
          loadAvailableActivities();
        }}
        onTransferUser={(user) => {
          setTransferDialog({
            open: true,
            user,
            newActivity: '',
            reason: '',
          });
          loadAvailableActivities();
        }}
        onRemoveUser={removeUser}
      />

      {/* Assignment Dialogs Component */}
      <AssignmentDialogs
        assignDialog={assignDialog}
        transferDialog={transferDialog}
        bulkAssignDialog={bulkAssignDialog}
        availableActivities={availableActivities}
        loadingActivities={loadingActivities}
        operationLoading={operationLoading}
        selectedUsersCount={selectedUsers.length}
        operationResult={operationResult}
        showResults={showResults}
        onAssignDialogChange={setAssignDialog}
        onTransferDialogChange={setTransferDialog}
        onBulkAssignDialogChange={setBulkAssignDialog}
        onAssignUser={handleAssignUser}
        onTransferUser={handleTransferUser}
        onBulkAssign={handleBulkAssign}
        onCloseResults={() => {
          setShowResults(false);
          setOperationResult(null);
        }}
      />
    </Box>
  );
};

export default UserSearchAndAssignment;