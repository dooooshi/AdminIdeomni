'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  ArrowBack,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Business as BusinessIcon,
  Landscape as LandscapeIcon,
  People as PeopleIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchTeamStatus,
  fetchTeamOperations,
  fetchTeamFacilities,
  fetchTeamLand,
  fetchTeamMembers,
  fetchTeamBalanceHistory,
  selectSelectedTeam,
  selectTeamDetailLoading,
  selectTeamDetailError,
  selectOperations,
  selectOperationsLoading,
  selectFacilities,
  selectFacilitiesLoading,
  selectLandOwnership,
  selectLandOwnershipLoading,
  selectMembers,
  selectMembersLoading,
  selectBalanceHistory,
  selectBalanceHistoryLoading,
} from '@/store/managerTeamStatusSlice';
import TeamDetailView from '@/components/manager/team-status/TeamDetailView';
import OperationHistoryTable from '@/components/manager/team-status/OperationHistoryTable';
import FacilitiesTable from '@/components/manager/team-status/FacilitiesTable';
import LandOwnershipTable from '@/components/manager/team-status/LandOwnershipTable';
import TeamMembersTable from '@/components/manager/team-status/TeamMembersTable';
import BalanceHistoryChart from '@/components/manager/team-status/BalanceHistoryChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-detail-tabpanel-${index}`}
      aria-labelledby={`team-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Team Detail Page
 * Displays comprehensive information about a specific team with tabs
 */
export default function TeamDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const teamId = params.teamId as string;

  const [tabValue, setTabValue] = useState(0);

  // Selectors
  const team = useSelector(selectSelectedTeam);
  const loading = useSelector(selectTeamDetailLoading);
  const error = useSelector(selectTeamDetailError);

  const operations = useSelector(selectOperations);
  const operationsLoading = useSelector(selectOperationsLoading);

  const facilities = useSelector(selectFacilities);
  const facilitiesLoading = useSelector(selectFacilitiesLoading);

  const landOwnership = useSelector(selectLandOwnership);
  const landOwnershipLoading = useSelector(selectLandOwnershipLoading);

  const members = useSelector(selectMembers);
  const membersLoading = useSelector(selectMembersLoading);

  const balanceHistory = useSelector(selectBalanceHistory);
  const balanceHistoryLoading = useSelector(selectBalanceHistoryLoading);

  // Load initial data
  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeamStatus(teamId));
    }
  }, [teamId, dispatch]);

  // Load tab-specific data
  useEffect(() => {
    if (!teamId) return;

    switch (tabValue) {
      case 1: // Operations
        dispatch(fetchTeamOperations({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 2: // Facilities
        dispatch(fetchTeamFacilities({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 3: // Land
        dispatch(fetchTeamLand({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 4: // Members
        dispatch(fetchTeamMembers({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 5: // Balance History
        dispatch(fetchTeamBalanceHistory({ teamId, params: { page: 1, limit: 50 } }));
        break;
    }
  }, [tabValue, teamId, dispatch]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    router.push('/manager/team-status');
  };

  const handleRefresh = () => {
    dispatch(fetchTeamStatus(teamId));
    // Refresh current tab data
    switch (tabValue) {
      case 1:
        dispatch(fetchTeamOperations({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 2:
        dispatch(fetchTeamFacilities({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 3:
        dispatch(fetchTeamLand({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 4:
        dispatch(fetchTeamMembers({ teamId, params: { page: 1, limit: 20 } }));
        break;
      case 5:
        dispatch(fetchTeamBalanceHistory({ teamId, params: { page: 1, limit: 50 } }));
        break;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink
            component="button"
            variant="body2"
            onClick={handleBack}
            sx={{ cursor: 'pointer' }}
          >
            {t('manager.teamStatus.title.dashboard')}
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {team?.name || teamId}
          </Typography>
        </Breadcrumbs>

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
              {team?.name || t('manager.teamStatus.title.teamDetails')}
            </Typography>
            {team?.description && (
              <Typography variant="body2" color="text.secondary">
                {team.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
            >
              {t('manager.teamStatus.action.back')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              {t('manager.teamStatus.action.refresh')}
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
            <Tab icon={<DashboardIcon />} label={t('manager.teamStatus.detail.section.overview')} />
            <Tab icon={<HistoryIcon />} label={t('manager.teamStatus.title.operations')} />
            <Tab icon={<BusinessIcon />} label={t('manager.teamStatus.title.facilities')} />
            <Tab icon={<LandscapeIcon />} label={t('manager.teamStatus.title.landOwnership')} />
            <Tab icon={<PeopleIcon />} label={t('manager.teamStatus.title.members')} />
            <Tab icon={<ChartIcon />} label={t('manager.teamStatus.title.balanceHistory')} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {team && <TeamDetailView team={team} loading={loading} />}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <OperationHistoryTable
            operations={operations}
            loading={operationsLoading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <FacilitiesTable
            facilities={facilities}
            loading={facilitiesLoading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <LandOwnershipTable
            landOwnership={landOwnership}
            loading={landOwnershipLoading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <TeamMembersTable
            members={members}
            loading={membersLoading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <BalanceHistoryChart
            balanceHistory={balanceHistory}
            loading={balanceHistoryLoading}
          />
        </TabPanel>
      </Box>
    </Container>
  );
}