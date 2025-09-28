'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  LinearProgress,
  Dialog,
  DialogContent,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import StudentFacilitySpaceService from '@/lib/services/studentFacilitySpaceService';
import type {
  TeamFacilitySpaceOverviewResponse,
  FacilitySpaceDetailsResponse,
  TeamSpaceUtilizationResponse,
  FacilitySpaceTableRow,
  UtilizationSummaryTableRow,
  AlertsTableRow,
  SpaceAlertSeverity,
} from '@/types/studentFacilitySpace';
import { FacilityType } from '@/types/facilities';

export default function StudentFacilitySpacePage() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // State
  const [overviewData, setOverviewData] = useState<TeamFacilitySpaceOverviewResponse['data'] | null>(null);
  const [selectedFacilityDetails, setSelectedFacilityDetails] = useState<FacilitySpaceDetailsResponse['data'] | null>(null);
  const [facilityTableRows, setFacilityTableRows] = useState<FacilitySpaceTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const overview = await StudentFacilitySpaceService.getTeamFacilitySpaceOverview();
      setOverviewData(overview.data);
      
      if (overview.data?.facilities) {
        const tableRows = overview.data.facilities.map(f => 
          StudentFacilitySpaceService.transformToTableRow(f)
        );
        setFacilityTableRows(tableRows);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch facility details
  const fetchFacilityDetails = async (facilityInstanceId: string) => {
    try {
      const response = await StudentFacilitySpaceService.getFacilitySpaceDetails(facilityInstanceId);
      setSelectedFacilityDetails(response.data);
      setDetailsDialogOpen(true);
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilityTableRows.filter(row => {
      const matchesSearch = searchTerm === '' || 
        row.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [facilityTableRows, searchTerm]);

  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' 
        ? 'background.default' 
        : alpha(theme.palette.grey[50], 0.5),
      p: 4
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Minimal Header */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 300,
              letterSpacing: '-0.02em',
              mb: 1,
              color: 'text.primary'
            }}
          >
            {t('studentFacilitySpace.title')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 300
            }}
          >
            {t('studentFacilitySpace.subtitle')}
          </Typography>
        </Box>

        {/* Simplified Metrics */}
        {overviewData && (
          <Grid container spacing={3} sx={{ mb: 8 }}>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: '3rem',
                    fontWeight: 200,
                    lineHeight: 1,
                    mb: 1,
                    color: 'text.primary'
                  }}
                >
                  {overviewData.summary.totalFacilities}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 300
                  }}
                >
                  {t('studentFacilitySpace.metrics.totalFacilities')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: '3rem',
                    fontWeight: 200,
                    lineHeight: 1,
                    mb: 1,
                    color: 'text.primary'
                  }}
                >
                  {(overviewData.summary.totalSpaceCapacity / 1000).toFixed(0)}k
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 300
                  }}
                >
                  {t('studentFacilitySpace.metrics.totalCapacity')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: '3rem',
                    fontWeight: 200,
                    lineHeight: 1,
                    mb: 1,
                    color: 'text.primary'
                  }}
                >
                  {(overviewData.summary.totalSpaceUsed / 1000).toFixed(0)}k
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 300
                  }}
                >
                  {t('studentFacilitySpace.metrics.spaceUsed')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: '3rem',
                    fontWeight: 200,
                    lineHeight: 1,
                    mb: 1,
                    color: overviewData.summary.utilizationRate > 80 
                      ? theme.palette.error.main : overviewData.summary.utilizationRate > 60 
                      ? theme.palette.warning.main : theme.palette.success.main
                  }}
                >
                  {overviewData.summary.utilizationRate.toFixed(0)}%
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 300
                  }}
                >
                  {t('studentFacilitySpace.metrics.utilizationRate')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Simplified Table */}
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          {/* Search Bar */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('studentFacilitySpace.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: '1.25rem', color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  maxWidth: 400,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.background.paper, 0.5)
                      : alpha(theme.palette.grey[100], 0.5),
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                    },
                  }
                }}
              />
              <IconButton onClick={fetchData} sx={{ color: 'text.secondary' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Ultra Simple Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 400, 
                    color: 'text.secondary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 2,
                    fontSize: '0.875rem'
                  }}>
                    {t('studentFacilitySpace.table.facility')}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 400, 
                    color: 'text.secondary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 2,
                    fontSize: '0.875rem'
                  }}>
                    {t('TYPE')}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 400, 
                    color: 'text.secondary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 2,
                    fontSize: '0.875rem'
                  }}>
                    {t('studentFacilitySpace.table.level')}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 400, 
                    color: 'text.secondary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 2,
                    fontSize: '0.875rem'
                  }}>
                    {t('studentFacilitySpace.table.spaceUtilization')}
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 400, 
                    color: 'text.secondary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 2,
                    fontSize: '0.875rem'
                  }}>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFacilities
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow 
                      key={row.id} 
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                          cursor: 'pointer'
                        },
                        '& td': {
                          borderBottom: 1,
                          borderColor: theme.palette.divider
                        }
                      }}
                      onClick={() => fetchFacilityDetails(row.id)}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: row.facilityType === FacilityType.WAREHOUSE 
                              ? theme.palette.primary.main 
                              : theme.palette.secondary.main
                          }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.facilityName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          {StudentFacilitySpaceService.getFacilityTypeName(row.facilityType)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.level}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3, width: '35%' }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}
                            >
                              {row.usedSpace.toLocaleString()} / {row.totalSpace.toLocaleString()}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                color: row.utilizationRate > 80 
                                  ? theme.palette.error.main : row.utilizationRate > 60 
                                  ? theme.palette.warning.main : theme.palette.success.main
                              }}
                            >
                              {row.utilizationRate.toFixed(0)}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            height: 4, 
                            bgcolor: alpha(theme.palette.action.hover, 0.2),
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              height: '100%',
                              width: `${row.utilizationRate}%`,
                              bgcolor: row.utilizationRate > 80 
                                ? theme.palette.error.main : row.utilizationRate > 60 
                                ? theme.palette.warning.main : theme.palette.success.main,
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'primary.main',
                            fontSize: '0.875rem',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {t('studentFacilitySpace.actions.view')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Simple Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredFacilities.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={t('common.rowsPerPage')}
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              '& .MuiTablePagination-toolbar': {
                minHeight: 56
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
                color: 'text.secondary'
              }
            }}
          />
        </Paper>

        {/* Minimalist Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
            }
          }}
        >
          {selectedFacilityDetails && (
            <DialogContent sx={{ p: 0 }}>
              {/* Header */}
              <Box sx={{ 
                p: 4, 
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 300, mb: 1, color: 'text.primary' }}>
                    {selectedFacilityDetails.facilityName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {StudentFacilitySpaceService.getFacilityTypeName(selectedFacilityDetails.facilityType)} • Level {selectedFacilityDetails.facilityInfo.level}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setDetailsDialogOpen(false)}
                  sx={{ color: 'text.secondary' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Utilization Bar */}
              <Box sx={{ p: 4 }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {t('studentFacilitySpace.table.spaceUtilization')}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600,
                      color: selectedFacilityDetails.spaceMetrics.utilizationRate > 80 
                        ? theme.palette.error.main : selectedFacilityDetails.spaceMetrics.utilizationRate > 60 
                        ? theme.palette.warning.main : theme.palette.success.main
                    }}>
                      {selectedFacilityDetails.spaceMetrics.utilizationRate.toFixed(0)}%
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    height: 8, 
                    bgcolor: alpha(theme.palette.action.hover, 0.2),
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      height: '100%',
                      width: `${selectedFacilityDetails.spaceMetrics.utilizationRate}%`,
                      bgcolor: selectedFacilityDetails.spaceMetrics.utilizationRate > 80 
                        ? theme.palette.error.main : selectedFacilityDetails.spaceMetrics.utilizationRate > 60 
                        ? theme.palette.warning.main : theme.palette.success.main,
                      transition: 'width 0.3s ease'
                    }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                    {selectedFacilityDetails.spaceMetrics.usedSpace.toLocaleString()} / {selectedFacilityDetails.spaceMetrics.totalSpace.toLocaleString()} {t('rawMaterial.units')}
                  </Typography>
                </Box>

                {/* Simple Stats Grid */}
                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {t('studentFacilitySpace.details.available')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: 'text.primary' }}>
                      {selectedFacilityDetails.spaceMetrics.availableSpace.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {t('studentFacilitySpace.details.totalItems')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: 'text.primary' }}>
                      {selectedFacilityDetails.inventorySummary.totalItems}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {t('studentFacilitySpace.details.rawMaterials')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: 'text.primary' }}>
                      {selectedFacilityDetails.spaceMetrics.rawMaterialSpace.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {t('studentFacilitySpace.details.products')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: 'text.primary' }}>
                      {selectedFacilityDetails.spaceMetrics.productSpace.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Inventory Items */}
                {selectedFacilityDetails.inventorySummary.topItemsBySpace && 
                 selectedFacilityDetails.inventorySummary.topItemsBySpace.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                      {t('studentFacilitySpace.details.inventoryDetails')}
                    </Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{t('TYPE')}</TableCell>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{t('studentFacilitySpace.details.name')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary' }}>{t('studentFacilitySpace.table.quantity')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary' }}>{t('studentFacilitySpace.table.spaceUsed')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary' }}>{t('studentFacilitySpace.table.percentOfTotal')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedFacilityDetails.inventorySummary.topItemsBySpace.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: item.itemType === 'RAW_MATERIAL' 
                                      ? theme.palette.primary.main 
                                      : theme.palette.secondary.main
                                  }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {item.itemType === 'RAW_MATERIAL' ? t('studentFacilitySpace.details.rawMaterial') : t('studentFacilitySpace.details.product')}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                  {item.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                  {item.quantity.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                  {item.spaceOccupied.toFixed(1)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                  {item.percentageOfTotal.toFixed(0)}%
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Box>
                )}

                {/* Space Configuration Info */}
                {selectedFacilityDetails.spaceConfiguration && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t('studentFacilitySpace.details.spaceConfiguration')}: {t('studentFacilitySpace.details.initial')} {selectedFacilityDetails.spaceConfiguration.initialSpace} • 
                      {t('studentFacilitySpace.details.perLevel')} +{selectedFacilityDetails.spaceConfiguration.spacePerLevel} • 
                      {t('studentFacilitySpace.details.max')} {selectedFacilityDetails.spaceConfiguration.maxSpace}
                    </Typography>
                  </Box>
                )}

                {/* Coordinates and Last Updated */}
                <Box sx={{ mt: 3, pt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('studentFacilitySpace.details.coordinates')}: ({selectedFacilityDetails.tileCoordinates.q}, {selectedFacilityDetails.tileCoordinates.r}, {selectedFacilityDetails.tileCoordinates.s}) • 
                    {t('studentFacilitySpace.details.lastUpdated')}: {new Date(selectedFacilityDetails.lastUpdated).toLocaleString()}
                  </Typography>
                </Box>

                {/* Action Button */}
                <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
                  <Button 
                    fullWidth
                    variant="contained"
                    onClick={() => setDetailsDialogOpen(false)}
                    sx={{ 
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[800] 
                        : theme.palette.grey[900],
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[700] 
                          : theme.palette.grey[800]
                      }
                    }}
                  >
                    {t('common.close')}
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}