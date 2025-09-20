/**
 * AdvancedTileConfigurationPanel Component - Advanced bulk configuration operations
 * 
 * Features:
 * - Bulk update multiple tiles
 * - Land type batch operations with multipliers
 * - Template reset to defaults
 * - Advanced validation and feedback
 */

import React, { useState, useCallback } from 'react';
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
  Alert,

  InputAdornment,
  Stack,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  BatchPrediction as BatchIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MapTemplate, MapTile } from '../types';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface AdvancedTileConfigurationPanelProps {
  template: MapTemplate;
  tiles: MapTile[];
  onTemplateUpdate: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

interface LandTypeBatchUpdate {
  landType: 'MARINE' | 'COASTAL' | 'PLAIN' | 'GRASSLANDS' | 'FORESTS' | 'HILLS' | 'MOUNTAINS' | 'PLATEAUS' | 'DESERTS' | 'WETLANDS';
  fixedPrice?: number;
  fixedPopulation?: number;
  fixedTransportationCost?: number;
}

const AdvancedTileConfigurationPanel: React.FC<AdvancedTileConfigurationPanelProps> = ({
  template,
  tiles,
  onTemplateUpdate,
  isLoading = false,
  readOnly = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // State management
  const [batchUpdateDialogOpen, setBatchUpdateDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedLandType, setSelectedLandType] = useState<'MARINE' | 'COASTAL' | 'PLAIN' | 'GRASSLANDS' | 'FORESTS' | 'HILLS' | 'MOUNTAINS' | 'PLATEAUS' | 'DESERTS' | 'WETLANDS'>('COASTAL');
  const [processing, setProcessing] = useState(false);
  const [lastOperationResult, setLastOperationResult] = useState<{
    success: boolean;
    message: string;
    details?: { updated: number; failed: number };
  } | null>(null);

  // Batch update form data
  const [batchData, setBatchData] = useState<LandTypeBatchUpdate>({
    landType: 'COASTAL',
    fixedPrice: 100,
    fixedPopulation: 500,
    fixedTransportationCost: 5.0,
  });

  // Get land type statistics
  const getLandTypeStats = useCallback((landType: string) => {
    const landTypeTiles = tiles.filter(tile => tile.landType === landType);
    return {
      count: landTypeTiles.length,
      avgPrice: landTypeTiles.reduce((sum, tile) => sum + ((tile.initialGoldPrice || 0) + (tile.initialCarbonPrice || 0)), 0) / landTypeTiles.length || 0,
      avgPopulation: landTypeTiles.reduce((sum, tile) => sum + (tile.initialPopulation || 0), 0) / landTypeTiles.length || 0,
      avgTransportCost: landTypeTiles.reduce((sum, tile) => sum + (tile.transportationCostUnit || 0), 0) / landTypeTiles.length || 0,
    };
  }, [tiles]);

  // Handle land type batch update
  const handleLandTypeBatchUpdate = useCallback(async () => {
    if (!template || processing) return;

    setProcessing(true);
    try {
      const updateData = {
        fixedPrice: batchData.fixedPrice,
        fixedPopulation: batchData.fixedPopulation,
        fixedTransportationCost: batchData.fixedTransportationCost,
      };

      const result = await MapTemplateService.updateTilesByLandType(
        template.id,
        batchData.landType,
        updateData
      );

      setLastOperationResult({
        success: true,
        message: t('BATCH_UPDATE_SUCCESS', { landType: batchData.landType }),
        details: result,
      });

      setBatchUpdateDialogOpen(false);
      onTemplateUpdate();
    } catch (error) {
      console.error('Failed to update tiles by land type:', error);
      setLastOperationResult({
        success: false,
        message: t('BATCH_UPDATE_FAILED', { landType: batchData.landType }),
      });
    } finally {
      setProcessing(false);
    }
  }, [template, processing, batchData, onTemplateUpdate]);

  // Handle template reset to defaults
  const handleResetToDefaults = useCallback(async () => {
    if (!template || processing) return;

    setProcessing(true);
    try {
      const result = await MapTemplateService.resetTilesToDefaults(template.id);

      setLastOperationResult({
        success: true,
        message: t('map.TEMPLATE_RESET_SUCCESS'),
        details: result,
      });

      setResetDialogOpen(false);
      onTemplateUpdate();
    } catch (error) {
      console.error('Failed to reset template:', error);
      setLastOperationResult({
        success: false,
        message: t('map.TEMPLATE_RESET_FAILED'),
      });
    } finally {
      setProcessing(false);
    }
  }, [template, processing, onTemplateUpdate]);

  // Get land type color
  const getLandTypeColor = (landType: string) => {
    const isDark = theme.palette.mode === 'dark';
    const colors = {
      MARINE: theme.palette.info.main,
      COASTAL: theme.palette.warning.main,
      PLAIN: theme.palette.success.main,
      GRASSLANDS: isDark ? '#81C784' : '#66BB6A',
      FORESTS: isDark ? '#4CAF50' : '#388E3C',
      HILLS: isDark ? '#A1887F' : '#8D6E63',
      MOUNTAINS: isDark ? '#9E9E9E' : '#616161',
      PLATEAUS: isDark ? '#8D6E63' : '#795548',
      DESERTS: isDark ? '#FFB74D' : '#FF9800',
      WETLANDS: isDark ? '#26C6DA' : '#00ACC1'
    };
    return colors[landType] || theme.palette.grey[500];
  };

  const landTypeStats = getLandTypeStats(selectedLandType);

  return (
    <Box>
      {/* Operation Result Alert */}
      {lastOperationResult && (
        <Alert 
          severity={lastOperationResult.success ? 'success' : 'error'}
          onClose={() => setLastOperationResult(null)}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            {lastOperationResult.message}
          </Typography>
          {lastOperationResult.details && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {t('OPERATION_DETAILS', { updated: lastOperationResult.details.updated, failed: lastOperationResult.details.failed })}
            </Typography>
          )}
        </Alert>
      )}

      {/* Land Type Statistics */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={t('map.LAND_TYPE_STATISTICS')}
          subheader={t('map.CURRENT_DISTRIBUTION_AVERAGES')}
        />
        <CardContent>
          <Grid container spacing={2}>
            {(['MARINE', 'COASTAL', 'PLAIN', 'GRASSLANDS', 'FORESTS', 'HILLS', 'MOUNTAINS', 'PLATEAUS', 'DESERTS', 'WETLANDS'] as const).map((landType) => {
              const stats = getLandTypeStats(landType);
              return (
                <Grid key={landType} item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: selectedLandType === landType ? 'action.selected' : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedLandType(landType)}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getLandTypeColor(landType),
                        }}
                      />
                      <Typography variant="subtitle2">
                        {t(`TERRAIN_${landType}`)}
                      </Typography>
                      <Chip label={stats.count} size="small" />
                    </Box>
                    <Typography variant="caption" display="block">
                      {t('AVG_PRICE', { price: `$${stats.avgPrice.toFixed(2)}` })}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {t('AVG_POPULATION', { population: Math.round(stats.avgPopulation || 0).toLocaleString() })}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {t('AVG_TRANSPORT', { cost: `$${stats.avgTransportCost.toFixed(2)}` })}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Batch Operations */}
      <Card>
        <CardHeader
          title={t('map.BATCH_OPERATIONS')}
          subheader={t('map.ADVANCED_TILE_CONFIG_TOOLS')}
        />
        <CardContent>
          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<BatchIcon />}
              onClick={() => setBatchUpdateDialogOpen(true)}
              disabled={readOnly || processing}
              fullWidth
            >
              {t('map.BATCH_UPDATE_BY_LAND_TYPE')}
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setResetDialogOpen(true)}
              disabled={readOnly || processing}
              color="warning"
              fullWidth
            >
              {t('map.RESET_ALL_TILES_TO_DEFAULTS')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Batch Update Dialog */}
      <Dialog
        open={batchUpdateDialogOpen}
        onClose={() => setBatchUpdateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('BATCH_UPDATE_TITLE', { landType: t(`TERRAIN_${batchData.landType}`) })}
        </DialogTitle>
        <DialogContent>
          {processing && <LinearProgress sx={{ mb: 2 }} />}
          
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Land Type Selection */}
            <FormControl fullWidth>
              <InputLabel>{t('map.LAND_TYPE')}</InputLabel>
              <Select
                value={batchData.landType}
                onChange={(e) => setBatchData(prev => ({ 
                  ...prev, 
                  landType: e.target.value as 'MARINE' | 'COASTAL' | 'PLAIN' | 'GRASSLANDS' | 'FORESTS' | 'HILLS' | 'MOUNTAINS' | 'PLATEAUS' | 'DESERTS' | 'WETLANDS' 
                }))}
                label={t('map.LAND_TYPE')}
                disabled={processing}
              >
                {(['MARINE', 'COASTAL', 'PLAIN', 'GRASSLANDS', 'FORESTS', 'HILLS', 'MOUNTAINS', 'PLATEAUS', 'DESERTS', 'WETLANDS'] as const).map((landType) => (
                  <MenuItem key={landType} value={landType}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getLandTypeColor(landType),
                        }}
                      />
                      {t(`TERRAIN_${landType}`)} ({getLandTypeStats(landType).count} tiles)
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


            {/* Fixed Value Controls */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('map.FIXED_VALUES_SECTION')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('map.FIXED_PRICE')}
                    type="number"
                    value={batchData.fixedPrice || ''}
                    onChange={(e) => setBatchData(prev => ({ 
                      ...prev, 
                      fixedPrice: parseFloat(e.target.value) 
                    }))}
                    disabled={processing}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('map.FIXED_POPULATION')}
                    type="number"
                    value={batchData.fixedPopulation || ''}
                    onChange={(e) => setBatchData(prev => ({ 
                      ...prev, 
                      fixedPopulation: parseInt(e.target.value) 
                    }))}
                    disabled={processing}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('map.FIXED_TRANSPORT_COST')}
                    type="number"
                    value={batchData.fixedTransportationCost || ''}
                    onChange={(e) => setBatchData(prev => ({ 
                      ...prev, 
                      fixedTransportationCost: parseFloat(e.target.value) 
                    }))}
                    disabled={processing}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Preview Impact */}
            <Alert severity="info">
              <Typography variant="body2">
                {t('BATCH_IMPACT_WARNING', { count: getLandTypeStats(batchData.landType).count, landType: t(`TERRAIN_${batchData.landType}`) })}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBatchUpdateDialogOpen(false)}
            disabled={processing}
          >
            {t('map.CANCEL')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleLandTypeBatchUpdate}
            disabled={processing}
          >
            {processing ? t('map.UPDATING') : t('map.APPLY_BATCH_UPDATE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            {t('map.RESET_TEMPLATE_TO_DEFAULTS')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {processing && <LinearProgress sx={{ mb: 2 }} />}
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t('map.RESET_WARNING_MESSAGE')}
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary">
            {t('map.DEFAULT_VALUES')}
          </Typography>
          <Box sx={{ mt: 1, pl: 2 }}>
            <Typography variant="caption" display="block">
              {t('map.DEFAULT_MARINE_VALUES')}
            </Typography>
            <Typography variant="caption" display="block">
              {t('map.DEFAULT_COASTAL_VALUES')}
            </Typography>
            <Typography variant="caption" display="block">
              {t('map.DEFAULT_PLAIN_VALUES')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResetDialogOpen(false)}
            disabled={processing}
          >
            {t('map.CANCEL')}
          </Button>
          <Button 
            variant="contained"
            color="warning"
            onClick={handleResetToDefaults}
            disabled={processing}
          >
            {processing ? t('map.RESETTING') : t('map.RESET_TO_DEFAULTS')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedTileConfigurationPanel;