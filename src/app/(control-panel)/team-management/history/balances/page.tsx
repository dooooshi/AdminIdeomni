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
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { 
  useGetCurrentUserTeamAccountQuery,
  useGetBalanceHistoryQuery
} from '../../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TeamResourceType, BalanceTrendData } from '@/types/teamTransfer';

/**
 * Balance History Page
 * View balance snapshots and changes over time
 */
function BalanceHistoryPage() {
  const { t, i18n } = useTranslation();
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

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <div className="flex flex-col flex-1 max-w-2xl w-full mx-auto px-6 py-8">
          <Paper className="p-8 text-center">
            <IdeomniSvgIcon size={64} className="text-gray-400 mx-auto mb-4">
              heroicons-outline:exclamation-triangle
            </IdeomniSvgIcon>
            <Typography variant="h5" className="mb-2">
              {t('teamManagement:NOT_IN_TEAM_YET')}
            </Typography>
            <Typography color="text.secondary" className="mb-6">
              {t('teamManagement:JOIN_OR_CREATE_TEAM')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/team-management/dashboard')}
            >
              {t('teamManagement:TEAM_DASHBOARD')}
            </Button>
          </Paper>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="text"
                onClick={() => router.push('/team-management/history')}
                startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
              >
                {t('teamManagement:BACK')}
              </Button>
            </div>
            <Typography variant="h3" className="font-semibold">
              {t('teamManagement:BALANCE_HISTORY')}
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              Track how your team's balance has changed over time
            </Typography>
          </motion.div>

          {/* Current Balance */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement:CURRENT_BALANCE')}
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <IdeomniSvgIcon size={24} className="text-yellow-600">
                    heroicons-solid:currency-dollar
                  </IdeomniSvgIcon>
                  <div>
                    <Typography variant="body2" color="text.secondary">
                      {t('teamManagement:GOLD_BALANCE')}
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-yellow-600">
                      {TeamTransferService.formatTransferAmount(teamAccount.gold, TeamResourceType.GOLD)}
                    </Typography>
                  </div>
                </Box>
                <Box className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <IdeomniSvgIcon size={24} className="text-green-600">
                    heroicons-solid:leaf
                  </IdeomniSvgIcon>
                  <div>
                    <Typography variant="body2" color="text.secondary">
                      {t('teamManagement:CARBON_BALANCE')}
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-green-600">
                      {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}
                    </Typography>
                  </div>
                </Box>
              </div>
            </Paper>
          </motion.div>

          {/* Date Filters */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement:DATE_RANGE')}
              </Typography>
              <div className="flex gap-4 items-end">
                <TextField
                  type="date"
                  label={t('teamManagement:FROM_DATE')}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label={t('teamManagement:TO_DATE')}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:x-mark</IdeomniSvgIcon>}
                >
                  {t('teamManagement:CLEAR_FILTERS')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => refetch()}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:magnifying-glass</IdeomniSvgIcon>}
                >
                  {t('teamManagement:APPLY_FILTERS')}
                </Button>
              </div>
            </Paper>
          </motion.div>

          {/* Balance Summary Stats */}
          {balanceSummary && (
            <motion.div variants={item}>
              <Typography variant="h6" className="mb-4">
                Balance Change Summary
              </Typography>
              <Grid component="div" container spacing={3}>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="body2" color="text.secondary">
                            Total Changes
                          </Typography>
                          <Typography variant="h5" className="font-bold">
                            {balanceSummary.totalChanges}
                          </Typography>
                        </div>
                        <IdeomniSvgIcon size={24} className="text-blue-500">
                          heroicons-outline:scale
                        </IdeomniSvgIcon>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="body2" color="text.secondary">
                            Gold Changes
                          </Typography>
                          <Typography variant="h5" className="font-bold text-yellow-600">
                            {balanceSummary.goldChanges}
                          </Typography>
                        </div>
                        <IdeomniSvgIcon size={24} className="text-yellow-500">
                          heroicons-outline:currency-dollar
                        </IdeomniSvgIcon>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="body2" color="text.secondary">
                            Carbon Changes
                          </Typography>
                          <Typography variant="h5" className="font-bold text-green-600">
                            {balanceSummary.carbonChanges}
                          </Typography>
                        </div>
                        <IdeomniSvgIcon size={24} className="text-green-500">
                          heroicons-outline:leaf
                        </IdeomniSvgIcon>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" className="mb-2">
                        Largest Increases
                      </Typography>
                      <Typography variant="body2" className="text-yellow-600">
                        Gold: +{TeamTransferService.formatTransferAmount(balanceSummary.largestGoldIncrease, TeamResourceType.GOLD)}
                      </Typography>
                      <Typography variant="body2" className="text-green-600">
                        Carbon: +{TeamTransferService.formatTransferAmount(balanceSummary.largestCarbonIncrease, TeamResourceType.CARBON)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Balance History Table */}
          <motion.div variants={item}>
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('teamManagement:DATE')}</TableCell>
                      <TableCell>{t('teamManagement:GOLD_BALANCE')}</TableCell>
                      <TableCell>{t('teamManagement:GOLD')} {t('teamManagement:CHANGE')}</TableCell>
                      <TableCell>{t('teamManagement:CARBON_BALANCE')}</TableCell>
                      <TableCell>{t('teamManagement:CARBON')} {t('teamManagement:CHANGE')}</TableCell>
                      <TableCell>Related Operation</TableCell>
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
                            <Typography variant="body2" className="font-medium text-yellow-600">
                              {TeamTransferService.formatTransferAmount(balance.goldBalance, TeamResourceType.GOLD)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              className={`font-medium ${
                                balance.goldChange > 0 ? 'text-green-600' : 
                                balance.goldChange < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}
                            >
                              {balance.goldChange > 0 ? '+' : ''}
                              {balance.goldChange === 0 ? '0' : TeamTransferService.formatTransferAmount(balance.goldChange, TeamResourceType.GOLD)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-medium text-green-600">
                              {TeamTransferService.formatTransferAmount(balance.carbonBalance, TeamResourceType.CARBON)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              className={`font-medium ${
                                balance.carbonChange > 0 ? 'text-green-600' : 
                                balance.carbonChange < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}
                            >
                              {balance.carbonChange > 0 ? '+' : ''}
                              {balance.carbonChange === 0 ? '0' : TeamTransferService.formatTransferAmount(balance.carbonChange, TeamResourceType.CARBON)}
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
                        <TableCell colSpan={6} className="text-center py-8">
                          <IdeomniSvgIcon size={48} className="text-gray-400 mx-auto mb-4">
                            heroicons-outline:scale
                          </IdeomniSvgIcon>
                          <Typography variant="body1" color="text.secondary">
                            {t('teamManagement:NO_BALANCE_CHANGES_FOUND')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Balance changes will appear here as you make transfers
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {balanceData && balanceData.totalPages > 1 && (
                <Box className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('teamManagement:SHOWING')} {((page - 1) * pageSize) + 1} {t('teamManagement:TO')} {Math.min(page * pageSize, balanceData.total)} {t('teamManagement:OF')} {balanceData.total} {t('teamManagement:ENTRIES')}
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
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement:QUICK_ACTIONS')}
              </Typography>
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/history/operations')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:list-bullet</IdeomniSvgIcon>}
                >
                  {t('teamManagement:ALL_OPERATIONS')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/history/transfers')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-path</IdeomniSvgIcon>}
                >
                  {t('teamManagement:TRANSFER_HISTORY')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/team-management/transfers')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                >
                  {t('teamManagement:TRANSFER_RESOURCES')}
                </Button>
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default BalanceHistoryPage;