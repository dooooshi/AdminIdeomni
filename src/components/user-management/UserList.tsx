'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TablePagination,
  Stack,
  Card,
  CardContent,
  TableSortLabel,
  Checkbox,
  Collapse,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import UserService, { 
  AdminUserDetailsDto, 
  AdminUserSearchDto, 
  UserSearchResponseDto 
} from '@/lib/services/userService';

interface UserListProps {
  onCreateUser: () => void;
  onEditUser: (user: AdminUserDetailsDto) => void;
  onViewUser: (user: AdminUserDetailsDto) => void;
  onResetPassword: (user: AdminUserDetailsDto) => void;
  onBulkImport: () => void;
  refreshTrigger?: number;
}

interface UserListFilter extends AdminUserSearchDto {
  selectedUserIds: string[];
}

const UserList: React.FC<UserListProps> = ({
  onCreateUser,
  onEditUser,
  onViewUser,
  onResetPassword,
  onBulkImport,
  refreshTrigger,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [userData, setUserData] = useState<UserSearchResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserDetailsDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Filters state
  const [filters, setFilters] = useState<UserListFilter>({
    q: '',
    userType: undefined,
    isActive: undefined,
    hasActivities: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    selectedUserIds: [],
  });

  // Search debouncing
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadUsers = async (params?: Partial<AdminUserSearchDto>) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: AdminUserSearchDto = {
        page: page + 1,
        pageSize,
        q: filters.q || undefined,
        userType: filters.userType,
        isActive: filters.isActive,
        hasActivities: filters.hasActivities,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...params
      };

      const data = await UserService.searchUsers(requestParams);
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userList.USER_LOAD_ERROR'));
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, filters.userType, filters.isActive, filters.hasActivities, filters.sortBy, filters.sortOrder, filters.q, refreshTrigger]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchValue }));
      setPage(0);
    }, 500);

    setSearchDebounceTimeout(timeout);

    return () => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
    };
  }, [searchValue]);

  const handleFilterChange = (field: keyof UserListFilter, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
    setPage(0);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleDeleteClick = (user: AdminUserDetailsDto) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await UserService.deleteUser(userToDelete.id);
      await loadUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('userList.USER_DELETE_ERROR'));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    setFilters(prev => ({
      ...prev,
      selectedUserIds: selected
        ? [...prev.selectedUserIds, userId]
        : prev.selectedUserIds.filter(id => id !== userId)
    }));
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allUserIds = userData?.data.map(user => user.id) || [];
      setFilters(prev => ({ ...prev, selectedUserIds: allUserIds }));
    } else {
      setFilters(prev => ({ ...prev, selectedUserIds: [] }));
    }
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      userType: undefined,
      isActive: undefined,
      hasActivities: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      selectedUserIds: [],
    });
    setSearchValue('');
    setPage(0);
  };

  const getUserTypeIcon = (userType: number) => {
    switch (userType) {
      case 1: return <BusinessIcon fontSize="small" />;
      case 2: return <WorkIcon fontSize="small" />;
      case 3: return <SchoolIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const getUserTypeColor = (userType: number) => {
    switch (userType) {
      case 1: return 'info';
      case 2: return 'secondary';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const users = userData?.data || [];
  const totalCount = userData?.total || 0;
  const selectedCount = filters.selectedUserIds.length;
  const isAllSelected = selectedCount > 0 && selectedCount === users.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < users.length;

  return (
    <Box>
      {/* Header and Actions */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {t('userList.USERS')}
          </Typography>
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('userList.SHOWING_RESULTS', { 
                start: page * pageSize + 1,
                end: Math.min((page + 1) * pageSize, totalCount),
                total: totalCount
              })}
            </Typography>
          )}
        </Box>
        
        <Stack direction="row" spacing={1}>
          {selectedCount > 0 && (
            <Chip
              label={`${selectedCount} ${t('userList.SELECTED')}`}
              onDelete={() => setFilters(prev => ({ ...prev, selectedUserIds: [] }))}
              color="primary"
              size="small"
            />
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateUser}
            size="small"
          >
            {t('userList.CREATE_USER')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={onBulkImport}
            size="small"
          >
            {t('userList.BULK_IMPORT')}
          </Button>
          <IconButton onClick={() => loadUsers()} size="small">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder={t('userList.SEARCH_PLACEHOLDER')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
            </Grid>

            {/* Quick Filters */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('userList.USER_TYPE')}</InputLabel>
                <Select
                  value={filters.userType || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('userType', value ? Number(value) : undefined);
                  }}
                  label={t('userList.USER_TYPE')}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">{t('userList.ALL_TYPES')}</MenuItem>
                  <MenuItem value={1}>{t('userList.MANAGER')}</MenuItem>
                  <MenuItem value={2}>{t('userList.WORKER')}</MenuItem>
                  <MenuItem value={3}>{t('userList.STUDENT')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('userList.STATUS')}</InputLabel>
                <Select
                  value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                  onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                  label={t('userList.STATUS')}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">{t('userList.ALL_STATUSES')}</MenuItem>
                  <MenuItem value="true">{t('userList.ACTIVE')}</MenuItem>
                  <MenuItem value="false">{t('userList.INACTIVE')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filter Actions */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  size="small"
                >
                  {t('userList.ADVANCED_FILTERS')}
                </Button>
                <Button
                  onClick={clearFilters}
                  size="small"
                  color="secondary"
                >
                  {t('userList.CLEAR_FILTERS')}
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={showAdvancedFilters}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.hasActivities === true}
                      onChange={(e) => handleFilterChange('hasActivities', e.target.checked ? true : undefined)}
                    />
                  }
                  label={t('userList.HAS_ACTIVITIES')}
                />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'username'}
                    direction={filters.sortBy === 'username' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSortChange('username')}
                  >
                    {t('userList.USERNAME')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'email'}
                    direction={filters.sortBy === 'email' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSortChange('email')}
                  >
                    {t('userList.EMAIL')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('userList.FULL_NAME')}</TableCell>
                <TableCell>{t('userList.USER_TYPE')}</TableCell>
                <TableCell>{t('userList.STATUS')}</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'lastLoginAt'}
                    direction={filters.sortBy === 'lastLoginAt' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSortChange('lastLoginAt')}
                  >
                    {t('userList.LAST_LOGIN')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === 'createdAt'}
                    direction={filters.sortBy === 'createdAt' ? filters.sortOrder : 'asc'}
                    onClick={() => handleSortChange('createdAt')}
                  >
                    {t('userList.CREATED_AT')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('userList.ACTIONS')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      {t('userList.LOADING_USERS')}
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box py={4}>
                      <Typography variant="body1" color="text.secondary">
                        {t('userList.NO_RESULTS')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('userList.NO_RESULTS_MESSAGE')}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loading && users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={filters.selectedUserIds.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.username}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={getUserTypeIcon(user.userType)}
                      label={UserService.getUserTypeName(user.userType)}
                      color={getUserTypeColor(user.userType) as any}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={user.isActive ? t('userList.ACTIVE') : t('userList.INACTIVE')}
                      color={getStatusColor(user.isActive) as any}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('userList.NEVER')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t('userList.VIEW_USER')}>
                        <IconButton size="small" onClick={() => onViewUser(user)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('userList.EDIT_USER')}>
                        <IconButton size="small" onClick={() => onEditUser(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('userList.RESET_PASSWORD')}>
                        <IconButton size="small" onClick={() => onResetPassword(user)}>
                          <VpnKeyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('userList.DELETE_USER')}>
                        <IconButton size="small" onClick={() => handleDeleteClick(user)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {userData && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage={t('userList.ROWS_PER_PAGE')}
            showFirstButton
            showLastButton
          />
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t('userList.DELETE_USER_CONFIRM')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {userToDelete && (
              <>
                {t('userList.DELETE_USER_WARNING')}
                <br />
                <strong>{userToDelete.username} ({userToDelete.email})</strong>
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('userList.CANCEL')}</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting && <CircularProgress size={16} />}
          >
            {deleting ? t('userList.DELETING') : t('userList.DELETE')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default UserList; 