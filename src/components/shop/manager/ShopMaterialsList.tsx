'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TablePagination,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as PriceIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/store';
import { removeMaterial, updateMaterialPrice } from '@/store/shopSlice';
import ShopService from '@/lib/services/shopService';

const originColors: Record<string, string> = {
  MINE: '#8B4513',
  QUARRY: '#696969',
  FOREST: '#228B22',
  FARM: '#90EE90',
  RANCH: '#FF6347',
  FISHERY: '#4682B4',
  SHOPS: '#FF69B4',
  FACTORY: '#708090',
  OTHER: '#808080',
};

export default function ShopMaterialsList() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const shopState = useSelector((state: RootState) => state.shop);
  const materials = shopState?.materials || [];
  const materialsLoading = shopState?.materialsLoading || false;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    material: any | null;
    newPrice: string;
  }>({
    open: false,
    material: null,
    newPrice: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEditDialog = (material: any) => {
    setEditDialog({
      open: true,
      material,
      newPrice: material.unitPrice,
    });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({
      open: false,
      material: null,
      newPrice: '',
    });
  };

  const handleUpdatePrice = async () => {
    if (!editDialog.material) return;

    const newPrice = parseFloat(editDialog.newPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      setError(t('shop.INVALID_PRICE'));
      return;
    }

    try {
      await dispatch(
        updateMaterialPrice({
          materialId: editDialog.material.id,
          request: { unitPrice: newPrice },
        })
      ).unwrap();
      handleCloseEditDialog();
      setError(null);
    } catch (err: any) {
      setError(err.message || t('shop.UPDATE_FAILED'));
    }
  };

  const handleDeleteMaterial = async () => {
    if (!deleteConfirm) return;

    try {
      await dispatch(removeMaterial(deleteConfirm.id)).unwrap();
      setDeleteConfirm(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || t('shop.REMOVE_FAILED'));
    }
  };

  const paginatedMaterials = materials.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (materials.length === 0 && !materialsLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t('shop.NO_MATERIALS')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('shop.ADD_MATERIAL')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('shop.MATERIALS_LIST')}
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('shop.MATERIAL')}</TableCell>
                  <TableCell align="center">{t('shop.MATERIAL_CODE')}</TableCell>
                  <TableCell align="center">{t('shop.ORIGIN')}</TableCell>
                  <TableCell align="right">{t('shop.UNIT_PRICE')}</TableCell>
                  <TableCell align="center">{t('shop.STOCK')}</TableCell>
                  <TableCell align="center">{t('shop.QUANTITY')}</TableCell>
                  <TableCell align="center">{t('shop.ACTIONS')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMaterials.map((material) => {
                  const remaining = material.quantityToSell
                    ? material.quantityToSell - material.quantitySold
                    : null;
                  const stockPercentage = material.quantityToSell
                    ? ((material.quantityToSell - material.quantitySold) / material.quantityToSell) * 100
                    : 100;

                  return (
                    <TableRow key={material.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {material.material.nameZh}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {material.material.nameEn}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          #{material.material.materialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={t(`shop.ORIGIN_${material.material.origin}`)}
                          size="small"
                          sx={{
                            backgroundColor: originColors[material.material.origin],
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {ShopService.formatPrice(material.unitPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {remaining !== null ? (
                          <Box>
                            <Typography variant="body2">
                              {remaining}/{material.quantityToSell}
                            </Typography>
                            <Box
                              sx={{
                                width: 60,
                                height: 4,
                                bgcolor: 'grey.300',
                                borderRadius: 2,
                                mt: 0.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${stockPercentage}%`,
                                  height: '100%',
                                  bgcolor:
                                    stockPercentage > 50
                                      ? 'success.main'
                                      : stockPercentage > 20
                                      ? 'warning.main'
                                      : 'error.main',
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Chip label={t('shop.UNLIMITED')} size="small" color="success" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{material.quantitySold}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title={t('shop.UPDATE_PRICE')}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditDialog(material)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('shop.REMOVE_MATERIAL')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirm(material)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {materials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('shop.NO_MATERIALS')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {materials.length > 0 && (
            <TablePagination
              component="div"
              count={materials.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={t('common.rowsPerPage')}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Price Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('shop.UPDATE_PRICE_TITLE')}</DialogTitle>
        <DialogContent>
          {editDialog.material && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {t('shop.MATERIAL')}: <strong>{editDialog.material?.material?.nameZh} ({editDialog.material?.material?.nameEn})</strong>
              </Typography>
              <TextField
                fullWidth
                label={t('shop.UNIT_PRICE')}
                type="number"
                value={editDialog.newPrice}
                onChange={(e) =>
                  setEditDialog((prev) => ({ ...prev, newPrice: e.target.value }))
                }
                InputProps={{
                  startAdornment: <PriceIcon color="action" sx={{ mr: 1 }} />,
                  inputProps: { min: 0.01, step: 0.01 },
                }}
                helperText={t('shop.ENTER_PRICE')}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>{t('shop.CANCEL')}</Button>
          <Button onClick={handleUpdatePrice} variant="contained" color="primary">
            {t('shop.UPDATE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('shop.REMOVE_CONFIRM_TITLE')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('shop.REMOVE_CONFIRM_MESSAGE', { material: deleteConfirm?.material?.material?.nameZh || deleteConfirm?.material?.material?.nameEn })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t('shop.CANCEL')}</Button>
          <Button onClick={handleDeleteMaterial} variant="contained" color="error">
            {t('shop.REMOVE')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}