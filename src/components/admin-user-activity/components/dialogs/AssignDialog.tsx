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
import Grid from '@mui/material/GridLegacy';
import { format } from 'date-fns';
import AdminUserActivityService from '@/lib/services/adminUserActivityService';
import { Activity } from '@/lib/services/activityService';
import { AssignDialogState } from '../../types';

interface AssignDialogProps {
  dialog: AssignDialogState;
  availableActivities: Activity[];
  loadingActivities: boolean;
  operationLoading: boolean;
  onDialogChange: (dialog: AssignDialogState) => void;
  onAssign: () => void;
}

const AssignDialog: React.FC<AssignDialogProps> = ({
  dialog,
  availableActivities,
  loadingActivities,
  operationLoading,
  onDialogChange,
  onAssign,
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
      <DialogTitle>{t('activityManagement.ASSIGN_USER_TO_ACTIVITY')}</DialogTitle>
      <DialogContent>
        {dialog.user && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>{t('activityManagement.USER')}:</strong> {AdminUserActivityService.formatUserDisplayName(dialog.user)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dialog.user.email}
            </Typography>
          </Box>
        )}
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('activityManagement.SELECT_ACTIVITY')}</InputLabel>
              <Select
                value={dialog.selectedActivity}
                onChange={(e) => onDialogChange({
                  ...dialog,
                  selectedActivity: e.target.value
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
              placeholder={t('activityManagement.ASSIGNMENT_REASON_PLACEHOLDER')}
            />
          </Grid>
          <Grid item xs={12}>
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
          onClick={onAssign}
          variant="contained"
          disabled={operationLoading || !dialog.selectedActivity}
        >
          {operationLoading ? <CircularProgress size={20} /> : t('activityManagement.ASSIGN')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignDialog;