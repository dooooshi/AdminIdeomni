'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import {
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { ProductFormula } from '@/lib/types/productFormula';
import { Factory } from '@/lib/types/productProduction';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface FormulaSelectorProps {
  formulas: ProductFormula[];
  selectedFormula: ProductFormula | null;
  selectedFactory: Factory | null;
  onSelectFormula: (formula: ProductFormula) => void;
}

export const FormulaSelector: React.FC<FormulaSelectorProps> = ({
  formulas,
  selectedFormula,
  selectedFactory,
  onSelectFormula
}) => {
  const { t } = useTranslation();
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (formulas.length === 0) {
    return (
      <Card variant="outlined" sx={{ mt: 2, p: 4, textAlign: 'center' }}>
        <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('productProduction.noFormulasAvailable')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('productProduction.noFormulasDescription')}
        </Typography>
      </Card>
    );
  }

  return (
    <Grid2 container spacing={2}>
      {formulas.map((formula) => {
        const isSelected = selectedFormula?.id === formula.id;
        const canProduce = selectedFactory?.productionCapability?.canProduce || false;
        
        return (
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={formula.id}>
            <Card
              variant={isSelected ? 'elevation' : 'outlined'}
              sx={{
                cursor: 'pointer',
                border: isSelected ? 2 : 1,
                borderColor: isSelected ? 'primary.main' : 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { 
                  boxShadow: 3,
                  borderColor: 'primary.light'
                }
              }}
              onClick={() => onSelectFormula(formula)}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {formula.productName}
                  </Typography>
                  {isSelected && (
                    <CheckCircleIcon color="primary" />
                  )}
                </Box>
                
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('productProduction.formulaNumber', { number: formula.formulaNumber })}
                </Typography>
                
                {formula.productDescription && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 1, 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      flexGrow: 1
                    }}
                  >
                    {formula.productDescription}
                  </Typography>
                )}
                
                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      size="small"
                      label={t('productProduction.materialCount', { count: formula.materialCount || 0 })}
                      icon={<InventoryIcon />}
                    />
                    <Chip
                      size="small"
                      label={t('productProduction.processCount', { count: formula.craftCategoryCount || 0 })}
                      icon={<ScienceIcon />}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {t('productProduction.totalCostLabel')}: ${formatNumber(formula.totalMaterialCost || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        );
      })}
    </Grid2>
  );
};