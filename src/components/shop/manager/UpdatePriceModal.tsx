'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import { AppDispatch, RootState } from '@/store/store';
import { updateMaterialPrice, fetchMaterials } from '@/store/shopSlice';
import ShopService from '@/lib/services/shopService';

interface UpdatePriceModalProps {
  open: boolean;
  onClose: () => void;
  materialId: number;
}

export default function UpdatePriceModal({ open, onClose, materialId }: UpdatePriceModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const material = useSelector((state: RootState) =>
    state.shop.materials.find((m) => m.id === materialId)
  );

  const [newPrice, setNewPrice] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && material) {
      setNewPrice(material.unitPrice.toString());
    }
    if (!open) {
      setNewPrice('');
      setReason('');
      setError(null);
    }
  }, [open, material]);

  const handleSubmit = async () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      return;
    }

    if (material && price === parseFloat(material.unitPrice)) {
      setError('New price must be different from current price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(
        updateMaterialPrice({
          materialId,
          request: {
            unitPrice: price,
            reason: reason.trim() || undefined,
          },
        })
      ).unwrap();

      await dispatch(fetchMaterials());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  if (!material) {
    return null;
  }

  const priceChange = parseFloat(newPrice) - parseFloat(material.unitPrice);
  const priceChangePercent = (priceChange / parseFloat(material.unitPrice)) * 100;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Price - {material.material.nameEn}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Current Price Display */}
          <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Current Price
            </Typography>
            <Typography variant="h6">
              {ShopService.formatPrice(material.unitPrice)} gold
            </Typography>
          </Box>

          {/* New Price Input */}
          <TextField
            label="New Price"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">Gold:</InputAdornment>,
              inputProps: { min: 0.01, step: 0.01 },
            }}
            helperText="Enter the new price per unit"
          />

          {/* Price Change Indicator */}
          {newPrice && parseFloat(newPrice) !== parseFloat(material.unitPrice) && (
            <Box
              sx={{
                p: 2,
                backgroundColor: priceChange > 0 ? 'success.light' : 'error.light',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                Price {priceChange > 0 ? 'Increase' : 'Decrease'}:{' '}
                <strong>
                  {priceChange > 0 ? '+' : ''}
                  {ShopService.formatPrice(priceChange)} gold ({priceChangePercent.toFixed(1)}%)
                </strong>
              </Typography>
            </Box>
          )}

          {/* Reason Input */}
          <TextField
            label="Reason for Change (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            fullWidth
            helperText="Provide a reason for this price change"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            !newPrice ||
            parseFloat(newPrice) === parseFloat(material.unitPrice) ||
            parseFloat(newPrice) <= 0
          }
        >
          {loading ? 'Updating...' : 'Update Price'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}