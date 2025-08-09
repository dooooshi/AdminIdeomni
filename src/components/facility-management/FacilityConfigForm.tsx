'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/@i18n/hooks/useTranslation';
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
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  FormHelperText,
  Switch,
  FormControlLabel,
  Collapse,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FacilityConfigService, {
  FacilityConfig,
  CreateFacilityConfigRequest,
  UpdateFacilityConfigRequest
} from '@/lib/services/facilityConfigService';
import { FacilityType, FacilityCategory } from '@/lib/services/facilityService';

interface FacilityConfigFormProps {
  open: boolean;
  onClose: () => void;
  config?: FacilityConfig | null;
  onSuccess?: (config: FacilityConfig) => void;
}

const FacilityConfigForm: React.FC<FacilityConfigFormProps> = ({
  open,
  onClose,
  config,
  onSuccess,
}) => {
  const { t } = useTranslation('facilityManagement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTypes, setAvailableTypes] = useState<FacilityType[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isEditMode = Boolean(config);

  // Simplified validation schema
  const validationSchema = Yup.object({
    facilityType: Yup.string().required(t('FACILITY_TYPE_REQUIRED')),
    category: Yup.string().required(t('CATEGORY_REQUIRED')),
    defaultCapacity: Yup.number().min(1, t('CAPACITY_MIN_ERROR')).required(t('DEFAULT_CAPACITY_REQUIRED')),
    defaultBuildCost: Yup.number().min(0, t('COST_MIN_ERROR')).required(t('DEFAULT_BUILD_COST_REQUIRED')),
    defaultMaintenanceCost: Yup.number().min(0, t('COST_MIN_ERROR')).required(t('DEFAULT_MAINTENANCE_COST_REQUIRED')),
    defaultOperationCost: Yup.number().min(0, t('COST_MIN_ERROR')).required(t('DEFAULT_OPERATION_COST_REQUIRED')),
    isActive: Yup.boolean(),
  });

  // Smart defaults based on facility type
  const getSmartDefaults = (facilityType: string) => {
    switch (facilityType) {
      case 'FACTORY':
        return { 
          defaultCapacity: 100, 
          defaultBuildCost: 15000, 
          defaultMaintenanceCost: 800, 
          defaultOperationCost: 400 
        };
      case 'MALL':
        return { 
          defaultCapacity: 200, 
          defaultBuildCost: 25000, 
          defaultMaintenanceCost: 1200, 
          defaultOperationCost: 600 
        };
      case 'HOSPITAL':
        return { 
          defaultCapacity: 300, 
          defaultBuildCost: 50000, 
          defaultMaintenanceCost: 2000, 
          defaultOperationCost: 1000 
        };
      case 'SCHOOL':
        return { 
          defaultCapacity: 500, 
          defaultBuildCost: 30000, 
          defaultMaintenanceCost: 1500, 
          defaultOperationCost: 750 
        };
      case 'MINE':
        return { 
          defaultCapacity: 80, 
          defaultBuildCost: 20000, 
          defaultMaintenanceCost: 1000, 
          defaultOperationCost: 500 
        };
      case 'FARM':
        return { 
          defaultCapacity: 150, 
          defaultBuildCost: 12000, 
          defaultMaintenanceCost: 600, 
          defaultOperationCost: 300 
        };
      default:
        return { 
          defaultCapacity: 50, 
          defaultBuildCost: 5000, 
          defaultMaintenanceCost: 500, 
          defaultOperationCost: 250 
        };
    }
  };

  const formik = useFormik({
    initialValues: {
      facilityType: config?.facilityType || '',
      category: config?.category || '',
      defaultCapacity: config?.defaultCapacity || '',
      defaultBuildCost: config?.defaultBuildCost || '',
      defaultMaintenanceCost: config?.defaultMaintenanceCost || '',
      defaultOperationCost: config?.defaultOperationCost || '',
      isActive: config?.isActive ?? true,
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  // Auto-fill smart defaults when facility type changes
  useEffect(() => {
    if (formik.values.facilityType && !isEditMode) {
      const smartDefaults = getSmartDefaults(formik.values.facilityType);
      
      // Only update if current values are empty (not set by user)
      if (!formik.values.defaultCapacity) {
        formik.setFieldValue('defaultCapacity', smartDefaults.defaultCapacity);
      }
      if (!formik.values.defaultBuildCost) {
        formik.setFieldValue('defaultBuildCost', smartDefaults.defaultBuildCost);
      }
      if (!formik.values.defaultMaintenanceCost) {
        formik.setFieldValue('defaultMaintenanceCost', smartDefaults.defaultMaintenanceCost);
      }
      if (!formik.values.defaultOperationCost) {
        formik.setFieldValue('defaultOperationCost', smartDefaults.defaultOperationCost);
      }
    }
  }, [formik.values.facilityType, isEditMode]);

  // Update available types when category changes
  useEffect(() => {
    if (formik.values.category) {
      const category = formik.values.category as FacilityCategory;
      const typesForCategory = Object.values(FacilityType).filter(type =>
        FacilityConfigService.validateTypeCategory?.(type, category) ?? true
      );
      setAvailableTypes(typesForCategory);
    } else {
      setAvailableTypes(Object.values(FacilityType));
    }
  }, [formik.values.category]);

  // Validate type-category match
  useEffect(() => {
    if (formik.values.facilityType && formik.values.category) {
      const isValid = FacilityConfigService.validateTypeCategory?.(
        formik.values.facilityType as FacilityType,
        formik.values.category as FacilityCategory
      ) ?? true;
      
      if (!isValid) {
        formik.setFieldError('facilityType', t('INVALID_TYPE_CATEGORY_COMBINATION'));
      }
    }
  }, [formik.values.facilityType, formik.values.category, t]);

  async function handleSubmit(values: any) {
    try {
      setLoading(true);
      setError(null);

      // Set reasonable min/max ranges based on defaults
      const capacity = Number(values.defaultCapacity);
      const buildCost = Number(values.defaultBuildCost);
      const maintenanceCost = Number(values.defaultMaintenanceCost);
      const operationCost = Number(values.defaultOperationCost);
      
      const submitData = {
        facilityType: values.facilityType as FacilityType,
        category: values.category as FacilityCategory,
        defaultCapacity: capacity,
        minCapacity: Math.max(1, Math.floor(capacity * 0.5)),
        maxCapacity: Math.ceil(capacity * 2),
        defaultBuildCost: buildCost,
        minBuildCost: Math.max(1000, Math.floor(buildCost * 0.7)),
        maxBuildCost: Math.ceil(buildCost * 1.5),
        defaultMaintenanceCost: maintenanceCost,
        minMaintenanceCost: Math.max(100, Math.floor(maintenanceCost * 0.6)),
        maxMaintenanceCost: Math.ceil(maintenanceCost * 1.8),
        defaultOperationCost: operationCost,
        minOperationCost: Math.max(50, Math.floor(operationCost * 0.6)),
        maxOperationCost: Math.ceil(operationCost * 1.8),
        isActive: values.isActive,
      };

      let result: FacilityConfig;
      if (isEditMode && config) {
        result = await FacilityConfigService.updateFacilityConfig(
          config.id,
          submitData as UpdateFacilityConfigRequest
        );
      } else {
        result = await FacilityConfigService.createFacilityConfig(
          submitData as CreateFacilityConfigRequest
        );
      }

      onSuccess?.(result);
      handleClose();
    } catch (err) {
      console.error('Error saving facility configuration:', err);
      setError(isEditMode ? t('ERROR_UPDATING_CONFIGURATION') : t('ERROR_CREATING_CONFIGURATION'));
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    formik.resetForm();
    setError(null);
    setShowAdvanced(false);
    onClose();
  };

  const facilityCategories = Object.values(FacilityCategory);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {isEditMode ? t('EDIT_CONFIGURATION') : t('CREATE_CONFIGURATION')}
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                {t('BASIC_INFORMATION')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    error={Boolean(formik.touched.category && formik.errors.category)}
                  >
                    <InputLabel>{t('CATEGORY')}</InputLabel>
                    <Select
                      name="category"
                      value={formik.values.category}
                      label={t('CATEGORY')}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {facilityCategories?.map((category) => (
                        <MenuItem key={category} value={category}>
                          {t(`FACILITY_CATEGORY_${category}`)}
                        </MenuItem>
                      )) || []}
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <FormHelperText>{formik.errors.category}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    error={Boolean(formik.touched.facilityType && formik.errors.facilityType)}
                    disabled={!formik.values.category}
                  >
                    <InputLabel>{t('FACILITY_TYPE')}</InputLabel>
                    <Select
                      name="facilityType"
                      value={formik.values.facilityType}
                      label={t('FACILITY_TYPE')}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {availableTypes?.map((type) => (
                        <MenuItem key={type} value={type}>
                          {t(`FACILITY_TYPE_${type}`)}
                        </MenuItem>
                      )) || []}
                    </Select>
                    {formik.touched.facilityType && formik.errors.facilityType && (
                      <FormHelperText>{formik.errors.facilityType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.isActive}
                        onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                        name="isActive"
                      />
                    }
                    label={t('ACTIVE_CONFIGURATION')}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Capacity & Costs */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1, fontSize: 20 }} />
                {t('CAPACITY_AND_COSTS')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    name="defaultCapacity"
                    label={t('DEFAULT_CAPACITY')}
                    value={formik.values.defaultCapacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.defaultCapacity && formik.errors.defaultCapacity)}
                    helperText={formik.touched.defaultCapacity && formik.errors.defaultCapacity}
                    required
                    inputProps={{ min: 1 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SpeedIcon /></InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    name="defaultBuildCost"
                    label={t('BUILD_COST')}
                    value={formik.values.defaultBuildCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.defaultBuildCost && formik.errors.defaultBuildCost)}
                    helperText={formik.touched.defaultBuildCost && formik.errors.defaultBuildCost}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 100 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    name="defaultMaintenanceCost"
                    label={t('MAINTENANCE_COST')}
                    value={formik.values.defaultMaintenanceCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.defaultMaintenanceCost && formik.errors.defaultMaintenanceCost)}
                    helperText={formik.touched.defaultMaintenanceCost && formik.errors.defaultMaintenanceCost}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 10 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    name="defaultOperationCost"
                    label={t('OPERATION_COST')}
                    value={formik.values.defaultOperationCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.defaultOperationCost && formik.errors.defaultOperationCost)}
                    helperText={formik.touched.defaultOperationCost && formik.errors.defaultOperationCost}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 5 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} disabled={loading}>
            {t('CANCEL')}
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formik.isValid}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading
              ? t('SAVING')
              : isEditMode
              ? t('UPDATE_CONFIGURATION')
              : t('CREATE_CONFIGURATION')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FacilityConfigForm; 