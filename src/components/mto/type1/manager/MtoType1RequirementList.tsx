'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ReleaseIcon,
  Cancel as CancelIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  Groups as GroupsIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { MtoType1Requirement, MtoType1Status } from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { enqueueSnackbar } from 'notistack';
import { format } from 'date-fns';

interface MtoType1RequirementListProps {
  onCreateClick: () => void;
  onEditClick: (requirement: MtoType1Requirement) => void;
  onViewClick: (requirement: MtoType1Requirement) => void;
  onDeleteSuccess: () => void;
  activityId?: string;
  refresh?: number;
}

const statusColors: Record<keyof MtoType1Status, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  DRAFT: 'default',
  RELEASED: 'primary',
  IN_PROGRESS: 'warning',
  SETTLED: 'success',
  CANCELLED: 'error'
};

const MtoType1RequirementList: React.FC<MtoType1RequirementListProps> = ({
  onCreateClick,
  onEditClick,
  onViewClick,
  onDeleteSuccess,
  activityId,
  refresh = 0
}) => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState<MtoType1Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<keyof MtoType1Status | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<MtoType1Requirement | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRequirements();
  }, [page, rowsPerPage, refresh, statusFilter]);

  const loadRequirements = async () => {
    setLoading(true);
    try {
      const response = await MtoType1Service.searchRequirements({
        page: page + 1,
        limit: rowsPerPage,
        q: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        activityId,
        sortBy: 'releaseTime',
        sortOrder: 'desc'
      });

      setRequirements(response.data || []);
      setTotalCount(response.extra?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load requirements:', error);
      setRequirements([]);
      enqueueSnackbar(t('mto.type1.errors.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadRequirements();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRelease = async (requirement: MtoType1Requirement) => {
    try {
      await MtoType1Service.releaseRequirement(requirement.id);
      enqueueSnackbar(t('mto.type1.messages.released'), { variant: 'success' });
      loadRequirements();
    } catch (error) {
      console.error('Failed to release requirement:', error);
      enqueueSnackbar(t('mto.type1.errors.releaseFailed'), { variant: 'error' });
    }
  };

  const handleCancel = async (requirement: MtoType1Requirement) => {
    try {
      await MtoType1Service.cancelRequirement(requirement.id);
      enqueueSnackbar(t('mto.type1.messages.cancelled'), { variant: 'success' });
      loadRequirements();
    } catch (error) {
      console.error('Failed to cancel requirement:', error);
      enqueueSnackbar(t('mto.type1.errors.cancelFailed'), { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedRequirement) return;

    setDeleting(true);
    try {
      await MtoType1Service.deleteRequirement(selectedRequirement.id);
      enqueueSnackbar(t('mto.type1.messages.deleted'), { variant: 'success' });
      setDeleteDialogOpen(false);
      onDeleteSuccess();
      loadRequirements();
    } catch (error) {
      console.error('Failed to delete requirement:', error);
      enqueueSnackbar(t('mto.type1.errors.deleteFailed'), { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (requirement: MtoType1Requirement) => {
    setSelectedRequirement(requirement);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('$', '');
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <TextField
          placeholder={t('mto.type1.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('mto.type1.status')}</InputLabel>
          <Select
            value={statusFilter}
            label={t('mto.type1.status')}
            onChange={(e) => setStatusFilter(e.target.value as keyof MtoType1Status | 'ALL')}
          >
            <MenuItem value="ALL">{t('common.all')}</MenuItem>
            <MenuItem value="DRAFT">{t('mto.type1.statuses.draft')}</MenuItem>
            <MenuItem value="RELEASED">{t('mto.type1.statuses.released')}</MenuItem>
            <MenuItem value="IN_PROGRESS">{t('mto.type1.statuses.inProgress')}</MenuItem>
            <MenuItem value="SETTLED">{t('mto.type1.statuses.settled')}</MenuItem>
            <MenuItem value="CANCELLED">{t('mto.type1.statuses.cancelled')}</MenuItem>
          </Select>
        </FormControl>

        <Button onClick={handleSearch} variant="contained" startIcon={<SearchIcon />}>
          {t('common.search')}
        </Button>

        <IconButton onClick={loadRequirements} color="primary">
          <RefreshIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onCreateClick}
        >
          {t('mto.type1.createRequirement')}
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type1.id')}</TableCell>
                  <TableCell>{t('mto.type1.name')}</TableCell>
                  <TableCell>{t('mto.type1.formula')}</TableCell>
                  <TableCell align="right">{t('mto.type1.unitPrice')}</TableCell>
                  <TableCell align="right">{t('mto.type1.totalQuantity')}</TableCell>
                  <TableCell align="right">{t('mto.type1.totalBudget')}</TableCell>
                  <TableCell>{t('mto.type1.releaseTime')}</TableCell>
                  <TableCell>{t('mto.type1.settlementTime')}</TableCell>
                  <TableCell align="center">{t('mto.type1.status')}</TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirements.map((requirement) => (
                  <TableRow key={requirement.id}>
                    <TableCell>{requirement.id}</TableCell>
                    <TableCell>{requirement.metadata?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={`Formula #${requirement.managerProductFormulaId}`}
                        size="small"
                        icon={<ScienceIcon />}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(requirement.purchaseGoldPrice)}
                    </TableCell>
                    <TableCell align="right">
                      {requirement.overallPurchaseNumber.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="primary">
                        {formatCurrency(requirement.overallPurchaseBudget)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(requirement.releaseTime), 'MM/dd/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(requirement.settlementTime), 'MM/dd/yyyy HH:mm')}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={t(`mto.type1.statuses.${requirement.status.toLowerCase()}`)}
                        size="small"
                        color={statusColors[requirement.status]}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={t('common.view')}>
                          <IconButton size="small" onClick={() => onViewClick(requirement)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {requirement.status === 'DRAFT' && (
                          <>
                            <Tooltip title={t('common.edit')}>
                              <IconButton size="small" onClick={() => onEditClick(requirement)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('mto.type1.release')}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleRelease(requirement)}
                              >
                                <ReleaseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('common.delete')}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDeleteDialog(requirement)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {(requirement.status === 'RELEASED' || requirement.status === 'IN_PROGRESS') && (
                          <Tooltip title={t('mto.type1.cancel')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancel(requirement)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {requirements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('mto.type1.noRequirements')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t('common.rowsPerPage')}
            />
          </>
        )}
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('mto.type1.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('mto.type1.deleteConfirmMessage', {
              id: selectedRequirement?.id,
              name: selectedRequirement?.metadata?.name || selectedRequirement?.id
            })}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType1RequirementList;