'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Landscape as LandscapeIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Factory as FactoryIcon,
  Warehouse as WarehouseIcon,
  Agriculture as FarmIcon,
  Bolt as PowerIcon,
  Build as WorkshopIcon,
  Construction as MiningIcon,
  LocalGasStation as RefineryIcon,
  Circle as StatusIcon,
  Water as WaterPlantIcon,
  ElectricBolt as PowerPlantIcon,
  LocalFireDepartment as FireStationIcon,
  CellTower as BaseStationIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import {
  TeamLandStatusResponse,
  TeamLandStatusSummary,
  TileLandStatus,
  FacilityInstance
} from '@/types/land';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

const StatsCard = styled(Card)(({ theme }) => ({
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
  borderRadius: theme.spacing(1.5),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' 
    : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
}));

const TileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(1.5),
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}`,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[900]
    : theme.palette.grey[50],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
  },
}));

interface TeamLandStatusPageProps {}

const TeamLandStatusPage: React.FC<TeamLandStatusPageProps> = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [landStatus, setLandStatus] = useState<TeamLandStatusResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTiles, setExpandedTiles] = useState<Set<number>>(new Set());

  // Load initial data
  useEffect(() => {
    loadLandStatus();
  }, []);

  const loadLandStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const statusData = await LandService.getTeamLandStatus();
      setLandStatus(statusData);
    } catch (err: any) {
      console.error('Failed to load land status:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLandStatus();
  };

  const handleToggleTile = (tileId: number) => {
    setExpandedTiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tileId)) {
        newSet.delete(tileId);
      } else {
        newSet.add(tileId);
      }
      return newSet;
    });
  };

  const getFacilityIcon = (facilityType: string) => {
    switch (facilityType) {
      case 'FACTORY':
        return <FactoryIcon />;
      case 'WAREHOUSE':
        return <WarehouseIcon />;
      case 'FARM':
        return <FarmIcon />;
      case 'MINE':
        return <MiningIcon />;
      case 'QUARRY':
        return <MiningIcon />;
      case 'FOREST':
        return <FarmIcon />;
      case 'RANCH':
        return <FarmIcon />;
      case 'FISHERY':
        return <FarmIcon />;
      case 'MALL':
        return <BusinessIcon />;
      case 'WORKSHOP':
        return <WorkshopIcon />;
      case 'WATER_PLANT':
        return <WaterPlantIcon />;
      case 'POWER_PLANT':
        return <PowerPlantIcon />;
      case 'FIRE_STATION':
        return <FireStationIcon />;
      case 'BASE_STATION':
        return <BaseStationIcon />;
      case 'SCHOOL':
        return <BusinessIcon />;
      case 'HOSPITAL':
        return <BusinessIcon />;
      case 'PARK':
        return <FarmIcon />;
      case 'CINEMA':
        return <BusinessIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  // Use the same color scheme as map components
  const getLandTypeColor = (landType: 'PLAIN' | 'COASTAL' | 'MARINE' | 'GRASSLANDS' | 'FORESTS' | 'HILLS' | 'MOUNTAINS' | 'PLATEAUS' | 'DESERTS' | 'WETLANDS'): string => {
    const isDark = theme.palette.mode === 'dark';

    const baseColors = {
      MARINE: isDark ? '#1e3a8a' : '#3b82f6', // Deep ocean blue
      PLAIN: isDark ? '#166534' : '#22c55e',   // Natural emerald green
      COASTAL: isDark ? '#ea580c' : '#f97316',  // Warm coastal orange
      GRASSLANDS: isDark ? '#81C784' : '#66BB6A', // Vibrant green
      FORESTS: isDark ? '#4CAF50' : '#388E3C', // Deep forest green
      HILLS: isDark ? '#A1887F' : '#8D6E63', // Earthy brown
      MOUNTAINS: isDark ? '#9E9E9E' : '#616161', // Stone grey
      PLATEAUS: isDark ? '#8D6E63' : '#795548', // Mesa brown
      DESERTS: isDark ? '#FFB74D' : '#FF9800', // Sandy orange
      WETLANDS: isDark ? '#26C6DA' : '#00ACC1' // Aqua cyan
    };

    return baseColors[landType] || theme.palette.grey[isDark ? 700 : 300];
  };

  const getFacilityStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.palette.success.main;
      case 'UNDER_CONSTRUCTION':
        return theme.palette.warning.main;
      case 'MAINTENANCE':
        return theme.palette.info.main;
      case 'DAMAGED':
        return theme.palette.error.main;
      case 'DECOMMISSIONED':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[400];
    }
  };

  const formatFacilityStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('landManagement.FACILITY_ACTIVE');
      case 'UNDER_CONSTRUCTION':
        return t('landManagement.FACILITY_UNDER_CONSTRUCTION');
      case 'MAINTENANCE':
        return t('landManagement.FACILITY_MAINTENANCE');
      case 'DAMAGED':
        return t('landManagement.FACILITY_DAMAGED');
      case 'DECOMMISSIONED':
        return t('landManagement.FACILITY_DECOMMISSIONED');
      default:
        return status;
    }
  };

  const formatFacilityType = (type: string) => {
    switch (type) {
      case 'FACTORY':
        return t('facilityManagement.FACILITY_TYPE_FACTORY');
      case 'WAREHOUSE':
        return t('facilityManagement.FACILITY_TYPE_WAREHOUSE');
      case 'FARM':
        return t('facilityManagement.FACILITY_TYPE_FARM');
      case 'MINE':
        return t('facilityManagement.FACILITY_TYPE_MINE');
      case 'QUARRY':
        return t('facilityManagement.FACILITY_TYPE_QUARRY');
      case 'FOREST':
        return t('facilityManagement.FACILITY_TYPE_FOREST');
      case 'RANCH':
        return t('facilityManagement.FACILITY_TYPE_RANCH');
      case 'FISHERY':
        return t('facilityManagement.FACILITY_TYPE_FISHERY');
      case 'MALL':
        return t('facilityManagement.FACILITY_TYPE_MALL');
      case 'WATER_PLANT':
        return t('facilityManagement.FACILITY_TYPE_WATER_PLANT');
      case 'POWER_PLANT':
        return t('facilityManagement.FACILITY_TYPE_POWER_PLANT');
      case 'FIRE_STATION':
        return t('facilityManagement.FACILITY_TYPE_FIRE_STATION');
      case 'BASE_STATION':
        return t('facilityManagement.FACILITY_TYPE_BASE_STATION');
      case 'SCHOOL':
        return t('facilityManagement.FACILITY_TYPE_SCHOOL');
      case 'HOSPITAL':
        return t('facilityManagement.FACILITY_TYPE_HOSPITAL');
      case 'PARK':
        return t('facilityManagement.FACILITY_TYPE_PARK');
      case 'CINEMA':
        return t('facilityManagement.FACILITY_TYPE_CINEMA');
      default:
        return type;
    }
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string = theme.palette.primary.main,
    subtitle?: string
  ) => (
    <StatsCard>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar 
            sx={{ 
              bgcolor: `${color}15`,
              color: color,
              width: 40, 
              height: 40,
              '& svg': { fontSize: 20 }
            }}
          >
            {icon}
          </Avatar>
          <Box flex={1}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                mb: 0.5,
                color: theme.palette.mode === 'dark' ? 'white' : 'gray.900'
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.disabled,
                  fontSize: '0.75rem',
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </StatsCard>
  );

  const renderTileCard = (tile: TileLandStatus) => {
    const isExpanded = expandedTiles.has(tile.tileId);
    
    return (
      <TileCard key={tile.tileId}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start"
          sx={{ cursor: tile.facilities.length > 0 ? 'pointer' : 'default' }}
          onClick={() => tile.facilities.length > 0 && handleToggleTile(tile.tileId)}
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.mode === 'dark' ? 'white' : 'gray.900'
                }}
              >
                {t('landManagement.TILE')} #{tile.tileId}
              </Typography>
              <Chip 
                label={t(`map.LAND_TYPE_${tile.landType}`)}
                size="small"
                sx={{ 
                  bgcolor: alpha(getLandTypeColor(tile.landType), 0.15),
                  color: getLandTypeColor(tile.landType),
                  fontWeight: 500,
                  border: `1px solid ${alpha(getLandTypeColor(tile.landType), 0.3)}`,
                  height: 24
                }}
              />
            </Box>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {t('landManagement.COORDINATES')}: 
                <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                  Q={tile.coordinates.q}, R={tile.coordinates.r}
                </span>
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ color: theme.palette.text.secondary }}
              >
                {t('landManagement.OWNED_AREA')}: 
                <strong>{LandService.formatArea(tile.ownedArea)}</strong>
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ color: theme.palette.text.secondary }}
              >
                {t('landManagement.FACILITIES_COUNT')}: 
                <strong>{tile.facilities.length}</strong>
              </Typography>
            </Box>
          </Box>
          
          {tile.facilities.length > 0 && (
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleTile(tile.tileId);
              }}
              sx={{ 
                ml: 2,
                color: theme.palette.text.secondary
              }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box 
            mt={2} 
            pt={2} 
            sx={{ 
              borderTop: `1px solid ${theme.palette.divider}` 
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem',
                mb: 1.5,
                display: 'block'
              }}
            >
              {t('landManagement.FACILITIES')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tile.facilities.map((facility) => (
                <Box 
                  key={facility.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: `${getFacilityStatusColor(facility.status)}15`,
                      color: getFacilityStatusColor(facility.status),
                      '& svg': { fontSize: 18 }
                    }}
                  >
                    {getFacilityIcon(facility.facilityType)}
                  </Avatar>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: 500 }}
                      >
                        {formatFacilityType(facility.facilityType)}
                      </Typography>
                      <Chip 
                        label={`Lvl ${facility.level}`}
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.08)',
                        }}
                      />
                      <Chip
                        icon={<StatusIcon sx={{ fontSize: '8px !important' }} />}
                        label={formatFacilityStatus(facility.status)}
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          color: getFacilityStatusColor(facility.status),
                          bgcolor: `${getFacilityStatusColor(facility.status)}15`,
                          border: `1px solid ${getFacilityStatusColor(facility.status)}40`,
                          '& .MuiChip-icon': {
                            color: getFacilityStatusColor(facility.status)
                          }
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.disabled,
                        fontSize: '0.75rem'
                      }}
                    >
                      {t('landManagement.CONSTRUCTION_DATE')}: {format(new Date(facility.constructionDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Collapse>
      </TileCard>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              {t('landManagement.RETRY')}
            </Button>
          }>
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  if (!landStatus) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Alert severity="info">
            {t('landManagement.NO_LAND_DATA')}
          </Alert>
        </div>
      </div>
    );
  }

  const { summary, tiles } = landStatus;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
            pb: 3,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 300,
                color: theme.palette.mode === 'dark' ? 'white' : 'gray.900',
                mb: 0.5
              }}
            >
              {t('landManagement.LAND_STATUS')}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: theme.palette.text.secondary }}
            >
              {t('landManagement.LAND_STATUS_DESCRIPTION')}
            </Typography>
          </Box>
          <Tooltip title={t('common.REFRESH_DATA')}>
            <IconButton 
              onClick={handleRefresh} 
              size="small"
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: theme.palette.action.hover
                }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            {renderStatCard(
              t('landManagement.TOTAL_OWNED_AREA'),
              LandService.formatArea(summary.totalOwnedArea),
              <LandscapeIcon />,
              theme.palette.primary.main
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            {renderStatCard(
              t('landManagement.TILES_OWNED'),
              summary.tilesOwnedCount.toString(),
              <LandscapeIcon />,
              theme.palette.info.main
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            {renderStatCard(
              t('landManagement.TOTAL_FACILITIES'),
              summary.totalFacilities.toString(),
              <BusinessIcon />,
              theme.palette.success.main
            )}
          </Box>
        </Box>

        {/* Tiles with Facilities */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500,
              color: theme.palette.mode === 'dark' ? 'white' : 'gray.900',
              mb: 2
            }}
          >
            {t('landManagement.LAND_AND_FACILITIES')}
          </Typography>
          
          {tiles.length === 0 ? (
            <Paper 
              sx={{ 
                p: 6,
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none'
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {t('landManagement.NO_TILES_OWNED')}
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {tiles.map((tile) => renderTileCard(tile))}
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
};

export default TeamLandStatusPage;