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
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PlayCircle as ReleaseIcon,
  Cancel as CancelIcon,
  AccountBalance as BalanceIcon,
  Store as MallIcon,
  TrendingUp as BiddingIcon,
  CheckCircle,
  Warning as WarningIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { MtoType2Requirement } from '@/lib/types/mtoType2';
import MtoType2Service from '@/lib/services/mtoType2Service';
import { enqueueSnackbar } from 'notistack';
import { format } from 'date-fns';
import { MtoType2RequirementFormWithPagination as MtoType2RequirementForm } from './MtoType2RequirementFormWithPagination';
import MtoType2CalculationHistoryModal from './MtoType2CalculationHistoryModal';

const statusIcons: Record<string, React.ReactElement> = {
  DRAFT: <WarningIcon color="disabled" />,
  RELEASED: <BiddingIcon color="primary" />,
  IN_PROGRESS: <BiddingIcon color="info" />,
  SETTLED: <CheckCircle color="success" />,
  CANCELLED: <CancelIcon color="error" />
};

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'error' | 'warning'> = {
  DRAFT: 'default',
  RELEASED: 'primary',
  IN_PROGRESS: 'info',
  SETTLED: 'success',
  CANCELLED: 'error'
};

interface MtoType2RequirementListProps {
  isManager?: boolean;
}

const MtoType2RequirementList: React.FC<MtoType2RequirementListProps> = ({
  isManager = false,
}) => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState<MtoType2Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequirement, setSelectedRequirement] = useState<MtoType2Requirement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyRequirement, setHistoryRequirement] = useState<MtoType2Requirement | null>(null);

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    setLoading(true);
    try {
      const data = await MtoType2Service.getRequirements();
      // Handle paginated response structure
      if (data && data.items && Array.isArray(data.items)) {
        setRequirements(data.items);
      } else {
        setRequirements([]);
      }
    } catch (error) {
      console.error('Failed to load requirements:', error);
      enqueueSnackbar(t('mto.type2.errors.loadFailed'), { variant: 'error' });
      setRequirements([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = () => {
    setSelectedRequirement(null);
    setEditMode(false);
    setFormDialogOpen(true);
  };

  const handleEditRequirement = (requirement: MtoType2Requirement) => {
    setSelectedRequirement(requirement);
    setEditMode(true);
    setFormDialogOpen(true);
  };

  const handleDeleteRequirement = async () => {
    if (!selectedRequirement) return;

    setDeleting(true);
    try {
      await MtoType2Service.deleteRequirement(selectedRequirement.id);
      enqueueSnackbar(t('mto.type2.messages.deleted'), { variant: 'success' });
      setDeleteDialogOpen(false);
      loadRequirements();
    } catch (error) {
      console.error('Failed to delete requirement:', error);
      enqueueSnackbar(t('mto.type2.errors.deleteFailed'), { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleReleaseRequirement = async (requirement: MtoType2Requirement) => {
    try {
      await MtoType2Service.releaseRequirement(requirement.id);
      enqueueSnackbar(t('mto.type2.messages.released'), { variant: 'success' });
      loadRequirements();
    } catch (error) {
      console.error('Failed to release requirement:', error);
      enqueueSnackbar(t('mto.type2.errors.releaseFailed'), { variant: 'error' });
    }
  };

  const getFilteredRequirements = (status?: string) => {
    // Ensure requirements is always an array
    let filtered = Array.isArray(requirements) ? requirements : [];

    if (status) {
      filtered = filtered.filter(req => req.status === status);
    }

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.managerProductFormula?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toString().includes(searchTerm)
      );
    }

    return filtered;
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue || 0);
  };

  const renderRequirementsTable = (reqs: MtoType2Requirement[]) => {
    if (reqs.length === 0) {
      return (
        <Alert severity="info">
          {t('mto.type2.noRequirements')}
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">{t('mto.type2.id')}</TableCell>
              <TableCell align="center">{t('mto.type2.name')}</TableCell>
              <TableCell align="center">{t('mto.type2.budgetPool')}</TableCell>
              <TableCell align="center">{t('mto.type2.releaseTime')}</TableCell>
              <TableCell align="center">{t('mto.type2.settlementTime')}</TableCell>
              <TableCell align="center">{t('mto.type2.status')}</TableCell>
              <TableCell align="center">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reqs.map((req) => (
              <TableRow key={req.id}>
                <TableCell align="center">#{req.id}</TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {req.metadata?.name || req.managerProductFormula?.productName || `Requirement #${req.id}`}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(req.overallPurchaseBudget)}
                </TableCell>
                <TableCell align="center">
                  {format(new Date(req.releaseTime), 'MM/dd/yyyy HH:mm')}
                </TableCell>
                <TableCell align="center">
                  {format(new Date(req.settlementTime), 'MM/dd/yyyy HH:mm')}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={statusIcons[req.status]}
                    label={t(`mto.type2.statuses.${req.status.toLowerCase()}`)}
                    size="small"
                    color={statusColors[req.status]}
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title={t('mto.type2.history.viewHistory')}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setHistoryRequirement(req);
                          setHistoryModalOpen(true);
                        }}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {req.status === 'DRAFT' && (
                      <>
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditRequirement(req)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('mto.type2.release')}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleReleaseRequirement(req)}
                          >
                            <ReleaseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedRequirement(req);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {t('mto.type2.title')}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadRequirements}
            disabled={loading}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRequirement}
          >
            {t('mto.type2.createRequirement')}
          </Button>
        </Stack>
      </Stack>

      {/* Info Banner */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <MallIcon color="primary" />
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="medium">
              {t('mto.type2.mallBased')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mto.type2.description')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<BiddingIcon />}
              label={t('mto.type2.competitiveBidding')}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<BalanceIcon />}
              label={t('mto.type2.dynamicPricing')}
              color="success"
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('mto.type2.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Requirements Table */}
      <Paper sx={{ width: '100%', p: 2 }}>
        {renderRequirementsTable(getFilteredRequirements())}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('mto.type2.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('mto.type2.deleteConfirmMessage', {
              id: selectedRequirement?.id,
              name: selectedRequirement?.requirementName
            })}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteRequirement}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Form Dialog */}
      <MtoType2RequirementForm
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedRequirement(null);
        }}
        onSuccess={() => {
          setFormDialogOpen(false);
          setSelectedRequirement(null);
          loadRequirements();
        }}
        editData={selectedRequirement}
      />

      {/* Calculation History Modal */}
      {historyRequirement && (
        <MtoType2CalculationHistoryModal
          open={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setHistoryRequirement(null);
          }}
          mtoType2Id={historyRequirement.id}
          mtoType2Name={historyRequirement.metadata?.name || historyRequirement.managerProductFormula?.productName || `Requirement #${historyRequirement.id}`}
        />
      )}
    </Box>
  );
};

export default MtoType2RequirementList;