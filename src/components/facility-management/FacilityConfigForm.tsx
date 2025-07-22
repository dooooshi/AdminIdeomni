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
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Info as InfoIcon
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
  const isEditMode = Boolean(config);

  // Validation schema
  const validationSchema = Yup.object({
    facilityType: Yup.string().required(t('FACILITY_TYPE_REQUIRED')),
    category: Yup.string().required(t('CATEGORY_REQUIRED')),
    defaultCapacity: Yup.number()
      .min(1, t('CAPACITY_MIN_ERROR'))
      .nullable(),
    minCapacity: Yup.number()
      .min(1, t('CAPACITY_MIN_ERROR'))
      .required(t('MIN_CAPACITY_REQUIRED')),
    maxCapacity: Yup.number()
      .min(1, t('CAPACITY_MIN_ERROR'))
      .required(t('MAX_CAPACITY_REQUIRED'))
      .test('max-greater-than-min', t('MAX_CAPACITY_ERROR'), function(value) {
        const { minCapacity } = this.parent;
        return !value || !minCapacity || value >= minCapacity;
      }),
    defaultBuildCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .nullable(),
    minBuildCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .required(t('MIN_BUILD_COST_REQUIRED')),
    maxBuildCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .required(t('MAX_BUILD_COST_REQUIRED'))
      .test('max-greater-than-min', t('MAX_BUILD_COST_ERROR'), function(value) {
        const { minBuildCost } = this.parent;
        return !value || !minBuildCost || value >= minBuildCost;
      }),
    defaultMaintenanceCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .nullable(),
    minMaintenanceCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .required(t('MIN_MAINTENANCE_COST_REQUIRED')),
    maxMaintenanceCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .required(t('MAX_MAINTENANCE_COST_REQUIRED'))
      .test('max-greater-than-min', t('MAX_MAINTENANCE_COST_ERROR'), function(value) {
        const { minMaintenanceCost } = this.parent;
        return !value || !minMaintenanceCost || value >= minMaintenanceCost;
      }),
    defaultOperationCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .nullable(),
    minOperationCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .required(t('MIN_OPERATION_COST_REQUIRED')),
    maxOperationCost: Yup.number()
      .min(0, t('COST_MIN_ERROR'))
      .required(t('MAX_OPERATION_COST_REQUIRED'))
      .test('max-greater-than-min', t('MAX_OPERATION_COST_ERROR'), function(value) {
        const { minOperationCost } = this.parent;
        return !value || !minOperationCost || value >= minOperationCost;
      }),
    isActive: Yup.boolean(),
    configData: Yup.object().nullable(),
  });

  // Form setup
  const formik = useFormik({
    initialValues: {
      facilityType: config?.facilityType || '',
      category: config?.category || '',
      defaultCapacity: config?.defaultCapacity || null,
      minCapacity: config?.minCapacity || 1,
      maxCapacity: config?.maxCapacity || 100,
      defaultBuildCost: config?.defaultBuildCost || null,
      minBuildCost: config?.minBuildCost || 1000,
      maxBuildCost: config?.maxBuildCost || 10000,
      defaultMaintenanceCost: config?.defaultMaintenanceCost || null,
      minMaintenanceCost: config?.minMaintenanceCost || 100,
      maxMaintenanceCost: config?.maxMaintenanceCost || 1000,
      defaultOperationCost: config?.defaultOperationCost || null,
      minOperationCost: config?.minOperationCost || 50,
      maxOperationCost: config?.maxOperationCost || 500,
      isActive: config?.isActive ?? true,
      configData: config?.configData || null,
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

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

      const submitData = {
        facilityType: values.facilityType as FacilityType,
        category: values.category as FacilityCategory,
        defaultCapacity: values.defaultCapacity || undefined,
        minCapacity: values.minCapacity,
        maxCapacity: values.maxCapacity,
        defaultBuildCost: values.defaultBuildCost || undefined,
        minBuildCost: values.minBuildCost,
        maxBuildCost: values.maxBuildCost,
        defaultMaintenanceCost: values.defaultMaintenanceCost || undefined,
        minMaintenanceCost: values.minMaintenanceCost,
        maxMaintenanceCost: values.maxMaintenanceCost,
        defaultOperationCost: values.defaultOperationCost || undefined,
        minOperationCost: values.minOperationCost,
        maxOperationCost: values.maxOperationCost,
        isActive: values.isActive,
        configData: values.configData || undefined,
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
    onClose();
  };

  const facilityCategories = Object.values(FacilityCategory);

  // Helper function to validate default values are within min-max range
  const validateDefaultValue = (defaultValue: number | null, min: number, max: number, fieldName: string) => {
    if (defaultValue && (defaultValue < min || defaultValue > max)) {
      formik.setFieldError(fieldName, t('DEFAULT_VALUE_OUT_OF_RANGE', { min, max }));
    }
  };

  // Validate default values when min/max changes
  useEffect(() => {
    if (formik.values.defaultCapacity) {
      validateDefaultValue(formik.values.defaultCapacity, formik.values.minCapacity, formik.values.maxCapacity, 'defaultCapacity');
    }
    if (formik.values.defaultBuildCost) {
      validateDefaultValue(formik.values.defaultBuildCost, formik.values.minBuildCost, formik.values.maxBuildCost, 'defaultBuildCost');
    }
    if (formik.values.defaultMaintenanceCost) {
      validateDefaultValue(formik.values.defaultMaintenanceCost, formik.values.minMaintenanceCost, formik.values.maxMaintenanceCost, 'defaultMaintenanceCost');
    }
    if (formik.values.defaultOperationCost) {
      validateDefaultValue(formik.values.defaultOperationCost, formik.values.minOperationCost, formik.values.maxOperationCost, 'defaultOperationCost');
    }
  }, [
    formik.values.minCapacity, formik.values.maxCapacity, formik.values.defaultCapacity,
    formik.values.minBuildCost, formik.values.maxBuildCost, formik.values.defaultBuildCost,
    formik.values.minMaintenanceCost, formik.values.maxMaintenanceCost, formik.values.defaultMaintenanceCost,
    formik.values.minOperationCost, formik.values.maxOperationCost, formik.values.defaultOperationCost
  ]);

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
          {isEditMode ? t('EDIT_CONFIGURATION') : t('CREATE_CONFIGURATION')}
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('BASIC_INFORMATION')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        error={Boolean(formik.touched.facilityType && formik.errors.facilityType)}
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
                    <Grid item xs={12}>
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
                </CardContent>
              </Card>
            </Grid>

            {/* Capacity Configuration */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <SpeedIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('CAPACITY_CONFIGURATION')}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        name="minCapacity"
                        label={t('MIN_CAPACITY')}
                        value={formik.values.minCapacity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(formik.touched.minCapacity && formik.errors.minCapacity)}
                        helperText={formik.touched.minCapacity && formik.errors.minCapacity}
                        required
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        name="maxCapacity"
                        label={t('MAX_CAPACITY')}
                        value={formik.values.maxCapacity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(formik.touched.maxCapacity && formik.errors.maxCapacity)}
                        helperText={formik.touched.maxCapacity && formik.errors.maxCapacity}
                        required
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        name="defaultCapacity"
                        label={t('DEFAULT_CAPACITY')}
                        value={formik.values.defaultCapacity || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(formik.touched.defaultCapacity && formik.errors.defaultCapacity)}
                        helperText={formik.touched.defaultCapacity && formik.errors.defaultCapacity}
                        inputProps={{ min: 1 }}
                        placeholder={t('OPTIONAL')}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Cost Configuration */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <MoneyIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('COST_CONFIGURATION')}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    {/* Build Cost */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('BUILD_COST')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="minBuildCost"
                            label={t('MIN_BUILD_COST')}
                            value={formik.values.minBuildCost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.minBuildCost && formik.errors.minBuildCost)}
                            helperText={formik.touched.minBuildCost && formik.errors.minBuildCost}
                            required
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 100 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="maxBuildCost"
                            label={t('MAX_BUILD_COST')}
                            value={formik.values.maxBuildCost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.maxBuildCost && formik.errors.maxBuildCost)}
                            helperText={formik.touched.maxBuildCost && formik.errors.maxBuildCost}
                            required
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 100 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="defaultBuildCost"
                            label={t('DEFAULT_BUILD_COST')}
                            value={formik.values.defaultBuildCost || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.defaultBuildCost && formik.errors.defaultBuildCost)}
                            helperText={formik.touched.defaultBuildCost && formik.errors.defaultBuildCost}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 100 }}
                            placeholder={t('OPTIONAL')}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Maintenance Cost */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('MAINTENANCE_COST')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="minMaintenanceCost"
                            label={t('MIN_MAINTENANCE_COST')}
                            value={formik.values.minMaintenanceCost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.minMaintenanceCost && formik.errors.minMaintenanceCost)}
                            helperText={formik.touched.minMaintenanceCost && formik.errors.minMaintenanceCost}
                            required
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 10 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="maxMaintenanceCost"
                            label={t('MAX_MAINTENANCE_COST')}
                            value={formik.values.maxMaintenanceCost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.maxMaintenanceCost && formik.errors.maxMaintenanceCost)}
                            helperText={formik.touched.maxMaintenanceCost && formik.errors.maxMaintenanceCost}
                            required
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 10 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="defaultMaintenanceCost"
                            label={t('DEFAULT_MAINTENANCE_COST')}
                            value={formik.values.defaultMaintenanceCost || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.defaultMaintenanceCost && formik.errors.defaultMaintenanceCost)}
                            helperText={formik.touched.defaultMaintenanceCost && formik.errors.defaultMaintenanceCost}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 10 }}
                            placeholder={t('OPTIONAL')}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Operation Cost */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('OPERATION_COST')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="minOperationCost"
                            label={t('MIN_OPERATION_COST')}
                            value={formik.values.minOperationCost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.minOperationCost && formik.errors.minOperationCost)}
                            helperText={formik.touched.minOperationCost && formik.errors.minOperationCost}
                            required
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 5 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="maxOperationCost"
                            label={t('MAX_OPERATION_COST')}
                            value={formik.values.maxOperationCost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.maxOperationCost && formik.errors.maxOperationCost)}
                            helperText={formik.touched.maxOperationCost && formik.errors.maxOperationCost}
                            required
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 5 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            name="defaultOperationCost"
                            label={t('DEFAULT_OPERATION_COST')}
                            value={formik.values.defaultOperationCost || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(formik.touched.defaultOperationCost && formik.errors.defaultOperationCost)}
                            helperText={formik.touched.defaultOperationCost && formik.errors.defaultOperationCost}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 5 }}
                            placeholder={t('OPTIONAL')}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
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