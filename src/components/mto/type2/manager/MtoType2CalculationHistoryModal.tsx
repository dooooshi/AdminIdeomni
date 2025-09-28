'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Stack,
  Divider,
  Collapse,
  TablePagination
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  AccountBalance as BudgetIcon,
  Gavel as SettlementIcon,
  Edit as AdjustmentIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import MtoType2Service from '@/lib/services/mtoType2Service';

interface CalculationHistory {
  id: number;
  calculationType: 'BUDGET_DISTRIBUTION' | 'SETTLEMENT_PROCESS' | 'ADJUSTMENT' | 'CANCELLATION';
  createdAt: string;
  createdBy: string | null;
  totalPopulation?: number | null;
  participatingTiles?: number | null;
  totalMalls?: number | null;
  overallBudget?: string | null;
  totalSubmissions?: number | null;
  processedSubmissions?: number | null;
  totalSettled?: number | null;
  totalSpent?: string | null;
  settlementDuration?: number | null;
  calculationDetails?: any;
}

interface MtoType2CalculationHistoryModalProps {
  open: boolean;
  onClose: () => void;
  mtoType2Id: number;
  mtoType2Name?: string;
}

const calculationTypeIcons = {
  BUDGET_DISTRIBUTION: <BudgetIcon />,
  SETTLEMENT_PROCESS: <SettlementIcon />,
  ADJUSTMENT: <AdjustmentIcon />,
  CANCELLATION: <CancelIcon />
};

const calculationTypeColors = {
  BUDGET_DISTRIBUTION: 'primary',
  SETTLEMENT_PROCESS: 'success',
  ADJUSTMENT: 'warning',
  CANCELLATION: 'error'
} as const;

export const MtoType2CalculationHistoryModal: React.FC<MtoType2CalculationHistoryModalProps> = ({
  open,
  onClose,
  mtoType2Id,
  mtoType2Name
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState<CalculationHistory[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (open && mtoType2Id) {
      loadCalculationHistory();
    }
  }, [open, mtoType2Id, selectedTab, page, rowsPerPage]);

  const loadCalculationHistory = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        sortOrder: 'desc'
      };

      if (selectedTab !== 'ALL') {
        params.calculationType = selectedTab;
      }

      const response = await MtoType2Service.getCalculationHistory(mtoType2Id, params);
      // Handle nested response structure where data comes as response.data
      const data = (response as any).data || response;
      setHistories(data.histories || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load calculation history:', error);
      setHistories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    setPage(0);
  };

  const toggleRowExpanded = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: string | number | null | undefined) => {
    if (value == null) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const formatDuration = (milliseconds: number | null | undefined) => {
    if (milliseconds == null) return '-';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const renderSummaryByType = (history: CalculationHistory) => {
    switch (history.calculationType) {
      case 'BUDGET_DISTRIBUTION':
        return (
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.population')}:</strong> {history.totalPopulation?.toLocaleString() || '-'}
            </Typography>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.participatingTiles')}:</strong> {history.participatingTiles || '-'}
            </Typography>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.totalMalls')}:</strong> {history.totalMalls || '-'}
            </Typography>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.budget')}:</strong> {formatCurrency(history.overallBudget)}
            </Typography>
          </Stack>
        );

      case 'SETTLEMENT_PROCESS':
        return (
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.submissions')}:</strong> {history.totalSettled || 0}/{history.totalSubmissions || 0}
            </Typography>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.spent')}:</strong> {formatCurrency(history.totalSpent)}
            </Typography>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.duration')}:</strong> {formatDuration(history.settlementDuration)}
            </Typography>
          </Stack>
        );

      case 'ADJUSTMENT':
        return (
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.reason')}:</strong> {
                history.calculationDetails?.adjustmentReason ||
                t('common.notAvailable')
              }
            </Typography>
            {history.calculationDetails?.changes && (
              <Typography variant="body2">
                <strong>{t('mto.type2.history.changesCount')}:</strong> {
                  Object.keys(history.calculationDetails.changes).length
                } {t('mto.type2.history.fields')}
              </Typography>
            )}
            {history.calculationDetails?.status && (
              <Typography variant="body2">
                <strong>{t('common.status')}:</strong> {history.calculationDetails.status}
              </Typography>
            )}
          </Stack>
        );

      case 'CANCELLATION':
        return (
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>{t('mto.type2.history.reason')}:</strong> {
                history.calculationDetails?.cancellationReason ||
                t('common.notAvailable')
              }
            </Typography>
            {history.calculationDetails?.affectedSubmissions && (
              <Typography variant="body2">
                <strong>{t('mto.type2.history.affectedSubmissions')}:</strong> {history.calculationDetails.affectedSubmissions}
              </Typography>
            )}
            {history.calculationDetails?.refundedAmount && (
              <Typography variant="body2">
                <strong>{t('mto.type2.history.refundedAmount')}:</strong> {formatCurrency(history.calculationDetails.refundedAmount)}
              </Typography>
            )}
          </Stack>
        );

      default:
        return null;
    }
  };

  const renderDetails = (history: CalculationHistory) => {
    if (!history.calculationDetails) return null;

    const details = history.calculationDetails;

    if (history.calculationType === 'BUDGET_DISTRIBUTION' && details.tiles) {
      return (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>{t('mto.type2.history.tileBreakdown')}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type2.history.tile')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.population')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.mallCount')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.populationRatio')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.allocatedBudget')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.tiles.map((tile: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{tile.tileName}</TableCell>
                    <TableCell align="right">{tile.population.toLocaleString()}</TableCell>
                    <TableCell align="right">{tile.mallCount}</TableCell>
                    <TableCell align="right">{(tile.populationRatio * 100).toFixed(2)}%</TableCell>
                    <TableCell align="right">{formatCurrency(tile.allocatedBudget)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    }

    if (history.calculationType === 'SETTLEMENT_PROCESS' && details.settlementResults) {
      return (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>{t('mto.type2.history.settlementResults')}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type2.history.tileId')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.submissions')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.settled')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.spent')}</TableCell>
                  <TableCell align="right">{t('mto.type2.history.failed')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.settlementResults.map((result: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{t('mto.type2.history.tile')} #{result.tileId}</TableCell>
                    <TableCell align="right">{result.submissions}</TableCell>
                    <TableCell align="right">{result.settled}</TableCell>
                    <TableCell align="right">{formatCurrency(result.spent)}</TableCell>
                    <TableCell align="right">{result.failed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    }

    if (history.calculationType === 'ADJUSTMENT' && details.changes) {
      return (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>{t('mto.type2.history.adjustmentDetails')}</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type2.history.field')}</TableCell>
                  <TableCell>{t('mto.type2.history.originalValue')}</TableCell>
                  <TableCell>{t('mto.type2.history.newValue')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(details.changes).map(([field, change]: [string, any]) => (
                  <TableRow key={field}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {field === 'releaseTime' ? t('mto.type2.fields.releaseTime') :
                         field === 'settlementTime' ? t('mto.type2.fields.settlementTime') :
                         field === 'overallPurchaseBudget' ? t('mto.type2.fields.overallBudget') :
                         field}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {field.includes('Time') ?
                          new Date(change.from).toLocaleString() :
                          field === 'overallPurchaseBudget' ?
                          formatCurrency(change.from) :
                          change.from}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary">
                        {field.includes('Time') ?
                          new Date(change.to).toLocaleString() :
                          field === 'overallPurchaseBudget' ?
                          formatCurrency(change.to) :
                          change.to}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {details.updatedAt && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('mto.type2.history.updatedAt')}: {new Date(details.updatedAt).toLocaleString()}
            </Typography>
          )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon />
            <Typography variant="h6">
              {t('mto.type2.history.title')}
            </Typography>
            {mtoType2Name && (
              <Chip label={mtoType2Name} size="small" color="primary" variant="outlined" />
            )}
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('common.all')} value="ALL" />
            <Tab
              label={t('mto.type2.history.budgetDistribution')}
              value="BUDGET_DISTRIBUTION"
              icon={<BudgetIcon />}
              iconPosition="start"
            />
            <Tab
              label={t('mto.type2.history.settlementProcess')}
              value="SETTLEMENT_PROCESS"
              icon={<SettlementIcon />}
              iconPosition="start"
            />
            <Tab
              label={t('mto.type2.history.adjustment')}
              value="ADJUSTMENT"
              icon={<AdjustmentIcon />}
              iconPosition="start"
            />
            <Tab
              label={t('mto.type2.history.cancellation')}
              value="CANCELLATION"
              icon={<CancelIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : histories.length === 0 ? (
          <Alert severity="info">{t('mto.type2.history.noHistory')}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="40px"></TableCell>
                  <TableCell>{t('mto.type2.history.type')}</TableCell>
                  <TableCell>{t('mto.type2.history.createdAt')}</TableCell>
                  <TableCell>{t('mto.type2.history.createdBy')}</TableCell>
                  <TableCell>{t('mto.type2.history.summary')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {histories.map((history) => (
                  <React.Fragment key={history.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpanded(history.id)}
                        >
                          {expandedRows.has(history.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={calculationTypeIcons[history.calculationType]}
                          label={t(`mto.type2.history.${history.calculationType.toLowerCase()}`)}
                          color={calculationTypeColors[history.calculationType]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(history.createdAt), 'MM/dd/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {history.createdBy || t('common.system')}
                      </TableCell>
                      <TableCell>
                        {renderSummaryByType(history)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 0 }}>
                        <Collapse in={expandedRows.has(history.id)} timeout="auto" unmountOnExit>
                          {renderDetails(history)}
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage={t('common.rowsPerPage')}
            />
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MtoType2CalculationHistoryModal;