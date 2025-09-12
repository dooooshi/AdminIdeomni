'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PowerSettingsNew as PowerIcon,
  History as HistoryIcon,
  WaterDrop as WaterIcon,
  CellTower as BaseStationIcon,
  LocalFireDepartment as FireStationIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CheckCircle as ConnectedIcon,
  Cancel as DisconnectedIcon,
  Schedule as PendingIcon,
  Block as RejectedIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import infrastructureService from '@/lib/services/infrastructureService';

interface HistoryFilter {
  infrastructureType?: string;
  operationType?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  role?: 'PROVIDER' | 'CONSUMER';
}

const InfrastructureHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>({
    dateFrom: null,
    dateTo: null,
  });

  useEffect(() => {
    loadHistory();
  }, [tabValue, filter]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        ...filter,
        dateFrom: filter.dateFrom?.toISOString(),
        dateTo: filter.dateTo?.toISOString(),
      };

      if (tabValue === 0) {
        // Connection history
        params.infrastructureType = filter.infrastructureType || undefined;
      } else {
        // Service history
        params.serviceType = filter.infrastructureType || undefined;
      }

      const data = await infrastructureService.getTeamInfrastructureHistory(params);
      // Ensure data is always an array
      setHistoryData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_LOADING_HISTORY'));
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof HistoryFilter, value: any) => {
    setFilter(prev => ({ ...prev, [field]: value }));
  };

  const getOperationTypeIcon = (type: string) => {
    switch (type) {
      case 'CONNECTION_REQUESTED':
      case 'SUBSCRIPTION_REQUESTED':
        return <PendingIcon fontSize="small" color="action" />;
      case 'CONNECTION_ACCEPTED':
      case 'SUBSCRIPTION_ACCEPTED':
        return <ConnectedIcon fontSize="small" color="success" />;
      case 'CONNECTION_REJECTED':
      case 'SUBSCRIPTION_REJECTED':
        return <RejectedIcon fontSize="small" color="error" />;
      case 'CONNECTION_DISCONNECTED':
        return <DisconnectedIcon fontSize="small" color="error" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getInfrastructureIcon = (type: string) => {
    switch (type) {
      case 'WATER':
        return <WaterIcon fontSize="small" />;
      case 'POWER':
        return <PowerIcon fontSize="small" />;
      case 'BASE_STATION':
        return <BaseStationIcon fontSize="small" />;
      case 'FIRE_STATION':
        return <FireStationIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getOperationTypeColor = (type: string) => {
    if (type.includes('ACCEPTED')) return 'success';
    if (type.includes('REJECTED') || type.includes('DISCONNECTED')) return 'error';
    if (type.includes('REQUESTED')) return 'warning';
    if (type.includes('CANCELLED')) return 'default';
    return 'info';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const renderHistoryTable = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!Array.isArray(historyData) || historyData.length === 0) {
      return (
        <Alert severity="info">
          {t('infrastructure.NO_HISTORY_RECORDS')}
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('infrastructure.TIMESTAMP')}</TableCell>
              <TableCell>{t('infrastructure.OPERATION')}</TableCell>
              <TableCell>{t('infrastructure.TYPE')}</TableCell>
              <TableCell>{t('infrastructure.PROVIDER')}</TableCell>
              <TableCell>{t('infrastructure.CONSUMER')}</TableCell>
              <TableCell>{t('infrastructure.FACILITY')}</TableCell>
              <TableCell>{t('infrastructure.PERFORMED_BY')}</TableCell>
              <TableCell>{t('infrastructure.DETAILS')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historyData.map((record, index) => (
              <TableRow key={record.id || index}>
                <TableCell>{formatDate(record.timestamp)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getOperationTypeIcon(record.operationType)}
                    <Chip
                      label={t(`infrastructure.${record.operationType}`)}
                      size="small"
                      color={getOperationTypeColor(record.operationType)}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getInfrastructureIcon(
                      record.infrastructureType || 
                      record.serviceType || 
                      record.details?.connectionType || 
                      record.details?.serviceType
                    )}
                    {t(`infrastructure.${
                      record.infrastructureType || 
                      record.serviceType || 
                      record.details?.connectionType || 
                      record.details?.serviceType || 
                      'UNKNOWN'
                    }`)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {record.providerTeam?.name || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {record.consumerTeam?.name || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {record.providerFacilityId && (
                      <Typography variant="caption" color="text.secondary">
                        P: {record.details?.providerFacilityType} L{record.details?.providerFacilityLevel}
                      </Typography>
                    )}
                    {record.consumerFacilityId && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        C: {record.details?.consumerFacilityType} L{record.details?.consumerFacilityLevel}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {record.performedByUser?.name || record.performedBy}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip 
                    title={
                      <Box>
                        {record.details?.reason && (
                          <Typography variant="caption">
                            {t('infrastructure.REASON')}: {record.details.reason}
                          </Typography>
                        )}
                        {record.details?.eventData?.proposedUnitPrice && (
                          <Typography variant="caption" display="block">
                            {t('infrastructure.UNIT_PRICE')}: ${record.details.eventData.proposedUnitPrice}
                          </Typography>
                        )}
                        {record.details?.eventData?.distance && (
                          <Typography variant="caption" display="block">
                            {t('infrastructure.DISTANCE')}: {record.details.eventData.distance}
                          </Typography>
                        )}
                      </Box>
                    }
                  >
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <IdeomniPageSimple
      header={
        <Box sx={{ p: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('infrastructure.DASHBOARD')}
            </Link>
            <Link color="inherit" href="/infrastructure" underline="hover">
              <PowerIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('infrastructure.INFRASTRUCTURE_MANAGEMENT')}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('infrastructure.INFRASTRUCTURE_HISTORY')}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('infrastructure.INFRASTRUCTURE_HISTORY')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('infrastructure.VIEW_CONNECTION_SERVICE_HISTORY')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadHistory}
              disabled={loading}
            >
              {t('infrastructure.REFRESH')}
            </Button>
          </Box>
        </Box>
      }
      content={
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filter Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{t('infrastructure.FILTERS')}</Typography>
              </Box>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      label={t('infrastructure.ROLE')}
                      value={filter.role || ''}
                      onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                    >
                      <MenuItem value="">{t('infrastructure.ALL')}</MenuItem>
                      <MenuItem value="PROVIDER">{t('infrastructure.AS_PROVIDER')}</MenuItem>
                      <MenuItem value="CONSUMER">{t('infrastructure.AS_CONSUMER')}</MenuItem>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      label={t('infrastructure.INFRASTRUCTURE_TYPE')}
                      value={filter.infrastructureType || ''}
                      onChange={(e) => handleFilterChange('infrastructureType', e.target.value || undefined)}
                    >
                      <MenuItem value="">{t('infrastructure.ALL')}</MenuItem>
                      {tabValue === 0 ? [
                        <MenuItem key="water" value="WATER">{t('infrastructure.WATER')}</MenuItem>,
                        <MenuItem key="power" value="POWER">{t('infrastructure.POWER')}</MenuItem>
                      ] : [
                        <MenuItem key="base" value="BASE_STATION">{t('infrastructure.BASE_STATION')}</MenuItem>,
                        <MenuItem key="fire" value="FIRE_STATION">{t('infrastructure.FIRE_STATION')}</MenuItem>
                      ]}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label={t('infrastructure.DATE_FROM')}
                      value={filter.dateFrom}
                      onChange={(date) => handleFilterChange('dateFrom', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label={t('infrastructure.DATE_TO')}
                      value={filter.dateTo}
                      onChange={(date) => handleFilterChange('dateTo', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </CardContent>
          </Card>

          {/* Tabs for Connection vs Service History */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab 
                label={t('infrastructure.CONNECTION_HISTORY')}
                icon={<PowerIcon />}
                iconPosition="start"
              />
              <Tab 
                label={t('infrastructure.SERVICE_HISTORY')}
                icon={<FireStationIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* History Table */}
          {renderHistoryTable()}
        </Box>
      }
    />
  );
};

export default InfrastructureHistoryPage;