import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Grid
} from '@mui/material';
import {} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import InfrastructureConfigService from '@/lib/services/infrastructureConfigService';
import {
  InfrastructureConfig,
  CreateInfrastructureConfigDto,
  UpdateInfrastructureConfigDto,
  INFRASTRUCTURE_CONFIG_CONSTRAINTS,
  DEFAULT_INFRASTRUCTURE_CONFIG
} from '@/types/infrastructure';
import { alpha, useTheme } from '@mui/material/styles';

interface InfrastructureConfigFormProps {
  templateId: number;
  config?: InfrastructureConfig;
  onSave?: (config: InfrastructureConfig) => void;
  onCancel?: () => void;
  isEmbedded?: boolean;
}

const InfrastructureConfigForm: React.FC<InfrastructureConfigFormProps> = ({
  templateId,
  config,
  onSave,
  onCancel,
  isEmbedded = false
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateInfrastructureConfigDto>(DEFAULT_INFRASTRUCTURE_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (config) {
      setFormData({
        waterResourceBasePrice: parseFloat(config.waterResourceBasePrice),
        electricityResourceBasePrice: parseFloat(config.electricityResourceBasePrice),
        waterPlantIndex: parseFloat(config.waterPlantIndex),
        powerPlantIndex: parseFloat(config.powerPlantIndex),
        waterPlantBaseOperationPoints: config.waterPlantBaseOperationPoints,
        powerPlantBaseOperationPoints: config.powerPlantBaseOperationPoints,
        waterPlantUpgradeOperationPoints: config.waterPlantUpgradeOperationPoints,
        powerPlantUpgradeOperationPoints: config.powerPlantUpgradeOperationPoints,
        baseStationBaseCost: parseFloat(config.baseStationBaseCost),
        fireStationBaseCost: parseFloat(config.fireStationBaseCost),
        configData: config.configData,
        isActive: config.isActive
      });
    }
  }, [config]);

  const handleInputChange = (field: keyof CreateInfrastructureConfigDto) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' 
      ? parseFloat(event.target.value) || 0
      : event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;

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

  const validateForm = (): boolean => {
    const validationErrors = InfrastructureConfigService.validateConfig(formData);
    const fieldErrors: Record<string, string> = {};

    validationErrors.forEach(error => {
      const field = error.toLowerCase().includes('water resource') ? 'waterResourceBasePrice'
        : error.toLowerCase().includes('electricity') ? 'electricityResourceBasePrice'
        : error.toLowerCase().includes('water plant index') ? 'waterPlantIndex'
        : error.toLowerCase().includes('power plant index') ? 'powerPlantIndex'
        : error.toLowerCase().includes('water plant base') ? 'waterPlantBaseOperationPoints'
        : error.toLowerCase().includes('power plant base') ? 'powerPlantBaseOperationPoints'
        : error.toLowerCase().includes('water plant upgrade') ? 'waterPlantUpgradeOperationPoints'
        : error.toLowerCase().includes('power plant upgrade') ? 'powerPlantUpgradeOperationPoints'
        : error.toLowerCase().includes('base station') ? 'baseStationBaseCost'
        : error.toLowerCase().includes('fire station') ? 'fireStationBaseCost'
        : 'general';
      
      fieldErrors[field] = error;
    });

    setErrors(fieldErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      let savedConfig: InfrastructureConfig;
      
      if (config) {
        savedConfig = await InfrastructureConfigService.updateConfig(templateId, formData);
      } else {
        savedConfig = await InfrastructureConfigService.upsertConfig(templateId, formData);
      }

      setSuccessMessage(t('infrastructure.CONFIG_SAVED_SUCCESSFULLY'));
      
      if (onSave) {
        onSave(savedConfig);
      }
    } catch (error) {
      console.error('Failed to save infrastructure config:', error);
      setErrors({ general: t('infrastructure.FAILED_TO_SAVE_CONFIG') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_INFRASTRUCTURE_CONFIG);
    setErrors({});
    setSuccessMessage('');
  };

  const handleApplyDefaults = async () => {
    setIsLoading(true);
    try {
      const defaultConfig = await InfrastructureConfigService.applyDefaults(templateId);
      
      setFormData({
        waterResourceBasePrice: parseFloat(defaultConfig.waterResourceBasePrice),
        electricityResourceBasePrice: parseFloat(defaultConfig.electricityResourceBasePrice),
        waterPlantIndex: parseFloat(defaultConfig.waterPlantIndex),
        powerPlantIndex: parseFloat(defaultConfig.powerPlantIndex),
        waterPlantBaseOperationPoints: defaultConfig.waterPlantBaseOperationPoints,
        powerPlantBaseOperationPoints: defaultConfig.powerPlantBaseOperationPoints,
        waterPlantUpgradeOperationPoints: defaultConfig.waterPlantUpgradeOperationPoints,
        powerPlantUpgradeOperationPoints: defaultConfig.powerPlantUpgradeOperationPoints,
        baseStationBaseCost: parseFloat(defaultConfig.baseStationBaseCost),
        fireStationBaseCost: parseFloat(defaultConfig.fireStationBaseCost),
        isActive: defaultConfig.isActive
      });
      
      setSuccessMessage(t('infrastructure.DEFAULTS_APPLIED'));
      
      if (onSave) {
        onSave(defaultConfig);
      }
    } catch (error) {
      console.error('Failed to apply defaults:', error);
      setErrors({ general: t('infrastructure.FAILED_TO_APPLY_DEFAULTS') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: isEmbedded ? 'none' : '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {!isEmbedded && (
        <CardHeader
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2,
            backgroundImage: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.12)}, transparent)`
          }}
          title={
            <Typography variant="h6" fontWeight={500}>
              {config ? t('infrastructure.EDIT_INFRASTRUCTURE_CONFIG') : t('infrastructure.CREATE_INFRASTRUCTURE_CONFIG')}
            </Typography>
          }
          action={
            <Button
              size="small"
              variant="outlined"
              onClick={handleApplyDefaults}
              disabled={isLoading}
            >
              {t('infrastructure.APPLY_DEFAULTS')}
            </Button>
          }
        />
      )}
      
      <CardContent sx={{ p: 3 }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }} variant="outlined">
            {errors.general}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} variant="outlined">
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={500} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('infrastructure.WATER_RESOURCES')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.WATER_RESOURCE_BASE_PRICE')}
              type="number"
              value={formData.waterResourceBasePrice}
              onChange={handleInputChange('waterResourceBasePrice')}
              error={!!errors.waterResourceBasePrice}
              helperText={errors.waterResourceBasePrice}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.WATER_PLANT_INDEX')}
              type="number"
              value={formData.waterPlantIndex}
              onChange={handleInputChange('waterPlantIndex')}
              error={!!errors.waterPlantIndex}
              helperText={errors.waterPlantIndex}
              inputProps={{
                min: INFRASTRUCTURE_CONFIG_CONSTRAINTS.waterPlantIndex.min,
                max: INFRASTRUCTURE_CONFIG_CONSTRAINTS.waterPlantIndex.max,
                step: 0.1
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.WATER_PLANT_BASE_OPERATION_POINTS')}
              type="number"
              value={formData.waterPlantBaseOperationPoints}
              onChange={handleInputChange('waterPlantBaseOperationPoints')}
              error={!!errors.waterPlantBaseOperationPoints}
              helperText={errors.waterPlantBaseOperationPoints}
              inputProps={{
                min: INFRASTRUCTURE_CONFIG_CONSTRAINTS.waterPlantBaseOperationPoints.min
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.WATER_PLANT_UPGRADE_OPERATION_POINTS')}
              type="number"
              value={formData.waterPlantUpgradeOperationPoints}
              onChange={handleInputChange('waterPlantUpgradeOperationPoints')}
              error={!!errors.waterPlantUpgradeOperationPoints}
              helperText={errors.waterPlantUpgradeOperationPoints}
              inputProps={{
                min: INFRASTRUCTURE_CONFIG_CONSTRAINTS.waterPlantUpgradeOperationPoints.min
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight={500} color="text.secondary" sx={{ mt: 3, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('infrastructure.ELECTRICITY_RESOURCES')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.ELECTRICITY_RESOURCE_BASE_PRICE')}
              type="number"
              value={formData.electricityResourceBasePrice}
              onChange={handleInputChange('electricityResourceBasePrice')}
              error={!!errors.electricityResourceBasePrice}
              helperText={errors.electricityResourceBasePrice}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.POWER_PLANT_INDEX')}
              type="number"
              value={formData.powerPlantIndex}
              onChange={handleInputChange('powerPlantIndex')}
              error={!!errors.powerPlantIndex}
              helperText={errors.powerPlantIndex}
              inputProps={{
                min: INFRASTRUCTURE_CONFIG_CONSTRAINTS.powerPlantIndex.min,
                max: INFRASTRUCTURE_CONFIG_CONSTRAINTS.powerPlantIndex.max,
                step: 0.1
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.POWER_PLANT_BASE_OPERATION_POINTS')}
              type="number"
              value={formData.powerPlantBaseOperationPoints}
              onChange={handleInputChange('powerPlantBaseOperationPoints')}
              error={!!errors.powerPlantBaseOperationPoints}
              helperText={errors.powerPlantBaseOperationPoints}
              inputProps={{
                min: INFRASTRUCTURE_CONFIG_CONSTRAINTS.powerPlantBaseOperationPoints.min
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.POWER_PLANT_UPGRADE_OPERATION_POINTS')}
              type="number"
              value={formData.powerPlantUpgradeOperationPoints}
              onChange={handleInputChange('powerPlantUpgradeOperationPoints')}
              error={!!errors.powerPlantUpgradeOperationPoints}
              helperText={errors.powerPlantUpgradeOperationPoints}
              inputProps={{
                min: INFRASTRUCTURE_CONFIG_CONSTRAINTS.powerPlantUpgradeOperationPoints.min
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight={500} color="text.secondary" sx={{ mt: 3, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('infrastructure.BASE_STATIONS_AND_SERVICES')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.BASE_STATION_BASE_COST')}
              type="number"
              value={formData.baseStationBaseCost}
              onChange={handleInputChange('baseStationBaseCost')}
              error={!!errors.baseStationBaseCost}
              helperText={errors.baseStationBaseCost}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('infrastructure.FIRE_STATION_BASE_COST')}
              type="number"
              value={formData.fireStationBaseCost}
              onChange={handleInputChange('fireStationBaseCost')}
              error={!!errors.fireStationBaseCost}
              helperText={errors.fireStationBaseCost}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="text"
                  onClick={handleReset}
                  disabled={isLoading}
                  size="small"
                >
                  {t('infrastructure.RESET')}
                </Button>
                <Box display="flex" gap={1}>
                  {onCancel && (
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      disabled={isLoading}
                      size="small"
                    >
                      {t('infrastructure.CANCEL')}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    size="small"
                  >
                    {isLoading ? <CircularProgress size={16} /> : t('infrastructure.SAVE')}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InfrastructureConfigForm;