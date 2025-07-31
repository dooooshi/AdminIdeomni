'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  TrendingUpOutlined,
  AccountBalanceWalletOutlined,
  BuildOutlined,
  WarningAmberOutlined,
  EmojiEventsOutlined,
} from '@mui/icons-material';
import type { TeamFacilitySummary, FacilityType, FacilityInstanceStatus } from '@/types/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from 'react-i18next';

interface FacilityPortfolioSummaryProps {
  summary: TeamFacilitySummary | null | undefined;
  className?: string;
}

const FacilityPortfolioSummary: React.FC<FacilityPortfolioSummaryProps> = ({
  summary,
  className,
}) => {
  const { t } = useTranslation(['facilityManagement', 'common']);

  // Safety check for summary data
  if (!summary) {
    return null;
  }

  // Calculate derived metrics
  const totalInvestment = (summary.totalBuildCost || 0) + (summary.totalUpgradeCost || 0);
  const averageInvestmentPerFacility = (summary.totalFacilities || 0) > 0 
    ? totalInvestment / (summary.totalFacilities || 1)
    : 0;

  // Get top facility types
  const topFacilityTypes = Object.entries(summary.facilitiesByType || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type: type as FacilityType, count }));

  // Status breakdown
  const statusEntries = Object.entries(summary.facilitiesByStatus || {}) as [FacilityInstanceStatus, number][];
  const facilitiesNeedingAttention = ((summary.facilitiesByStatus?.MAINTENANCE) || 0) + 
                                   ((summary.facilitiesByStatus?.DAMAGED) || 0);

  return (
    <Box className={className}>
      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BuildOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {summary.totalFacilities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('facilityManagement:TOTAL_FACILITIES')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <AccountBalanceWalletOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {StudentFacilityService.formatCurrency(totalInvestment, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('facilityManagement:TOTAL_INVESTMENT')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUpOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {(summary.avgLevel || 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('facilityManagement:AVERAGE_LEVEL')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: facilitiesNeedingAttention > 0 ? 'warning.main' : 'success.main' }}>
                  {facilitiesNeedingAttention > 0 ? <WarningAmberOutlined /> : <EmojiEventsOutlined />}
                </Avatar>
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={facilitiesNeedingAttention > 0 ? 'warning.main' : 'success.main'}
                  >
                    {facilitiesNeedingAttention}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('facilityManagement:NEED_ATTENTION')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Facility Types Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('facilityManagement:FACILITY_TYPES_BREAKDOWN')}
              </Typography>
              
              {topFacilityTypes.length > 0 ? (
                <List dense>
                  {topFacilityTypes.map(({ type, count }, index) => {
                    const percentage = (summary.totalFacilities || 0) > 0 ? (count / (summary.totalFacilities || 1)) * 100 : 0;
                    const icon = StudentFacilityService.getFacilityIcon(type);
                    const name = StudentFacilityService.getFacilityTypeName(type);

                    return (
                      <ListItem key={type} divider={index < topFacilityTypes.length - 1}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '1rem' }}>
                            {icon}
                          </Avatar>
                        </ListItemIcon>
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="body2" fontWeight="medium">
                              {name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(percentage || 0).toFixed(1)}%
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" color="text.secondary">
                              {count} {count === 1 ? 'facility' : 'facilities'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage || 0}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  {t('facilityManagement:NO_FACILITIES_BUILT')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('facilityManagement:FACILITY_STATUS_BREAKDOWN')}
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {statusEntries.map(([status, count]) => {
                  if (count === 0) return null;
                  
                  const statusColor = StudentFacilityService.getStatusColor(status);
                  const statusText = StudentFacilityService.getStatusText(status);
                  
                  return (
                    <Chip
                      key={status}
                      label={`${statusText}: ${count}`}
                      color={statusColor as any}
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Investment Breakdown */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('facilityManagement:INVESTMENT_BREAKDOWN')}
                </Typography>
                
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={1}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('facilityManagement:BUILD_COSTS')}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {StudentFacilityService.formatCurrency(summary.totalBuildCost, 0)}
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('facilityManagement:UPGRADE_COSTS')}
                    </Typography>
                    <Typography variant="h6" color="secondary.main">
                      {StudentFacilityService.formatCurrency(summary.totalUpgradeCost, 0)}
                    </Typography>
                  </Paper>
                </Box>

                <Box mt={2} textAlign="center">
                  <Typography variant="caption" color="text.secondary">
                    {t('facilityManagement:AVERAGE_PER_FACILITY')}: {' '}
                    <strong>{StudentFacilityService.formatCurrency(averageInvestmentPerFacility, 0)}</strong>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justify-content="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6">
                    {summary.teamName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('facilityManagement:TEAM_ID')}: {summary.teamId}
                  </Typography>
                </Box>
                
                {summary.lastBuiltAt && (
                  <Box textAlign="right">
                    <Typography variant="body2" color="text.secondary">
                      {t('facilityManagement:LAST_BUILT')}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(summary.lastBuiltAt))}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FacilityPortfolioSummary;