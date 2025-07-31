/**
 * ActivityTileStatePanel Component - Configure tile states for activities
 * 
 * Features:
 * - Edit current price and population for selected tiles
 * - View change history and audit trail
 * - Compare with template defaults
 * - Bulk edit capabilities
 * - Real-time validation and economic calculations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Stack,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Collapse,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  History as HistoryIcon,
  Compare as CompareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

import AdminTileStateService, { 
  TileStateConfig, 
  DetailedTileState, 
  Activity 
} from '@/lib/services/adminTileStateService';

interface ActivityTileStatePanelProps {
  activity: Activity | null;
  selectedTileId: number | null;
  tileStates: DetailedTileState[];
  onTileStateUpdate: (tileId: number, updatedState: DetailedTileState) => void;
  onBulkUpdate?: (updates: TileStateConfig[]) => void;
  isVisible: boolean;
}

const ActivityTileStatePanel: React.FC<ActivityTileStatePanelProps> = ({
  activity,
  selectedTileId,
  tileStates,
  onTileStateUpdate,
  onBulkUpdate,
  isVisible,
}) => {
  const { t } = useTranslation(['map', 'activity']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentPopulation, setCurrentPopulation] = useState<number>(0);
  const [changeReason, setChangeReason] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get selected tile state
  const selectedTileState = selectedTileId 
    ? tileStates.find(state => state.tileId === selectedTileId)
    : null;

  // Reset form when tile selection changes
  useEffect(() => {
    if (selectedTileState) {
      setCurrentPrice(selectedTileState.newPrice || selectedTileState.tile.initialGoldPrice || 0);
      setCurrentPopulation(selectedTileState.newPopulation || selectedTileState.tile.initialPopulation);
      setChangeReason('');
      setValidationErrors([]);
    }
  }, [selectedTileState]);

  // Validate inputs
  const validateInputs = useCallback(() => {
    const errors = AdminTileStateService.validateTileConfig({
      currentPrice,
      currentPopulation,
      changeReason,
    });
    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentPrice, currentPopulation, changeReason]);

  // Handle single tile update
  const handleSaveTileState = async () => {
    if (!activity || !selectedTileId || !validateInputs()) {
      return;
    }

    try {
      setIsSaving(true);
      
      const config: TileStateConfig = {
        activityId: activity.id,
        tileId: selectedTileId,
        currentPrice,
        currentPopulation,
        changeReason: changeReason || 'Admin updated tile state',
      };

      const updatedState = await AdminTileStateService.updateTileState(config);
      onTileStateUpdate(selectedTileId, updatedState);
      
      // Reset form
      setChangeReason('');
      setValidationErrors([]);
      
    } catch (error) {
      console.error('Failed to update tile state:', error);
      setValidationErrors(['Failed to save tile state. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (!activity || selectedTiles.length === 0 || !onBulkUpdate) {
      return;
    }

    const updates: TileStateConfig[] = selectedTiles.map(tileId => ({
      activityId: activity.id,
      tileId,
      currentPrice,
      currentPopulation,
      changeReason: changeReason || 'Bulk admin update',
    }));

    onBulkUpdate(updates);
    setSelectedTiles([]);
    setBulkEditMode(false);
  };

  // Reset to template defaults
  const handleResetToDefaults = () => {
    if (selectedTileState) {
      setCurrentPrice((selectedTileState.tile.initialGoldPrice || 0));
      setCurrentPopulation(selectedTileState.tile.initialPopulation);
      setChangeReason('Reset to template defaults');
    }
  };

  // Calculate value and changes
  const calculateMetrics = () => {
    if (!selectedTileState) return null;

    const currentValue = AdminTileStateService.calculateTileValue(currentPrice, currentPopulation);
    const originalValue = AdminTileStateService.calculateTileValue(
      (selectedTileState.tile.initialGoldPrice || 0),
      selectedTileState.tile.initialPopulation
    );
    
    const priceChange = currentPrice - (selectedTileState.tile.initialGoldPrice || 0);
    const populationChange = currentPopulation - selectedTileState.tile.initialPopulation;
    const valueChange = currentValue - originalValue;
    
    return {
      currentValue,
      originalValue,
      priceChange,
      populationChange,
      valueChange,
      priceChangePercent: (priceChange / (selectedTileState.tile.initialGoldPrice || 0)) * 100,
      populationChangePercent: selectedTileState.tile.initialPopulation > 0 
        ? (populationChange / selectedTileState.tile.initialPopulation) * 100 
        : 0,
    };
  };

  const metrics = calculateMetrics();

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ width: 400, height: 'fit-content' }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <HistoryIcon />
              <Typography variant="h6">
                {t('TILE_STATE_CONFIGURATION')}
              </Typography>
            </Box>
          }
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={bulkEditMode}
                  onChange={(e) => setBulkEditMode(e.target.checked)}
                  size="small"
                />
              }
              label={t('BULK_EDIT')}
              componentsProps={{ typography: { variant: 'caption' } }}
            />
          }
        />
        
        <CardContent>
          <Stack spacing={3}>
            {/* Activity Info */}
            {activity && (
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  {t('MANAGING_ACTIVITY')}: <strong>{activity.name}</strong>
                </Typography>
              </Alert>
            )}

            {/* No Tile Selected */}
            {!selectedTileId && (
              <Alert severity="info">
                {t('SELECT_TILE_TO_CONFIGURE_STATE')}
              </Alert>
            )}

            {/* Loading */}
            {isLoading && <LinearProgress />}

            {/* Tile State Configuration */}
            {selectedTileState && (
              <>
                {/* Tile Info */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('TILE_INFORMATION')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('COORDINATES')}
                        </Typography>
                        <Typography variant="body2">
                          Q: {selectedTileState.tile.axialQ}, R: {selectedTileState.tile.axialR}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('LAND_TYPE')}
                        </Typography>
                        <Typography variant="body2">
                          {selectedTileState.tile.landType}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                {/* Current Values */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('CURRENT_VALUES')}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label={t('CURRENT_PRICE')}
                      type="number"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <AttachMoneyIcon />,
                      }}
                      error={validationErrors.some(e => e.includes('price'))}
                      size="small"
                      fullWidth
                    />
                    
                    <TextField
                      label={t('CURRENT_POPULATION')}
                      type="number"
                      value={currentPopulation}
                      onChange={(e) => setCurrentPopulation(parseInt(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <PeopleIcon />,
                      }}
                      error={validationErrors.some(e => e.includes('population'))}
                      size="small"
                      fullWidth
                    />
                    
                    <TextField
                      label={t('CHANGE_REASON')}
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder={t('DESCRIBE_REASON_FOR_CHANGE')}
                      multiline
                      rows={2}
                      error={validationErrors.some(e => e.includes('reason'))}
                      size="small"
                      fullWidth
                    />
                  </Stack>
                </Box>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert severity="error">
                    <Typography variant="body2">
                      {validationErrors.join(', ')}
                    </Typography>
                  </Alert>
                )}

                {/* Metrics and Comparison */}
                {metrics && showComparison && (
                  <Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle2">
                        {t('COMPARISON_WITH_DEFAULTS')}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShowComparison(!showComparison)}
                      >
                        {showComparison ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    
                    <Collapse in={showComparison}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('PRICE_CHANGE')}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              {metrics.priceChange > 0 ? (
                                <TrendingUpIcon color="success" fontSize="small" />
                              ) : metrics.priceChange < 0 ? (
                                <TrendingDownIcon color="error" fontSize="small" />
                              ) : null}
                              <Typography variant="body2">
                                {metrics.priceChange > 0 ? '+' : ''}${metrics.priceChange.toFixed(2)}
                                {metrics.priceChangePercent !== 0 && (
                                  <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                                    ({metrics.priceChangePercent > 0 ? '+' : ''}{metrics.priceChangePercent.toFixed(1)}%)
                                  </Typography>
                                )}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('POPULATION_CHANGE')}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              {metrics.populationChange > 0 ? (
                                <TrendingUpIcon color="success" fontSize="small" />
                              ) : metrics.populationChange < 0 ? (
                                <TrendingDownIcon color="error" fontSize="small" />
                              ) : null}
                              <Typography variant="body2">
                                {metrics.populationChange > 0 ? '+' : ''}{metrics.populationChange}
                                {metrics.populationChangePercent !== 0 && (
                                  <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                                    ({metrics.populationChangePercent > 0 ? '+' : ''}{metrics.populationChangePercent.toFixed(1)}%)
                                  </Typography>
                                )}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('TOTAL_VALUE_CHANGE')}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              ${metrics.currentValue.toFixed(2)} 
                              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                                (was ${metrics.originalValue.toFixed(2)})
                              </Typography>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Collapse>
                  </Box>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<UndoIcon />}
                    onClick={handleResetToDefaults}
                    disabled={isSaving}
                    size="small"
                  >
                    {t('RESET')}
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={bulkEditMode ? handleBulkUpdate : handleSaveTileState}
                    disabled={isSaving || validationErrors.length > 0 || !changeReason.trim()}
                    size="small"
                    fullWidth
                  >
                    {isSaving ? t('SAVING') : bulkEditMode ? t('BULK_UPDATE') : t('SAVE')}
                  </Button>
                </Stack>

                {/* Change History */}
                <Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2">
                      {t('CHANGE_HISTORY')}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  
                  <Collapse in={showHistory}>
                    <Paper variant="outlined">
                      {selectedTileState.changedAt ? (
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary={selectedTileState.changeReason}
                              secondary={`${t('BY')} ${selectedTileState.updatedBy} • ${new Date(selectedTileState.changedAt).toLocaleString()}`}
                            />
                            <Box>
                              <Typography variant="caption" display="block">
                                ${selectedTileState.previousPrice} → ${selectedTileState.newPrice}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {selectedTileState.previousPopulation} → {selectedTileState.newPopulation} {t('POPULATION')}
                              </Typography>
                            </Box>
                          </ListItem>
                        </List>
                      ) : (
                        <Box p={2} textAlign="center">
                          <Typography variant="body2" color="text.secondary">
                            {t('NO_CHANGES_YET')}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Collapse>
                </Box>
              </>
            )}

            {/* Bulk Edit Info */}
            {bulkEditMode && (
              <Alert severity="info">
                <Typography variant="body2">
                  {t('BULK_EDIT_MODE_DESCRIPTION')}
                </Typography>
                {selectedTiles.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {t('SELECTED_TILES_COUNT', { count: selectedTiles.length })}
                  </Typography>
                )}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityTileStatePanel; 