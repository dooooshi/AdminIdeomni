'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Skeleton,
  Alert
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import {
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  KeyboardReturn as ReturnIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType1DeliverySummary, PaginationParams } from '@/lib/types/mtoType1';
import { format } from 'date-fns';

interface HeadCell {
  id: keyof MtoType1DeliverySummary | 'actions';
  label: string;
  numeric: boolean;
  sortable: boolean;
}

interface MtoType1DeliveryTableProps {
  deliveries: MtoType1DeliverySummary[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    rowsPerPage: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onViewDetails?: (deliveryId: string) => void;
  onRequestReturn?: (deliveryId: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function MtoType1DeliveryTable({
  deliveries,
  loading = false,
  error = null,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onViewDetails,
  onRequestReturn,
  sortBy = 'deliveredAt',
  sortOrder = 'desc'
}: MtoType1DeliveryTableProps) {
  const { t } = useTranslation();

  const headCells: HeadCell[] = [
    { id: 'deliveryNumber', label: t('mto.student.deliveries.table.deliveryNumber'), numeric: false, sortable: true },
    { id: 'mtoType1Name', label: t('mto.student.deliveries.table.requirementName'), numeric: false, sortable: true },
    { id: 'tile', label: t('mto.student.deliveries.table.tileName'), numeric: false, sortable: false },
    { id: 'deliveryStatus', label: t('mto.student.deliveries.table.status'), numeric: false, sortable: true },
    { id: 'quantities', label: t('mto.student.deliveries.table.delivered') + '/' + t('mto.student.deliveries.table.settled'), numeric: false, sortable: false },
    { id: 'deliveredAt', label: t('mto.student.deliveries.table.deliveredAt'), numeric: false, sortable: true },
    { id: 'actions', label: t('mto.student.deliveries.table.actions'), numeric: false, sortable: false }
  ];

  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    onSort?.(property, isAsc ? 'desc' : 'asc');
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'default';

    switch (status) {
      case 'FULLY_SETTLED':
        return 'success';
      case 'PARTIALLY_SETTLED':
        return 'warning';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
      case 'VALIDATED':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell key={headCell.id} align="center">
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} align="center">
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('mto.student.deliveries.empty.title')}
        </Typography>
        <Typography color="text.secondary">
          {t('mto.student.deliveries.empty.description')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align="center"
                  sortDirection={sortBy === headCell.id ? sortOrder : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={sortBy === headCell.id}
                      direction={sortBy === headCell.id ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                      sx={{ width: '100%', justifyContent: 'center' }}
                    >
                      {headCell.label}
                      {sortBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    <Box sx={{ textAlign: 'center', width: '100%' }}>{headCell.label}</Box>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow
                key={delivery.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" align="center">
                  <Typography fontWeight="medium">
                    #{delivery.deliveryNumber}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack alignItems="center">
                    <Typography variant="body2">
                      {delivery.mtoType1Name || '-'}
                    </Typography>
                    {delivery.mtoStatus && (
                      <Chip
                        label={t(`mto.type1.status.${delivery.mtoStatus.toLowerCase()}`)}
                        size="small"
                        variant="outlined"
                        sx={{ width: 'fit-content', mt: 0.5 }}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack alignItems="center">
                    <Typography variant="body2">{delivery.tile?.tileName || t('mto.student.deliveries.table.unknownTile')}</Typography>
                    {delivery.tile && (
                      <Typography variant="caption" color="text.secondary">
                        ({delivery.tile.axialQ}, {delivery.tile.axialR})
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  {delivery.deliveryStatus ? (
                    <Tooltip title={t(`mto.student.deliveries.tooltip.${delivery.deliveryStatus.toLowerCase().replace('_', '')}`)}>
                      <Chip
                        label={t(`mto.student.deliveries.status.${delivery.deliveryStatus.toLowerCase().replace('_', '')}`)}
                        color={getStatusColor(delivery.deliveryStatus)}
                        size="small"
                      />
                    </Tooltip>
                  ) : (
                    <Chip
                      label="Unknown"
                      color="default"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Stack alignItems="center">
                    <Typography variant="body2">
                      {delivery.quantities?.settled || 0}/{delivery.quantities?.delivered || 0}
                    </Typography>
                    {delivery.quantities?.unsettled > 0 && (
                      <Typography variant="caption" color="warning.main">
                        {delivery.quantities.unsettled} {t('mto.student.deliveries.table.unsettled')}
                      </Typography>
                    )}
                    {delivery.quantities?.rejected > 0 && (
                      <Typography variant="caption" color="error.main">
                        {delivery.quantities.rejected} {t('mto.student.deliveries.table.rejected')}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack alignItems="center">
                    {delivery.deliveredAt && (
                      <Typography variant="body2">
                        {formatDate(delivery.deliveredAt)}
                      </Typography>
                    )}
                    {delivery.settledAt && (
                      <Typography variant="caption" color="text.secondary">
                        {t('mto.student.deliveries.table.settled')}: {formatDate(delivery.settledAt)}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title={t('mto.student.deliveries.action.viewDetails')}>
                      <IconButton
                        size="small"
                        onClick={() => onViewDetails?.(delivery.id)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={(event, newPage) => onPageChange?.(newPage)}
          onRowsPerPageChange={(event) => onRowsPerPageChange?.(parseInt(event.target.value, 10))}
        />
      )}
    </Paper>
  );
}