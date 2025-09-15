/**
 * TemplateGenerationForm Component - Procedural map template generation
 * 
 * Features:
 * - Interactive parameter configuration
 * - Real-time tile count estimation
 * - Land distribution visualization
 * - Custom economic configuration
 * - Validation and error handling
 * - Preview generation settings
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert,
  Slider,
  Switch,
  FormControlLabel,
  InputAdornment,
  Stack,
  Chip,
  Divider,
  Collapse,
  IconButton,
  Paper,
} from '@mui/material';
import {
  AutoFixHigh as AutoFixHighIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Preview as PreviewIcon,
  Casino as CasinoIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
  Info as InfoIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { GenerateMapTemplateDto } from '../types';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface TemplateGenerationFormProps {
  onGenerate: (data: GenerateMapTemplateDto) => void;
  isLoading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const TemplateGenerationForm: React.FC<TemplateGenerationFormProps> = ({
  onGenerate,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<GenerateMapTemplateDto>({
    name: '',
    description: '',
    width: 15,
    height: 7,
    marinePercentage: 35,
    coastalPercentage: 35,
    plainPercentage: 30,
    randomSeed: Math.floor(Math.random() * 10000),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomPricing, setShowCustomPricing] = useState(false);
  const [estimatedTileCount, setEstimatedTileCount] = useState(0);
  
  // Additional form state not part of DTO
  const [customPricing, setCustomPricing] = useState<Record<string, number> | undefined>();
  const [customPopulation, setCustomPopulation] = useState<Record<string, number> | undefined>();
  const [customTransportation, setCustomTransportation] = useState<Record<string, number> | undefined>();

  // Update tile count estimation when dimensions change
  useEffect(() => {
    const count = MapTemplateService.calculateEstimatedTileCount(formData.width, formData.height);
    setEstimatedTileCount(count);
  }, [formData.width, formData.height]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof GenerateMapTemplateDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle land type percentage changes with auto-adjustment
  const handlePercentageChange = useCallback((field: 'marinePercentage' | 'coastalPercentage' | 'plainPercentage', value: number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-adjust other percentages to maintain 100% total
      const otherFields = ['marinePercentage', 'coastalPercentage', 'plainPercentage'].filter(f => f !== field) as Array<'marinePercentage' | 'coastalPercentage' | 'plainPercentage'>;
      const remaining = 100 - value;
      const currentOthersTotal = otherFields.reduce((sum, f) => sum + newData[f], 0);
      
      if (currentOthersTotal > 0) {
        // Proportionally adjust other fields
        otherFields.forEach(f => {
          newData[f] = Math.round((newData[f] / currentOthersTotal) * remaining);
        });
        
        // Handle rounding errors
        const newTotal = newData.marinePercentage + newData.coastalPercentage + newData.plainPercentage;
        if (newTotal !== 100) {
          const diff = 100 - newTotal;
          newData[otherFields[0]] += diff;
        }
      }
      
      return newData;
    });
  }, []);

  // Handle custom pricing toggle
  const handleCustomPricingToggle = useCallback((enabled: boolean) => {
    setShowCustomPricing(enabled);
    if (enabled) {
      setCustomPricing({
        MARINE: MapTemplateService.getDefaultConfiguration('MARINE').initialGoldPrice,
        COASTAL: MapTemplateService.getDefaultConfiguration('COASTAL').initialGoldPrice,
        PLAIN: MapTemplateService.getDefaultConfiguration('PLAIN').initialGoldPrice,
      });
      setCustomPopulation({
        MARINE: MapTemplateService.getDefaultConfiguration('MARINE').initialPopulation,
        COASTAL: MapTemplateService.getDefaultConfiguration('COASTAL').initialPopulation,
        PLAIN: MapTemplateService.getDefaultConfiguration('PLAIN').initialPopulation,
      });
      setCustomTransportation({
        MARINE: MapTemplateService.getDefaultConfiguration('MARINE').transportationCostUnit,
        COASTAL: MapTemplateService.getDefaultConfiguration('COASTAL').transportationCostUnit,
        PLAIN: MapTemplateService.getDefaultConfiguration('PLAIN').transportationCostUnit,
      });
    } else {
      setCustomPricing(undefined);
      setCustomPopulation(undefined);
      setCustomTransportation(undefined);
    }
  }, []);

  // Generate random seed
  const generateRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 10000);
    handleFieldChange('randomSeed', newSeed);
  }, [handleFieldChange]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const validationErrors = MapTemplateService.validateGenerationParameters(formData);
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('map.VALIDATION_TEMPLATE_NAME_REQUIRED');
    } else if (formData.name.length < 3) {
      newErrors.name = t('map.VALIDATION_TEMPLATE_NAME_TOO_SHORT');
    } else if (formData.name.length > 100) {
      newErrors.name = t('map.VALIDATION_TEMPLATE_NAME_TOO_LONG');
    }

    validationErrors.forEach(error => {
      newErrors.general = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onGenerate(formData);
    } catch (error) {
      console.error('Failed to generate template:', error);
    }
  }, [formData, onGenerate, validateForm]);

  // Get land type color
  const getLandTypeColor = (landType: string) => {
    const colors = {
      MARINE: theme.palette.info.main,
      COASTAL: theme.palette.warning.main,
      PLAIN: theme.palette.success.main,
    };
    return colors[landType] || theme.palette.grey[500];
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <AutoFixHighIcon />
            <Typography variant="h6">
              {t('map.GENERATE_MAP_TEMPLATE')}
            </Typography>
          </Box>
        }
        subheader={t('map.GENERATE_TEMPLATE_DESCRIPTION')}
      />
      
      <CardContent>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Typography variant="subtitle2" color="text.secondary">
            {t('map.BASIC_INFORMATION')}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label={t('map.TEMPLATE_NAME')}
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                disabled={isLoading}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('map.RANDOM_SEED')}
                type="number"
                value={formData.randomSeed || ''}
                onChange={(e) => handleFieldChange('randomSeed', parseInt(e.target.value))}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={generateRandomSeed} edge="end">
                        <CasinoIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('map.DESCRIPTION')}
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                disabled={isLoading}
                placeholder={t('map.TEMPLATE_DESCRIPTION_PLACEHOLDER')}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Map Dimensions */}
          <Typography variant="subtitle2" color="text.secondary">
            {t('map.MAP_DIMENSIONS')}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography gutterBottom>
                {t('map.WIDTH')}: {formData.width}
              </Typography>
              <Slider
                value={formData.width}
                onChange={(_, value) => handleFieldChange('width', value)}
                min={5}
                max={20}
                marks
                step={1}
                disabled={isLoading}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography gutterBottom>
                {t('map.HEIGHT')}: {formData.height}
              </Typography>
              <Slider
                value={formData.height}
                onChange={(_, value) => handleFieldChange('height', value)}
                min={3}
                max={15}
                marks
                step={1}
                disabled={isLoading}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <MapIcon color="primary" />
                <Typography variant="caption" display="block">
                  {t('map.ESTIMATED_TILES')}
                </Typography>
                <Typography variant="h6">
                  {estimatedTileCount}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider />

          {/* Land Distribution */}
          <Typography variant="subtitle2" color="text.secondary">
            {t('map.LAND_DISTRIBUTION')}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getLandTypeColor('MARINE'),
                  }}
                />
                <Typography variant="body2">
                  {t('map.TERRAIN_MARINE')}: {formData.marinePercentage}%
                </Typography>
              </Box>
              <Slider
                value={formData.marinePercentage}
                onChange={(_, value) => handlePercentageChange('marinePercentage', value as number)}
                min={0}
                max={100}
                step={5}
                disabled={isLoading}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getLandTypeColor('COASTAL'),
                  }}
                />
                <Typography variant="body2">
                  {t('map.TERRAIN_COASTAL')}: {formData.coastalPercentage}%
                </Typography>
              </Box>
              <Slider
                value={formData.coastalPercentage}
                onChange={(_, value) => handlePercentageChange('coastalPercentage', value as number)}
                min={0}
                max={100}
                step={5}
                disabled={isLoading}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getLandTypeColor('PLAIN'),
                  }}
                />
                <Typography variant="body2">
                  {t('map.TERRAIN_PLAIN')}: {formData.plainPercentage}%
                </Typography>
              </Box>
              <Slider
                value={formData.plainPercentage}
                onChange={(_, value) => handlePercentageChange('plainPercentage', value as number)}
                min={0}
                max={100}
                step={5}
                disabled={isLoading}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Grid>
          </Grid>

          {/* Distribution Preview */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('map.LAND_DISTRIBUTION_PREVIEW')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`${t('map.TERRAIN_MARINE')} ${formData.marinePercentage}%`}
                sx={{ backgroundColor: getLandTypeColor('MARINE'), color: 'white' }}
                size="small"
              />
              <Chip
                label={`${t('map.TERRAIN_COASTAL')} ${formData.coastalPercentage}%`}
                sx={{ backgroundColor: getLandTypeColor('COASTAL'), color: 'white' }}
                size="small"
              />
              <Chip
                label={`${t('map.TERRAIN_PLAIN')} ${formData.plainPercentage}%`}
                sx={{ backgroundColor: getLandTypeColor('PLAIN'), color: 'white' }}
                size="small"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Advanced Configuration */}
          <Box>
            <Button
              startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowAdvanced(!showAdvanced)}
              sx={{ mb: 2 }}
            >
              {t('map.ADVANCED_CONFIGURATION')}
            </Button>
            
            <Collapse in={showAdvanced}>
              <Stack spacing={3}>
                {/* Custom Economic Configuration Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={showCustomPricing}
                      onChange={(e) => handleCustomPricingToggle(e.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label={t('map.CUSTOM_ECONOMIC_CONFIGURATION')}
                />

                {/* Custom Pricing Configuration */}
                <Collapse in={showCustomPricing}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('map.CUSTOM_LAND_TYPE_CONFIGURATION')}
                    </Typography>
                    
                    {(['MARINE', 'COASTAL', 'PLAIN'] as const).map((landType) => (
                      <Paper key={landType} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getLandTypeColor(landType),
                              }}
                            />
                            {t(`TERRAIN_${landType}`)}
                          </Box>
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              label={t('map.INITIAL_PRICE')}
                              type="number"
                              value={customPricing?.[landType] || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setCustomPricing(prev => ({
                                  ...prev,
                                  [landType]: value,
                                }));
                              }}
                              disabled={isLoading}
                              size="small"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoneyIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              label={t('map.INITIAL_POPULATION')}
                              type="number"
                              value={customPopulation?.[landType] || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setCustomPopulation(prev => ({
                                  ...prev,
                                  [landType]: value,
                                }));
                              }}
                              disabled={isLoading}
                              size="small"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PeopleIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              label={t('map.TRANSPORTATION_COST')}
                              type="number"
                              value={customTransportation?.[landType] || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setCustomTransportation(prev => ({
                                  ...prev,
                                  [landType]: value,
                                }));
                              }}
                              disabled={isLoading}
                              size="small"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LocalShippingIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Collapse>
              </Stack>
            </Collapse>
          </Box>

          {/* Validation Errors */}
          {errors.general && (
            <Alert severity="error">
              <Typography variant="body2">
                {errors.general}
              </Typography>
            </Alert>
          )}

          {/* Generation Info */}
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2">
              {t('GENERATION_INFO', { count: estimatedTileCount })}
            </Typography>
          </Alert>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              disabled={isLoading}
            >
              {t('map.PREVIEW')}
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name.trim()}
              startIcon={<AutoFixHighIcon />}
            >
              {isLoading ? t('map.GENERATING') : t('map.GENERATE_TEMPLATE')}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TemplateGenerationForm; 