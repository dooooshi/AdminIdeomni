'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Groups as TeamsIcon,
  Person as PersonIcon,
  AttachMoney as GoldIcon,
  Park as CarbonIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchTeams,
  setTeamListFilters,
  clearTeamListFilters,
  selectTeams,
  selectTeamsLoading,
  selectTeamsError,
  selectTeamsPagination,
  selectTeamListFilters,
  selectDashboardSummary,
} from '@/store/managerTeamStatusSlice';
import TeamStatisticsCard from '@/components/manager/team-status/TeamStatisticsCard';
import TeamStatusFilters from '@/components/manager/team-status/TeamStatusFilters';
import TeamListTable from '@/components/manager/team-status/TeamListTable';

/**
 * Manager Team Status Dashboard Page
 * Main dashboard for managers to monitor all teams in their activity
 */
export default function TeamStatusDashboardPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const teams = useSelector(selectTeams);
  const loading = useSelector(selectTeamsLoading);
  const error = useSelector(selectTeamsError);
  const pagination = useSelector(selectTeamsPagination);
  const filters = useSelector(selectTeamListFilters);
  const summary = useSelector(selectDashboardSummary);

  // Load initial data
  useEffect(() => {
    handleRefresh();
  }, []);

  // Fetch teams with filters
  useEffect(() => {
    if (pagination) {
      dispatch(
        fetchTeams({
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search || undefined,
          isOpen: filters.isOpen,
          sort: filters.sort,
          order: filters.order,
        })
      );
    }
  }, [filters]);

  const handleRefresh = () => {
    dispatch(
      fetchTeams({
        page: 1,
        limit: 20,
        search: filters.search || undefined,
        isOpen: filters.isOpen,
        sort: filters.sort,
        order: filters.order,
      })
    );
  };

  const handleFiltersChange = (newFilters: any) => {
    dispatch(setTeamListFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearTeamListFilters());
  };

  const handlePageChange = (page: number) => {
    dispatch(
      fetchTeams({
        page,
        limit: pagination?.limit || 20,
        search: filters.search || undefined,
        isOpen: filters.isOpen,
        sort: filters.sort,
        order: filters.order,
      })
    );
  };

  const handleRowsPerPageChange = (limit: number) => {
    dispatch(
      fetchTeams({
        page: 1,
        limit,
        search: filters.search || undefined,
        isOpen: filters.isOpen,
        sort: filters.sort,
        order: filters.order,
      })
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {t('manager.teamStatus.title.dashboard')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('manager.teamStatus.title.teamList')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {t('manager.teamStatus.action.refresh')}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Dashboard Summary Statistics */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TeamStatisticsCard
                title={t('manager.teamStatus.summary.totalTeams')}
                value={summary.totalTeams}
                icon={<TeamsIcon />}
                loading={loading}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TeamStatisticsCard
                title={t('manager.teamStatus.summary.totalMembers')}
                value={summary.totalMembers}
                icon={<PersonIcon />}
                loading={loading}
                color="info"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TeamStatisticsCard
                title={t('manager.teamStatus.summary.totalGold')}
                value={summary.totalGold}
                icon={<GoldIcon />}
                loading={loading}
                color="warning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TeamStatisticsCard
                title={t('manager.teamStatus.summary.totalCarbon')}
                value={summary.totalCarbon}
                icon={<CarbonIcon />}
                loading={loading}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <TeamStatisticsCard
                title={t('manager.teamStatus.summary.openTeams')}
                value={summary.openTeams}
                subtitle={`${summary.closedTeams} ${t(
                  'manager.teamStatus.summary.closedTeams'
                )}`}
                loading={loading}
                color="success"
              />
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <TeamStatusFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
        />

        {/* Teams Table */}
        <TeamListTable
          teams={teams}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </Container>
  );
}