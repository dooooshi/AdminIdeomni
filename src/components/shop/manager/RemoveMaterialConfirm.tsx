'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
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
  const { t } = useTranslation();

  if (!material) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {t('shop.REMOVE_CONFIRM_TITLE')}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Alert severity="warning">
            {t('shop.REMOVE_CONFIRM_MESSAGE', { material: material.material.nameEn || material.material.nameZh })}
          </Alert>

          <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>{material.material.nameEn}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {material.material.nameZh}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('shop.CURRENT_PRICE')}: {ShopService.formatPrice(material.unitPrice)}
            </Typography>
            <Typography variant="body2">
              {t('shop.QUANTITY')}: {material.quantitySold}
            </Typography>
          </Box>

          <Typography variant="body2" color="textSecondary">
            {t('shop.REMOVE_CONFIRM_MESSAGE', { material: material.material.nameEn || material.material.nameZh })}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('shop.CANCEL')}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {t('shop.REMOVE')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}