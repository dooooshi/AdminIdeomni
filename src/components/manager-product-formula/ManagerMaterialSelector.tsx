'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  TablePagination,
  Paper,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { ManagerRawMaterial, ManagerProductFormulaMaterial } from '@/lib/types/managerProductFormula';
import ManagerProductFormulaService from '@/lib/services/managerProductFormulaService';

interface ManagerMaterialSelectorProps {
  materials: ManagerProductFormulaMaterial[];
  onChange: (materials: ManagerProductFormulaMaterial[]) => void;
  disabled?: boolean;
}

const ManagerMaterialSelector: React.FC<ManagerMaterialSelectorProps> = ({
  materials,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState<ManagerRawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    if (dialogOpen) {
      loadAvailableMaterials();
    }
  }, [dialogOpen, page, rowsPerPage]);

  const loadAvailableMaterials = async () => {
    setLoading(true);
    try {
      const response = await ManagerProductFormulaService.searchRawMaterials({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined
      });
      setAvailableMaterials(response.items);
      setTotalCount(response.pagination.total);
    } catch (error) {
      console.error('Failed to load raw materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadAvailableMaterials();
  };

  const handleAddMaterials = () => {
    const existingMaterialIds = new Set(materials.map(m => m.rawMaterialId));
    const newMaterials: ManagerProductFormulaMaterial[] = [];

    selectedMaterials.forEach(materialId => {
      if (!existingMaterialIds.has(materialId)) {
        const material = availableMaterials.find(m => m.id === materialId);
        if (material) {
          newMaterials.push({
            rawMaterialId: materialId,
            rawMaterial: material,
            quantity: quantities[materialId] || 1,
            unit: t('managerProductFormula.defaultUnit')
          });
        }
      }
    });

    onChange([...materials, ...newMaterials]);
    setDialogOpen(false);
    setSelectedMaterials(new Set());
    setQuantities({});
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = [...materials];
    newMaterials.splice(index, 1);
    onChange(newMaterials);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity >= 0.001 && quantity <= 9999.999) {
      const newMaterials = [...materials];
      newMaterials[index].quantity = quantity;
      onChange(newMaterials);
    }
  };

  const handleToggleMaterial = (materialId: number) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId);
    } else {
      newSelected.add(materialId);
    }
    setSelectedMaterials(newSelected);
  };

  const handleDialogQuantityChange = (materialId: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [materialId]: quantity
    }));
  };

  const getOriginColor = (origin: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      MINE: 'error',
      QUARRY: 'warning',
      FOREST: 'success',
      FARM: 'primary',
      RANCH: 'secondary',
      FISHERY: 'info',
      SHOPS: 'default'
    };
    return colorMap[origin] || 'default';
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="medium">
          {t('managerProductFormula.materials')} ({materials.length})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={disabled}
        >
          {t('managerProductFormula.addMaterials')}
        </Button>
      </Stack>

      {materials.length === 0 ? (
        <Box display="flex" justifyContent="center" py={4}>
          <Alert severity="info" sx={{ maxWidth: 400 }}>
            {t('managerProductFormula.noMaterialsAdded')}
          </Alert>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ border: '0.5px solid rgba(0, 0, 0, 0.12)' }}>
          <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)' } }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('managerProductFormula.materialNumber')}</TableCell>
                <TableCell>{t('managerProductFormula.materialName')}</TableCell>
                <TableCell>{t('managerProductFormula.origin')}</TableCell>
                <TableCell align="right">{t('managerProductFormula.quantity')}</TableCell>
                <TableCell align="right">{t('managerProductFormula.unitCost')}</TableCell>
                <TableCell align="right">{t('managerProductFormula.totalCost')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={`${material.rawMaterialId}-${index}`}>
                  <TableCell>#{material.rawMaterial?.materialNumber}</TableCell>
                  <TableCell>
                    {material.rawMaterial?.name || material.rawMaterial?.nameEn || material.rawMaterial?.nameZh}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={material.rawMaterial?.origin}
                      size="small"
                      color={getOriginColor(material.rawMaterial?.origin || '')}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={material.quantity}
                      onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                      size="small"
                      disabled={disabled}
                      inputProps={{
                        min: 0.001,
                        max: 9999.999,
                        step: 0.001,
                        style: { textAlign: 'right', width: 100 }
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${Number(material.rawMaterial?.totalCost || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${(material.quantity * Number(material.rawMaterial?.totalCost || 0)).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveMaterial(index)}
                      disabled={disabled}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{t('managerProductFormula.selectMaterials')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('managerProductFormula.searchMaterials')}
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
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, border: '0.5px solid rgba(0, 0, 0, 0.12)' }}>
                <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">{t('common.select')}</TableCell>
                      <TableCell>{t('managerProductFormula.materialNumber')}</TableCell>
                      <TableCell>{t('managerProductFormula.materialName')}</TableCell>
                      <TableCell>{t('managerProductFormula.origin')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.quantity')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.unitCost')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableMaterials.map((material) => {
                      const isSelected = selectedMaterials.has(material.id);
                      const isAdded = materials.some(m => m.rawMaterialId === material.id);

                      return (
                        <TableRow
                          key={material.id}
                          hover
                          selected={isSelected}
                          sx={{ opacity: isAdded ? 0.5 : 1 }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleMaterial(material.id)}
                              disabled={isAdded}
                            />
                          </TableCell>
                          <TableCell>#{material.materialNumber}</TableCell>
                          <TableCell>
                            {material.name || material.nameEn}
                            {isAdded && (
                              <Chip
                                label={t('managerProductFormula.alreadyAdded')}
                                size="small"
                                color="default"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={material.origin}
                              size="small"
                              color={getOriginColor(material.origin)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {isSelected && !isAdded && (
                              <TextField
                                type="number"
                                size="small"
                                value={quantities[material.id] || 1}
                                onChange={(e) => handleDialogQuantityChange(material.id, parseFloat(e.target.value))}
                                inputProps={{
                                  min: 0.001,
                                  max: 9999.999,
                                  step: 0.001,
                                  style: { width: 80 }
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">${Number(material.totalCost || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMaterials}
            disabled={selectedMaterials.size === 0}
          >
            {t('managerProductFormula.addSelected')} ({selectedMaterials.size})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerMaterialSelector;