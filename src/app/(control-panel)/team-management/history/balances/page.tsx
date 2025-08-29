'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MonetizationOn, Co2 } from '@mui/icons-material';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { 
  useGetCurrentUserTeamAccountQuery,
  useGetBalanceHistoryQuery
} from '../../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TeamResourceType, BalanceTrendData } from '@/types/teamTransfer';

/**
 * Balance History Page - Minimalist Business Design
 * View balance snapshots and changes over time
 */
function BalanceHistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: teamAccount, isLoading, error } = useGetCurrentUserTeamAccountQuery();
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: balanceData, isLoading: loadingBalances, refetch } = useGetBalanceHistoryQuery({
    page,
    pageSize,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  });

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Calculate balance summary
  const balanceSummary = balanceData?.data ? {
    totalChanges: balanceData.data.length,
    goldChanges: balanceData.data.filter(b => b.goldChange !== 0).length,
    carbonChanges: balanceData.data.filter(b => b.carbonChange !== 0).length,
    largestGoldIncrease: Math.max(0, ...balanceData.data.map(b => b.goldChange)),
    largestCarbonIncrease: Math.max(0, ...balanceData.data.map(b => b.carbonChange))
  } : null;

  if (isLoading) {
    return <IdeomniLoading />;
  }

  if (error || !teamAccount) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Paper className="p-16 text-center border border-gray-100 dark:border-gray-800 shadow-none">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
              <IdeomniSvgIcon size={24} className="text-red-500 dark:text-red-400">
                heroicons-outline:exclamation-triangle
              </IdeomniSvgIcon>
            </div>
            <Typography variant="h5" className="font-medium mb-3 text-gray-900 dark:text-white">
              {t('teamManagement.NOT_IN_TEAM_YET')}
            </Typography>
            <Typography color="text.secondary" className="mb-8 max-w-sm mx-auto">
              {t('teamManagement.JOIN_OR_CREATE_TEAM')}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push('/team-management/dashboard')}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
            >
              {t('teamManagement.TEAM_DASHBOARD')}
            </Button>
          </Paper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="text"
                onClick={() => router.push('/team-management/history')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
              >
                {t('teamManagement.BACK')}
              </Button>
            </div>
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('teamManagement.BALANCE_HISTORY')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track how your team's balance has changed over time
            </Typography>
          </div>

          {/* Current Balance */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement.CURRENT_BALANCE')}
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement.GOLD_BALANCE')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white flex items-center gap-2">
                  <MonetizationOn className="text-yellow-600" sx={{ fontSize: 28 }} />
                  {TeamTransferService.formatTransferAmount(teamAccount.gold)}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement.CARBON_BALANCE')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white flex items-center gap-2">
                  <Co2 className="text-green-600" sx={{ fontSize: 28 }} />
                  {TeamTransferService.formatTransferAmount(teamAccount.carbon)}
                </Typography>
              </div>
            </div>
          </Paper>

          {/* Date Filters */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement.DATE_RANGE')}
            </Typography>
            <div className="flex gap-4 items-end">
              <TextField
                type="date"
                label={t('teamManagement.FROM_DATE')}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label={t('teamManagement.TO_DATE')}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:x-mark</IdeomniSvgIcon>}
              >
                {t('teamManagement.CLEAR_FILTERS')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => refetch()}
                className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900"
                startIcon={<IdeomniSvgIcon>heroicons-outline:magnifying-glass</IdeomniSvgIcon>}
              >
                {t('teamManagement.APPLY_FILTERS')}
              </Button>
            </div>
          </Paper>

          {/* Balance Summary Stats */}
          {balanceSummary && (
            <div>
              <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
                {t('teamManagement.BALANCE_CHANGE_SUMMARY')}
              </Typography>
              <Grid component="div" container spacing={6}>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                            {t('teamManagement.TOTAL_CHANGES')}
                          </Typography>
                          <Typography variant="h4" className="font-light text-gray-900 dark:text-white mt-2">
                            {balanceSummary.totalChanges}
                          </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <IdeomniSvgIcon size={20} className="text-blue-500">
                            heroicons-outline:scale
                          </IdeomniSvgIcon>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                            {t('teamManagement.GOLD_CHANGES')}
                          </Typography>
                          <Typography variant="h4" className="font-light text-gray-900 dark:text-white mt-2">
                            {balanceSummary.goldChanges}
                          </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                          <MonetizationOn sx={{ fontSize: 20 }} className="text-yellow-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                            {t('teamManagement.CARBON_CHANGES')}
                          </Typography>
                          <Typography variant="h4" className="font-light text-gray-900 dark:text-white mt-2">
                            {balanceSummary.carbonChanges}
                          </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <Co2 sx={{ fontSize: 20 }} className="text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                        {t('teamManagement.LARGEST_INCREASES')}
                      </Typography>
                      <Typography variant="body2" className="text-yellow-600 mb-1">
                        <span className="inline-flex items-center gap-1">{t('teamManagement.GOLD')}: +<MonetizationOn sx={{ fontSize: 14 }} className="text-yellow-600" />{TeamTransferService.formatTransferAmount(balanceSummary.largestGoldIncrease)}</span>
                      </Typography>
                      <Typography variant="body2" className="text-green-600">
                        <span className="inline-flex items-center gap-1">{t('teamManagement.CARBON')}: +<Co2 sx={{ fontSize: 14 }} className="text-green-600" />{TeamTransferService.formatTransferAmount(balanceSummary.largestCarbonIncrease)}</span>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Balance History Table */}
          <Paper className="border border-gray-100 dark:border-gray-800 shadow-none">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('teamManagement.DATE')}</TableCell>
                      <TableCell>{t('teamManagement.GOLD_BALANCE')}</TableCell>
                      <TableCell>{t('teamManagement.GOLD')} {t('teamManagement.CHANGE')}</TableCell>
                      <TableCell>{t('teamManagement.CARBON_BALANCE')}</TableCell>
                      <TableCell>{t('teamManagement.CARBON')} {t('teamManagement.CHANGE')}</TableCell>
                      <TableCell>{t('teamManagement.RELATED_OPERATION')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingBalances ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <IdeomniLoading />
                        </TableCell>
                      </TableRow>
                    ) : balanceData?.data && balanceData.data.length > 0 ? (
                      balanceData.data.map((balance) => (
                        <TableRow key={balance.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(balance.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(balance.createdAt).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-medium text-yellow-600 flex items-center gap-1">
                              <MonetizationOn sx={{ fontSize: 16 }} />
                              {TeamTransferService.formatTransferAmount(balance.goldBalance)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              className={`font-medium flex items-center gap-1 ${
                                balance.goldChange > 0 ? 'text-green-600' : 
                                balance.goldChange < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}
                            >
                              {balance.goldChange > 0 ? '+' : ''}
                              {balance.goldChange !== 0 && <MonetizationOn sx={{ fontSize: 14 }} className="text-yellow-600" />}
                              {balance.goldChange === 0 ? '0' : TeamTransferService.formatTransferAmount(balance.goldChange)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-medium text-green-600 flex items-center gap-1">
                              <Co2 sx={{ fontSize: 16 }} />
                              {TeamTransferService.formatTransferAmount(balance.carbonBalance)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              className={`font-medium flex items-center gap-1 ${
                                balance.carbonChange > 0 ? 'text-green-600' : 
                                balance.carbonChange < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}
                            >
                              {balance.carbonChange > 0 ? '+' : ''}
                              {balance.carbonChange !== 0 && <Co2 sx={{ fontSize: 14 }} className="text-green-600" />}
                              {balance.carbonChange === 0 ? '0' : TeamTransferService.formatTransferAmount(balance.carbonChange)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {balance.operationId ? (
                              <Typography variant="body2" color="primary" className="cursor-pointer">
                                View Operation
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <IdeomniSvgIcon size={24} className="text-gray-400 dark:text-gray-500">
                              heroicons-outline:scale
                            </IdeomniSvgIcon>
                          </div>
                          <Typography variant="body1" className="font-medium text-gray-900 dark:text-white mb-1">
                            {t('teamManagement.NO_BALANCE_CHANGES_FOUND')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('teamManagement.BALANCE_CHANGES_MESSAGE')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {balanceData && balanceData.totalPages > 1 && (
                <Box className="p-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('teamManagement.SHOWING')} {((page - 1) * pageSize) + 1} {t('teamManagement.TO')} {Math.min(page * pageSize, balanceData.total)} {t('teamManagement.OF')} {balanceData.total} {t('teamManagement.ENTRIES')}
                    </Typography>
                    <Pagination
                      count={balanceData.totalPages}
                      page={page}
                      onChange={(_, newPage) => setPage(newPage)}
                      color="primary"
                    />
                  </div>
                </Box>
              )}
          </Paper>

          {/* Quick Actions */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement.QUICK_ACTIONS')}
            </Typography>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/history/operations')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:list-bullet</IdeomniSvgIcon>}
              >
                {t('teamManagement.ALL_OPERATIONS')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/history/transfers')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-path</IdeomniSvgIcon>}
              >
                {t('teamManagement.TRANSFER_HISTORY')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/transfers')}
                className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900"
                startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
              >
                {t('teamManagement.TRANSFER_RESOURCES')}
              </Button>
            </div>
          </Paper>
        </motion.div>
      </div>
    </div>
  );
}

export default BalanceHistoryPage;