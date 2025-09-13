'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { contractService } from '@/lib/services/contractService';
import { ContractDetailsResponse } from '@/types/contract';

interface ContractActionsProps {
  contract: ContractDetailsResponse;
  userTeamId: string;
  onActionComplete: () => void;
}

const ContractActions: React.FC<ContractActionsProps> = ({
  contract,
  userTeamId,
  onActionComplete
}) => {
  const { t } = useTranslation();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
  }>({
    open: false,
    action: null
  });

  // Check if user can perform actions
  const canApprove = contractService.canApprove(contract, userTeamId);
  const canReject = contractService.canReject(contract, userTeamId);

  // Handle approve
  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await contractService.approveContract(contract.contractId);
      setConfirmDialog({ open: false, action: null });
      onActionComplete();
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_APPROVE'));
      console.error('Failed to approve contract:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await contractService.rejectContract(contract.contractId);
      setConfirmDialog({ open: false, action: null });
      onActionComplete();
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_REJECT'));
      console.error('Failed to reject contract:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation dialog
  const openConfirmDialog = (action: 'approve' | 'reject') => {
    setConfirmDialog({ open: true, action });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    if (!loading) {
      setConfirmDialog({ open: false, action: null });
    }
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (confirmDialog.action === 'approve') {
      handleApprove();
    } else if (confirmDialog.action === 'reject') {
      handleReject();
    }
  };

  // Check if user's team has already approved
  const userTeam = contract.teams.find(t => t.teamId === userTeamId);
  const hasApproved = userTeam?.approved || false;

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Status Alert */}
      {hasApproved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('contract.YOUR_TEAM_APPROVED')}
        </Alert>
      )}

      {/* Action Buttons */}
      <Stack spacing={2}>
        {canApprove && (
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => openConfirmDialog('approve')}
            disabled={loading}
          >
            {t('contract.APPROVE_CONTRACT')}
          </Button>
        )}

        {canReject && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => openConfirmDialog('reject')}
            disabled={loading}
          >
            {t('contract.REJECT_CONTRACT')}
          </Button>
        )}

        {!canApprove && !canReject && !hasApproved && (
          <Alert severity="info">
            {t('contract.NO_ACTIONS_AVAILABLE')}
          </Alert>
        )}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.action === 'approve'
            ? t('contract.CONFIRM_APPROVE')
            : t('contract.CONFIRM_REJECT')
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'approve'
              ? t('contract.CONFIRM_APPROVE_MESSAGE')
              : t('contract.CONFIRM_REJECT_MESSAGE')
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeConfirmDialog} 
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading 
              ? t('common.processing')
              : confirmDialog.action === 'approve'
              ? t('contract.APPROVE')
              : t('contract.REJECT')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractActions;