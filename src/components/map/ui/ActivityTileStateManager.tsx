/**
 * ActivityTileStateManager Component - Manage dynamic tile states for activities
 * 
 * Features:
 * - Initialize tile states for activities
 * - Bulk update tile states during simulations
 * - Reset tile states to template defaults
 * - Activity-specific tile statistics
 * - Real-time market simulation controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Money as MoneyIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

import { 
  ActivityTileState, 
  TileStatistics, 
  BulkUpdateTileStatesDto,
  MarketSimulationEvent 
} from '../types';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface ActivityTileStateManagerProps {
  activityId: string | null;
  templateId: number | null;
  selectedTileId: number | null;
  onTileStateUpdate: (tileId: number, newState: Partial<ActivityTileState>) => void;
  onBulkStateUpdate: (updates: BulkUpdateTileStatesDto) => void;
  onStatisticsUpdate: (stats: TileStatistics) => void;
  isVisible: boolean;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  effects: {
    landType?: string;
    priceMultiplier: number;
    populationMultiplier: number;
    changeReason: string;
  }[];
}

const simulationScenarios: SimulationScenario[] = [
  {
    id: 'economic_boom',
    name: 'Economic Boom',
    description: 'Economic growth affects all land types positively',
    effects: [
      {
        priceMultiplier: 1.25,
        populationMultiplier: 1.15,
        changeReason: 'Economic boom increased property values and population'
      }
    ]
  },
  {
    id: 'coastal_development',
    name: 'Coastal Development',
    description: 'Infrastructure development boosts coastal areas',
    effects: [
      {
        landType: 'COASTAL',
        priceMultiplier: 1.35,
        populationMultiplier: 1.25,
        changeReason: 'Coastal development project increased property values'
      }
    ]
  },
  {
    id: 'market_correction',
    name: 'Market Correction',
    description: 'Market downturn affects prices negatively',
    effects: [
      {
        priceMultiplier: 0.85,
        populationMultiplier: 0.95,
        changeReason: 'Market correction reduced property values'
      }
    ]
  },
  {
    id: 'infrastructure_upgrade',
    name: 'Infrastructure Upgrade',
    description: 'Transportation improvements benefit plain areas',
    effects: [
      {
        landType: 'PLAIN',
        priceMultiplier: 1.20,
        populationMultiplier: 1.30,
        changeReason: 'Infrastructure upgrade improved accessibility'
      }
    ]
  }
];

const ActivityTileStateManager: React.FC<ActivityTileStateManagerProps> = ({
  activityId,
  templateId,
  selectedTileId,
  onTileStateUpdate,
  onBulkStateUpdate,
  onStatisticsUpdate,
  isVisible,
}) => {
  const { t } = useTranslation('map');
  const [tileStates, setTileStates] = useState<ActivityTileState[]>([]);
  const [statistics, setStatistics] = useState<TileStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [simulationDialogOpen, setSimulationDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [customChangeReason, setCustomChangeReason] = useState('');
  const [autoUpdateStats, setAutoUpdateStats] = useState(true);

  // Load activity tile states
  const loadActivityTileStates = useCallback(async () => {
    if (!activityId) return;

    setIsLoading(true);
    try {
      const states = await MapTemplateService.getActivityTileStates(activityId);
      setTileStates(states);
      setIsInitialized(states.length > 0);

      if (autoUpdateStats) {
        const stats = await MapTemplateService.getActivityTileStatistics(activityId);
        setStatistics(stats);
        onStatisticsUpdate(stats);
      }
    } catch (error) {
      console.error('Failed to load activity tile states:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activityId, autoUpdateStats, onStatisticsUpdate]);

  // Initialize tile states for activity
  const handleInitializeTileStates = async () => {
    if (!activityId || !templateId) return;

    setIsLoading(true);
    try {
      await MapTemplateService.initializeActivityTileStates(activityId);
      await loadActivityTileStates();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize tile states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset tile states to template defaults
  const handleResetTileStates = async () => {
    if (!activityId) return;

    setIsLoading(true);
    try {
      await MapTemplateService.resetActivityTileStates(activityId);
      await loadActivityTileStates();
    } catch (error) {
      console.error('Failed to reset tile states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run simulation scenario
  const handleRunSimulation = async () => {
    if (!activityId || !selectedScenario) return;

    const scenario = simulationScenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    setIsLoading(true);
    try {
      // Prepare bulk updates based on scenario
      const updates = tileStates
        .filter(state => {
          // Apply to all tiles or specific land type
          const effect = scenario.effects[0];
          return !effect.landType || state.tile?.landType === effect.landType;
        })
        .map(state => {
          const effect = scenario.effects[0];
          return {
            tileId: state.tileId,
            currentPrice: Math.round(state.currentPrice * effect.priceMultiplier * 100) / 100,
            currentPopulation: Math.floor(state.currentPopulation * effect.populationMultiplier),
            changeReason: customChangeReason || effect.changeReason,
          };
        });

      const bulkUpdate: BulkUpdateTileStatesDto = {
        updates,
        globalChangeReason: `${scenario.name} simulation event`,
        updatedBy: 'admin', // In real app, get from auth context
      };

      await MapTemplateService.bulkUpdateActivityTileStates(activityId, bulkUpdate);
      await loadActivityTileStates();
      onBulkStateUpdate(bulkUpdate);
      
      setSimulationDialogOpen(false);
      setSelectedScenario('');
      setCustomChangeReason('');
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected tile state
  const selectedTileState = selectedTileId 
    ? tileStates.find(state => state.tileId === selectedTileId)
    : null;

  // Update individual tile state
  const handleUpdateTileState = async (newValues: Partial<ActivityTileState>) => {
    if (!activityId || !selectedTileId) return;

    try {
      await MapTemplateService.updateActivityTileState(
        activityId, 
        selectedTileId, 
        {
          ...newValues,
          changeReason: newValues.changeReason || 'Manual update via admin interface',
        }
      );
      
      await loadActivityTileStates();
      onTileStateUpdate(selectedTileId, newValues);
    } catch (error) {
      console.error('Failed to update tile state:', error);
    }
  };

  useEffect(() => {
    if (activityId) {
      loadActivityTileStates();
    }
  }, [activityId, loadActivityTileStates]);

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
              <TimelineIcon />
              <Typography variant="h6">
                {t('ACTIVITY_TILE_STATES')}
              </Typography>
            </Box>
          }
          action={
            <Tooltip title={t('REFRESH_STATES')}>
              <IconButton 
                onClick={loadActivityTileStates}
                disabled={!activityId || isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        
        <CardContent>
          <Stack spacing={3}>
            {/* Activity Status */}
            {!activityId ? (
              <Alert severity="info">
                {t('SELECT_ACTIVITY_TO_MANAGE_STATES')}
              </Alert>
            ) : !isInitialized ? (
              <Alert 
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleInitializeTileStates}
                    disabled={isLoading}
                  >
                    {t('INITIALIZE')}
                  </Button>
                }
              >
                {t('ACTIVITY_STATES_NOT_INITIALIZED')}
              </Alert>
            ) : (
              <Alert severity="success">
                {t('ACTIVITY_STATES_READY', { count: tileStates.length })}
              </Alert>
            )}

            {/* Loading Progress */}
            {isLoading && <LinearProgress />}

            {/* Quick Statistics */}
            {statistics && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('QUICK_STATISTICS')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {t('AVG_PRICE')}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ${statistics.averagePrice?.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {t('TOTAL_POPULATION')}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {statistics.totalPopulation?.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Selected Tile State */}
            {selectedTileState && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('SELECTED_TILE_STATE')}
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label={t('CURRENT_PRICE')}
                    type="number"
                    value={selectedTileState.currentPrice}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value);
                      if (!isNaN(newPrice)) {
                        handleUpdateTileState({ currentPrice: newPrice });
                      }
                    }}
                    InputProps={{
                      startAdornment: '$',
                    }}
                    size="small"
                  />
                  <TextField
                    label={t('CURRENT_POPULATION')}
                    type="number"
                    value={selectedTileState.currentPopulation}
                    onChange={(e) => {
                      const newPopulation = parseInt(e.target.value);
                      if (!isNaN(newPopulation)) {
                        handleUpdateTileState({ currentPopulation: newPopulation });
                      }
                    }}
                    size="small"
                  />
                  {selectedTileState.lastUpdated && (
                    <Typography variant="caption" color="textSecondary">
                      {t('LAST_UPDATED')}: {new Date(selectedTileState.lastUpdated).toLocaleString()}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}

            <Divider />

            {/* Simulation Controls */}
            {isInitialized && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('SIMULATION_CONTROLS')}
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => setSimulationDialogOpen(true)}
                    disabled={isLoading}
                    fullWidth
                  >
                    {t('RUN_SIMULATION')}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleResetTileStates}
                    disabled={isLoading}
                    fullWidth
                  >
                    {t('RESET_TO_TEMPLATE')}
                  </Button>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoUpdateStats}
                        onChange={(e) => setAutoUpdateStats(e.target.checked)}
                      />
                    }
                    label={t('AUTO_UPDATE_STATISTICS')}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Simulation Dialog */}
      <Dialog
        open={simulationDialogOpen}
        onClose={() => setSimulationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AnalyticsIcon />
            <Typography variant="h6">
              {t('RUN_MARKET_SIMULATION')}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>{t('SIMULATION_SCENARIO')}</InputLabel>
              <Select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                label={t('SIMULATION_SCENARIO')}
              >
                {simulationScenarios.map((scenario) => (
                  <MenuItem key={scenario.id} value={scenario.id}>
                    <Box>
                      <Typography variant="body1">
                        {scenario.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {scenario.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('CUSTOM_CHANGE_REASON')}
              value={customChangeReason}
              onChange={(e) => setCustomChangeReason(e.target.value)}
              placeholder={t('OPTIONAL_CUSTOM_REASON')}
              multiline
              rows={2}
              fullWidth
            />

            {selectedScenario && (
              <Alert severity="info">
                <Typography variant="body2">
                  {simulationScenarios.find(s => s.id === selectedScenario)?.description}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSimulationDialogOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button
            variant="contained"
            onClick={handleRunSimulation}
            disabled={!selectedScenario || isLoading}
            startIcon={<PlayArrowIcon />}
          >
            {t('RUN_SIMULATION')}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default ActivityTileStateManager; 