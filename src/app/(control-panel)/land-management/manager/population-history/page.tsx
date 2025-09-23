'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  Collapse,
  SelectChangeEvent
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';
import PopulationService from '@/lib/services/populationService';
import {
  PopulationHistoryEntry,
  PopulationHistoryQuery,
  PopulationChangeType,
  PopulationSummary
} from '@/types/population';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface ManagerPopulationHistoryPageProps {}

type SortOrder = 'asc' | 'desc';
type SortField = 'timestamp' | 'changeAmount' | 'tileId';

const ManagerPopulationHistoryPage: React.FC<ManagerPopulationHistoryPageProps> = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [history, setHistory] = useState<PopulationHistoryEntry[]>([]);
  const [summary, setSummary] = useState<PopulationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState<PopulationHistoryQuery>({
    tileId: undefined,
    changeType: undefined,
    dateFrom: undefined,
    dateTo: undefined
  });

  const [tempFilters, setTempFilters] = useState<PopulationHistoryQuery>({});

  useEffect(() => {
    loadPopulationHistory();
  }, [page, rowsPerPage, sortField, sortOrder, filters]);

  const loadPopulationHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const query: PopulationHistoryQuery = {
        ...filters,
        sortBy: sortField,
        sortOrder,
        limit: rowsPerPage,
        offset: page * rowsPerPage
      };

      const response = await PopulationService.getMyActivityPopulationHistory(query);

      setHistory(response.history);
      setSummary(response.summary);
      setTotalCount(response.pagination.total);
    } catch (err: any) {
      console.error('Failed to load population history:', err);
      setError(PopulationService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPopulationHistory();
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    setFilters({});
    setPage(0);
  };



  const renderFilters = () => (
    <Collapse in={showFilters}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap">
          <TextField
            label={t('population.FILTER_TILE_ID')}
            type="number"
            size="small"
            value={tempFilters.tileId || ''}
            onChange={(e) => setTempFilters({ ...tempFilters, tileId: e.target.value ? parseInt(e.target.value) : undefined })}
            sx={{ minWidth: 120 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('population.FILTER_CHANGE_TYPE')}</InputLabel>
            <Select
              value={tempFilters.changeType || ''}
              onChange={(e: SelectChangeEvent) => setTempFilters({ ...tempFilters, changeType: e.target.value as PopulationChangeType || undefined })}
              label={t('population.FILTER_CHANGE_TYPE')}
            >
              <MenuItem value="">{t('population.FILTER_ALL_TYPES')}</MenuItem>
              {Object.values(PopulationChangeType).map(type => (
                <MenuItem key={type} value={type}>
                  {PopulationService.getChangeTypeLabel(type, t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('population.FILTER_FROM_DATE')}
              value={tempFilters.dateFrom ? new Date(tempFilters.dateFrom) : null}
              onChange={(date) => setTempFilters({ ...tempFilters, dateFrom: date?.toISOString() || undefined })}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />

            <DatePicker
              label={t('population.FILTER_TO_DATE')}
              value={tempFilters.dateTo ? new Date(tempFilters.dateTo) : null}
              onChange={(date) => setTempFilters({ ...tempFilters, dateTo: date?.toISOString() || undefined })}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            size="small"
            onClick={handleApplyFilters}
            startIcon={<FilterIcon />}
          >
            {t('population.APPLY_FILTERS')}
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
          >
            {t('population.CLEAR_FILTERS')}
          </Button>
        </Stack>
      </Paper>
    </Collapse>
  );

  if (loading && history.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          {t('population.RETRY')}
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('population.TITLE')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('population.SUBTITLE')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('population.TOOLTIP_FILTERS')}>
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('population.TOOLTIP_REFRESH')}>
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {renderFilters()}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="population history table">
          <TableHead>
            <TableRow>
              <TableCell width={40} />
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'tileId'}
                  direction={sortField === 'tileId' ? sortOrder : 'asc'}
                  onClick={() => handleSort('tileId')}
                >
                  {t('population.TABLE_TILE_ID')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'timestamp'}
                  direction={sortField === 'timestamp' ? sortOrder : 'asc'}
                  onClick={() => handleSort('timestamp')}
                >
                  {t('population.TABLE_TIMESTAMP')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">{t('population.TABLE_PREVIOUS')}</TableCell>
              <TableCell align="center">{t('population.TABLE_NEW')}</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'changeAmount'}
                  direction={sortField === 'changeAmount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('changeAmount')}
                >
                  {t('population.TABLE_CHANGE')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">{t('population.TABLE_TYPE')}</TableCell>
              <TableCell align="center">{t('population.TABLE_REASON')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleRow(row.id)}
                    >
                      {expandedRows.has(row.id) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <Typography variant="body2" fontWeight="medium">
                        #{row.tileId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({row.tileCoordinates.x}, {row.tileCoordinates.y})
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {new Date(row.timestamp).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(row.timestamp).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {PopulationService.formatPopulation(row.previousPopulation)}
                  </TableCell>
                  <TableCell align="center">
                    {PopulationService.formatPopulation(row.newPopulation)}
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      color={row.changeAmount >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {PopulationService.formatChangeAmount(row.changeAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={PopulationService.getChangeTypeLabel(row.changeType, t)}
                      size="small"
                      sx={{
                        backgroundColor: PopulationService.getChangeTypeColor(row.changeType),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {row.changeReason}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expandedRows.has(row.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          {t('population.ADDITIONAL_DETAILS')}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              {t('population.FACILITY_TYPE')}
                            </Typography>
                            <Typography variant="body2">
                              {row.facilityType || t('population.NA')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              {t('population.CALCULATION_STEP')}
                            </Typography>
                            <Typography variant="body2">
                              {t('population.STEP')} {row.calculationStep}
                            </Typography>
                          </Grid>
                          {row.triggeredBy && (
                            <>
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2" color="text.secondary">
                                  {t('population.TRIGGERED_BY')}
                                </Typography>
                                <Typography variant="body2">
                                  {row.triggeredBy.username}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2" color="text.secondary">
                                  {t('population.ACTION')}
                                </Typography>
                                <Typography variant="body2">
                                  {row.triggeredBy.action}
                                </Typography>
                              </Grid>
                            </>
                          )}
                        </Grid>
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            {t('population.FULL_REASON')}
                          </Typography>
                          <Typography variant="body2">
                            {row.changeReason}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {t('population.NO_CHANGES_FOUND')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default ManagerPopulationHistoryPage;