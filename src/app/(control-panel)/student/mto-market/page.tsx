'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Close as CloseIcon,
  ShoppingCart as MarketIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import MtoType1MarketView from '@/components/mto/type1/student/MtoType1MarketView';
import MtoType1DeliveryForm from '@/components/mto/type1/student/MtoType1DeliveryForm';
import { MtoType1TeamView } from '@/lib/types/mtoType1';

export default function StudentMtoMarketPage() {
  const { t } = useTranslation();
  const [selectedRequirement, setSelectedRequirement] = useState<MtoType1TeamView | null>(null);
  const [deliveryFormOpen, setDeliveryFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (requirement: MtoType1TeamView) => {
    setSelectedRequirement(requirement);
    setDetailsOpen(true);
  };

  const handleMakeDelivery = (requirement: MtoType1TeamView) => {
    setSelectedRequirement(requirement);
    setDeliveryFormOpen(true);
  };

  const handleDeliverySuccess = () => {
    setDeliveryFormOpen(false);
    setSelectedRequirement(null);
    // Could trigger a refresh of the market view here
  };

  const handleCloseDeliveryForm = () => {
    setDeliveryFormOpen(false);
    setSelectedRequirement(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('$', '');
  };

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
          <Typography color="text.primary">{t('mto.student.market')}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.student.marketTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.student.marketDescription')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<MarketIcon />}
            label={t('mto.student.openMarket')}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<TrendingIcon />}
            label={t('mto.student.competitivePricing')}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Market View Component */}
      <MtoType1MarketView
        onViewDetails={handleViewDetails}
        onMakeDelivery={handleMakeDelivery}
      />

      {/* Delivery Form Dialog */}
      <Dialog
        open={deliveryFormOpen}
        onClose={handleCloseDeliveryForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseDeliveryForm}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          {selectedRequirement && (
            <MtoType1DeliveryForm
              requirement={selectedRequirement}
              onSave={handleDeliverySuccess}
              onCancel={handleCloseDeliveryForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={() => setDetailsOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          {selectedRequirement && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedRequirement.requirementName || `Requirement #${selectedRequirement.requirementId}`}
              </Typography>

              <Stack spacing={2}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('mto.student.requirementDetails')}
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{t('mto.student.status')}:</Typography>
                      <Chip
                        label={t(`mto.type1.statuses.${selectedRequirement.status.toLowerCase()}`)}
                        size="small"
                        color="primary"
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{t('mto.student.unitPrice')}:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(selectedRequirement.unitPrice)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('mto.student.availableLocations')}
                  </Typography>
                  <Stack spacing={1}>
                    {selectedRequirement.availableTiles?.map((tile) => (
                      <Stack key={tile.tileId} direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          {t('mto.student.tile', { id: tile.tileId })}
                        </Typography>
                        <Chip
                          label={t('mto.student.remaining', { count: tile.remaining })}
                          size="small"
                          color={tile.remaining > 0 ? 'success' : 'default'}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('mto.student.profitAnalysis')}
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{t('mto.student.potentialRevenue')}:</Typography>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(selectedRequirement.potentialRevenue || 0)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{t('mto.student.transportationCost')}:</Typography>
                      <Typography variant="body2" color="error.main">
                        -{formatCurrency(selectedRequirement.transportationCosts || 0)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">
                        {t('mto.student.netProfit')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {formatCurrency(selectedRequirement.netProfit || 0)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}