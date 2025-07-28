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
 * Transfer Hub Page
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

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item}>
            <Typography variant="h3" className="font-semibold">
              {t('teamManagement:RESOURCE_TRANSFERS')}
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              {t('teamManagement:SEND_RESOURCES_SUBTITLE')}
            </Typography>
          </motion.div>

          {/* Current Balance Card */}
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
                      {t('teamManagement:GOLD')}
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
                      {t('teamManagement:CARBON')}
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-green-600">
                      {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}
                    </Typography>
                  </div>
                </Box>
              </div>
            </Paper>
          </motion.div>

          {/* Transfer Options */}
          <motion.div variants={item}>
            <Typography variant="h6" className="mb-4">
              {t('teamManagement:SELECT_TRANSFER_TYPE')}
            </Typography>
            <Grid component="div" container spacing={3}>
              {/* Gold Transfer Card */}
              <Grid component="div" item xs={12} md={6}>
                <Card className="h-full">
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <IdeomniSvgIcon size={32} className="text-yellow-600">
                        heroicons-solid:currency-dollar
                      </IdeomniSvgIcon>
                      <Typography variant="h6">
                        {t('teamManagement:GOLD_TRANSFERS')}
                      </Typography>
                    </div>
                    <Typography color="text.secondary" className="mb-4">
                      {t('teamManagement:TRANSFER_GOLD_SUBTITLE')}
                    </Typography>
                    <Typography variant="body2" className="mb-2">
                      <strong>{t('teamManagement:AVAILABLE_BALANCE')}:</strong> {TeamTransferService.formatTransferAmount(teamAccount.gold, TeamResourceType.GOLD)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={teamAccount.gold <= 0}
                      onClick={() => router.push('/team-management/transfers/gold')}
                      startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_GOLD')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              {/* Carbon Transfer Card */}
              <Grid component="div" item xs={12} md={6}>
                <Card className="h-full">
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <IdeomniSvgIcon size={32} className="text-green-600">
                        heroicons-solid:leaf
                      </IdeomniSvgIcon>
                      <Typography variant="h6">
                        {t('teamManagement:CARBON_TRANSFERS')}
                      </Typography>
                    </div>
                    <Typography color="text.secondary" className="mb-4">
                      {t('teamManagement:TRANSFER_CARBON_SUBTITLE')}
                    </Typography>
                    <Typography variant="body2" className="mb-2">
                      <strong>{t('teamManagement:AVAILABLE_BALANCE')}:</strong> {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={teamAccount.carbon <= 0}
                      onClick={() => router.push('/team-management/transfers/carbon')}
                      startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                    >
                      {t('teamManagement:TRANSFER_CARBON')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </motion.div>

          {/* Recent Transfers */}
          {recentTransfers && recentTransfers.data.length > 0 && (
            <motion.div variants={item}>
              <Paper className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h6">
                    {t('teamManagement:RECENT_TRANSFERS')}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => router.push('/team-management/history/transfers')}
                    endIcon={<IdeomniSvgIcon>heroicons-outline:arrow-right</IdeomniSvgIcon>}
                  >
                    {t('teamManagement:VIEW_HISTORY')}
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentTransfers.data.slice(0, 3).map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IdeomniSvgIcon 
                          size={20} 
                          className={transfer.operationType === 'TRANSFER_OUT' ? 'text-red-500' : 'text-green-500'}
                        >
                          {transfer.operationType === 'TRANSFER_OUT' 
                            ? 'heroicons-outline:arrow-up-right' 
                            : 'heroicons-outline:arrow-down-left'
                          }
                        </IdeomniSvgIcon>
                        <div>
                          <Typography variant="body2" className="font-medium">
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
                          className={transfer.operationType === 'TRANSFER_OUT' ? 'text-red-600' : 'text-green-600'}
                        >
                          {transfer.operationType === 'TRANSFER_OUT' ? '-' : '+'}
                          {TeamTransferService.formatTransferAmount(transfer.amount, transfer.resourceType)}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </Paper>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement:QUICK_ACTIONS')}
              </Typography>
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/history')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:clock</IdeomniSvgIcon>}
                >
                  {t('teamManagement:VIEW_ACCOUNT_HISTORY')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/dashboard')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:home</IdeomniSvgIcon>}
                >
                  {t('teamManagement:TEAM_DASHBOARD')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/browse')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:magnifying-glass</IdeomniSvgIcon>}
                >
                  {t('teamManagement:BROWSE_OTHER_TEAMS')}
                </Button>
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default TransferHubPage;