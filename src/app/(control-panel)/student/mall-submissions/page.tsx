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
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { MtoType2SubmissionList } from '@/components/mto/type2/mall-owner/MtoType2SubmissionList';
import { useSearchParams } from 'next/navigation';

export default function MallSubmissionsPage() {
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
          <Typography color="text.primary">{t('mto.type2.mallSubmissions')}</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.type2.mallSubmissionsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type2.mallSubmissionsDescription')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<MallIcon />}
            label={t('mto.type2.mallOwnerOnly')}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<ReceiptIcon />}
            label={t('mto.type2.submissionTracking')}
            color="info"
            variant="outlined"
          />
          <Chip
            icon={<AssessmentIcon />}
            label={t('mto.type2.settlementStatus')}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <ReceiptIcon color="primary" />
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="medium">
              {t('mto.type2.submissionManagement')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mto.type2.submissionManagementDescription')}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <MtoType2SubmissionList
        teamId={teamId}
        activityId={activityId}
      />
    </Container>
  );
}