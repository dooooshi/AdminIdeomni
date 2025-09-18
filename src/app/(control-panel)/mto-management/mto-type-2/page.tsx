'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

export default function MtoType2ManagementPage() {
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

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <StoreIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          {t('mto.type2.comingSoon.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('mto.type2.comingSoon.description')}
        </Typography>
        <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
          {t('mto.type2.comingSoon.features')}
        </Alert>
      </Paper>
    </Container>
  );
}