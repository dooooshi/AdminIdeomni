'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  LocalOffer as PriceIcon,
  Inventory2 as StockIcon,
  Home as FacilityIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/store';
import {
  purchaseMaterial,
  fetchFacilitySpaces,
  setPurchaseQuantity,
  selectFacilitySpace,
  resetPurchaseFlow,
  selectPurchaseValidation,
  selectPurchaseTotalCost,
} from '@/store/shopSlice';
import { MaterialOrigin } from '@/types/shop';
import ShopService from '@/lib/services/shopService';

interface PurchaseDialogProps {
  open: boolean;
  onClose: () => void;
}

const originColors: Record<MaterialOrigin, string> = {
  [MaterialOrigin.MINE]: '#8B4513',
  [MaterialOrigin.FARM]: '#228B22',
  [MaterialOrigin.RANCH]: '#FF6347',
  [MaterialOrigin.FACTORY]: '#4682B4',
  [MaterialOrigin.OTHER]: '#808080',
};

export default function PurchaseDialog({ open, onClose }: PurchaseDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    purchaseFlow,
    facilitySpaces,
    facilitySpacesLoading,
    facilitySpacesError,
  } = useSelector((state: RootState) => state.shop);

  const { selectedMaterial, quantity, selectedFacilityId, isProcessing, error } = purchaseFlow;
  const validation = useSelector(selectPurchaseValidation);
  const totalCost = useSelector(selectPurchaseTotalCost);

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open && facilitySpaces.length === 0) {
      dispatch(fetchFacilitySpaces());
    }
  }, [open, facilitySpaces.length, dispatch]);

  useEffect(() => {
    // Auto-select first facility if available
    if (facilitySpaces && facilitySpaces.length > 0 && !selectedFacilityId) {
      console.log('Auto-selecting facility:', facilitySpaces[0]);
      dispatch(selectFacilitySpace(facilitySpaces[0].inventoryId));
    }
  }, [facilitySpaces, selectedFacilityId, dispatch]);

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;

    if (selectedMaterial) {
      const remainingStock = ShopService.getRemainingStock(selectedMaterial);
      if (remainingStock !== null && value > remainingStock) {
        setLocalError(`Maximum available: ${remainingStock}`);
        return;
      }
    }

    setLocalError(null);
    dispatch(setPurchaseQuantity(value));
  };

  const handlePurchase = async () => {
    console.log('Purchase attempt:', {
      selectedMaterial: selectedMaterial?.id,
      selectedFacilityId,
      quantity,
      facilitySpaces: facilitySpaces.length
    });

    if (!selectedMaterial) {
      setLocalError('No material selected');
      return;
    }

    if (!selectedFacilityId) {
      setLocalError('Please select a facility space');
      return;
    }

    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid purchase');
      return;
    }

    try {
      console.log('Sending purchase request:', {
        materialId: selectedMaterial.id,
        quantity,
        facilitySpaceId: selectedFacilityId
      });

      await dispatch(
        purchaseMaterial({
          materialId: selectedMaterial.id,
          quantity,
          facilitySpaceId: selectedFacilityId, // Send as string
        })
      ).unwrap();

      // Success - close dialog
      handleClose();
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setLocalError(err.message || 'Purchase failed');
    }
  };

  const handleClose = () => {
    dispatch(resetPurchaseFlow());
    setLocalError(null);
    onClose();
  };

  if (!selectedMaterial) {
    return null;
  }

  const remainingStock = ShopService.getRemainingStock(selectedMaterial);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Purchase Material</Typography>
          <Chip
            label={selectedMaterial.material.origin}
            size="small"
            sx={{
              backgroundColor: originColors[selectedMaterial.material.origin as MaterialOrigin],
              color: 'white',
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Material Info */}
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedMaterial.material.nameZh}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {selectedMaterial.material.nameEn}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Material #{selectedMaterial.material.materialNumber}
            </Typography>
          </Box>

          {/* Stock Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StockIcon color="action" />
            {remainingStock !== null ? (
              <Typography variant="body1">
                {remainingStock} / {selectedMaterial.quantityToSell} available
              </Typography>
            ) : (
              <Typography variant="body1" color="success.main">
                Unlimited stock
              </Typography>
            )}
          </Box>

          {/* Quantity Selector */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Quantity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isProcessing}
                color="primary"
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                disabled={isProcessing}
                inputProps={{
                  min: 1,
                  max: remainingStock || undefined,
                  style: { textAlign: 'center' },
                }}
                sx={{ width: 100 }}
              />
              <IconButton
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={
                  isProcessing ||
                  (remainingStock !== null && quantity >= remainingStock)
                }
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Facility Selection */}
          <FormControl fullWidth>
            <InputLabel>Delivery Facility Space</InputLabel>
            <Select
              value={selectedFacilityId || ''}
              label="Delivery Facility Space"
              onChange={(e) => dispatch(selectFacilitySpace(e.target.value))}
              disabled={isProcessing || facilitySpacesLoading}
              startAdornment={
                <InputAdornment position="start">
                  <FacilityIcon />
                </InputAdornment>
              }
            >
              {facilitySpacesLoading ? (
                <MenuItem value="">Loading facilities...</MenuItem>
              ) : facilitySpaces.length === 0 ? (
                <MenuItem value="">No facility spaces available</MenuItem>
              ) : (
                facilitySpaces.map((facility) => (
                  <MenuItem key={facility.facilityInstanceId} value={facility.inventoryId}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">{facility.facilityName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Level {facility.level} | Available: {facility.spaceMetrics.availableSpace}/{facility.spaceMetrics.totalSpace}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Divider />

          {/* Cost Summary */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Unit Price:
              </Typography>
              <Typography variant="body2">
                {ShopService.formatPrice(selectedMaterial.unitPrice)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Quantity:
              </Typography>
              <Typography variant="body2">×{quantity}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total Cost:</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {ShopService.formatPrice(totalCost)}
              </Typography>
            </Box>
          </Box>

          {/* Error Messages */}
          {(error || localError || facilitySpacesError || !validation.valid) && (
            <Alert severity="error" onClose={() => setLocalError(null)}>
              {error || localError || facilitySpacesError || validation.error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={handlePurchase}
          variant="contained"
          disabled={
            isProcessing ||
            !selectedFacilityId ||
            !validation.valid ||
            facilitySpaces.length === 0
          }
          startIcon={
            isProcessing ? (
              <CircularProgress size={20} />
            ) : (
              <CartIcon />
            )
          }
        >
          {isProcessing ? 'Processing...' : `Purchase for ${ShopService.formatPrice(totalCost)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}