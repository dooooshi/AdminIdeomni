'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Inventory as InventoryIcon,
  Water as WaterIcon,
  ElectricBolt as ElectricBoltIcon,
  AttachMoney as MoneyIcon,
  Storage as StorageIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LocalShipping as ShippingIcon,
  Co2 as CarbonIcon
} from '@mui/icons-material';
import { CostCalculationResponse } from '@/lib/types/productProduction';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface CostCalculationDisplayProps {
  costData: CostCalculationResponse['data'] | null;
  loading?: boolean;
  error?: string | null;
}

export const CostCalculationDisplay: React.FC<CostCalculationDisplayProps> = ({
  costData,
  loading = false,
  error = null
}) => {
  const { t } = useTranslation();
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDecimal = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  if (loading) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('productProduction.calculatingCosts')}
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        <AlertTitle>{t('productProduction.costCalculationError')}</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!costData) {
    return null;
  }

  const { costs, resources, output, space, validation } = costData;
  const canProduce = validation?.canProduce || false;

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      {/* Validation Status */}
      {!canProduce && (
        <Alert severity="error">
          <AlertTitle>{t('productProduction.cannotProduce')}</AlertTitle>
          {validation?.validations?.filter(v => !v.passed).map((v, idx) => (
            <Box key={idx} sx={{ mt: idx > 0 ? 1 : 0 }}>
              • {v.message}
            </Box>
          ))}
        </Alert>
      )}

      {/* Cost Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('productProduction.costBreakdown')}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  {t('productProduction.totalProductionCost')}
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatCurrency(costs.finalCosts.totalCost)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  {t('productProduction.expectedOutput')}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatDecimal(output.expectedQuantity, 2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('productProduction.yieldRate', { rate: output.combinedYield.toFixed(1) })}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Cost Components */}
          <Typography variant="subtitle1" gutterBottom>
            {t('productProduction.costComponents')}
          </Typography>
          <List dense>
            {costs.breakdown.map((item, idx) => (
              <ListItem key={idx}>
                <ListItemIcon>
                  {item.component === 'materials' && <InventoryIcon color="action" />}
                  {item.component === 'water' && <WaterIcon color="info" />}
                  {item.component === 'power' && <ElectricBoltIcon color="warning" />}
                  {item.component === 'gold' && <MoneyIcon color="success" />}
                </ListItemIcon>
                <ListItemText
                  primary={t(`productProduction.${item.component}`)}
                  secondary={`${item.percentage.toFixed(1)}%`}
                />
                <Typography variant="body2">
                  {formatCurrency(item.amount)}
                </Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Materials Required */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('productProduction.materialsRequired')}
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('productProduction.material')}</TableCell>
                  <TableCell align="right">{t('productProduction.required')}</TableCell>
                  <TableCell align="right">{t('productProduction.available')}</TableCell>
                  <TableCell align="right">{t('productProduction.unitCost')}</TableCell>
                  <TableCell align="right">{t('productProduction.totalCost')}</TableCell>
                  <TableCell align="center">{t('productProduction.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.materials.map((material, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{material.materialName}</TableCell>
                    <TableCell align="right">{formatNumber(material.quantityRequired)}</TableCell>
                    <TableCell align="right">{formatNumber(material.quantityAvailable)}</TableCell>
                    <TableCell align="right">{formatCurrency(material.unitCost)}</TableCell>
                    <TableCell align="right">{formatCurrency(material.totalCost)}</TableCell>
                    <TableCell align="center">
                      {material.sufficient ? (
                        <CheckIcon color="success" fontSize="small" />
                      ) : (
                        <ErrorIcon color="error" fontSize="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Space Impact */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('productProduction.spaceImpact')}
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {t('productProduction.currentAvailableSpace')}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatDecimal(space?.currentAvailableSpace ?? 0, 3)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {t('productProduction.spaceAfterProduction')}
                </Typography>
                <Typography variant="body2" fontWeight="medium" color={(space?.netSpaceChange ?? 0) > 0 ? 'success.main' : 'text.primary'}>
                  {formatDecimal(space?.spaceAfterProduction ?? 0, 3)}
                </Typography>
              </Box>
            </Box>

            {space && !space.hasEnoughSpace && (
              <Alert severity="error">
                {t('productProduction.insufficientSpace')}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('productProduction.materialSpaceFreed')}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    +{formatDecimal(space?.materialSpaceToFree ?? 0, 3)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('productProduction.productSpaceUsed')}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="error.main">
                    -{formatDecimal(space?.productSpaceNeeded ?? 0, 3)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('productProduction.netSpaceChange')}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color={(space?.netSpaceChange ?? 0) > 0 ? 'success.main' : (space?.netSpaceChange ?? 0) < 0 ? 'error.main' : 'text.primary'}
                  >
                    {(space?.netSpaceChange ?? 0) > 0 ? '+' : ''}{formatDecimal(space?.netSpaceChange ?? 0, 3)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CarbonIcon />
            <Typography variant="subtitle1">
              {t('productProduction.carbonEmission')}
            </Typography>
            <Chip
              label={`${formatDecimal(output.carbonEmission, 2)} CO₂`}
              color="warning"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
};