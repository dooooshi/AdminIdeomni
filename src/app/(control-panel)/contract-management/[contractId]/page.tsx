'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import ContractDetail from '@/components/contract/ContractDetail';
import { useAuth } from '@/lib/auth/auth-context';

export default function ContractDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  
  // Get contract ID from URL params
  const contractId = params?.contractId as string;
  
  // Get user's team ID (if available)
  const userTeamId = user?.teamId;

  if (!contractId) {
    return (
      <Container maxWidth="xl">
        <Box py={3}>
          <Typography>Invalid contract ID</Typography>
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