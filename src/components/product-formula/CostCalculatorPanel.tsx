'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
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
    finalCost, 
    color 
  }: {
    icon: React.ReactNode;
    label: string;
    setupCost: number;
    variablePercent: number;
    finalCost: number;
    color: string;
  }) => (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography variant="subtitle2">{label}</Typography>
        </Stack>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              {t('productFormula.setup')}
            </Typography>
            <Typography variant="body2">{setupCost}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              {t('productFormula.variable')}
            </Typography>
            <Typography variant="body2">{variablePercent}%</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              {t('productFormula.final')}
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={color}>
              {finalCost}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <CalculateIcon color="primary" />
          <Typography variant="h6">{t('productFormula.costCalculation')}</Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }} variant="outlined">
                <Typography variant="subtitle2" gutterBottom>
                  {t('productFormula.materialCost')}
                </Typography>
                <Typography variant="h5" color="primary">
                  {costs.totalMaterialCost.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('productFormula.baseCostA')}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'grey.50' }} variant="outlined">
                <Typography variant="subtitle2" gutterBottom>
                  {t('productFormula.totalPercent')}
                </Typography>
                <Stack spacing={1}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(totalPercent, 100)}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="h6" color="secondary">
                    {totalPercent.toFixed(1)}%
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2, bgcolor: 'green.50' }} variant="outlined">
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <NatureIcon color="success" />
                  <Typography variant="subtitle2">
                    {t('productFormula.carbonEmission')}
                  </Typography>
                </Stack>
                <Typography variant="h5" color="success.main">
                  {costs.carbonEmission.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('productFormula.environmentalImpact')}
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          {t('productFormula.resourceCosts')}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <CostItem
              icon={<WaterIcon color="primary" />}
              label={t('productFormula.water')}
              setupCost={costs.setupCosts.water}
              variablePercent={costs.variablePercents.water}
              finalCost={costs.waterCost}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CostItem
              icon={<PowerIcon color="warning" />}
              label={t('productFormula.power')}
              setupCost={costs.setupCosts.power}
              variablePercent={costs.variablePercents.power}
              finalCost={costs.powerCost}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CostItem
              icon={<MoneyIcon color="success" />}
              label={t('productFormula.gold')}
              setupCost={costs.setupCosts.gold}
              variablePercent={costs.variablePercents.gold}
              finalCost={costs.goldCost.toFixed(2)}
              color="success.main"
            />
          </Grid>
        </Grid>

        {(materials.length === 0 || craftCategories.length === 0) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              {materials.length === 0 && t('productFormula.noMaterialsWarning')}
              {materials.length === 0 && craftCategories.length === 0 && ' '}
              {craftCategories.length === 0 && t('productFormula.noCategoriesWarning')}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('productFormula.formulaExplanation')}
        </Typography>
        <Stack spacing={1}>
          <Typography variant="caption">
            • {t('productFormula.waterFormula')}: {costs.setupCosts.water} + ({costs.totalMaterialCost.toFixed(2)} × {costs.variablePercents.water}%) = {costs.waterCost}
          </Typography>
          <Typography variant="caption">
            • {t('productFormula.powerFormula')}: {costs.setupCosts.power} + ({costs.totalMaterialCost.toFixed(2)} × {costs.variablePercents.power}%) = {costs.powerCost}
          </Typography>
          <Typography variant="caption">
            • {t('productFormula.goldFormula')}: {costs.setupCosts.gold} + ({costs.totalMaterialCost.toFixed(2)} × {costs.variablePercents.gold}%) = {costs.goldCost.toFixed(2)}
          </Typography>
          <Typography variant="caption">
            • {t('productFormula.carbonFormula')}: Σ(materials) × (1 + {totalPercent.toFixed(1)}%) = {costs.carbonEmission.toFixed(2)}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CostCalculatorPanel;