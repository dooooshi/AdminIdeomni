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
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useGetCurrentUserTeamAccountQuery } from '../TeamAccountApi';
import TeamAccountService from '@/lib/services/teamAccountService';
import ResourceDisplay from '@/components/team-accounts/ResourceDisplay';

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
      <Card className={className}>
        <CardContent className={compact ? "p-4" : "p-6"}>
          <Alert 
            severity="warning" 
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <IdeomniSvgIcon className={isRefreshing ? 'animate-spin' : ''}>
                  heroicons-outline:refresh
                </IdeomniSvgIcon>
              </IconButton>
            }
          >
            {error ? t('teamAccounts:failedToLoadAccount') : t('teamAccounts:noAccountFound')}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!teamAccount) {
    return (
      <Card className={className}>
        <CardContent className={compact ? "p-4" : "p-6"}>
          <Alert severity="info">
            {t('teamAccounts:noTeamAccount')}
          </Alert>
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
      <Card className="h-full">
        <CardContent className={compact ? "p-4" : "p-6"}>
          {/* Header */}
          <Box className="flex items-center justify-between mb-4">
            <Typography variant={compact ? "h6" : "h5"} className="font-semibold">
              {t('teamAccounts:teamResources')}
            </Typography>
            <Tooltip title={t('common:refresh')}>
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-500 hover:text-gray-700"
              >
                <IdeomniSvgIcon className={isRefreshing ? 'animate-spin' : ''}>
                  heroicons-outline:refresh
                </IdeomniSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Resources Display */}
          <Box className="mb-4">
            <ResourceDisplay
              gold={teamAccount.gold}
              carbon={teamAccount.carbon}
              layout="horizontal"
              variant="card"
              size={compact ? "small" : "medium"}
            />
          </Box>

          {/* Resource Status Indicators */}
          {!compact && (
            <Box className="flex gap-2 mb-4">
              {teamAccount.gold === 0 && (
                <Chip
                  size="small"
                  label={t('teamAccounts:noGold')}
                  color="warning"
                  variant="outlined"
                />
              )}
              {teamAccount.carbon === 0 && (
                <Chip
                  size="small"
                  label={t('teamAccounts:noCarbon')}
                  color="warning"
                  variant="outlined"
                />
              )}
              {teamAccount.gold > 0 && teamAccount.carbon > 0 && (
                <Chip
                  size="small"
                  label={t('teamAccounts:resourcesAvailable')}
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          )}

          {/* Team Information */}
          {showTeamInfo && !compact && teamAccount.team && (
            <Box className="pt-4 border-t border-gray-200">
              <Typography variant="caption" color="textSecondary" className="block mb-1">
                {t('teamAccounts:teamName')}
              </Typography>
              <Typography variant="body2" className="font-medium mb-2">
                {teamAccount.team.name}
              </Typography>
              
              {teamAccount.team.leader && (
                <>
                  <Typography variant="caption" color="textSecondary" className="block mb-1">
                    {t('teamAccounts:teamLeader')}
                  </Typography>
                  <Typography variant="body2">
                    {teamAccount.team.leader.firstName && teamAccount.team.leader.lastName
                      ? `${teamAccount.team.leader.firstName} ${teamAccount.team.leader.lastName}`
                      : teamAccount.team.leader.username
                    }
                  </Typography>
                </>
              )}
            </Box>
          )}

          {/* Last Updated */}
          {!compact && (
            <Box className="mt-4 pt-4 border-t border-gray-200">
              <Typography variant="caption" color="textSecondary">
                {t('teamAccounts:lastUpdated')}: {TeamAccountService.formatDateTime(teamAccount.updatedAt, i18n.language)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TeamAccountCard;