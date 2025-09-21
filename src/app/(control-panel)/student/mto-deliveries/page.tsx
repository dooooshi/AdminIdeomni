'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import MtoType1DeliveryTable from '@/components/mto/type1/student/MtoType1DeliveryTable';
import MtoType1DeliveryDetail from '@/components/mto/type1/student/MtoType1DeliveryDetail';
import MtoType1Service from '@/lib/services/mtoType1Service';
import {
  MtoType1DeliverySummary,
  PaginationParams
} from '@/lib/types/mtoType1';

export default function StudentMtoDeliveriesPage() {
  const { t } = useTranslation();

  // State
  const [deliveries, setDeliveries] = useState<MtoType1DeliverySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 20,
    total: 0
  });
  const [sortBy, setSortBy] = useState('deliveredAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch deliveries data
  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: PaginationParams = {
        page: pagination.page + 1, // API uses 1-indexed pages
        limit: pagination.rowsPerPage,
        sortBy,
        sortOrder
      };

      const response = await MtoType1Service.getTeamDeliveriesDetailed(params);

      setDeliveries(response.data || []);

      if (response.extra?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.extra?.pagination?.total || 0
        }));
      }
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      setError(t('mto.student.deliveries.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.rowsPerPage, sortBy, sortOrder, t]);

  // Initial fetch
  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: 0,
      rowsPerPage: newRowsPerPage
    }));
  };

  const handleSort = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleViewDetails = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedDeliveryId(null);
  };

  const handleRequestReturn = async (deliveryId: string) => {
    // TODO: Implement return request dialog
    console.log('Request return for delivery:', deliveryId);
    setSuccessMessage(t('mto.student.deliveries.success.returnRequested'));
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
          <Typography color="text.primary">
            {t('mto.student.deliveries.title')}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          {t('mto.student.deliveries.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('mto.student.deliveries.description')}
        </Typography>
      </Box>


      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Deliveries Table */}
      <MtoType1DeliveryTable
        deliveries={deliveries}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSort={handleSort}
        onViewDetails={handleViewDetails}
        onRequestReturn={handleRequestReturn}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

      {/* Delivery Detail Dialog */}
      <MtoType1DeliveryDetail
        open={detailDialogOpen}
        deliveryId={selectedDeliveryId}
        onClose={handleCloseDetailDialog}
        onReturnRequest={handleRequestReturn}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Container>
  );
}