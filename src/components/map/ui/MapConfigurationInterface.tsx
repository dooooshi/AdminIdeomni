/**
 * MapConfigurationInterface Component - Complete visual configuration system
 * 
 * Features:
 * - Interactive map with configuration mode
 * - Side-by-side tile configuration panel
 * - Template management toolbar
 * - Real-time statistics display
 * - Batch editing capabilities
 * - Save/load functionality
 * - Responsive layout
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Drawer,
  Alert,
  Snackbar,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

import { MapTemplate, MapTile, UpdateTileDto, MapConfigurationPanelProps } from '../types';
import HexagonalMap from '../components/HexagonalMap';
import TileConfigurationPanel from './TileConfigurationPanel';
import MapStatistics from './MapStatistics';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface MapConfigurationInterfaceProps {
  template: MapTemplate;
  tiles: MapTile[];
  onTemplateUpdate: (templateId: number, updates: any) => void;
  onTileUpdate: (tileId: number, updates: UpdateTileDto) => void;
  onTileBatchUpdate?: (tileIds: number[], updates: UpdateTileDto) => void;
  onSave: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const MapConfigurationInterface: React.FC<MapConfigurationInterfaceProps> = ({
  template,
  tiles,
  onTemplateUpdate,
  onTileUpdate,
  onTileBatchUpdate,
  onSave,
  isLoading = false,
  readOnly = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('map');

  // State management
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [configurationMode, setConfigurationMode] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Get selected tile
  const selectedTile = selectedTileId ? tiles.find(tile => tile.id === selectedTileId) || null : null;

  // Handle tile selection
  const handleTileClick = useCallback((tile: MapTile) => {
    if (configurationMode) {
      setSelectedTileId(tile.id);
    }
  }, [configurationMode]);

  // Handle tile updates
  const handleTileUpdate = useCallback(async (tileId: number, updates: UpdateTileDto) => {
    try {
      await onTileUpdate(tileId, updates);
      setHasUnsavedChanges(true);
      setNotification({
        open: true,
        message: t('TILE_UPDATED_SUCCESS'),
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: t('TILE_UPDATE_ERROR'),
        severity: 'error',
      });
    }
  }, [onTileUpdate, t]);

  // Handle batch tile updates
  const handleBatchUpdate = useCallback(async (tileIds: number[], updates: UpdateTileDto) => {
    if (!onTileBatchUpdate) return;

    try {
      await onTileBatchUpdate(tileIds, updates);
      setHasUnsavedChanges(true);
      setNotification({
        open: true,
        message: t('BATCH_UPDATE_SUCCESS', { count: tileIds.length }),
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: t('BATCH_UPDATE_ERROR'),
        severity: 'error',
      });
    }
  }, [onTileBatchUpdate, t]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await onSave();
      setHasUnsavedChanges(false);
      setNotification({
        open: true,
        message: t('TEMPLATE_SAVED_SUCCESS'),
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: t('TEMPLATE_SAVE_ERROR'),
        severity: 'error',
      });
    }
  }, [onSave, t]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Calculate statistics
  const statistics = React.useMemo(() => {
    const landTypeCounts = tiles.reduce((acc, tile) => {
      acc[tile.landType] = (acc[tile.landType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const economicStats = tiles.reduce((acc, tile) => {
      if (tile.initialPrice) {
        acc.totalValue += tile.initialPrice * (tile.initialPopulation || 0);
        acc.averagePrice += tile.initialPrice;
        acc.priceCount++;
      }
      if (tile.initialPopulation) {
        acc.totalPopulation += tile.initialPopulation;
        acc.populationCount++;
      }
      return acc;
    }, {
      totalValue: 0,
      totalPopulation: 0,
      averagePrice: 0,
      priceCount: 0,
      populationCount: 0,
    });

    if (economicStats.priceCount > 0) {
      economicStats.averagePrice /= economicStats.priceCount;
    }

    return {
      totalTiles: tiles.length,
      landTypeDistribution: landTypeCounts,
      economicSummary: economicStats,
    };
  }, [tiles]);

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const drawerWidth = showConfigPanel ? 400 : 0;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Toolbar */}
      <Paper elevation={1} sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <MapIcon />
            <Typography variant="h6" noWrap>
              {template.name}
            </Typography>
            <Chip 
              label={template.isDefault ? t('DEFAULT_TEMPLATE') : t('CUSTOM_TEMPLATE')}
              size="small"
              color={template.isDefault ? 'primary' : 'default'}
              variant="outlined"
            />
            {hasUnsavedChanges && (
              <Chip 
                label={t('UNSAVED_CHANGES')}
                size="small"
                color="warning"
                variant="filled"
              />
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Configuration Mode Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={configurationMode}
                  onChange={(e) => setConfigurationMode(e.target.checked)}
                  disabled={readOnly}
                  size="small"
                />
              }
              label={t('CONFIG_MODE')}
              labelPlacement="start"
            />

            <Divider orientation="vertical" flexItem />

            {/* View Controls */}
            <Tooltip title={showStatistics ? t('HIDE_STATISTICS') : t('SHOW_STATISTICS')}>
              <IconButton 
                onClick={() => setShowStatistics(!showStatistics)}
                color={showStatistics ? 'primary' : 'default'}
              >
                <TrendingUpIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={showConfigPanel ? t('HIDE_CONFIG_PANEL') : t('SHOW_CONFIG_PANEL')}>
              <IconButton 
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                color={showConfigPanel ? 'primary' : 'default'}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? t('EXIT_FULLSCREEN') : t('ENTER_FULLSCREEN')}>
              <IconButton onClick={toggleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            {/* Action Buttons */}
            <Tooltip title={t('REFRESH')}>
              <IconButton disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {!readOnly && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isLoading || !hasUnsavedChanges}
              >
                {t('SAVE')}
              </Button>
            )}
          </Stack>
        </Toolbar>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Statistics Panel */}
        <AnimatePresence>
          {showStatistics && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <Paper 
                sx={{ 
                  width: 320, 
                  height: '100%', 
                  overflowY: 'auto',
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <Box p={2}>
                  <Typography variant="h6" gutterBottom>
                    {t('TEMPLATE_STATISTICS')}
                  </Typography>
                  
                  {/* Basic Stats */}
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('BASIC_STATISTICS')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {t('TOTAL_TILES')}
                          </Typography>
                          <Typography variant="h6">
                            {statistics.totalTiles}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {t('TOTAL_VALUE')}
                          </Typography>
                          <Typography variant="h6">
                            {MapTemplateService.formatEconomicValue(statistics.economicSummary.totalValue)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {t('TOTAL_POPULATION')}
                          </Typography>
                          <Typography variant="h6">
                            {MapTemplateService.formatPopulation(statistics.economicSummary.totalPopulation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {t('AVG_PRICE')}
                          </Typography>
                          <Typography variant="h6">
                            {MapTemplateService.formatEconomicValue(statistics.economicSummary.averagePrice)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Land Distribution */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('LAND_DISTRIBUTION')}
                      </Typography>
                      <Stack spacing={1}>
                        {Object.entries(statistics.landTypeDistribution).map(([landType, count]) => (
                          <Box key={landType} display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: 
                                    landType === 'MARINE' ? theme.palette.info.main :
                                    landType === 'COASTAL' ? theme.palette.warning.main :
                                    theme.palette.success.main,
                                }}
                              />
                              <Typography variant="body2">
                                {t(`TERRAIN_${landType}`)}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${count} (${Math.round((count / statistics.totalTiles) * 100)}%)`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Container */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {configurationMode && !selectedTile && (
            <Alert 
              severity="info" 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                right: showConfigPanel ? drawerWidth + 16 : 16,
                zIndex: 1000 
              }}
            >
              {t('CONFIG_MODE_HELP_TEXT')}
            </Alert>
          )}

          <HexagonalMap
            tiles={tiles}
            onTileClick={handleTileClick}
            configurationMode={configurationMode}
            selectedTileId={selectedTileId}
            showConfiguration={true}
          />
        </Box>

        {/* Configuration Panel Drawer */}
        <Drawer
          anchor="right"
          variant="persistent"
          open={showConfigPanel}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              position: 'relative',
              height: '100%',
            },
          }}
        >
          <TileConfigurationPanel
            selectedTile={selectedTile}
            tiles={tiles}
            onTileUpdate={handleTileUpdate}
            onBatchUpdate={onTileBatchUpdate ? handleBatchUpdate : undefined}
            isLoading={isLoading}
            readOnly={readOnly}
          />
        </Drawer>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MapConfigurationInterface; 