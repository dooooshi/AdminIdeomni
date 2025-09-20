'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Stack
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import MtoType2RequirementList from '@/components/mto/type2/manager/MtoType2RequirementList';
import { ToastProvider } from '@/components/common/ToastProvider';

export default function MtoType2ManagementPage() {
  const { t } = useTranslation();

  return (
    <ToastProvider>
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
          <Typography color="text.primary">{t('mto.type2.title')}</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.type2.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type2.description')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<StoreIcon />}
            label={t('mto.type2.mallBased')}
            color="secondary"
            variant="outlined"
          />
          <Chip
            icon={<TrendingUpIcon />}
            label={t('mto.type2.competitiveBidding')}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <MtoType2RequirementList isManager={true} />
    </Container>
    </ToastProvider>
  );
}