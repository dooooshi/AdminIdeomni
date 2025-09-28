'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MonetizationOn, ReportProblemOutlined, SendOutlined, ArrowForwardOutlined, TrendingUpOutlined, TrendingDownOutlined, AccessTimeOutlined, HomeOutlined, SearchOutlined } from '@mui/icons-material';
import NatureIcon from '@/components/icons/NatureIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { useGetCurrentUserTeamAccountQuery, useGetTransferHistoryQuery } from '../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TeamResourceType } from '@/types/teamTransfer';

/**
 * Transfer Hub Page - Minimalist Business Design
 * Main hub for all resource transfer operations
 */
function TransferHubPage() {
  const { t } = useTranslation();
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
              <ReportProblemOutlined className="text-red-500 dark:text-red-400" sx={{ fontSize: 24 }} />
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
              {t('teamManagement.RESOURCE_TRANSFERS')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('teamManagement.SEND_RESOURCES_SUBTITLE')}
            </Typography>
          </div>

          {/* Current Balance Card */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement.CURRENT_BALANCE')}
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement.GOLD')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white flex items-center gap-2">
                  <MonetizationOn className="text-yellow-600" sx={{ fontSize: 28 }} />
                  {TeamTransferService.formatTransferAmount(teamAccount.gold)}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement.CARBON')}
                </Typography>
                <Typography variant="h4" className="font-light text-gray-900 dark:text-white flex items-center gap-2">
                  <NatureIcon className="text-green-600" sx={{ fontSize: 28 }} />
                  {TeamTransferService.formatTransferAmount(teamAccount.carbon)}
                </Typography>
              </div>
            </div>
          </Paper>

          {/* Transfer Options */}
          <div>
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white mb-6">
              {t('teamManagement.SELECT_TRANSFER_TYPE')}
            </Typography>
            <Grid container spacing={6}>
              {/* Gold Transfer Card */}
              <Grid item xs={12} md={6}>
                <Card className="h-full border border-gray-100 dark:border-gray-800 shadow-none">
                  <CardContent className="flex-1 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center">
                        <MonetizationOn className="text-yellow-600" sx={{ fontSize: 20 }} />
                      </div>
                      <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                        {t('teamManagement.GOLD_TRANSFERS')}
                      </Typography>
                    </div>
                    <Typography color="text.secondary" className="mb-6 leading-relaxed">
                      {t('teamManagement.TRANSFER_GOLD_SUBTITLE')}
                    </Typography>
                    <Typography variant="body2" className="mb-2">
                      <span className="font-medium">{t('teamManagement.AVAILABLE_BALANCE')}:</span> <MonetizationOn sx={{ fontSize: 16, mx: 0.5 }} className="text-yellow-600" /> {TeamTransferService.formatTransferAmount(teamAccount.gold)}
                    </Typography>
                  </CardContent>
                  <CardActions className="p-8 pt-0">
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={teamAccount.gold <= 0}
                      onClick={() => router.push('/team-management/transfers/gold')}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                      startIcon={<SendOutlined />}
                    >
                      {t('teamManagement.TRANSFER_GOLD')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              {/* Carbon Transfer Card */}
              <Grid item xs={12} md={6}>
                <Card className="h-full border border-gray-100 dark:border-gray-800 shadow-none">
                  <CardContent className="flex-1 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center">
                        <NatureIcon className="text-green-600" sx={{ fontSize: 20 }} />
                      </div>
                      <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
                        {t('teamManagement.CARBON_TRANSFERS')}
                      </Typography>
                    </div>
                    <Typography color="text.secondary" className="mb-6 leading-relaxed">
                      {t('teamManagement.TRANSFER_CARBON_SUBTITLE')}
                    </Typography>
                    <Typography variant="body2" className="mb-2">
                      <span className="font-medium">{t('teamManagement.AVAILABLE_BALANCE')}:</span> <NatureIcon sx={{ fontSize: 16, mx: 0.5 }} className="text-green-600" /> {TeamTransferService.formatTransferAmount(teamAccount.carbon)}
                    </Typography>
                  </CardContent>
                  <CardActions className="p-8 pt-0">
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={teamAccount.carbon <= 0}
                      onClick={() => router.push('/team-management/transfers/carbon')}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                      startIcon={<SendOutlined />}
                    >
                      {t('teamManagement.TRANSFER_CARBON')}
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
                  {t('teamManagement.RECENT_TRANSFERS')}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push('/team-management/history/transfers')}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  endIcon={<ArrowForwardOutlined />}
                >
                  {t('teamManagement.VIEW_HISTORY')}
                </Button>
              </div>
              <div className="space-y-2">
                {recentTransfers.data.slice(0, 3).map((transfer, index) => (
                  <div key={transfer.id} className={`flex items-center justify-between py-4 ${index !== 2 && index !== recentTransfers.data.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${transfer.operationType === 'TRANSFER_OUT' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                        {transfer.operationType === 'TRANSFER_OUT' ? (
                          <TrendingUpOutlined 
                            sx={{ fontSize: 16 }}
                            className="text-red-500"
                          />
                        ) : (
                          <TrendingDownOutlined 
                            sx={{ fontSize: 16 }}
                            className="text-green-500"
                          />
                        )}
                      </div>
                      <div>
                        <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                          {transfer.operationType === 'TRANSFER_OUT' 
                            ? `${t('teamManagement.TO')} ${transfer.targetTeam?.name || t('common.UNKNOWN_TEAM')}`
                            : `${t('teamManagement.FROM')} ${transfer.sourceTeam?.name || t('common.UNKNOWN_TEAM')}`
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="flex items-center gap-1">
                          {transfer.resourceType === TeamResourceType.GOLD ? (
                            <MonetizationOn sx={{ fontSize: 14 }} className="text-yellow-600" />
                          ) : (
                            <NatureIcon sx={{ fontSize: 14 }} className="text-green-600" />
                          )}
                          {TeamTransferService.formatTransferAmount(transfer.amount)} • {new Date(transfer.createdAt).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography 
                        variant="body2" 
                        className={`font-medium flex items-center gap-1 ${transfer.operationType === 'TRANSFER_OUT' ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {transfer.operationType === 'TRANSFER_OUT' ? '-' : '+'}
                        {transfer.resourceType === TeamResourceType.GOLD ? (
                          <MonetizationOn sx={{ fontSize: 16 }} className="text-yellow-600" />
                        ) : (
                          <NatureIcon sx={{ fontSize: 16 }} className="text-green-600" />
                        )}
                        {TeamTransferService.formatTransferAmount(transfer.amount)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </Paper>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default TransferHubPage;