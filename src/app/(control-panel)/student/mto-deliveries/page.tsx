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
  LocalShipping as DeliveryIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import MtoType1DeliveryList from '@/components/mto/type1/student/MtoType1DeliveryList';

export default function StudentMtoDeliveriesPage() {
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
            href="/student"
          >
            {t('navigation.student')}
          </Link>
          <Typography color="text.primary">{t('mto.student.myDeliveries')}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.student.myDeliveriesTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.myDeliveriesDescription')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<DeliveryIcon />}
            label={t('mto.student.trackDeliveries')}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<AssessmentIcon />}
            label={t('mto.student.performanceMetrics')}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Delivery List Component */}
      <MtoType1DeliveryList />
    </Container>
  );
}