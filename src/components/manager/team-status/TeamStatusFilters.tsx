'use client';

import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import type { TeamListFilters } from '@/types/managerTeamStatus';

interface TeamStatusFiltersProps {
  filters: TeamListFilters;
  onFiltersChange: (filters: Partial<TeamListFilters>) => void;
  onClear: () => void;
}

/**
 * Reusable filter panel for team list
 */
export default function TeamStatusFilters({
  filters,
  onFiltersChange,
  onClear,
}: TeamStatusFiltersProps) {
  const { t } = useTranslation();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: event.target.value });
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    onFiltersChange({
      isOpen: value === '' ? undefined : value === 'open',
    });
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    onFiltersChange({
      sort: event.target.value as 'name' | 'createdAt' | 'goldBalance' | 'carbonBalance',
    });
  };

  const handleOrderChange = (event: SelectChangeEvent) => {
    onFiltersChange({ order: event.target.value as 'ASC' | 'DESC' });
  };

  const statusValue =
    filters.isOpen === undefined ? '' : filters.isOpen ? 'open' : 'closed';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <TextField
          placeholder={t('manager.teamStatus.filter.label.search')}
          value={filters.search}
          onChange={handleSearchChange}
          size="small"
          sx={{ flex: '1 1 250px', minWidth: 200 }}
        />

        {/* Team Status Filter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>
            {t('manager.teamStatus.filter.label.status')}
          </InputLabel>
          <Select
            value={statusValue}
            onChange={handleStatusChange}
            label={t('manager.teamStatus.filter.label.status')}
          >
            <MenuItem value="">
              {t('manager.teamStatus.filter.option.allStatus')}
            </MenuItem>
            <MenuItem value="open">
              {t('manager.teamStatus.filter.option.open')}
            </MenuItem>
            <MenuItem value="closed">
              {t('manager.teamStatus.filter.option.closed')}
            </MenuItem>
          </Select>
        </FormControl>

        {/* Sort By */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>
            {t('manager.teamStatus.filter.label.sortBy')}
          </InputLabel>
          <Select
            value={filters.sort}
            onChange={handleSortChange}
            label={t('manager.teamStatus.filter.label.sortBy')}
          >
            <MenuItem value="name">
              {t('manager.teamStatus.table.header.teamName')}
            </MenuItem>
            <MenuItem value="createdAt">
              {t('manager.teamStatus.table.header.createdAt')}
            </MenuItem>
            <MenuItem value="goldBalance">
              {t('manager.teamStatus.table.header.goldBalance')}
            </MenuItem>
            <MenuItem value="carbonBalance">
              {t('manager.teamStatus.table.header.carbonBalance')}
            </MenuItem>
          </Select>
        </FormControl>

        {/* Order */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>
            {t('manager.teamStatus.filter.label.order')}
          </InputLabel>
          <Select
            value={filters.order}
            onChange={handleOrderChange}
            label={t('manager.teamStatus.filter.label.order')}
          >
            <MenuItem value="ASC">
              {t('manager.teamStatus.filter.option.ascending')}
            </MenuItem>
            <MenuItem value="DESC">
              {t('manager.teamStatus.filter.option.descending')}
            </MenuItem>
          </Select>
        </FormControl>

        {/* Clear Filters Button */}
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={onClear}
          size="small"
        >
          {t('manager.teamStatus.action.clearFilter')}
        </Button>
      </Box>
    </Paper>
  );
}