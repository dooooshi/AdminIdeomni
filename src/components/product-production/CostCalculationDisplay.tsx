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
  ListItemIcon,
  Grid
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
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
          
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  {t('productProduction.totalProductionCost')}
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatCurrency(costs.finalCosts.totalCost)}
                </Typography>
              </Paper>
            </Grid2>
            
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  {t('productProduction.expectedOutput')}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatNumber(output.expectedQuantity)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('productProduction.yieldRate', { rate: output.combinedYield.toFixed(1) })}%
                </Typography>
              </Paper>
            </Grid2>
          </Grid2>

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
                  {t('productProduction.spaceAfterProduction')}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatNumber(space.spaceAfterProduction)} / {formatNumber(space.currentAvailableSpace + space.currentUsedSpace)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(space.spaceAfterProduction / (space.currentAvailableSpace + space.currentUsedSpace)) * 100}
                color={space.hasEnoughSpace ? 'primary' : 'error'}
              />
            </Box>
            
            {!space.hasEnoughSpace && (
              <Alert severity="error">
                {t('productProduction.insufficientSpace')}
              </Alert>
            )}
            
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('productProduction.materialSpaceFreed')}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    -{formatNumber(space.materialSpaceToFree)}
                  </Typography>
                </Paper>
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('productProduction.productSpaceNeeded')}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    +{formatNumber(space.productSpaceNeeded)}
                  </Typography>
                </Paper>
              </Grid2>
            </Grid2>
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
              label={`${formatNumber(output.carbonEmission)} CO₂`}
              color="warning"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
};