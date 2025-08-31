'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  Stack,
  Grid,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Storage as StorageIcon,
  Block as BlockIcon,
  Factory as FactoryIcon,
  Agriculture as AgricultureIcon,
  PowerSettingsNew as PowerIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  CategorySpaceConfigDto,
  canHaveStorage,
} from '@/types/facilitySpace';
import { FacilityCategory } from '@/types/facilities';
import FacilitySpaceConfigService from '@/lib/services/facilitySpaceConfigService';

interface CategorySpaceSettingsProps {
  templateId: number;
  onClose: () => void;
  onSave: () => void;
}

const CategorySpaceSettings: React.FC<CategorySpaceSettingsProps> = ({
  templateId,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory>(
    FacilityCategory.RAW_MATERIAL_PRODUCTION
  );
  const [formData, setFormData] = useState<Omit<CategorySpaceConfigDto, 'category'>>({
    initialSpace: 500,
    spacePerLevel: 250,
    maxSpace: 2500,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get category icon
  const getCategoryIcon = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return <AgricultureIcon />;
      case FacilityCategory.FUNCTIONAL:
        return <FactoryIcon />;
      case FacilityCategory.INFRASTRUCTURE:
        return <PowerIcon />;
      case FacilityCategory.OTHER:
        return <SchoolIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  // Get category color
  const getCategoryColor = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return 'success';
      case FacilityCategory.FUNCTIONAL:
        return 'primary';
      case FacilityCategory.INFRASTRUCTURE:
        return 'warning';
      case FacilityCategory.OTHER:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Handle category change
  const handleCategoryChange = (category: FacilityCategory) => {
    setSelectedCategory(category);
    
    // Reset form data if switching to non-storage category
    if (!canHaveStorage(category)) {
      setFormData({
        initialSpace: 0,
        spacePerLevel: 0,
        maxSpace: 0,
      });
    } else {
      // Set default values for storage categories
      setFormData({
        initialSpace: 500,
        spacePerLevel: 250,
        maxSpace: 2500,
      });
    }
    
    setValidationErrors({});
  };

  // Handle input change
  const handleInputChange = (field: keyof Omit<CategorySpaceConfigDto, 'category'>, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (canHaveStorage(selectedCategory)) {
      if (formData.initialSpace < 0) {
        errors.initialSpace = t('facilitySpace.ERROR_NEGATIVE_VALUE');
      }
      if (formData.spacePerLevel < 0) {
        errors.spacePerLevel = t('facilitySpace.ERROR_NEGATIVE_VALUE');
      }
      if (formData.maxSpace < 0) {
        errors.maxSpace = t('facilitySpace.ERROR_NEGATIVE_VALUE');
      }
      if (formData.initialSpace > formData.maxSpace) {
        errors.maxSpace = t('facilitySpace.ERROR_MAX_LESS_THAN_INITIAL');
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await FacilitySpaceConfigService.updateCategorySpaceConfigs(templateId, {
        category: selectedCategory,
        ...formData,
      });
      onSave();
    } catch (error) {
      console.error('Failed to update category space configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStorageCategory = canHaveStorage(selectedCategory);
  const facilityTypes = FacilitySpaceConfigService.getFacilityTypesByCategory(selectedCategory);

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <CategoryIcon />
            {t('facilitySpace.CATEGORY_SPACE_SETTINGS')}
          </Box>
        }
        subheader={t('facilitySpace.CATEGORY_SETTINGS_DESCRIPTION')}
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Category Selection */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                {t('facilitySpace.SELECT_CATEGORY')}
              </FormLabel>
              <RadioGroup
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value as FacilityCategory)}
              >
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {Object.values(FacilityCategory).map((category) => (
                    <Grid item xs={12} sm={6} key={category}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedCategory === category ? 2 : 1,
                          borderColor: selectedCategory === category ? 'primary.main' : 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => handleCategoryChange(category)}
                      >
                        <FormControlLabel
                          value={category}
                          control={<Radio />}
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              {getCategoryIcon(category)}
                              <Box>
                                <Typography variant="subtitle2">
                                  {t(`facilitySpace.CATEGORY_${category}`)}
                                </Typography>
                                <Chip
                                  size="small"
                                  icon={canHaveStorage(category) ? <StorageIcon /> : <BlockIcon />}
                                  label={
                                    canHaveStorage(category)
                                      ? t('facilitySpace.HAS_STORAGE')
                                      : t('facilitySpace.NO_STORAGE')
                                  }
                                  color={getCategoryColor(category)}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Category Info */}
          <Grid item xs={12}>
            <Alert 
              severity={isStorageCategory ? 'success' : 'info'}
              icon={isStorageCategory ? <StorageIcon /> : <BlockIcon />}
            >
              <Typography variant="subtitle2">
                {t('facilitySpace.AFFECTED_FACILITIES')}:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {facilityTypes.map((type) => (
                  <Chip
                    key={type}
                    label={t(`facilityManagement:FACILITY_TYPE_${type}`)}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Alert>
          </Grid>

          {/* Space Configuration */}
          {isStorageCategory && (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('facilitySpace.INITIAL_SPACE')}
                  value={formData.initialSpace}
                  onChange={(e) => handleInputChange('initialSpace', parseFloat(e.target.value) || 0)}
                  error={!!validationErrors.initialSpace}
                  helperText={validationErrors.initialSpace || t('facilitySpace.INITIAL_SPACE_HELPER')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('facilitySpace.CARBON_UNITS')}</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('facilitySpace.SPACE_PER_LEVEL')}
                  value={formData.spacePerLevel}
                  onChange={(e) => handleInputChange('spacePerLevel', parseFloat(e.target.value) || 0)}
                  error={!!validationErrors.spacePerLevel}
                  helperText={validationErrors.spacePerLevel || t('facilitySpace.SPACE_PER_LEVEL_HELPER')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('facilitySpace.CARBON_UNITS')}</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('facilitySpace.MAX_SPACE')}
                  value={formData.maxSpace}
                  onChange={(e) => handleInputChange('maxSpace', parseFloat(e.target.value) || 0)}
                  error={!!validationErrors.maxSpace}
                  helperText={validationErrors.maxSpace || t('facilitySpace.MAX_SPACE_HELPER')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('facilitySpace.CARBON_UNITS')}</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Preview */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('facilitySpace.PREVIEW')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('facilitySpace.CATEGORY_PREVIEW_TEXT', {
                      count: facilityTypes.length,
                      initialSpace: formData.initialSpace,
                      maxSpace: formData.maxSpace,
                    })}
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}

          {!isStorageCategory && (
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="subtitle2">
                  {t('facilitySpace.NO_STORAGE_CATEGORY_INFO')}
                </Typography>
                <Typography variant="body2">
                  {t('facilitySpace.NO_STORAGE_CATEGORY_DESCRIPTION')}
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Actions */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onClose}
                disabled={isLoading}
              >
                {t('common.CANCEL')}
              </Button>
              <LoadingButton
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                loading={isLoading}
                loadingPosition="start"
              >
                {t('facilitySpace.APPLY_TO_CATEGORY')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CategorySpaceSettings;