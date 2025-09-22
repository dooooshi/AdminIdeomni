'use client';

import React, { useState, useEffect } from 'react';
import {
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
  Alert,
  CircularProgress,
  InputAdornment,
  Box,
  FormHelperText
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2CreateRequest, MtoType2Requirement } from '@/lib/types/mtoType2';
import MtoType2Service from '@/lib/services/mtoType2Service';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2RequirementFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: MtoType2Requirement | null;
  managerFormulas?: Array<{ id: number; name: string; productName?: string; }>;
}

export const MtoType2RequirementForm: React.FC<MtoType2RequirementFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
  managerFormulas = []
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingFormulas, setLoadingFormulas] = useState(!managerFormulas.length);
  const [availableFormulas, setAvailableFormulas] = useState(managerFormulas);

  const initialFormData: MtoType2CreateRequest = {
    managerProductFormulaId: editData?.managerProductFormulaId || 0,
    releaseTime: editData?.releaseTime || new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
    settlementTime: editData?.settlementTime || new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    overallPurchaseBudget: editData?.overallPurchaseBudget || 10000,
    metadata: editData?.metadata || {
      name: '',
      description: '',
      notes: ''
    }
  };

  const [formData, setFormData] = useState<MtoType2CreateRequest>(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.managerProductFormulaId || formData.managerProductFormulaId < 1) {
      newErrors.managerProductFormulaId = t('mto.type2.validation.formulaRequired');
    }

    if (!formData.overallPurchaseBudget || formData.overallPurchaseBudget < 0.01) {
      newErrors.overallPurchaseBudget = t('mto.type2.validation.budgetRequired');
    }

    if (!formData.releaseTime) {
      newErrors.releaseTime = t('mto.type2.validation.releaseTimeRequired');
    }

    if (!formData.settlementTime) {
      newErrors.settlementTime = t('mto.type2.validation.settlementTimeRequired');
    } else if (formData.releaseTime && new Date(formData.settlementTime) <= new Date(formData.releaseTime)) {
      newErrors.settlementTime = t('mto.type2.validation.settlementAfterRelease');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormulaLock = async (formulaId: number, lock: boolean = true) => {
    try {
      if (lock && !editData) {
        // Only lock formula when creating new MTO Type 2
        await MtoType2Service.lockFormula(formulaId, 0);
      } else if (!lock && editData?.status === 'CANCELLED') {
        // Unlock formula when MTO is cancelled
        await MtoType2Service.unlockFormula(formulaId);
      }
    } catch (error: any) {
      console.error('Formula lock error:', error);
    }
  };

  useEffect(() => {
    if (open && !managerFormulas.length) {
      loadManagerFormulas();
    }
  }, [open]);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...initialFormData,
        ...editData
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editData, open]);

  const loadManagerFormulas = async () => {
    try {
      setLoadingFormulas(true);
      const response = await MtoType2Service.getManagerFormulas({ limit: 100 });
      if (response?.items) {
        setAvailableFormulas(response.items);
      }
    } catch (error) {
      console.error('Failed to load formulas:', error);
      showError(t('mto.type2.errors.loadFormulasFailed'));
    } finally {
      setLoadingFormulas(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError(t('common.validation.fixErrors'));
      return;
    }

    try {
      setLoading(true);

      if (editData) {
        await MtoType2Service.updateRequirement(editData.id, formData);
        showSuccess(t('mto.type2.messages.updateSuccess'));
        onSuccess();
        handleClose();
      } else {
        await MtoType2Service.createRequirement(formData);
        showSuccess(t('mto.type2.messages.createSuccess'));
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      console.error('Failed to save requirement:', error);
      showError(error.message || t('mto.type2.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setErrors({});
      onClose();
    }
  };

  const handleFieldChange = (field: keyof MtoType2CreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when it changes
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleMetadataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        {editData ? t('mto.type2.editRequirement') : t('mto.type2.createRequirement')}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {editData?.status && editData.status !== 'DRAFT' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('mto.type2.warnings.onlyDraftEditable')}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('mto.type2.fields.requirementName')}
                value={formData.metadata?.name || ''}
                onChange={(e) => handleMetadataChange('name', e.target.value)}
                placeholder={
                  formData.managerProductFormulaId
                    ? availableFormulas.find(f => f.id === formData.managerProductFormulaId)?.productName ||
                      availableFormulas.find(f => f.id === formData.managerProductFormulaId)?.name ||
                      t('mto.type2.placeholders.requirementName')
                    : t('mto.type2.placeholders.requirementName')
                }
                helperText={
                  formData.managerProductFormulaId && !formData.metadata?.name
                    ? t('mto.type2.helpers.nameAutoFilled')
                    : ''
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required error={!!errors.managerProductFormulaId}>
                <InputLabel>{t('mto.type2.fields.productFormula')}</InputLabel>
                <Select
                  value={formData.managerProductFormulaId || ''}
                  onChange={(e) => {
                    const formulaId = Number(e.target.value);
                    handleFieldChange('managerProductFormulaId', formulaId);
                    // Auto-fill name with formula's product name if name is empty
                    const selectedFormula = availableFormulas.find(f => f.id === formulaId);
                    if (selectedFormula && !formData.metadata?.name) {
                      handleMetadataChange('name', selectedFormula.productName || selectedFormula.name || '');
                    }
                  }}
                  disabled={loadingFormulas || (editData && editData.status !== 'DRAFT')}
                >
                  {loadingFormulas ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    availableFormulas.map(formula => (
                      <MenuItem key={formula.id} value={formula.id}>
                        {formula.productName || formula.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.managerProductFormulaId && (
                  <FormHelperText>{errors.managerProductFormulaId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label={t('mto.type2.fields.overallBudget')}
                value={formData.overallPurchaseBudget}
                onChange={(e) => handleFieldChange('overallPurchaseBudget', Number(e.target.value))}
                error={!!errors.overallPurchaseBudget}
                helperText={errors.overallPurchaseBudget}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0.01, step: 100 }
                }}
                disabled={editData && editData.status !== 'DRAFT'}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('mto.type2.fields.releaseTime')}
                  value={new Date(formData.releaseTime)}
                  onChange={(date) => date && handleFieldChange('releaseTime', date.toISOString())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.releaseTime,
                      helperText: errors.releaseTime
                    }
                  }}
                  disabled={editData && editData.status !== 'DRAFT'}
                  minDateTime={editData ? undefined : new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('mto.type2.fields.settlementTime')}
                  value={new Date(formData.settlementTime)}
                  onChange={(date) => date && handleFieldChange('settlementTime', date.toISOString())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.settlementTime,
                      helperText: errors.settlementTime
                    }
                  }}
                  disabled={editData && editData.status !== 'DRAFT'}
                  minDateTime={new Date(formData.releaseTime)}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('mto.type2.fields.description')}
                value={formData.metadata?.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder={t('mto.type2.placeholders.description')}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('mto.type2.fields.notes')}
                value={formData.metadata?.notes || ''}
                onChange={(e) => handleMetadataChange('notes', e.target.value)}
                placeholder={t('mto.type2.placeholders.notes')}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingFormulas}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {editData ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};