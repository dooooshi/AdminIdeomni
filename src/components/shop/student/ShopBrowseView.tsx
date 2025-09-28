'use client';

import React, { useState, useEffect } from 'react';
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
  Chip,
  TablePagination,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/store';
import { fetchMaterials, selectMaterial } from '@/store/shopSlice';
import ShopService from '@/lib/services/shopService';
import PurchaseDialog from './PurchaseDialog';

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

export default function ShopBrowseView() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const shopState = useSelector((state: RootState) => state.shop);
  const materials = shopState?.materials || [];
  const materialsLoading = shopState?.materialsLoading || false;
  const materialsError = shopState?.materialsError || null;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMaterials(undefined));
  }, [dispatch]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePurchase = (material: any) => {
    dispatch(selectMaterial(material));
    setPurchaseDialogOpen(true);
  };

  const handleClosePurchaseDialog = () => {
    dispatch(selectMaterial(null));
    setPurchaseDialogOpen(false);
  };

  // Filter materials
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = searchTerm
      ? material.material.nameZh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.material.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.material.materialNumber?.toString().includes(searchTerm)
      : true;

    const matchesOrigin = originFilter
      ? material.material.origin === originFilter
      : true;

    return matchesSearch && matchesOrigin;
  });

  const paginatedMaterials = filteredMaterials.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (materialsLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>{t('shop.LOADING')}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (materialsError) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{materialsError}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('shop.BROWSE_MATERIALS')}
          </Typography>

          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder={t('shop.SEARCH_MATERIALS')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Origin</InputLabel>
              <Select
                value={originFilter}
                label="Origin"
                onChange={(e) => setOriginFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">{t('shop.ALL_ORIGINS')}</MenuItem>
                {['MINE', 'QUARRY', 'FOREST', 'FARM', 'RANCH', 'FISHERY', 'SHOPS'].map((origin) => (
                  <MenuItem key={origin} value={origin}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: originColors[origin],
                        }}
                      />
                      {t(`shop.ORIGIN_${origin}`)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Materials Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell align="center">Material #</TableCell>
                  <TableCell align="center">Origin</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMaterials.map((material) => {
                  const remaining = material.quantityToSell
                    ? material.quantityToSell - material.quantitySold
                    : null;
                  const isInStock = remaining === null || remaining > 0;

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
                            <Typography
                              variant="body2"
                              color={remaining > 0 ? 'textPrimary' : 'error'}
                            >
                              {remaining} units
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
                                  width: `${(remaining / material.quantityToSell) * 100}%`,
                                  height: '100%',
                                  bgcolor:
                                    remaining > material.quantityToSell * 0.5
                                      ? 'success.main'
                                      : remaining > material.quantityToSell * 0.2
                                      ? 'warning.main'
                                      : 'error.main',
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Chip label="Unlimited" size="small" color="success" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CartIcon />}
                          onClick={() => handlePurchase(material)}
                          disabled={!isInStock}
                        >
                          {isInStock ? 'Purchase' : 'Out of Stock'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredMaterials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        No materials available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredMaterials.length > 0 && (
            <TablePagination
              component="div"
              count={filteredMaterials.length}
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

      {/* Purchase Dialog */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onClose={handleClosePurchaseDialog}
      />
    </>
  );
}