'use client';

import React from 'react';
import {
  Box,
  TablePagination,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import type { PaginationMeta } from '@/types/managerTeamStatus';

interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

/**
 * Reusable pagination controls component
 */
export default function PaginationControls({
  pagination,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50, 100],
}: PaginationControlsProps) {
  const { t } = useTranslation();

  const { page, limit, total, totalPages } = pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    onRowsPerPageChange(Number(event.target.value));
  };

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {/* Rows per page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('manager.teamStatus.pagination.rowsPerPage')}
        </Typography>
        <FormControl size="small">
          <Select
            value={limit}
            onChange={handleRowsPerPageChange}
            variant="outlined"
          >
            {rowsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Showing X-Y of Z */}
      <Typography variant="body2" color="text.secondary">
        {t('manager.teamStatus.pagination.showing', {
          start: startIndex,
          end: endIndex,
          total,
        })}
      </Typography>

      {/* Page navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('manager.teamStatus.pagination.page', {
            current: page,
            total: totalPages,
          })}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            title={t('manager.teamStatus.pagination.first')}
          >
            <FirstPage />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            title={t('manager.teamStatus.pagination.previous')}
          >
            <NavigateBefore />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            title={t('manager.teamStatus.pagination.next')}
          >
            <NavigateNext />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            title={t('manager.teamStatus.pagination.last')}
          >
            <LastPage />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}