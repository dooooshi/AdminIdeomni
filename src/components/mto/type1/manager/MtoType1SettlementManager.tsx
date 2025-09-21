'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  PlayCircle as SettleIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle,
  Warning as WarningIcon,
  Timer as TimerIcon,
  AttachMoney as MoneyIcon,
  Assessment as AnalyticsIcon
} from '@mui/icons-material';
import { MtoType1Requirement, MtoType1Settlement } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { enqueueSnackbar } from 'notistack';
import { format, differenceInHours, isPast } from 'date-fns';

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
      id={`settlement-tabpanel-${index}`}
      aria-labelledby={`settlement-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const MtoType1SettlementManager: React.FC = () => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState<MtoType1Requirement[]>([]);
  const [settlements, setSettlements] = useState<MtoType1Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequirement, setSelectedRequirement] = useState<MtoType1Requirement | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [settlementDetails, setSettlementDetails] = useState<MtoType1Settlement | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, settleData] = await Promise.all([
        MtoType1Service.getRequirements(),
        MtoType1Service.getSettlements()
      ]);
      setRequirements(reqData);
      setSettlements(settleData);
    } catch (error) {
      console.error('Failed to load data:', error);
      enqueueSnackbar(t('mto.type1.errors.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettlement = async () => {
    if (!selectedRequirement) return;

    setSettling(true);
    try {
      await MtoType1Service.settleRequirement(selectedRequirement.id);
      enqueueSnackbar(t('mto.type1.messages.settled'), { variant: 'success' });
      setConfirmDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to settle requirement:', error);
      enqueueSnackbar(t('mto.type1.errors.settleFailed'), { variant: 'error' });
    } finally {
      setSettling(false);
    }
  };

  const getRequirementsForSettlement = () => {
    return requirements.filter(req => 
      req.status === 'RELEASED' && isPast(new Date(req.settlementTime))
    );
  };

  const getPendingSettlement = () => {
    return requirements.filter(req => 
      req.status === 'RELEASED' && !isPast(new Date(req.settlementTime))
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('$', '');
  };

  const getTimeRemaining = (settlementTime: string) => {
    const hours = differenceInHours(new Date(settlementTime), new Date());
    if (hours < 0) return t('mto.type1.settlement.overdue');
    if (hours < 24) return t('mto.type1.settlement.hoursRemaining', { hours });
    const days = Math.floor(hours / 24);
    return t('mto.type1.settlement.daysRemaining', { days });
  };

  const renderRequirementsTable = (reqs: MtoType1Requirement[], showSettle = false) => {
    if (reqs.length === 0) {
      return (
        <Alert severity="info">
          {showSettle 
            ? t('mto.type1.settlement.noRequirementsReady')
            : t('mto.type1.settlement.noPendingRequirements')
          }
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('mto.type1.id')}</TableCell>
              <TableCell>{t('mto.type1.name')}</TableCell>
              <TableCell align="right">{t('mto.type1.totalBudget')}</TableCell>
              <TableCell>{t('mto.type1.releaseTime')}</TableCell>
              <TableCell>{t('mto.type1.settlementTime')}</TableCell>
              <TableCell>{t('mto.type1.settlement.timeRemaining')}</TableCell>
              <TableCell align="center">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reqs.map((req) => {
              const isOverdue = isPast(new Date(req.settlementTime));
              return (
                <TableRow key={req.id}>
                  <TableCell>#{req.id}</TableCell>
                  <TableCell>{req.requirementName}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(Number(req.overallPurchaseBudget))}
                  </TableCell>
                  <TableCell>
                    {format(new Date(req.releaseTime), 'MM/dd/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(req.settlementTime), 'MM/dd/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={isOverdue ? <WarningIcon /> : <TimerIcon />}
                      label={getTimeRemaining(req.settlementTime)}
                      size="small"
                      color={isOverdue ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title={t('common.view')}>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedRequirement(req);
                            setViewDialogOpen(true);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {showSettle && (
                        <Tooltip title={t('mto.type1.settle')}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedRequirement(req);
                              setConfirmDialogOpen(true);
                            }}
                          >
                            <SettleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderSettlementsTable = () => {
    if (settlements.length === 0) {
      return (
        <Alert severity="info">
          {t('mto.type1.settlement.noSettlements')}
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('mto.type1.settlement.id')}</TableCell>
              <TableCell>{t('mto.type1.name')}</TableCell>
              <TableCell align="right">{t('mto.type1.settlement.totalSettled')}</TableCell>
              <TableCell align="right">{t('mto.type1.settlement.deliveryCount')}</TableCell>
              <TableCell>{t('mto.type1.settlement.settledAt')}</TableCell>
              <TableCell align="center">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settlements.map((settlement) => (
              <TableRow key={settlement.id}>
                <TableCell>#{settlement.id}</TableCell>
                <TableCell>{settlement.requirementName}</TableCell>
                <TableCell align="right">
                  {formatCurrency(settlement.totalSettledAmount)}
                </TableCell>
                <TableCell align="right">
                  {settlement.deliveryCount}
                </TableCell>
                <TableCell>
                  {format(new Date(settlement.settledAt), 'MM/dd/yyyy HH:mm')}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={t('mto.type1.settlement.viewDetails')}>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSettlementDetails(settlement);
                        setViewDialogOpen(true);
                      }}
                    >
                      <ViewIcon fontSize="small" />
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

  if (loading && requirements.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const readyForSettlement = getRequirementsForSettlement();
  const pendingSettlement = getPendingSettlement();

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {t('mto.type1.settlement.title')}
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
          {t('common.refresh')}
        </Button>
      </Stack>

      {/* Statistics */}
      <Stack direction="row" spacing={3} mb={3}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="error.main">
            {readyForSettlement.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type1.settlement.readyForSettlement')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">
            {pendingSettlement.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type1.settlement.pending')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {settlements.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type1.settlement.completed')}
          </Typography>
        </Paper>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab 
            label={
              <Badge badgeContent={readyForSettlement.length} color="error">
                {t('mto.type1.settlement.readyTab')}
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={pendingSettlement.length} color="warning">
                {t('mto.type1.settlement.pendingTab')}
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={settlements.length} color="success">
                {t('mto.type1.settlement.historyTab')}
              </Badge>
            }
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderRequirementsTable(readyForSettlement, true)}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderRequirementsTable(pendingSettlement)}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderSettlementsTable()}
        </TabPanel>
      </Paper>

      {/* Confirm Settlement Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('mto.type1.settlement.confirmTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('mto.type1.settlement.confirmMessage', {
              id: selectedRequirement?.id,
              name: selectedRequirement?.requirementName
            })}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={settling}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSettlement}
            color="primary"
            variant="contained"
            disabled={settling}
            startIcon={settling ? <CircularProgress size={20} /> : <SettleIcon />}
          >
            {t('mto.type1.settlement.confirmSettle')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {settlementDetails 
            ? t('mto.type1.settlement.settlementDetails')
            : t('mto.type1.settlement.requirementDetails')
          }
        </DialogTitle>
        <DialogContent>
          {/* Content would show requirement or settlement details */}
          <Typography variant="body2" color="text.secondary">
            {t('mto.type1.settlement.detailsPlaceholder')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType1SettlementManager;