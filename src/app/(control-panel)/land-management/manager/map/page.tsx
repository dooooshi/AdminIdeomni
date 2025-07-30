'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Divider
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetZoomIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import HexagonalMap from '@/components/map/components/HexagonalMap';
import { HexagonalMapRef } from '@/components/map/types';
import LandService from '@/lib/services/landService';
import { 
  ManagerTileOwnership, 
  ActivityLandOverview,
  TileDetailsWithOwnership 
} from '@/types/land';
import { useRef } from 'react';

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

interface ManagerLandMapPageProps {}

const ManagerLandMapPage: React.FC<ManagerLandMapPageProps> = () => {
  const theme = useTheme();
  const mapRef = useRef<HexagonalMapRef>(null);
  
  // State management
  const [tiles, setTiles] = useState<ManagerTileOwnership[]>([]);
  const [overview, setOverview] = useState<ActivityLandOverview | null>(null);
  const [selectedTile, setSelectedTile] = useState<ManagerTileOwnership | null>(null);
  const [selectedTileDetails, setSelectedTileDetails] = useState<TileDetailsWithOwnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load initial data
  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load overview and tiles data in parallel
      const [overviewData, tilesData] = await Promise.all([
        LandService.getActivityLandOverview(),
        LandService.getManagerTileOwnership({ pageSize: 100 }) // Load more tiles for map view
      ]);

      setOverview(overviewData);
      setTiles(tilesData.data);
    } catch (err: any) {
      console.error('Failed to load land map data:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTileClick = useCallback(async (tileId: number) => {
    const tile = tiles.find(t => t.tileId === tileId);
    if (!tile) return;

    setSelectedTile(tile);

    try {
      // Load detailed tile information for the info panel
      const tileDetails = await LandService.getSpecificTileOwnership(tileId);
      setSelectedTileDetails(tileDetails as any); // Type conversion for compatibility
    } catch (err: any) {
      console.error('Failed to load tile details:', err);
    }
  }, [tiles]);

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

  // Convert manager tiles to map format
  const mapTiles = tiles.map(tile => ({
    id: tile.tileId,
    axialQ: tile.axialQ,
    axialR: tile.axialR,
    landType: tile.landType,
    currentGoldPrice: tile.currentGoldPrice,
    currentCarbonPrice: tile.currentCarbonPrice,
    currentPopulation: tile.currentPopulation,
    // Additional properties for visualization
    ownership: tile.ownershipBreakdown.length > 0 ? tile.ownershipBreakdown[0] : null,
    ownershipCount: tile.ownershipBreakdown.length,
    totalRevenue: tile.totalRevenue,
    utilizationRate: LandService.calculateOwnershipPercentage(tile.totalOwnedArea),
  }));

  const renderTileInfoPanel = () => {
    if (!selectedTile) return null;

    return (
      <TileInfoPanel elevation={3}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="h3">
              Tile {selectedTile.tileId} - {LandService.formatLandType(selectedTile.landType)}
            </Typography>
            <Chip 
              label={`${LandService.calculateOwnershipPercentage(selectedTile.totalOwnedArea)}% Owned`}
              color={selectedTile.totalOwnedArea > 0 ? 'primary' : 'default'}
              size="small"
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Owned Area: {LandService.formatArea(selectedTile.totalOwnedArea)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available: {LandService.formatArea(selectedTile.availableArea)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Revenue: {LandService.formatCurrency(selectedTile.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teams: {selectedTile.ownershipBreakdown.length}
              </Typography>
            </Grid>
          </Grid>

          {selectedTile.ownershipBreakdown.length > 0 && (
            <>
              <Divider />
              <Typography variant="subtitle2">Team Ownership</Typography>
              <Stack spacing={1}>
                {selectedTile.ownershipBreakdown.slice(0, 3).map((ownership) => (
                  <Box key={ownership.teamId} display="flex" justifyContent="space-between">
                    <Typography variant="body2">{ownership.teamName}</Typography>
                    <Typography variant="body2" color="primary">
                      {LandService.formatArea(ownership.ownedArea)}
                    </Typography>
                  </Box>
                ))}
                {selectedTile.ownershipBreakdown.length > 3 && (
                  <Typography variant="body2" color="text.secondary">
                    +{selectedTile.ownershipBreakdown.length - 3} more teams
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </TileInfoPanel>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Land Management - Manager Map View
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Interactive map showing land ownership across all teams in your activity. 
        Click on tiles to view detailed ownership information.
      </Typography>

      {/* Overview Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Tiles
              </Typography>
              <Typography variant="h4">
                {tiles.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Teams with Land
              </Typography>
              <Typography variant="h4">
                {overview?.teamsWithLand || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                {LandService.formatCurrency(overview?.totalRevenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Area/Team
              </Typography>
              <Typography variant="h4">
                {LandService.formatArea(overview?.averageAreaPerTeam || 0)}
              </Typography>
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
        </ControlsContainer>

        {/* Activity Stats */}
        <StatsContainer>
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Activity Overview
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Total Purchases:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {overview?.totalLandPurchases || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Area Purchased:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {LandService.formatArea(overview?.totalAreaPurchased || 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Gold Spent:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {LandService.formatCurrency(overview?.totalGoldSpent || 0, 'gold')}
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
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          selectedTileId={selectedTile?.tileId}
          configurationMode={false}
          showConfiguration={false}
        />

        {/* Tile Information Panel */}
        {renderTileInfoPanel()}
      </MapContainer>

      {/* Legend */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Map Legend
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: LandService.getLandTypeColor('PLAIN'),
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2">Plain Land</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: LandService.getLandTypeColor('COASTAL'),
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2">Coastal Land</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: LandService.getLandTypeColor('MARINE'),
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2">Marine Land</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManagerLandMapPage;