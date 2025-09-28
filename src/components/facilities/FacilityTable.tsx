'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Box,
  Stack,
  TablePagination,
} from '@mui/material';
import {
  UpgradeOutlined,
  InfoOutlined,
  WarningAmberOutlined,
  EditOutlined,
} from '@mui/icons-material';
import type { TileFacilityInstance } from '@/types/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface FacilityTableProps {
  facilities: TileFacilityInstance[];
  onClick?: (facility: TileFacilityInstance) => void;
  onUpgrade?: (facility: TileFacilityInstance) => void;
  onViewDetails?: (facility: TileFacilityInstance) => void;
  onEdit?: (facility: TileFacilityInstance) => void;
  showActions?: boolean;
  loading?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FacilityTable: React.FC<FacilityTableProps> = ({
  facilities,
  onClick,
  onUpgrade,
  onViewDetails,
  onEdit,
  showActions = true,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useTranslation();
  const maxLevel = 4;

  const handleRowClick = (facility: TileFacilityInstance) => {
    if (onClick) {
      onClick(facility);
    }
  };

  return (
    <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '70vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {t('facilityManagement.FACILITY')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight={600}>
                  {t('facilityManagement.TILE')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight={600}>
                  {t('facilityManagement.LEVEL')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {t('facilityManagement.BUILDER')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight={600}>
                  {t('facilityManagement.BUILT_DATE')}
                </Typography>
              </TableCell>
              {showActions && (
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600}>
                    {t('common.ACTIONS')}
                  </Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {facilities.map((facility) => {
              const facilityIcon = StudentFacilityService.getFacilityIcon(facility.facilityType);
              const facilityName = t(`facilityManagement.FACILITY_TYPE_${facility.facilityType}`);
              const needsAttention = StudentFacilityService.needsAttention(facility);

              return (
                <TableRow
                  key={facility.id}
                  hover
                  onClick={() => handleRowClick(facility)}
                  sx={{
                    cursor: onClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    ...(needsAttention && {
                      borderLeft: '3px solid',
                      borderLeftColor: 'warning.main',
                    }),
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                        {facilityIcon}
                      </Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {facilityName}
                        </Typography>
                        {facility.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 200,
                            }}
                          >
                            {facility.description}
                          </Typography>
                        )}
                      </Box>
                      {needsAttention && (
                        <Tooltip title={t('facilityManagement.NEEDS_ATTENTION')}>
                          <WarningAmberOutlined
                            color="warning"
                            sx={{ fontSize: 16 }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{facility.tileId}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {facility.level} / {maxLevel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {facility.builder?.firstName || t('common.UNKNOWN')}{' '}
                      {facility.builder?.lastName || ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(facility.constructionStarted))}
                    </Typography>
                  </TableCell>
                  {showActions && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {onEdit && (
                          <Tooltip title={t('common.EDIT')}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(facility);
                              }}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' },
                              }}
                            >
                              <EditOutlined sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onUpgrade && facility.level < maxLevel && (
                          <Tooltip title={t('facilityManagement.UPGRADE')}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpgrade(facility);
                              }}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'success.main' },
                              }}
                            >
                              <UpgradeOutlined sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {facilities.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {t('facilityManagement.NO_FACILITIES_FOUND')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && onRowsPerPageChange && (
        <TablePagination
          component="div"
          count={totalCount || facilities.length}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      )}
    </Paper>
  );
};

export default FacilityTable;