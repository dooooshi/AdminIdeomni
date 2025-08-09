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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Shield as ShieldIcon,
  Person as PersonIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import AdminService, { Admin, AdminListParams, AdminSearchResponseDto } from '@/lib/services/adminService';

interface AdminListProps {
  onCreateAdmin: () => void;
  onEditAdmin: (admin: Admin) => void;
  onViewLogs: (admin: Admin) => void;
}

interface AdminListFilter {
  search: string;
  role: string;
  status: string;
  sortBy: 'username' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

const AdminList: React.FC<AdminListProps> = ({
  onCreateAdmin,
  onEditAdmin,
  onViewLogs,
}) => {
  const { t } = useTranslation('adminManagement');
  const theme = useTheme();
  const [adminData, setAdminData] = useState<AdminSearchResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0); // Material-UI uses 0-based pagination
  const [pageSize, setPageSize] = useState(20);
  
  // Filters state
  const [filters, setFilters] = useState<AdminListFilter>({
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Debounced search to avoid too many API calls
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadAdmins = async (params?: Partial<AdminListParams>) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: AdminListParams = {
        page: page + 1, // Convert to 1-based pagination for API
        pageSize,
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...params
      };

      const data = await AdminService.getAdminList(requestParams);
      setAdminData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ADMIN_LOAD_ERROR'));
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    loadAdmins();
  }, [page, pageSize, filters.role, filters.status, filters.sortBy, filters.sortOrder, filters.search]);

  // Handle search with debouncing - only trigger when user actually types
  useEffect(() => {
    // Skip if searchValue is empty on initial load
    if (!searchValue) {
      return;
    }

    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue }));
      setPage(0); // Reset to first page when searching
    }, 500);

    setSearchDebounceTimeout(timeout);

    return () => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
    };
  }, [searchValue]);

  const handleFilterChange = (field: keyof AdminListFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleSortChange = (field: 'username' | 'email' | 'createdAt' | 'updatedAt') => {
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

  const handleDeleteClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;

    try {
      setDeleting(true);
      await AdminService.deleteAdmin(adminToDelete.id);
      await loadAdmins(); // Reload the current page
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ADMIN_DELETE_ERROR'));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAdminToDelete(null);
  };

  const getAdminTypeColor = (admin: Admin) => {
    // Handle both new role field and legacy adminType field
    const type = admin.adminType || (admin.role === 'super_admin' ? 1 : 2);
    return type === 1 ? 'error' : 'primary';
  };

  const getStatusColor = (admin: Admin) => {
    // Handle both new status field and legacy isActive field
    const isActive = admin.isActive !== undefined ? admin.isActive : admin.status === 'active';
    return isActive ? 'success' : 'default';
  };

  const getAdminTypeName = (admin: Admin) => {
    // Handle both new role field and legacy adminType field
    if (admin.adminType !== undefined) {
      return admin.adminType === 1 ? t('SUPER_ADMIN') : t('LIMITED_ADMIN');
    }
    return admin.role === 'super_admin' ? t('SUPER_ADMIN') : t('LIMITED_ADMIN');
  };

  const getStatusName = (admin: Admin) => {
    // Handle both new status field and legacy isActive field
    if (admin.isActive !== undefined) {
      return admin.isActive ? t('ACTIVE') : t('INACTIVE');
    }
    return admin.status === 'active' ? t('ACTIVE') : t('INACTIVE');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const admins = adminData?.data || [];
  const totalCount = adminData?.total || 0;

  // Stats calculations
  const stats = useMemo(() => {
    if (!adminData) return { total: 0, superAdmins: 0, limitedAdmins: 0, active: 0 };
    
    return {
      total: adminData.total,
      superAdmins: admins.filter(admin => 
        admin.adminType === 1 || admin.role === 'super_admin'
      ).length,
      limitedAdmins: admins.filter(admin => 
        admin.adminType === 2 || admin.role === 'admin'
      ).length,
      active: admins.filter(admin => 
        admin.isActive !== undefined ? admin.isActive : admin.status === 'active'
      ).length
    };
  }, [adminData, admins]);

  if (loading && !adminData) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('LOADING_ADMINS')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          {t('ADMIN_MANAGEMENT')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateAdmin}
        >
          {t('CREATE_ADMIN')}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder={t('SEARCH_PLACEHOLDER')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              fullWidth
              sx={{ maxWidth: { md: 400 } }}
            />
            
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>{t('FILTER_BY_ROLE')}</InputLabel>
              <Select
                value={filters.role}
                label={t('FILTER_BY_ROLE')}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="">{t('ALL_ROLES')}</MenuItem>
                <MenuItem value="super_admin">{t('SUPER_ADMIN')}</MenuItem>
                <MenuItem value="admin">{t('LIMITED_ADMIN')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('FILTER_BY_STATUS')}</InputLabel>
              <Select
                value={filters.status}
                label={t('FILTER_BY_STATUS')}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">{t('ALL_STATUSES')}</MenuItem>
                <MenuItem value="active">{t('ACTIVE')}</MenuItem>
                <MenuItem value="inactive">{t('INACTIVE')}</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadAdmins()}
              size="small"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : t('REFRESH_DATA')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip
            icon={<PersonIcon />}
            label={`${stats.total} ${t('TOTAL_ADMINS')}`}
            variant="outlined"
          />
          <Chip
            icon={<ShieldIcon />}
            label={`${stats.superAdmins} ${t('SUPER_ADMINS')}`}
            color="error"
            variant="outlined"
          />
          <Chip
            icon={<PersonIcon />}
            label={`${stats.limitedAdmins} ${t('LIMITED_ADMINS')}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${stats.active} ${t('ACTIVE_ADMINS')}`}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={filters.sortBy === 'username'}
                  direction={filters.sortBy === 'username' ? filters.sortOrder : 'asc'}
                  onClick={() => handleSortChange('username')}
                >
                  {t('ADMIN')}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t('ADMIN_TYPE')}</TableCell>
              <TableCell>{t('STATUS')}</TableCell>
              <TableCell>{t('LAST_LOGIN')}</TableCell>
              <TableCell>
                <TableSortLabel
                  active={filters.sortBy === 'createdAt'}
                  direction={filters.sortBy === 'createdAt' ? filters.sortOrder : 'asc'}
                  onClick={() => handleSortChange('createdAt')}
                >
                  {t('CREATED_AT')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">{t('ACTIONS')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {filters.search || filters.role || filters.status
                      ? t('NO_ADMINS_FOUND')
                      : t('NO_ADMINS_FOUND')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {admin.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {admin.email}
                      </Typography>
                      {(admin.firstName || admin.lastName) && (
                        <Typography variant="caption" color="text.secondary">
                          {[admin.firstName, admin.lastName].filter(Boolean).join(' ')}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getAdminTypeName(admin)}
                      color={getAdminTypeColor(admin)}
                      size="small"
                      icon={getAdminTypeColor(admin) === 'error' ? <ShieldIcon /> : <PersonIcon />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getStatusName(admin)}
                      color={getStatusColor(admin)}
                      size="small"
                      variant={getStatusColor(admin) === 'success' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {admin.lastLoginAt 
                        ? formatDate(admin.lastLoginAt)
                        : t('NEVER')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(admin.createdAt)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title={t('VIEW_LOGS')}>
                        <IconButton
                          size="small"
                          onClick={() => onViewLogs(admin)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={t('EDIT_ADMIN')}>
                        <IconButton
                          size="small"
                          onClick={() => onEditAdmin(admin)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={t('DELETE_ADMIN')}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(admin)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
          showFirstButton
          showLastButton
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('DELETE_ADMIN_TITLE')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {t('DELETE_ADMIN_MESSAGE')}
          </Typography>
          {adminToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">{adminToDelete.username}</Typography>
              <Typography variant="body2" color="text.secondary">
                {adminToDelete.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getAdminTypeName(adminToDelete)}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('DELETE_ADMIN_WARNING')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            {t('DELETE_ADMIN_CANCEL')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? t('LOADING') : t('DELETE_ADMIN_CONFIRM')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminList; 