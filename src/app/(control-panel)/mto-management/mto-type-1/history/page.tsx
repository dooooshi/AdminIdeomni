'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import MtoType1HistoryDashboard from '@/components/mto/type1/manager/MtoType1HistoryDashboard';
import { useAuth } from '@/lib/auth';

export default function MtoType1HistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

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
            href="/mto-management/mto-type-1"
          >
            {t('mto.type1.title')}
          </Link>
          <Typography color="text.primary">
            {t('mto.type1.history.title')}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1, fontSize: 32 }} />
          {t('mto.type1.history.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('mto.type1.history.description')}
        </Typography>
      </Box>

      <MtoType1HistoryDashboard />
    </Container>
  );
}