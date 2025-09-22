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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Factory as FactoryIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { ManagerProductFormula } from '@/lib/types/managerProductFormula';
import ManagerProductFormulaService from '@/lib/services/managerProductFormulaService';
import { enqueueSnackbar } from 'notistack';

interface ManagerProductFormulaListProps {
  onCreateClick: () => void;
  onEditClick: (formula: ManagerProductFormula) => void;
  onViewClick: (formula: ManagerProductFormula) => void;
  onDeleteSuccess: () => void;
  refresh?: number;
}

const ManagerProductFormulaList: React.FC<ManagerProductFormulaListProps> = ({
  onCreateClick,
  onEditClick,
  onViewClick,
  onDeleteSuccess,
  refresh = 0
}) => {
  const { t } = useTranslation();
  const [formulas, setFormulas] = useState<ManagerProductFormula[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<ManagerProductFormula | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadFormulas();
  }, [page, rowsPerPage, refresh]);

  const loadFormulas = async () => {
    setLoading(true);
    try {
      const response = await ManagerProductFormulaService.searchProductFormulas({
        page: page + 1,
        limit: rowsPerPage,
        searchTerm: searchTerm || undefined
      });

      setFormulas(response.items || []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load formulas:', error);
      setFormulas([]);
      enqueueSnackbar(t('managerProductFormula.errors.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadFormulas();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (formula: ManagerProductFormula) => {
    setSelectedFormula(formula);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFormula) return;

    setDeleting(true);
    try {
      await ManagerProductFormulaService.deleteProductFormula(selectedFormula.id);
      enqueueSnackbar(t('managerProductFormula.deleteSuccess'), { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedFormula(null);
      onDeleteSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || t('managerProductFormula.errors.deleteFailed');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          size="small"
          placeholder={t('managerProductFormula.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
        >
          {t('common.search')}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={loadFormulas}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateClick}
        >
          {t('managerProductFormula.createFormula')}
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{t('managerProductFormula.formulaNumber')}</TableCell>
                  <TableCell align="center">{t('managerProductFormula.productName')}</TableCell>
                  <TableCell align="center">{t('managerProductFormula.materials')}</TableCell>
                  <TableCell align="center">{t('managerProductFormula.craftCategories')}</TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formulas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary" py={4}>
                        {t('managerProductFormula.noFormulas')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  formulas.map((formula) => (
                    <TableRow key={formula.id} hover>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          #{formula.formulaNumber}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formula.productName}
                        </Typography>
                        {formula.productDescription && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {formula.productDescription}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <ScienceIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formula.materialCount || formula.materials?.length || 0}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <FactoryIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formula.craftCategoryCount || formula.craftCategories?.length || 0}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={t('common.view')}>
                            <IconButton
                              size="small"
                              onClick={() => onViewClick(formula)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.edit')}>
                            <IconButton
                              size="small"
                              onClick={() => onEditClick(formula)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(formula)}
                              disabled={formula.usedInMTOType1 || formula.usedInMTOType2}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('managerProductFormula.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('managerProductFormula.deleteWarning')}
          </Alert>
          {selectedFormula && (
            <Typography>
              {t('managerProductFormula.deleteConfirmMessage', {
                name: selectedFormula.productName
              })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerProductFormulaList;