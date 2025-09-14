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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import AdminUserActivityService from '@/lib/services/adminUserActivityService';
import { Activity } from '@/lib/services/activityService';
import { TransferDialogState } from '../../types';

interface TransferDialogProps {
  dialog: TransferDialogState;
  availableActivities: Activity[];
  loadingActivities: boolean;
  operationLoading: boolean;
  onDialogChange: (dialog: TransferDialogState) => void;
  onTransfer: () => void;
}

const TransferDialog: React.FC<TransferDialogProps> = ({
  dialog,
  availableActivities,
  loadingActivities,
  operationLoading,
  onDialogChange,
  onTransfer,
}) => {
  const { t } = useTranslation();

  const renderActivityMenuItem = (activity: Activity) => (
    <MenuItem key={activity.id} value={activity.id}>
      <Tooltip 
        title={
          <Box>
            <Typography variant="body2" fontWeight="medium">{activity.name}</Typography>
            <Typography variant="caption">{activity.activityType}</Typography>
            <Typography variant="caption" display="block">
              {format(new Date(activity.startAt), 'yyyy-MM-dd')} - {format(new Date(activity.endAt), 'yyyy-MM-dd')}
            </Typography>
          </Box>
        }
        arrow
        placement="right"
      >
        <Box sx={{ width: '100%', minWidth: 0 }}>
          <Typography 
            variant="body2" 
            fontWeight="medium"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px'
            }}
          >
            {activity.name}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              maxWidth: '300px'
            }}
          >
            {activity.activityType} • {format(new Date(activity.startAt), 'MM-dd')} - {format(new Date(activity.endAt), 'MM-dd')}
          </Typography>
        </Box>
      </Tooltip>
    </MenuItem>
  );

  return (
    <Dialog
      open={dialog.open}
      onClose={() => onDialogChange({ ...dialog, open: false })}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('activityManagement.TRANSFER_USER_ACTIVITY')}</DialogTitle>
      <DialogContent>
        {dialog.user && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>{t('activityManagement.USER')}:</strong> {AdminUserActivityService.formatUserDisplayName(dialog.user.user)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dialog.user.user.email}
            </Typography>
            {dialog.user.currentActivity && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>{t('activityManagement.CURRENT_ACTIVITY')}:</strong> {dialog.user.currentActivity.name}
              </Typography>
            )}
          </Box>
        )}
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('activityManagement.SELECT_NEW_ACTIVITY')}</InputLabel>
              <Select
                value={dialog.newActivity}
                onChange={(e) => onDialogChange({
                  ...dialog,
                  newActivity: e.target.value
                })}
                label={t('activityManagement.SELECT_NEW_ACTIVITY')}
                disabled={loadingActivities}
              >
                {loadingActivities ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('activityManagement.LOADING_ACTIVITIES')}
                  </MenuItem>
                ) : (
                  availableActivities
                    .filter(activity => activity.id !== dialog.user?.currentActivity?.id)
                    .map(renderActivityMenuItem)
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('activityManagement.REASON')}
              multiline
              rows={3}
              value={dialog.reason}
              onChange={(e) => onDialogChange({
                ...dialog,
                reason: e.target.value
              })}
              placeholder={t('activityManagement.TRANSFER_REASON_PLACEHOLDER')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onDialogChange({ ...dialog, open: false })}
          disabled={operationLoading}
        >
          {t('activityManagement.CANCEL')}
        </Button>
        <Button
          onClick={onTransfer}
          variant="contained"
          disabled={operationLoading || !dialog.newActivity}
        >
          {operationLoading ? <CircularProgress size={20} /> : t('activityManagement.TRANSFER')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog;