'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetCurrentUserTeamAccountQuery, useGetTransferHistoryQuery } from '../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TeamResourceType } from '@/types/teamTransfer';

/**
 * Transfer Hub Page - Minimalist Business Design
 * Main hub for all resource transfer operations
 */
function TransferHubPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: teamAccount, isLoading, error } = useGetCurrentUserTeamAccountQuery();
  const { data: recentTransfers } = useGetTransferHistoryQuery({ 
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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('teamManagement:RESOURCE_TRANSFERS')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('teamManagement:SEND_RESOURCES_SUBTITLE')}
            </Typography>
          </div>

          {/* Current Balance Card */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement:CURRENT_BALANCE')}
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement:GOLD')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white">
                  {TeamTransferService.formatTransferAmount(teamAccount.gold, TeamResourceType.GOLD)}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement:CARBON')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white">
                  {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}
                </Typography>
              </div>
            </div>
          </Paper>

          {/* Transfer Options */}
          <div>
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement:SELECT_TRANSFER_TYPE')}
            </Typography>
            <Grid component="div" container spacing={6}>
              {/* Gold Transfer Card */}
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Card className="h-full border border-gray-100 dark:border-gray-800 shadow-none">
                  <CardContent className="flex-1 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center">
                        <IdeomniSvgIcon size={20} className="text-yellow-600">
                          heroicons-solid:currency-dollar
                        </IdeomniSvgIcon>
                      </div>
                      <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                        {t('teamManagement:GOLD_TRANSFERS')}
                      </Typography>
                    </div>
                    <Typography color="text.secondary" className="mb-6 leading-relaxed">
                      {t('teamManagement:TRANSFER_GOLD_SUBTITLE')}
                    </Typography>
                    <Typography variant="body2" className="mb-2">
                      <span className="font-medium">{t('teamManagement:AVAILABLE_BALANCE')}:</span> {TeamTransferService.formatTransferAmount(teamAccount.gold, TeamResourceType.GOLD)}
                    </Typography>
                  </CardContent>
                  <CardActions className="p-8 pt-0">
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={teamAccount.gold <= 0}
                      onClick={() => router.push('/team-management/transfers/gold')}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                      startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_GOLD')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              {/* Carbon Transfer Card */}
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Card className="h-full border border-gray-100 dark:border-gray-800 shadow-none">
                  <CardContent className="flex-1 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center">
                        <IdeomniSvgIcon size={20} className="text-green-600">
                          heroicons-solid:leaf
                        </IdeomniSvgIcon>
                      </div>
                      <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                        {t('teamManagement:CARBON_TRANSFERS')}
                      </Typography>
                    </div>
                    <Typography color="text.secondary" className="mb-6 leading-relaxed">
                      {t('teamManagement:TRANSFER_CARBON_SUBTITLE')}
                    </Typography>
                    <Typography variant="body2" className="mb-2">
                      <span className="font-medium">{t('teamManagement:AVAILABLE_BALANCE')}:</span> {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}
                    </Typography>
                  </CardContent>
                  <CardActions className="p-8 pt-0">
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={teamAccount.carbon <= 0}
                      onClick={() => router.push('/team-management/transfers/carbon')}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                      startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_CARBON')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </div>

          {/* Recent Transfers */}
          {recentTransfers && recentTransfers.data.length > 0 && (
            <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                  {t('teamManagement:RECENT_TRANSFERS')}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push('/team-management/history/transfers')}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  endIcon={<IdeomniSvgIcon>heroicons-outline:arrow-right</IdeomniSvgIcon>}
                >
                  {t('teamManagement:VIEW_HISTORY')}
                </Button>
              </div>
              <div className="space-y-2">
                {recentTransfers.data.slice(0, 3).map((transfer, index) => (
                  <div key={transfer.id} className={`flex items-center justify-between py-4 ${index !== 2 && index !== recentTransfers.data.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${transfer.operationType === 'TRANSFER_OUT' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                        <IdeomniSvgIcon 
                          size={16} 
                          className={transfer.operationType === 'TRANSFER_OUT' ? 'text-red-500' : 'text-green-500'}
                        >
                          {transfer.operationType === 'TRANSFER_OUT' 
                            ? 'heroicons-outline:arrow-up-right' 
                            : 'heroicons-outline:arrow-down-left'
                          }
                        </IdeomniSvgIcon>
                      </div>
                      <div>
                        <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                          {transfer.operationType === 'TRANSFER_OUT' 
                            ? `To ${transfer.targetTeam?.name || 'Unknown Team'}`
                            : `From ${transfer.sourceTeam?.name || 'Unknown Team'}`
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {TeamTransferService.formatTransferAmount(transfer.amount, transfer.resourceType)} • {new Date(transfer.createdAt).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography 
                        variant="body2" 
                        className={`font-medium ${transfer.operationType === 'TRANSFER_OUT' ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {transfer.operationType === 'TRANSFER_OUT' ? '-' : '+'}
                        {TeamTransferService.formatTransferAmount(transfer.amount, transfer.resourceType)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </Paper>
          )}

          {/* Quick Actions */}
          <div>
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement:QUICK_ACTIONS')}
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/history')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start p-4 h-auto"
                startIcon={<IdeomniSvgIcon>heroicons-outline:clock</IdeomniSvgIcon>}
              >
                <div className="text-left">
                  <div className="font-medium">{t('teamManagement:VIEW_ACCOUNT_HISTORY')}</div>
                </div>
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/dashboard')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start p-4 h-auto"
                startIcon={<IdeomniSvgIcon>heroicons-outline:home</IdeomniSvgIcon>}
              >
                <div className="text-left">
                  <div className="font-medium">{t('teamManagement:TEAM_DASHBOARD')}</div>
                </div>
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/browse')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white justify-start p-4 h-auto"
                startIcon={<IdeomniSvgIcon>heroicons-outline:magnifying-glass</IdeomniSvgIcon>}
              >
                <div className="text-left">
                  <div className="font-medium">{t('teamManagement:BROWSE_OTHER_TEAMS')}</div>
                </div>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TransferHubPage;