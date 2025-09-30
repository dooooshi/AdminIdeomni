'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { format } from 'date-fns';
import type { TeamStatus } from '@/types/managerTeamStatus';
import TeamStatisticsCard from './TeamStatisticsCard';

interface TeamDetailViewProps {
  team: TeamStatus;
  loading?: boolean;
}

/**
 * Team detail overview component
 * Displays comprehensive team information
 */
export default function TeamDetailView({ team, loading = false }: TeamDetailViewProps) {
  const { t } = useTranslation();

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="100%" height={80} sx={{ mt: 2 }} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Team Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('manager.teamStatus.detail.section.overview')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('manager.teamStatus.detail.field.teamId')}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {team.id}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('manager.teamStatus.detail.field.leader')}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {team.leader.username}
                  {(team.leader.firstName || team.leader.lastName) && (
                    <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                      ({team.leader.firstName} {team.leader.lastName})
                    </Typography>
                  )}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('manager.teamStatus.detail.field.description')}
                </Typography>
                <Typography variant="body1">
                  {team.description || '-'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('manager.teamStatus.table.header.status')}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={t(
                      team.isOpen
                        ? 'manager.teamStatus.table.cell.openStatus'
                        : 'manager.teamStatus.table.cell.closedStatus'
                    )}
                    color={team.isOpen ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('manager.teamStatus.detail.field.createdAt')}
                </Typography>
                <Typography variant="body1">
                  {formatDate(team.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Financial Status */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('manager.teamStatus.detail.section.financial')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('manager.teamStatus.detail.field.goldBalance')}
                  </Typography>
                  <Typography variant="h4" color="warning.main" fontWeight={700}>
                    {formatBalance(team.account.goldBalance)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('manager.teamStatus.detail.field.carbonBalance')}
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    {formatBalance(team.account.carbonBalance)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={12}>
                <Typography variant="caption" color="text.secondary">
                  {t('manager.teamStatus.detail.field.updatedAt')}
                </Typography>
                <Typography variant="body2">
                  {formatDate(team.account.lastUpdated)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Statistics Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Team Statistics */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('manager.teamStatus.detail.section.statistics')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List dense>
              <ListItem>
                <ListItemText
                  primary={t('manager.teamStatus.detail.field.totalMembers')}
                  secondary={team.statistics.totalMembers}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('manager.teamStatus.detail.field.activeMembers')}
                  secondary={team.statistics.activeMembers}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('manager.teamStatus.detail.field.totalLandOwned')}
                  secondary={`${team.statistics.totalLandOwned} units`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('manager.teamStatus.detail.field.totalFacilities')}
                  secondary={team.statistics.totalFacilities}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('manager.teamStatus.detail.field.activeFacilities')}
                  secondary={team.statistics.activeFacilities}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('manager.teamStatus.detail.section.recentActivity')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {team.recentOperations && team.recentOperations.length > 0 ? (
              <List dense>
                {team.recentOperations.map((op, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={op.type}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color={
                              op.resourceType === 'GOLD'
                                ? 'warning.main'
                                : 'success.main'
                            }
                            fontWeight={600}
                          >
                            {formatBalance(op.amount)} {op.resourceType}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            {formatDate(op.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('manager.teamStatus.message.noData')}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}