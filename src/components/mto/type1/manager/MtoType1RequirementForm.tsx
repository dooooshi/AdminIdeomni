'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Autocomplete
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Science as ScienceIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MtoType1Requirement, MtoType1CreateRequest, MtoType1UpdateRequest } from '@/lib/types/mtoType1';
import { ManagerProductFormula } from '@/lib/types/managerProductFormula';
import MtoType1Service from '@/lib/services/mtoType1Service';
import ManagerProductFormulaService from '@/lib/services/managerProductFormulaService';
import { enqueueSnackbar } from 'notistack';
import { addDays } from 'date-fns';

interface MtoType1RequirementFormProps {
  requirement?: MtoType1Requirement;
  onSave: (requirement: MtoType1Requirement) => void;
  onCancel: () => void;
}

const MtoType1RequirementForm: React.FC<MtoType1RequirementFormProps> = ({
  requirement,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formulas, setFormulas] = useState<ManagerProductFormula[]>([]);
  const [formulasLoading, setFormulasLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: requirement?.metadata?.name || '',
    description: requirement?.metadata?.description || '',
    managerProductFormulaId: requirement?.managerProductFormulaId || null as number | null,
    selectedFormula: null as ManagerProductFormula | null,
    purchaseGoldPrice: requirement?.purchaseGoldPrice || 100,
    basePurchaseNumber: requirement?.basePurchaseNumber || 100,
    overallPurchaseNumber: requirement?.overallPurchaseNumber || 1000,
    baseCountPopulationNumber: requirement?.baseCountPopulationNumber || 1000,
    releaseTime: requirement?.releaseTime ? new Date(requirement.releaseTime) : new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    settlementTime: requirement?.settlementTime ? new Date(requirement.settlementTime) : new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
    notes: requirement?.metadata?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedBudget, setCalculatedBudget] = useState(0);

  useEffect(() => {
    loadFormulas();
  }, []);

  useEffect(() => {
    setCalculatedBudget(Number(formData.purchaseGoldPrice) * Number(formData.overallPurchaseNumber));
  }, [formData.purchaseGoldPrice, formData.overallPurchaseNumber]);

  const loadFormulas = async () => {
    setFormulasLoading(true);
    try {
      const response = await ManagerProductFormulaService.searchProductFormulas({
        page: 1,
        limit: 100
      });
      setFormulas(response.items || []);
    } catch (error) {
      console.error('Failed to load formulas:', error);
      enqueueSnackbar(t('mto.type1.errors.formulasLoadFailed'), { variant: 'error' });
    } finally {
      setFormulasLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name is auto-filled from formula, but still validate if manually changed
    if (!formData.name.trim()) {
      newErrors.name = t('mto.type1.validation.nameRequired');
    }

    if (!formData.managerProductFormulaId) {
      newErrors.managerProductFormulaId = t('mto.type1.validation.formulaRequired');
    }

    if (Number(formData.purchaseGoldPrice) <= 0) {
      newErrors.purchaseGoldPrice = t('mto.type1.validation.invalidPrice');
    }

    if (Number(formData.basePurchaseNumber) <= 0) {
      newErrors.basePurchaseNumber = t('mto.type1.validation.invalidQuantity');
    }

    if (Number(formData.overallPurchaseNumber) <= 0) {
      newErrors.overallPurchaseNumber = t('mto.type1.validation.invalidQuantity');
    }

    if (Number(formData.baseCountPopulationNumber) <= 0) {
      newErrors.baseCountPopulationNumber = t('mto.type1.validation.invalidPopulation');
    }

    if (!formData.releaseTime) {
      newErrors.releaseTime = t('mto.type1.validation.releaseTimeRequired');
    }

    if (!formData.settlementTime) {
      newErrors.settlementTime = t('mto.type1.validation.settlementTimeRequired');
    }

    if (formData.releaseTime && formData.settlementTime && formData.releaseTime >= formData.settlementTime) {
      newErrors.settlementTime = t('mto.type1.validation.settlementAfterRelease');
    }

    const now = new Date();
    if (!requirement && formData.releaseTime && formData.releaseTime <= now) {
      newErrors.releaseTime = t('mto.type1.validation.futureReleaseTime');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const requestData = {
        managerProductFormulaId: formData.managerProductFormulaId!,
        purchaseGoldPrice: Number(formData.purchaseGoldPrice),
        basePurchaseNumber: Number(formData.basePurchaseNumber),
        releaseTime: formData.releaseTime.toISOString(),
        settlementTime: formData.settlementTime.toISOString(),
        overallPurchaseNumber: Number(formData.overallPurchaseNumber),
        baseCountPopulationNumber: Number(formData.baseCountPopulationNumber),
        metadata: {
          name: formData.name,
          description: formData.description,
          notes: formData.notes
        }
      };

      let result: MtoType1Requirement;
      if (requirement) {
        const updateData: MtoType1UpdateRequest = {
          purchaseGoldPrice: requestData.purchaseGoldPrice,
          basePurchaseNumber: requestData.basePurchaseNumber,
          releaseTime: requestData.releaseTime,
          settlementTime: requestData.settlementTime,
          overallPurchaseNumber: requestData.overallPurchaseNumber,
          baseCountPopulationNumber: requestData.baseCountPopulationNumber,
          metadata: requestData.metadata
        };
        result = await MtoType1Service.updateRequirement(requirement.id, updateData);
        enqueueSnackbar(t('mto.type1.messages.updated'), { variant: 'success' });
      } else {
        result = await MtoType1Service.createRequirement(requestData as MtoType1CreateRequest);
        enqueueSnackbar(t('mto.type1.messages.created'), { variant: 'success' });
      }

      onSave(result);
    } catch (error: any) {
      console.error('Failed to save requirement:', error);
      const message = error.response?.data?.message || t('mto.type1.errors.saveFailed');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('$', '');
  };

  // Form is editable when creating new requirement or editing a DRAFT requirement
  const isFormEditable = !requirement || requirement.status === 'DRAFT';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {requirement ? t('mto.type1.editRequirement') : t('mto.type1.createRequirement')}
        </Typography>

        {requirement && requirement.status !== 'DRAFT' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {t('mto.type1.warnings.cannotEditReleased')}
          </Alert>
        )}

        <Box component="form" noValidate>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('mto.type1.sections.basicInfo')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('mto.type1.fields.name')}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name || (formData.selectedFormula ? t('mto.type1.helpers.nameAutoFilled') : '')}
                required
                disabled={!isFormEditable}
                placeholder={formData.selectedFormula ? formData.selectedFormula.productName : ''}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={formulas}
                getOptionLabel={(option) => `#${option.formulaNumber} - ${option.productName || 'Unnamed'}`}
                value={formulas.find(f => f.id === formData.managerProductFormulaId) || null}
                onChange={(_, value) => {
                  handleChange('managerProductFormulaId', value?.id || null);
                  handleChange('selectedFormula', value);
                  // Auto-fill name with formula's product name if name is empty
                  if (value && !formData.name.trim()) {
                    handleChange('name', value.productName || '');
                  }
                }}
                loading={formulasLoading}
                disabled={!!requirement || !isFormEditable}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('mto.type1.fields.productFormula')}
                    error={!!errors.managerProductFormulaId}
                    helperText={errors.managerProductFormulaId}
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {formulasLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('mto.type1.fields.description')}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={!isFormEditable}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('mto.type1.sections.pricing')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label={t('mto.type1.fields.unitPrice')}
                value={formData.purchaseGoldPrice}
                onChange={(e) => handleChange('purchaseGoldPrice', parseFloat(e.target.value) || 0)}
                error={!!errors.purchaseGoldPrice}
                helperText={errors.purchaseGoldPrice}
                required
                disabled={!isFormEditable}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label={t('mto.type1.fields.basePurchaseNumber')}
                value={formData.basePurchaseNumber}
                onChange={(e) => handleChange('basePurchaseNumber', parseInt(e.target.value) || 0)}
                error={!!errors.basePurchaseNumber}
                helperText={errors.basePurchaseNumber || t('mto.type1.helpers.basePurchaseNumber')}
                required
                disabled={!isFormEditable}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label={t('mto.type1.fields.overallPurchaseNumber')}
                value={formData.overallPurchaseNumber}
                onChange={(e) => handleChange('overallPurchaseNumber', parseInt(e.target.value) || 0)}
                error={!!errors.overallPurchaseNumber}
                helperText={errors.overallPurchaseNumber}
                required
                disabled={!isFormEditable}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('mto.type1.fields.baseCountPopulation')}
                value={formData.baseCountPopulationNumber}
                onChange={(e) => handleChange('baseCountPopulationNumber', parseInt(e.target.value) || 0)}
                error={!!errors.baseCountPopulationNumber}
                helperText={errors.baseCountPopulationNumber || t('mto.type1.helpers.baseCountPopulation')}
                required
                disabled={!isFormEditable}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupsIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('mto.type1.fields.totalBudget')}
                value={formatCurrency(calculatedBudget)}
                disabled
                InputProps={{
                  readOnly: true,
                }}
                helperText={t('mto.type1.helpers.totalBudget')}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('mto.type1.sections.schedule')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DateTimePicker
                label={t('mto.type1.fields.releaseTime')}
                value={formData.releaseTime}
                onChange={(value) => handleChange('releaseTime', value)}
                disabled={!isFormEditable}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.releaseTime,
                    helperText: errors.releaseTime,
                    required: true
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DateTimePicker
                label={t('mto.type1.fields.settlementTime')}
                value={formData.settlementTime}
                onChange={(value) => handleChange('settlementTime', value)}
                disabled={!isFormEditable}
                minDateTime={formData.releaseTime || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.settlementTime,
                    helperText: errors.settlementTime,
                    required: true
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('mto.type1.fields.notes')}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={!isFormEditable}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={saving}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={saving || !isFormEditable}
                >
                  {requirement ? t('common.update') : t('common.create')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default MtoType1RequirementForm;