'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  WaterDrop as WaterIcon,
  PowerSettingsNew as PowerIcon,
  CellTower as BaseStationIcon,
  LocalFireDepartment as FireStationIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import infrastructureService, {
  ProviderCapacity,
  TeamFacility,
} from '@/lib/services/infrastructureService';

interface ProviderDashboardProps {
  facilities: TeamFacility[];
  onUpdate: () => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ facilities, onUpdate }) => {
  const { t } = useTranslation('infrastructure');
  const [loading, setLoading] = useState(false);
  const [capacityData, setCapacityData] = useState<Map<string, ProviderCapacity>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProviderData();
  }, [facilities]);

  const loadProviderData = async () => {
    setLoading(true);
    const newCapacityData = new Map<string, ProviderCapacity>();
    
    try {
      for (const facility of facilities) {
        if (['WATER_PLANT', 'POWER_PLANT'].includes(facility.facilityType)) {
          const capacity = await infrastructureService.getProviderCapacity(facility.facilityId);
          newCapacityData.set(facility.facilityId, capacity);
        }
      }
      setCapacityData(newCapacityData);
    } catch (err: any) {
      setError(err.message || t('ERROR_LOADING_PROVIDER_DATA'));
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'WATER_PLANT': return <WaterIcon />;
      case 'POWER_PLANT': return <PowerIcon />;
      case 'BASE_STATION': return <BaseStationIcon />;
      case 'FIRE_STATION': return <FireStationIcon />;
      default: return null;
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('YOUR_INFRASTRUCTURE_OPERATIONS')}
      </Typography>
      
      <Grid container spacing={2}>
        {facilities.map((facility) => {
          const capacity = capacityData.get(facility.facilityId);
          const utilizationPercentage = capacity 
            ? (capacity.usedOperationPoints / capacity.totalOperationPoints) * 100
            : 0;
            
          return (
            <Grid key={`provider-${facility.facilityId}`} size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getFacilityIcon(facility.facilityType)}
                    <Typography variant="h6">
                      {t(facility.facilityType)}
                    </Typography>
                    <Chip 
                      label={`${t('LEVEL')} ${facility.level}`}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  {capacity && (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('CAPACITY_UTILIZATION')}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={utilizationPercentage} 
                        sx={{ mb: 1 }}
                        color={utilizationPercentage > 80 ? 'warning' : 'primary'}
                      />
                      <Typography variant="body2" align="center">
                        {capacity.usedOperationPoints} / {capacity.totalOperationPoints} {t('OPERATION_POINTS')}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          {t('ACTIVE_CONNECTIONS')}: {capacity.connections?.length || 0}
                        </Typography>
                        <Typography variant="body2">
                          {t('AVAILABLE_CAPACITY')}: {capacity.availableOperationPoints || 0}
                        </Typography>
                        <Typography variant="body2">
                          {t('MAX_ADDITIONAL')}: {capacity.maxAdditionalConnections || 0}
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {['BASE_STATION', 'FIRE_STATION'].includes(facility.facilityType) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('INFLUENCE_RANGE')}: {facility.level - 1} {t('TILES')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('LOCATION')}: ({facility.tileCoordinates.q}, {facility.tileCoordinates.r})
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ProviderDashboard;