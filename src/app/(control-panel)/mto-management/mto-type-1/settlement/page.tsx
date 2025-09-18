'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Stack,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  AccountBalance as BalanceIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import MtoType1SettlementManager from '@/components/mto/type1/manager/MtoType1SettlementManager';

export default function MtoType1SettlementPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
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
            href="/mto-management/mto-type-1"
          >
            {t('mto.type1.title')}
          </Link>
          <Typography color="text.primary">
            {t('mto.type1.settlement.title')}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.type1.settlement.pageTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type1.settlement.pageDescription')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<BalanceIcon />}
            label={t('mto.type1.settlement.autoSettle')}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<TimelineIcon />}
            label={t('mto.type1.settlement.tracking')}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Settlement Manager Component */}
      <MtoType1SettlementManager />
    </Container>
  );
}