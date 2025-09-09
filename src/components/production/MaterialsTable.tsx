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
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TablePagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon,
  Nature as NatureIcon,
  Refresh as RefreshIcon,
  Factory as FactoryIcon
} from '@mui/icons-material';
import { RawMaterial, PaginationInfo } from '@/types/rawMaterialProduction';
import rawMaterialProductionService from '@/lib/services/rawMaterialProductionService';
import ProductionModal from './ProductionModal';

interface MaterialsTableProps {
  facilityId?: string;
  facilityType?: string;
  onSelectMaterial?: (material: RawMaterial) => void;
  selectedMaterialId?: number;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  facilityId,
  facilityType,
  onSelectMaterial,
  selectedMaterialId
}) => {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrevious: false
  });
  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');

  useEffect(() => {
    loadMaterials();
  }, [facilityType, selectedOrigin, page, rowsPerPage]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await rawMaterialProductionService.getRawMaterials({
        origin: selectedOrigin || facilityType || undefined,
        page: page + 1,
        limit: rowsPerPage
      });

      if (response.data) {
        setMaterials(response.data.materials || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: rowsPerPage,
          hasNext: false,
          hasPrevious: false
        });
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOriginChange = (event: any) => {
    setSelectedOrigin(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCost = (value: number) => {
    return value.toLocaleString();
  };

  const handleOpenProduction = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setSelectedFacilityId(''); // Reset facility selection
    setProductionModalOpen(true);
  };

  const handleCloseProduction = () => {
    setProductionModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleProductionSuccess = (result: any) => {
    // Refresh the materials list after successful production
    loadMaterials();
    // You can also show a success notification here
    console.log('Production successful:', result);
  };

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('production.materials.title')}</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('production.materials.origin')}</InputLabel>
              <Select
                value={selectedOrigin}
                onChange={handleOriginChange}
                label={t('production.materials.origin')}
              >
                <MenuItem value="">
                  <em>{t('common.all')}</em>
                </MenuItem>
                <MenuItem value="MINE">{t('production.origins.mine')}</MenuItem>
                <MenuItem value="QUARRY">{t('production.origins.quarry')}</MenuItem>
                <MenuItem value="FOREST">{t('production.origins.forest')}</MenuItem>
                <MenuItem value="FARM">{t('production.origins.farm')}</MenuItem>
                <MenuItem value="RANCH">{t('production.origins.ranch')}</MenuItem>
                <MenuItem value="FISHERY">{t('production.origins.fishery')}</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={loadMaterials} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('production.materials.number')}</TableCell>
                    <TableCell>{t('production.materials.name')}</TableCell>
                    <TableCell align="center">{t('production.materials.origin')}</TableCell>
                    <TableCell align="center">{t('production.materials.water')}</TableCell>
                    <TableCell align="center">{t('production.materials.power')}</TableCell>
                    <TableCell align="center">{t('production.materials.gold')}</TableCell>
                    <TableCell align="center">{t('production.materials.totalCost')}</TableCell>
                    <TableCell align="center">{t('production.materials.carbon')}</TableCell>
                    <TableCell align="center">{t('production.materials.status')}</TableCell>
                    <TableCell align="center">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow
                      key={material.id}
                      hover
                      selected={selectedMaterialId === material.id}
                      onClick={() => onSelectMaterial?.(material)}
                      sx={{ cursor: onSelectMaterial ? 'pointer' : 'default' }}
                    >
                      <TableCell>{material.materialNumber}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {material.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={t(`production.origins.${material.origin.toLowerCase()}`)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <WaterIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {material.requirements?.water || material.waterRequired || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <PowerIcon fontSize="small" color="warning" />
                          <Typography variant="body2">
                            {material.requirements?.power || material.powerRequired || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <MoneyIcon fontSize="small" color="success" />
                          <Typography variant="body2">
                            {material.requirements?.gold || material.goldCost || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={formatCost(material.totalCost)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <NatureIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {material.carbonEmission}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={material.isActive ? t('common.active') : t('common.inactive')}
                          size="small"
                          color={material.isActive ? 'success' : 'default'}
                          variant={material.isActive ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={t('production.produce')}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenProduction(material)}
                            disabled={!material.isActive}
                          >
                            <FactoryIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {materials.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          {t('production.materials.noData')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={pagination.totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t('common.rowsPerPage')}
            />
          </>
        )}
      </Box>
      
      {/* Production Modal */}
      <ProductionModal
        open={productionModalOpen}
        onClose={handleCloseProduction}
        material={selectedMaterial}
        facilityId={selectedFacilityId}
        onFacilityChange={setSelectedFacilityId}
        onSuccess={handleProductionSuccess}
      />
    </Paper>
  );
};

export default MaterialsTable;