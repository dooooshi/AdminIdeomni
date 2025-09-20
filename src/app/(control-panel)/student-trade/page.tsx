'use client';

import { useState, useEffect } from 'react';
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
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import {
  Add as AddIcon,
  SwapHoriz,
  AttachMoney,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  Search,
  FilterList,
  Clear,
  Visibility,
  Check,
  Close,
  LocalShipping,
  Timeline,
  Assessment
} from '@mui/icons-material';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TradeService } from '@/lib/services/tradeService';
import {
  TradeStatus,
  TradeListItem,
  TradeType,
  TradeOrder,
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
  const [allTrades, setAllTrades] = useState<TradeListItem[]>([]);
  const [incomingTrades, setIncomingTrades] = useState<TradeListItem[]>([]);
  const [outgoingTrades, setOutgoingTrades] = useState<TradeListItem[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<TradeListItem[]>([]);

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

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tabValue, searchTerm, statusFilter, allTrades, incomingTrades, outgoingTrades]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all trades
      const [allResponse, incomingResponse, outgoingResponse] = await Promise.all([
        TradeService.listTrades({ type: 'all' }),
        TradeService.listTrades({ type: 'incoming' }),
        TradeService.listTrades({ type: 'outgoing' }),
      ]);

      const all = allResponse.data || [];
      const incoming = incomingResponse.data || [];
      const outgoing = outgoingResponse.data || [];

      setAllTrades(all);
      setIncomingTrades(incoming);
      setOutgoingTrades(outgoing);

      // Calculate statistics
      calculateStats(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.loadTrades'));
      console.error('Error loading trades:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (trades: TradeListItem[]) => {
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
  };

  const applyFilters = () => {
    let source: TradeListItem[] = [];

    switch (tabValue) {
      case 0: // Active trades (pending)
        source = [...allTrades].filter(t => t.status === TradeStatus.PENDING);
        break;
      case 1: // Incoming
        source = [...incomingTrades];
        break;
      case 2: // Outgoing
        source = [...outgoingTrades];
        break;
      case 3: // History (completed + rejected)
        source = [...allTrades].filter(t =>
          t.status === TradeStatus.COMPLETED ||
          t.status === TradeStatus.REJECTED ||
          t.status === TradeStatus.CANCELLED
        );
        break;
      case 4: // Analytics
        return; // No filtering for analytics tab
      default:
        source = [...allTrades];
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      source = source.filter(t => t.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      source = source.filter(t =>
        t.id.toLowerCase().includes(search) ||
        t.senderTeam.name.toLowerCase().includes(search) ||
        t.targetTeam?.name?.toLowerCase().includes(search) ||
        t.message?.toLowerCase().includes(search)
      );
    }

    setFilteredTrades(source);
  };

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
    loadAllData(); // Reload all data after successful trade action
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  };

  if (loading) {
    return <IdeomniLoading />;
  }

  const renderTradeTable = (trades: TradeListItem[], showActions = false) => (
    <TableContainer component={Paper} className="border border-gray-100 dark:border-gray-800 shadow-none">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="font-medium text-gray-600 dark:text-gray-400">
              {t('trade.table.partner')}
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
              {t('trade.table.date')}
            </TableCell>
            <TableCell className="font-medium text-gray-600 dark:text-gray-400" align="center">
              {t('trade.table.actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.length > 0 ? (
            trades.map((trade) => (
              <TableRow key={trade.id} hover>
                <TableCell>
                  <Typography variant="body2" className="font-medium">
                    {trade.targetTeam?.name || trade.senderTeam.name}
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
                  <Typography variant="caption">
                    {new Date(trade.createdAt).toLocaleDateString()}
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
              <TableCell colSpan={6} align="center" className="py-12">
                <Typography color="text.secondary">
                  {t('trade.empty.noTrades')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
              className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900"
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
                        {t('trade.stats.totalTrades', 'Total Trades')}
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
              <Tab
                label={t('trade.tabs.analytics')}
                icon={<Assessment />}
                iconPosition="start"
              />
            </Tabs>

            {/* Tab Panels */}
            <Box className="p-4">
              <TabPanel value={tabValue} index={0}>
                {renderTradeTable(filteredTrades, true)}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {renderTradeTable(filteredTrades, true)}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {renderTradeTable(filteredTrades)}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {renderTradeTable(filteredTrades)}
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" className="p-4">
                      <Typography variant="h6" className="font-medium mb-4">
                        {t('trade.analytics.distribution', 'Trade Distribution')}
                      </Typography>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">{t('trade.status.completed')}</Typography>
                          </div>
                          <Chip label={stats.completedTrades} size="small" color="success" />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Schedule className="text-orange-500" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">{t('trade.status.pending')}</Typography>
                          </div>
                          <Chip label={stats.pendingTrades} size="small" color="warning" />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Cancel className="text-red-500" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">{t('trade.status.rejected')}</Typography>
                          </div>
                          <Chip label={stats.rejectedTrades} size="small" color="error" />
                        </div>
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" className="p-4">
                      <Typography variant="h6" className="font-medium mb-4">
                        {t('trade.analytics.financialSummary', 'Financial Summary')}
                      </Typography>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Typography variant="body2">{t('trade.stats.averageValue')}</Typography>
                          <Typography variant="body2" className="font-medium flex items-center gap-1">
                            <AttachMoney className="text-yellow-600" sx={{ fontSize: 16 }} />
                            {TradeService.formatCurrency(stats.averageTradeValue)}
                          </Typography>
                        </div>
                        <div className="flex justify-between items-center">
                          <Typography variant="body2">{t('trade.stats.totalVolume')}</Typography>
                          <Typography variant="body2" className="font-medium flex items-center gap-1">
                            <AttachMoney className="text-yellow-600" sx={{ fontSize: 16 }} />
                            {TradeService.formatCurrency(stats.totalVolume)}
                          </Typography>
                        </div>
                        <div className="flex justify-between items-center">
                          <Typography variant="body2">{t('trade.stats.successRate')}</Typography>
                          <Typography variant="body2" className="font-medium">
                            {stats.successRate.toFixed(1)}%
                          </Typography>
                        </div>
                      </div>
                    </Paper>
                  </Grid>
                </Grid>
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