'use client';

import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { format } from 'date-fns';
import type { TeamOperation, PaginationMeta } from '@/types/managerTeamStatus';
import PaginationControls from './PaginationControls';

interface OperationHistoryTableProps {
  operations: TeamOperation[];
  loading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

/**
 * Operation history table component
 */
export default function OperationHistoryTable({
  operations,
  loading = false,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: OperationHistoryTableProps) {
  const { t } = useTranslation();

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const getOperationTypeColor = (type: string): 'success' | 'error' | 'warning' | 'info' => {
    if (type.includes('IN') || type.includes('PRODUCTION') || type.includes('SALE')) {
      return 'success';
    }
    if (type.includes('OUT') || type.includes('PURCHASE') || type.includes('CONSUMPTION')) {
      return 'error';
    }
    if (type.includes('BUILD') || type.includes('UPGRADE')) {
      return 'warning';
    }
    return 'info';
  };

  if (loading) {
    return (
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(7)].map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (operations.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('manager.teamStatus.message.noData')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t('manager.teamStatus.operations.column.date')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.operations.column.type')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.operations.column.resource')}
              </TableCell>
              <TableCell align="right">
                {t('manager.teamStatus.operations.column.amount')}
              </TableCell>
              <TableCell align="right">
                {t('manager.teamStatus.operations.column.balance')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.operations.column.operator')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.operations.column.description')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operations.map((operation) => (
              <TableRow key={operation.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(operation.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(
                      `manager.teamStatus.operations.type.${operation.operationType}`
                    )}
                    size="small"
                    color={getOperationTypeColor(operation.operationType)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={operation.resourceType}
                    size="small"
                    color={
                      operation.resourceType === 'GOLD' ? 'warning' : 'success'
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={
                      operation.resourceType === 'GOLD'
                        ? 'warning.main'
                        : 'success.main'
                    }
                  >
                    {formatBalance(operation.amount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatBalance(operation.balanceBefore)} →
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color={
                        operation.resourceType === 'GOLD'
                          ? 'warning.main'
                          : 'success.main'
                      }
                    >
                      {formatBalance(operation.balanceAfter)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {operation.user?.username || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {operation.description || '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && onPageChange && onRowsPerPageChange && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Paper>
  );
}