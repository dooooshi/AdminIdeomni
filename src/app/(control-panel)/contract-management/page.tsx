'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ContractListTable from '@/components/contract/ContractListTable';
import { useAuth } from '@/lib/auth/auth-context';

export default function ContractManagementPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Get user's team ID (if available)
  const userTeamId = user?.teamId;

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Page Header */}
        <Typography variant="h4" component="h1" gutterBottom>
          {t('contract.CONTRACT_MANAGEMENT')}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {t('contract.CONTRACT_MANAGEMENT_DESCRIPTION')}
        </Typography>

        {/* Contract List Table */}
        <ContractListTable teamId={userTeamId} />
      </Box>
    </Container>
  );
}