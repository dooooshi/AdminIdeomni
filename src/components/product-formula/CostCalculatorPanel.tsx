'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import {
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon,
  Nature as NatureIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { 
  MaterialRequirement, 
  ProductFormulaCraftCategory,
  CostCalculation 
} from '@/lib/types/productFormula';
import ProductFormulaService from '@/lib/services/productFormulaService';

interface CostCalculatorPanelProps {
  materials: MaterialRequirement[];
  craftCategories: ProductFormulaCraftCategory[];
}

const CostCalculatorPanel: React.FC<CostCalculatorPanelProps> = ({
  materials,
  craftCategories
}) => {
  const { t } = useTranslation();

  const calculateCosts = (): CostCalculation & {
    setupCosts: { water: number; power: number; gold: number };
    variablePercents: { water: number; power: number; gold: number };
  } => {
    const costs = ProductFormulaService.calculateFormulaCost(materials, craftCategories);
    
    const setupCosts = craftCategories.reduce(
      (total, cc) => {
        // Handle both new nested structure and legacy flat structure
        if (cc.craftCategory?.costs) {
          return {
            water: total.water + (cc.craftCategory.costs.fixed.water || 0),
            power: total.power + (cc.craftCategory.costs.fixed.power || 0),
            gold: total.gold + (cc.craftCategory.costs.fixed.gold || 0)
          };
        } else {
          return {
            water: total.water + (cc.craftCategory?.fixedWaterCost || 0),
            power: total.power + (cc.craftCategory?.fixedPowerCost || 0),
            gold: total.gold + (cc.craftCategory?.fixedGoldCost || 0)
          };
        }
      },
      { water: 0, power: 0, gold: 0 }
    );

    const variablePercents = craftCategories.reduce(
      (total, cc) => {
        // Handle both new nested structure and legacy flat structure
        if (cc.craftCategory?.costs) {
          return {
            water: total.water + (cc.craftCategory.costs.variable.water || 0),
            power: total.power + (cc.craftCategory.costs.variable.power || 0),
            gold: total.gold + (cc.craftCategory.costs.variable.gold || 0)
          };
        } else {
          return {
            water: total.water + (cc.craftCategory?.variableWaterPercent || 0),
            power: total.power + (cc.craftCategory?.variablePowerPercent || 0),
            gold: total.gold + (cc.craftCategory?.variableGoldPercent || 0)
          };
        }
      },
      { water: 0, power: 0, gold: 0 }
    );

    return {
      ...costs,
      setupCosts,
      variablePercents
    };
  };

  const costs = calculateCosts();
  const totalPercent = costs.variablePercents.water + costs.variablePercents.power + costs.variablePercents.gold;

  const CostItem = ({ 
    icon, 
    label, 
    setupCost, 
    variablePercent, 
    color 
  }: {
    icon: React.ReactNode;
    label: string;
    setupCost: number;
    variablePercent: number;
    color: string;
  }) => (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography variant="subtitle2">{label}</Typography>
        </Stack>
        <Grid2 container spacing={1}>
          <Grid2 size={6}>
            <Typography variant="caption" color="text.secondary">
              {t('productFormula.setupCost')}
            </Typography>
            <Typography variant="h6" color={color}>
              {setupCost}
            </Typography>
          </Grid2>
          <Grid2 size={6}>
            <Typography variant="caption" color="text.secondary">
              {t('productFormula.percent')}
            </Typography>
            <Typography variant="h6" color={color}>
              {variablePercent}%
            </Typography>
          </Grid2>
        </Grid2>
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <CalculateIcon color="primary" />
        <Typography variant="h6">{t('productFormula.costBreakdown')}</Typography>
      </Stack>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <CostItem
            icon={<WaterIcon color="primary" />}
            label={t('productFormula.water')}
            setupCost={costs.setupCosts.water}
            variablePercent={costs.variablePercents.water}
            color="primary.main"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <CostItem
            icon={<PowerIcon color="warning" />}
            label={t('productFormula.power')}
            setupCost={costs.setupCosts.power}
            variablePercent={costs.variablePercents.power}
            color="warning.main"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <CostItem
            icon={<MoneyIcon color="success" />}
            label={t('productFormula.gold')}
            setupCost={costs.setupCosts.gold}
            variablePercent={costs.variablePercents.gold}
            color="success.main"
          />
        </Grid2>
      </Grid2>

      {(materials.length === 0 || craftCategories.length === 0) && (
        <Box sx={{ mt: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.12)' : 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'warning.light' : 'warning.dark' }}>
            {materials.length === 0 && t('productFormula.noMaterialsWarning')}
            {materials.length === 0 && craftCategories.length === 0 && ' '}
            {craftCategories.length === 0 && t('productFormula.noCategoriesWarning')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CostCalculatorPanel;