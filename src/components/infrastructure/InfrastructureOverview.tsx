'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  LinearProgress,
  Button,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  WaterDrop as WaterIcon,
  PowerSettingsNew as PowerIcon,
  CellTower as BaseStationIcon,
  LocalFireDepartment as FireStationIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  LinkOff as DisconnectIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import infrastructureService, {
  TeamFacility,
  OperationalStatus,
  FacilityInfrastructureStatus,
  InfrastructureType,
} from '@/lib/services/infrastructureService';

interface InfrastructureOverviewProps {
  facilities: TeamFacility[];
  onRefresh: () => void;
}

const InfrastructureOverview: React.FC<InfrastructureOverviewProps> = ({
  facilities,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [facilityDetails, setFacilityDetails] = useState<FacilityInfrastructureStatus | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusIcon = (connected: boolean | undefined) => {
    if (connected === true) {
      return <CheckIcon color="success" fontSize="small" />;
    } else if (connected === false) {
      return <CancelIcon color="error" fontSize="small" />;
    }
    return <WarningIcon color="warning" fontSize="small" />;
  };

  const getOperationalStatusColor = (status: OperationalStatus) => {
    switch (status) {
      case OperationalStatus.FULL:
        return 'success';
      case OperationalStatus.PARTIAL:
        return 'warning';
      case OperationalStatus.NON_OPERATIONAL:
        return 'error';
      default:
        return 'default';
    }
  };

  const getOperationalStatusIcon = (status: OperationalStatus) => {
    switch (status) {
      case OperationalStatus.FULL:
        return <CheckIcon />;
      case OperationalStatus.PARTIAL:
        return <WarningIcon />;
      case OperationalStatus.NON_OPERATIONAL:
        return <CancelIcon />;
      default:
        return null;
    }
  };

  const loadFacilityDetails = async (facilityId: string) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const details = await infrastructureService.getFacilityStatus(facilityId);
      setFacilityDetails(details);
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_LOADING_DETAILS'));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (facilityId: string) => {
    setSelectedFacility(facilityId);
    loadFacilityDetails(facilityId);
  };

  // Filter facilities that require infrastructure
  const requiresInfrastructure = (facilityType: string) => {
    const infrastructureRequired = [
      'MINE', 'QUARRY', 'FOREST', 'FARM', 'RANCH', 'FISHERY', // RAW_MATERIAL_PRODUCTION
      'FACTORY', 'MALL', 'WAREHOUSE' // FUNCTIONAL
    ];
    return infrastructureRequired.includes(facilityType);
  };

  const facilitiesNeedingInfrastructure = facilities.filter(f => requiresInfrastructure(f.facilityType));
  const infrastructureFacilities = facilities.filter(f => 
    ['WATER_PLANT', 'POWER_PLANT', 'BASE_STATION', 'FIRE_STATION'].includes(f.facilityType)
  );

  return (
    <Box>
      {/* Facilities Table */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {t('infrastructure.FACILITIES_STATUS')}
      </Typography>

      {facilitiesNeedingInfrastructure.length === 0 ? (
        <Alert severity="info">
          {t('infrastructure.NO_FACILITIES_REQUIRING_INFRASTRUCTURE')}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('infrastructure.FACILITY')}</TableCell>
                <TableCell>{t('infrastructure.TYPE')}</TableCell>
                <TableCell>{t('infrastructure.COORDINATES')}</TableCell>
                <TableCell align="center">
                  <WaterIcon fontSize="small" /> {t('infrastructure.WATER')}
                </TableCell>
                <TableCell align="center">
                  <PowerIcon fontSize="small" /> {t('infrastructure.POWER')}
                </TableCell>
                <TableCell align="center">
                  <BaseStationIcon fontSize="small" /> {t('infrastructure.BASE_STATION')}
                </TableCell>
                <TableCell align="center">
                  <FireStationIcon fontSize="small" /> {t('infrastructure.FIRE_STATION')}
                </TableCell>
                <TableCell>{t('infrastructure.STATUS')}</TableCell>
                <TableCell>{t('infrastructure.ACTIONS')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facilitiesNeedingInfrastructure.map((facility) => (
                <TableRow key={facility.facilityId}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {facility.facilityId.slice(-6)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {t(`infrastructure.${facility.facilityType}`)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {facility.tileCoordinates ? `(${facility.tileCoordinates.q}, ${facility.tileCoordinates.r})` : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={
                      facility.infrastructureStatus?.water?.connected 
                        ? `${t('infrastructure.CONNECTED_TO')} ${facility.infrastructureStatus.water.providerTeam}`
                        : t('infrastructure.NOT_CONNECTED')
                    }>
                      <span>
                        {getStatusIcon(facility.infrastructureStatus?.water?.connected)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={
                      facility.infrastructureStatus?.power?.connected 
                        ? `${t('infrastructure.CONNECTED_TO')} ${facility.infrastructureStatus.power.providerTeam}`
                        : t('infrastructure.NOT_CONNECTED')
                    }>
                      <span>
                        {getStatusIcon(facility.infrastructureStatus?.power?.connected)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={
                      facility.infrastructureStatus?.baseStation?.covered 
                        ? `${t('infrastructure.COVERED_BY')} ${facility.infrastructureStatus.baseStation.providerTeam}`
                        : t('infrastructure.NOT_COVERED')
                    }>
                      <span>
                        {getStatusIcon(facility.infrastructureStatus?.baseStation?.covered)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={
                      facility.infrastructureStatus?.fireStation?.covered 
                        ? `${t('infrastructure.COVERED_BY')} ${facility.infrastructureStatus.fireStation.providerTeam}`
                        : t('infrastructure.NOT_COVERED')
                    }>
                      <span>
                        {getStatusIcon(facility.infrastructureStatus?.fireStation?.covered)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`infrastructure.${facility.operationalStatus}`)}
                      color={getOperationalStatusColor(facility.operationalStatus)}
                      size="small"
                      icon={getOperationalStatusIcon(facility.operationalStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(facility.facilityId)}
                    >
                      {t('infrastructure.VIEW_DETAILS')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Infrastructure Providers */}
      {infrastructureFacilities.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t('infrastructure.YOUR_INFRASTRUCTURE_FACILITIES')}
          </Typography>
          <Grid container spacing={2}>
            {infrastructureFacilities.map((facility) => (
              <Grid key={`infra-${facility.facilityId}`} item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {facility.facilityType === 'WATER_PLANT' && <WaterIcon color="primary" />}
                      {facility.facilityType === 'POWER_PLANT' && <PowerIcon color="primary" />}
                      {facility.facilityType === 'BASE_STATION' && <BaseStationIcon color="primary" />}
                      {facility.facilityType === 'FIRE_STATION' && <FireStationIcon color="primary" />}
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {t(`infrastructure.${facility.facilityType}`)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('infrastructure.LEVEL')}: {facility.level}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('infrastructure.LOCATION')}: ({facility.tileCoordinates.q}, {facility.tileCoordinates.r})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Facility Details Modal */}
      {selectedFacility && facilityDetails && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('infrastructure.FACILITY_DETAILS')}
          </Typography>
          {loadingDetails ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {t('infrastructure.FACILITY_ID')}: {facilityDetails.facilityId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('infrastructure.TYPE')}: {t(`infrastructure.${facilityDetails.facilityType}`)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('infrastructure.OPERATIONAL_PERCENTAGE')}: {facilityDetails.operationalPercentage}%
                </Typography>
              </Grid>
              
              {/* Infrastructure Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('infrastructure.WATER_CONNECTION')}
                </Typography>
                {facilityDetails.infrastructureStatus.water.connected ? (
                  <Box>
                    <Typography variant="body2">
                      {t('infrastructure.PROVIDER')}: {facilityDetails.infrastructureStatus.water.provider?.teamName}
                    </Typography>
                    <Typography variant="body2">
                      {t('infrastructure.UNIT_PRICE')}: ${facilityDetails.infrastructureStatus.water.provider?.unitPrice}
                    </Typography>
                    <Typography variant="body2">
                      {t('infrastructure.DISTANCE')}: {facilityDetails.infrastructureStatus.water.connectionDetails?.distance}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DisconnectIcon />}
                      sx={{ mt: 1 }}
                      onClick={() => {
                        // Navigate to connections tab with this facility selected
                        window.location.href = '/infrastructure#connections';
                      }}
                    >
                      {t('infrastructure.DISCONNECT')}
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {t('infrastructure.NOT_CONNECTED')}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('infrastructure.POWER_CONNECTION')}
                </Typography>
                {facilityDetails.infrastructureStatus.power.connected ? (
                  <Box>
                    <Typography variant="body2">
                      {t('infrastructure.PROVIDER')}: {facilityDetails.infrastructureStatus.power.provider?.teamName}
                    </Typography>
                    <Typography variant="body2">
                      {t('infrastructure.UNIT_PRICE')}: ${facilityDetails.infrastructureStatus.power.provider?.unitPrice}
                    </Typography>
                    <Typography variant="body2">
                      {t('infrastructure.DISTANCE')}: {facilityDetails.infrastructureStatus.power.connectionDetails?.distance}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DisconnectIcon />}
                      sx={{ mt: 1 }}
                      onClick={() => {
                        // Navigate to connections tab with this facility selected
                        window.location.href = '/infrastructure#connections';
                      }}
                    >
                      {t('infrastructure.DISCONNECT')}
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {t('infrastructure.NOT_CONNECTED')}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12}>
                {facilityDetails.missingInfrastructure.length > 0 && (
                  <Alert severity="error">
                    {t('infrastructure.MISSING_INFRASTRUCTURE')}: {facilityDetails.missingInfrastructure.map(i => t(`infrastructure.${i}`)).join(', ')}
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}
          <Button sx={{ mt: 2 }} onClick={() => setSelectedFacility(null)}>
            {t('infrastructure.CLOSE')}
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default InfrastructureOverview;