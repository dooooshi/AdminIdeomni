'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Badge,
  TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle,
  Error as ErrorIcon,
  Warning as WarningIcon,
  GetApp as RetrieveIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { MtoType1Delivery } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { enqueueSnackbar } from 'notistack';
import { format } from 'date-fns';

interface MtoType1DeliveryListProps {
  teamId?: string;
  requirementId?: number;
  onRefresh?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`delivery-tabpanel-${index}`}
      aria-labelledby={`delivery-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const statusIcons: Record<string, React.ReactElement> = {
  PENDING: <WarningIcon color="warning" />,
  VALIDATED: <CheckCircle color="info" />,
  SETTLED: <CheckCircle color="success" />,
  REJECTED: <ErrorIcon color="error" />
};

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  VALIDATED: 'info',
  SETTLED: 'success',
  REJECTED: 'error'
};

const MtoType1DeliveryList: React.FC<MtoType1DeliveryListProps> = ({
  teamId,
  requirementId,
  onRefresh
}) => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<MtoType1Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState<MtoType1Delivery | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [retrieveDialogOpen, setRetrieveDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [targetFacilitySpaceId, setTargetFacilitySpaceId] = useState<number>(0);

  useEffect(() => {
    loadDeliveries();
  }, [teamId, requirementId]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await MtoType1Service.getTeamDeliveries(teamId, requirementId);
      setDeliveries(data);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
      enqueueSnackbar(t('mto.student.errors.loadDeliveriesFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelDelivery = async () => {
    if (!selectedDelivery) return;

    setCancelling(true);
    try {
      await MtoType1Service.cancelDelivery(selectedDelivery.id);
      enqueueSnackbar(t('mto.student.messages.deliveryCancelled'), { variant: 'success' });
      setCancelDialogOpen(false);
      loadDeliveries();
    } catch (error) {
      console.error('Failed to cancel delivery:', error);
      enqueueSnackbar(t('mto.student.errors.cancelFailed'), { variant: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const handleRetrieveProducts = async () => {
    if (!selectedDelivery || !targetFacilitySpaceId) return;

    try {
      await MtoType1Service.retrieveUnsettledProducts(
        selectedDelivery.id,
        targetFacilitySpaceId
      );
      enqueueSnackbar(t('mto.student.messages.productsRetrieved'), { variant: 'success' });
      setRetrieveDialogOpen(false);
      loadDeliveries();
    } catch (error) {
      console.error('Failed to retrieve products:', error);
      enqueueSnackbar(t('mto.student.errors.retrieveFailed'), { variant: 'error' });
    }
  };

  const getFilteredDeliveries = (status?: string) => {
    if (!status) return deliveries;
    return deliveries.filter(d => d.deliveryStatus === status);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('$', '');
  };

  const renderDeliveryTable = (filteredDeliveries: MtoType1Delivery[]) => {
    if (filteredDeliveries.length === 0) {
      return (
        <Alert severity="info">
          {t('mto.student.noDeliveries')}
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('mto.student.deliveryId')}</TableCell>
              <TableCell>{t('mto.student.requirement')}</TableCell>
              <TableCell>{t('mto.student.tile')}</TableCell>
              <TableCell align="right">{t('mto.student.quantity')}</TableCell>
              <TableCell align="right">{t('mto.student.transportFee')}</TableCell>
              <TableCell>{t('mto.student.submittedAt')}</TableCell>
              <TableCell align="center">{t('mto.student.status')}</TableCell>
              <TableCell align="center">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>#{delivery.id}</TableCell>
                <TableCell>
                  <Chip
                    label={`Req #${delivery.requirementId}`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{delivery.tileId}</TableCell>
                <TableCell align="right">{delivery.productQuantity}</TableCell>
                <TableCell align="right">
                  {formatCurrency(delivery.transportationFee)}
                </TableCell>
                <TableCell>
                  {format(new Date(delivery.submittedAt), 'MM/dd/yyyy HH:mm')}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={statusIcons[delivery.deliveryStatus]}
                    label={t(`mto.student.statuses.${delivery.deliveryStatus.toLowerCase()}`)}
                    size="small"
                    color={statusColors[delivery.deliveryStatus]}
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title={t('common.view')}>
                      <IconButton size="small" onClick={() => setSelectedDelivery(delivery)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {delivery.deliveryStatus === 'PENDING' && (
                      <Tooltip title={t('mto.student.cancelDelivery')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setCancelDialogOpen(true);
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {(delivery.deliveryStatus === 'REJECTED' ||
                      delivery.deliveryStatus === 'PENDING') && (
                      <Tooltip title={t('mto.student.retrieveProducts')}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setRetrieveDialogOpen(true);
                          }}
                        >
                          <RetrieveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const pendingCount = getFilteredDeliveries('PENDING').length;
  const settledCount = getFilteredDeliveries('SETTLED').length;
  const rejectedCount = getFilteredDeliveries('REJECTED').length;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {t('mto.student.myDeliveries')}
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => {
            loadDeliveries();
            onRefresh?.();
          }}
        >
          {t('common.refresh')}
        </Button>
      </Stack>

      {/* Statistics */}
      <Stack direction="row" spacing={3} mb={3}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {deliveries.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.totalDeliveries')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">
            {pendingCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.pendingDeliveries')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {settledCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.settledDeliveries')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="error.main">
            {rejectedCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.rejectedDeliveries')}
          </Typography>
        </Paper>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t('common.all')} />
          <Tab
            label={
              <Badge badgeContent={pendingCount} color="warning">
                {t('mto.student.pending')}
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={settledCount} color="success">
                {t('mto.student.settled')}
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={rejectedCount} color="error">
                {t('mto.student.rejected')}
              </Badge>
            }
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderDeliveryTable(deliveries)}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderDeliveryTable(getFilteredDeliveries('PENDING'))}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderDeliveryTable(getFilteredDeliveries('SETTLED'))}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderDeliveryTable(getFilteredDeliveries('REJECTED'))}
        </TabPanel>
      </Paper>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('mto.student.cancelDeliveryTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('mto.student.cancelDeliveryConfirm', {
              id: selectedDelivery?.id
            })}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCancelDelivery}
            color="error"
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {t('mto.student.confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Retrieve Dialog */}
      <Dialog
        open={retrieveDialogOpen}
        onClose={() => setRetrieveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('mto.student.retrieveProductsTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('mto.student.retrieveProductsInfo')}
          </Alert>
          <TextField
            fullWidth
            type="number"
            label={t('mto.student.targetFacilitySpace')}
            value={targetFacilitySpaceId}
            onChange={(e) => setTargetFacilitySpaceId(parseInt(e.target.value) || 0)}
            helperText={t('mto.student.targetFacilityHelper')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetrieveDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleRetrieveProducts}
            color="primary"
            variant="contained"
            startIcon={<RetrieveIcon />}
            disabled={!targetFacilitySpaceId}
          >
            {t('mto.student.retrieveProducts')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType1DeliveryList;