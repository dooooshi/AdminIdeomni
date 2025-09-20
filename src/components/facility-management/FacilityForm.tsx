'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
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

  Divider,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FacilityService, {
  Facility,
  FacilityType,
  FacilityCategory,
  CreateFacilityRequest,
  UpdateFacilityRequest,
} from '@/lib/services/facilityService';

interface FacilityFormProps {
  open: boolean;
  onClose: () => void;
  facility?: Facility | null;
  onSuccess: (facility: Facility) => void;
}

const FacilityForm: React.FC<FacilityFormProps> = ({
  open,
  onClose,
  facility,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTypes, setAvailableTypes] = useState<FacilityType[]>([]);

  const isEditMode = Boolean(facility);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, t('facilityManagement.NAME_MIN_LENGTH'))
      .max(100, t('facilityManagement.NAME_MAX_LENGTH'))
      .required(t('facilityManagement.NAME_REQUIRED')),
    facilityType: Yup.string().required(t('facilityManagement.TYPE_REQUIRED')),
    category: Yup.string().required(t('facilityManagement.CATEGORY_REQUIRED')),
    description: Yup.string()
      .max(500, t('facilityManagement.DESCRIPTION_MAX_LENGTH'))
      .nullable(),
    capacity: Yup.number()
      .min(0, t('facilityManagement.CAPACITY_INVALID'))
      .nullable(),
    buildCost: Yup.number()
      .min(0, t('facilityManagement.COST_INVALID'))
      .nullable(),
    maintenanceCost: Yup.number()
      .min(0, t('facilityManagement.COST_INVALID'))
      .nullable(),
    operationCost: Yup.number()
      .min(0, t('facilityManagement.COST_INVALID'))
      .nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: facility?.name || '',
      facilityType: facility?.facilityType || '',
      category: facility?.category || '',
      description: facility?.description || '',
      capacity: facility?.capacity?.toString() || '',
      buildCost: facility?.buildCost?.toString() || '',
      maintenanceCost: facility?.maintenanceCost?.toString() || '',
      operationCost: facility?.operationCost?.toString() || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  // Update available types when category changes
  useEffect(() => {
    if (formik.values.category) {
      const types = FacilityService.getFacilityTypesForCategory(formik.values.category as FacilityCategory);
      setAvailableTypes(types);
      
      // Clear facility type if it doesn't match the new category
      if (formik.values.facilityType && !types.includes(formik.values.facilityType as FacilityType)) {
        formik.setFieldValue('facilityType', '');
      }
    } else {
      setAvailableTypes([]);
    }
  }, [formik.values.category]);

  // Validate type-category match
  useEffect(() => {
    if (formik.values.facilityType && formik.values.category) {
      const isValid = FacilityService.validateTypeCategory(
        formik.values.facilityType as FacilityType,
        formik.values.category as FacilityCategory
      );
      
      if (!isValid) {
        formik.setFieldError('facilityType', t('facilityManagement.TYPE_CATEGORY_MISMATCH'));
      }
    }
  }, [formik.values.facilityType, formik.values.category]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      setError(null);

      const facilityData = {
        name: values.name,
        facilityType: values.facilityType as FacilityType,
        category: values.category as FacilityCategory,
        description: values.description || undefined,
        capacity: values.capacity ? parseInt(values.capacity) : undefined,
        buildCost: values.buildCost ? parseFloat(values.buildCost) : undefined,
        maintenanceCost: values.maintenanceCost ? parseFloat(values.maintenanceCost) : undefined,
        operationCost: values.operationCost ? parseFloat(values.operationCost) : undefined,
      };

      let result: Facility;
      if (isEditMode && facility) {
        result = await FacilityService.updateFacility(facility.id, facilityData as UpdateFacilityRequest);
      } else {
        result = await FacilityService.createFacility(facilityData as CreateFacilityRequest);
      }

      onSuccess(result);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditMode ? t('facilityManagement.FACILITY_UPDATE_ERROR') : t('facilityManagement.FACILITY_CREATE_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    setError(null);
    onClose();
  };

  const facilityCategories = Object.values(FacilityCategory);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <BusinessIcon />
            <Box>
              <Typography variant="h6">
                {isEditMode ? t('facilityManagement.FACILITY_FORM_EDIT_TITLE') : t('facilityManagement.FACILITY_FORM_CREATE_TITLE')}
              </Typography>
              {isEditMode && facility && (
                <Typography variant="body2" color="textSecondary">
                  {facility.name}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Basic Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('facilityManagement.FACILITY_FORM_BASIC_INFO')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label={t('facilityManagement.NAME_LABEL')}
                    placeholder={t('facilityManagement.NAME_PLACEHOLDER')}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    required
                  >
                    <InputLabel>{t('facilityManagement.CATEGORY_LABEL')}</InputLabel>
                    <Select
                      name="category"
                      value={formik.values.category}
                      label={t('facilityManagement.CATEGORY_LABEL')}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="">
                        <em>{t('facilityManagement.CATEGORY_PLACEHOLDER')}</em>
                      </MenuItem>
                      {facilityCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              size="small"
                              label={t(category)}
                              color={
                                category === FacilityCategory.RAW_MATERIAL_PRODUCTION ? 'success' :
                                category === FacilityCategory.FUNCTIONAL ? 'primary' :
                                category === FacilityCategory.INFRASTRUCTURE ? 'warning' : 'secondary'
                              }
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {formik.errors.category}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    error={formik.touched.facilityType && Boolean(formik.errors.facilityType)}
                    required
                    disabled={!formik.values.category}
                  >
                    <InputLabel>{t('facilityManagement.TYPE_LABEL')}</InputLabel>
                    <Select
                      name="facilityType"
                      value={formik.values.facilityType}
                      label={t('facilityManagement.TYPE_LABEL')}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="">
                        <em>{t('facilityManagement.TYPE_PLACEHOLDER')}</em>
                      </MenuItem>
                      {availableTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          <Box>
                            <Typography variant="body2">
                              {FacilityService.getFacilityTypeName(type)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {t(`${type}_DESCRIPTION`)}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.facilityType && formik.errors.facilityType && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {formik.errors.facilityType}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    label={t('facilityManagement.DESCRIPTION_LABEL')}
                    placeholder={t('facilityManagement.DESCRIPTION_PLACEHOLDER')}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="capacity"
                    label={t('facilityManagement.CAPACITY_LABEL')}
                    placeholder={t('facilityManagement.CAPACITY_PLACEHOLDER')}
                    value={formik.values.capacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                    helperText={formik.touched.capacity && formik.errors.capacity}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Cost Information */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('facilityManagement.FACILITY_FORM_COST_INFO')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    name="buildCost"
                    label={t('facilityManagement.BUILD_COST_LABEL')}
                    placeholder={t('facilityManagement.BUILD_COST_PLACEHOLDER')}
                    value={formik.values.buildCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.buildCost && Boolean(formik.errors.buildCost)}
                    helperText={formik.touched.buildCost && formik.errors.buildCost}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    name="maintenanceCost"
                    label={t('facilityManagement.MAINTENANCE_COST_LABEL')}
                    placeholder={t('facilityManagement.MAINTENANCE_COST_PLACEHOLDER')}
                    value={formik.values.maintenanceCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.maintenanceCost && Boolean(formik.errors.maintenanceCost)}
                    helperText={formik.touched.maintenanceCost && formik.errors.maintenanceCost}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    name="operationCost"
                    label={t('facilityManagement.OPERATION_COST_LABEL')}
                    placeholder={t('facilityManagement.OPERATION_COST_PLACEHOLDER')}
                    value={formik.values.operationCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.operationCost && Boolean(formik.errors.operationCost)}
                    helperText={formik.touched.operationCost && formik.errors.operationCost}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                {t('facilityManagement.COST_HELP')}
              </Alert>
            </AccordionDetails>
          </Accordion>

          {/* Type-Category Help */}
          {formik.values.category && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('facilityManagement.TYPE_CATEGORY_HELP')}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            startIcon={<CloseIcon />}
            disabled={loading}
          >
            {t('facilityManagement.CANCEL')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading || !formik.isValid}
          >
            {loading
              ? t('facilityManagement.LOADING')
              : isEditMode
              ? t('facilityManagement.UPDATE')
              : t('facilityManagement.CREATE')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FacilityForm; 