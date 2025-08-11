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
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
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
 * History Overview Page - Minimalist Business Design
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

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
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

  // Calculate resource flow analysis
  const resourceFlowAnalysis = recentOperations?.data ? 
    TeamTransferService.calculateResourceFlowAnalysis(recentOperations.data) : null;

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
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('teamManagement:HISTORY_OVERVIEW')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('teamManagement:TRACK_ALL_OPERATIONS')}
            </Typography>
          </div>

          {/* Current Balance Summary */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement:CURRENT_BALANCE')}
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement:GOLD_BALANCE')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white">
                  {TeamTransferService.formatTransferAmount(teamAccount.gold, TeamResourceType.GOLD)}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement:CARBON_BALANCE')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white">
                  {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}
                </Typography>
              </div>
            </div>
          </Paper>

          {/* Operation Summary Stats */}
          {operationSummary && (
            <div>
              <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
                {t('teamManagement:OPERATION_SUMMARY')} ({t('teamManagement:LAST_30_DAYS')})
              </Typography>
              <Grid component="div" container spacing={6}>
                {/* Total Operations */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                            {t('teamManagement:TOTAL_OPERATIONS')}
                          </Typography>
                          <Typography variant="h4" className="font-light text-gray-900 dark:text-white mt-2">
                            {operationSummary.totalOperations}
                          </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <IdeomniSvgIcon size={20} className="text-blue-500">
                            heroicons-outline:list-bullet
                          </IdeomniSvgIcon>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Gold Flow */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                            {t('teamManagement:GOLD_FLOW')}
                          </Typography>
                          <div className="flex items-center gap-3 mt-2">
                            <Typography variant="body2" className="text-green-600">
                              +{TeamTransferService.formatTransferAmount(operationSummary.totalGoldIn, TeamResourceType.GOLD)}
                            </Typography>
                            <Typography variant="body2" className="text-red-600">
                              -{TeamTransferService.formatTransferAmount(operationSummary.totalGoldOut, TeamResourceType.GOLD)}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="font-medium text-gray-900 dark:text-white mt-1">
                            {t('teamManagement:NET')}: {operationSummary.totalGoldIn - operationSummary.totalGoldOut >= 0 ? '+' : ''}
                            {TeamTransferService.formatTransferAmount(operationSummary.totalGoldIn - operationSummary.totalGoldOut, TeamResourceType.GOLD)}
                          </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                          <IdeomniSvgIcon size={20} className="text-yellow-500">
                            heroicons-outline:currency-dollar
                          </IdeomniSvgIcon>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Carbon Flow */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                            {t('teamManagement:CARBON_FLOW')}
                          </Typography>
                          <div className="flex items-center gap-3 mt-2">
                            <Typography variant="body2" className="text-green-600">
                              +{TeamTransferService.formatTransferAmount(operationSummary.totalCarbonIn, TeamResourceType.CARBON)}
                            </Typography>
                            <Typography variant="body2" className="text-red-600">
                              -{TeamTransferService.formatTransferAmount(operationSummary.totalCarbonOut, TeamResourceType.CARBON)}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="font-medium text-gray-900 dark:text-white mt-1">
                            {t('teamManagement:NET')}: {operationSummary.totalCarbonIn - operationSummary.totalCarbonOut >= 0 ? '+' : ''}
                            {TeamTransferService.formatTransferAmount(operationSummary.totalCarbonIn - operationSummary.totalCarbonOut, TeamResourceType.CARBON)}
                          </Typography>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <IdeomniSvgIcon size={20} className="text-green-500">
                            heroicons-outline:leaf
                          </IdeomniSvgIcon>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Operation Types */}
                <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card className="border border-gray-100 dark:border-gray-800 shadow-none">
                    <CardContent className="p-6">
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-4 block">
                        {t('teamManagement:OPERATIONS_BY_TYPE')}
                      </Typography>
                      <div className="space-y-2">
                        {Object.entries(operationSummary.operationsByType)
                          .filter(([_, count]) => count > 0)
                          .slice(0, 3)
                          .map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center">
                            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                              {TeamTransferService.getOperationTypeDisplayName(type as TeamOperationType)}
                            </Typography>
                            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                              {count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Recent Activity and Quick Links */}
          <Grid container spacing={8}>
            {/* Recent Operations */}
            <Grid component="div" size={{ xs: 12, lg: 8 }}>
              <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                    {t('teamManagement:RECENT_ACTIVITY')}
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => router.push('/team-management/history/operations')}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    endIcon={<IdeomniSvgIcon>heroicons-outline:arrow-right</IdeomniSvgIcon>}
                  >
                    {t('teamManagement:ALL_OPERATIONS')}
                  </Button>
                </div>
                
                {recentOperations?.data && recentOperations.data.length > 0 ? (
                  <div className="space-y-2">
                    {recentOperations.data.slice(0, 5).map((operation, index) => (
                      <div key={operation.id} className={`flex items-center justify-between py-4 ${index !== 4 && index !== recentOperations.data.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            operation.operationType === TeamOperationType.TRANSFER_OUT 
                              ? 'bg-red-50 dark:bg-red-900/20'
                              : operation.operationType === TeamOperationType.TRANSFER_IN
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : 'bg-blue-50 dark:bg-blue-900/20'
                          }`}>
                            <IdeomniSvgIcon 
                              size={16} 
                              className={TeamTransferService.getOperationTypeColor(operation.operationType)}
                            >
                              {operation.operationType === TeamOperationType.TRANSFER_OUT 
                                ? 'heroicons-outline:arrow-up-right'
                                : operation.operationType === TeamOperationType.TRANSFER_IN
                                ? 'heroicons-outline:arrow-down-left'
                                : 'heroicons-outline:cog-6-tooth'
                              }
                            </IdeomniSvgIcon>
                          </div>
                          <div>
                            <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
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
                            className={`font-medium ${operation.operationType === TeamOperationType.TRANSFER_OUT ? 'text-red-600' : 'text-green-600'}`}
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
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <IdeomniSvgIcon size={24} className="text-gray-400 dark:text-gray-500">
                        heroicons-outline:clock
                      </IdeomniSvgIcon>
                    </div>
                    <Typography variant="body1" className="font-medium text-gray-900 dark:text-white mb-1">
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
              <div className="space-y-6">
                <Paper className="p-6 border border-gray-100 dark:border-gray-800 shadow-none">
                  <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-4">
                    {t('teamManagement:QUICK_ACTIONS')}
                  </Typography>
                  <div className="space-y-3">
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/team-management/history/operations')}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start"
                      startIcon={<IdeomniSvgIcon>heroicons-outline:list-bullet</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:ALL_OPERATIONS')}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/team-management/history/transfers')}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start"
                      startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-path</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_HISTORY')}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/team-management/history/balances')}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start"
                      startIcon={<IdeomniSvgIcon>heroicons-outline:scale</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:BALANCE_HISTORY')}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/team-management/transfers')}
                      className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 justify-start"
                      startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_RESOURCES')}
                    </Button>
                  </div>
                </Paper>

                {/* Top Transfer Partners */}
                {resourceFlowAnalysis?.topTransferPartners && resourceFlowAnalysis.topTransferPartners.length > 0 && (
                  <Paper className="p-6 border border-gray-100 dark:border-gray-800 shadow-none">
                    <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-4">
                      {t('teamManagement:TOP_TRANSFER_PARTNERS')}
                    </Typography>
                    <div className="space-y-3">
                      {resourceFlowAnalysis.topTransferPartners.slice(0, 3).map((partner) => (
                        <div key={partner.teamId} className="flex items-center justify-between">
                          <div>
                            <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                              {partner.teamName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {partner.transferCount} {t('teamManagement:TRANSFERS')}
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
              </div>
            </Grid>
          </Grid>
        </motion.div>
      </div>
    </div>
  );
}

export default HistoryOverviewPage;