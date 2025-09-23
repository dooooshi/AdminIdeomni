import React, { useState } from 'react';
import {
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Stack,
  Typography,
  SelectChangeEvent,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2SubmissionHistoryParams } from '@/lib/types/mtoType2';

interface Props {
  filters: MtoType2SubmissionHistoryParams;
  onFiltersChange: (filters: MtoType2SubmissionHistoryParams) => void;
}

export const MtoType2HistoryFilters: React.FC<Props> = ({ filters, onFiltersChange }) => {
  const { t } = useTranslation();

  const [localFilters, setLocalFilters] = useState<MtoType2SubmissionHistoryParams>(filters);
  const [fromDate, setFromDate] = useState<Date | null>(
    filters.fromDate ? new Date(filters.fromDate) : null
  );
  const [toDate, setToDate] = useState<Date | null>(
    filters.toDate ? new Date(filters.toDate) : null
  );

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setLocalFilters({
      ...localFilters,
      status: value as any
    });
  };

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    setLocalFilters({
      ...localFilters,
      sortBy: event.target.value as any
    });
  };

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({
      ...localFilters,
      sortOrder: event.target.value as 'asc' | 'desc'
    });
  };

  const handleFromDateChange = (date: Date | null) => {
    setFromDate(date);
    setLocalFilters({
      ...localFilters,
      fromDate: date ? date.toISOString() : undefined
    });
  };

  const handleToDateChange = (date: Date | null) => {
    setToDate(date);
    setLocalFilters({
      ...localFilters,
      toDate: date ? date.toISOString() : undefined
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: MtoType2SubmissionHistoryParams = {
      page: 1,
      limit: 10,
      sortBy: 'submittedAt',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    setFromDate(null);
    setToDate(null);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return localFilters.status ||
           localFilters.fromDate ||
           localFilters.toDate ||
           localFilters.mtoType2Id ||
           localFilters.facilityInstanceId;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle1" display="flex" alignItems="center">
            <FilterListIcon sx={{ mr: 1 }} />
            {t('mto.type2.history.filterOptions')}
          </Typography>
          {hasActiveFilters() && (
            <Chip
              label={t('mto.type2.history.activeFilters')}
              size="small"
              color="primary"
              onDelete={handleClearFilters}
            />
          )}
        </Box>

        <Grid container spacing={2} alignItems="center">
          {/* Status Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('mto.type2.history.filterByStatus')}</InputLabel>
              <Select
                value={localFilters.status || ''}
                onChange={handleStatusChange}
                label={t('mto.type2.history.filterByStatus')}
              >
                <MenuItem value="">
                  <em>{t('mto.type2.history.allStatuses')}</em>
                </MenuItem>
                <MenuItem value="PENDING">{t('mto.type2.history.statusPending')}</MenuItem>
                <MenuItem value="PARTIAL">{t('mto.type2.history.statusPartial')}</MenuItem>
                <MenuItem value="FULL">{t('mto.type2.history.statusFull')}</MenuItem>
                <MenuItem value="UNSETTLED">{t('mto.type2.history.statusUnsettled')}</MenuItem>
                <MenuItem value="RETURNED">{t('mto.type2.history.statusReturned')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} md={3}>
            <DatePicker
              label={t('mto.type2.history.fromDate')}
              value={fromDate}
              onChange={handleFromDateChange}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker
              label={t('mto.type2.history.toDate')}
              value={toDate}
              onChange={handleToDateChange}
              minDate={fromDate || undefined}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true
                }
              }}
            />
          </Grid>

          {/* MTO Type 2 ID */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label={t('mto.type2.history.mtoId')}
              type="number"
              value={localFilters.mtoType2Id || ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                mtoType2Id: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
          </Grid>

          {/* Sort Options */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('mto.type2.history.sortBy')}</InputLabel>
              <Select
                value={localFilters.sortBy || 'submittedAt'}
                onChange={handleSortByChange}
                label={t('mto.type2.history.sortBy')}
              >
                <MenuItem value="submittedAt">{t('mto.type2.history.sortBySubmittedAt')}</MenuItem>
                <MenuItem value="settlementTime">{t('mto.type2.history.sortBySettlementTime')}</MenuItem>
                <MenuItem value="unitPrice">{t('mto.type2.history.sortByUnitPrice')}</MenuItem>
                <MenuItem value="settledNumber">{t('mto.type2.history.sortBySettledNumber')}</MenuItem>
                <MenuItem value="totalValue">{t('mto.type2.history.sortByTotalValue')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
                {t('mto.type2.history.sortOrder')}
              </FormLabel>
              <RadioGroup
                row
                value={localFilters.sortOrder || 'desc'}
                onChange={handleSortOrderChange}
              >
                <FormControlLabel
                  value="desc"
                  control={<Radio size="small" />}
                  label={t('mto.type2.history.sortDescending')}
                />
                <FormControlLabel
                  value="asc"
                  control={<Radio size="small" />}
                  label={t('mto.type2.history.sortAscending')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleApplyFilters}
              >
                {t('mto.type2.history.applyFilters')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={!hasActiveFilters()}
              >
                {t('mto.type2.history.clearFilters')}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              {t('mto.type2.history.activeFiltersLabel')}:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {localFilters.status && (
                <Chip
                  size="small"
                  label={`Status: ${localFilters.status}`}
                  onDelete={() => setLocalFilters({ ...localFilters, status: undefined })}
                />
              )}
              {localFilters.fromDate && (
                <Chip
                  size="small"
                  label={`From: ${new Date(localFilters.fromDate).toLocaleDateString()}`}
                  onDelete={() => {
                    setFromDate(null);
                    setLocalFilters({ ...localFilters, fromDate: undefined });
                  }}
                />
              )}
              {localFilters.toDate && (
                <Chip
                  size="small"
                  label={`To: ${new Date(localFilters.toDate).toLocaleDateString()}`}
                  onDelete={() => {
                    setToDate(null);
                    setLocalFilters({ ...localFilters, toDate: undefined });
                  }}
                />
              )}
              {localFilters.mtoType2Id && (
                <Chip
                  size="small"
                  label={`MTO ID: ${localFilters.mtoType2Id}`}
                  onDelete={() => setLocalFilters({ ...localFilters, mtoType2Id: undefined })}
                />
              )}
            </Stack>
          </Box>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default MtoType2HistoryFilters;