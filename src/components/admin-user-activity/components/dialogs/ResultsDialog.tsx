'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BulkOperationResult } from '@/lib/services/adminUserActivityService';

interface ResultsDialogProps {
  open: boolean;
  operationResult: BulkOperationResult | null;
  onClose: () => void;
}

const ResultsDialog: React.FC<ResultsDialogProps> = ({
  open,
  operationResult,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open && operationResult !== null}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t('activityManagement.BULK_OPERATION_RESULTS')}</DialogTitle>
      <DialogContent>
        {operationResult && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" color="success.main">
                    {operationResult.successCount}
                  </Typography>
                  <Typography variant="body2">
                    {t('activityManagement.SUCCESSFUL')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6" color="error.main">
                    {operationResult.failedCount}
                  </Typography>
                  <Typography variant="body2">
                    {t('activityManagement.FAILED')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" color="warning.main">
                    {operationResult.totalCount - operationResult.successCount - operationResult.failedCount}
                  </Typography>
                  <Typography variant="body2">
                    {t('activityManagement.SKIPPED')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {operationResult.details?.filter(d => !d.success).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="error.main">
                  {t('activityManagement.FAILED_ASSIGNMENTS')}
                </Typography>
                {operationResult.details?.filter(d => !d.success).map((result, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{result.userId}:</strong> {result.error || 'Unknown error'}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            )}

            {operationResult.successCount > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom color="success.main">
                  {t('activityManagement.SUCCESSFUL_ASSIGNMENTS')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {operationResult.successCount} {t('activityManagement.USERS_SUCCESSFULLY_ASSIGNED')}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('activityManagement.CLOSE')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultsDialog;