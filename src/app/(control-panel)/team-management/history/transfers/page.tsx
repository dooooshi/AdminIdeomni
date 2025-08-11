'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { 
  useGetCurrentUserTeamAccountQuery,
  useGetTransferHistoryQuery
} from '../../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TeamResourceType, HistoryFilterState } from '@/types/teamTransfer';

/**
 * Transfer History Page - Minimalist Business Design
 * Dedicated page for viewing transfer operations with directional filtering
 */
function TransferHistoryPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: teamAccount, isLoading, error } = useGetCurrentUserTeamAccountQuery();
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<HistoryFilterState>({
    operationType: 'all' as any,
    resourceType: 'all' as any,
    direction: 'all',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  const { data: transfersData, isLoading: loadingTransfers, refetch } = useGetTransferHistoryQuery({
    page,
    pageSize,
    direction: filters.direction !== 'all' ? filters.direction : undefined,
    resourceType: filters.resourceType !== 'all' ? filters.resourceType : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  });

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  };

  const handleFilterChange = (field: keyof HistoryFilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      operationType: 'all' as any,
      resourceType: 'all' as any,
      direction: 'all',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    setPage(1);
  };

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
              {t('teamManagement:NOT_IN_TEAM_YET')}
            </Typography>
            <Typography color="text.secondary" className="mb-8 max-w-sm mx-auto">
              {t('teamManagement:JOIN_OR_CREATE_TEAM')}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push('/team-management/dashboard')}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
            >
              {t('teamManagement:TEAM_DASHBOARD')}
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
                {t('teamManagement:BACK')}
              </Button>
            </div>
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('teamManagement:TRANSFER_HISTORY')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View all resource transfers sent and received by your team
            </Typography>
          </div>

          {/* Filters */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement:FILTER_OPERATIONS')}
            </Typography>
              <Grid component="div" container spacing={3}>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('teamManagement:TRANSFER_DIRECTION')}</InputLabel>
                    <Select
                      value={filters.direction}
                      label={t('teamManagement:TRANSFER_DIRECTION')}
                      onChange={(e) => handleFilterChange('direction', e.target.value)}
                    >
                      <MenuItem value="all">{t('teamManagement:ALL_DIRECTIONS')}</MenuItem>
                      <MenuItem value="incoming">{t('teamManagement:INCOMING')}</MenuItem>
                      <MenuItem value="outgoing">{t('teamManagement:OUTGOING')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('teamManagement:RESOURCE_TYPE')}</InputLabel>
                    <Select
                      value={filters.resourceType}
                      label={t('teamManagement:RESOURCE_TYPE')}
                      onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                    >
                      <MenuItem value="all">{t('teamManagement:ALL_RESOURCES')}</MenuItem>
                      <MenuItem value={TeamResourceType.GOLD}>{t('teamManagement:GOLD')}</MenuItem>
                      <MenuItem value={TeamResourceType.CARBON}>{t('teamManagement:CARBON')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('teamManagement:FROM_DATE')}
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('teamManagement:TO_DATE')}
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            <div className="flex gap-4 mt-6">
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:x-mark</IdeomniSvgIcon>}
              >
                {t('teamManagement:CLEAR_FILTERS')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => refetch()}
                className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900"
                startIcon={<IdeomniSvgIcon>heroicons-outline:magnifying-glass</IdeomniSvgIcon>}
              >
                {t('teamManagement:APPLY_FILTERS')}
              </Button>
            </div>
          </Paper>

          {/* Transfer Summary Cards */}
          {transfersData && (
            <Grid component="div" container spacing={6}>
              <Grid component="div" size={{ xs: 12, sm: 4 }}>
                <Paper className="p-6 border border-gray-100 dark:border-gray-800 shadow-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                        {t('teamManagement:TOTAL_TRANSFERS')}
                      </Typography>
                      <Typography variant="h4" className="font-light text-gray-900 dark:text-white mt-2">
                        {transfersData.total}
                      </Typography>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <IdeomniSvgIcon size={20} className="text-blue-500">
                        heroicons-outline:arrow-path
                      </IdeomniSvgIcon>
                    </div>
                  </div>
                </Paper>
              </Grid>
              <Grid component="div" size={{ xs: 12, sm: 4 }}>
                <Paper className="p-6 border border-gray-100 dark:border-gray-800 shadow-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                        {t('teamManagement:INCOMING')}
                      </Typography>
                      <Typography variant="h4" className="font-light text-gray-900 dark:text-white mt-2">
                        {transfersData.data.filter(t => t.operationType === 'TRANSFER_IN').length}
                      </Typography>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <IdeomniSvgIcon size={20} className="text-green-500">
                        heroicons-outline:arrow-down-left
                      </IdeomniSvgIcon>
                    </div>
                  </div>
                </Paper>
              </Grid>
              <Grid component="div" size={{ xs: 12, sm: 4 }}>
                <Paper className="p-6 border border-gray-100 dark:border-gray-800 shadow-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                        {t('teamManagement:OUTGOING')}
                      </Typography>
                      <Typography variant="h4" className="font-light text-gray-900 dark:text-white mt-2">
                        {transfersData.data.filter(t => t.operationType === 'TRANSFER_OUT').length}
                      </Typography>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <IdeomniSvgIcon size={20} className="text-red-500">
                        heroicons-outline:arrow-up-right
                      </IdeomniSvgIcon>
                    </div>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Transfers Table */}
          <Paper className="border border-gray-100 dark:border-gray-800 shadow-none">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('teamManagement:DATE')}</TableCell>
                      <TableCell>{t('teamManagement:DIRECTION')}</TableCell>
                      <TableCell>{t('teamManagement:PARTNER_TEAM')}</TableCell>
                      <TableCell>{t('teamManagement:RESOURCE')}</TableCell>
                      <TableCell>{t('teamManagement:AMOUNT')}</TableCell>
                      <TableCell>{t('teamManagement:DESCRIPTION')}</TableCell>
                      <TableCell>{t('teamManagement:USER')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingTransfers ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <IdeomniLoading />
                        </TableCell>
                      </TableRow>
                    ) : transfersData?.data && transfersData.data.length > 0 ? (
                      transfersData.data.map((transfer) => (
                        <TableRow key={transfer.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(transfer.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transfer.createdAt).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={transfer.operationType === 'TRANSFER_OUT' ? t('teamManagement:OUTGOING') : t('teamManagement:INCOMING')}
                              color={transfer.operationType === 'TRANSFER_OUT' ? 'error' : 'success'}
                              icon={
                                <IdeomniSvgIcon size={16}>
                                  {transfer.operationType === 'TRANSFER_OUT' 
                                    ? 'heroicons-outline:arrow-up-right'
                                    : 'heroicons-outline:arrow-down-left'
                                  }
                                </IdeomniSvgIcon>
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold">
                                {transfer.operationType === 'TRANSFER_OUT' 
                                  ? transfer.targetTeam?.name?.[0] || '?'
                                  : transfer.sourceTeam?.name?.[0] || '?'
                                }
                              </div>
                              <Typography variant="body2">
                                {transfer.operationType === 'TRANSFER_OUT' 
                                  ? transfer.targetTeam?.name || 'Unknown Team'
                                  : transfer.sourceTeam?.name || 'Unknown Team'
                                }
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IdeomniSvgIcon 
                                size={16} 
                                className={transfer.resourceType === TeamResourceType.GOLD ? 'text-yellow-600' : 'text-green-600'}
                              >
                                {transfer.resourceType === TeamResourceType.GOLD 
                                  ? 'heroicons-solid:currency-dollar' 
                                  : 'heroicons-solid:leaf'
                                }
                              </IdeomniSvgIcon>
                              <Typography variant="body2">
                                {transfer.resourceType}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              className={`font-medium ${
                                transfer.operationType === 'TRANSFER_OUT' ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {transfer.operationType === 'TRANSFER_OUT' ? '-' : '+'}
                              {TeamTransferService.formatTransferAmount(transfer.amount, transfer.resourceType)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {transfer.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transfer.user.firstName && transfer.user.lastName
                                ? `${transfer.user.firstName} ${transfer.user.lastName}`
                                : transfer.user.username}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <IdeomniSvgIcon size={24} className="text-gray-400 dark:text-gray-500">
                              heroicons-outline:arrow-path
                            </IdeomniSvgIcon>
                          </div>
                          <Typography variant="body1" className="font-medium text-gray-900 dark:text-white mb-1">
                            {t('teamManagement:NO_TRANSFERS_FOUND')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or make your first transfer
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {transfersData && transfersData.totalPages > 1 && (
                <Box className="p-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('teamManagement:SHOWING')} {((page - 1) * pageSize) + 1} {t('teamManagement:TO')} {Math.min(page * pageSize, transfersData.total)} {t('teamManagement:OF')} {transfersData.total} {t('teamManagement:ENTRIES')}
                    </Typography>
                    <Pagination
                      count={transfersData.totalPages}
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
              {t('teamManagement:QUICK_ACTIONS')}
            </Typography>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/history/operations')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:list-bullet</IdeomniSvgIcon>}
              >
                {t('teamManagement:ALL_OPERATIONS')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/history/balances')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:scale</IdeomniSvgIcon>}
              >
                {t('teamManagement:BALANCE_HISTORY')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/transfers')}
                className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900"
                startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
              >
                {t('teamManagement:TRANSFER_RESOURCES')}
              </Button>
            </div>
          </Paper>
        </motion.div>
      </div>
    </div>
  );
}

export default TransferHistoryPage;