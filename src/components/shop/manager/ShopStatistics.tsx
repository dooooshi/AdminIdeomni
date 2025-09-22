'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Inventory2 as InventoryIcon,
} from '@mui/icons-material';
import { RootState } from '@/store/store';
import { MaterialOrigin, ShopActionType } from '@/types/shop';
import ShopService from '@/lib/services/shopService';

export default function ShopStatistics() {
  const { t } = useTranslation();
  const shopState = useSelector((state: RootState) => state.shop);
  const materials = shopState?.materials || [];
  const shopHistory = shopState?.shopHistory || [];
  const teamTransactions = shopState?.teamTransactions || [];

  // Calculate statistics
  const totalRevenue = (shopHistory || [])
    .filter((h) => h.actionType === ShopActionType.PURCHASE_COMPLETED)
    .reduce((sum, h) => sum + parseFloat(h.newValue?.totalAmount || '0'), 0);

  const totalTransactions = (shopHistory || []).filter(
    (h) => h.actionType === ShopActionType.PURCHASE_COMPLETED
  ).length;

  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Top selling materials
  const materialSales = new Map<string, { count: number; revenue: number; name: string }>();
  (shopHistory || [])
    .filter((h) => h.actionType === ShopActionType.PURCHASE_COMPLETED)
    .forEach((h) => {
      const materialName = h.newValue?.material || 'Unknown';
      const current = materialSales.get(materialName) || { count: 0, revenue: 0, name: materialName };
      current.count += 1;
      current.revenue += parseFloat(h.newValue?.totalAmount || '0');
      materialSales.set(materialName, current);
    });

  const topSellingMaterials = Array.from(materialSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Materials by origin
  const materialsByOrigin = (materials || []).reduce((acc, material) => {
    const origin = material.material.origin;
    acc[origin] = (acc[origin] || 0) + 1;
    return acc;
  }, {} as Record<MaterialOrigin, number>);

  // Price changes
  const priceChanges = (shopHistory || []).filter(
    (h) => h.actionType === ShopActionType.MATERIAL_PRICE_SET
  );
  const priceIncreases = priceChanges.filter(
    (h) => h.previousValue?.price && parseFloat(h.newValue?.price) > parseFloat(h.previousValue.price)
  ).length;
  const priceDecreases = priceChanges.filter(
    (h) => h.previousValue?.price && parseFloat(h.newValue?.price) < parseFloat(h.previousValue.price)
  ).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Revenue Overview */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('shop.TOTAL_REVENUE')}</Typography>
              </Box>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {ShopService.formatPrice(totalRevenue)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {totalTransactions} {t('shop.TRANSACTION_HISTORY')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('shop.AVERAGE_TRANSACTION')}</Typography>
              </Box>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {ShopService.formatPrice(avgTransactionValue)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t('shop.CONFIRM_PURCHASE')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('shop.ACTIVE_MATERIALS')}</Typography>
              </Box>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {materials.length}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t('shop.AVAILABILITY')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Price Changes Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('shop.UPDATE_PRICE')}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="body1">Price Increases: {priceIncreases}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDownIcon color="error" />
                <Typography variant="body1">Price Decreases: {priceDecreases}</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Materials by Origin */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Materials by Origin
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            {Object.entries(materialsByOrigin).map(([origin, count]) => (
              <Box key={origin} sx={{ flex: 1, minWidth: 150 }}>
                <Typography variant="body2" color="textSecondary">
                  {origin}
                </Typography>
                <Typography variant="h6">{count}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={materials.length > 0 ? (count / materials.length) * 100 : 0}
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Top Selling Materials */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Selling Materials
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell align="center">Sales</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topSellingMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No sales data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  topSellingMaterials.map((material, index) => (
                    <TableRow key={material.name}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={`#${index + 1}`} size="small" color="primary" />
                          {material.name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{material.count}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {ShopService.formatPrice(material.revenue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}