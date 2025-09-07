'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  FormHelperText,
  Paper,
  Stack,
  Grid
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { Factory } from '@/lib/types/productProduction';
import { ProductFormula } from '@/lib/types/productFormula';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface ProductionQuantityInputProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  selectedFactory: Factory | null;
  selectedFormula: ProductFormula | null;
}

export const ProductionQuantityInput: React.FC<ProductionQuantityInputProps> = ({
  quantity,
  onQuantityChange,
  selectedFactory,
  selectedFormula
}) => {
  const { t } = useTranslation();
  const maxQuantity = selectedFactory?.productionCapability?.maxQuantity || 0;
  
  const handleQuantityChange = (value: string) => {
    const val = parseInt(value) || 1;
    onQuantityChange(Math.min(Math.max(1, val), 9999));
  };

  const incrementQuantity = () => {
    onQuantityChange(Math.min(9999, quantity + 1));
  };

  const decrementQuantity = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('productProduction.setQuantityTitle')}
      </Typography>
      
      <Card sx={{ mt: 3, p: 3 }}>
        <Grid2 container spacing={3} alignItems="center">
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('productProduction.productionQuantity')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <IconButton
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                inputProps={{
                  min: 1,
                  max: 9999,
                  style: { textAlign: 'center' }
                }}
                sx={{ mx: 2, width: 120 }}
              />
              <IconButton
                onClick={incrementQuantity}
                disabled={quantity >= 9999}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <FormHelperText>
              {t('productProduction.maxProducible', { max: maxQuantity })}
            </FormHelperText>
          </Grid2>
          
          <Grid2 size={{ xs: 12, md: 6 }}>
            {selectedFormula && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('productProduction.productionSummary')}
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{t('productProduction.product')}:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {selectedFormula?.productName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{t('productProduction.quantity')}:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{t('productProduction.factory')}:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {selectedFactory?.name}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Grid2>
        </Grid2>
      </Card>
    </Box>
  );
};