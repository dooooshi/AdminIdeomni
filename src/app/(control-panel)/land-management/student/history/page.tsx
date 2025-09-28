'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import {
  TeamLandSummary,
  LandPurchase,
  LandPurchaseHistoryQuery,
  PaginatedResponse
} from '@/types/land';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]}`,
  boxShadow: 'none',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300],
  },
}));

interface StudentPortfolioPageProps {}

const StudentPortfolioPage: React.FC<StudentPortfolioPageProps> = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [teamSummary, setTeamSummary] = useState<TeamLandSummary | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PaginatedResponse<LandPurchase> | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Query state
  const [filters, setFilters] = useState<LandPurchaseHistoryQuery>({
    page: 1,
    pageSize: 10,
  });

  // Load initial data
  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Load purchase history when filters change
  useEffect(() => {
    loadPurchaseHistory();
  }, [page, rowsPerPage, filters]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load team summary and initial purchase history
      const [summaryData, historyData] = await Promise.all([
        LandService.getTeamLandSummary(),
        LandService.getPurchaseHistory({ page: 1, pageSize: rowsPerPage })
      ]);

      setTeamSummary(summaryData);
      setPurchaseHistory(historyData);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      setHistoryLoading(true);
      
      const queryParams: LandPurchaseHistoryQuery = {
        ...filters,
        page: page + 1, // Convert 0-based to 1-based
        pageSize: rowsPerPage,
      };

      const historyData = await LandService.getPurchaseHistory(queryParams);
      setPurchaseHistory(historyData);
    } catch (err: any) {
      console.error('Failed to load purchase history:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPortfolioData();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string = theme.palette.primary.main,
    subtitle?: string
  ) => (
    <StatsCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </StatsCard>
  );


  const renderPurchaseHistoryTable = () => {
    if (!purchaseHistory) return null;

    return (
      <Paper className="border border-gray-100 dark:border-gray-800 shadow-none">
        <Box p={3}>
          <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-2">
            {t('landManagement.PURCHASE_HISTORY')}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">{t('landManagement.PURCHASE_DATE')}</TableCell>
                <TableCell align="center">{t('landManagement.TILE_ID')}</TableCell>
                <TableCell align="center">{t('landManagement.OWNED_AREA')}</TableCell>
                <TableCell align="center">{t('landManagement.GOLD_COST')}</TableCell>
                <TableCell align="center">{t('landManagement.CARBON_COST')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : purchaseHistory.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="py-16">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <AssessmentIcon className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <Typography variant="body1" className="font-medium text-gray-900 dark:text-white mb-1">
                      {t('landManagement.NO_PURCHASES_FOUND')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('landManagement.START_INVESTING_PORTFOLIO')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                purchaseHistory.data.map((purchase) => (
                  <TableRow key={purchase.id} hover>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {format(new Date(purchase.purchaseDate), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(purchase.purchaseDate), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {purchase.tileId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {LandService.formatArea(purchase.purchasedArea)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {LandService.formatCurrency(purchase.goldCost, 'gold')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {LandService.formatCurrency(purchase.carbonCost, 'carbon')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {purchaseHistory.data.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={purchaseHistory.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              {t('landManagement.RETRY')}
            </Button>
          }>
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  if (!teamSummary) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Alert severity="info">
            {t('landManagement.NO_TEAM_DATA')}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('navigation.TEAM_LAND_MANAGEMENT')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('landManagement.PORTFOLIO_DESCRIPTION')}
            </Typography>
          </div>
          <Tooltip title={t('common.REFRESH_DATA')}>
            <IconButton onClick={handleRefresh} className="border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white shadow-none">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>

        {/* Team Summary Cards */}
        <Grid container spacing={6} sx={{ mb: 6 }}>
        </Grid>

        {/* Purchase History Table */}
        {renderPurchaseHistoryTable()}
      </div>
    </div>
  );
};

export default StudentPortfolioPage;