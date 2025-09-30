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
  Avatar,
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { format } from 'date-fns';
import type { TeamMemberDetail, PaginationMeta } from '@/types/managerTeamStatus';
import PaginationControls from './PaginationControls';

interface TeamMembersTableProps {
  members: TeamMemberDetail[];
  loading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

/**
 * Team members table component
 */
export default function TeamMembersTable({
  members,
  loading = false,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: TeamMembersTableProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getUserInitials = (firstName: string | null, lastName: string | null, username: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
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

  if (members.length === 0) {
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
                {t('manager.teamStatus.members.column.username')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.members.column.email')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.members.column.userType')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.members.column.status')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.members.column.joinedAt')}
              </TableCell>
              <TableCell>
                {t('manager.teamStatus.members.column.lastLogin')}
              </TableCell>
              <TableCell align="center">Activity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member.id}
                hover
                sx={{
                  bgcolor: member.membership.isLeader
                    ? 'action.hover'
                    : 'transparent',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        bgcolor: member.membership.isLeader
                          ? 'warning.main'
                          : 'primary.main',
                      }}
                    >
                      {getUserInitials(
                        member.user.firstName,
                        member.user.lastName,
                        member.user.username
                      )}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {member.user.username}
                        </Typography>
                        {member.membership.isLeader && (
                          <Star fontSize="small" color="warning" />
                        )}
                      </Box>
                      {(member.user.firstName || member.user.lastName) && (
                        <Typography variant="caption" color="text.secondary">
                          {member.user.firstName} {member.user.lastName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{member.user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(
                      `manager.teamStatus.members.userType.${member.user.userType}`
                    )}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(
                      `manager.teamStatus.members.status.${member.membership.status}`
                    )}
                    size="small"
                    color={getStatusColor(member.membership.status)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(member.membership.joinedAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(member.user.lastLoginAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {member.statistics.operationsCount} ops
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {member.statistics.facilitiesBuiltCount} builds
                    </Typography>
                  </Box>
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