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
  Alert,
  Stack,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Store as MallIcon,
  TrendingUp as BiddingIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { MtoType2MarketView } from '@/components/mto/type2/mall-owner/MtoType2MarketView';
import { useSearchParams } from 'next/navigation';

export default function MallMarketPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId') || 'current';
  const activityId = searchParams.get('activityId') || 'default';

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
            href="/student"
          >
            {t('navigation.student')}
          </Link>
          <Typography color="text.primary">{t('mto.type2.mallMarket')}</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.type2.mallMarketTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type2.mallMarketDescription')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<MallIcon />}
            label={t('mto.type2.mallExclusive')}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<BiddingIcon />}
            label={t('mto.type2.competitiveBidding')}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<MoneyIcon />}
            label={t('mto.type2.dynamicPricing')}
            color="secondary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <MallIcon />
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="medium">
              {t('mto.type2.mallOwnerRequired')}
            </Typography>
            <Typography variant="body2">
              {t('mto.type2.mallOwnerRequiredDescription')}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <MtoType2MarketView
        teamId={teamId}
        activityId={activityId}
      />
    </Container>
  );
}