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
  Chip
} from '@mui/material';
import {
  Water as WaterIcon,
  Bolt as PowerIcon,
  MonetizationOn as GoldIcon,
  Park as EcoIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { CostCalculation } from '@/lib/types/managerProductFormula';

interface ManagerCostCalculatorPanelProps {
  costs: CostCalculation;
}

const ManagerCostCalculatorPanel: React.FC<ManagerCostCalculatorPanelProps> = ({ costs }) => {
  const { t } = useTranslation();

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <CalculateIcon color="primary" />
        <Typography variant="h6">
          {t('managerProductFormula.costCalculation')}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('managerProductFormula.materialCost')}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            ${formatNumber(costs.totalMaterialCost)}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('managerProductFormula.carbonEmission')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <EcoIcon color="success" fontSize="small" />
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {formatNumber(costs.productFormulaCarbonEmission, 3)}
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('managerProductFormula.waterCosts')}
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <WaterIcon color="info" fontSize="small" />
                <Typography variant="body2">
                  {t('managerProductFormula.setupCost')}
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="medium">
                {costs.totalSetupWaterCost}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {t('managerProductFormula.variablePercent')}
              </Typography>
              <Chip
                label={`${formatNumber(costs.totalWaterPercent)}%`}
                size="small"
                color="info"
              />
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('managerProductFormula.powerCosts')}
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <PowerIcon color="warning" fontSize="small" />
                <Typography variant="body2">
                  {t('managerProductFormula.setupCost')}
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="medium">
                {costs.totalSetupPowerCost}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {t('managerProductFormula.variablePercent')}
              </Typography>
              <Chip
                label={`${formatNumber(costs.totalPowerPercent)}%`}
                size="small"
                color="warning"
              />
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('managerProductFormula.goldCosts')}
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <GoldIcon color="secondary" fontSize="small" />
                <Typography variant="body2">
                  {t('managerProductFormula.setupCost')}
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="medium">
                ${formatNumber(costs.totalSetupGoldCost)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                {t('managerProductFormula.variablePercent')}
              </Typography>
              <Chip
                label={`${formatNumber(costs.totalGoldPercent)}%`}
                size="small"
                color="secondary"
              />
            </Stack>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="medium">
              {t('managerProductFormula.totalVariablePercent')}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {formatNumber(costs.totalPercent)}%
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {t('managerProductFormula.calculationFormula')}:
            </Typography>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
              {t('managerProductFormula.finalWater')} = {costs.totalSetupWaterCost} + ({formatNumber(costs.totalMaterialCost)} × {formatNumber(costs.totalWaterPercent)}%)
            </Typography>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
              {t('managerProductFormula.finalPower')} = {costs.totalSetupPowerCost} + ({formatNumber(costs.totalMaterialCost)} × {formatNumber(costs.totalPowerPercent)}%)
            </Typography>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
              {t('managerProductFormula.finalGold')} = ${formatNumber(costs.totalSetupGoldCost)} + (${formatNumber(costs.totalMaterialCost)} × {formatNumber(costs.totalGoldPercent)}%)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ManagerCostCalculatorPanel;