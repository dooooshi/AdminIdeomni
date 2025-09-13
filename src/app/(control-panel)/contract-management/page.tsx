'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ContractListTable from '@/components/contract/ContractListTable';
import { useAuth } from '@/lib/auth/auth-context';
import teamService from '@/lib/services/teamService';

export default function ContractManagementPage() {
  const { t } = useTranslation();
  const { user, userType } = useAuth();
  const [userTeamId, setUserTeamId] = useState<string | undefined>(undefined);
  
  // Fetch user's team ID when component mounts
  useEffect(() => {
    const fetchUserTeam = async () => {
      // Only fetch team for regular users, not admins
      if (userType === 'user' && user) {
        try {
          const team = await teamService.getCurrentTeam();
          if (team?.id) {
            setUserTeamId(team.id);
          }
        } catch (error) {
          // User might not have a team, which is fine
          console.log('User does not have a team');
        }
      }
    };
    
    fetchUserTeam();
  }, [user, userType]);

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