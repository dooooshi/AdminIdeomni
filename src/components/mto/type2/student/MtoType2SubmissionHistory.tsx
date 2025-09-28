import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Collapse,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import {
  MtoType2SubmissionHistoryItem,
  MtoType2SubmissionHistoryParams,
  MtoType2SubmissionHistoryResponse
} from '@/lib/types/mtoType2';
import MtoType2SubmissionHistoryModal from './MtoType2SubmissionHistoryModal';
import MtoType2HistoryStats from './MtoType2HistoryStats';

interface Props {
  teamId?: string;
  facilityId?: string;
}

export const MtoType2SubmissionHistory: React.FC<Props> = ({ teamId, facilityId }) => {
  const { t } = useTranslation();

  // State
  const [historyData, setHistoryData] = useState<MtoType2SubmissionHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<MtoType2SubmissionHistoryItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [filters, setFilters] = useState<MtoType2SubmissionHistoryParams>({
    page: 1,
    limit: 10,
    sortBy: 'submittedAt',
    sortOrder: 'desc'
  });

  // Load history data
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: MtoType2SubmissionHistoryParams = {
        ...filters,
        facilityInstanceId: facilityId,
        page: page + 1,
        limit: rowsPerPage
      };

      const response = await MtoType2Service.getSubmissionHistory(params);
      setHistoryData(response);
    } catch (err) {
      console.error('Error loading submission history:', err);
      setError(t('mto.type2.history.loadError'));
    } finally {
      setLoading(false);
    }
  }, [filters, facilityId, page, rowsPerPage, t]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handlers
  const handleToggleRow = (submissionId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewDetails = (item: MtoType2SubmissionHistoryItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format helpers
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: string | number) => {
    return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'FULL': return 'success';
      case 'PARTIAL': return 'warning';
      case 'PENDING': return 'info';
      case 'UNSETTLED': return 'error';
      case 'RETURNED': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'FULL': return t('mto.type2.history.statusFull');
      case 'PARTIAL': return t('mto.type2.history.statusPartial');
      case 'PENDING': return t('mto.type2.history.statusPending');
      case 'UNSETTLED': return t('mto.type2.history.statusUnsettled');
      case 'RETURNED': return t('mto.type2.history.statusReturned');
      default: return status;
    }
  };

  if (loading && !historyData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {t('mto.type2.history.title')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AssessmentIcon />}
            onClick={() => setStatsVisible(!statsVisible)}
          >
            {statsVisible ? t('mto.type2.history.hideStats') : t('mto.type2.history.showStats')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadHistory}
            disabled={loading}
          >
            {t('common.refresh')}
          </Button>
        </Stack>
      </Stack>

      {/* Statistics Summary */}
      {statsVisible && historyData && (
        <MtoType2HistoryStats items={historyData.items} />
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* History Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50} />
              <TableCell>{t('mto.type2.history.submissionNumber')}</TableCell>
              <TableCell>{t('mto.type2.history.mtoName')}</TableCell>
              <TableCell>{t('mto.type2.history.mallFacility')}</TableCell>
              <TableCell align="right">{t('mto.type2.history.quantity')}</TableCell>
              <TableCell align="right">{t('mto.type2.history.unitPrice')}</TableCell>
              <TableCell align="right">{t('mto.type2.history.totalValue')}</TableCell>
              <TableCell>{t('mto.type2.history.status')}</TableCell>
              <TableCell>{t('mto.type2.history.submittedAt')}</TableCell>
              <TableCell align="center">{t('mto.type2.history.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historyData?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    {t('mto.type2.history.noHistory')}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              historyData?.items.map((item) => (
                <React.Fragment key={item.submissionId}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleRow(item.submissionId)}
                      >
                        {expandedRows.has(item.submissionId) ?
                          <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>#{item.submissionNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.managerProductFormula.productName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Formula #{item.managerProductFormula.formulaNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.mallInfo.facilityName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Level {item.mallInfo.mallLevel} | {item.mallInfo.tileName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {item.submission.productNumber}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.submission.unitPrice)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.submission.totalValue)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(item.settlementResults.settlementStatus)}
                        color={getStatusColor(item.settlementResults.settlementStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(item.submission.submittedAt)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t('mto.type2.history.viewDetails')}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(item)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Details */}
                  <TableRow>
                    <TableCell colSpan={10} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                      <Collapse in={expandedRows.has(item.submissionId)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('mto.type2.history.settlementDetails')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.history.settledQuantity')}
                              </Typography>
                              <Typography variant="body2">
                                {item.settlementResults.settledNumber} / {item.submission.productNumber}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.history.settledValue')}
                              </Typography>
                              <Typography variant="body2">
                                {formatCurrency(item.settlementResults.settledValue)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.history.fulfillmentRate')}
                              </Typography>
                              <Typography variant="body2">
                                {item.settlementResults.fulfillmentRate}%
                              </Typography>
                            </Box>
                            {item.settlementResults.settlementOrder && (
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  {t('mto.type2.history.settlementOrder')}
                                </Typography>
                                <Typography variant="body2">
                                  #{item.settlementResults.settlementOrder}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {item.productValidation && (
                            <>
                              <Typography variant="subtitle2" gutterBottom>
                                {t('mto.type2.history.formulaValidation')}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Chip
                                  label={item.productValidation.formulaValidated ?
                                    t('mto.type2.history.formulaValid') :
                                    t('mto.type2.history.formulaInvalid')}
                                  color={item.productValidation.formulaValidated ? 'success' : 'error'}
                                  size="small"
                                />
                                {item.productValidation.validationDetails && (
                                  <>
                                    <Chip
                                      label={`Materials: ${item.productValidation.validationDetails.materialsMatch ? '✓' : '✗'}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={`Categories: ${item.productValidation.validationDetails.categoriesMatch ? '✓' : '✗'}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </>
                                )}
                              </Box>
                            </>
                          )}

                          <Typography variant="subtitle2" gutterBottom>
                            {t('mto.type2.history.tileBudget')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.history.allocatedBudget')}
                              </Typography>
                              <Typography variant="body2">
                                {formatCurrency(item.tileBudgetInfo.allocatedBudget)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.history.spentBudget')}
                              </Typography>
                              <Typography variant="body2">
                                {formatCurrency(item.tileBudgetInfo.spentBudget)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t('mto.type2.history.remainingBudget')}
                              </Typography>
                              <Typography variant="body2">
                                {formatCurrency(item.tileBudgetInfo.remainingBudget)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {historyData && historyData.pagination.total > 0 && (
          <TablePagination
            component="div"
            count={historyData.pagination.total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        )}
      </TableContainer>

      {/* Detail Modal */}
      <MtoType2SubmissionHistoryModal
        open={detailModalOpen}
        item={selectedItem}
        onClose={handleCloseDetailModal}
      />
    </Box>
  );
};

export default MtoType2SubmissionHistory;