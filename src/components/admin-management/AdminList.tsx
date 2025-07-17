'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import AdminService, { Admin } from '@/lib/services/adminService';

interface AdminListProps {
  onCreateAdmin: () => void;
  onEditAdmin: (admin: Admin) => void;
  onViewLogs: (admin: Admin) => void;
}

interface AdminListFilter {
  search: string;
  adminType: 'all' | '1' | '2';
  isActive: 'all' | 'true' | 'false';
}

const AdminList: React.FC<AdminListProps> = ({
  onCreateAdmin,
  onEditAdmin,
  onViewLogs,
}) => {
  const { t } = useTranslation('adminManagement');
  const theme = useTheme();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState<AdminListFilter>({
    search: '',
    adminType: 'all',
    isActive: 'all',
  });

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getAdminList();
      // Ensure we always set an array
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
      // Set empty array on error to prevent filter issues
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // Filter and search logic
  const filteredAdmins = useMemo(() => {
    if (!Array.isArray(admins)) {
      return [];
    }
    return admins.filter((admin) => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        admin.username.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower) ||
        (admin.firstName?.toLowerCase().includes(searchLower)) ||
        (admin.lastName?.toLowerCase().includes(searchLower));

      // Admin type filter
      const matchesAdminType = 
        filters.adminType === 'all' || 
        admin.adminType.toString() === filters.adminType;

      // Active status filter
      const matchesActive = 
        filters.isActive === 'all' || 
        admin.isActive.toString() === filters.isActive;

      return matchesSearch && matchesAdminType && matchesActive;
    });
  }, [admins, filters]);

  // Paginated data
  const paginatedAdmins = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredAdmins.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAdmins, page, rowsPerPage]);

  const handleFilterChange = (field: keyof AdminListFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filtering
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
      await loadAdmins(); // Reload the list
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAdminToDelete(null);
  };

  const getAdminTypeColor = (adminType: 1 | 2) => {
    return adminType === 1 ? 'error' : 'primary';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
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

  if (loading) {
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
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              fullWidth
              sx={{ maxWidth: { md: 400 } }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('FILTER_BY_TYPE')}</InputLabel>
              <Select
                value={filters.adminType}
                label={t('FILTER_BY_TYPE')}
                onChange={(e) => handleFilterChange('adminType', e.target.value)}
              >
                <MenuItem value="all">{t('ALL_TYPES')}</MenuItem>
                <MenuItem value="1">{t('SUPER_ADMIN')}</MenuItem>
                <MenuItem value="2">{t('LIMITED_ADMIN')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('FILTER_BY_STATUS')}</InputLabel>
              <Select
                value={filters.isActive}
                label={t('FILTER_BY_STATUS')}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <MenuItem value="all">{t('ALL_STATUSES')}</MenuItem>
                <MenuItem value="true">{t('ACTIVE')}</MenuItem>
                <MenuItem value="false">{t('INACTIVE')}</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadAdmins}
              size="small"
            >
              {t('REFRESH_DATA')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Chip
            icon={<PersonIcon />}
            label={`${filteredAdmins.length} ${t('TOTAL_ADMINS')}`}
            variant="outlined"
          />
          <Chip
            icon={<ShieldIcon />}
            label={`${filteredAdmins.filter(a => a.adminType === 1).length} ${t('SUPER_ADMINS')}`}
            color="error"
            variant="outlined"
          />
          <Chip
            icon={<PersonIcon />}
            label={`${filteredAdmins.filter(a => a.adminType === 2).length} ${t('LIMITED_ADMINS')}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${filteredAdmins.filter(a => a.isActive).length} ${t('ACTIVE_ADMINS')}`}
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
              <TableCell>{t('ADMIN')}</TableCell>
              <TableCell>{t('ADMIN_TYPE')}</TableCell>
              <TableCell>{t('STATUS')}</TableCell>
              <TableCell>{t('LAST_LOGIN')}</TableCell>
              <TableCell>{t('CREATED_AT')}</TableCell>
              <TableCell align="center">{t('ACTIONS')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {filters.search || filters.adminType !== 'all' || filters.isActive !== 'all'
                      ? t('NO_ADMINS_FOUND')
                      : t('NO_ADMINS_FOUND')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAdmins.map((admin) => (
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
                      label={admin.adminType === 1 ? t('SUPER_ADMIN') : t('LIMITED_ADMIN')}
                      color={getAdminTypeColor(admin.adminType)}
                      size="small"
                      icon={admin.adminType === 1 ? <ShieldIcon /> : <PersonIcon />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={admin.isActive ? t('ACTIVE') : t('INACTIVE')}
                      color={getStatusColor(admin.isActive)}
                      size="small"
                      variant={admin.isActive ? 'filled' : 'outlined'}
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
          count={filteredAdmins.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
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
                {adminToDelete.adminType === 1 ? t('SUPER_ADMIN') : t('LIMITED_ADMIN')}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('DELETE_ADMIN_MESSAGE')}
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