'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Chip
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { contractService } from '@/lib/services/contractService';
import { ContractStatus } from '@/types/contract';
import { ContractListItem, ContractListResponse } from '@/types/contract';
import ContractCard from './ContractCard';
import ContractStatusBadge from './ContractStatusBadge';

interface ContractListProps {
  teamId?: string;
}

const ContractList: React.FC<ContractListProps> = ({ teamId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  
  // State
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    try {
      setError(null);
      const params = {
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter })
      };
      
      const response: ContractListResponse = await contractService.listContracts(params);
      setContracts(response.contracts);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_LOAD_CONTRACTS'));
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, t]);

  // Initial load and refresh on filter/page change
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  // Handle create new contract
  const handleCreateContract = () => {
    router.push('/contract-management/create');
  };

  // Handle view contract
  const handleViewContract = (contractId: string) => {
    router.push(`/contract-management/${contractId}`);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          {t('common.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {t('contract.CONTRACTS')}
        </Typography>
        
        <Box display="flex" gap={2}>
          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t('contract.FILTER_BY_STATUS')}</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label={t('contract.FILTER_BY_STATUS')}
            >
              <MenuItem value="">
                <em>{t('contract.ALL_STATUSES')}</em>
              </MenuItem>
              <MenuItem value={ContractStatus.PENDING_APPROVAL}>
                {t('contract.STATUS_PENDING_APPROVAL')}
              </MenuItem>
              <MenuItem value={ContractStatus.SIGNED}>
                {t('contract.STATUS_SIGNED')}
              </MenuItem>
              <MenuItem value={ContractStatus.REJECTED}>
                {t('contract.STATUS_REJECTED')}
              </MenuItem>
            </Select>
          </FormControl>
          
          {/* Refresh Button */}
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {/* Create Contract Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateContract}
          >
            {t('contract.CREATE_CONTRACT')}
          </Button>
        </Box>
      </Box>

      {/* Contract List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" gutterBottom>
                {t('contract.NO_CONTRACTS')}
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                {statusFilter ? 
                  t('contract.NO_CONTRACTS_WITH_STATUS') : 
                  t('contract.CREATE_YOUR_FIRST_CONTRACT')
                }
              </Typography>
              {!statusFilter && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateContract}
                >
                  {t('contract.CREATE_CONTRACT')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {contracts.map((contract) => (
              <Grid key={contract.contractId} item xs={12} md={6} lg={4}>
                <ContractCard
                  contract={contract}
                  onView={() => handleViewContract(contract.contractId)}
                  userTeamId={teamId}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ContractList;