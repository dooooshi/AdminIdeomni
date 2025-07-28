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
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { 
  useGetCurrentUserTeamAccountQuery,
  useGetOperationHistoryQuery
} from '../../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TeamOperationType, TeamResourceType, HistoryFilterState } from '@/types/teamTransfer';

/**
 * All Operations History Page
 * Complete list of team account operations with filtering and pagination
 */
function AllOperationsPage() {
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

  const { data: operationsData, isLoading: loadingOperations, refetch } = useGetOperationHistoryQuery({
    page,
    pageSize,
    operationType: filters.operationType !== 'all' ? filters.operationType : undefined,
    resourceType: filters.resourceType !== 'all' ? filters.resourceType : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
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
              {t('teamManagement:ALL_OPERATIONS')}
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              Complete history of all team account operations and transactions
            </Typography>
          </motion.div>

          {/* Filters */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement:FILTER_OPERATIONS')}
              </Typography>
              <Grid component="div" container spacing={3}>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('teamManagement:OPERATION_TYPE')}</InputLabel>
                    <Select
                      value={filters.operationType}
                      label={t('teamManagement:OPERATION_TYPE')}
                      onChange={(e) => handleFilterChange('operationType', e.target.value)}
                    >
                      <MenuItem value="all">{t('teamManagement:ALL_TYPES')}</MenuItem>
                      {Object.values(TeamOperationType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {TeamTransferService.getOperationTypeDisplayName(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
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
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('teamManagement:FROM_DATE')}
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
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
              <div className="flex gap-3 mt-4">
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

          {/* Operations Table */}
          <motion.div variants={item}>
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('teamManagement:DATE')}</TableCell>
                      <TableCell>{t('teamManagement:TYPE')}</TableCell>
                      <TableCell>{t('teamManagement:RESOURCE')}</TableCell>
                      <TableCell>{t('teamManagement:AMOUNT')}</TableCell>
                      <TableCell>{t('teamManagement:PARTNER_TEAM')}</TableCell>
                      <TableCell>{t('teamManagement:BALANCE_BEFORE')}</TableCell>
                      <TableCell>{t('teamManagement:BALANCE_AFTER')}</TableCell>
                      <TableCell>{t('teamManagement:USER')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingOperations ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <IdeomniLoading />
                        </TableCell>
                      </TableRow>
                    ) : operationsData?.data && operationsData.data.length > 0 ? (
                      operationsData.data.map((operation) => (
                        <TableRow key={operation.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(operation.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(operation.createdAt).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={TeamTransferService.getOperationTypeDisplayName(operation.operationType)}
                              className={TeamTransferService.getOperationTypeColor(operation.operationType)}
                              icon={
                                <IdeomniSvgIcon size={16}>
                                  {operation.operationType === TeamOperationType.TRANSFER_OUT 
                                    ? 'heroicons-outline:arrow-up-right'
                                    : operation.operationType === TeamOperationType.TRANSFER_IN
                                    ? 'heroicons-outline:arrow-down-left'
                                    : 'heroicons-outline:cog-6-tooth'
                                  }
                                </IdeomniSvgIcon>
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IdeomniSvgIcon 
                                size={16} 
                                className={operation.resourceType === TeamResourceType.GOLD ? 'text-yellow-600' : 'text-green-600'}
                              >
                                {operation.resourceType === TeamResourceType.GOLD 
                                  ? 'heroicons-solid:currency-dollar' 
                                  : 'heroicons-solid:leaf'
                                }
                              </IdeomniSvgIcon>
                              <Typography variant="body2">
                                {operation.resourceType}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              className={`font-medium ${
                                operation.operationType === TeamOperationType.TRANSFER_OUT ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {operation.operationType === TeamOperationType.TRANSFER_OUT ? '-' : '+'}
                              {TeamTransferService.formatTransferAmount(operation.amount, operation.resourceType)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {operation.targetTeam ? (
                              <Typography variant="body2">
                                → {operation.targetTeam.name}
                              </Typography>
                            ) : operation.sourceTeam ? (
                              <Typography variant="body2">
                                ← {operation.sourceTeam.name}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {TeamTransferService.formatTransferAmount(operation.balanceBefore, operation.resourceType)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">
                              {TeamTransferService.formatTransferAmount(operation.balanceAfter, operation.resourceType)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {operation.user.firstName && operation.user.lastName
                                ? `${operation.user.firstName} ${operation.user.lastName}`
                                : operation.user.username}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <IdeomniSvgIcon size={48} className="text-gray-400 mx-auto mb-4">
                            heroicons-outline:list-bullet
                          </IdeomniSvgIcon>
                          <Typography variant="body1" color="text.secondary">
                            {t('teamManagement:NO_OPERATIONS_FOUND')}
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
              {operationsData && operationsData.totalPages > 1 && (
                <Box className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('teamManagement:SHOWING')} {((page - 1) * pageSize) + 1} {t('teamManagement:TO')} {Math.min(page * pageSize, operationsData.total)} {t('teamManagement:OF')} {operationsData.total} {t('teamManagement:ENTRIES')}
                    </Typography>
                    <Pagination
                      count={operationsData.totalPages}
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
                  onClick={() => router.push('/team-management/history/transfers')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-path</IdeomniSvgIcon>}
                >
                  {t('teamManagement:TRANSFER_HISTORY')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/history/balances')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:scale</IdeomniSvgIcon>}
                >
                  {t('teamManagement:BALANCE_HISTORY')}
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

export default AllOperationsPage;