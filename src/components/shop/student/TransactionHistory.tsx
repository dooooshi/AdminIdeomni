'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
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
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CalendarMonth as DateIcon,
  Refresh as RefreshIcon,
  Home as FacilityIcon,
  FileDownload as DownloadIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/store';
import { fetchTeamTransactions } from '@/store/shopSlice';
import ShopService from '@/lib/services/shopService';

const originColors: Record<string, string> = {
  MINE: '#8B4513',
  QUARRY: '#696969',
  FOREST: '#228B22',
  FARM: '#90EE90',
  RANCH: '#FF6347',
  FISHERY: '#4682B4',
  SHOPS: '#FF69B4',
  FACTORY: '#708090',
  OTHER: '#808080',
};

export default function TransactionHistory() {
  const dispatch = useDispatch<AppDispatch>();
  const shopState = useSelector((state: RootState) => state.shop);
  const teamTransactions = shopState?.teamTransactions || [];
  const teamTransactionsSummary = shopState?.teamTransactionsSummary;
  const transactionsLoading = shopState?.transactionsLoading || false;
  const transactionsError = shopState?.transactionsError || null;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    dispatch(fetchTeamTransactions({ limit: 100 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTeamTransactions({ limit: 100 }));
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    if (!teamTransactions || teamTransactions.length === 0) return;

    const headers = ['Date', 'Material (CN)', 'Material (EN)', 'Origin', 'Quantity', 'Unit Price', 'Total Cost', 'Facility', 'Status'];
    const rows = teamTransactions.map(tx => [
      new Date(tx.purchasedAt).toLocaleString(),
      tx.material.nameZh,
      tx.material.nameEn,
      tx.material.origin,
      tx.quantity,
      tx.unitPrice,
      tx.totalAmount,
      tx.delivery.facilityName || 'N/A',
      tx.delivery.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    if (!teamTransactions || !Array.isArray(teamTransactions)) return [];

    let filtered = [...teamTransactions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        tx =>
          tx.material.nameEn?.toLowerCase().includes(term) ||
          tx.material.nameZh?.toLowerCase().includes(term) ||
          tx.transactionCode?.toLowerCase().includes(term)
      );
    }

    // Origin filter
    if (originFilter) {
      filtered = filtered.filter(tx => tx.material.origin === originFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        tx => new Date(tx.purchasedAt) >= startDate
      );
    }

    return filtered;
  }, [teamTransactions, searchTerm, originFilter, dateFilter]);

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Statistics Cards */}
      {teamTransactionsSummary && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Total Spent
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {ShopService.formatPrice(teamTransactionsSummary.totalSpent)}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Total Transactions
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {teamTransactionsSummary.totalTransactions}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Average Transaction
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {ShopService.formatPrice(Number(teamTransactionsSummary.totalSpent) / teamTransactionsSummary.totalTransactions || 0)}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Unique Materials
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {teamTransactionsSummary.uniqueMaterials}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Origin</InputLabel>
          <Select
            value={originFilter}
            label="Origin"
            onChange={(e) => setOriginFilter(e.target.value)}
          >
            <MenuItem value="">All Origins</MenuItem>
            {['MINE', 'QUARRY', 'FOREST', 'FARM', 'RANCH', 'FISHERY', 'SHOPS'].map((origin) => (
              <MenuItem key={origin} value={origin}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: originColors[origin],
                    }}
                  />
                  {origin}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={dateFilter}
            label="Period"
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          size="small"
          variant="outlined"
          onClick={handleExportCSV}
          startIcon={<DownloadIcon />}
          disabled={!filteredTransactions.length}
        >
          Export CSV
        </Button>

        <IconButton onClick={handleRefresh} disabled={transactionsLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {transactionsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {transactionsError}
        </Alert>
      )}

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Material</TableCell>
              <TableCell align="center">Origin</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total Cost</TableCell>
              <TableCell>Facility</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactionsLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Loading transactions...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No transactions found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || originFilter || dateFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Your purchase history will appear here'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(transaction.purchasedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(transaction.purchasedAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.material.nameZh}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {transaction.material.nameEn}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={transaction.material.origin}
                      size="small"
                      sx={{
                        backgroundColor: originColors[transaction.material.origin],
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{transaction.quantity}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {ShopService.formatPrice(transaction.unitPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {ShopService.formatPrice(transaction.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FacilityIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {transaction.delivery.facilityName || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={transaction.delivery.status}
                      size="small"
                      color={transaction.delivery.status === 'DELIVERED' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredTransactions.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    </Box>
  );
}