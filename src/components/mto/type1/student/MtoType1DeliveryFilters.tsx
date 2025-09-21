'use client';

import React from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { DeliveryFilters, DeliverySettlementStatus } from '@/lib/types/mtoType1';

interface MtoType1DeliveryFiltersProps {
  filters: DeliveryFilters;
  onFiltersChange: (filters: DeliveryFilters) => void;
  onApply: () => void;
  onClear: () => void;
  requirements?: Array<{ id: number; name: string }>;
  tiles?: Array<{ id: string; name: string }>;
}

const deliveryStatuses: DeliverySettlementStatus[] = [
  'PENDING',
  'VALIDATED',
  'PARTIALLY_SETTLED',
  'FULLY_SETTLED',
  'REJECTED'
];

export default function MtoType1DeliveryFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  requirements = [],
  tiles = []
}: MtoType1DeliveryFiltersProps) {
  const { t } = useTranslation();
  // Removed expanded state - filters always visible

  const handleStatusChange = (status: DeliverySettlementStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handleDateFromChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateFrom: date ? date.toISOString().split('T')[0] : undefined
    });
  };

  const handleDateToChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateTo: date ? date.toISOString().split('T')[0] : undefined
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: event.target.value || undefined
    });
  };

  const handleRequirementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      mtoType1Id: value ? Number(value) : undefined
    });
  };

  const handleTileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      tileId: value || undefined
    });
  };

  const handleSettlementStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      settlementStatus: value as 'settled' | 'unsettled' | 'mixed' | undefined
    });
  };

  const activeFiltersCount = [
    filters.status?.length,
    filters.mtoType1Id,
    filters.tileId,
    filters.dateFrom,
    filters.dateTo,
    filters.settlementStatus
  ].filter(Boolean).length;

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={2}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder={t('mto.student.deliveries.filters.searchPlaceholder')}
          value={filters.searchQuery || ''}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onFiltersChange({ ...filters, searchQuery: undefined })}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Quick Status Filters */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon fontSize="small" color="action" />
          {deliveryStatuses.map((status) => (
            <Chip
              key={status}
              label={t(`mto.student.deliveries.status.${status.toLowerCase().replace('_', '')}`)}
              onClick={() => handleStatusChange(status)}
              color={filters.status?.includes(status) ? 'primary' : 'default'}
              variant={filters.status?.includes(status) ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Stack>

        {/* Filters */}
        <Box>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {/* MTO Requirement Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label={t('mto.student.deliveries.filters.requirement')}
                value={filters.mtoType1Id || ''}
                onChange={handleRequirementChange}
                size="small"
              >
                <MenuItem value="">
                  <em>{t('mto.student.deliveries.filters.all')}</em>
                </MenuItem>
                {requirements.map((req) => (
                  <MenuItem key={req.id} value={req.id}>
                    {req.name || `Requirement #${req.id}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Tile Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label={t('mto.student.deliveries.filters.tile')}
                value={filters.tileId || ''}
                onChange={handleTileChange}
                size="small"
              >
                <MenuItem value="">
                  <em>{t('mto.student.deliveries.filters.all')}</em>
                </MenuItem>
                {tiles.map((tile) => (
                  <MenuItem key={tile.id} value={tile.id}>
                    {tile.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Settlement Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label={t('mto.student.deliveries.filters.settlementStatus')}
                value={filters.settlementStatus || ''}
                onChange={handleSettlementStatusChange}
                size="small"
              >
                <MenuItem value="">
                  <em>{t('mto.student.deliveries.filters.all')}</em>
                </MenuItem>
                <MenuItem value="settled">{t('mto.student.deliveries.filters.fullySettled')}</MenuItem>
                <MenuItem value="unsettled">{t('mto.student.deliveries.filters.unsettled')}</MenuItem>
                <MenuItem value="mixed">{t('mto.student.deliveries.filters.mixed')}</MenuItem>
              </TextField>
            </Grid>

            {/* Date Type Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label={t('mto.student.deliveries.filters.dateType')}
                value={filters.dateType || 'delivered'}
                onChange={(e) => onFiltersChange({ ...filters, dateType: e.target.value as 'delivered' | 'settled' })}
                size="small"
              >
                <MenuItem value="delivered">{t('mto.student.deliveries.filters.deliveryDate')}</MenuItem>
                <MenuItem value="settled">{t('mto.student.deliveries.filters.settlementDate')}</MenuItem>
              </TextField>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('mto.student.deliveries.filters.from')}
                  value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                  onChange={handleDateFromChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('mto.student.deliveries.filters.to')}
                  value={filters.dateTo ? new Date(filters.dateTo) : null}
                  onChange={handleDateToChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Amount Range */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label={t('mto.student.deliveries.filters.minAmount')}
                value={filters.minAmount || ''}
                onChange={(e) => onFiltersChange({ ...filters, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label={t('mto.student.deliveries.filters.maxAmount')}
                value={filters.maxAmount || ''}
                onChange={(e) => onFiltersChange({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onClear}
            disabled={activeFiltersCount === 0 && !filters.searchQuery}
          >
            {t('mto.student.deliveries.filters.clearAll')}
          </Button>
          <Button
            variant="contained"
            onClick={onApply}
            startIcon={<FilterIcon />}
          >
            {t('mto.student.deliveries.filters.apply')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}