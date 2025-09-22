'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Store as MallIcon,
  TrendingUp as BiddingIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import MtoType2StudentView from '@/components/mto/type2/student/MtoType2StudentView';

export default function StudentMtoType2MarketPage() {
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
          <Typography color="text.primary">{t('MTO_TYPE2_STUDENT_MARKET')}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.type2.student.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type2.student.description')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<ViewIcon />}
            label={t('mto.type2.student.viewOnly')}
            color="default"
            variant="outlined"
          />
          <Chip
            icon={<MallIcon />}
            label={t('mto.type2.student.mallExclusive')}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<BiddingIcon />}
            label={t('mto.type2.student.competitiveBidding')}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<MoneyIcon />}
            label={t('mto.type2.student.dynamicPricing')}
            color="secondary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Information Box */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <MallIcon color="primary" />
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="medium">
              {t('mto.type2.student.understandingTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mto.type2.student.understandingDesc')}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Main Content */}
      <MtoType2StudentView />
    </Container>
  );
}