/**
 * ActivitySelector Component - Select activities for tile state management
 * 
 * Features:
 * - List all active activities
 * - Filter by activity type and status
 * - Search by name
 * - Display activity details and status
 * - Integration with tile state management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  Chip,
  Grid,
  Alert,
  LinearProgress,
  Stack,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

import AdminTileStateService, { Activity } from '@/lib/services/adminTileStateService';

interface ActivitySelectorProps {
  selectedActivity: Activity | null;
  onActivitySelect: (activity: Activity) => void;
  className?: string;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedActivity,
  onActivitySelect,
  className,
}) => {
  const { t } = useTranslation(['map', 'activity']);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Load activities
  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await AdminTileStateService.getActivities({
        pageSize: 100, // Load more activities for better selection
      });
      
      setActivities(response.data || []);
      console.log('Loaded activities:', response.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      
      // Mock data fallback for development
      const mockActivities: Activity[] = [

      ];
      setActivities(mockActivities);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter activities based on search and filters
  const filterActivities = useCallback(() => {
    let filtered = activities;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        activity =>
          activity.name.toLowerCase().includes(term) ||
          activity.description?.toLowerCase().includes(term) ||
          activity.activityType.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(activity => {
        const startDate = new Date(activity.startAt);
        const endDate = new Date(activity.endAt);
        
        switch (statusFilter) {
          case 'active':
            return now >= startDate && now <= endDate;
          case 'upcoming':
            return now < startDate;
          case 'completed':
            return now > endDate;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.activityType === typeFilter);
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, statusFilter, typeFilter]);

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

  // Get activity type display name
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'BizSimulation3_1':
        return t('BUSINESS_SIMULATION', { ns: 'activity' });
      default:
        return type;
    }
  };

  // Get unique activity types for filter
  const getActivityTypes = () => {
    const types = [...new Set(activities.map(a => a.activityType))];
    return types;
  };

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

  return (
    <Box className={className}>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              {t('SELECT_ACTIVITY')}
            </Typography>
            <Tooltip title={t('REFRESH_ACTIVITIES')}>
              <IconButton onClick={loadActivities} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Filters */}
          <Stack spacing={2} mb={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
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
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('STATUS')}</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    label={t('STATUS')}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="all">{t('ALL_STATUSES')}</MenuItem>
                    <MenuItem value="active">{t('ACTIVE', { ns: 'activity' })}</MenuItem>
                    <MenuItem value="upcoming">{t('UPCOMING', { ns: 'activity' })}</MenuItem>
                    <MenuItem value="completed">{t('COMPLETED', { ns: 'activity' })}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('TYPE')}</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label={t('TYPE')}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="all">{t('ALL_TYPES')}</MenuItem>
                    {getActivityTypes().map((type) => (
                      <MenuItem key={type} value={type}>
                        {getActivityTypeLabel(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>

          {/* Loading */}
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Results */}
          {!isLoading && filteredActivities.length === 0 && (
            <Alert severity="info">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? t('NO_ACTIVITIES_MATCH_FILTERS')
                : t('NO_ACTIVITIES_AVAILABLE')
              }
            </Alert>
          )}

          {/* Activity List */}
          <Stack spacing={2}>
            <AnimatePresence>
              {filteredActivities.map((activity) => {
                const status = getActivityStatus(activity);
                const isSelected = selectedActivity?.id === activity.id;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      variant={isSelected ? 'elevation' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => onActivitySelect(activity)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1}>
                            <Typography variant="h6" gutterBottom>
                              {activity.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              {activity.description}
                            </Typography>
                          </Box>
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
                        </Box>

                        <Grid container spacing={2} alignItems="center">
                          <Grid>
                            <Box display="flex" alignItems="center" gap={1}>
                              <TimelineIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {getActivityTypeLabel(activity.activityType)}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid>
                            <Box display="flex" alignItems="center" gap={1}>
                              <ScheduleIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {new Date(activity.startAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {activity.mapTemplateId && (
                            <Grid>
                              <Box display="flex" alignItems="center" gap={1}>
                                <MapIcon fontSize="small" color="action" />
                                <Typography variant="caption">
                                  {t('TEMPLATE')} #{activity.mapTemplateId}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stack>

          {/* Selected Activity Summary */}
          {selectedActivity && (
            <Box mt={3} p={2} bgcolor="action.selected" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                {t('SELECTED_ACTIVITY')}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {selectedActivity.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('READY_FOR_TILE_STATE_MANAGEMENT')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ActivitySelector; 