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
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { format } from 'date-fns';
import type { TeamFacility, PaginationMeta } from '@/types/managerTeamStatus';
import PaginationControls from './PaginationControls';

interface FacilitiesTableProps {
  facilities: TeamFacility[];
  loading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

/**
 * Facilities table component
 */
export default function FacilitiesTable({
  facilities,
  loading = false,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: FacilitiesTableProps) {
  const { t } = useTranslation();

  const formatBalance = (balance: string | null) => {
    if (!balance) return '-';
    return parseFloat(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'UNDER_CONSTRUCTION':
        return 'info';
      case 'MAINTENANCE':
        return 'warning';
      case 'DAMAGED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(8)].map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
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

  if (facilities.length === 0) {
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
              <TableCell>Type</TableCell>
              <TableCell align="center">Level</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Build Cost</TableCell>
              <TableCell align="center">Area</TableCell>
              <TableCell>Built By</TableCell>
              <TableCell align="center">Infrastructure</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facilities.map((facility) => (
              <TableRow key={facility.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {t(
                        `manager.teamStatus.facilities.type.${facility.facilityType}`
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {facility.facilityType}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`L${facility.level}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Tile #{facility.tile.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({facility.tile.q}, {facility.tile.r})
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(
                      `manager.teamStatus.facilities.status.${facility.status}`
                    )}
                    size="small"
                    color={getStatusColor(facility.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body2" color="warning.main">
                      {formatBalance(facility.buildGoldCost)} G
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {formatBalance(facility.buildCarbonCost)} C
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {facility.occupiedLandArea}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {facility.builtBy.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(facility.constructionStarted)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {facility.hasInfrastructureConnections ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle fontSize="small" color="success" />
                      <Typography variant="caption">
                        {facility.infrastructureConnectionCount}
                      </Typography>
                    </Box>
                  ) : (
                    <Cancel fontSize="small" color="disabled" />
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