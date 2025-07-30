'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useToast } from '@/components/common/ToastProvider';
import ToastProvider from '@/components/common/ToastProvider';
import { useCache } from '@/hooks/useCache';
import PurchaseSuccessAnimation from '@/components/common/PurchaseSuccessAnimation';
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
  FormControlLabel,
  Switch,
  Slider,
  Badge
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
  FilterList as FilterIcon,
  SelectAll as BulkSelectIcon,
  Clear as ClearIcon,
  GroupWork as BulkPurchaseIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import HexagonalMap from '@/components/map/components/HexagonalMap';
import { HexagonalMapRef } from '@/components/map/types';
import LandService from '@/lib/services/landService';
import TileContextMenu from '@/components/land/TileContextMenu';
import {
  AvailableTile,
  TileDetailsWithOwnership,
  TeamLandSummary,
  LandPurchaseRequest,
  PurchaseValidation,
  LandMapFilters
} from '@/types/land';

const MapContainer = styled(Paper)(({ theme }) => ({
  height: '600px',
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

const TileInfoPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  padding: theme.spacing(2),
  maxHeight: '200px',
  overflow: 'auto',
  borderRadius: theme.spacing(1),
}));

const PurchaseDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: '400px',
    maxWidth: '600px',
  },
}));

interface StudentLandMapPageProps {}

const StudentLandMapPage: React.FC<StudentLandMapPageProps> = () => {
  const theme = useTheme();
  const mapRef = useRef<HexagonalMapRef>(null);
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Cached data hooks
  const {
    data: tilesData,
    loading: tilesLoading,
    error: tilesError,
    refresh: refreshTiles,
    isStale: tilesStale
  } = useCache({
    key: 'land-available-tiles',
    fetcher: async () => {
      const result = await LandService.getAvailableTiles();
      return result.data;
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
  const [selectedTileDetails, setSelectedTileDetails] = useState<TileDetailsWithOwnership | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Purchase dialog state
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseArea, setPurchaseArea] = useState(1);
  const [maxGoldCost, setMaxGoldCost] = useState<number | undefined>();
  const [maxCarbonCost, setMaxCarbonCost] = useState<number | undefined>();
  const [description, setDescription] = useState('');
  const [enablePriceProtection, setEnablePriceProtection] = useState(false);
  const [purchaseValidation, setPurchaseValidation] = useState<PurchaseValidation | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LandMapFilters>({
    showOnlyAvailable: true,
  });
  
  // Bulk purchase state
  const [bulkPurchaseMode, setBulkPurchaseMode] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<Set<number>>(new Set());
  const [bulkPurchaseDialogOpen, setBulkPurchaseDialogOpen] = useState(false);
  const [bulkPurchaseArea, setBulkPurchaseArea] = useState(1);
  const [bulkPurchasing, setBulkPurchasing] = useState(false);

  // Animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [purchaseAnimationData, setPurchaseAnimationData] = useState<{
    tileId: number;
    area: number;
    cost: number;
    landType: string;
  } | null>(null);

  // Context menu state
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [contextMenuTile, setContextMenuTile] = useState<AvailableTile | null>(null);

  // Show stale data indicator
  useEffect(() => {
    if (isStale) {
      showInfo('Data may be outdated', 'Refreshing in background...');
    }
  }, [isStale, showInfo]);

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
          showInfo('Zoomed In', 'Use +/- keys or mouse wheel to zoom');
          break;
        case '-':
        case '_':
          event.preventDefault();
          handleZoomOut();
          showInfo('Zoomed Out', 'Use +/- keys or mouse wheel to zoom');
          break;
        case '0':
          event.preventDefault();
          handleResetZoom();
          showInfo('Zoom Reset', 'Map zoom reset to default level');
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleRefresh();
            showInfo('Refreshing Map Data', 'Loading latest land information...');
          }
          break;
        case 'escape':
          event.preventDefault();
          if (bulkPurchaseDialogOpen) {
            setBulkPurchaseDialogOpen(false);
            showInfo('Bulk Purchase Dialog Closed', '');
          } else if (purchaseDialogOpen) {
            setPurchaseDialogOpen(false);
            showInfo('Purchase Dialog Closed', '');
          } else if (bulkPurchaseMode) {
            setBulkPurchaseMode(false);
            setSelectedTiles(new Set());
            showInfo('Bulk Purchase Mode Deactivated', '');
          }
          setSelectedTile(null);
          break;
        case 'enter':
          if (selectedTile && selectedTile.canPurchase && !purchaseDialogOpen) {
            event.preventDefault();
            handlePurchaseClick();
          }
          break;
        case 'b':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleBulkPurchaseToggle();
          }
          break;
        case 'c':
          if (bulkPurchaseMode && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            clearSelectedTiles();
          }
          break;
        case '?':
          event.preventDefault();
          showInfo(
            'Keyboard Shortcuts',
            '+/- : Zoom in/out • 0: Reset zoom • Ctrl+R: Refresh • Enter: Purchase selected tile • Ctrl+B: Toggle bulk mode • Ctrl+C: Clear selection • Esc: Close dialogs'
          );
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedTile, purchaseDialogOpen, handleZoomIn, handleZoomOut, handleResetZoom, handleRefresh, handlePurchaseClick, showInfo]);

  // Update purchase validation when area changes
  useEffect(() => {
    if (selectedTile && purchaseArea > 0) {
      // NEW: Validate integer input on frontend
      const validationErrors = LandService.validatePurchaseInput(purchaseArea);
      if (validationErrors.length > 0) {
        showWarning('Invalid Area Input', validationErrors.join(', '));
        return;
      }
      validatePurchase();
    }
  }, [selectedTile, purchaseArea, showWarning]);

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
      showError('Failed to Load Map Data', errorMessage);
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
        if (sanitizedValidation.teamGoldBalance === 0 && sanitizedValidation.teamCarbonBalance === 0) {
          showError('No Team Resources', 'Your team has no gold or carbon balance. Please ensure you are part of an active team with resources.');
        } else if (sanitizedValidation.errors.some(err => err.includes('team') || err.includes('member'))) {
          showError('Team Membership Issue', `Team membership problem: ${errorMessage}`);
        } else if (sanitizedValidation.errors.some(err => err.includes('activity'))) {
          showError('Activity Enrollment Issue', `Activity enrollment problem: ${errorMessage}`);
        } else if (sanitizedValidation.errors.some(err => err.includes('pricing') || err.includes('price'))) {
          showError('Tile Pricing Issue', `Tile pricing problem: ${errorMessage}`);
        } else {
          showWarning('Purchase Validation Issues', `Cannot purchase: ${errorMessage}`);
        }
      }
      
      setPurchaseValidation(sanitizedValidation);
      console.log('✅ Set purchaseValidation state:', sanitizedValidation);
    } catch (err: any) {
      console.error('Failed to validate purchase:', err);
      showError('Validation Failed', LandService.getErrorMessage(err));
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

  const handleTileClick = useCallback(async (tileId: number) => {
    // Check if data is still loading
    if (!tiles || !Array.isArray(tiles) || tiles.length === 0) {
      console.warn('Tile data still loading, ignoring click on tileId:', tileId);
      return;
    }
    
    // FIXED: Search in filteredTiles first, fallback to original tiles array
    // Note: tileId parameter corresponds to MapTile.id which maps to AvailableTile.tileId
    let tile = filteredTiles.find(t => t.tileId === tileId);
    
    // Fallback to original tiles array if not found in filtered tiles
    // This handles race conditions where mapTiles and filteredTiles get out of sync
    if (!tile && tiles && Array.isArray(tiles)) {
      tile = tiles.find(t => t.tileId === tileId);
    }
    
    if (!tile) {
      console.error('❌ Tile not found for tileId:', tileId);
      console.error('Debug info:', {
        tileId,
        filteredTilesCount: filteredTiles?.length || 0,
        tilesCount: tiles?.length || 0,
        filteredTileIds: filteredTiles?.map(t => t.tileId) || [],
        allTileIds: tiles?.map(t => t.tileId) || []
      });
      return;
    }

    // Handle bulk selection mode
    if (bulkPurchaseMode) {
      const newSelectedTiles = new Set(selectedTiles);
      if (newSelectedTiles.has(tileId)) {
        newSelectedTiles.delete(tileId);
        showInfo('Tile Deselected', `Tile ${tileId} removed from bulk selection`);
      } else if (tile.canPurchase) {
        newSelectedTiles.add(tileId);
        showInfo('Tile Selected', `Tile ${tileId} added to bulk selection (${newSelectedTiles.size} total)`);
      } else {
        showWarning('Cannot Select Tile', `Tile ${tileId} is not available for purchase`);
        return;
      }
      setSelectedTiles(newSelectedTiles);
      return;
    }

    // Normal single tile selection
    setSelectedTile(tile);

    try {
      // Load detailed tile information
      const tileDetails = await LandService.getTileDetails(tileId);
      setSelectedTileDetails(tileDetails);
    } catch (err: any) {
      console.error('Failed to load tile details:', err);
    }
  }, [filteredTiles, bulkPurchaseMode, selectedTiles, showInfo, showWarning]);

  const handlePurchaseClick = () => {
    if (!selectedTile || !LandService.canPurchaseLand(selectedTile, purchaseArea)) return;
    
    setPurchaseDialogOpen(true);
    // NEW: Default to 1 unit (integer only), no area limitations
    setPurchaseArea(1);
    setDescription(`Purchase ${purchaseArea} area on ${LandService.formatLandType(selectedTile.landType)} tile ${selectedTile.tileId}`);
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedTile || !purchaseValidation?.canPurchase) return;

    try {
      setPurchasing(true);

      const purchaseRequest: LandPurchaseRequest = {
        tileId: selectedTile.tileId,
        area: purchaseArea,
        description: description || undefined,
      };

      if (enablePriceProtection) {
        if (maxGoldCost) purchaseRequest.maxGoldCost = maxGoldCost;
        if (maxCarbonCost) purchaseRequest.maxCarbonCost = maxCarbonCost;
      }

      const result = await LandService.purchaseLand(purchaseRequest);
      
      // Close dialog first for better UX
      setPurchaseDialogOpen(false);
      resetPurchaseForm();
      
      // Trigger success animation
      setPurchaseAnimationData({
        tileId: selectedTile.tileId,
        area: purchaseArea,
        cost: purchaseValidation.totalCost,
        landType: selectedTile.landType
      });
      setShowSuccessAnimation(true);
      
      // Show success notification with details (after a delay)
      setTimeout(() => {
        showSuccess(
          'Land Purchase Successful! 🎉',
          `Purchased ${LandService.formatArea(purchaseArea)} on ${LandService.formatLandType(selectedTile.landType)} tile ${selectedTile.tileId}. Total cost: ${LandService.formatCurrency(purchaseValidation.totalCost)}`
        );
      }, 1500);
      
      // Refresh data after successful purchase
      await loadMapData();
      
    } catch (err: any) {
      console.error('Purchase failed:', err);
      const errorMessage = LandService.getErrorMessage(err);
      showError(
        'Purchase Failed',
        errorMessage
      );
      setError(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  const resetPurchaseForm = () => {
    setPurchaseArea(1);
    setMaxGoldCost(undefined);
    setMaxCarbonCost(undefined);
    setDescription('');
    setEnablePriceProtection(false);
    setPurchaseValidation(null);
  };

  // Bulk purchase functions
  const handleBulkPurchaseToggle = () => {
    setBulkPurchaseMode(!bulkPurchaseMode);
    setSelectedTiles(new Set());
    setSelectedTile(null);
    
    if (!bulkPurchaseMode) {
      showInfo(
        'Bulk Purchase Mode Activated',
        'Click on multiple tiles to select them for bulk purchase. Press Escape to exit.'
      );
    } else {
      showInfo('Bulk Purchase Mode Deactivated', '');
    }
  };

  const handleBulkPurchaseClick = () => {
    if (selectedTiles.size === 0) {
      showWarning('No Tiles Selected', 'Please select tiles for bulk purchase');
      return;
    }
    setBulkPurchaseDialogOpen(true);
  };

  const handleBulkPurchaseConfirm = async () => {
    if (selectedTiles.size === 0) return;

    try {
      setBulkPurchasing(true);
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // Process each selected tile
      for (const tileId of selectedTiles) {
        let tile = filteredTiles.find(t => t.tileId === tileId);
        if (!tile && tiles && Array.isArray(tiles)) {
          tile = tiles.find(t => t.tileId === tileId);
        }
        if (!tile) continue;

        try {
          const integerArea = Math.round(bulkPurchaseArea); // NEW: Ensure integer area
          const purchaseRequest: LandPurchaseRequest = {
            tileId: tileId,
            area: integerArea, // NEW: No area limits, use requested amount
            description: `Bulk purchase of ${integerArea} units on ${LandService.formatLandType(tile.landType)} tile ${tileId}`,
          };

          await LandService.purchaseLand(purchaseRequest);
          successCount++;
        } catch (err: any) {
          failCount++;
          errors.push(`Tile ${tileId}: ${LandService.getErrorMessage(err)}`);
        }
      }

      // Show results with animation for successful bulk purchase
      if (successCount > 0) {
        // Trigger bulk success animation
        setPurchaseAnimationData({
          tileId: 0, // Bulk purchase indicator
          area: successCount * bulkPurchaseArea,
          cost: successCount * 100, // Estimated average cost
          landType: 'BULK'
        });
        setShowSuccessAnimation(true);
        
        // Show success notification after animation delay
        setTimeout(() => {
          showSuccess(
            `Bulk Purchase Complete! 🎉`,
            `Successfully purchased ${successCount} tile${successCount > 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`
          );
        }, 1500);
      }

      if (failCount > 0) {
        showError(
          `Some Purchases Failed`,
          `${failCount} purchase(s) failed. Check individual tile availability.`
        );
      }

      // Refresh data and reset
      await loadMapData();
      setBulkPurchaseDialogOpen(false);
      setSelectedTiles(new Set());
      setBulkPurchaseMode(false);

    } catch (err: any) {
      showError('Bulk Purchase Failed', LandService.getErrorMessage(err));
    } finally {
      setBulkPurchasing(false);
    }
  };

  const clearSelectedTiles = () => {
    setSelectedTiles(new Set());
    showInfo('Selection Cleared', 'All selected tiles have been deselected');
  };

  const handleRefresh = () => {
    loadMapData();
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetZoom = () => {
    mapRef.current?.resetZoom();
  };

  // Context menu handlers
  const handleTileRightClick = useCallback((tileId: number, event: React.MouseEvent) => {
    let tile = filteredTiles.find(t => t.tileId === tileId);
    if (!tile && tiles && Array.isArray(tiles)) {
      tile = tiles.find(t => t.tileId === tileId);
    }
    if (!tile) return;

    setContextMenuTile(tile);
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
    setContextMenuOpen(true);
  }, [filteredTiles]);

  const handleContextMenuClose = () => {
    setContextMenuOpen(false);
    setContextMenuPosition(null);
    setContextMenuTile(null);
  };

  const handleQuickPurchase = useCallback(async (tile: AvailableTile) => {
    if (!tile.canPurchase) return;
    
    setSelectedTile(tile);
    setPurchaseArea(1);
    setDescription(`Quick purchase of 1 unit on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
    setPurchaseDialogOpen(true);
  }, []);

  const handlePurchaseMax = useCallback(async (tile: AvailableTile) => {
    if (!tile.canPurchase) return;
    
    setSelectedTile(tile);
    // NEW: Set to a reasonable "max" since area is unlimited (UI convenience)
    setPurchaseArea(50);
    setDescription(`Purchase large amount (50 units) on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
    setPurchaseDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback(async (tile: AvailableTile) => {
    // Same as regular tile click - select the tile and load details
    setSelectedTile(tile);
    try {
      const tileDetails = await LandService.getTileDetails(tile.tileId);
      setSelectedTileDetails(tileDetails);
    } catch (err: any) {
      console.error('Failed to load tile details:', err);
    }
  }, []);

  const handleCalculateCost = useCallback(async (tile: AvailableTile) => {
    // Open purchase dialog for cost calculation
    setSelectedTile(tile);
    setPurchaseArea(1);
    setDescription(`Cost calculation for ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
    setPurchaseDialogOpen(true);
  }, []);

  // Memoized filtered tiles for performance
  const filteredTiles = useMemo(() => {
    // Handle null/undefined tiles array
    if (!tiles || !Array.isArray(tiles)) {
      return [];
    }
    
    return tiles.filter(tile => {
      if (filters.showOnlyAvailable && !tile.canPurchase) return false;
      if (filters.showOnlyOwned && (tile.teamOwnedArea || 0) === 0) return false;
      if (filters.landType && tile.landType !== filters.landType) return false;
      
      const goldPrice = typeof tile.currentGoldPrice === 'number' && !isNaN(tile.currentGoldPrice) ? tile.currentGoldPrice : 0;
      const carbonPrice = typeof tile.currentCarbonPrice === 'number' && !isNaN(tile.currentCarbonPrice) ? tile.currentCarbonPrice : 0;
      const totalPrice = goldPrice + carbonPrice;
      
      if (filters.minPrice && totalPrice < filters.minPrice) return false;
      if (filters.maxPrice && totalPrice > filters.maxPrice) return false;
      if (filters.minAvailableArea && LandService.getEffectiveAvailableArea(tile) < filters.minAvailableArea) return false;
      
      return true;
    });
  }, [tiles, filters]);

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
        // Bulk purchase state
        isSelected: selectedTiles.has(tile.tileId),
        bulkMode: bulkPurchaseMode,
      };
    });
  }, [filteredTiles, selectedTiles, bulkPurchaseMode]);

  // Memoized statistics for performance
  const mapStatistics = useMemo(() => {
    const availableCount = filteredTiles.filter(t => t.canPurchase).length;
    const ownedCount = filteredTiles.filter(t => t.teamOwnedArea > 0).length;
    const selectedCount = selectedTiles.size;
    
    return {
      total: filteredTiles.length,
      available: availableCount,
      owned: ownedCount,
      selected: selectedCount
    };
  }, [filteredTiles, selectedTiles]);

  const renderTileInfoPanel = () => {
    if (!selectedTile) return null;


    return (
      <TileInfoPanel elevation={3}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="h3">
              Tile {selectedTile.tileId} - {LandService.formatLandType(selectedTile.landType)}
            </Typography>
            <Box display="flex" gap={1}>
              <Chip 
                label={selectedTile.canPurchase ? 'Available' : 'Unavailable'}
                color={selectedTile.canPurchase ? 'success' : 'default'}
                size="small"
              />
              {selectedTile.teamOwnedArea > 0 && (
                <Chip 
                  label="Owned"
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Gold Price: {LandService.formatCurrency(selectedTile.currentGoldPrice || 0, 'gold')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Carbon Price: {LandService.formatCurrency(selectedTile.currentCarbonPrice || 0, 'carbon')}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Available: Unlimited
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team Owned: {LandService.formatArea(selectedTile.teamOwnedArea || 0)}
              </Typography>
            </Grid>
          </Grid>

          <Divider />
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              Total Cost per unit: {LandService.formatCurrency((selectedTile.currentGoldPrice || 0) + (selectedTile.currentCarbonPrice || 0))}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              onClick={handlePurchaseClick}
              disabled={!selectedTile.canPurchase} // NEW: No area limits, only check if purchasable
              size="small"
            >
              Purchase Land
            </Button>
          </Box>
        </Stack>
      </TileInfoPanel>
    );
  };

  const renderBulkPurchaseDialog = () => {
    // FIXED: Use filteredTiles for consistency with mapTiles, fallback to tiles
    const selectedTilesArray = Array.from(selectedTiles).map(id => {
      let tile = filteredTiles.find(t => t.tileId === id);
      if (!tile && tiles && Array.isArray(tiles)) {
        tile = tiles.find(t => t.tileId === id);
      }
      return tile;
    }).filter(Boolean) as AvailableTile[];
    
    const totalCost = selectedTilesArray.reduce((sum, tile) => {
      // NEW: Area is unlimited, so use the requested bulk purchase area directly
      const area = Math.round(bulkPurchaseArea); // Ensure integer
      const goldPrice = typeof tile.currentGoldPrice === 'number' && !isNaN(tile.currentGoldPrice) ? tile.currentGoldPrice : 0;
      const carbonPrice = typeof tile.currentCarbonPrice === 'number' && !isNaN(tile.currentCarbonPrice) ? tile.currentCarbonPrice : 0;
      return sum + (area * (goldPrice + carbonPrice));
    }, 0);

    return (
      <PurchaseDialog 
        open={bulkPurchaseDialogOpen} 
        onClose={() => setBulkPurchaseDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Bulk Purchase - {selectedTiles.size} Tiles Selected
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Selected Tiles Summary */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Tiles
                </Typography>
                <Grid container spacing={1}>
                  {selectedTilesArray.slice(0, 12).map((tile) => (
                    <Grid key={tile.tileId}>
                      <Chip 
                        label={`Tile ${tile.tileId}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                  {selectedTilesArray.length > 12 && (
                    <Grid>
                      <Chip 
                        label={`+${selectedTilesArray.length - 12} more`}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Area Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Area per Tile
              </Typography>
              <Slider
                value={bulkPurchaseArea}
                onChange={(_, value) => setBulkPurchaseArea(value as number)}
                min={1}
                max={20} // Reasonable UI limit for bulk operations
                step={1} // NEW: Integer steps only
                marks={[
                  { value: 1, label: '1' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 20, label: '20' }
                ]}
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `${Math.round(value)} units`} // Integer display
              />
            </Box>

            {/* Cost Summary */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Bulk Purchase Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2">
                      Total Tiles: {selectedTiles.size}
                    </Typography>
                    <Typography variant="body2">
                      Area per Tile: {LandService.formatArea(bulkPurchaseArea)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2">
                      Estimated Total Cost: {LandService.formatCurrency(totalCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      (Individual validation will occur)
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setBulkPurchaseDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkPurchaseConfirm}
            disabled={selectedTiles.size === 0 || bulkPurchasing}
            startIcon={bulkPurchasing ? <CircularProgress size={16} /> : <BulkPurchaseIcon />}
          >
            {bulkPurchasing ? `Purchasing ${selectedTiles.size} tiles...` : `Purchase ${selectedTiles.size} Tiles`}
          </Button>
        </DialogActions>
      </PurchaseDialog>
    );
  };

  const renderPurchaseDialog = () => (
    <PurchaseDialog 
      open={purchaseDialogOpen} 
      onClose={() => setPurchaseDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Purchase Land - Tile {selectedTile?.tileId}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Area Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Area to Purchase
            </Typography>
            <Slider
              value={purchaseArea}
              onChange={(_, value) => setPurchaseArea(value as number)}
              min={1}
              max={Math.min(100, selectedTile?.availableArea || 100)} // Reasonable UI limit, but no hard business limit
              step={1} // NEW: Integer steps only
              marks={[
                { value: 1, label: '1' },
                { value: 10, label: '10' },
                { value: 50, label: '50' },
                { value: Math.min(100, selectedTile?.availableArea || 100), label: Math.min(100, selectedTile?.availableArea || 100).toString() }
              ]}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => `${Math.round(value)} units`} // Integer display
            />
          </Box>

          {/* Cost Display */}
          {purchaseValidation && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Purchase Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2">
                      Gold Cost: {LandService.formatCurrency(purchaseValidation.goldCost || 0, 'gold')}
                    </Typography>
                    <Typography variant="body2">
                      Carbon Cost: {LandService.formatCurrency(purchaseValidation.carbonCost || 0, 'carbon')}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2">
                      Total Cost: {LandService.formatCurrency(purchaseValidation.totalCost || 0)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={purchaseValidation.canPurchase ? 'success.main' : 'error.main'}
                    >
                      Status: {purchaseValidation.canPurchase ? 'Can Purchase' : 'Cannot Purchase'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Debug: canPurchase={String(purchaseValidation.canPurchase)} (type: {typeof purchaseValidation.canPurchase})
                    </Typography>
                  </Grid>
                </Grid>
                
                {purchaseValidation.errors && purchaseValidation.errors.length > 0 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {purchaseValidation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Price Protection */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={enablePriceProtection}
                  onChange={(e) => setEnablePriceProtection(e.target.checked)}
                />
              }
              label="Enable Price Protection"
            />
            
            {enablePriceProtection && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={6}>
                  <TextField
                    label="Max Gold Cost"
                    type="number"
                    fullWidth
                    size="small"
                    value={maxGoldCost || ''}
                    onChange={(e) => setMaxGoldCost(e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Max Carbon Cost"
                    type="number"
                    fullWidth
                    size="small"
                    value={maxCarbonCost || ''}
                    onChange={(e) => setMaxCarbonCost(e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Description */}
          <TextField
            label="Purchase Description (Optional)"
            multiline
            rows={2}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for this purchase..."
          />
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setPurchaseDialogOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePurchaseConfirm}
          disabled={!purchaseValidation?.canPurchase || purchasing}
          startIcon={purchasing ? <CircularProgress size={16} /> : <ShoppingCartIcon />}
        >
          {purchasing ? 'Purchasing...' : 'Confirm Purchase'}
        </Button>
      </DialogActions>
    </PurchaseDialog>
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
          Retry
        </Button>
      }>
        {LandService.getErrorMessage(displayError)}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Land Management - Student Map View
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Interactive map for exploring and purchasing available land. Click on tiles to view details and make purchases.
        {bulkPurchaseMode && (
          <Box component="span" sx={{ 
            ml: 2, 
            px: 2, 
            py: 0.5, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            🔄 BULK MODE ACTIVE ({selectedTiles.size} selected)
          </Box>
        )}
      </Typography>

      {/* Team Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <LandscapeIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {teamSummary ? LandService.formatArea(teamSummary.totalOwnedArea) : '0'}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Total Owned Area
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountBalanceIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {teamSummary ? LandService.formatCurrency(teamSummary.totalSpent) : '0'}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Total Spent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {teamSummary?.tilesOwnedCount || 0}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Tiles Owned
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ShoppingCartIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {mapStatistics.available}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Available Tiles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Interactive Map */}
      <MapContainer elevation={2}>
        {/* Map Controls */}
        <ControlsContainer>
          <Tooltip title="Refresh Data">
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
          <Tooltip title="Toggle Filters">
            <IconButton 
              onClick={() => setShowFilters(!showFilters)}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <Badge color="primary" variant="dot" invisible={Object.keys(filters).length <= 1}>
                <FilterIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
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
          <Tooltip title="Zoom Out">
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
          <Tooltip title="Reset Zoom">
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
          
          {/* Bulk Purchase Controls */}
          <Tooltip title={bulkPurchaseMode ? "Exit Bulk Mode (Ctrl+B)" : "Bulk Purchase Mode (Ctrl+B)"}>
            <IconButton 
              onClick={handleBulkPurchaseToggle}
              sx={{ 
                bgcolor: bulkPurchaseMode ? 'primary.main' : 'background.paper',
                color: bulkPurchaseMode ? 'primary.contrastText' : 'text.primary',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <BulkSelectIcon />
            </IconButton>
          </Tooltip>
          
          {bulkPurchaseMode && (
            <>
              <Tooltip title={`Clear Selection (${selectedTiles.size} selected)`}>
                <IconButton 
                  onClick={clearSelectedTiles}
                  disabled={selectedTiles.size === 0}
                  sx={{ 
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 }
                  }}
                >
                  <Badge badgeContent={selectedTiles.size} color="primary">
                    <ClearIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Bulk Purchase Selected Tiles">
                <IconButton 
                  onClick={handleBulkPurchaseClick}
                  disabled={selectedTiles.size === 0}
                  sx={{ 
                    bgcolor: selectedTiles.size > 0 ? 'success.main' : 'background.paper',
                    color: selectedTiles.size > 0 ? 'success.contrastText' : 'text.primary',
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 }
                  }}
                >
                  <BulkPurchaseIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </ControlsContainer>

        {/* Team Stats */}
        <StatsContainer>
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Your Team Status
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Team:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {teamSummary?.teamName || 'No Team'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Purchases:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {teamSummary?.totalPurchases || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Gold Spent:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {LandService.formatCurrency(teamSummary?.totalGoldSpent || 0, 'gold')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </StatsContainer>

        {/* Hexagonal Map */}
        <HexagonalMap
          ref={mapRef}
          tiles={mapTiles}
          width={800}
          height={600}
          onTileClick={handleTileClick}
          onTileRightClick={handleTileRightClick}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          selectedTileId={selectedTile?.tileId}
          configurationMode={false}
          showConfiguration={false}
        />

        {/* Tile Information Panel */}
        {renderTileInfoPanel()}
      </MapContainer>

      {/* Purchase Dialog */}
      {renderPurchaseDialog()}
      
      {/* Bulk Purchase Dialog */}
      {renderBulkPurchaseDialog()}
      
      {/* Purchase Success Animation */}
      <PurchaseSuccessAnimation
        isVisible={showSuccessAnimation}
        onComplete={() => {
          setShowSuccessAnimation(false);
          setPurchaseAnimationData(null);
        }}
        purchaseData={purchaseAnimationData || undefined}
        duration={3000}
      />

      {/* Legend */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Map Legend
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: theme.palette.success.main,
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2">Available for Purchase</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: theme.palette.primary.main,
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2">Your Team Owns</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: theme.palette.warning.main,
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2">Competitor Owned</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: theme.palette.grey[400],
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2">Unavailable</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// Wrapper component with ToastProvider
const StudentLandMapPageWithToast: React.FC = () => {
  return (
    <ToastProvider>
      <StudentLandMapPage />
    </ToastProvider>
  );
};

export default StudentLandMapPageWithToast;