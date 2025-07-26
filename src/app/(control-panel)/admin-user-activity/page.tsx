'use client';

import React from 'react';
import { Container, Box } from '@mui/material';
import AdminUserActivityDashboard from '@/components/admin-user-activity/AdminUserActivityDashboard';

/**
 * Admin User-Activity Management Page
 * 
 * This page provides comprehensive admin tools for managing user-activity relationships,
 * team assignments, statistics, and data export capabilities.
 * 
 * Features:
 * - Advanced user search and filtering
 * - User-to-activity assignment with constraint handling
 * - Team management within activities
 * - Comprehensive statistics and analytics
 * - Data export in multiple formats
 * - Bulk operations with detailed results
 * - Real-time dashboard updates
 */
const AdminUserActivityPage: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box sx={{ width: '100%' }}>
        <AdminUserActivityDashboard />
      </Box>
    </Container>
  );
};

export default AdminUserActivityPage;