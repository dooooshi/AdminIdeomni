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
  IconButton,
  Tooltip,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { format } from 'date-fns';
import type { TeamSummary } from '@/types/managerTeamStatus';
import PaginationControls from './PaginationControls';

interface TeamListTableProps {
  teams: TeamSummary[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

/**
 * Team list table with pagination
 */
export default function TeamListTable({
  teams,
  loading = false,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: TeamListTableProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleViewDetails = (teamId: string) => {
    router.push(`/manager/team-status/${teamId}`);
  };

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

  if (teams.length === 0) {
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {t('manager.teamStatus.table.header.teamName')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.table.header.leader')}
              </TableCell>
              <TableCell align="center">
                {t('manager.teamStatus.table.header.members')}
              </TableCell>
              <TableCell align="right">
                {t('manager.teamStatus.table.header.goldBalance')}
              </TableCell>
              <TableCell align="right">
                {t('manager.teamStatus.table.header.carbonBalance')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.table.header.status')}
              </TableCell>
              <TableCell align="center">
                {t('manager.teamStatus.table.header.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow
                key={team.id}
                hover
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {team.name}
                    </Typography>
                    {team.description && (
                      <Typography variant="caption" color="text.secondary">
                        {team.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{team.leaderName}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={t('manager.teamStatus.table.cell.memberCount', {
                      current: team.memberCount,
                      max: team.maxMembers,
                    })}
                    size="small"
                    color={
                      team.memberCount >= team.maxMembers
                        ? 'success'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500} color="warning.main">
                    {formatBalance(team.goldBalance)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500} color="success.main">
                    {formatBalance(team.carbonBalance)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(
                      team.isOpen
                        ? 'manager.teamStatus.table.cell.openStatus'
                        : 'manager.teamStatus.table.cell.closedStatus'
                    )}
                    size="small"
                    color={team.isOpen ? 'success' : 'default'}
                    variant={team.isOpen ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip
                    title={t('manager.teamStatus.table.cell.viewDetails')}
                  >
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(team.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
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