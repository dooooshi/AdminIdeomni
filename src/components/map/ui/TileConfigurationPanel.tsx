/**
 * TileConfigurationPanel Component - Visual tile property editor
 * 
 * Features:
 * - Interactive property editing for selected tiles
 * - Real-time validation and feedback
 * - Land type-specific default values
 * - Economic calculations and preview
 * - Batch editing capabilities
 * - Undo/redo functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Divider,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MapTile, UpdateTileDto, TileConfigurationProps } from '../types';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface TileConfigurationPanelProps {
  selectedTile: MapTile | null;
  tiles: MapTile[];
  templateId: number;
  onTileUpdate: (tileId: number, updates: UpdateTileDto) => void;
  onBatchUpdate?: (tileIds: number[], updates: UpdateTileDto) => void;
  onTemplateRefresh?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const TileConfigurationPanel: React.FC<TileConfigurationPanelProps> = ({
  selectedTile,
  tiles,
  templateId,
  onTileUpdate,
  onBatchUpdate,
  onTemplateRefresh,
  onClose,
  isLoading = false,
  readOnly = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('map');
  
  // Local state for form data
  const [formData, setFormData] = useState<UpdateTileDto>({});
  const [originalData, setOriginalData] = useState<UpdateTileDto>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTileIds, setSelectedTileIds] = useState<number[]>([]);

  // Initialize form data when tile changes
  useEffect(() => {
    if (selectedTile) {
      const defaults = MapTemplateService.getDefaultConfiguration(selectedTile.landType);
      const initialData: UpdateTileDto = {
        landType: selectedTile.landType,
        // NEW: Dual pricing system
        initialGoldPrice: selectedTile.initialGoldPrice ?? defaults.initialGoldPrice,
        initialCarbonPrice: selectedTile.initialCarbonPrice ?? defaults.initialCarbonPrice,
        initialPopulation: selectedTile.initialPopulation ?? defaults.initialPopulation,
        transportationCostUnit: selectedTile.transportationCostUnit ?? defaults.transportationCostUnit,
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setHasChanges(false);
      setValidationErrors({});
    }
  }, [selectedTile]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof UpdateTileDto, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalData));
      return updated;
    });

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [originalData, validationErrors]);

  // Validate form data using service validation
  const validateForm = useCallback((): boolean => {
    const validation = MapTemplateService.validateTileConfiguration(formData);
    
    // Convert service validation errors to i18n messages
    const errors: Record<string, string> = {};
    Object.entries(validation.errors).forEach(([field, message]) => {
      switch (field) {
        case 'initialGoldPrice':
          errors.initialGoldPrice = message.includes('negative') 
            ? t('VALIDATION_GOLD_PRICE_NEGATIVE') 
            : t('VALIDATION_GOLD_PRICE_TOO_HIGH');
          break;
        case 'initialCarbonPrice':
          errors.initialCarbonPrice = message.includes('negative') 
            ? t('VALIDATION_CARBON_PRICE_NEGATIVE') 
            : t('VALIDATION_CARBON_PRICE_TOO_HIGH');
          break;
        case 'initialPopulation':
          errors.initialPopulation = message.includes('negative') 
            ? t('VALIDATION_POPULATION_NEGATIVE') 
            : t('VALIDATION_POPULATION_TOO_HIGH');
          break;
        case 'transportationCostUnit':
          errors.transportationCostUnit = message.includes('negative') 
            ? t('VALIDATION_TRANSPORT_NEGATIVE') 
            : t('VALIDATION_TRANSPORT_TOO_HIGH');
          break;
        default:
          errors[field] = message;
      }
    });

    setValidationErrors(errors);
    return validation.isValid;
  }, [formData, t]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!selectedTile || !validateForm()) {
      return;
    }

    try {
      if (batchMode && selectedTileIds.length > 1 && onBatchUpdate) {
        await onBatchUpdate(selectedTileIds, formData);
      } else {
        // Use the new template-specific tile configuration API
        await MapTemplateService.updateTileConfig(templateId, selectedTile.id, formData);
        // Refresh the template data to show changes in the map
        if (onTemplateRefresh) {
          onTemplateRefresh();
        }
      }
      
      setOriginalData(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save tile configuration:', error);
    }
  }, [selectedTile, formData, batchMode, selectedTileIds, onBatchUpdate, onTileUpdate, validateForm, templateId]);

  // Handle reset
  const handleReset = useCallback(() => {
    setFormData(originalData);
    setHasChanges(false);
    setValidationErrors({});
  }, [originalData]);

  // Handle land type change and apply defaults
  const handleLandTypeChange = useCallback((newLandType: 'MARINE' | 'COASTAL' | 'PLAIN') => {
    const defaults = MapTemplateService.getDefaultConfiguration(newLandType);
    setFormData(prev => {
      const updated = {
        ...prev,
        landType: newLandType,
        // NEW: Dual pricing system
        initialGoldPrice: defaults.initialGoldPrice,
        initialCarbonPrice: defaults.initialCarbonPrice,
        initialPopulation: defaults.initialPopulation,
        transportationCostUnit: defaults.transportationCostUnit,
      };
      // Check if the data has changed compared to original
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalData));
      return updated;
    });
  }, [originalData]);

  // Get land type color
  const getLandTypeColor = (landType: string) => {
    const colors = {
      MARINE: theme.palette.info.main,
      COASTAL: theme.palette.warning.main,
      PLAIN: theme.palette.success.main,
    };
    return colors[landType] || theme.palette.grey[500];
  };

  // Removed economic metrics calculation

  if (!selectedTile) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('SELECT_TILE_TO_CONFIGURE')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('SELECT_TILE_HELP_TEXT')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">
              {t('TILE_CONFIGURATION')}
            </Typography>
            <Chip 
              label={selectedTile.landType}
              size="small"
              sx={{ 
                backgroundColor: getLandTypeColor(selectedTile.landType),
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        }
        subheader={`${t('COORDINATES')}: Q${selectedTile.axialQ}, R${selectedTile.axialR}`}
        action={
          <Stack direction="row" spacing={1}>
            {hasChanges && (
              <Tooltip title={t('RESET_CHANGES')}>
                <IconButton onClick={handleReset} size="small">
                  <UndoIcon />
                </IconButton>
              </Tooltip>
            )}
            {onClose && (
              <Button onClick={onClose} size="small">
                {t('CLOSE')}
              </Button>
            )}
          </Stack>
        }
      />
      
      <CardContent>
        <Stack spacing={3}>
          {/* Batch Mode Toggle */}
          {onBatchUpdate && (
            <FormControlLabel
              control={
                <Switch
                  checked={batchMode}
                  onChange={(e) => setBatchMode(e.target.checked)}
                  disabled={readOnly}
                />
              }
              label={t('BATCH_EDIT_MODE')}
            />
          )}

          {/* Land Type Selection */}
          <FormControl fullWidth disabled={readOnly}>
            <InputLabel>{t('LAND_TYPE')}</InputLabel>
            <Select
              value={formData.landType || ''}
              onChange={(e) => handleLandTypeChange(e.target.value as 'MARINE' | 'COASTAL' | 'PLAIN')}
              label={t('LAND_TYPE')}
            >
              <MenuItem value="MARINE">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getLandTypeColor('MARINE'),
                    }}
                  />
                  {t('TERRAIN_MARINE')}
                </Box>
              </MenuItem>
              <MenuItem value="COASTAL">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getLandTypeColor('COASTAL'),
                    }}
                  />
                  {t('TERRAIN_COASTAL')}
                </Box>
              </MenuItem>
              <MenuItem value="PLAIN">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getLandTypeColor('PLAIN'),
                    }}
                  />
                  {t('TERRAIN_PLAIN')}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Economic Configuration */}
          <Typography variant="subtitle2" color="text.secondary">
            {t('ECONOMIC_CONFIGURATION')}
          </Typography>

          <Grid container spacing={2}>
            {/* NEW: Dual Pricing System */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('INITIAL_GOLD_PRICE')}
                type="number"
                value={formData.initialGoldPrice || ''}
                onChange={(e) => handleFieldChange('initialGoldPrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                disabled={readOnly}
                error={!!validationErrors.initialGoldPrice}
                helperText={validationErrors.initialGoldPrice}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon sx={{ color: '#FFD700' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('INITIAL_CARBON_PRICE')}
                type="number"
                value={formData.initialCarbonPrice || ''}
                onChange={(e) => handleFieldChange('initialCarbonPrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                disabled={readOnly}
                error={!!validationErrors.initialCarbonPrice}
                helperText={validationErrors.initialCarbonPrice}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon sx={{ color: '#4CAF50' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">CO₂</InputAdornment>
                  ),
                }}
              />
            </Grid>


            {/* Initial Population */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('INITIAL_POPULATION')}
                type="number"
                value={formData.initialPopulation || ''}
                onChange={(e) => handleFieldChange('initialPopulation', e.target.value === '' ? undefined : parseInt(e.target.value))}
                disabled={readOnly}
                error={!!validationErrors.initialPopulation}
                helperText={validationErrors.initialPopulation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Transportation Cost */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('TRANSPORTATION_COST_UNIT')}
                type="number"
                value={formData.transportationCostUnit || ''}
                onChange={(e) => handleFieldChange('transportationCostUnit', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                disabled={readOnly}
                error={!!validationErrors.transportationCostUnit}
                helperText={validationErrors.transportationCostUnit}
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





          {/* Validation Errors */}
          {Object.keys(validationErrors).length > 0 && (
            <Alert severity="error">
              <Typography variant="body2">
                {t('PLEASE_FIX_VALIDATION_ERRORS')}
              </Typography>
            </Alert>
          )}

          {/* Action Buttons */}
          {!readOnly && (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={!hasChanges || isLoading}
                startIcon={<UndoIcon />}
              >
                {t('RESET')}
              </Button>
              
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!hasChanges || isLoading || Object.keys(validationErrors).length > 0}
                startIcon={<SaveIcon />}
              >
                {batchMode && selectedTileIds.length > 1 
                  ? t('SAVE_BATCH', { count: selectedTileIds.length })
                  : t('SAVE')
                }
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TileConfigurationPanel; 