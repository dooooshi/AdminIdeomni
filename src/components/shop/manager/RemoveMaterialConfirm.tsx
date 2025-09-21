'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { ShopMaterial } from '@/types/shop';
import ShopService from '@/lib/services/shopService';

interface RemoveMaterialConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  material?: ShopMaterial;
}

export default function RemoveMaterialConfirm({
  open,
  onClose,
  onConfirm,
  material,
}: RemoveMaterialConfirmProps) {
  if (!material) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Remove Material from Shop
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Alert severity="warning">
            Are you sure you want to remove this material from the shop? This action cannot be undone.
          </Alert>

          <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>{material.material.nameEn}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {material.material.nameZh}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Current Price: {ShopService.formatPrice(material.unitPrice)} gold
            </Typography>
            <Typography variant="body2">
              Units Sold: {material.quantitySold}
            </Typography>
          </Box>

          <Typography variant="body2" color="textSecondary">
            Students will no longer be able to purchase this material from the shop.
            You can add it back later if needed.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Remove Material
        </Button>
      </DialogActions>
    </Dialog>
  );
}