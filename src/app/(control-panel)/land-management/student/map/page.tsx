'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useCache } from '@/hooks/useCache';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetZoomIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountBalance as AccountBalanceIcon,
  Landscape as LandscapeIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Animation as AnimationIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import HexagonalMap from '@/components/map/components/HexagonalMap';
import { HexagonalMapRef } from '@/components/map/types';
import LandService from '@/lib/services/landService';
import TouchGestureHandler from '@/components/land/TouchGestureHandler';
import MobileBottomNavigation from '@/components/land/MobileBottomNavigation';
import {
  AvailableTile,
  TileDetailsWithOwnership,
  TeamLandSummary,
  LandPurchaseRequest,
  PurchaseValidation,
} from '@/types/land';
import { useTranslation, useLandTranslation } from '@/lib/i18n/hooks/useTranslation';

const MapContainer = styled(Paper)(({ theme }) => ({
  height: '1000px',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 1000,
  maxWidth: '300px',
}));





interface StudentLandMapPageProps {}

const StudentLandMapPage: React.FC<StudentLandMapPageProps> = () => {
  const theme = useTheme();
  const { t } = useLandTranslation();
  const { t: tNav } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const mapRef = useRef<HexagonalMapRef>(null);
  
  // Cached data hooks
  const {
    data: tilesData,
    loading: tilesLoading,
    error: tilesError,
    refresh: refreshTiles,
    isStale: tilesStale
  } = useCache({
    key: 'land-all-tiles',
    fetcher: async () => {
      try {
        // Try to get all tiles first, fall back to available tiles
        const result = await LandService.getAllTiles?.() || await LandService.getAvailableTiles();
        return result.data;
      } catch (error) {
        // If getAllTiles doesn't exist, use getAvailableTiles
        const result = await LandService.getAvailableTiles();
        return result.data;
      }
    },
    ttl: 2 * 60 * 1000, // 2 minutes
    staleWhileRevalidate: true,
    enabled: true
  });

  // Ensure tiles is always an array
  const tiles = useMemo(() => {
    return Array.isArray(tilesData) ? tilesData : [];
  }, [tilesData]);

  const {
    data: teamSummary,
    loading: teamSummaryLoading,
    error: teamSummaryError,
    refresh: refreshTeamSummary,
    isStale: teamSummaryStale
  } = useCache({
    key: 'team-land-summary',
    fetcher: () => LandService.getTeamLandOwnership(),
    ttl: 1 * 60 * 1000, // 1 minute
    staleWhileRevalidate: true,
    enabled: true
  });

  // Derived state
  const loading = tilesLoading || teamSummaryLoading;
  const error = tilesError || teamSummaryError;
  const isStale = tilesStale || teamSummaryStale;

  // Local state management
  const [selectedTile, setSelectedTile] = useState<AvailableTile | null>(null);  
  const [localError, setLocalError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  
  // Purchase dialog state
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  
  
  
  const [purchaseArea, setPurchaseArea] = useState(1);
  const [description, setDescription] = useState('');
  const [purchaseValidation, setPurchaseValidation] = useState<PurchaseValidation | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  
  


  
  
  // Mobile state
  const [mobileBottomTab, setMobileBottomTab] = useState(0);

  // Define zoom and refresh handlers before they're used
  const handleRefresh = useCallback(() => {
    loadMapData();
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleResetZoom = useCallback(() => {
    mapRef.current?.resetZoom();
  }, []);

  const handleToggleAnimations = useCallback(() => {
    setAnimationsEnabled(prev => !prev);
  }, []);

  // Keyboard shortcuts for map navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target && (event.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/)) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case '=':
        case '+':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          handleResetZoom();
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleRefresh();
          }
          break;
        case 'escape':
          event.preventDefault();
          if (purchaseDialogOpen) {
            setPurchaseDialogOpen(false);
          }
          setSelectedTile(null);
          break;
        case 'enter':
          if (selectedTile && selectedTile.canPurchase && !purchaseDialogOpen) {
            event.preventDefault();
            setPurchaseArea(1);
            setDescription(`Purchase land on ${LandService.formatLandType(selectedTile.landType)} tile ${selectedTile.tileId}`);
            setPurchaseDialogOpen(true);
          }
          break;
        case '?':
          event.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedTile, purchaseDialogOpen, handleZoomIn, handleZoomOut, handleResetZoom, handleRefresh]);

  // Update purchase validation when area changes
  useEffect(() => {
    if (selectedTile && purchaseArea > 0) {
      // NEW: Validate integer input on frontend
      const validationErrors = LandService.validatePurchaseInput(purchaseArea);
      if (validationErrors.length > 0) {
        console.warn('Invalid Area Input:', validationErrors.join(', '));
        return;
      }
      validatePurchase();
    }
  }, [selectedTile, purchaseArea]);

  const loadMapData = async () => {
    try {
      setLocalError(null);
      
      // Refresh both cached data sources
      await Promise.all([
        refreshTiles(),
        refreshTeamSummary()
      ]);
      
      // DEBUG: Log team summary to understand team status
      console.log('🏃‍♂️ Team Summary Status:', teamSummary);
      
      // Diagnostic information
      if (teamSummary) {
        console.log('💰 Team Resources:', {
          goldSpent: teamSummary.totalGoldSpent,
          carbonSpent: teamSummary.totalCarbonSpent,
          totalSpent: teamSummary.totalSpent,
          totalPurchases: teamSummary.totalPurchases,
          ownedArea: teamSummary.totalOwnedArea
        });
      } else {
        console.warn('⚠️ No team summary available - this might indicate user is not on a team');
      }
      
    } catch (err: any) {
      console.error('Failed to load land map data:', err);
      const errorMessage = LandService.getErrorMessage(err);
      setLocalError(errorMessage);
    }
  };

  const validatePurchase = async () => {
    if (!selectedTile) return;

    try {
      const validation = await LandService.validatePurchase(selectedTile.tileId, purchaseArea);
      
      if (validation.errors && validation.errors.length > 0) {
        console.error('❌ Purchase Validation Errors:', validation.errors);
      }
      
      // Ensure all cost values are numbers to prevent NaN display
      const sanitizedValidation: PurchaseValidation = {
        ...validation,
        goldCost: typeof validation.goldCost === 'number' && !isNaN(validation.goldCost) ? validation.goldCost : 0,
        carbonCost: typeof validation.carbonCost === 'number' && !isNaN(validation.carbonCost) ? validation.carbonCost : 0,
        totalCost: typeof validation.totalCost === 'number' && !isNaN(validation.totalCost) ? validation.totalCost : 0,
        availableArea: typeof validation.availableArea === 'number' && !isNaN(validation.availableArea) ? validation.availableArea : 0,
        teamGoldBalance: typeof validation.teamGoldBalance === 'number' && !isNaN(validation.teamGoldBalance) ? validation.teamGoldBalance : 0,
        teamCarbonBalance: typeof validation.teamCarbonBalance === 'number' && !isNaN(validation.teamCarbonBalance) ? validation.teamCarbonBalance : 0,
        canPurchase: !!validation.canPurchase,
        errors: validation.errors || []
      };
      
      console.log('🔍 Purchase Validation Debug:', {
        rawValidation: validation,
        sanitizedCanPurchase: sanitizedValidation.canPurchase,
        rawCanPurchase: validation.canPurchase,
        canPurchaseType: typeof validation.canPurchase,
        booleanConversion: !!validation.canPurchase,
        strictEqual: validation.canPurchase === true
      });
      
      // Show validation errors to user if any exist
      if (sanitizedValidation.errors.length > 0) {
        const errorMessage = sanitizedValidation.errors.join(', ');
        console.error('❌ Purchase blocked by validation errors:', errorMessage);
        
        // Provide more helpful error context
        console.warn('Purchase validation issues:', errorMessage);
      }
      
      setPurchaseValidation(sanitizedValidation);
      console.log('✅ Set purchaseValidation state:', sanitizedValidation);
    } catch (err: any) {
      console.error('Failed to validate purchase:', err);
      // Set a default validation object with zero values instead of null
      setPurchaseValidation({
        canPurchase: false,
        goldCost: 0,
        carbonCost: 0,
        totalCost: 0,
        availableArea: 0,
        teamGoldBalance: 0,
        teamCarbonBalance: 0,
        errors: ['Failed to validate purchase. Please try again.']
      });
    }
  };

  // Show all available tiles without filtering
  const filteredTiles = useMemo(() => {
    // Handle null/undefined tiles array
    if (!tiles || !Array.isArray(tiles)) {
      return [];
    }
    
    return tiles;
  }, [tiles]);

  const handleTileClick = useCallback(async (tileId: number) => {
    // Check if data is still loading
    if (!tiles || !Array.isArray(tiles) || tiles.length === 0) {
      console.warn('Tile data still loading, ignoring click on tileId:', tileId);
      return;
    }
    
    // Find the clicked tile
    let tile = filteredTiles.find(t => t.tileId === tileId);
    
    // Fallback to original tiles array if not found in filtered tiles
    if (!tile && tiles && Array.isArray(tiles)) {
      tile = tiles.find(t => t.tileId === tileId);
    }
    
    if (!tile) {
      console.error('❌ Tile not found for tileId:', tileId);
      return;
    }

    // Set selected tile
    setSelectedTile(tile);
    
    // Only open purchase modal if tile can be purchased
    if (tile.canPurchase) {
      setPurchaseArea(1);
      setDescription(`Purchase land on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
      setPurchaseDialogOpen(true);
    } else {
      // For non-purchasable tiles, just show selection without opening modal
      console.log(`Tile ${tile.tileId} selected but cannot be purchased`);
    }
  }, [filteredTiles, tiles]);



  const handlePurchaseConfirm = async () => {
    if (!selectedTile || !purchaseValidation?.canPurchase) return;

    try {
      setPurchasing(true);

      const purchaseRequest: LandPurchaseRequest = {
        tileId: selectedTile.tileId,
        area: purchaseArea,
        description: description || undefined,
      };


      const result = await LandService.purchaseLand(purchaseRequest);
      
      // Close dialog first for better UX
      setPurchaseDialogOpen(false);
      resetPurchaseForm();
      
      
      
      // Refresh data after successful purchase
      await loadMapData();
      
    } catch (err: any) {
      console.error('Purchase failed:', err);
      const errorMessage = LandService.getErrorMessage(err);
      setLocalError(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  const resetPurchaseForm = () => {
    setPurchaseArea(1);
    setDescription('');
    setPurchaseValidation(null);
  };





  
  
  
  // Touch gesture handlers
  const handlePinchZoom = useCallback((scale: number, center: { x: number; y: number }) => {
    if (scale > 1.1) {
      handleZoomIn();
    } else if (scale < 0.9) {
      handleZoomOut();
    }
  }, []);
  
  const handleSwipeGesture = useCallback((direction: 'left' | 'right' | 'up' | 'down', velocity: number) => {
    // Reserved for future use
  }, []);
  
  const handleTouchTap = useCallback((x: number, y: number) => {
    // Convert screen coordinates to map coordinates and handle tile selection
    // This would need integration with the HexagonalMap component
    console.log('Touch tap at:', x, y);
  }, []);
  
  const handleTouchLongPress = useCallback((x: number, y: number) => {
    // Show context menu or tile preview on long press
    console.log('Long press at:', x, y);
  }, []);
  
  // Mobile navigation handlers
  const handleMobileTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setMobileBottomTab(newValue);
    
    switch (newValue) {
      case 0: // Map
        // Focus on map
        break;
      case 1: // Reserved for future use
        break;
      case 2: // Reserved for future use
        break;
      case 3: // Reserved for future use
        break;
    }
  };

  // Memoized map tiles for performance optimization
  const mapTiles = useMemo(() => {
    return filteredTiles.map(tile => {
      const goldPrice = typeof tile.currentGoldPrice === 'number' && !isNaN(tile.currentGoldPrice) ? tile.currentGoldPrice : 0;
      const carbonPrice = typeof tile.currentCarbonPrice === 'number' && !isNaN(tile.currentCarbonPrice) ? tile.currentCarbonPrice : 0;
      
      return {
        id: tile.tileId,
        axialQ: tile.axialQ,
        axialR: tile.axialR,
        landType: tile.landType,
        currentGoldPrice: goldPrice,
        currentCarbonPrice: carbonPrice,
        currentPopulation: tile.currentPopulation ?? undefined, // Ensure null becomes undefined
        // Additional properties for visualization
        isOwned: (tile.teamOwnedArea || 0) > 0,
        availableArea: LandService.getEffectiveAvailableArea(tile), // NEW: Unlimited area
        canPurchase: tile.canPurchase,
        totalCost: goldPrice + carbonPrice,
      };
    });
  }, [filteredTiles]);

  // Memoized statistics for performance
  const mapStatistics = useMemo(() => {
    const availableCount = filteredTiles.filter(t => t.canPurchase).length;
    const ownedCount = filteredTiles.filter(t => t.teamOwnedArea > 0).length;
    
    return {
      total: filteredTiles.length,
      available: availableCount,
      owned: ownedCount
    };
  }, [filteredTiles]);



  const renderPurchaseModal = () => (
    <Dialog 
      open={purchaseDialogOpen} 
      onClose={() => setPurchaseDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {t('PURCHASE_DIALOG_TITLE', { tileId: selectedTile?.tileId })}
      </DialogTitle>
      
      <DialogContent>
        {selectedTile && (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Basic Tile Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('TILE_INFORMATION')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('LAND_TYPE')}
                    </Typography>
                    <Typography variant="body1">
                      {LandService.formatLandType(selectedTile.landType)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('YOUR_HOLDINGS')}
                    </Typography>
                    <Typography variant="body1">
                      {LandService.formatArea(selectedTile.teamOwnedArea || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Purchase Amount */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('PURCHASE_AMOUNT')}
                </Typography>
                <TextField
                  label={t('AMOUNT_UNITS')}
                  type="number"
                  fullWidth
                  value={Math.round(purchaseArea)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 1 && val <= 1000) {
                      setPurchaseArea(val);
                    }
                  }}
                  inputProps={{ min: 1, max: 1000, step: 1 }}
                  variant="outlined"
                  helperText={t('AMOUNT_HELPER_TEXT')}
                />
              </CardContent>
            </Card>

            {/* Cost Summary */}
            {purchaseValidation && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('INVESTMENT_ANALYSIS')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('GOLD_COST')}
                      </Typography>
                      <Typography variant="body1">
                        {LandService.formatCurrency(purchaseValidation.goldCost || 0, 'gold')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('CARBON_COST')}
                      </Typography>
                      <Typography variant="body1">
                        {LandService.formatCurrency(purchaseValidation.carbonCost || 0, 'carbon')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('TOTAL_INVESTMENT')}
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {LandService.formatCurrency(purchaseValidation.totalCost || 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {purchaseValidation.errors && purchaseValidation.errors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {purchaseValidation.errors.map((error, index) => (
                        <Typography key={index} variant="body2">
                          {error}
                        </Typography>
                      ))}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <TextField
              label={t('NOTES_OPTIONAL')}
              multiline
              rows={2}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('NOTES_PLACEHOLDER')}
              variant="outlined"
            />
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={() => setPurchaseDialogOpen(false)}
          variant="outlined"
        >
          {tCommon('CANCEL')}
        </Button>
        <Button
          variant="contained"
          onClick={handlePurchaseConfirm}
          disabled={!purchaseValidation?.canPurchase || purchasing}
          startIcon={purchasing ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
        >
          {purchasing ? t('PURCHASING') : t('PURCHASE_UNITS', { amount: Math.round(purchaseArea) })}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const displayError = error || localError;
  if (displayError) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={() => loadMapData()}>
          {tCommon('RETRY')}
        </Button>
      }>
        {LandService.getErrorMessage(displayError)}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      pb: { xs: 10, sm: 3 }, // Extra bottom padding for mobile to avoid FAB overlap
    }}>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={{ xs: 'h5', sm: 'h4' }} 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1976d2, #4caf50)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🌍 {t('STUDENT_MAP_VIEW')}
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {t('STUDENT_MAP_DESCRIPTION')}
        </Typography>
      </Box>

      


      {/* Interactive Map */}
      <MapContainer elevation={2}>
        {/* Map Controls */}
        <ControlsContainer>
          <Tooltip title={t('REFRESH_DATA')}>
            <IconButton 
              onClick={handleRefresh}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('ZOOM_IN')}>
            <IconButton 
              onClick={handleZoomIn}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('ZOOM_OUT')}>
            <IconButton 
              onClick={handleZoomOut}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('RESET_ZOOM')}>
            <IconButton 
              onClick={handleResetZoom}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <ResetZoomIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={animationsEnabled ? t('DISABLE_ANIMATIONS') : t('ENABLE_ANIMATIONS')}>
            <IconButton 
              onClick={handleToggleAnimations}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 },
                color: animationsEnabled ? 'primary.main' : 'text.secondary'
              }}
            >
              <AnimationIcon />
            </IconButton>
          </Tooltip>
          
        </ControlsContainer>


        {/* Hexagonal Map with Touch Gestures */}
        <TouchGestureHandler
          onPinchZoom={handlePinchZoom}
          onSwipe={handleSwipeGesture}
          onTap={handleTouchTap}
          onLongPress={handleTouchLongPress}
          disabled={purchaseDialogOpen}
        >
          <HexagonalMap
            ref={mapRef}
            tiles={mapTiles}
            width={800}
            height={600}
            onTileClick={handleTileClick}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            selectedTileId={selectedTile?.tileId}
            configurationMode={false}
            enableLandAnimations={animationsEnabled}
          />
        </TouchGestureHandler>

      </MapContainer>


      {/* Purchase Modal */}
      {renderPurchaseModal()}
      
      



      



      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        selectedTab={mobileBottomTab}
        onTabChange={handleMobileTabChange}
        onAIAssistantOpen={() => {}}
        onFiltersOpen={() => {}}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onRefresh={handleRefresh}
      />
    </Box>
  );
};

export default StudentLandMapPage;