'use client';

/**
 * Activity Tile State Management Page
 * 
 * Displays activities in a table format and shows the map with tile states in a modal
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Alert,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import {
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import IdeomniPageCarded from '@ideomni/core/IdeomniPageCarded';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { HexagonalMap, MapContainer, MapHeader } from '@/components/map';
import ActivityAnalyticsPanel from '@/components/map/ui/ActivityAnalyticsPanel';
import ActivityTileStatePanel from '@/components/map/ui/ActivityTileStatePanel';

import AdminTileStateService, {
  Activity,
  DetailedTileState,
  TileStateConfig,
} from '@/lib/services/adminTileStateService';

const ActivityTileStateManagementPage: React.FC = () => {
  const { t } = useTranslation(['map', 'activity']);
  
  // Activities table state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [totalActivities, setTotalActivities] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  
  // Selected activity and tile state management
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [tileStates, setTileStates] = useState<DetailedTileState[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [isLoadingTileStates, setIsLoadingTileStates] = useState(false);
  
  // Modal state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showTileStatePanel, setShowTileStatePanel] = useState(false);
  
  // Feedback and notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Load activities
  const loadActivities = useCallback(async () => {
    try {
      setIsLoadingActivities(true);
      
      const params = {
        page: page + 1, // API uses 1-based indexing
        pageSize: rowsPerPage,
        includeDeleted: false,
        ...(searchTerm && { name: searchTerm }),
        ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
      };
      
      const response = await AdminTileStateService.getActivities(params);
      console.log('Activities API response:', response);
      setActivities(response.data || []);
      setTotalActivities(response.total || 0);
      
    } catch (error) {
      console.error('Failed to load activities:', error);
      
            // Mock data fallback for development  
      console.log('Using fallback mock data for activities');
      setActivities([]);
      setTotalActivities(0);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  // Load tile states for selected activity
  const loadTileStates = useCallback(async (activity: Activity) => {
    try {
      setIsLoadingTileStates(true);
      
      const searchResults = await AdminTileStateService.searchTileStates({
        activityId: activity.id,
      });
      
      console.log('Raw tile states API response:', searchResults);
      
      // Process and enhance the tile state data
      const processedTileStates = (searchResults.data || []).map((rawTileState: any) => {
        // Extract tile information from the API response
        const tile = rawTileState.tile || {};
        
        // Set default values for missing fields based on land type
        const getDefaultsByLandType = (landType: string) => {
          switch (landType) {
            case 'MARINE':
              return { initialPrice: 75, initialPopulation: 100, transportationCostUnit: 8.0 };
            case 'COASTAL':
              return { initialPrice: 150, initialPopulation: 1200, transportationCostUnit: 5.0 };
            case 'PLAIN':
              return { initialPrice: 200, initialPopulation: 1800, transportationCostUnit: 2.5 };
            default:
              return { initialPrice: 100, initialPopulation: 500, transportationCostUnit: 5.0 };
          }
        };
        
        const defaults = getDefaultsByLandType(tile.landType);
        
        return {
          id: rawTileState.id,
          activityId: rawTileState.activityId,
          tileId: rawTileState.tileId,
          previousPrice: rawTileState.previousPrice,
          newPrice: rawTileState.newPrice,
          previousPopulation: rawTileState.previousPopulation,
          newPopulation: rawTileState.newPopulation,
          updatedBy: rawTileState.updatedBy,
          changeReason: rawTileState.changeReason,
          changedAt: rawTileState.changedAt,
          tile: {
            id: tile.id,
            axialQ: tile.axialQ,
            axialR: tile.axialR,
            landType: tile.landType,
            templateId: tile.templateId,
            // Fill in missing required fields with defaults
            initialPrice: tile.initialPrice || defaults.initialPrice,
            initialPopulation: tile.initialPopulation || defaults.initialPopulation,
            transportationCostUnit: tile.transportationCostUnit || defaults.transportationCostUnit,
          },
        };
      });
      
      console.log('Processed tile states:', processedTileStates);
      setTileStates(processedTileStates);
    } catch (error) {
      console.error('Failed to load tile states:', error);
      
      // Generate mock tile states for development
      const mockTileStates: DetailedTileState[] = Array.from({ length: 105 }, (_, index) => {
        const tileId = index + 1;
        const landTypes = ['MARINE', 'COASTAL', 'PLAIN'] as const;
        const landType = landTypes[Math.floor(Math.random() * landTypes.length)];
        
        const q = Math.floor((index % 15) - 7);
        const r = Math.floor((index / 15) - 3);
        
        const basePrice = landType === 'MARINE' ? 75 : landType === 'COASTAL' ? 150 : 200;
        const basePopulation = landType === 'MARINE' ? 100 : landType === 'COASTAL' ? 1200 : 1800;
        
        const initialPrice = basePrice + (Math.random() * 50 - 25);
        const initialPopulation = basePopulation + Math.floor(Math.random() * 400 - 200);
        const currentPrice = initialPrice * (0.8 + Math.random() * 0.4);
        const currentPopulation = initialPopulation * (0.8 + Math.random() * 0.4);
        
        return {
          id: tileId,
          activityId: activity.id,
          tileId,
          previousPrice: initialPrice,
          newPrice: currentPrice,
          previousPopulation: initialPopulation,
          newPopulation: Math.floor(currentPopulation),
          updatedBy: Math.random() > 0.7 ? 'admin123' : '',
          changeReason: Math.random() > 0.7 ? 'Market adjustment for simulation' : '',
          changedAt: Math.random() > 0.7 ? new Date().toISOString() : '',
          tile: {
            id: tileId,
            axialQ: q,
            axialR: r,
            landType,
            templateId: activity.mapTemplateId || 1,
            initialPrice,
            initialPopulation,
            transportationCostUnit: Math.random() * 5 + 1,
          },
        };
      });
      
      setTileStates(mockTileStates);
    } finally {
      setIsLoadingTileStates(false);
    }
  }, []);

  // Get activity status
  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const startDate = new Date(activity.startAt);
    const endDate = new Date(activity.endAt);

    if (now >= startDate && now <= endDate) {
      return { status: 'active', label: t('ACTIVE', { ns: 'activity' }), color: 'success' as const };
    } else if (now < startDate) {
      return { status: 'upcoming', label: t('UPCOMING', { ns: 'activity' }), color: 'info' as const };
    } else {
      return { status: 'completed', label: t('COMPLETED', { ns: 'activity' }), color: 'default' as const };
    }
  };

  // Handle view map
  const handleViewMap = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedTileId(null);
    setShowTileStatePanel(false);
    setShowAnalyticsPanel(false);
    setIsMapModalOpen(true);
    loadTileStates(activity);
  };

  // Handle tile selection
  const handleTileSelect = (tileId: number) => {
    setSelectedTileId(tileId);
    setShowTileStatePanel(true);
    setShowAnalyticsPanel(false);
  };

  // Handle tile state update
  const handleTileStateUpdate = (tileId: number, updatedState: DetailedTileState) => {
    setTileStates(prev => 
      prev.map(state => 
        state.tileId === tileId ? updatedState : state
      )
    );
    
    setSnackbar({
      open: true,
      message: t('TILE_STATE_UPDATED_SUCCESSFULLY'),
      severity: 'success',
    });
  };

  // Convert tile states to tiles format for the map
  const convertTileStatesToTiles = () => {
    return tileStates.map(state => ({
      id: state.tileId,
      axialQ: state.tile.axialQ,
      axialR: state.tile.axialR,
      landType: state.tile.landType,
      currentPrice: state.newPrice || state.tile.initialPrice,
      currentPopulation: state.newPopulation || state.tile.initialPopulation,
      transportationCostUnit: state.tile.transportationCostUnit,
      isModified: Boolean(state.changedAt),
    }));
  };

  // Load initial data
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const tiles = convertTileStatesToTiles();

  return (
    <IdeomniPageCarded
      header={
        <PageBreadcrumb 
          title={t('ACTIVITY_TILE_STATE_MANAGEMENT')}
        />
      }
      content={
        <Container maxWidth={false}>
          <Paper sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">
                {t('ACTIVITY_TILE_STATE_MANAGEMENT')}
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadActivities}
                disabled={isLoadingActivities}
              >
                {t('REFRESH')}
              </Button>
            </Box>

            {/* Filters */}
            <Stack direction="row" spacing={2} mb={3}>
              <TextField
                placeholder={t('SEARCH_ACTIVITIES')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ minWidth: 300 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('STATUS')}</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  label={t('STATUS')}
                >
                  <MenuItem value="all">{t('ALL_STATUSES')}</MenuItem>
                  <MenuItem value="active">{t('ACTIVE', { ns: 'activity' })}</MenuItem>
                  <MenuItem value="upcoming">{t('UPCOMING', { ns: 'activity' })}</MenuItem>
                  <MenuItem value="completed">{t('COMPLETED', { ns: 'activity' })}</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Loading */}
            {isLoadingActivities && <LinearProgress sx={{ mb: 2 }} />}

            {/* Activities Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                                         <TableCell>{t('NAME')}</TableCell>
                     <TableCell>{t('TYPE')}</TableCell>
                     <TableCell>{t('STATUS')}</TableCell>
                     <TableCell>{t('START_DATE')}</TableCell>
                     <TableCell>{t('END_DATE')}</TableCell>
                     <TableCell>{t('CREATED_BY')}</TableCell>
                     <TableCell align="center">{t('ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.map((activity) => {
                    const status = getActivityStatus(activity);
                    
                    return (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {activity.name}
                            </Typography>
                            {activity.description && (
                              <Typography variant="caption" color="text.secondary">
                                {activity.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.activityType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={status.color}
                            label={status.label}
                            icon={
                              status.status === 'active' ? <PlayArrowIcon /> :
                              status.status === 'upcoming' ? <ScheduleIcon /> :
                              <CheckCircleIcon />
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(activity.startAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(activity.endAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.createdBy?.firstName} {activity.createdBy?.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title={t('VIEW_MAP')}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewMap(activity)}
                                color="primary"
                              >
                                <MapIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('VIEW_ANALYTICS')}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedActivity(activity);
                                  setShowAnalyticsPanel(true);
                                  setIsMapModalOpen(true);
                                }}
                                color="secondary"
                              >
                                <AnalyticsIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalActivities}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50, 100]}
            />
          </Paper>

          {/* Map Modal */}
          <Dialog
            open={isMapModalOpen}
            onClose={() => setIsMapModalOpen(false)}
            maxWidth="xl"
            fullWidth
            PaperProps={{ sx: { height: '90vh' } }}
          >
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {selectedActivity?.name} - {t('TILE_STATES')}
                </Typography>
                <IconButton onClick={() => setIsMapModalOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ height: '100%', display: 'flex', gap: 2 }}>
              {/* Map Area */}
              <Box flex={showTileStatePanel || showAnalyticsPanel ? 2 : 1}>
                {selectedActivity ? (
                  <Box sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {isLoadingTileStates && <LinearProgress />}
                                         <Box sx={{ height: '100%' }}>
                       <Box p={2}>
                         <Typography variant="h6" gutterBottom>
                           {selectedActivity.name}
                         </Typography>
                         <Stack direction="row" spacing={2}>
                           <Chip 
                             label={`${tiles.length} ${t('TOTAL_TILES')}`} 
                             icon={<MapIcon />} 
                             size="small" 
                           />
                           <Chip 
                             label={`${tiles.filter(t => t.isModified).length} ${t('MODIFIED_TILES')}`} 
                             icon={<AnalyticsIcon />} 
                             size="small" 
                           />
                         </Stack>
                       </Box>
                       
                       <HexagonalMap
                         tiles={tiles}
                         selectedTileId={selectedTileId}
                         onTileSelect={handleTileSelect}
                         showEconomicData={true}
                         activityMode={true}
                         width={600}
                         height={400}
                       />
                     </Box>
                  </Box>
                ) : (
                  <Alert severity="info">
                    {t('SELECT_ACTIVITY_TO_VIEW_MAP')}
                  </Alert>
                )}
              </Box>

              {/* Side Panel */}
              {(showTileStatePanel || showAnalyticsPanel) && (
                <Box sx={{ width: 400, height: '100%' }}>
                  {showTileStatePanel && (
                    <ActivityTileStatePanel
                      activity={selectedActivity}
                      selectedTileId={selectedTileId}
                      tileStates={tileStates}
                      onTileStateUpdate={handleTileStateUpdate}
                      isVisible={true}
                    />
                  )}
                  
                  {showAnalyticsPanel && (
                    <ActivityAnalyticsPanel
                      activity={selectedActivity}
                      isVisible={true}
                    />
                  )}
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button
                onClick={() => {
                  setShowAnalyticsPanel(!showAnalyticsPanel);
                  setShowTileStatePanel(false);
                }}
                startIcon={<AnalyticsIcon />}
                variant={showAnalyticsPanel ? "contained" : "outlined"}
              >
                {t('ANALYTICS')}
              </Button>
              <Button onClick={() => setIsMapModalOpen(false)}>
                {t('CLOSE')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      }
    />
  );
};

export default ActivityTileStateManagementPage; 