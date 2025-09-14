'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ContractDetail from '@/components/contract/ContractDetail';
import { useAuth } from '@/lib/auth/auth-context';

export default function ContractDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const { user } = useAuth();
  
  // Get contract ID from URL params
  const contractId = params?.contractId as string;
  
  // Get user's team ID (if available)
  // Note: Current user types don't have teamId, so this will always be undefined
  const userTeamId: string | undefined = undefined;

  if (!contractId) {
    return (
      <Container maxWidth="xl">
        <Box py={3}>
          <Typography>{t('contract.INVALID_CONTRACT_ID')}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <ContractDetail 
          contractId={contractId} 
          userTeamId={userTeamId} 
        />
      </Box>
    </Container>
  );
}