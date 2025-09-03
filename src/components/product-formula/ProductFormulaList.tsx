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
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Factory as FactoryIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { ProductFormula } from '@/lib/types/productFormula';
import ProductFormulaService from '@/lib/services/productFormulaService';

interface ProductFormulaListProps {
  onCreateClick: () => void;
  onViewClick: (formula: ProductFormula) => void;
  refresh?: number;
}

const ProductFormulaList: React.FC<ProductFormulaListProps> = ({
  onCreateClick,
  onViewClick,
  refresh = 0
}) => {
  const { t } = useTranslation();
  const [formulas, setFormulas] = useState<ProductFormula[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadFormulas();
  }, [page, rowsPerPage, refresh]);

  const loadFormulas = async () => {
    setLoading(true);
    try {
      const response = await ProductFormulaService.searchProductFormulas({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined
      });

      setFormulas(response.items || []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load formulas:', error);
      setFormulas([]);
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

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          size="small"
          placeholder={t('productFormula.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateClick}
        >
          {t('productFormula.createFormula')}
        </Button>
        <IconButton onClick={loadFormulas}>
          <RefreshIcon />
        </IconButton>
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
                  <TableCell>{t('productFormula.formulaNumber')}</TableCell>
                  <TableCell>{t('productFormula.productName')}</TableCell>
                  <TableCell>{t('productFormula.description')}</TableCell>
                  <TableCell align="center">{t('productFormula.materials')}</TableCell>
                  <TableCell align="center">{t('productFormula.craftCategories')}</TableCell>
                  <TableCell align="right">{t('productFormula.totalCost')}</TableCell>
                  <TableCell align="right">{t('productFormula.carbonEmission')}</TableCell>
                  <TableCell align="center">{t('productFormula.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formulas.map((formula) => (
                  <TableRow key={formula.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{formula.formulaNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formula.productName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {formula.productDescription || t('productFormula.noDescription')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<ScienceIcon />}
                        label={formula.materialCount || formula.materials?.length || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<FactoryIcon />}
                        label={formula.craftCategoryCount || formula.craftCategories?.length || 0}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formula.totalMaterialCost?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formula.productFormulaCarbonEmission?.toFixed(2) || formula.carbonEmission?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t('productFormula.view')}>
                        <IconButton
                          size="small"
                          onClick={() => onViewClick(formula)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {formulas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        {t('productFormula.noFormulas')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
      </TableContainer>
    </Box>
  );
};

export default ProductFormulaList;