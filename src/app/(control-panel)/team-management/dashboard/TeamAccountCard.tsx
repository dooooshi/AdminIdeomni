'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useGetCurrentUserTeamAccountQuery } from '../TeamAccountApi';
import TeamAccountService from '@/lib/services/teamAccountService';
import ResourceDisplay from '@/components/team-accounts/ResourceDisplay';
import NatureIcon from '@/components/icons/NatureIcon';
import { MonetizationOn } from '@mui/icons-material';

interface TeamAccountCardProps {
  className?: string;
  compact?: boolean;
  showTeamInfo?: boolean;
}

/**
 * Team Account Card Component
 * Displays current user's team account balance (gold and carbon)
 */
function TeamAccountCard({ 
  className, 
  compact = false, 
  showTeamInfo = true 
}: TeamAccountCardProps) {
  const { t, i18n } = useTranslation();
  const { data: teamAccount, isLoading, error, refetch } = useGetCurrentUserTeamAccountQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const container = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className={compact ? "p-4" : "p-6"}>
          <Box className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
          
          <Box className="grid grid-cols-2 gap-4">
            <Box>
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={80} height={32} />
            </Box>
            <Box>
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={80} height={32} />
            </Box>
          </Box>

          {showTeamInfo && !compact && (
            <Box className="mt-4 pt-4 border-t border-gray-200">
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={150} height={24} />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border border-gray-100 dark:border-gray-800 shadow-none`}>
        <CardContent className={compact ? "p-6" : "p-8"}>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <IdeomniSvgIcon size={20} className="text-red-500 dark:text-red-400">
                heroicons-outline:exclamation-triangle
              </IdeomniSvgIcon>
            </div>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
              {error ? t('teamAccounts.failedToLoadAccount') : t('teamAccounts.noAccountFound')}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {t('common.TRY_AGAIN')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teamAccount) {
    return (
      <Card className={`${className} border border-gray-100 dark:border-slate-700 shadow-none bg-white dark:bg-slate-800`}>
        <CardContent className={compact ? "p-6" : "p-8"}>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <IdeomniSvgIcon size={20} className="text-blue-500 dark:text-blue-400">
                heroicons-outline:information-circle
              </IdeomniSvgIcon>
            </div>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              {t('teamAccounts.noTeamAccount')}
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      <Card className="h-full border border-gray-100 dark:border-gray-800 shadow-none">
        <CardContent className={compact ? "p-6" : "p-8"}>
          {/* Header */}
          <Box className="flex items-center justify-between mb-8">
            <Typography variant="h6" className="font-medium text-gray-900 dark:text-white">
              {t('teamManagement.TEAM_RESOURCES')}
            </Typography>
            <Tooltip title={t('common.refresh')}>
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <IdeomniSvgIcon className={isRefreshing ? 'animate-spin' : ''}>
                  heroicons-outline:refresh
                </IdeomniSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Resources Display */}
          <Box className="mb-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement.GOLD_BALANCE')}
                </Typography>
                <Box className="flex items-center gap-2">
                  <MonetizationOn className="text-yellow-600" sx={{ fontSize: 32 }} />
                  <Typography variant="h4" className="font-light text-gray-900 dark:text-white">
                    {teamAccount.gold.toLocaleString()}
                  </Typography>
                </Box>
              </div>
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-slate-400 uppercase tracking-wider text-xs font-medium mb-2 block">
                  {t('teamManagement.CARBON_CREDITS')}
                </Typography>
                <Box className="flex items-center gap-2">
                  <NatureIcon className="text-green-600" sx={{ fontSize: 32 }} />
                  <Typography variant="h4" className="font-light text-gray-900 dark:text-white">
                    {teamAccount.carbon.toLocaleString()}
                  </Typography>
                </Box>
              </div>
            </div>
          </Box>


          {/* Team Information */}
          {showTeamInfo && !compact && teamAccount.team && (
            <Box className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="space-y-4">
                <div>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                    {t('teamManagement.TEAM_NAME')}
                  </Typography>
                  <Typography variant="body2" className="font-medium text-gray-900 dark:text-white mt-1">
                    {teamAccount.team.name}
                  </Typography>
                </div>
                
                {teamAccount.team.leader && (
                  <div>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                      {t('teamManagement.TEAM_LEADER')}
                    </Typography>
                    <Typography variant="body2" className="font-medium text-gray-900 dark:text-white mt-1">
                      {teamAccount.team.leader.firstName && teamAccount.team.leader.lastName
                        ? `${teamAccount.team.leader.firstName} ${teamAccount.team.leader.lastName}`
                        : teamAccount.team.leader.username
                      }
                    </Typography>
                  </div>
                )}
              </div>
            </Box>
          )}

          {/* Last Updated */}
          {!compact && (
            <Box className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                {t('teamManagement.LAST_UPDATED')} {TeamAccountService.formatDateTime(teamAccount.updatedAt, i18n.language)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TeamAccountCard;