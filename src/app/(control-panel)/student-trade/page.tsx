'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import {
  Add as AddIcon,
  SwapHoriz,
  AttachMoney,
  CheckCircle,
  Schedule,
  TrendingUp,
  Search,
  Clear,
  Visibility,
  Check,
  Timeline
} from '@mui/icons-material';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TradeService } from '@/lib/services/tradeService';
import {
  TradeStatus,
  TradeListItem,
  TradeOrder,
  TradeListParams,
  toNumber
} from '@/types/trade';
import TradeStatusBadge from '@/components/trade/TradeStatusBadge';
import CreateTradeModal from '@/components/trade/CreateTradeModal';
import AcceptTradeModal from '@/components/trade/AcceptTradeModal';
import TradeDetailsModal from '@/components/trade/TradeDetailsModal';

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
      id={`trade-tabpanel-${index}`}
      aria-labelledby={`trade-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Comprehensive Single-Page Trade Module
 * Combines all trade functionality in one page
 */
export default function StudentTradePage() {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trade lists
  const [tableTrades, setTableTrades] = useState<TradeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Statistics
  const [stats, setStats] = useState({
    totalTrades: 0,
    completedTrades: 0,
    pendingTrades: 0,
    rejectedTrades: 0,
    totalVolume: 0,
    averageTradeValue: 0,
    successRate: 0,
  });

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeOrder | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TradeStatus | 'all'>('all');

  const calculateStats = useCallback((trades: TradeListItem[]) => {
    const completed = trades.filter(t => t.status === TradeStatus.COMPLETED).length;
    const pending = trades.filter(t => t.status === TradeStatus.PENDING).length;
    const rejected = trades.filter(t => t.status === TradeStatus.REJECTED).length;
    const totalVolume = trades.reduce((sum, t) => sum + toNumber(t.totalPrice), 0);
    const nonPending = trades.length - pending;

    setStats({
      totalTrades: trades.length,
      completedTrades: completed,
      pendingTrades: pending,
      rejectedTrades: rejected,
      totalVolume,
      averageTradeValue: trades.length > 0 ? totalVolume / trades.length : 0,
      successRate: nonPending > 0 ? (completed / nonPending) * 100 : 0,
    });
  }, []);

  const loadStats = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) {
      setLoading(true);
    }
    setError(null);

    try {
      const statsResponse = await TradeService.listTrades({ type: 'all', page: 1, limit: rowsPerPage });
      const statTrades = statsResponse.data || [];
      calculateStats(statTrades);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.loadTrades'));
      console.error('Error loading trades:', err);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, [t, calculateStats, rowsPerPage]);

  const fetchTrades = useCallback(async (pageIndex: number, limitValue: number) => {
    setTableLoading(true);
    setError(null);

    try {
      const applyingSingleStatus = statusFilter !== 'all';

      const params: TradeListParams = {
        page: pageIndex + 1,
        limit: limitValue,
      };

      switch (tabValue) {
        case 0: // Active
          params.type = 'all';
          params.status = applyingSingleStatus ? statusFilter : TradeStatus.PENDING;
          break;
        case 1: // Incoming
          params.type = 'incoming';
          if (applyingSingleStatus) {
            params.status = statusFilter;
          }
          break;
        case 2: // Outgoing
          params.type = 'outgoing';
          if (applyingSingleStatus) {
            params.status = statusFilter;
          }
          break;
        case 3: // History
          params.type = 'all';
          if (applyingSingleStatus) {
            params.status = statusFilter;
          }
          break;
        default:
          params.type = 'all';
          if (applyingSingleStatus) {
            params.status = statusFilter;
          }
      }

      const response = await TradeService.listTrades(params);
      let trades = response.data || [];
      const paginationInfo = response.pagination;
      const responseTotal = paginationInfo?.total ?? response.total ?? trades.length;
      const responseLimit = paginationInfo?.limit ?? response.limit ?? limitValue;
      const responsePage = paginationInfo?.page ?? response.page ?? params.page ?? 1;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        trades = trades.filter((t) =>
          t.id.toLowerCase().includes(search) ||
          t.senderTeam.name.toLowerCase().includes(search) ||
          t.targetTeam?.name?.toLowerCase().includes(search) ||
          t.message?.toLowerCase().includes(search)
        );
      }

      const total = searchTerm ? trades.length : responseTotal;

      if (responseLimit !== limitValue) {
        setRowsPerPage(responseLimit);
      }

      if (responsePage - 1 !== pageIndex) {
        setPage(responsePage - 1);
      }

      setTableTrades(trades);
      setTotalCount(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.loadTrades'));
      console.error('Error loading trades:', err);
    } finally {
      setTableLoading(false);
    }
  }, [statusFilter, tabValue, searchTerm, t]);

  useEffect(() => {
    loadStats({ showSpinner: true });
  }, [loadStats]);

  useEffect(() => {
    setPage(0);
  }, [tabValue, statusFilter, searchTerm]);

  useEffect(() => {
    fetchTrades(page, rowsPerPage);
  }, [fetchTrades, page, rowsPerPage]);

  const handleViewDetails = async (trade: TradeListItem) => {
    try {
      const details = await TradeService.getTradeDetails(trade.id);
      setSelectedTrade(details);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error('Error loading trade details:', err);
    }
  };

  const handleAcceptTrade = async (trade: TradeListItem) => {
    try {
      const details = await TradeService.getTradeDetails(trade.id);
      setSelectedTrade(details);
      setAcceptModalOpen(true);
    } catch (err) {
      console.error('Error loading trade for acceptance:', err);
    }
  };

  const handleTradeSuccess = () => {
    fetchTrades(page, rowsPerPage);
    loadStats();
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  };

  if (loading) {
    return <IdeomniLoading />;
  }

  const formatDateTime = (value?: string | Date) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const renderTradeTable = (showActions = false) => {
    return (
      <Box>
        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <TableContainer component={Paper} className="border border-gray-100 dark:border-gray-800 shadow-none">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {t('trade.table.sender')}
                </TableCell>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {t('trade.table.receiver')}
                </TableCell>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {t('trade.table.items')}
                </TableCell>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {t('trade.table.price')}
                </TableCell>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {t('trade.table.status')}
                </TableCell>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {t('trade.table.createdAt')}
                </TableCell>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {t('trade.table.updatedAt')}
                </TableCell>
                <TableCell className="font-medium text-gray-600 dark:text-gray-400" align="center">
                  {t('trade.table.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" className="py-12">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : tableTrades.length > 0 ? (
                tableTrades.map((trade) => (
                  <TableRow key={trade.id} hover>
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {trade.senderTeam?.name || t('trade.team.unknown')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {trade.targetTeam?.name || t('trade.team.unknown')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {trade.itemCount} {t('trade.units.items')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-medium flex items-center gap-1">
                        <AttachMoney className="text-yellow-600" sx={{ fontSize: 16 }} />
                        {TradeService.formatCurrency(toNumber(trade.totalPrice))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TradeStatusBadge status={trade.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {formatDateTime(trade.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {formatDateTime(trade.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title={t('trade.actions.view')}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(trade)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {showActions && trade.status === TradeStatus.PENDING && (
                          <Tooltip title={t('trade.actions.accept')}>
                            <IconButton
                              size="small"
                              onClick={() => handleAcceptTrade(trade)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" className="py-12">
                    <Typography color="text.secondary">
                      {t('trade.empty.noTrades')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      </Box>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
                {t('trade.pageTitle')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('trade.pageSubtitle')}
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900"
            >
              {t('trade.actions.create')}
            </Button>
          </div>

          {/* Statistics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                        {t('trade.stats.totalTrades')}
                      </Typography>
                      <Typography variant="h5" className="font-light text-gray-900 dark:text-white">
                        {stats.totalTrades}
                      </Typography>
                    </div>
                    <SwapHoriz className="text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                        {t('trade.status.pending')}
                      </Typography>
                      <Typography variant="h5" className="font-light text-gray-900 dark:text-white">
                        {stats.pendingTrades}
                      </Typography>
                    </div>
                    <Schedule className="text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                        {t('trade.stats.totalVolume')}
                      </Typography>
                      <Typography variant="h5" className="font-light text-gray-900 dark:text-white flex items-center gap-1">
                        <AttachMoney className="text-yellow-600" sx={{ fontSize: 20 }} />
                        {TradeService.formatCurrency(stats.totalVolume)}
                      </Typography>
                    </div>
                    <TrendingUp className="text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                        {t('trade.stats.successRate')}
                      </Typography>
                      <Typography variant="h5" className="font-light text-gray-900 dark:text-white">
                        {stats.successRate.toFixed(1)}%
                      </Typography>
                    </div>
                    <CheckCircle className="text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filters */}
          <Paper className="p-4 border border-gray-100 dark:border-gray-800 shadow-none">
            <div className="flex items-center gap-4">
              <TextField
                fullWidth
                placeholder={t('trade.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('trade.filter.status')}</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TradeStatus | 'all')}
                  label={t('trade.filter.status')}
                >
                  <MenuItem value="all">{t('trade.filter.all')}</MenuItem>
                  <MenuItem value={TradeStatus.PENDING}>{t('trade.status.pending')}</MenuItem>
                  <MenuItem value={TradeStatus.COMPLETED}>{t('trade.status.completed')}</MenuItem>
                  <MenuItem value={TradeStatus.REJECTED}>{t('trade.status.rejected')}</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Paper>

          {/* Tabs */}
          <Paper className="border border-gray-100 dark:border-gray-800 shadow-none">
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              <Tab
                label={t('trade.tabs.active')}
                icon={<Schedule />}
                iconPosition="start"
              />
              <Tab
                label={t('trade.tabs.incoming')}
                icon={<IdeomniSvgIcon>heroicons-outline:arrow-down-left</IdeomniSvgIcon>}
                iconPosition="start"
              />
              <Tab
                label={t('trade.tabs.outgoing')}
                icon={<IdeomniSvgIcon>heroicons-outline:arrow-up-right</IdeomniSvgIcon>}
                iconPosition="start"
              />
              <Tab
                label={t('trade.tabs.history')}
                icon={<Timeline />}
                iconPosition="start"
              />
            </Tabs>

            {/* Tab Panels */}
            <Box className="p-4">
              <TabPanel value={tabValue} index={0}>
                {renderTradeTable(true)}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {renderTradeTable(true)}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {renderTradeTable()}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {renderTradeTable()}
              </TabPanel>

            </Box>
          </Paper>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateTradeModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleTradeSuccess}
      />

      {selectedTrade && (
        <>
          <AcceptTradeModal
            open={acceptModalOpen}
            trade={selectedTrade}
            onClose={() => {
              setAcceptModalOpen(false);
              setSelectedTrade(null);
            }}
            onSuccess={handleTradeSuccess}
            isIncoming={true}
          />

          <TradeDetailsModal
            open={detailsModalOpen}
            trade={selectedTrade}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedTrade(null);
            }}
          />
        </>
      )}
    </div>
  );
}
