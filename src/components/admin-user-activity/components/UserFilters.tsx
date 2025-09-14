'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  FormControlLabel,
  Switch,
} from '@mui/material';
import Grid2 from '@mui/material/GridLegacy';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { USER_TYPES, UserActivityStatus } from '@/lib/services/adminUserActivityService';
import { SearchFilters } from '../types';

interface UserFiltersProps {
  filters: SearchFilters;
  loading: boolean;
  selectedUsersCount: number;
  onFilterChange: (field: keyof SearchFilters, value: unknown) => void;
  onRefresh: () => void;
  onClearFilters: () => void;
  onBulkAssign: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  loading,
  selectedUsersCount,
  onFilterChange,
  onRefresh,
  onClearFilters,
  onBulkAssign,
}) => {
  const { t } = useTranslation();

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          {t('activityManagement.ADVANCED_USER_SEARCH')}
        </Typography>
        
        <Grid2 container spacing={2} alignItems="center">
          {/* Search Query */}
          <Grid2 item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('activityManagement.SEARCH_USERS')}
              value={filters.q}
              onChange={(e) => onFilterChange('q', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              placeholder={t('activityManagement.SEARCH_BY_NAME_EMAIL_USERNAME')}
            />
          </Grid2>

          {/* User Type Filter */}
          <Grid2 item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('activityManagement.USER_TYPE')}</InputLabel>
              <Select
                value={filters.userType}
                onChange={(e) => onFilterChange('userType', e.target.value)}
                label={t('activityManagement.USER_TYPE')}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">{t('activityManagement.ALL_TYPES')}</MenuItem>
                <MenuItem value={USER_TYPES.MANAGER}>{t('activityManagement.MANAGER')}</MenuItem>
                <MenuItem value={USER_TYPES.WORKER}>{t('activityManagement.WORKER')}</MenuItem>
                <MenuItem value={USER_TYPES.STUDENT}>{t('activityManagement.STUDENT')}</MenuItem>
              </Select>
            </FormControl>
          </Grid2>

          {/* Activity Status Filter */}
          <Grid2 item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('activityManagement.ACTIVITY_STATUS')}</InputLabel>
              <Select
                value={filters.activityStatus}
                onChange={(e) => onFilterChange('activityStatus', e.target.value)}
                label={t('activityManagement.ACTIVITY_STATUS')}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">{t('activityManagement.ALL_USERS')}</MenuItem>
                <MenuItem value="assigned">{t('activityManagement.ASSIGNED_USERS')}</MenuItem>
                <MenuItem value="unassigned">{t('activityManagement.UNASSIGNED_USERS')}</MenuItem>
              </Select>
            </FormControl>
          </Grid2>

          {/* Enrollment Status Filter */}
          <Grid2 item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('activityManagement.STATUS')}</InputLabel>
              <Select
                value={filters.enrollmentStatus}
                onChange={(e) => onFilterChange('enrollmentStatus', e.target.value)}
                label={t('activityManagement.STATUS')}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">{t('activityManagement.ALL_STATUSES')}</MenuItem>
                {Object.values(UserActivityStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          {/* Include Inactive Toggle */}
          <Grid2 item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.includeInactive}
                  onChange={(e) => onFilterChange('includeInactive', e.target.checked)}
                />
              }
              label={t('activityManagement.INCLUDE_INACTIVE')}
            />
          </Grid2>

          {/* Actions */}
          <Grid2 item xs={12} md={12} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                disabled={loading}
              >
                {t('activityManagement.REFRESH')}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                {t('activityManagement.CLEAR_FILTERS')}
              </Button>

              {selectedUsersCount > 0 && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={onBulkAssign}
                >
                  {t('activityManagement.BULK_ASSIGN')} ({selectedUsersCount})
                </Button>
              )}
            </Stack>
          </Grid2>
        </Grid2>
      </CardContent>
    </Card>
  );
};

export default UserFilters;