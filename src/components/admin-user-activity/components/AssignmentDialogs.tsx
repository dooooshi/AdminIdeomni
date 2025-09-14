'use client';

import React from 'react';
import { BulkOperationResult } from '@/lib/services/adminUserActivityService';
import { Activity } from '@/lib/services/activityService';
import { AssignDialogState, TransferDialogState, BulkAssignDialogState } from '../types';
import AssignDialog from './dialogs/AssignDialog';
import TransferDialog from './dialogs/TransferDialog';
import BulkAssignDialog from './dialogs/BulkAssignDialog';
import ResultsDialog from './dialogs/ResultsDialog';

interface AssignmentDialogsProps {
  assignDialog: AssignDialogState;
  transferDialog: TransferDialogState;
  bulkAssignDialog: BulkAssignDialogState;
  availableActivities: Activity[];
  loadingActivities: boolean;
  operationLoading: boolean;
  selectedUsersCount: number;
  operationResult: BulkOperationResult | null;
  showResults: boolean;
  onAssignDialogChange: (dialog: AssignDialogState) => void;
  onTransferDialogChange: (dialog: TransferDialogState) => void;
  onBulkAssignDialogChange: (dialog: BulkAssignDialogState) => void;
  onAssignUser: () => void;
  onTransferUser: () => void;
  onBulkAssign: () => void;
  onCloseResults: () => void;
}

const AssignmentDialogs: React.FC<AssignmentDialogsProps> = ({
  assignDialog,
  transferDialog,
  bulkAssignDialog,
  availableActivities,
  loadingActivities,
  operationLoading,
  selectedUsersCount,
  operationResult,
  showResults,
  onAssignDialogChange,
  onTransferDialogChange,
  onBulkAssignDialogChange,
  onAssignUser,
  onTransferUser,
  onBulkAssign,
  onCloseResults,
}) => {
  return (
    <>
      <AssignDialog
        dialog={assignDialog}
        availableActivities={availableActivities}
        loadingActivities={loadingActivities}
        operationLoading={operationLoading}
        onDialogChange={onAssignDialogChange}
        onAssign={onAssignUser}
      />

      <TransferDialog
        dialog={transferDialog}
        availableActivities={availableActivities}
        loadingActivities={loadingActivities}
        operationLoading={operationLoading}
        onDialogChange={onTransferDialogChange}
        onTransfer={onTransferUser}
      />

      <BulkAssignDialog
        dialog={bulkAssignDialog}
        availableActivities={availableActivities}
        loadingActivities={loadingActivities}
        operationLoading={operationLoading}
        selectedUsersCount={selectedUsersCount}
        onDialogChange={onBulkAssignDialogChange}
        onBulkAssign={onBulkAssign}
      />

      <ResultsDialog
        open={showResults}
        operationResult={operationResult}
        onClose={onCloseResults}
      />
    </>
  );
};

export default AssignmentDialogs;