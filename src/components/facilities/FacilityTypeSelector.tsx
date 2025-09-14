'use client';

import React, { useMemo, memo, useCallback } from 'react';
import { RESOURCE_ICONS } from '@/constants/resourceIcons';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { FacilityType, LandType, type FacilityCategory } from '@/types/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface FacilityTypeSelectorProps {
  selectedType?: FacilityType;
  onTypeSelect: (type: FacilityType) => void;
  compatibleLandTypes?: LandType[];
  showOnlyCompatible?: boolean;
  showBuildableOnly?: boolean;
  selectedTileId?: number;
  showCosts?: boolean;
  facilityCosts?: Record<FacilityType, { gold: number; carbon: number }>;
  className?: string;
}

interface FacilityOption {
  type: FacilityType;
  name: string;
  icon: string;
  category: FacilityCategory;
  compatible: boolean;
  buildable?: boolean;
}


const LAND_TYPE_COMPATIBILITY: Record<FacilityType, LandType[]> = {
  // Marine-only and coastal facilities
  [FacilityType.FISHERY]: [LandType.MARINE, LandType.COASTAL],
  [FacilityType.WATER_PLANT]: [LandType.MARINE, LandType.PLAIN],
  [FacilityType.BASE_STATION]: [LandType.MARINE, LandType.PLAIN],

  // Coastal and plain facilities
  [FacilityType.FARM]: [LandType.COASTAL, LandType.PLAIN],
  [FacilityType.FACTORY]: [LandType.COASTAL, LandType.PLAIN],
  [FacilityType.MALL]: [LandType.COASTAL, LandType.PLAIN],
  [FacilityType.WAREHOUSE]: [LandType.COASTAL, LandType.PLAIN],
  [FacilityType.HOSPITAL]: [LandType.COASTAL, LandType.PLAIN],

  // Plain-only facilities
  [FacilityType.MINE]: [LandType.PLAIN],
  [FacilityType.QUARRY]: [LandType.PLAIN],
  [FacilityType.FOREST]: [LandType.PLAIN],
  [FacilityType.RANCH]: [LandType.PLAIN],
  [FacilityType.POWER_PLANT]: [LandType.PLAIN],
  [FacilityType.FIRE_STATION]: [LandType.PLAIN],
  [FacilityType.SCHOOL]: [LandType.PLAIN],
  [FacilityType.PARK]: [LandType.PLAIN],
  [FacilityType.CINEMA]: [LandType.PLAIN],
};

const FacilityTypeSelector: React.FC<FacilityTypeSelectorProps> = memo(({
  selectedType,
  onTypeSelect,
  compatibleLandTypes = [LandType.MARINE, LandType.COASTAL, LandType.PLAIN],
  showOnlyCompatible = false,
  showBuildableOnly = false,
  selectedTileId,
  showCosts = false,
  facilityCosts,
  className,
}) => {
  const { t } = useTranslation(['facilityManagement', 'common']);

  // Create facility options
  const filteredFacilities: FacilityOption[] = useMemo(() => {
    const facilityTypes = Object.values(FacilityType);
    if (!facilityTypes || facilityTypes.length === 0) {
      return [];
    }

    return facilityTypes
      .map((type) => {
        const name = t(`facilityManagement.FACILITY_TYPE_${type}`);
        const icon = StudentFacilityService.getFacilityIcon(type);
        const category = StudentFacilityService.getFacilityCategory(type) as FacilityCategory;
        const typeCompatibility = LAND_TYPE_COMPATIBILITY[type] || [];
        const compatible = typeCompatibility.some(landType => compatibleLandTypes?.includes(landType));
        
        // For now, assume all compatible facilities are buildable
        // In a real implementation, you would check build validation here
        const buildable = compatible && (!showBuildableOnly || compatible);

        return {
          type,
          name,
          icon,
          category: category as FacilityCategory,
          compatible,
          buildable,
        };
      })
      .filter((facility) => {
        // Compatibility filter
        if (showOnlyCompatible && !facility.compatible) {
          return false;
        }

        // Buildable filter
        if (showBuildableOnly && !facility.buildable) {
          return false;
        }

        return true;
      });
  }, [compatibleLandTypes, showBuildableOnly, showOnlyCompatible, t]);


  const handleFacilitySelect = useCallback((type: FacilityType) => {
    onTypeSelect(type);
  }, [onTypeSelect]);


  return (
    <Box className={className}>
      {/* Facility Grid */}
      <Grid container spacing={2}>
        {filteredFacilities && filteredFacilities.length > 0 ? (
          filteredFacilities.map((facility) => (
            <Grid item xs={6} sm={4} md={3} key={facility.type}>
              <Card
                onClick={() => handleFacilitySelect(facility.type)}
                sx={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease-in-out',
                  border: '2px solid',
                  borderColor: selectedType === facility.type ? 'primary.main' : 'transparent',
                  outline: '1px solid',
                  outlineColor: 'divider',
                  bgcolor: selectedType === facility.type ? 'action.selected' : 'background.paper',
                  opacity: (facility.compatible && facility.buildable !== false) ? 1 : 0.5,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <CardContent 
                  sx={{ 
                    p: 2, 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:last-child': { pb: 2 } 
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: selectedType === facility.type ? 'primary.main' : 
                               (facility.compatible && facility.buildable !== false) ? 'primary.light' : 'grey.400',
                      width: 48,
                      height: 48,
                      fontSize: '1.5rem',
                      mb: 1,
                    }}
                  >
                    {facility.icon}
                  </Avatar>
                  <Typography 
                    variant="body2" 
                    fontWeight={selectedType === facility.type ? 'bold' : 'medium'}
                    textAlign="center"
                    noWrap
                    sx={{ width: '100%' }}
                  >
                    {facility.name}
                  </Typography>
                  
                  {/* Compatibility Indicator - Small and subtle */}
                  {!facility.compatible && (
                    <Typography 
                      variant="caption" 
                      color="error"
                      sx={{ mt: 0.5, fontSize: '0.65rem' }}
                    >
                      {t('facilityManagement.NOT_COMPATIBLE')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : null}
      </Grid>

      {/* No Results */}
      {filteredFacilities.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('facilityManagement:NO_FACILITIES_FOUND')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('facilityManagement:NO_COMPATIBLE_FACILITIES')}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

FacilityTypeSelector.displayName = 'FacilityTypeSelector';

export default FacilityTypeSelector;