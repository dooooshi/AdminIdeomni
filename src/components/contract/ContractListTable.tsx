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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AvatarGroup,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Groups as TeamsIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { contractService } from '@/lib/services/contractService';
import { ContractStatus } from '@/types/contract';
import { ContractListItem, ContractListResponse, ContractDetailsResponse } from '@/types/contract';
import ContractStatusBadge from './ContractStatusBadge';
import ContractDetailModal from './ContractDetailModal';

interface ContractListTableProps {
  teamId?: string;
}

const ContractListTable: React.FC<ContractListTableProps> = ({ teamId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  
  // State
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    try {
      setError(null);
      const params = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        ...(statusFilter && { status: statusFilter })
      };
      
      const response: ContractListResponse = await contractService.listContracts(params);
      setContracts(response.contracts);
      setTotalCount(response.pagination.total);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_LOAD_CONTRACTS'));
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, rowsPerPage, statusFilter, t]);

  // Initial load and refresh on filter/page change
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  // Handle create new
  const handleCreate = () => {
    router.push('/contract-management/create');
  };

  // Handle view details
  const handleViewDetails = (contractId: string) => {
    setSelectedContract(contractId);
    setDetailsOpen(true);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedContract(null);
    // Refresh list in case contract was updated
    fetchContracts();
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              {t('contract.CONTRACTS')}
            </Typography>
            
            <Box display="flex" gap={1}>
              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('contract.STATUS')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('contract.STATUS')}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ContractStatus | '');
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    <em>{t('common.all')}</em>
                  </MenuItem>
                  <MenuItem value={ContractStatus.PENDING_APPROVAL}>
                    {t('contract.PENDING_APPROVAL')}
                  </MenuItem>
                  <MenuItem value={ContractStatus.SIGNED}>
                    {t('contract.SIGNED')}
                  </MenuItem>
                  <MenuItem value={ContractStatus.REJECTED}>
                    {t('contract.REJECTED')}
                  </MenuItem>
                </Select>
              </FormControl>

              <Tooltip title={t('common.refresh')}>
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                {t('contract.CREATE_CONTRACT')}
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('contract.CONTRACT_NUMBER')}</TableCell>
                  <TableCell>{t('contract.TITLE')}</TableCell>
                  <TableCell align="center">{t('contract.STATUS')}</TableCell>
                  <TableCell align="center">{t('contract.TEAMS')}</TableCell>
                  <TableCell>{t('contract.CREATED_BY')}</TableCell>
                  <TableCell>{t('contract.CREATED_AT')}</TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box py={4}>
                        <Typography variant="body2" color="textSecondary">
                          {t('contract.NO_CONTRACTS')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.contractId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {contract.contractNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={contract.title}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {contract.title}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <ContractStatusBadge status={contract.status} />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                          <AvatarGroup max={3} sx={{ justifyContent: 'center' }}>
                            {contract.teams?.map((team) => (
                              <Tooltip key={team.teamId} title={team.teamName}>
                                <Avatar sx={{ 
                                  bgcolor: team.approved ? 'success.main' : 'grey.400',
                                  width: 32,
                                  height: 32,
                                  fontSize: '0.875rem'
                                }}>
                                  {team.teamName.charAt(0).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                          <Typography variant="body2" color="textSecondary">
                            ({contract.teamCount})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {contract.createdBy ? (
                          <Typography variant="body2">
                            {contract.createdBy.firstName} {contract.createdBy.lastName}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(contract.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={t('common.view')}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(contract.contractId)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        </CardContent>
      </Card>

      {/* Contract Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('contract.CONTRACT_DETAILS')}</Typography>
            <IconButton onClick={handleCloseDetails} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedContract && (
            <ContractDetailModal
              contractId={selectedContract}
              userTeamId={teamId}
              onRefresh={fetchContracts}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContractListTable;