'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,

  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Water as WaterIcon,
  Power as PowerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ResourceTransaction, ResourceType, TransactionRole } from '@/types/resourceConsumption';
import resourceConsumptionService from '@/lib/services/resourceConsumptionService';

interface ResourceConsumptionPanelProps {
  facilityId?: string;
  teamId?: string;
  activityId?: string;
  showTransactions?: boolean;
}

const ResourceConsumptionPanel: React.FC<ResourceConsumptionPanelProps> = ({
  facilityId,
  teamId,
  activityId,
  showTransactions = true
}) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<ResourceTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    waterTotal: 0,
    waterCost: 0,
    powerTotal: 0,
    powerCost: 0,
    totalCost: 0,
    transactionCount: 0
  });

  useEffect(() => {
    loadResourceData();
  }, [facilityId, teamId, activityId]);

  const loadResourceData = async () => {
    setLoading(true);
    try {
      const history = await resourceConsumptionService.getConsumptionHistory({
        facilityId,
        teamId,
        limit: showTransactions ? 10 : 100
      });

      setTransactions(history);
      
      // Calculate summary
      const summary = history.reduce((acc, tx) => {
        if (tx.resourceType === ResourceType.WATER) {
          acc.waterTotal += tx.quantity;
          acc.waterCost += tx.totalAmount;
        } else if (tx.resourceType === ResourceType.POWER) {
          acc.powerTotal += tx.quantity;
          acc.powerCost += tx.totalAmount;
        }
        acc.totalCost += tx.totalAmount;
        acc.transactionCount++;
        return acc;
      }, {
        waterTotal: 0,
        waterCost: 0,
        powerTotal: 0,
        powerCost: 0,
        totalCost: 0,
        transactionCount: 0
      });

      setSummary(summary);
    } catch (error) {
      console.error('Failed to load resource data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), 'MM/dd HH:mm');
    } catch {
      return String(date);
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    return type === ResourceType.WATER ? <WaterIcon /> : <PowerIcon />;
  };

  const getResourceColor = (type: ResourceType) => {
    return type === ResourceType.WATER ? 'primary' : 'warning';
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('production.resourceConsumption')}
          </Typography>
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={loadResourceData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WaterIcon color="primary" />
                      <Typography variant="subtitle2">
                        {t('production.water')}
                      </Typography>
                    </Box>
                    <Typography variant="h5">
                      {summary.waterTotal.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('production.units')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="primary">
                        ${summary.waterCost.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PowerIcon color="warning" />
                      <Typography variant="subtitle2">
                        {t('production.power')}
                      </Typography>
                    </Box>
                    <Typography variant="h5">
                      {summary.powerTotal.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('production.units')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="warning.main">
                        ${summary.powerCost.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MoneyIcon color="success" />
                      <Typography variant="subtitle2">
                        {t('production.totalCost')}
                      </Typography>
                    </Box>
                    <Typography variant="h5">
                      ${summary.totalCost.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('production.gold')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingUpIcon color="info" />
                      <Typography variant="subtitle2">
                        {t('production.transactions')}
                      </Typography>
                    </Box>
                    <Typography variant="h5">
                      {summary.transactionCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('production.total')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {showTransactions && transactions.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('production.recentTransactions')}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('production.resource')}</TableCell>
                        <TableCell align="right">{t('production.quantity')}</TableCell>
                        <TableCell align="right">{t('production.unitPrice')}</TableCell>
                        <TableCell align="right">{t('production.amount')}</TableCell>
                        <TableCell>{t('production.purpose')}</TableCell>
                        <TableCell>{t('production.status.label')}</TableCell>
                        <TableCell>{t('production.date')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.slice(0, 5).map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getResourceIcon(tx.resourceType)}
                              <Typography variant="body2">
                                {tx.resourceType}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {tx.quantity.toFixed(0)}
                          </TableCell>
                          <TableCell align="right">
                            ${tx.unitPrice.toFixed(4)}
                          </TableCell>
                          <TableCell align="right">
                            ${tx.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {tx.purpose}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tx.status}
                              size="small"
                              color={tx.status === 'SUCCESS' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {formatDate(tx.transactionDate)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ResourceConsumptionPanel;