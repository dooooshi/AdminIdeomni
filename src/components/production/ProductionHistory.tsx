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
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ProductionStatus, ProductionHistoryFilter } from '@/types/rawMaterialProduction';
import rawMaterialProductionService from '@/lib/services/rawMaterialProductionService';

interface ProductionHistoryProps {
  facilityId?: string;
  teamId?: string;
  limit?: number;
}

const ProductionHistory: React.FC<ProductionHistoryProps> = ({
  facilityId,
  teamId,
  limit = 20
}) => {
  const { t } = useTranslation();
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(limit);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductionStatus | ''>('');

  useEffect(() => {
    loadHistory();
  }, [page, rowsPerPage, statusFilter, facilityId, teamId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const filter: ProductionHistoryFilter = {
        facilityId,
        teamId,
        status: statusFilter || undefined,
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'producedAt',
        sortOrder: 'desc'
      };

      const response = await rawMaterialProductionService.getProductionHistory(filter);
      setProductions(response.data.productions);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      console.error('Failed to load production history:', error);
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status: ProductionStatus) => {
    return status === ProductionStatus.SUCCESS ? (
      <Chip
        icon={<SuccessIcon />}
        label={t('production.status.success')}
        color="success"
        size="small"
      />
    ) : (
      <Chip
        icon={<ErrorIcon />}
        label={t('production.status.failed')}
        color="error"
        size="small"
      />
    );
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return date;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('production.history')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder={t('production.search')}
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('production.status.label')}</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProductionStatus | '')}
              label={t('production.status.label')}
            >
              <MenuItem value="">
                <em>{t('common.all')}</em>
              </MenuItem>
              <MenuItem value={ProductionStatus.SUCCESS}>
                {t('production.status.success')}
              </MenuItem>
              <MenuItem value={ProductionStatus.FAILED}>
                {t('production.status.failed')}
              </MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={loadHistory} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
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
                  <TableCell align="center">{t('production.productionNumber')}</TableCell>
                  <TableCell align="center">{t('production.material')}</TableCell>
                  <TableCell align="center">{t('production.quantity')}</TableCell>
                  <TableCell align="center">{t('facilityManagement.FACILITY')}</TableCell>
                  <TableCell align="center">{t('production.totalCost')}</TableCell>
                  <TableCell align="center">{t('production.spaceUsed')}</TableCell>
                  <TableCell align="center">{t('production.status.label')}</TableCell>
                  <TableCell align="center">{t('production.producedAt')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {t('production.noHistory')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  productions.map((production) => (
                    <TableRow key={production.id} hover>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {production.productionNumber}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2">
                            {production.material.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{production.material.number}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {production.material.quantity}
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2">
                            {production.facility?.name || '-'}
                          </Typography>
                          {production.facility && (
                            <Typography variant="caption" color="text.secondary">
                              {t('facilityManagement.LEVEL')} {production.facility.level}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {production.totalCost}
                      </TableCell>
                      <TableCell align="center">
                        {production.spaceUsed}
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(production.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {formatDate(production.producedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </>
      )}
    </Paper>
  );
};

export default ProductionHistory;