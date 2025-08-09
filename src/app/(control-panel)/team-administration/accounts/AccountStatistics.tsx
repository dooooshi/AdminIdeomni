'use client';

import { motion } from 'motion/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useGetAccountSummaryQuery } from '../ManagerTeamAccountApi';
import TeamAccountService from '@/lib/services/teamAccountService';

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

function StatisticCard({ title, value, icon, color, subtitle, trend }: StatisticCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Box className="flex items-start justify-between mb-4">
          <Box className="flex-1">
            <Typography variant="body2" color="textSecondary" className="mb-1">
              {title}
            </Typography>
            <Typography variant="h4" className={`font-bold ${color}`}>
              {typeof value === 'number' ? TeamAccountService.formatResourceAmount(value) : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            <IdeomniSvgIcon className={`text-2xl ${color}`}>
              {icon}
            </IdeomniSvgIcon>
          </Box>
        </Box>
        
        {trend && (
          <Box className="flex items-center gap-2">
            <Chip
              size="small"
              label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
              color={trend.isPositive ? 'success' : 'error'}
              variant="outlined"
            />
            <Typography variant="caption" color="textSecondary">
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

interface AccountStatisticsProps {
  className?: string;
}

/**
 * Account Statistics Dashboard Component
 * Shows summary statistics for all team accounts in the manager's activity
 */
function AccountStatistics({ className }: AccountStatisticsProps) {
  const { t } = useTranslation();
  const { data: summary, isLoading, error, refetch } = useGetAccountSummaryQuery();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={className}
      >
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common:retry')}
            </Button>
          }
        >
          {t('teamAccounts:failedToLoadStatistics')}
        </Alert>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card>
                <CardContent className="p-6">
                  <Box className="flex items-start justify-between mb-4">
                    <Box className="flex-1">
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={80} height={40} />
                      <Skeleton variant="text" width={120} height={16} />
                    </Box>
                    <Skeleton variant="circular" width={56} height={56} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  }

  if (!summary) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={className}
      >
        <Alert severity="info">
          {t('teamAccounts:noStatisticsAvailable')}
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      <Grid container spacing={3}>
        {/* Total Teams */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <motion.div variants={item}>
            <StatisticCard
              title={t('teamAccounts:totalTeams')}
              value={summary.totalTeamsWithAccounts}
              icon="heroicons-outline:user-group"
              color="text-blue-600"
              subtitle={t('teamAccounts:teamsWithAccounts')}
            />
          </motion.div>
        </Grid>

        {/* Total Gold */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <motion.div variants={item}>
            <StatisticCard
              title={t('teamAccounts:totalGold')}
              value={summary.totalGold}
              icon="heroicons-solid:currency-dollar"
              color="text-yellow-600"
              subtitle={t('teamAccounts:acrossAllTeams')}
            />
          </motion.div>
        </Grid>

        {/* Total Carbon */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <motion.div variants={item}>
            <StatisticCard
              title={t('teamAccounts:totalCarbon')}
              value={summary.totalCarbon}
              icon="heroicons-solid:leaf"
              color="text-green-600"
              subtitle={t('teamAccounts:acrossAllTeams')}
            />
          </motion.div>
        </Grid>

        {/* Resource Ratio */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <motion.div variants={item}>
            <StatisticCard
              title={t('teamAccounts:goldToCarbonRatio')}
              value={summary.totalCarbon > 0 ? (summary.totalGold / summary.totalCarbon).toFixed(2) : '∞'}
              icon="heroicons-outline:scale"
              color="text-purple-600"
              subtitle={t('teamAccounts:resourceBalance')}
            />
          </motion.div>
        </Grid>

        {/* Average Gold */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6">
                <Box className="flex items-center gap-4 mb-4">
                  <Box className="p-3 rounded-full bg-yellow-100">
                    <IdeomniSvgIcon className="text-2xl text-yellow-600">
                      heroicons-outline:chart-bar
                    </IdeomniSvgIcon>
                  </Box>
                  <Box className="flex-1">
                    <Typography variant="h6" className="font-semibold mb-1">
                      {t('teamAccounts:averageGold')}
                    </Typography>
                    <Typography variant="h4" className="font-bold text-yellow-600">
                      {TeamAccountService.formatResourceAmount(summary.averageGold)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box className="space-y-2">
                  <Box className="flex justify-between items-center">
                    <Typography variant="body2" color="textSecondary">
                      {t('teamAccounts:highestPossible')}
                    </Typography>
                    <Typography variant="body2" className="font-mono">
                      {summary.totalGold > 0 ? TeamAccountService.formatResourceAmount(summary.totalGold) : '0'}
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center">
                    <Typography variant="body2" color="textSecondary">
                      {t('teamAccounts:distribution')}
                    </Typography>
                    <Chip
                      size="small"
                      label={summary.totalTeamsWithAccounts > 0 ? t('teamAccounts:distributed') : t('teamAccounts:noDistribution')}
                      color={summary.averageGold > 0 ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Average Carbon */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6">
                <Box className="flex items-center gap-4 mb-4">
                  <Box className="p-3 rounded-full bg-green-100">
                    <IdeomniSvgIcon className="text-2xl text-green-600">
                      heroicons-outline:chart-bar
                    </IdeomniSvgIcon>
                  </Box>
                  <Box className="flex-1">
                    <Typography variant="h6" className="font-semibold mb-1">
                      {t('teamAccounts:averageCarbon')}
                    </Typography>
                    <Typography variant="h4" className="font-bold text-green-600">
                      {TeamAccountService.formatResourceAmount(summary.averageCarbon)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box className="space-y-2">
                  <Box className="flex justify-between items-center">
                    <Typography variant="body2" color="textSecondary">
                      {t('teamAccounts:highestPossible')}
                    </Typography>
                    <Typography variant="body2" className="font-mono">
                      {summary.totalCarbon > 0 ? TeamAccountService.formatResourceAmount(summary.totalCarbon) : '0'}
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center">
                    <Typography variant="body2" color="textSecondary">
                      {t('teamAccounts:distribution')}
                    </Typography>
                    <Chip
                      size="small"
                      label={summary.totalTeamsWithAccounts > 0 ? t('teamAccounts:distributed') : t('teamAccounts:noDistribution')}
                      color={summary.averageCarbon > 0 ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Resource Summary */}
        <Grid size={{ xs: 12 }}>
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  {t('teamAccounts:resourceSummary')}
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box className="text-center">
                      <Typography variant="h3" className="font-bold text-blue-600 mb-2">
                        {summary.totalTeamsWithAccounts}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('teamAccounts:activeTeamAccounts')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box className="text-center">
                      <Typography variant="h3" className="font-bold text-yellow-600 mb-2">
                        {TeamAccountService.formatResourceAmount(summary.totalGold + summary.totalCarbon)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('teamAccounts:totalResources')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box className="text-center">
                      <Typography variant="h3" className="font-bold text-green-600 mb-2">
                        {summary.totalTeamsWithAccounts > 0 
                          ? TeamAccountService.formatResourceAmount(
                              (summary.totalGold + summary.totalCarbon) / summary.totalTeamsWithAccounts
                            )
                          : '0'
                        }
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('teamAccounts:avgResourcesPerTeam')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default AccountStatistics;