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
  Store as StoreIcon
} from '@mui/icons-material';
import MtoType2SettlementManager from '@/components/mto/type2/manager/MtoType2SettlementManager';

export default function MtoType2SettlementPage() {
  const { t } = useTranslation();

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
          <Typography color="text.primary">{t('mto.type2.settlement.title')}</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <BalanceIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            {t('mto.type2.settlement.title')}
          </Typography>
          <Chip
            icon={<StoreIcon />}
            label={t('mto.type2.mallBased')}
            color="secondary"
            variant="outlined"
          />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {t('mto.type2.settlement.description')}
        </Typography>
      </Box>

      <MtoType2SettlementManager activityId="default-activity" />
    </Container>
  );
}