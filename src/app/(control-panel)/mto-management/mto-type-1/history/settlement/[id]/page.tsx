'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Button,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import MtoType1SettlementHistoryViewerV2 from '@/components/mto/type1/manager/MtoType1SettlementHistoryViewerV2';
import { MtoType1Requirement } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { format, parseISO } from 'date-fns';

export default function MtoType1SettlementHistoryDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const requirementId = params.id as string;

  const [requirement, setRequirement] = useState<MtoType1Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequirement();
  }, [requirementId]);

  const loadRequirement = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MtoType1Service.getRequirement(Number(requirementId));
      setRequirement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('mto.type1.settlementHistory.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/mto-management/mto-type-1/history');
  };

  const handleExport = async () => {
    try {
      // Export settlement history to CSV
      const response = await MtoType1Service.getSettlementHistoryV2(Number(requirementId));
      const historyData = response.data;

      // Convert to CSV format
      const csvHeaders = [
        t('mto.type1.settlementHistory.csv.step'),
        t('mto.type1.settlementHistory.csv.stepType'),
        t('mto.type1.settlementHistory.csv.description'),
        t('mto.type1.settlementHistory.csv.timestamp'),
        t('mto.type1.settlementHistory.csv.tileName'),
        t('mto.type1.settlementHistory.csv.productsValidated'),
        t('mto.type1.settlementHistory.csv.productsSettled'),
        t('mto.type1.settlementHistory.csv.productsRejected'),
        t('mto.type1.settlementHistory.csv.processingDuration')
      ];
      const csvRows = historyData.steps.map(step => [
        step.step,
        step.stepType,
        step.stepDescription,
        step.timestamp,
        step.tileName || '',
        step.productsValidated,
        step.productsSettled,
        step.productsRejected,
        step.processingDuration || ''
      ]);

      // Add summary row
      const summaryRow = [
        t('mto.type1.settlementHistory.csv.summary'),
        '',
        `${t('mto.type1.settlementHistory.csv.totalTiles')}: ${historyData.summary.totalTilesProcessed}`,
        '',
        '',
        historyData.summary.totalProductsValidated,
        historyData.summary.totalProductsSettled,
        historyData.summary.totalProductsRejected,
        historyData.summary.totalProcessingTime
      ];
      csvRows.push(summaryRow);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `mto_type1_settlement_history_${requirementId}_${new Date().toISOString()}.csv`;
      link.click();
    } catch (error) {
      console.error('Failed to export settlement history:', error);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
      DRAFT: 'default',
      RELEASED: 'primary',
      IN_PROGRESS: 'warning',
      SETTLING: 'info',
      SETTLED: 'success',
      CANCELLED: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      DRAFT: t('mto.type1.status.draft'),
      RELEASED: t('mto.type1.status.released'),
      IN_PROGRESS: t('mto.type1.status.inProgress'),
      SETTLING: t('mto.type1.status.settling'),
      SETTLED: t('mto.type1.status.settled'),
      CANCELLED: t('mto.type1.status.cancelled')
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !requirement) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">
          <AlertTitle>{t('mto.type1.settlementHistory.error')}</AlertTitle>
          {error || t('mto.type1.settlementHistory.error')}
        </Alert>
        <Box mt={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
        </Box>
      </Container>
    );
  }

  const isSettlementAvailable = requirement.status === 'SETTLING' || requirement.status === 'SETTLED';

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
          <Link
            underline="hover"
            color="inherit"
            href="/mto-management/mto-type-1/history"
          >
            {t('mto.type1.history.title')}
          </Link>
          <Typography color="text.primary">
            {t('mto.type1.settlementHistory.title')} #{requirementId}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1, fontSize: 32 }} />
            {t('mto.type1.settlementHistory.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type1.settlementHistory.requirementInfo', {
              id: requirement.id,
              name: requirement.metadata?.name || `${t('mto.type1.fields.requirement')} ${requirement.id}`
            })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
          {isSettlementAvailable && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              {t('common.export')}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Requirement Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('mto.type1.settlementHistory.requirementSummary')}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.status')}
              </Typography>
              <Chip
                label={getStatusLabel(requirement.status)}
                color={getStatusColor(requirement.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.activity')}
              </Typography>
              <Typography>{requirement.activityId}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.settlementTime')}
              </Typography>
              <Typography>
                {format(parseISO(requirement.settlementTime), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.settlementCompletedAt')}
              </Typography>
              <Typography>
                {requirement.settlementCompletedAt
                  ? format(parseISO(requirement.settlementCompletedAt), 'MMM dd, yyyy HH:mm')
                  : '-'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.actualPurchasedNumber')}
              </Typography>
              <Typography variant="h6" color="primary">
                {requirement.actualPurchasedNumber.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.actualSpentBudget')}
              </Typography>
              <Typography variant="h6" color="success.main">
                ${Number(requirement.actualSpentBudget || 0).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.fulfillmentRate')}
              </Typography>
              <Typography
                variant="h6"
                color={requirement.fulfillmentRate >= 0.8 ? 'success.main' : 'warning.main'}
              >
                {(requirement.fulfillmentRate * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.fields.overallPurchaseBudget')}
              </Typography>
              <Typography>
                ${Number(requirement.overallPurchaseBudget).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Settlement History Viewer */}
      {isSettlementAvailable ? (
        <Paper sx={{ p: 3 }}>
          <MtoType1SettlementHistoryViewerV2 mtoType1Id={requirementId} />
        </Paper>
      ) : (
        <Alert severity="info">
          <AlertTitle>{t('mto.type1.settlementHistory.notAvailable')}</AlertTitle>
          {t('mto.type1.settlementHistory.notAvailableDescription')}
        </Alert>
      )}
    </Container>
  );
}