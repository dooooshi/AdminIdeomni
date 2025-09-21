'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
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
        onViewDetails={() => {}}
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
    </Container>
  );
}