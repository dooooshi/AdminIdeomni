'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  CircularProgress,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Agriculture as FarmIcon,
  Forest as ForestIcon,
  Terrain as MineIcon,
  Water as FisheryIcon,
  Pets as RanchIcon,
  Landscape as QuarryIcon,
  Water as WaterIcon,
  Bolt as PowerIcon
} from '@mui/icons-material';
import apiClient from '@/lib/http/api-client';

interface Facility {
  id: string;
  facilityType: string;
  name: string;
  level: number;
  tile?: {
    id: string;
    coordinates: {
      q: number;
      r: number;
      s: number;
    };
    landType: string;
  };
  status: string;
  capacity?: {
    totalSpace: number;
    usedSpace: number;
    availableSpace: number;
    rawMaterialSpace?: number;
    productSpace?: number;
  };
  infrastructure?: {
    hasWater: boolean;
    hasPower: boolean;
    waterProviderId?: string;
    powerProviderId?: string;
    waterUnitPrice?: number;
    powerUnitPrice?: number;
  };
}

interface FacilitySelectorProps {
  value: string;
  onChange: (facilityId: string) => void;
  facilityType?: string; // Filter by type (matches material origin)
  disabled?: boolean;
}

const getFacilityIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'MINE':
      return <MineIcon />;
    case 'FARM':
      return <FarmIcon />;
    case 'FOREST':
      return <ForestIcon />;
    case 'FISHERY':
      return <FisheryIcon />;
    case 'RANCH':
      return <RanchIcon />;
    case 'QUARRY':
      return <QuarryIcon />;
    default:
      return <FactoryIcon />;
  }
};

const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  value,
  onChange,
  facilityType,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, [facilityType]);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      // Get user's team material production facilities
      const params: any = {};
      if (facilityType) {
        params.facilityType = facilityType;
      }
      
      const response = await apiClient.get('/user/facilities/material-production', { params });
      const facilityList = response.data?.data?.facilities || [];
      
      // Filter only active facilities
      const activeFacilities = facilityList.filter((f: Facility) => 
        f.status === 'ACTIVE'
      );
      
      setFacilities(activeFacilities);
      
      // Auto-select if only one facility
      if (activeFacilities.length === 1 && !value) {
        onChange(activeFacilities[0].id);
      }
    } catch (error) {
      console.error('Failed to load facilities:', error);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControl fullWidth disabled={disabled || loading}>
      <InputLabel>{t('production.selectFacility')}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={t('production.selectFacility')}
        startAdornment={
          loading ? (
            <Box sx={{ display: 'flex', pl: 1 }}>
              <CircularProgress size={20} />
            </Box>
          ) : null
        }
      >
        {facilities.length === 0 && !loading && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {facilityType 
                ? t('production.noFacilitiesOfType', { type: facilityType })
                : t('production.noFacilities')}
            </Typography>
          </MenuItem>
        )}
        
        {facilities.map((facility) => (
          <MenuItem key={facility.id} value={facility.id}>
            <ListItemIcon>
              {getFacilityIcon(facility.facilityType)}
            </ListItemIcon>
            <ListItemText
              primary={facility.name}
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip label={facility.facilityType} size="small" />
                  <Chip label={`Level ${facility.level}`} size="small" variant="outlined" />
                  {facility.tile?.coordinates && (
                    <Chip 
                      label={`(${facility.tile.coordinates.q}, ${facility.tile.coordinates.r})`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                  {facility.capacity && (
                    <Chip 
                      label={`${facility.capacity.availableSpace} space`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {facility.infrastructure?.hasWater && (
                    <Chip 
                      icon={<WaterIcon sx={{ fontSize: 16 }} />}
                      label={`$${facility.infrastructure.waterUnitPrice || 0}/u`} 
                      size="small" 
                      color="info"
                      variant="outlined"
                    />
                  )}
                  {facility.infrastructure?.hasPower && (
                    <Chip 
                      icon={<PowerIcon sx={{ fontSize: 16 }} />}
                      label={`$${facility.infrastructure.powerUnitPrice || 0}/u`} 
                      size="small" 
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FacilitySelector;