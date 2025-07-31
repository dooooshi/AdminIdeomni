'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { 
  useGetCurrentUserTeamAccountQuery,
  useGetOperationSummaryQuery,
  useGetOperationHistoryQuery,
  useGetTransferHistoryQuery
} from '../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TeamOperationType, TeamResourceType } from '@/types/teamTransfer';

/**
 * History Overview Page
 * Dashboard showing summary of team account operations and transfers
 */
function HistoryOverviewPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: teamAccount, isLoading, error } = useGetCurrentUserTeamAccountQuery();
  
  // Get last 30 days of data
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const { data: operationSummary, isLoading: loadingSummary } = useGetOperationSummaryQuery({
    startDate,
    endDate
  });
  
  const { data: recentOperations, isLoading: loadingOperations } = useGetOperationHistoryQuery({
    page: 1,
    pageSize: 10
  });

  const { data: recentTransfers, isLoading: loadingTransfers } = useGetTransferHistoryQuery({
    page: 1,
    pageSize: 5,
    direction: 'all'
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

  // Calculate resource flow analysis
  const resourceFlowAnalysis = recentOperations?.data ? 
    TeamTransferService.calculateResourceFlowAnalysis(recentOperations.data) : null;

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
            <Typography variant="h3" className="font-semibold">
              {t('teamManagement:HISTORY_OVERVIEW')}
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              {t('teamManagement:TRACK_ALL_OPERATIONS')}
            </Typography>
          </motion.div>

          {/* Current Balance Summary */}
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

          {/* Operation Summary Stats */}
          {operationSummary && (
            <motion.div variants={item}>
              <Typography variant="h6" className="mb-4">
                {t('teamManagement:OPERATION_SUMMARY')} ({t('teamManagement:LAST_30_DAYS', 'Last 30 Days')})
              </Typography>
              <Grid component="div" container spacing={3}>
                {/* Total Operations */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="body2" color="text.secondary">
                            {t('teamManagement:TOTAL_OPERATIONS')}
                          </Typography>
                          <Typography variant="h5" className="font-bold">
                            {operationSummary.totalOperations}
                          </Typography>
                        </div>
                        <IdeomniSvgIcon size={24} className="text-blue-500">
                          heroicons-outline:list-bullet
                        </IdeomniSvgIcon>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Gold Flow */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="body2" color="text.secondary">
                            {t('teamManagement:GOLD_FLOW')}
                          </Typography>
                          <div className="flex items-center gap-2">
                            <Typography variant="body2" className="text-green-600">
                              +{TeamTransferService.formatTransferAmount(operationSummary.totalGoldIn, TeamResourceType.GOLD)}
                            </Typography>
                            <Typography variant="body2" className="text-red-600">
                              -{TeamTransferService.formatTransferAmount(operationSummary.totalGoldOut, TeamResourceType.GOLD)}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="font-medium">
                            {t('teamManagement:NET_FLOW')}: {operationSummary.totalGoldIn - operationSummary.totalGoldOut >= 0 ? '+' : ''}
                            {TeamTransferService.formatTransferAmount(operationSummary.totalGoldIn - operationSummary.totalGoldOut, TeamResourceType.GOLD)}
                          </Typography>
                        </div>
                        <IdeomniSvgIcon size={24} className="text-yellow-500">
                          heroicons-outline:currency-dollar
                        </IdeomniSvgIcon>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Carbon Flow */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="body2" color="text.secondary">
                            {t('teamManagement:CARBON_FLOW')}
                          </Typography>
                          <div className="flex items-center gap-2">
                            <Typography variant="body2" className="text-green-600">
                              +{TeamTransferService.formatTransferAmount(operationSummary.totalCarbonIn, TeamResourceType.CARBON)}
                            </Typography>
                            <Typography variant="body2" className="text-red-600">
                              -{TeamTransferService.formatTransferAmount(operationSummary.totalCarbonOut, TeamResourceType.CARBON)}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="font-medium">
                            {t('teamManagement:NET_FLOW')}: {operationSummary.totalCarbonIn - operationSummary.totalCarbonOut >= 0 ? '+' : ''}
                            {TeamTransferService.formatTransferAmount(operationSummary.totalCarbonIn - operationSummary.totalCarbonOut, TeamResourceType.CARBON)}
                          </Typography>
                        </div>
                        <IdeomniSvgIcon size={24} className="text-green-500">
                          heroicons-outline:leaf
                        </IdeomniSvgIcon>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Operation Types */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" className="mb-2">
                        {t('teamManagement:OPERATIONS_BY_TYPE')}
                      </Typography>
                      <div className="space-y-1">
                        {Object.entries(operationSummary.operationsByType)
                          .filter(([_, count]) => count > 0)
                          .slice(0, 3)
                          .map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center">
                            <Typography variant="caption">
                              {TeamTransferService.getOperationTypeDisplayName(type as TeamOperationType)}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={count} 
                              className={TeamTransferService.getOperationTypeColor(type as TeamOperationType)}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Recent Activity and Quick Links */}
          <motion.div variants={item}>
            <Grid container spacing={6}>
              {/* Recent Operations */}
              <Grid component="div" size={{ xs: 12, lg: 8 }}>
                <Paper className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6">
                      {t('teamManagement:RECENT_ACTIVITY')}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => router.push('/team-management/history/operations')}
                      endIcon={<IdeomniSvgIcon>heroicons-outline:arrow-right</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:ALL_OPERATIONS')}
                    </Button>
                  </div>
                  
                  {recentOperations?.data && recentOperations.data.length > 0 ? (
                    <div className="space-y-3">
                      {recentOperations.data.slice(0, 5).map((operation) => (
                        <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <IdeomniSvgIcon 
                              size={20} 
                              className={TeamTransferService.getOperationTypeColor(operation.operationType)}
                            >
                              {operation.operationType === TeamOperationType.TRANSFER_OUT 
                                ? 'heroicons-outline:arrow-up-right'
                                : operation.operationType === TeamOperationType.TRANSFER_IN
                                ? 'heroicons-outline:arrow-down-left'
                                : 'heroicons-outline:cog-6-tooth'
                              }
                            </IdeomniSvgIcon>
                            <div>
                              <Typography variant="body2" className="font-medium">
                                {TeamTransferService.getOperationTypeDisplayName(operation.operationType)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(operation.createdAt).toLocaleDateString()} • {operation.user.firstName ? `${operation.user.firstName} ${operation.user.lastName}` : operation.user.username}
                              </Typography>
                            </div>
                          </div>
                          <div className="text-right">
                            <Typography 
                              variant="body2" 
                              className={operation.operationType === TeamOperationType.TRANSFER_OUT ? 'text-red-600' : 'text-green-600'}
                            >
                              {operation.operationType === TeamOperationType.TRANSFER_OUT ? '-' : '+'}
                              {TeamTransferService.formatTransferAmount(operation.amount, operation.resourceType)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {operation.resourceType}
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IdeomniSvgIcon size={48} className="text-gray-400 mx-auto mb-4">
                        heroicons-outline:clock
                      </IdeomniSvgIcon>
                      <Typography variant="body1" color="text.secondary">
                        {t('teamManagement:NO_OPERATIONS_YET')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('teamManagement:START_BY_MAKING_TRANSFER')}
                      </Typography>
                    </div>
                  )}
                </Paper>
              </Grid>

              {/* Quick Links */}
              <Grid component="div" size={{ xs: 12, lg: 4 }}>
                <Paper className="p-6">
                  <Typography variant="h6" className="mb-4">
                    {t('teamManagement:QUICK_ACTIONS')}
                  </Typography>
                  <div className="space-y-3">
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/team-management/history/operations')}
                      startIcon={<IdeomniSvgIcon>heroicons-outline:list-bullet</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:ALL_OPERATIONS')}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/team-management/history/transfers')}
                      startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-path</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_HISTORY')}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/team-management/history/balances')}
                      startIcon={<IdeomniSvgIcon>heroicons-outline:scale</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:BALANCE_HISTORY')}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => router.push('/team-management/transfers')}
                      startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_RESOURCES')}
                    </Button>
                  </div>
                </Paper>

                {/* Top Transfer Partners */}
                {resourceFlowAnalysis?.topTransferPartners && resourceFlowAnalysis.topTransferPartners.length > 0 && (
                  <Paper className="p-6 mt-6">
                    <Typography variant="h6" className="mb-4">
                      {t('teamManagement:TOP_TRANSFER_PARTNERS')}
                    </Typography>
                    <div className="space-y-3">
                      {resourceFlowAnalysis.topTransferPartners.slice(0, 3).map((partner) => (
                        <div key={partner.teamId} className="flex items-center justify-between">
                          <div>
                            <Typography variant="body2" className="font-medium">
                              {partner.teamName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {partner.transferCount} {t('teamManagement:TRANSFERS', 'transfers')}
                            </Typography>
                          </div>
                          <div className="text-right">
                            <Typography variant="caption" className="text-yellow-600">
                              {TeamTransferService.formatTransferAmount(partner.totalGoldExchanged, TeamResourceType.GOLD)}
                            </Typography>
                            <br />
                            <Typography variant="caption" className="text-green-600">
                              {TeamTransferService.formatTransferAmount(partner.totalCarbonExchanged, TeamResourceType.CARBON)}
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default HistoryOverviewPage;