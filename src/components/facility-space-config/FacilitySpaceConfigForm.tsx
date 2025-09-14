'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  FormHelperText,
  Stack,
  Slider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Storage as StorageIcon,
  Block as BlockIcon,
  Calculate as CalculateIcon,
  RestartAlt as ResetIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  FacilitySpaceConfig,
  CreateFacilitySpaceConfigDto,
  UpdateFacilitySpaceConfigDto,
  SpaceCalculationResult,
  DEFAULT_SPACE_CONFIGS,
  getFacilityCategory,
  canHaveStorage,
} from '@/types/facilitySpace';
import { FacilityType, FacilityCategory } from '@/types/facilities';
import FacilitySpaceConfigService from '@/lib/services/facilitySpaceConfigService';

interface FacilitySpaceConfigFormProps {
  templateId: number;
  config?: FacilitySpaceConfig;
  mode: 'create' | 'edit';
  onSave: (config: FacilitySpaceConfig) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const FacilitySpaceConfigForm: React.FC<FacilitySpaceConfigFormProps> = ({
  templateId,
  config,
  mode,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<CreateFacilitySpaceConfigDto>({
    facilityType: FacilityType.WAREHOUSE,
    initialSpace: 1000,
    spacePerLevel: 500,
    maxSpace: 5000,
    isStorageFacility: true,
    description: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [previewLevel, setPreviewLevel] = useState(3);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && config) {
      setFormData({
        facilityType: config.facilityType,
        initialSpace: config.initialSpace,
        spacePerLevel: config.spacePerLevel,
        maxSpace: config.maxSpace,
        isStorageFacility: config.isStorageFacility,
        description: config.description || '',
      });
    } else if (mode === 'create') {
      // Load default values for the selected facility type
      const defaultConfig = FacilitySpaceConfigService.getDefaultConfig(formData.facilityType);
      setFormData(defaultConfig);
    }
  }, [mode, config, formData.facilityType]);

  // Handle facility type change
  const handleFacilityTypeChange = (facilityType: FacilityType) => {
    const category = getFacilityCategory(facilityType);
    const isStorage = canHaveStorage(category);
    const defaultConfig = FacilitySpaceConfigService.getDefaultConfig(facilityType);
    
    setFormData({
      ...defaultConfig,
      description: formData.description,
    });
    
    // Clear validation errors
    setValidationErrors({});
  };

  // Handle input change
  const handleInputChange = (field: keyof CreateFacilitySpaceConfigDto, value: any) => {
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
    const validation = FacilitySpaceConfigService.validateSpaceConfig(formData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let savedConfig: FacilitySpaceConfig;

      if (mode === 'create') {
        savedConfig = await FacilitySpaceConfigService.createFacilitySpaceConfig(
          templateId,
          formData
        );
      } else {
        savedConfig = await FacilitySpaceConfigService.updateFacilitySpaceConfig(
          config!.id,
          formData as UpdateFacilitySpaceConfigDto
        );
      }

      onSave(savedConfig);
    } catch (error) {
      console.error('Failed to save facility space config:', error);
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    const defaultConfig = FacilitySpaceConfigService.getDefaultConfig(formData.facilityType);
    setFormData({
      ...defaultConfig,
      description: formData.description,
    });
  };

  // Calculate space preview
  const calculateSpacePreview = (): SpaceCalculationResult[] => {
    const results = [];
    for (let level = 1; level <= 5; level++) {
      const calc = FacilitySpaceConfigService.calculateSpace(
        {
          ...config,
          ...formData,
        } as FacilitySpaceConfig,
        level
      );
      results.push(calc);
    }
    return results;
  };

  const category = getFacilityCategory(formData.facilityType);
  const isStorageCategory = canHaveStorage(category);

  return (
    <Card>
      <CardHeader
        title={mode === 'create' ? t('facilitySpace.CREATE_CONFIG') : t('facilitySpace.EDIT_CONFIG')}
        subheader={t('facilitySpace.CONFIG_FORM_DESCRIPTION')}
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Left Column - Form Fields */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Facility Type Selection/Display */}
              {mode === 'create' ? (
                <FormControl fullWidth>
                  <InputLabel>{t('facilitySpace.FACILITY_TYPE')}</InputLabel>
                  <Select
                    value={formData.facilityType}
                    onChange={(e) => handleFacilityTypeChange(e.target.value as FacilityType)}
                    label={t('facilitySpace.FACILITY_TYPE')}
                    renderValue={(value) => t(`facilityManagement:FACILITY_TYPE_${value}`)}
                  >
                    {Object.values(FacilityType).map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                          <Typography>{t(`facilityManagement:FACILITY_TYPE_${type}`)}</Typography>
                          <Chip
                            size="small"
                            label={t(`facilitySpace.CATEGORY_${getFacilityCategory(type)}`)}
                            color={canHaveStorage(getFacilityCategory(type)) ? 'success' : 'default'}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {t('facilitySpace.FACILITY_TYPE_HELPER')}
                  </FormHelperText>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label={t('facilitySpace.FACILITY_TYPE')}
                  value={t(`facilityManagement:FACILITY_TYPE_${formData.facilityType}`)}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              )}

              {/* Category Info */}
              <Alert 
                severity={isStorageCategory ? 'success' : 'info'}
                icon={isStorageCategory ? <StorageIcon /> : <BlockIcon />}
              >
                <Typography variant="subtitle2">
                  {t(`facilitySpace.CATEGORY_${category}`)}
                </Typography>
                <Typography variant="body2">
                  {isStorageCategory 
                    ? t('facilitySpace.STORAGE_FACILITY_INFO')
                    : t('facilitySpace.NON_STORAGE_FACILITY_INFO')
                  }
                </Typography>
              </Alert>

              {/* Space Configuration Fields */}
              {isStorageCategory && (
                <>
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
                </>
              )}

              {/* Description */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('facilitySpace.DESCRIPTION')}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                helperText={t('facilitySpace.DESCRIPTION_HELPER')}
              />

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <LoadingButton
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  loading={isLoading}
                  loadingPosition="start"
                >
                  {t('common.SAVE')}
                </LoadingButton>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {t('common.CANCEL')}
                </Button>
                {isStorageCategory && (
                  <Button
                    variant="outlined"
                    startIcon={<ResetIcon />}
                    onClick={handleResetToDefaults}
                    disabled={isLoading}
                  >
                    {t('facilitySpace.RESET_TO_DEFAULTS')}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column - Space Preview */}
          <Grid item xs={12} md={6}>
            {isStorageCategory && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('facilitySpace.SPACE_CALCULATION_PREVIEW')}
                </Typography>
                
                {/* Level Selector */}
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>
                    {t('facilitySpace.PREVIEW_LEVEL')}: {previewLevel}
                  </Typography>
                  <Slider
                    value={previewLevel}
                    onChange={(e, value) => setPreviewLevel(value as number)}
                    min={1}
                    max={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* Calculation Table */}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('facilitySpace.LEVEL')}</TableCell>
                        <TableCell align="right">{t('facilitySpace.BASE_SPACE')}</TableCell>
                        <TableCell align="right">{t('facilitySpace.ADDITIONAL')}</TableCell>
                        <TableCell align="right">{t('facilitySpace.TOTAL')}</TableCell>
                        <TableCell align="right">{t('facilitySpace.EFFECTIVE')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calculateSpacePreview().map((calc) => (
                        <TableRow 
                          key={calc.level}
                          selected={calc.level === previewLevel}
                        >
                          <TableCell>{calc.level}</TableCell>
                          <TableCell align="right">{Number(calc.baseSpace).toFixed(2)}</TableCell>
                          <TableCell align="right">{Number(calc.additionalSpace).toFixed(2)}</TableCell>
                          <TableCell align="right">{Number(calc.totalSpace).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={Number(calc.effectiveSpace).toFixed(2)}
                              size="small"
                              color={Number(calc.totalSpace) > Number(calc.maxSpace) ? 'warning' : 'success'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Formula Display */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('facilitySpace.FORMULA')}:
                  </Typography>
                  <Typography variant="body2" component="code">
                    {t('facilitySpace.SPACE_FORMULA', {
                      initialSpace: formData.initialSpace,
                      spacePerLevel: formData.spacePerLevel,
                      level: previewLevel,
                    })}
                  </Typography>
                </Box>
              </Paper>
            )}

            {!isStorageCategory && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  {t('facilitySpace.NO_STORAGE_EXPLANATION_TITLE')}
                </Typography>
                <Typography variant="body2">
                  {t('facilitySpace.NO_STORAGE_EXPLANATION')}
                </Typography>
              </Alert>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FacilitySpaceConfigForm;