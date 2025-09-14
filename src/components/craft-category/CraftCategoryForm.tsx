'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
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
  SelectChangeEvent,
  MenuItem,
  Typography,
  Box,
  Alert,
  InputAdornment,
  Divider,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Water as WaterIcon,
  ElectricBolt as PowerIcon,
  AttachMoney as GoldIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import CraftCategoryService from '@/lib/services/craftCategoryService';
import {
  CraftCategory,
  CraftCategoryType,
  TechnologyLevel,
  CreateCraftCategoryRequest,
  UpdateCraftCategoryRequest,
  CRAFT_CATEGORY_CONSTRAINTS
} from '@/types/craftCategory';

interface CraftCategoryFormProps {
  open: boolean;
  category?: CraftCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CraftCategoryForm: React.FC<CraftCategoryFormProps> = ({
  open,
  category,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const isEditMode = !!category;

  // Form state
  const [formData, setFormData] = useState<CreateCraftCategoryRequest>({
    categoryType: CraftCategoryType.MECHANICAL_MANUFACTURING,
    technologyLevel: TechnologyLevel.LEVEL_1,
    nameEn: '',
    nameZh: '',
    fixedWaterCost: 0,
    fixedPowerCost: 0,
    fixedGoldCost: 0,
    variableWaterPercent: 0,
    variablePowerPercent: 0,
    variableGoldPercent: 0,
    yieldPercentage: 50
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        categoryType: category.categoryType,
        technologyLevel: category.technologyLevel,
        nameEn: category.nameEn,
        nameZh: category.nameZh,
        fixedWaterCost: category.fixedWaterCost,
        fixedPowerCost: category.fixedPowerCost,
        fixedGoldCost: category.fixedGoldCost,
        variableWaterPercent: category.variableWaterPercent,
        variablePowerPercent: category.variablePowerPercent,
        variableGoldPercent: category.variableGoldPercent,
        yieldPercentage: category.yieldPercentage
      });
    } else {
      // Reset form for create mode
      setFormData({
        categoryType: CraftCategoryType.MECHANICAL_MANUFACTURING,
        technologyLevel: TechnologyLevel.LEVEL_1,
        nameEn: '',
        nameZh: '',
        fixedWaterCost: 0,
        fixedPowerCost: 0,
        fixedGoldCost: 0,
        variableWaterPercent: 0,
        variablePowerPercent: 0,
        variableGoldPercent: 0,
        yieldPercentage: 50
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [category]);

  // Update names when category type or level changes
  useEffect(() => {
    if (!isEditMode) {
      const categoryNameEn = t(`craftCategory.type.${formData.categoryType}`);
      const categoryNameZh = t(`craftCategory.type.${formData.categoryType}`, { lng: 'zh' });
      const levelNameEn = t(`craftCategory.level.${formData.technologyLevel}`);
      const levelNameZh = t(`craftCategory.level.${formData.technologyLevel}`, { lng: 'zh' });
      
      setFormData(prev => ({
        ...prev,
        nameEn: `${categoryNameEn} - ${levelNameEn}`,
        nameZh: `${categoryNameZh} - ${levelNameZh}`
      }));
    }
  }, [formData.categoryType, formData.technologyLevel, isEditMode, t]);

  // Handle input changes
  const handleChange = (field: keyof CreateCraftCategoryRequest) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field.includes('Cost') || field.includes('Percent') || field === 'yieldPercentage'
        ? parseFloat(value as string) || 0
        : value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (field: keyof CreateCraftCategoryRequest) => (
    event: SelectChangeEvent
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.nameEn) {
      newErrors.nameEn = t('craftCategory.NAME_EN_REQUIRED');
    }
    if (!formData.nameZh) {
      newErrors.nameZh = t('craftCategory.NAME_ZH_REQUIRED');
    }

    // Validate yield percentage
    if (formData.yieldPercentage < CRAFT_CATEGORY_CONSTRAINTS.yieldPercentage.min || 
        formData.yieldPercentage > CRAFT_CATEGORY_CONSTRAINTS.yieldPercentage.max) {
      newErrors.yieldPercentage = t('craftCategory.YIELD_RANGE_ERROR', {
        min: CRAFT_CATEGORY_CONSTRAINTS.yieldPercentage.min,
        max: CRAFT_CATEGORY_CONSTRAINTS.yieldPercentage.max
      });
    }

    // Validate variable percentages
    const percentFields = ['variableWaterPercent', 'variablePowerPercent', 'variableGoldPercent'];
    percentFields.forEach(field => {
      const value = (formData as any)[field];
      if (value < CRAFT_CATEGORY_CONSTRAINTS.percentages.min || 
          value > CRAFT_CATEGORY_CONSTRAINTS.percentages.max) {
        newErrors[field] = t('craftCategory.PERCENTAGE_RANGE_ERROR', {
          min: CRAFT_CATEGORY_CONSTRAINTS.percentages.min,
          max: CRAFT_CATEGORY_CONSTRAINTS.percentages.max
        });
      }
    });

    // Validate cost values
    const costFields = ['fixedWaterCost', 'fixedPowerCost', 'fixedGoldCost'];
    costFields.forEach(field => {
      const value = (formData as any)[field];
      if (value < CRAFT_CATEGORY_CONSTRAINTS.costs.min) {
        newErrors[field] = t('craftCategory.COST_MIN_ERROR');
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      if (isEditMode && category) {
        const updateData: UpdateCraftCategoryRequest = {
          nameEn: formData.nameEn,
          nameZh: formData.nameZh,
          fixedWaterCost: formData.fixedWaterCost,
          fixedPowerCost: formData.fixedPowerCost,
          fixedGoldCost: formData.fixedGoldCost,
          variableWaterPercent: formData.variableWaterPercent,
          variablePowerPercent: formData.variablePowerPercent,
          variableGoldPercent: formData.variableGoldPercent,
          yieldPercentage: formData.yieldPercentage
        };
        await CraftCategoryService.updateCraftCategory(category.id, updateData);
      } else {
        await CraftCategoryService.createCraftCategory(formData);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || t('craftCategory.SAVE_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  // Calculate total costs for display
  const totalFixedCost = formData.fixedWaterCost + formData.fixedPowerCost + formData.fixedGoldCost;
  const totalVariablePercent = formData.variableWaterPercent + formData.variablePowerPercent + formData.variableGoldPercent;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode ? t('craftCategory.EDIT_CRAFT_CATEGORY') : t('craftCategory.CREATE_CRAFT_CATEGORY')}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Category Type and Level */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('craftCategory.BASIC_INFORMATION')}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth disabled={isEditMode}>
                <InputLabel>{t('craftCategory.CATEGORY_TYPE')}</InputLabel>
                <Select
                  value={formData.categoryType}
                  onChange={handleSelectChange('categoryType')}
                  label={t('craftCategory.CATEGORY_TYPE')}
                >
                  {Object.values(CraftCategoryType).map(type => (
                    <MenuItem key={type} value={type}>
                      {t(`craftCategory.type.${type}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth disabled={isEditMode}>
                <InputLabel>{t('craftCategory.TECHNOLOGY_LEVEL')}</InputLabel>
                <Select
                  value={formData.technologyLevel}
                  onChange={handleSelectChange('technologyLevel')}
                  label={t('craftCategory.TECHNOLOGY_LEVEL')}
                >
                  {Object.values(TechnologyLevel).map(level => (
                    <MenuItem key={level} value={level}>
                      {t(`craftCategory.level.${level}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Names */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('craftCategory.NAME_EN')}
                value={formData.nameEn}
                onChange={handleChange('nameEn')}
                error={!!errors.nameEn}
                helperText={errors.nameEn}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('craftCategory.NAME_ZH')}
                value={formData.nameZh}
                onChange={handleChange('nameZh')}
                error={!!errors.nameZh}
                helperText={errors.nameZh}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Fixed Costs */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
                  {t('craftCategory.FIXED_COSTS')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('craftCategory.FIXED_COSTS_DESCRIPTION')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WaterIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('craftCategory.WATER_COST')}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.fixedWaterCost}
                        onChange={handleChange('fixedWaterCost')}
                        error={!!errors.fixedWaterCost}
                        helperText={errors.fixedWaterCost}
                        variant="standard"
                        InputProps={{
                          inputProps: { min: 0, step: 1 }
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PowerIcon color="warning" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('craftCategory.POWER_COST')}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.fixedPowerCost}
                        onChange={handleChange('fixedPowerCost')}
                        error={!!errors.fixedPowerCost}
                        helperText={errors.fixedPowerCost}
                        variant="standard"
                        InputProps={{
                          inputProps: { min: 0, step: 1 }
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GoldIcon color="secondary" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('craftCategory.GOLD_COST')}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.fixedGoldCost}
                        onChange={handleChange('fixedGoldCost')}
                        error={!!errors.fixedGoldCost}
                        helperText={errors.fixedGoldCost}
                        variant="standard"
                        InputProps={{
                          inputProps: { min: 0, step: 1 }
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false} sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {t('craftCategory.TOTAL_FIXED_COST')}: <strong>{totalFixedCost}</strong> units
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Variable Costs */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: 'secondary.main', borderRadius: 1 }} />
                  {t('craftCategory.VARIABLE_COSTS')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('craftCategory.VARIABLE_COSTS_DESCRIPTION')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WaterIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('craftCategory.WATER_PERCENT')}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.variableWaterPercent}
                        onChange={handleChange('variableWaterPercent')}
                        error={!!errors.variableWaterPercent}
                        helperText={errors.variableWaterPercent}
                        variant="standard"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="caption">%</Typography>
                            </InputAdornment>
                          ),
                          inputProps: { min: 0, max: 100, step: 0.1 }
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PowerIcon color="warning" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('craftCategory.POWER_PERCENT')}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.variablePowerPercent}
                        onChange={handleChange('variablePowerPercent')}
                        error={!!errors.variablePowerPercent}
                        helperText={errors.variablePowerPercent}
                        variant="standard"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="caption">%</Typography>
                            </InputAdornment>
                          ),
                          inputProps: { min: 0, max: 100, step: 0.1 }
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GoldIcon color="secondary" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('craftCategory.GOLD_PERCENT')}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.variableGoldPercent}
                        onChange={handleChange('variableGoldPercent')}
                        error={!!errors.variableGoldPercent}
                        helperText={errors.variableGoldPercent}
                        variant="standard"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="caption">%</Typography>
                            </InputAdornment>
                          ),
                          inputProps: { min: 0, max: 100, step: 0.1 }
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false} sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {t('craftCategory.TOTAL_VARIABLE_PERCENT')}: <strong>{totalVariablePercent.toFixed(1)}%</strong>
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Yield Percentage */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: 'success.main', borderRadius: 1 }} />
                  {t('craftCategory.PRODUCTION_EFFICIENCY')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('craftCategory.YIELD_HELP_TEXT')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PercentIcon color="success" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('craftCategory.YIELD_PERCENTAGE')}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={formData.yieldPercentage}
                        onChange={handleChange('yieldPercentage')}
                        error={!!errors.yieldPercentage}
                        helperText={errors.yieldPercentage}
                        variant="standard"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="caption">%</Typography>
                            </InputAdornment>
                          ),
                          inputProps: { 
                            min: CRAFT_CATEGORY_CONSTRAINTS.yieldPercentage.min, 
                            max: CRAFT_CATEGORY_CONSTRAINTS.yieldPercentage.max, 
                            step: 1 
                          }
                        }}
                      />
                      
                      {/* Yield quality indicator */}
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('craftCategory.EFFICIENCY_LEVEL')}:
                        </Typography>
                        <Chip
                          label={
                            formData.yieldPercentage >= 95 ? t('craftCategory.EXCELLENT') :
                            formData.yieldPercentage >= 85 ? t('craftCategory.GOOD') :
                            formData.yieldPercentage >= 75 ? t('craftCategory.AVERAGE') :
                            t('craftCategory.POOR')
                          }
                          color={
                            formData.yieldPercentage >= 95 ? 'success' :
                            formData.yieldPercentage >= 85 ? 'primary' :
                            formData.yieldPercentage >= 75 ? 'warning' :
                            'error'
                          }
                          size="small"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          {t('common.CANCEL')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? t('common.SAVING') : t('common.SAVE')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CraftCategoryForm;