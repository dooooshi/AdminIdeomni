'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// Import locales for DateTimePicker
import { enUS } from 'date-fns/locale/en-US';
import { zhCN } from 'date-fns/locale/zh-CN';
import useI18n from '@i18n/useI18n';
import ActivityService, { 
  Activity, 
  CreateActivityRequest, 
  UpdateActivityRequest, 
  ActivityType 
} from '@/lib/services/activityService';

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity?: Activity | null;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  open,
  onClose,
  onSuccess,
  activity,
}) => {
  const { t } = useTranslation('activityManagement');
  const { languageId } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(activity);

  // Get the appropriate date-fns locale
  const dateLocale = languageId === 'zh-CN' ? zhCN : enUS;

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('ACTIVITY_NAME_REQUIRED'))
      .min(3, t('ACTIVITY_NAME_MIN_LENGTH'))
      .max(200, t('ACTIVITY_NAME_MAX_LENGTH')),
    description: Yup.string()
      .max(1000, t('DESCRIPTION_MAX_LENGTH')),
    activityType: Yup.string()
      .oneOf(Object.values(ActivityType), t('ACTIVITY_TYPE_INVALID'))
      .required(t('ACTIVITY_TYPE_REQUIRED')),
    startAt: Yup.date()
      .required(t('START_DATE_REQUIRED'))
      .test('future-date', t('FUTURE_START_DATE'), function(value) {
        // Allow past dates when editing existing activities
        if (isEditMode) return true;
        // For new activities, require future date
        return value ? value >= new Date() : false;
      }),
    endAt: Yup.date()
      .required(t('END_DATE_REQUIRED'))
      .min(Yup.ref('startAt'), t('END_DATE_AFTER_START')),
    isActive: Yup.boolean(),
  });

  // Form handling
  const formik = useFormik({
    initialValues: {
      name: activity?.name || '',
      description: activity?.description || '',
      activityType: activity?.activityType || ActivityType.BizSimulation2_0,
      startAt: activity?.startAt ? new Date(activity.startAt) : new Date(),
      endAt: activity?.endAt ? new Date(activity.endAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: activity?.isActive ?? true,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      
      try {
        const requestData = {
          name: values.name,
          description: values.description,
          activityType: values.activityType as ActivityType,
          startAt: values.startAt.toISOString(),
          endAt: values.endAt.toISOString(),
          isActive: values.isActive,
        };

        if (isEditMode && activity) {
          await ActivityService.updateActivity(activity.id, requestData as UpdateActivityRequest);
        } else {
          await ActivityService.createActivity(requestData as CreateActivityRequest);
        }

        onSuccess();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('ACTIVITY_SAVE_ERROR'));
      } finally {
        setLoading(false);
      }
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      formik.resetForm({
        values: {
          name: activity?.name || '',
          description: activity?.description || '',
          activityType: activity?.activityType || ActivityType.BizSimulation2_0,
          startAt: activity?.startAt ? new Date(activity.startAt) : new Date(),
          endAt: activity?.endAt ? new Date(activity.endAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
          isActive: activity?.isActive ?? true,
        },
      });
    }
  }, [open, activity]);

  const getActivityTypeDisplayName = (type: ActivityType): string => {
    switch (type) {
      case ActivityType.BizSimulation2_0:
        return t('BIZSIMULATION2_0');
      case ActivityType.BizSimulation2_2:
        return t('BIZSIMULATION2_2');
      case ActivityType.BizSimulation3_1:
        return t('BIZSIMULATION3_1');
      default:
        return type;
    }
  };

  const calculateDuration = (): string | null => {
    if (!formik.values.startAt || !formik.values.endAt) return null;
    
    const diffMs = formik.values.endAt.getTime() - formik.values.startAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return t('DURATION_MULTI', { days: diffDays, hours: diffHours, minutes: 0 });
    } else if (diffHours > 0) {
      return t('DURATION_HOURS', { hours: diffHours });
    } else {
      return t('DURATION_MINUTES', { minutes: diffMinutes });
    }
  };

  const duration = calculateDuration();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <EventIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {isEditMode ? t('ACTIVITY_FORM_EDIT_TITLE') : t('ACTIVITY_FORM_CREATE_TITLE')}
                  </Typography>
                  {isEditMode && (
                    <Chip 
                      label={getActivityTypeDisplayName(activity?.activityType || ActivityType.BizSimulation2_0)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Stack>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              {/* Basic Information */}
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <InfoIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {t('ACTIVITY_BASIC_INFO')}
                      </Typography>
                    </Stack>
                    
                    <TextField
                      fullWidth
                      name="name"
                      label={t('ACTIVITY_NAME_LABEL')}
                      placeholder={t('ACTIVITY_NAME_PLACEHOLDER')}
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                    />

                    <FormControl fullWidth>
                      <InputLabel>{t('ACTIVITY_TYPE_LABEL')}</InputLabel>
                      <Select
                        name="activityType"
                        value={formik.values.activityType}
                        label={t('ACTIVITY_TYPE_LABEL')}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.activityType && Boolean(formik.errors.activityType)}
                      >
                        <MenuItem value={ActivityType.BizSimulation2_0}>
                          {t('BIZSIMULATION2_0')}
                        </MenuItem>
                        <MenuItem value={ActivityType.BizSimulation2_2}>
                          {t('BIZSIMULATION2_2')}
                        </MenuItem>
                        <MenuItem value={ActivityType.BizSimulation3_1}>
                          {t('BIZSIMULATION3_1')}
                        </MenuItem>
                      </Select>
                      {formik.touched.activityType && formik.errors.activityType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {formik.errors.activityType}
                        </Typography>
                      )}
                    </FormControl>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="description"
                      label={t('DESCRIPTION_LABEL')}
                      placeholder={t('DESCRIPTION_PLACEHOLDER')}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ScheduleIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {t('ACTIVITY_SCHEDULE')}
                      </Typography>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <DateTimePicker
                        label={t('START_DATE_LABEL')}
                        value={formik.values.startAt}
                        onChange={(date) => formik.setFieldValue('startAt', date)}
                        onClose={() => formik.setFieldTouched('startAt', true)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: formik.touched.startAt && Boolean(formik.errors.startAt),
                            helperText: formik.touched.startAt && formik.errors.startAt ? String(formik.errors.startAt) : '',
                          },
                        }}
                      />

                      <DateTimePicker
                        label={t('END_DATE_LABEL')}
                        value={formik.values.endAt}
                        onChange={(date) => formik.setFieldValue('endAt', date)}
                        onClose={() => formik.setFieldTouched('endAt', true)}
                        minDateTime={formik.values.startAt || undefined}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: formik.touched.endAt && Boolean(formik.errors.endAt),
                            helperText: formik.touched.endAt && formik.errors.endAt ? String(formik.errors.endAt) : '',
                          },
                        }}
                      />
                    </Stack>

                    {/* Duration Display */}
                    {duration && (
                      <Alert severity="info" icon={<AccessTimeIcon />}>
                        <Typography variant="body2">
                          <strong>{t('DURATION')}:</strong> {duration}
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SettingsIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {t('ACTIVITY_SETTINGS')}
                      </Typography>
                    </Stack>

                    <FormControlLabel
                      control={
                        <Switch
                          name="isActive"
                          checked={formik.values.isActive}
                          onChange={formik.handleChange}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">{t('IS_ACTIVE_LABEL')}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('IS_ACTIVE_HELPER')}
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={onClose} 
              variant="outlined"
              disabled={loading}
            >
              {t('CANCEL')}
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading || !formik.isValid}
              startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />}
            >
              {loading ? t('SAVING') : (isEditMode ? t('UPDATE_ACTIVITY') : t('CREATE_ACTIVITY'))}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ActivityForm; 