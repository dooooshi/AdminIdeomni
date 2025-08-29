'use client';

import React, { useState, useEffect } from 'react';
import { RESOURCE_ICONS } from '@/constants/resourceIcons';
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
  Step,
  Stepper,
  StepLabel,
  Paper,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  BuildOutlined,
  LocationOnOutlined,
  MonetizationOnOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  MonetizationOn,
  Co2,
} from '@mui/icons-material';
import { FacilityTypeSelector } from '@/components/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { LandService } from '@/lib/services/landService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import type {
  FacilityType,
  LandType,
  BuildFacilityRequest,
  BuildValidationResponse,
  TileFacilityInstance,
} from '@/types/facilities';
import type { AvailableTile } from '@/types/land';

interface BuildFacilityModalProps {
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

const STEPS = ['SELECT_TILE', 'SELECT_FACILITY', 'CONFIGURE_BUILD', 'CONFIRM_BUILD'];

const BuildFacilityModal: React.FC<BuildFacilityModalProps> = ({
  open,
  onClose,
  onSuccess,
  selectedTileId,
  tileLandType = 'PLAIN',
  tileOwnership,
  teamBalance,
}) => {
  const { t } = useTranslation(['facilityManagement', 'common']);

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [availableTiles, setAvailableTiles] = useState<AvailableTile[]>([]);
  const [selectedTile, setSelectedTile] = useState<AvailableTile | null>(null);
  const [selectedFacilityType, setSelectedFacilityType] = useState<FacilityType | undefined>();
  const [buildRequest, setBuildRequest] = useState<BuildFacilityRequest>({
    tileId: selectedTileId || 0,
    facilityType: 'FARM' as FacilityType,
    description: '',
  });
  const [validation, setValidation] = useState<BuildValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration options
  const [enablePriceProtection, setEnablePriceProtection] = useState(true);
  const [maxGoldCost, setMaxGoldCost] = useState<number | ''>('');
  const [maxCarbonCost, setMaxCarbonCost] = useState<number | ''>('');

  // Load available tiles when modal opens
  const loadAvailableTiles = async () => {
    try {
      setTilesLoading(true);
      setError(null);
      const response = await LandService.getAvailableTiles();
      
      // Filter tiles to only show ones where team has ownership (teamOwnedArea > 0)
      const ownedTiles = response.data.filter(tile => tile.teamOwnedArea > 0);
      setAvailableTiles(ownedTiles);
      
      // Auto-select tile if one was passed in props and it has ownership
      if (selectedTileId) {
        const preSelectedTile = ownedTiles.find(tile => tile.tileId === selectedTileId);
        if (preSelectedTile) {
          setSelectedTile(preSelectedTile);
          setActiveStep(1); // Skip tile selection step
        }
      }
    } catch (err) {
      console.error('Failed to load available tiles:', err);
      setError(t('facilityManagement:FAILED_TO_LOAD_TILES'));
    } finally {
      setTilesLoading(false);
    }
  };

  // Reset modal state when it opens
  useEffect(() => {
    if (open) {
      setActiveStep(selectedTileId ? 1 : 0); // Skip tile selection if tile is pre-selected
      setAvailableTiles([]);
      setSelectedTile(null);
      setSelectedFacilityType(undefined);
      setBuildRequest({
        tileId: selectedTileId || 0,
        facilityType: 'FARM' as FacilityType,
        description: '',
      });
      setValidation(null);
      setError(null);
      setLoading(false);
      setBuilding(false);
      setEnablePriceProtection(true);
      setMaxGoldCost('');
      setMaxCarbonCost('');
      
      // Load tiles
      loadAvailableTiles();
    }
  }, [open, selectedTileId]);

  // Validate build when facility type changes
  useEffect(() => {
    if (selectedFacilityType && selectedTile) {
      setBuildRequest(prev => ({ ...prev, tileId: selectedTile.tileId, facilityType: selectedFacilityType }));
      validateBuild(selectedTile.tileId, selectedFacilityType);
    }
  }, [selectedFacilityType, selectedTile]);

  const validateBuild = async (tileId: number, facilityType: FacilityType) => {
    try {
      setLoading(true);
      setError(null);
      
      const validationResult = await StudentFacilityService.validateBuildCapability(tileId, facilityType);
      
      // Debug: Log the validation result
      console.log('🔍 Raw validation result:', validationResult);
      console.log('🔍 canBuild value:', validationResult.canBuild);
      console.log('🔍 canBuild type:', typeof validationResult.canBuild);
      console.log('🔍 canBuild === true:', validationResult.canBuild === true);
      console.log('🔍 Boolean(canBuild):', Boolean(validationResult.canBuild));
      
      setValidation(validationResult);

      // Auto-set price protection limits
      if (enablePriceProtection) {
        setMaxGoldCost(Math.ceil(validationResult.goldCost * 1.1)); // 10% buffer
        setMaxCarbonCost(Math.ceil(validationResult.carbonCost * 1.1)); // 10% buffer
      }

    } catch (err) {
      console.error('Validation failed:', err);
      setError(t('facilityManagement:VALIDATION_ERROR'));
      setValidation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityTypeSelect = (type: FacilityType) => {
    setSelectedFacilityType(type);
    setBuildRequest(prev => ({ ...prev, facilityType: type }));
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedTile) {
      // Update buildRequest with selected tile when moving from step 0 to 1
      setBuildRequest(prev => ({ ...prev, tileId: selectedTile.tileId }));
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  const handleBuild = async () => {
    if (!validation?.canBuild || !selectedFacilityType || !selectedTile) return;

    try {
      setBuilding(true);
      setError(null);

      const request: BuildFacilityRequest = {
        tileId: selectedTile.tileId,
        facilityType: selectedFacilityType,
        description: buildRequest.description || undefined,
      };

      // Add price protection if enabled
      if (enablePriceProtection) {
        if (maxGoldCost) request.maxGoldCost = Number(maxGoldCost);
        if (maxCarbonCost) request.maxCarbonCost = Number(maxCarbonCost);
      }

      const facility = await StudentFacilityService.buildFacility(request);
      onSuccess(facility);
      onClose();

    } catch (err) {
      console.error('Build failed:', err);
      setError(t('facilityManagement:FACILITY_CREATE_ERROR'));
    } finally {
      setBuilding(false);
    }
  };

  const canProceedToNext = () => {
    switch (activeStep) {
      case 0: // Select Tile
        return selectedTile;
      case 1: // Select Facility
        return selectedFacilityType && validation?.canBuild;
      case 2: // Configure Build
        return validation?.canBuild;
      case 3: // Confirm Build
        return validation?.canBuild;
      default:
        return false;
    }
  };

  const getStepLabel = (step: string): string => {
    switch (step) {
      case 'SELECT_TILE': return t('facilityManagement:SELECT_TILE');
      case 'SELECT_FACILITY': return t('facilityManagement:SELECT_FACILITY_TYPE');
      case 'CONFIGURE_BUILD': return t('facilityManagement:CONFIGURE_BUILD');
      case 'CONFIRM_BUILD': return t('facilityManagement:CONFIRM_BUILD');
      default: return step;
    }
  };

  const compatibleLandTypes = tileLandType ? [tileLandType] : ['PLAIN'];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { 
          minHeight: 600,
          borderRadius: 2,
        } 
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <BuildOutlined color="primary" sx={{ fontSize: 24 }} />
          <Typography variant="h5" fontWeight={500}>
            {t('facilityManagement:BUILD_FACILITY')}
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

        {/* Tile Information */}
        {(selectedTile || selectedTileId) && (
          <Box sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LocationOnOutlined color="primary" sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={500}>
                  {t('facilityManagement:TILE')} {selectedTile?.tileId || selectedTileId}
                </Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip 
                    label={selectedTile?.landType || tileLandType} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                  {selectedTile ? (
                    <Chip 
                      label={`${t('facilityManagement:OWNED_AREA')}: ${selectedTile.teamOwnedArea}`}
                      size="small" 
                      color="success"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  ) : tileOwnership && (
                    <Chip 
                      label={`${t('facilityManagement:OWNED_AREA')}: ${tileOwnership.ownedArea}/${tileOwnership.totalArea}`}
                      size="small" 
                      color="success"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Stepper */}
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root': {
              fontSize: '0.875rem'
            },
            '& .MuiStepIcon-root': {
              fontSize: '1.25rem'
            }
          }}
        >
          {STEPS && STEPS.length > 0 ? STEPS.map((step) => (
            <Step key={step}>
              <StepLabel>{getStepLabel(step)}</StepLabel>
            </Step>
          )) : null}
        </Stepper>

        {/* Step Content */}
        <Box minHeight={400}>
          {/* Step 0: Select Tile */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('facilityManagement:SELECT_TILE_TO_BUILD')}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {t('facilityManagement:SELECT_TILE_DESCRIPTION')}
              </Typography>

              {tilesLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                  <Typography ml={2}>{t('facilityManagement:LOADING_TILES')}</Typography>
                </Box>
              ) : availableTiles.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 1 }}>
                  <Typography variant="body2">
                    {t('facilityManagement:NO_OWNED_TILES')}
                  </Typography>
                </Alert>
              ) : (
                <Grid container spacing={2} maxHeight={300} overflow="auto">
                  {availableTiles && availableTiles.length > 0 ? availableTiles.map((tile) => (
                    <Grid item xs={12} sm={6} md={4} key={tile.tileId}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          borderColor: selectedTile?.tileId === tile.tileId ? 'primary.main' : 'divider',
                          backgroundColor: selectedTile?.tileId === tile.tileId ? 'primary.50' : 'background.paper',
                          '&:hover': {
                            borderColor: 'primary.main'
                          }
                        } as any}
                        onClick={() => setSelectedTile(tile)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="start" mb={1}>
                            <Typography variant="subtitle2" fontWeight={500}>
                              {t('facilityManagement:TILE')} {tile.tileId}
                            </Typography>
                            <Chip
                              label={tile.landType}
                              size="small"
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('facilityManagement:OWNED_AREA')}: {tile.teamOwnedArea}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('facilityManagement:AVAILABLE_AREA')}: {tile.availableArea}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )) : null}
                </Grid>
              )}
            </Box>
          )}

          {/* Step 1: Select Facility Type */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('facilityManagement:CHOOSE_FACILITY_TYPE')}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {t('facilityManagement:SELECT_FACILITY_DESCRIPTION')}
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <FacilityTypeSelector
                  selectedType={selectedFacilityType}
                  onTypeSelect={handleFacilityTypeSelect}
                  compatibleLandTypes={selectedTile ? [selectedTile.landType] : ['PLAIN']}
                  showOnlyCompatible={true}
                  showBuildableOnly={true}
                  selectedTileId={selectedTile?.tileId}
                />
              )}

              {/* Validation Results */}
              {validation && selectedFacilityType && (
                <Paper sx={{ p: 2, mt: 2, border: validation.canBuild ? '1px solid green' : '1px solid red' }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {validation.canBuild ? (
                      <CheckCircleOutlined color="success" />
                    ) : (
                      <WarningAmberOutlined color="error" />
                    )}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {validation.canBuild 
                        ? t('facilityManagement:BUILD_VALIDATION_PASSED')
                        : t('facilityManagement:BUILD_VALIDATION_FAILED')
                      }
                    </Typography>
                  </Box>

                  {validation.canBuild ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          {t('facilityManagement:REQUIRED_GOLD')}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          <MonetizationOn fontSize="small" sx={{ mr: 0.5 }} /> {validation.goldCost}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          {t('facilityManagement:REQUIRED_CARBON')}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          <Co2 fontSize="small" sx={{ mr: 0.5 }} /> {validation.carbonCost}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box>
                      {validation.errors && validation.errors.length > 0 ? validation.errors.map((error, index) => (
                        <Alert key={index} severity="error" sx={{ mt: 1 }}>
                          {error}
                        </Alert>
                      )) : null}
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          )}

          {/* Step 2: Configure Build */}
          {activeStep === 2 && selectedFacilityType && validation && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('facilityManagement:CONFIGURE_BUILD_OPTIONS')}
              </Typography>

              {/* Build Costs Summary */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('facilityManagement:BUILD_COSTS')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:GOLD_COST')}
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                        <MonetizationOn fontSize="small" sx={{ mr: 0.5 }} /> {validation.goldCost}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:CARBON_COST')}
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        <Co2 fontSize="small" sx={{ mr: 0.5 }} /> {validation.carbonCost}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:TOTAL_COST')}
                      </Typography>
                      <Typography variant="h6" color="primary.main" className="flex items-center gap-2">
                        <MonetizationOn sx={{ fontSize: 20 }} className="text-yellow-600" />
                        {validation.totalCost}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Description */}
              <TextField
                fullWidth
                label={t('facilityManagement:DESCRIPTION_OPTIONAL')}
                multiline
                rows={3}
                value={buildRequest.description}
                onChange={(e) => setBuildRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('facilityManagement:FACILITY_DESCRIPTION_PLACEHOLDER')}
                sx={{ mb: 3 }}
              />

              {/* Price Protection */}
              <Card>
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enablePriceProtection}
                        onChange={(e) => setEnablePriceProtection(e.target.checked)}
                      />
                    }
                    label={t('facilityManagement:ENABLE_PRICE_PROTECTION')}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    {t('facilityManagement:PRICE_PROTECTION_DESCRIPTION')}
                  </Typography>

                  {enablePriceProtection && (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label={t('facilityManagement:MAX_GOLD_COST')}
                          type="number"
                          value={maxGoldCost}
                          onChange={(e) => setMaxGoldCost(e.target.value === '' ? '' : Number(e.target.value))}
                          InputProps={{ startAdornment: <MonetizationOn fontSize="small" /> }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label={t('facilityManagement:MAX_CARBON_COST')}
                          type="number"
                          value={maxCarbonCost}
                          onChange={(e) => setMaxCarbonCost(e.target.value === '' ? '' : Number(e.target.value))}
                          InputProps={{ startAdornment: <Co2 fontSize="small" /> }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Step 3: Confirm Build */}
          {activeStep === 3 && selectedFacilityType && validation && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('facilityManagement:CONFIRM_FACILITY_BUILD')}
              </Typography>

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('facilityManagement:BUILD_SUMMARY')}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:FACILITY_TYPE')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {StudentFacilityService.getFacilityIcon(selectedFacilityType)} {' '}
                        {StudentFacilityService.getFacilityTypeName(selectedFacilityType)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:LOCATION')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {t('facilityManagement:TILE')} {selectedTile?.tileId} ({selectedTile?.landType})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:GOLD_COST')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="warning.main">
                        <MonetizationOn fontSize="small" sx={{ mr: 0.5 }} /> {validation.goldCost}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:CARBON_COST')}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="error.main">
                        <Co2 fontSize="small" sx={{ mr: 0.5 }} /> {validation.carbonCost}
                      </Typography>
                    </Grid>
                  </Grid>

                  {buildRequest.description && (
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:DESCRIPTION')}
                      </Typography>
                      <Typography variant="body2">
                        {buildRequest.description}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Team Balance Check */}
              {teamBalance && (
                <Alert 
                  severity={
                    teamBalance.gold >= validation.goldCost && teamBalance.carbon >= validation.carbonCost
                      ? 'success' 
                      : 'warning'
                  }
                >
                  <Typography variant="body2">
                    {t('facilityManagement:CURRENT_BALANCE')}: {' '}
                    <MonetizationOn fontSize="small" sx={{ mr: 0.5 }} /> {teamBalance.gold} | <Co2 fontSize="small" sx={{ mr: 0.5 }} /> {teamBalance.carbon}
                  </Typography>
                  {teamBalance.gold < validation.goldCost && (
                    <Typography variant="caption" color="error">
                      {t('facilityManagement:INSUFFICIENT_GOLD')}
                    </Typography>
                  )}
                  {teamBalance.carbon < validation.carbonCost && (
                    <Typography variant="caption" color="error">
                      {t('facilityManagement:INSUFFICIENT_CARBON')}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={building}>
          {t('facilityManagement:CANCEL')}
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={building}>
            {t('facilityManagement:BACK')}
          </Button>
        )}
        
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceedToNext() || loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {t('facilityManagement:NEXT')}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleBuild}
            disabled={!validation?.canBuild || building}
            startIcon={building ? <CircularProgress size={16} /> : <BuildOutlined />}
            color="primary"
          >
            {building ? t('facilityManagement:BUILDING') : t('facilityManagement:BUILD_FACILITY')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BuildFacilityModal;