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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

import { MapTemplate, MapTile, UpdateTileDto, MapConfigurationPanelProps } from '../types';
import HexagonalMapAdmin from '../components/HexagonalMapAdmin';
import TileConfigurationPanel from './TileConfigurationPanel';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface MapConfigurationInterfaceProps {
  template: MapTemplate;
  tiles: MapTile[];
  onTemplateUpdate: (templateId: number, updates: any) => void;
  onTileUpdate: (tileId: number, updates: UpdateTileDto) => void;
  onTileBatchUpdate?: (tileIds: number[], updates: UpdateTileDto) => void;
  onTemplateRefresh?: () => void;
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
  onTemplateRefresh,
  onSave,
  isLoading = false,
  readOnly = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('map');

  // State management
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [configurationMode, setConfigurationMode] = useState(true);
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
  const handleTileClick = useCallback((tileId: number) => {
    if (configurationMode) {
      setSelectedTileId(tileId);
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

          <HexagonalMapAdmin
            tiles={tiles}
            onTileClick={handleTileClick}
            configurationMode={configurationMode}
            selectedTileId={selectedTileId}
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
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* Toggle between basic and advanced panels */}
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Panel Header */}
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ textAlign: 'center' }}>
                Basic Config
              </Typography>
            </Box>

            {/* Panel Content */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <TileConfigurationPanel
                selectedTile={selectedTile}
                tiles={tiles}
                templateId={template.id}
                onTileUpdate={handleTileUpdate}
                onBatchUpdate={onTileBatchUpdate ? handleBatchUpdate : undefined}
                onTemplateRefresh={onTemplateRefresh}
                isLoading={isLoading}
                readOnly={readOnly}
              />
            </Box>
          </Box>
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