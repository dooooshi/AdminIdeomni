'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  Avatar,
  Checkbox,
  TablePagination,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  SwapHoriz as SwapHorizIcon,
  History as HistoryIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import AdminUserActivityService, {
  UserWithActivityDto,
  PaginationResult,
  UserActivityStatus,
} from '@/lib/services/adminUserActivityService';

interface UserTableProps {
  users: PaginationResult<UserWithActivityDto> | null;
  selectedUsers: string[];
  page: number;
  pageSize: number;
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onPageChange: (event: unknown, newPage: number) => void;
  onPageSizeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAssignUser: (user: UserWithActivityDto) => void;
  onTransferUser: (user: UserWithActivityDto) => void;
  onRemoveUser: (user: UserWithActivityDto) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  page,
  pageSize,
  onSelectUser,
  onSelectAll,
  onPageChange,
  onPageSizeChange,
  onAssignUser,
  onTransferUser,
  onRemoveUser,
}) => {
  const { t } = useTranslation();

  const getUserTypeTranslationKey = (userType: number): string => {
    switch (userType) {
      case 1: return 'MANAGER';
      case 2: return 'WORKER'; 
      case 3: return 'STUDENT';
      default: return 'UNKNOWN';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const getStatusIcon = (status: UserActivityStatus) => {
    switch (status) {
      case UserActivityStatus.ENROLLED:
        return <ScheduleIcon fontSize="small" />;
      case UserActivityStatus.COMPLETED:
        return <CheckCircleIcon fontSize="small" />;
      case UserActivityStatus.CANCELLED:
        return <CancelIcon fontSize="small" />;
      case UserActivityStatus.NO_SHOW:
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const canAssignUser = (userWithActivity: UserWithActivityDto) => {
    return !userWithActivity.currentActivity;
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={users?.data.length > 0 && selectedUsers.length === users?.data.length}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < (users?.data.length || 0)}
                  onChange={onSelectAll}
                />
              </TableCell>
              <TableCell>{t('activityManagement.USER')}</TableCell>
              <TableCell>{t('activityManagement.USER_TYPE')}</TableCell>
              <TableCell>{t('activityManagement.CURRENT_ACTIVITY')}</TableCell>
              <TableCell>{t('activityManagement.CURRENT_TEAM')}</TableCell>
              <TableCell>{t('activityManagement.STATUS')}</TableCell>
              <TableCell>{t('activityManagement.ASSIGNED_AT')}</TableCell>
              <TableCell>{t('activityManagement.ACTIONS')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Stack spacing={2} alignItems="center">
                    <PersonIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      {t('activityManagement.NO_USERS_FOUND')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('activityManagement.TRY_ADJUSTING_FILTERS')}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              users?.data.map((userWithActivity) => (
                <TableRow key={userWithActivity.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(userWithActivity.id)}
                      onChange={() => onSelectUser(userWithActivity.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {AdminUserActivityService.formatUserDisplayName(userWithActivity)?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {AdminUserActivityService.formatUserDisplayName(userWithActivity) || t('activityManagement.UNKNOWN')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userWithActivity.email || t('activityManagement.NO_EMAIL')}
                        </Typography>
                        {!userWithActivity.isActive && (
                          <Chip
                            label={t('activityManagement.ACTIVITY_STATUS_INACTIVE')}
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(getUserTypeTranslationKey(userWithActivity.userType))}
                      color={AdminUserActivityService.getUserTypeColor(userWithActivity.userType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentActivity ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {userWithActivity.currentActivity.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userWithActivity.currentActivity.activityType}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip
                        label={t('activityManagement.UNASSIGNED')}
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentTeam ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {userWithActivity.currentTeam.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userWithActivity.currentTeam.isLeader ? t('activityManagement.TEAM_LEADER') : t('activityManagement.TEAM_MEMBER')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('activityManagement.NO_TEAM')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentActivity ? (
                      <Chip
                        icon={getStatusIcon(userWithActivity.currentActivity.status)}
                        label={t(userWithActivity.currentActivity.status)}
                        color={AdminUserActivityService.getStatusColor(userWithActivity.currentActivity.status)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('activityManagement.N_A')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {userWithActivity.currentActivity ? (
                      <Typography variant="body2">
                        {formatDate(userWithActivity.currentActivity.enrolledAt)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('activityManagement.N_A')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {canAssignUser(userWithActivity) ? (
                        <Tooltip title={t('activityManagement.ASSIGN_TO_ACTIVITY')}>
                          <IconButton
                            size="small"
                            onClick={() => onAssignUser(userWithActivity)}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title={t('activityManagement.TRANSFER_TO_ANOTHER_ACTIVITY')}>
                            <IconButton
                              size="small"
                              onClick={() => onTransferUser(userWithActivity)}
                            >
                              <SwapHorizIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('activityManagement.REMOVE_FROM_ACTIVITY')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onRemoveUser(userWithActivity)}
                            >
                              <PersonRemoveIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title={t('activityManagement.VIEW_USER_HISTORY')}>
                        <IconButton
                          size="small"
                          onClick={() => {/* TODO: Open user history */}}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('activityManagement.SEND_EMAIL')}>
                        <IconButton
                          size="small"
                          onClick={() => window.open(`mailto:${userWithActivity.email}`, '_blank')}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {users && users.total > 0 && (
        <TablePagination
          component="div"
          count={users.total}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={onPageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      )}
    </>
  );
};

export default UserTable;