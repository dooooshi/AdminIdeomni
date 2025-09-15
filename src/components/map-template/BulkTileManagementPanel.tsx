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
  Grid,
  Alert,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Preview as PreviewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  LandType,
  BulkUpdateTilesByLandTypeDto,
  MapTileBulkUpdateResponseDto,
} from '@/components/map/types';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface BulkTileManagementPanelProps {
  templateId: number;
  onOperationComplete?: () => void;
  templateStatistics?: {
    totalTiles: number;
    tilesByLandType: Record<LandType, number>;
  };
}

const BulkTileManagementPanel: React.FC<BulkTileManagementPanelProps> = ({
  templateId,
  onOperationComplete,
  templateStatistics,
}) => {
  const { t } = useTranslation();

  // State
  const [selectedLandType, setSelectedLandType] = useState<LandType>(LandType.PLAIN);
  const [isLoading, setIsLoading] = useState(false);

  // Fixed value updates
  const [fixedGoldPrice, setFixedGoldPrice] = useState<number | ''>('');
  const [fixedCarbonPrice, setFixedCarbonPrice] = useState<number | ''>('');
  const [fixedPopulation, setFixedPopulation] = useState<number | ''>('');
  const [fixedTransportCost, setFixedTransportCost] = useState<number | ''>('');

  // Preset scenarios
  const [presetScenario, setPresetScenario] = useState<'reset' | 'custom'>('custom');

  // Dialog states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState<MapTileBulkUpdateResponseDto | null>(null);

  const handlePresetScenarioChange = (scenario: typeof presetScenario) => {
    setPresetScenario(scenario);
    
    switch (scenario) {
      case 'reset':
        setFixedGoldPrice(0);
        setFixedCarbonPrice(0);
        setFixedPopulation(MapTemplateService.getDefaultConfiguration(selectedLandType).initialPopulation);
        setFixedTransportCost(MapTemplateService.getDefaultConfiguration(selectedLandType).transportationCostUnit);
        break;
      case 'custom':
        // Keep current values
        break;
    }
  };

  const buildUpdateData = (): BulkUpdateTilesByLandTypeDto => {
    const updateData: BulkUpdateTilesByLandTypeDto = {};

    if (fixedGoldPrice !== '') updateData.fixedGoldPrice = Number(fixedGoldPrice);
    if (fixedCarbonPrice !== '') updateData.fixedCarbonPrice = Number(fixedCarbonPrice);
    if (fixedPopulation !== '') updateData.fixedPopulation = Number(fixedPopulation);
    if (fixedTransportCost !== '') updateData.fixedTransportationCost = Number(fixedTransportCost);

    return updateData;
  };

  const validateUpdateData = (): { isValid: boolean; errors: string[] } => {
    const updateData = buildUpdateData();
    const validation = MapTemplateService.validateBulkTileUpdateByLandType(updateData);
    
    const errors: string[] = [];
    if (Object.keys(updateData).length === 0) {
      errors.push(t('mapTemplate.NO_CHANGES_SPECIFIED'));
    }
    
    Object.entries(validation.errors).forEach(([field, error]) => {
      errors.push(error);
    });

    return {
      isValid: validation.isValid && errors.length === 1, // Only "no changes" error is allowed if validation passes
      errors,
    };
  };

  const handlePreview = async () => {
    const validation = validateUpdateData();
    if (!validation.isValid) {
      // Show validation errors
      return;
    }

    setPreviewDialogOpen(true);
  };

  const handleConfirmUpdate = () => {
    setPreviewDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleExecuteUpdate = async () => {
    const updateData = buildUpdateData();

    try {
      setIsLoading(true);
      setConfirmDialogOpen(false);

      const result = await MapTemplateService.updateTilesByLandType(
        templateId,
        selectedLandType,
        updateData
      );

      setBulkResult(result);
      setResultDialogOpen(true);
      
      if (onOperationComplete) {
        onOperationComplete();
      }
    } catch (error) {
      console.error('Bulk tile update failed:', error);
      setBulkResult({
        updated: 0,
        failed: 1,
        details: [{ tileId: 0, success: false, error: 'Update operation failed' }],
        message: 'Bulk tile update operation failed'
      });
      setResultDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFixedGoldPrice('');
    setFixedCarbonPrice('');
    setFixedPopulation('');
    setFixedTransportCost('');
    setPresetScenario('custom');
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon />
            <Typography variant="h6">{t('mapTemplate.BULK_TILE_MANAGEMENT')}</Typography>
          </Box>
        }
        subheader={t('mapTemplate.BULK_TILE_MANAGEMENT_SUBTITLE')}
      />

      <CardContent>
        {/* Template Statistics */}
        {templateStatistics && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="body2" component="span">
                {t('mapTemplate.TEMPLATE_STATS')}: {templateStatistics.totalTiles} {t('mapTemplate.TOTAL_TILES')}
              </Typography>
              {Object.entries(templateStatistics.tilesByLandType).map(([landType, count]) => (
                <Chip 
                  key={landType}
                  label={`${t(`LAND_TYPE_${landType}`)}: ${count}`}
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Land Type Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('mapTemplate.TARGET_LAND_TYPE')}</InputLabel>
              <Select
                value={selectedLandType}
                label={t('mapTemplate.TARGET_LAND_TYPE')}
                onChange={(e) => setSelectedLandType(e.target.value as LandType)}
              >
                {Object.values(LandType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`LAND_TYPE_${type}`)} ({templateStatistics?.tilesByLandType[type] || 0})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Preset Scenarios */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('mapTemplate.PRESET_SCENARIO')}</InputLabel>
              <Select
                value={presetScenario}
                label={t('mapTemplate.PRESET_SCENARIO')}
                onChange={(e) => handlePresetScenarioChange(e.target.value as any)}
              >
                <MenuItem value="reset">{t('mapTemplate.RESET_TO_DEFAULTS')}</MenuItem>
                <MenuItem value="custom">{t('mapTemplate.CUSTOM')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Fixed Value Updates */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('mapTemplate.FIXED_VALUES')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t('mapTemplate.FIXED_GOLD_PRICE')}
              value={fixedGoldPrice}
              onChange={(e) => setFixedGoldPrice(e.target.value === '' ? '' : Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoneyIcon /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t('mapTemplate.FIXED_CARBON_PRICE')}
              value={fixedCarbonPrice}
              onChange={(e) => setFixedCarbonPrice(e.target.value === '' ? '' : Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">CO₂</InputAdornment>,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t('mapTemplate.FIXED_POPULATION')}
              value={fixedPopulation}
              onChange={(e) => setFixedPopulation(e.target.value === '' ? '' : Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PeopleIcon /></InputAdornment>,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t('mapTemplate.FIXED_TRANSPORT_COST')}
              value={fixedTransportCost}
              onChange={(e) => setFixedTransportCost(e.target.value === '' ? '' : Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocalShippingIcon /></InputAdornment>,
              }}
            />
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button onClick={resetForm}>
                {t('mapTemplate.RESET')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
              >
                {t('mapTemplate.PREVIEW')}
              </Button>
              <LoadingButton
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleConfirmUpdate}
                loading={isLoading}
              >
                {t('mapTemplate.APPLY_CHANGES')}
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('mapTemplate.PREVIEW_CHANGES')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              {t('mapTemplate.PREVIEW_CHANGES_INFO', { 
                landType: t(`LAND_TYPE_${selectedLandType}`),
                count: templateStatistics?.tilesByLandType[selectedLandType] || 0
              })}
            </Typography>

            <Paper sx={{ p: 2, mt: 2, maxHeight: 300, overflow: 'auto' }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('mapTemplate.CHANGES_TO_APPLY')}:
              </Typography>
              <pre style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {JSON.stringify(buildUpdateData(), null, 2)}
              </pre>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialogOpen(false)}>
              {t('mapTemplate.CANCEL')}
            </Button>
            <Button variant="contained" onClick={handleConfirmUpdate}>
              {t('mapTemplate.PROCEED')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <WarningIcon color="warning" />
              {t('mapTemplate.CONFIRM_BULK_UPDATE')}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('mapTemplate.BULK_TILE_UPDATE_WARNING')}
            </Alert>
            <Typography>
              {t('mapTemplate.BULK_TILE_UPDATE_CONFIRM', { 
                landType: t(`LAND_TYPE_${selectedLandType}`),
                count: templateStatistics?.tilesByLandType[selectedLandType] || 0
              })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              {t('mapTemplate.CANCEL')}
            </Button>
            <LoadingButton
              onClick={handleExecuteUpdate}
              color="warning"
              variant="contained"
              loading={isLoading}
            >
              {t('mapTemplate.CONFIRM_UPDATE')}
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Result Dialog */}
        <Dialog open={resultDialogOpen} onClose={() => setResultDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              {bulkResult?.failed === 0 ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
              {t('mapTemplate.BULK_UPDATE_RESULT')}
            </Box>
          </DialogTitle>
          <DialogContent>
            {bulkResult && (
              <Box>
                <Alert 
                  severity={bulkResult.failed === 0 ? 'success' : 'warning'} 
                  sx={{ mb: 2 }}
                >
                  {t('mapTemplate.BULK_UPDATE_SUMMARY', {
                    updated: bulkResult.updated,
                    failed: bulkResult.failed
                  })}
                </Alert>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {bulkResult.message}
                </Typography>

                {bulkResult.failed > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('mapTemplate.FAILED_OPERATIONS')}:
                    </Typography>
                    <List dense>
                      {bulkResult.details
                        .filter(detail => !detail.success)
                        .map((detail, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Tile ${detail.tileId}`}
                              secondary={detail.error}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResultDialogOpen(false)} variant="contained">
              {t('mapTemplate.CLOSE')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading overlay */}
        {isLoading && (
          <Box sx={{ position: 'relative' }}>
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkTileManagementPanel;