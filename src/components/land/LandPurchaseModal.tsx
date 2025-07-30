'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Slider,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon,
  Eco as EcoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import {
  AvailableTile,
  LandPurchaseRequest,
  PurchaseValidation,
  LandPurchase
} from '@/types/land';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: '500px',
    maxWidth: '700px',
  },
}));

const CostCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.light}10, ${theme.palette.primary.main}05)`,
  border: `1px solid ${theme.palette.primary.main}20`,
}));

const ErrorCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.error.light}10, ${theme.palette.error.main}05)`,
  border: `1px solid ${theme.palette.error.main}20`,
}));

interface LandPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  tile: AvailableTile | null;
  onPurchaseComplete: (purchase: LandPurchase) => void;
}

const LandPurchaseModal: React.FC<LandPurchaseModalProps> = ({
  open,
  onClose,
  tile,
  onPurchaseComplete
}) => {
  // Form state
  const [area, setArea] = useState(1);
  const [description, setDescription] = useState('');
  const [enablePriceProtection, setEnablePriceProtection] = useState(false);
  const [maxGoldCost, setMaxGoldCost] = useState<number | undefined>();
  const [maxCarbonCost, setMaxCarbonCost] = useState<number | undefined>();
  
  // Validation and loading states
  const [validation, setValidation] = useState<PurchaseValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or tile changes
  useEffect(() => {
    if (open && tile) {
      resetForm();
      generateDefaultDescription();
    }
  }, [open, tile]);

  // Validate purchase when area changes
  useEffect(() => {
    if (tile && area > 0) {
      validatePurchase();
    }
  }, [tile, area]);

  const resetForm = () => {
    setArea(1); // NEW: Always start with 1 unit (integer only)
    setDescription('');
    setEnablePriceProtection(false);
    setMaxGoldCost(undefined);
    setMaxCarbonCost(undefined);
    setValidation(null);
    setError(null);
  };

  const generateDefaultDescription = () => {
    if (!tile) return;
    setDescription(`Purchase ${area} area on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
  };

  const validatePurchase = async () => {
    if (!tile || area <= 0) return;

    try {
      setValidating(true);
      setError(null);
      
      const validationResult = await LandService.validatePurchase(tile.tileId, area);
      setValidation(validationResult);
    } catch (err: any) {
      console.error('Validation failed:', err);
      setError(LandService.getErrorMessage(err));
      setValidation(null);
    } finally {
      setValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!tile || !validation?.canPurchase) return;

    try {
      setPurchasing(true);
      setError(null);

      const purchaseRequest: LandPurchaseRequest = {
        tileId: tile.tileId,
        area: area,
        description: description || undefined,
      };

      if (enablePriceProtection) {
        if (maxGoldCost) purchaseRequest.maxGoldCost = maxGoldCost;
        if (maxCarbonCost) purchaseRequest.maxCarbonCost = maxCarbonCost;
      }

      const purchase = await LandService.purchaseLand(purchaseRequest);
      onPurchaseComplete(purchase);
      onClose();
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setPurchasing(false);
    }
  };

  const handleAreaChange = (event: Event, newValue: number | number[]) => {
    const newArea = Array.isArray(newValue) ? newValue[0] : newValue;
    const integerArea = Math.round(newArea); // NEW: Ensure integer values
    setArea(integerArea);
    
    // Update description with new area
    if (tile) {
      setDescription(`Purchase ${integerArea} units on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
    }
  };

  const handleClose = () => {
    if (!purchasing) {
      onClose();
    }
  };

  if (!tile) return null;

  const canPurchase = validation?.canPurchase && !purchasing && !validating;
  const totalCost = validation ? (validation.goldCost || 0) + (validation.carbonCost || 0) : 0;

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <ShoppingCartIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Purchase Land - Tile {tile.tileId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {LandService.formatLandType(tile.landType)} · Unlimited area available
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Error Display */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* Area Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Area to Purchase
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={area}
                onChange={handleAreaChange}
                min={1}
                max={100} // Reasonable UI limit, no business limit
                step={1} // NEW: Integer steps only
                marks={[
                  { value: 1, label: '1' },
                  { value: 10, label: '10' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' }
                ]}
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `${Math.round(value)} units`} // Integer display
                disabled={purchasing}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                Selected: {Math.round(area)} units
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available: Unlimited
              </Typography>
            </Box>
          </Box>

          {/* Cost Display */}
          {validating ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Calculating costs...
              </Typography>
            </Box>
          ) : validation ? (
            <CostCard>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Purchase Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <MoneyIcon fontSize="small" color="warning" />
                      <Typography variant="body2">
                        Gold: {LandService.formatCurrency(validation.goldCost || 0, 'gold')}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EcoIcon fontSize="small" color="success" />
                      <Typography variant="body2">
                        Carbon: {LandService.formatCurrency(validation.carbonCost || 0, 'carbon')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" color="primary.main">
                      Total: {LandService.formatCurrency(totalCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost per area: {LandService.formatCurrency(area > 0 ? totalCost / area : 0)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Team Balance Display */}
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Team Gold Balance
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {LandService.formatCurrency(validation.teamGoldBalance || 0, 'gold')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Team Carbon Balance
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {LandService.formatCurrency(validation.teamCarbonBalance || 0, 'carbon')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </CostCard>
          ) : null}

          {/* Validation Errors */}
          {validation && validation.errors && validation.errors.length > 0 && (
            <ErrorCard>
              <CardContent>
                <Typography variant="subtitle2" color="error.main" gutterBottom>
                  Purchase Issues
                </Typography>
                <Stack spacing={1}>
                  {validation.errors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error.main">
                      • {error}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </ErrorCard>
          )}

          {/* Price Protection */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={enablePriceProtection}
                  onChange={(e) => setEnablePriceProtection(e.target.checked)}
                  disabled={purchasing}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <SecurityIcon fontSize="small" />
                  <Typography variant="body2">
                    Enable Price Protection
                  </Typography>
                </Box>
              }
            />
            
            {enablePriceProtection && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Max Gold Cost"
                    type="number"
                    fullWidth
                    size="small"
                    value={maxGoldCost || ''}
                    onChange={(e) => setMaxGoldCost(e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ min: 0, step: 0.01 }}
                    disabled={purchasing}
                    helperText={validation ? `Current: ${(validation.goldCost || 0).toFixed(2)}` : ''}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Carbon Cost"
                    type="number"
                    fullWidth
                    size="small"
                    value={maxCarbonCost || ''}
                    onChange={(e) => setMaxCarbonCost(e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ min: 0, step: 0.01 }}
                    disabled={purchasing}
                    helperText={validation ? `Current: ${(validation.carbonCost || 0).toFixed(2)}` : ''}
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
            disabled={purchasing}
          />

          {/* Purchase Status */}
          {validation && (
            <Box display="flex" justifyContent="center">
              <Chip
                label={validation.canPurchase ? 'Purchase Available' : 'Cannot Purchase'}
                color={validation.canPurchase ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={purchasing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePurchase}
          disabled={!canPurchase}
          startIcon={purchasing ? <CircularProgress size={16} /> : <ShoppingCartIcon />}
        >
          {purchasing ? 'Purchasing...' : `Purchase for ${validation ? LandService.formatCurrency(totalCost) : '...'}`}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default LandPurchaseModal;