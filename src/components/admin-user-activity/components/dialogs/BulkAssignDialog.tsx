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
  Typography,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import Grid2 from '@mui/material/GridLegacy';
import { format } from 'date-fns';
import { Activity } from '@/lib/services/activityService';
import { BulkAssignDialogState } from '../../types';

interface BulkAssignDialogProps {
  dialog: BulkAssignDialogState;
  availableActivities: Activity[];
  loadingActivities: boolean;
  operationLoading: boolean;
  selectedUsersCount: number;
  onDialogChange: (dialog: BulkAssignDialogState) => void;
  onBulkAssign: () => void;
}

const BulkAssignDialog: React.FC<BulkAssignDialogProps> = ({
  dialog,
  availableActivities,
  loadingActivities,
  operationLoading,
  selectedUsersCount,
  onDialogChange,
  onBulkAssign,
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
      <DialogTitle>{t('activityManagement.BULK_ASSIGN_USERS')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>{t('activityManagement.SELECTED_USERS')}:</strong> {selectedUsersCount} {t('activityManagement.USERS')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('activityManagement.BULK_ASSIGN_DESCRIPTION')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid2 container spacing={2}>
          <Grid2 item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('activityManagement.SELECT_ACTIVITY')}</InputLabel>
              <Select
                value={dialog.activityId}
                onChange={(e) => onDialogChange({
                  ...dialog,
                  activityId: e.target.value
                })}
                label={t('activityManagement.SELECT_ACTIVITY')}
                disabled={loadingActivities}
              >
                {loadingActivities ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('activityManagement.LOADING_ACTIVITIES')}
                  </MenuItem>
                ) : (
                  availableActivities.map(renderActivityMenuItem)
                )}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 item xs={12}>
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
              placeholder={t('activityManagement.BULK_ASSIGNMENT_REASON_PLACEHOLDER')}
            />
          </Grid2>
          <Grid2 item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={dialog.forceAssignment}
                  onChange={(e) => onDialogChange({
                    ...dialog,
                    forceAssignment: e.target.checked
                  })}
                />
              }
              label={t('activityManagement.FORCE_ASSIGNMENT')}
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onDialogChange({ ...dialog, open: false })}
          disabled={operationLoading}
        >
          {t('activityManagement.CANCEL')}
        </Button>
        <Button
          onClick={onBulkAssign}
          variant="contained"
          disabled={operationLoading || !dialog.activityId}
        >
          {operationLoading ? <CircularProgress size={20} /> : t('activityManagement.BULK_ASSIGN')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssignDialog;