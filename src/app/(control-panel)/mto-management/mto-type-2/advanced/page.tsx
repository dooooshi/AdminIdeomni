'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Stack,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  LocalShipping as ShippingIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useSearchParams } from 'next/navigation';

// Import all new components
import MtoType2SettlementPriority from '@/components/mto/type2/manager/MtoType2SettlementPriority';
import MtoType2SettlementReport from '@/components/mto/type2/manager/MtoType2SettlementReport';
import MtoType2BulkSettlement from '@/components/mto/type2/manager/MtoType2BulkSettlement';
import MtoType2PriceTrends from '@/components/mto/type2/analytics/MtoType2PriceTrends';
import MtoType2UnsettledReturns from '@/components/mto/type2/mall-owner/MtoType2UnsettledReturns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export default function MtoType2AdvancedPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const activityId = searchParams.get('activityId') || 'default';
  const requirementId = searchParams.get('requirementId');
  const teamId = searchParams.get('teamId') || '';
  const isManager = searchParams.get('role') === 'manager';

  const [tabValue, setTabValue] = useState(0);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            {t('common.home')}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/mto-management"
          >
            {t('navigation.mtoManagement')}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/mto-management/mto-type-2"
          >
            {t('mto.type2.title')}
          </Link>
          <Typography color="text.primary">
            {t('mto.type2.advanced.title')}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.type2.advanced.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type2.advanced.description')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            label={isManager ? t('common.manager') : t('common.mallOwner')}
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {isManager && (
              <>
                <Tab
                  label={t('mto.type2.advanced.settlementPriority')}
                  icon={<GavelIcon />}
                  iconPosition="start"
                />
                <Tab
                  label={t('mto.type2.advanced.settlementReport')}
                  icon={<AssessmentIcon />}
                  iconPosition="start"
                />
                <Tab
                  label={t('mto.type2.advanced.bulkSettlement')}
                  icon={<SecurityIcon />}
                  iconPosition="start"
                />
              </>
            )}
            <Tab
              label={t('mto.type2.advanced.priceTrends')}
              icon={<TimelineIcon />}
              iconPosition="start"
            />
            {!isManager && (
              <Tab
                label={t('mto.type2.advanced.unsettledReturns')}
                icon={<ShippingIcon />}
                iconPosition="start"
              />
            )}
          </Tabs>
        </Box>

        {isManager && (
          <>
            <TabPanel value={tabValue} index={0}>
              {requirementId ? (
                <MtoType2SettlementPriority
                  requirementId={parseInt(requirementId)}
                  isManager={isManager}
                />
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography color="text.secondary">
                    {t('mto.type2.advanced.selectRequirement')}
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {requirementId ? (
                <MtoType2SettlementReport
                  requirementId={parseInt(requirementId)}
                  isManager={isManager}
                />
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography color="text.secondary">
                    {t('mto.type2.advanced.selectRequirement')}
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <MtoType2BulkSettlement activityId={activityId} />
            </TabPanel>
          </>
        )}

        <TabPanel value={tabValue} index={isManager ? 3 : 0}>
          <MtoType2PriceTrends activityId={activityId} />
        </TabPanel>

        {!isManager && (
          <TabPanel value={tabValue} index={1}>
            <MtoType2UnsettledReturns
              teamId={teamId}
              activityId={activityId}
            />
          </TabPanel>
        )}
      </Paper>
    </Container>
  );
}