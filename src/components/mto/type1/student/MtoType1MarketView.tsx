'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  LocalShipping as DeliveryIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  Science as FormulaIcon
} from '@mui/icons-material';
import { MtoType1TeamView } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { enqueueSnackbar } from 'notistack';
import { formatDistanceToNow, format } from 'date-fns';

interface MtoType1MarketViewProps {
  activityId?: string;
  onViewDetails: (requirement: MtoType1TeamView) => void;
  onMakeDelivery: (requirement: MtoType1TeamView) => void;
}

const MtoType1MarketView: React.FC<MtoType1MarketViewProps> = ({
  activityId = 'default-activity',
  onViewDetails,
  onMakeDelivery
}) => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState<MtoType1TeamView[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'urgent' | 'soon' | 'later'>('all');

  useEffect(() => {
    loadAvailableRequirements();
  }, [activityId]);

  const loadAvailableRequirements = async () => {
    setLoading(true);
    try {
      const data = await MtoType1Service.getAvailableRequirements(activityId);
      setRequirements(data);
    } catch (error) {
      console.error('Failed to load requirements:', error);
      enqueueSnackbar(t('mto.student.errors.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter requirements based on search term
    if (searchTerm) {
      const filtered = requirements.filter(req =>
        req.requirementName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setRequirements(filtered);
    } else {
      loadAvailableRequirements();
    }
  };

  const getFilteredRequirements = () => {
    let filtered = requirements;

    // Apply price filter
    if (priceFilter === 'low') {
      filtered = filtered.filter(r => r.unitPrice < 100);
    } else if (priceFilter === 'medium') {
      filtered = filtered.filter(r => r.unitPrice >= 100 && r.unitPrice < 500);
    } else if (priceFilter === 'high') {
      filtered = filtered.filter(r => r.unitPrice >= 500);
    }

    // Apply time filter (assuming we have a timeRemaining field)
    // This would need to be calculated from settlement time

    return filtered;
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'RELEASED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('$', '');
  };

  const calculateTimeRemaining = (settlementTime: string) => {
    const now = new Date();
    const settlement = new Date(settlementTime);
    const diffHours = Math.floor((settlement.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return { label: formatDistanceToNow(settlement, { addSuffix: true }), urgent: true };
    }
    return { label: formatDistanceToNow(settlement, { addSuffix: true }), urgent: false };
  };

  const calculatePotentialProfit = (requirement: MtoType1TeamView) => {
    const revenue = requirement.potentialRevenue || 0;
    const transportCost = requirement.transportationCosts || 0;
    return revenue - transportCost;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredRequirements = getFilteredRequirements();

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder={t('mto.student.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('mto.student.priceRange')}</InputLabel>
            <Select
              value={priceFilter}
              label={t('mto.student.priceRange')}
              onChange={(e) => setPriceFilter(e.target.value as any)}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="low">{'< 100 Gold'}</MenuItem>
              <MenuItem value="medium">{'100-500 Gold'}</MenuItem>
              <MenuItem value="high">{'> 500 Gold'}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('mto.student.timeRemaining')}</InputLabel>
            <Select
              value={timeFilter}
              label={t('mto.student.timeRemaining')}
              onChange={(e) => setTimeFilter(e.target.value as any)}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="urgent">{t('mto.student.urgent24h')}</MenuItem>
              <MenuItem value="soon">{t('mto.student.soon3days')}</MenuItem>
              <MenuItem value="later">{t('mto.student.later')}</MenuItem>
            </Select>
          </FormControl>

          <Button onClick={handleSearch} variant="contained" startIcon={<SearchIcon />}>
            {t('common.search')}
          </Button>

          <IconButton onClick={loadAvailableRequirements} color="primary">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Statistics Summary */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {filteredRequirements.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.availableRequirements')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {filteredRequirements.filter(r => r.status === 'RELEASED').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.newOpportunities')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">
            {filteredRequirements.filter(r => {
              const timeInfo = calculateTimeRemaining(new Date().toISOString());
              return timeInfo.urgent;
            }).length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.urgentDeliveries')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="info.main">
            {formatCurrency(
              filteredRequirements.reduce((sum, r) => sum + (r.potentialRevenue || 0), 0)
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.totalPotentialRevenue')}
          </Typography>
        </Paper>
      </Stack>

      {/* Requirements Grid */}
      {filteredRequirements.length === 0 ? (
        <Alert severity="info">
          {t('mto.student.noAvailableRequirements')}
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {filteredRequirements.map((requirement) => {
            const timeInfo = calculateTimeRemaining(new Date().toISOString());
            const profit = calculatePotentialProfit(requirement);

            return (
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {requirement.requirementName || `Requirement #${requirement.requirementId}`}
                        </Typography>
                        <Chip
                          label={t(`mto.type1.statuses.${requirement.status.toLowerCase()}`)}
                          size="small"
                          color={getStatusColor(requirement.status)}
                        />
                      </Box>
                      <Tooltip title={t('mto.student.unitPrice')}>
                        <Chip
                          icon={<MoneyIcon />}
                          label={formatCurrency(requirement.unitPrice)}
                          color="primary"
                          variant="outlined"
                        />
                      </Tooltip>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Time Remaining */}
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <TimerIcon fontSize="small" color={timeInfo.urgent ? 'error' : 'action'} />
                      <Typography
                        variant="body2"
                        color={timeInfo.urgent ? 'error' : 'text.secondary'}
                      >
                        {timeInfo.label}
                      </Typography>
                    </Stack>

                    {/* Available Tiles */}
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t('mto.student.availableTiles', {
                          count: requirement.availableTiles?.length || 0
                        })}
                      </Typography>
                    </Stack>

                    {/* Profit Calculation */}
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('mto.student.profitEstimate')}:
                      </Typography>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">
                            {t('mto.student.potentialRevenue')}:
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            +{formatCurrency(requirement.potentialRevenue || 0)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">
                            {t('mto.student.transportationCost')}:
                          </Typography>
                          <Typography variant="caption" color="error.main">
                            -{formatCurrency(requirement.transportationCosts || 0)}
                          </Typography>
                        </Stack>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="bold">
                            {t('mto.student.netProfit')}:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={profit > 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(profit)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>

                    {/* My Deliveries Status */}
                    {requirement.myDeliveries && requirement.myDeliveries.length > 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {t('mto.student.existingDeliveries', {
                          count: requirement.myDeliveries.length
                        })}
                      </Alert>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => onViewDetails(requirement)}
                    >
                      {t('mto.student.viewDetails')}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DeliveryIcon />}
                      onClick={() => onMakeDelivery(requirement)}
                      disabled={requirement.status !== 'RELEASED' && requirement.status !== 'IN_PROGRESS'}
                    >
                      {t('mto.student.makeDelivery')}
                    </Button>
                  </CardActions>
                </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default MtoType1MarketView;