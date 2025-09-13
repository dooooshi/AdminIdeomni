'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Groups as TeamsIcon,
  Description as ContentIcon
} from '@mui/icons-material';
import { contractService } from '@/lib/services/contractService';
import { ContractDetailsResponse, ContractStatus } from '@/types/contract';
import ContractStatusBadge from './ContractStatusBadge';
import ContractTeamsList from './ContractTeamsList';
import ContractActions from './ContractActions';
import ContractHistory from './ContractHistory';

interface ContractDetailProps {
  contractId: string;
  userTeamId?: string;
}

const ContractDetail: React.FC<ContractDetailProps> = ({ contractId, userTeamId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  
  // State
  const [contract, setContract] = useState<ContractDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch contract details
  const fetchContract = async () => {
    try {
      setError(null);
      const response = await contractService.getContractDetails(contractId);
      setContract(response);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_LOAD_CONTRACT'));
      console.error('Failed to fetch contract:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchContract();
  }, [contractId]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContract();
  };

  // Handle back
  const handleBack = () => {
    router.push('/contract-management');
  };

  // Handle action complete (refresh contract)
  const handleActionComplete = () => {
    fetchContract();
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !contract) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || t('contract.CONTRACT_NOT_FOUND')}
        </Alert>
        <Button variant="contained" onClick={handleBack} startIcon={<BackIcon />}>
          {t('common.back')}
        </Button>
      </Box>
    );
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleBack}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            {contract.contractNumber}
          </Typography>
          <ContractStatusBadge status={contract.status} size="medium" />
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title={t('contract.CONTRACT_HISTORY')}>
            <IconButton onClick={() => setShowHistory(!showHistory)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Contract Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ContentIcon color="primary" />
                <Typography variant="h6">
                  {t('contract.CONTRACT_INFO')}
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                {/* Title */}
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {t('contract.CONTRACT_TITLE')}
                  </Typography>
                  <Typography variant="h6">
                    {contract.title}
                  </Typography>
                </Box>

                <Divider />

                {/* Content */}
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {t('contract.CONTRACT_CONTENT')}
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      bgcolor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'grey.50',
                      borderColor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        color: (theme) => theme.palette.text.primary
                      }}
                    >
                      {contract.content}
                    </Typography>
                  </Paper>
                </Box>

                <Divider />

                {/* Metadata */}
                <Grid container spacing={2}>
                  {contract.createdBy && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {t('contract.CREATED_BY')}
                      </Typography>
                      <Typography>
                        {contract.createdBy.firstName || ''} {contract.createdBy.lastName || contract.createdBy.username}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {t('contract.CREATED_AT')}
                    </Typography>
                    <Typography>
                      {formatDate(contract.createdAt)}
                    </Typography>
                  </Grid>
                  {(contract.status === 'SIGNED' || contract.status === ContractStatus.SIGNED) && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {t('contract.SIGNED_AT')}
                      </Typography>
                      <Typography>
                        {formatDate(contract.signedAt)}
                      </Typography>
                    </Grid>
                  )}
                  {(contract.status === 'REJECTED' || contract.status === ContractStatus.REJECTED) && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {t('contract.REJECTED_AT')}
                      </Typography>
                      <Typography>
                        {formatDate(contract.rejectedAt)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TeamsIcon color="primary" />
                <Typography variant="h6">
                  {t('contract.PARTICIPATING_TEAMS')}
                </Typography>
              </Box>
              
              <ContractTeamsList 
                teams={contract.teams}
                userTeamId={userTeamId}
                contractStatus={contract.status}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Actions */}
          {userTeamId && (contract.status === 'PENDING_APPROVAL' || contract.status === ContractStatus.PENDING_APPROVAL) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('contract.ACTIONS')}
                </Typography>
                <ContractActions
                  contract={contract}
                  userTeamId={userTeamId}
                  onActionComplete={handleActionComplete}
                />
              </CardContent>
            </Card>
          )}

          {/* History Panel */}
          {showHistory && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('contract.OPERATION_HISTORY')}
                </Typography>
                <ContractHistory contractId={contractId} />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractDetail;