'use client';

import React, { useState, useEffect } from 'react';
import { useMapTemplateTranslation } from '@/lib/i18n/hooks/useTranslation';
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
  Switch,
  FormControlLabel,
  Button,
  Alert,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  FormHelperText,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  RestoreFromTrash as RestoreIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Terrain as TerrainIcon,
  AttachMoney as GoldIcon,
  Nature as CarbonIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  TileFacilityBuildConfig,
  CreateTileFacilityBuildConfigDto,
  UpdateTileFacilityBuildConfigDto,
  LandType,
  FacilityType,
} from '@/components/map/types';
import TileFacilityBuildConfigService from '@/lib/services/tileFacilityBuildConfigService';

interface TileFacilityConfigFormProps {
  templateId: number;
  config?: TileFacilityBuildConfig;
  mode: 'create' | 'edit';
  onSave: (config: TileFacilityBuildConfig) => void;
  onCancel: () => void;
  onDelete?: (configId: string) => void;
  onRestore?: (configId: string) => void;
  isLoading?: boolean;
}

const TileFacilityConfigForm: React.FC<TileFacilityConfigFormProps> = ({
  templateId,
  config,
  mode,
  onSave,
  onCancel,
  onDelete,
  onRestore,
  isLoading = false,
}) => {
  const { t } = useMapTemplateTranslation();

  // Form state
  const [formData, setFormData] = useState<CreateTileFacilityBuildConfigDto>({
    landType: LandType.PLAIN,
    facilityType: FacilityType.FARM,
    requiredGold: 0,
    requiredCarbon: 0,
    requiredAreas: 1,
    maxLevel: 4,
    upgradeGoldCost: 0,
    upgradeCarbonCost: 0,
    upgradeMultiplier: 1.0,
    isAllowed: true,
    maxInstances: 100,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && config) {
      setFormData({
        landType: config.landType,
        facilityType: config.facilityType,
        requiredGold: config.requiredGold,
        requiredCarbon: config.requiredCarbon,
        requiredAreas: config.requiredAreas,
        maxLevel: config.maxLevel,
        upgradeGoldCost: config.upgradeGoldCost,
        upgradeCarbonCost: config.upgradeCarbonCost,
        upgradeMultiplier: config.upgradeMultiplier,
        isAllowed: config.isAllowed,
        maxInstances: config.maxInstances,
        upgradeData: config.upgradeData,
        buildData: config.buildData,
      });
    } else if (mode === 'create') {
      const defaults = TileFacilityBuildConfigService.getDefaultConfigurationValues(
        formData.facilityType,
        formData.landType
      );
      setFormData(prev => ({ ...prev, ...defaults }));
    }
  }, [mode, config, formData.facilityType, formData.landType]);

  const handleInputChange = (field: keyof CreateTileFacilityBuildConfigDto, value: any) => {
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

  const validateForm = (): boolean => {
    const validation = TileFacilityBuildConfigService.validateConfigurationData(formData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let savedConfig: TileFacilityBuildConfig;

      if (mode === 'create') {
        savedConfig = await TileFacilityBuildConfigService.createTileFacilityConfig(
          templateId,
          formData
        );
      } else {
        savedConfig = await TileFacilityBuildConfigService.updateTileFacilityConfig(
          templateId,
          config!.id,
          formData as UpdateTileFacilityBuildConfigDto
        );
      }

      onSave(savedConfig);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const handleDelete = async () => {
    if (!config || !onDelete) return;
    
    try {
      await TileFacilityBuildConfigService.deleteTileFacilityConfig(templateId, config.id);
      onDelete(config.id);
    } catch (error) {
      console.error('Failed to delete configuration:', error);
    }
  };

  const handleRestore = async () => {
    if (!config || !onRestore) return;
    
    try {
      await TileFacilityBuildConfigService.restoreTileFacilityConfig(templateId, config.id);
      onRestore(config.id);
    } catch (error) {
      console.error('Failed to restore configuration:', error);
    }
  };

  const getAvailableLandTypes = (): LandType[] => {
    const restrictions = TileFacilityBuildConfigService.getLandTypeRestrictions();
    return restrictions[formData.facilityType] || Object.values(LandType);
  };

  const isLandTypeAllowed = (landType: LandType): boolean => {
    return getAvailableLandTypes().includes(landType);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">
              {mode === 'create' ? t('CREATE_FACILITY_CONFIG') : t('EDIT_FACILITY_CONFIG')}
            </Typography>
            {config?.deletedAt && (
              <Chip 
                label={t('DELETED')} 
                color="error" 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        }
        action={
          <Box display="flex" gap={1}>
            {mode === 'edit' && config?.deletedAt && onRestore && (
              <Tooltip title={t('RESTORE_CONFIG')}>
                <IconButton onClick={handleRestore} color="success">
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
            {mode === 'edit' && !config?.deletedAt && onDelete && (
              <Tooltip title={t('DELETE_CONFIG')}>
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />

      <CardContent>
        <Stack spacing={4}>
          {/* Basic Configuration */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('BASIC_CONFIGURATION')}
            </Typography>
            
            <Stack spacing={3}>
              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                <FormControl fullWidth error={!!validationErrors.facilityType}>
                  <InputLabel>{t('FACILITY_TYPE')}</InputLabel>
                  <Select
                    value={formData.facilityType}
                    onChange={(e) => handleInputChange('facilityType', e.target.value)}
                    disabled={mode === 'edit'}
                    label={t('FACILITY_TYPE')}
                  >
                    {Object.values(FacilityType).map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BuildIcon />
                          {t(`FACILITY_TYPE_${type}`)}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.facilityType && (
                    <FormHelperText>{validationErrors.facilityType}</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth error={!!validationErrors.landType}>
                  <InputLabel>{t('LAND_TYPE')}</InputLabel>
                  <Select
                    value={formData.landType}
                    onChange={(e) => handleInputChange('landType', e.target.value)}
                    disabled={mode === 'edit'}
                    label={t('LAND_TYPE')}
                  >
                    {Object.values(LandType).map((type) => (
                      <MenuItem 
                        key={type} 
                        value={type}
                        disabled={!isLandTypeAllowed(type)}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <TerrainIcon />
                          {t(`LAND_TYPE_${type}`)}
                          {!isLandTypeAllowed(type) && (
                            <Chip label={t('NOT_COMPATIBLE')} size="small" color="error" variant="outlined" />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.landType && (
                    <FormHelperText>{validationErrors.landType}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAllowed}
                    onChange={(e) => handleInputChange('isAllowed', e.target.checked)}
                  />
                }
                label={t('FACILITY_ENABLED')}
              />
            </Stack>
          </Box>

          {/* Build Requirements */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('BUILD_REQUIREMENTS')}
            </Typography>
            
            <Stack spacing={3}>
              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t('GOLD_COST')}
                  type="number"
                  value={formData.requiredGold}
                  onChange={(e) => handleInputChange('requiredGold', Number(e.target.value))}
                  error={!!validationErrors.requiredGold}
                  helperText={validationErrors.requiredGold}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GoldIcon color="warning" />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0, step: 100 }}
                />

                <TextField
                  fullWidth
                  label={t('CARBON_COST')}
                  type="number"
                  value={formData.requiredCarbon}
                  onChange={(e) => handleInputChange('requiredCarbon', Number(e.target.value))}
                  error={!!validationErrors.requiredCarbon}
                  helperText={validationErrors.requiredCarbon}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CarbonIcon color="success" />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">CO₂</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 10 }}
                />
              </Box>

              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t('REQUIRED_AREAS')}
                  type="number"
                  value={formData.requiredAreas}
                  onChange={(e) => handleInputChange('requiredAreas', Number(e.target.value))}
                  error={!!validationErrors.requiredAreas}
                  helperText={validationErrors.requiredAreas}
                  inputProps={{ min: 1, max: 10 }}
                />

                <TextField
                  fullWidth
                  label={t('MAX_INSTANCES')}
                  type="number"
                  value={formData.maxInstances}
                  onChange={(e) => handleInputChange('maxInstances', Number(e.target.value))}
                  error={!!validationErrors.maxInstances}
                  helperText={validationErrors.maxInstances}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Upgrade Configuration */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('UPGRADE_CONFIGURATION')}
            </Typography>
            
            <Stack spacing={3}>
              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t('MAX_LEVEL')}
                  type="number"
                  value={formData.maxLevel}
                  onChange={(e) => handleInputChange('maxLevel', Number(e.target.value))}
                  error={!!validationErrors.maxLevel}
                  helperText={validationErrors.maxLevel}
                  inputProps={{ min: 1, max: 10 }}
                />

                <TextField
                  fullWidth
                  label={t('BASE_UPGRADE_GOLD_COST')}
                  type="number"
                  value={formData.upgradeGoldCost}
                  onChange={(e) => handleInputChange('upgradeGoldCost', Number(e.target.value))}
                  error={!!validationErrors.upgradeGoldCost}
                  helperText={validationErrors.upgradeGoldCost}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Box>

              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t('BASE_UPGRADE_CARBON_COST')}
                  type="number"
                  value={formData.upgradeCarbonCost}
                  onChange={(e) => handleInputChange('upgradeCarbonCost', Number(e.target.value))}
                  error={!!validationErrors.upgradeCarbonCost}
                  helperText={validationErrors.upgradeCarbonCost}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">CO₂</InputAdornment>,
                  }}
                />

                <TextField
                  fullWidth
                  label={t('UPGRADE_MULTIPLIER')}
                  type="number"
                  value={formData.upgradeMultiplier}
                  onChange={(e) => handleInputChange('upgradeMultiplier', Number(e.target.value))}
                  error={!!validationErrors.upgradeMultiplier}
                  helperText={validationErrors.upgradeMultiplier}
                  inputProps={{ min: 1.0, max: 3.0, step: 0.1 }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <Alert severity="error">
              <Typography variant="body2">
                {t('PLEASE_FIX_VALIDATION_ERRORS')}
              </Typography>
            </Alert>
          )}

          {/* Form Actions */}
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              startIcon={<CancelIcon />} 
              onClick={onCancel}
            >
              {t('CANCEL')}
            </Button>
            <LoadingButton
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              loading={isLoading}
              disabled={!formData.isAllowed && mode === 'create'}
            >
              {mode === 'create' ? t('CREATE_CONFIGURATION') : t('SAVE_CHANGES')}
            </LoadingButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TileFacilityConfigForm;