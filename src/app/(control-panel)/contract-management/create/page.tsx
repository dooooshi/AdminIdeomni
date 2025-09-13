'use client';

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreateContractForm from '@/components/contract/CreateContractForm';
import { useAuth } from '@/lib/auth/auth-context';

export default function CreateContractPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Get user's team ID (if available)
  const userTeamId = user?.teamId;

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        {/* Page Header */}
        <Typography variant="h4" component="h1" gutterBottom>
          {t('contract.CREATE_CONTRACT')}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {t('contract.CREATE_CONTRACT_DESCRIPTION')}
        </Typography>

        {/* Create Contract Form */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <CreateContractForm userTeamId={userTeamId} />
        </Paper>
      </Box>
    </Container>
  );
}