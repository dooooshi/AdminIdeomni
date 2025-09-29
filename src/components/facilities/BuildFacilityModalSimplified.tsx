'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  BuildOutlined,
  LocationOnOutlined,
  MonetizationOn,
  Co2,
  CheckCircleOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { FacilityTypeSelector } from '@/components/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { LandService } from '@/lib/services/landService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  LandType,
  type FacilityType,
  type BuildFacilityRequest,
  type BuildValidationResponse,
  type TileFacilityInstance,
} from '@/types/facilities';
import type { OwnedTileForBuilding } from '@/types/land';

interface BuildFacilityModalSimplifiedProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (facility: TileFacilityInstance) => void;
  selectedTileId?: number;
  tileLandType?: LandType;
  tileOwnership?: {
    ownedArea: number;
    totalArea: number;
  };
  teamBalance?: {
    gold: number;
    carbon: number;
  };
}

const BuildFacilityModalSimplified: React.FC<BuildFacilityModalSimplifiedProps> = ({
  open,
  onClose,
  onSuccess,
  selectedTileId,
  tileLandType = 'PLAIN',
  tileOwnership,
  teamBalance,
}) => {
  const { t } = useTranslation();

  // Helper function to get translated land type
  const getLandTypeLabel = (landType: string) => {
    if (!landType) return '';

    // Convert to uppercase to match translation keys
    const upperLandType = landType.toUpperCase();
    const translationKey = `facilityManagement.LAND_TYPE_${upperLandType}`;
    const translated = t(translationKey);

    // If translation not found, return formatted fallback
    if (translated === translationKey || !translated || translated.includes('LAND_TYPE_')) {
      return landType.charAt(0).toUpperCase() + landType.slice(1).toLowerCase();
    }

    return translated;
  };

  // State management
  const [availableTiles, setAvailableTiles] = useState<OwnedTileForBuilding[]>([]);
  const [selectedTile, setSelectedTile] = useState<OwnedTileForBuilding | null>(null);
  const [selectedFacilityType, setSelectedFacilityType] = useState<FacilityType | undefined>();
  const [validation, setValidation] = useState<BuildValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildableFacilities, setBuildableFacilities] = useState<FacilityType[]>([]);

  // Load available tiles when modal opens
  const loadAvailableTiles = async () => {
    try {
      setTilesLoading(true);
      setError(null);
      const response = await LandService.getOwnedTilesForBuilding();

      // All tiles returned already have team ownership
      setAvailableTiles(response.data);

      // Auto-select tile if one was passed in props
      if (selectedTileId) {
        const preSelectedTile = response.data.find(tile => tile.tileId === selectedTileId);
        if (preSelectedTile) {
          setSelectedTile(preSelectedTile);
        }
      }
    } catch (err) {
      console.error('Failed to load available tiles:', err);
      setError(t('facilityManagement.FAILED_TO_LOAD_TILES'));
    } finally {
      setTilesLoading(false);
    }
  };

  // Load buildable facilities based on land type
  const loadBuildableFacilities = async (landType: LandType) => {
    try {
      setLoading(true);
      setError(null);

      const response = await StudentFacilityService.getFacilitiesByLandType({
        landType: landType
      });

      // Extract facilities for the specific land type
      const facilities = response.landTypes[landType] || [];
      setBuildableFacilities(facilities);

    } catch (err) {
      console.error('Failed to load buildable facilities:', err);
      setError(t('facilityManagement.FAILED_TO_LOAD_FACILITIES'));
      setBuildableFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset modal state when it opens
  useEffect(() => {
    if (open) {
      setAvailableTiles([]);
      setSelectedTile(null);
      setSelectedFacilityType(undefined);
      setValidation(null);
      setError(null);
      setLoading(false);
      setBuilding(false);
      setBuildableFacilities([]);

      // Load tiles
      loadAvailableTiles();
    }
  }, [open, selectedTileId]);

  // Load buildable facilities when a tile is selected
  useEffect(() => {
    if (selectedTile?.landType) {
      loadBuildableFacilities(selectedTile.landType as LandType);
    }
  }, [selectedTile]);

  // Validate build when facility type changes
  useEffect(() => {
    if (selectedFacilityType && selectedTile) {
      validateBuild(selectedTile.tileId, selectedFacilityType);
    }
  }, [selectedFacilityType, selectedTile]);

  const validateBuild = async (tileId: number, facilityType: FacilityType) => {
    try {
      setLoading(true);
      setError(null);
      
      const validationResult = await StudentFacilityService.validateBuildCapability(tileId, facilityType);
      setValidation(validationResult);
    } catch (err) {
      console.error('Validation failed:', err);
      setError(t('facilityManagement.VALIDATION_ERROR'));
      setValidation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityTypeSelect = (type: FacilityType) => {
    setSelectedFacilityType(type);
  };

  const handleBuild = async () => {
    if (!validation?.canBuild || !selectedFacilityType || !selectedTile) return;

    try {
      setBuilding(true);
      setError(null);

      const request: BuildFacilityRequest = {
        tileId: selectedTile.tileId,
        facilityType: selectedFacilityType,
      };

      const facility = await StudentFacilityService.buildFacility(request);
      onSuccess(facility);
      onClose();

    } catch (err) {
      console.error('Build failed:', err);
      setError(t('facilityManagement.FACILITY_CREATE_ERROR'));
    } finally {
      setBuilding(false);
    }
  };

  const canBuild = validation?.canBuild && selectedTile && selectedFacilityType;
  const showTileSelection = !selectedTileId && availableTiles.length > 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 2,
        } 
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <BuildOutlined color="primary" />
          <Typography variant="h6">
            {t('facilityManagement.BUILD_FACILITY')}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tile Selection or Display */}
        {showTileSelection ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('facilityManagement.SELECT_TILE')}
            </Typography>
            {tilesLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Grid container spacing={1}>
                {availableTiles.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No owned tiles available for building
                    </Typography>
                  </Grid>
                )}
                {availableTiles.map((tile) => (
                  <Grid item xs={6} sm={4} md={3} key={tile.tileId}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        borderColor: selectedTile?.tileId === tile.tileId ? 'primary.main' : 'divider',
                        backgroundColor: selectedTile?.tileId === tile.tileId ? 'action.selected' : 'background.paper',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => setSelectedTile(tile)}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {t('facilityManagement.TILE')} {tile.tileId}
                        </Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5}>
                          <Chip label={getLandTypeLabel(tile.landType)} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
                          <Chip label={`${tile.availableArea}`} size="small" color="success" sx={{ height: 18, fontSize: '0.7rem' }} />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (selectedTile || selectedTileId) && (
          <Box sx={{ p: 1.5, mb: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnOutlined fontSize="small" color="primary" />
              <Typography variant="body2">
                {t('facilityManagement.TILE')} {selectedTile?.tileId || selectedTileId}
              </Typography>
              <Chip
                label={getLandTypeLabel(selectedTile?.landType || tileLandType)}
                size="small"
                sx={{ height: 18, fontSize: '0.7rem' }}
              />
              {(selectedTile || tileOwnership) && (
                <Chip 
                  label={`${t('facilityManagement.AVAILABLE_AREA')}: ${selectedTile?.availableArea || tileOwnership?.ownedArea}`}
                  size="small" 
                  color="success"
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Facility Type Selection */}
        {selectedTile && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              {t('facilityManagement.SELECT_FACILITY_TYPE')}
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FacilityTypeSelector
                selectedType={selectedFacilityType}
                onTypeSelect={handleFacilityTypeSelect}
                compatibleLandTypes={selectedTile ? [selectedTile.landType as LandType] : [LandType.PLAIN]}
                showOnlyCompatible={true}
                showBuildableOnly={true}
                selectedTileId={selectedTile?.tileId}
                buildableFacilities={buildableFacilities}
              />
            )}

            {/* Validation & Cost Display */}
            {validation && selectedFacilityType && (
              <Box sx={{ mt: 2, p: 2, border: 1, borderColor: validation.canBuild ? 'success.main' : 'error.main', borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  {validation.canBuild ? (
                    <CheckCircleOutlined color="success" fontSize="small" />
                  ) : (
                    <WarningAmberOutlined color="error" fontSize="small" />
                  )}
                  <Typography variant="body2" fontWeight="medium">
                    {validation.canBuild 
                      ? t('facilityManagement.CAN_BUILD')
                      : t('facilityManagement.CANNOT_BUILD')
                    }
                  </Typography>
                </Stack>

                {validation.canBuild ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <MonetizationOn fontSize="small" color="warning" />
                        <Typography variant="body2">
                          {t('facilityManagement.GOLD')}: {validation.goldCost}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Co2 fontSize="small" color="error" />
                        <Typography variant="body2">
                          {t('facilityManagement.CARBON')}: {validation.carbonCost}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                ) : (
                  <Box>
                    {validation.errors?.map((error, index) => (
                      <Typography key={index} variant="caption" color="error" display="block">
                        • {error}
                      </Typography>
                    ))}
                  </Box>
                )}

                {/* Balance Check */}
                {validation.canBuild && teamBalance && (
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      {t('facilityManagement.YOUR_BALANCE')}:
                      <MonetizationOn sx={{ fontSize: 14, mx: 0.5 }} />
                      {teamBalance.gold} 
                      <Co2 sx={{ fontSize: 14, mx: 0.5 }} />
                      {teamBalance.carbon}
                    </Typography>
                    {(teamBalance.gold < validation.goldCost || teamBalance.carbon < validation.carbonCost) && (
                      <Typography variant="caption" color="error" display="block">
                        {t('facilityManagement.INSUFFICIENT_RESOURCES')}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={building}>
          {t('common.CANCEL')}
        </Button>
        
        <Button
          variant="contained"
          onClick={handleBuild}
          disabled={!canBuild || building}
          startIcon={building ? <CircularProgress size={16} /> : <BuildOutlined />}
        >
          {building ? t('facilityManagement.BUILDING') : t('facilityManagement.BUILD')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuildFacilityModalSimplified;