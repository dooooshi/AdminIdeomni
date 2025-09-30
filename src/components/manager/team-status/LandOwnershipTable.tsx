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
import type { TeamLandOwnership, PaginationMeta } from '@/types/managerTeamStatus';
import PaginationControls from './PaginationControls';

interface LandOwnershipTableProps {
  landOwnership: TeamLandOwnership[];
  loading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

/**
 * Land ownership table component
 */
export default function LandOwnershipTable({
  landOwnership,
  loading = false,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: LandOwnershipTableProps) {
  const { t } = useTranslation();

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(6)].map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
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

  if (landOwnership.length === 0) {
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
                {t('manager.teamStatus.land.field.tileLocation')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.land.field.landType')}
              </TableCell>
              <TableCell align="right">
                {t('manager.teamStatus.land.field.ownedArea')}
              </TableCell>
              <TableCell align="right">
                {t('manager.teamStatus.land.field.totalInvestment')}
              </TableCell>
              <TableCell align="center">
                {t('manager.teamStatus.land.field.purchaseCount')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.land.field.firstPurchase')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {landOwnership.map((land) => (
              <TableRow key={land.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Tile #{land.tile.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({land.tile.q}, {land.tile.r})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={land.tile.landType} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {formatBalance(land.ownedArea)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    / {land.tile.totalArea}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body2" color="warning.main">
                      {formatBalance(land.totalGoldSpent)} G
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {formatBalance(land.totalCarbonSpent)} C
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={land.purchaseCount}
                    size="small"
                    color="info"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(land.firstPurchaseDate)}
                  </Typography>
                  {land.lastPurchaseDate !== land.firstPurchaseDate && (
                    <Typography variant="caption" color="text.secondary">
                      Last: {formatDate(land.lastPurchaseDate)}
                    </Typography>
                  )}
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