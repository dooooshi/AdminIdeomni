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
  Grid,
  Switch,
  FormControlLabel,
  InputAdornment,
  Stack,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  LinearProgress,
} from '@mui/material';
import {
  BatchPrediction as BatchIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
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
  landType: 'MARINE' | 'COASTAL' | 'PLAIN';
  priceMultiplier?: number;
  populationMultiplier?: number;
  transportationCostMultiplier?: number;
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
  const { t } = useTranslation('map');

  // State management
  const [batchUpdateDialogOpen, setBatchUpdateDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedLandType, setSelectedLandType] = useState<'MARINE' | 'COASTAL' | 'PLAIN'>('COASTAL');
  const [useMultipliers, setUseMultipliers] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastOperationResult, setLastOperationResult] = useState<{
    success: boolean;
    message: string;
    details?: { updated: number; failed: number };
  } | null>(null);

  // Batch update form data
  const [batchData, setBatchData] = useState<LandTypeBatchUpdate>({
    landType: 'COASTAL',
    priceMultiplier: 1.0,
    populationMultiplier: 1.0,
    transportationCostMultiplier: 1.0,
    fixedPrice: 100,
    fixedPopulation: 500,
    fixedTransportationCost: 5.0,
  });

  // Get land type statistics
  const getLandTypeStats = useCallback((landType: string) => {
    const landTypeTiles = tiles.filter(tile => tile.landType === landType);
    return {
      count: landTypeTiles.length,
      avgPrice: landTypeTiles.reduce((sum, tile) => sum + (tile.initialPrice || 0), 0) / landTypeTiles.length || 0,
      avgPopulation: landTypeTiles.reduce((sum, tile) => sum + (tile.initialPopulation || 0), 0) / landTypeTiles.length || 0,
      avgTransportCost: landTypeTiles.reduce((sum, tile) => sum + (tile.transportationCostUnit || 0), 0) / landTypeTiles.length || 0,
    };
  }, [tiles]);

  // Handle land type batch update
  const handleLandTypeBatchUpdate = useCallback(async () => {
    if (!template || processing) return;

    setProcessing(true);
    try {
      const updateData = useMultipliers ? {
        priceMultiplier: batchData.priceMultiplier,
        populationMultiplier: batchData.populationMultiplier,
        transportationCostMultiplier: batchData.transportationCostMultiplier,
      } : {
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
        message: `${batchData.landType} tiles updated successfully`,
        details: result,
      });

      setBatchUpdateDialogOpen(false);
      onTemplateUpdate();
    } catch (error) {
      console.error('Failed to update tiles by land type:', error);
      setLastOperationResult({
        success: false,
        message: `Failed to update ${batchData.landType} tiles`,
      });
    } finally {
      setProcessing(false);
    }
  }, [template, processing, useMultipliers, batchData, onTemplateUpdate]);

  // Handle template reset to defaults
  const handleResetToDefaults = useCallback(async () => {
    if (!template || processing) return;

    setProcessing(true);
    try {
      const result = await MapTemplateService.resetTilesToDefaults(template.id);

      setLastOperationResult({
        success: true,
        message: 'Template reset to defaults successfully',
        details: result,
      });

      setResetDialogOpen(false);
      onTemplateUpdate();
    } catch (error) {
      console.error('Failed to reset template:', error);
      setLastOperationResult({
        success: false,
        message: 'Failed to reset template to defaults',
      });
    } finally {
      setProcessing(false);
    }
  }, [template, processing, onTemplateUpdate]);

  // Get land type color
  const getLandTypeColor = (landType: string) => {
    const colors = {
      MARINE: theme.palette.info.main,
      COASTAL: theme.palette.warning.main,
      PLAIN: theme.palette.success.main,
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
              Updated: {lastOperationResult.details.updated}, Failed: {lastOperationResult.details.failed}
            </Typography>
          )}
        </Alert>
      )}

      {/* Land Type Statistics */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title="Land Type Statistics"
          subheader="Current distribution and averages"
        />
        <CardContent>
          <Grid container spacing={2}>
            {(['MARINE', 'COASTAL', 'PLAIN'] as const).map((landType) => {
              const stats = getLandTypeStats(landType);
              return (
                <Grid item xs={12} md={4} key={landType}>
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
                      Avg Price: ${stats.avgPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Avg Population: {Math.round(stats.avgPopulation).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Avg Transport: ${stats.avgTransportCost.toFixed(2)}
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
          title="Batch Operations"
          subheader="Advanced tile configuration tools"
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
              Batch Update by Land Type
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setResetDialogOpen(true)}
              disabled={readOnly || processing}
              color="warning"
              fullWidth
            >
              Reset All Tiles to Defaults
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
          Batch Update: {t(`TERRAIN_${batchData.landType}`)} Tiles
        </DialogTitle>
        <DialogContent>
          {processing && <LinearProgress sx={{ mb: 2 }} />}
          
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Land Type Selection */}
            <FormControl fullWidth>
              <InputLabel>Land Type</InputLabel>
              <Select
                value={batchData.landType}
                onChange={(e) => setBatchData(prev => ({ 
                  ...prev, 
                  landType: e.target.value as 'MARINE' | 'COASTAL' | 'PLAIN' 
                }))}
                label="Land Type"
                disabled={processing}
              >
                {(['MARINE', 'COASTAL', 'PLAIN'] as const).map((landType) => (
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

            {/* Update Mode Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={useMultipliers}
                  onChange={(e) => setUseMultipliers(e.target.checked)}
                  disabled={processing}
                />
              }
              label={useMultipliers ? "Use Multipliers" : "Use Fixed Values"}
            />

            {useMultipliers ? (
              /* Multiplier Controls */
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Multipliers (1.0 = no change)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Price Multiplier: {batchData.priceMultiplier}x
                    </Typography>
                    <Slider
                      value={batchData.priceMultiplier || 1.0}
                      onChange={(_, value) => setBatchData(prev => ({ 
                        ...prev, 
                        priceMultiplier: value as number 
                      }))}
                      min={0.1}
                      max={5.0}
                      step={0.1}
                      disabled={processing}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Population Multiplier: {batchData.populationMultiplier}x
                    </Typography>
                    <Slider
                      value={batchData.populationMultiplier || 1.0}
                      onChange={(_, value) => setBatchData(prev => ({ 
                        ...prev, 
                        populationMultiplier: value as number 
                      }))}
                      min={0.0}
                      max={3.0}
                      step={0.1}
                      disabled={processing}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Transport Cost Multiplier: {batchData.transportationCostMultiplier}x
                    </Typography>
                    <Slider
                      value={batchData.transportationCostMultiplier || 1.0}
                      onChange={(_, value) => setBatchData(prev => ({ 
                        ...prev, 
                        transportationCostMultiplier: value as number 
                      }))}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      disabled={processing}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              /* Fixed Value Controls */
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Fixed Values (will replace current values)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Fixed Price"
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
                      label="Fixed Population"
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
                      label="Fixed Transport Cost"
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
            )}

            {/* Preview Impact */}
            <Alert severity="info">
              <Typography variant="body2">
                This will affect {getLandTypeStats(batchData.landType).count} tiles of type {t(`TERRAIN_${batchData.landType}`)}.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBatchUpdateDialogOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleLandTypeBatchUpdate}
            disabled={processing}
          >
            {processing ? 'Updating...' : 'Apply Batch Update'}
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
            Reset Template to Defaults
          </Box>
        </DialogTitle>
        <DialogContent>
          {processing && <LinearProgress sx={{ mb: 2 }} />}
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This will reset ALL tiles in the template to their default configurations based on land type. 
              This action cannot be undone.
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Default values:
          </Typography>
          <Box sx={{ mt: 1, pl: 2 }}>
            <Typography variant="caption" display="block">
              • Marine: $50, 0 population, $8 transport
            </Typography>
            <Typography variant="caption" display="block">
              • Coastal: $100, 500 population, $5 transport
            </Typography>
            <Typography variant="caption" display="block">
              • Plain: $150, 1000 population, $3 transport
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResetDialogOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="warning"
            onClick={handleResetToDefaults}
            disabled={processing}
          >
            {processing ? 'Resetting...' : 'Reset to Defaults'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedTileConfigurationPanel;