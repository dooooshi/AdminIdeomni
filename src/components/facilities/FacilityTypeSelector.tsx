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
  buildableFacilities?: FacilityType[]; // New prop for API-based buildable facilities
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

// Memoized card component to prevent re-renders
const FacilityCard = memo(({
  facility,
  isSelected,
  onSelect,
  t
}: {
  facility: FacilityOption;
  isSelected: boolean;
  onSelect: (type: FacilityType) => void;
  t: any
}) => {
  const handleClick = useCallback(() => {
    onSelect(facility.type);
  }, [facility.type, onSelect]);

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        outline: '1px solid',
        outlineColor: 'divider',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        opacity: (facility.compatible && facility.buildable !== false) ? 1 : 0.5,
        height: 100,
        display: 'flex',
        flexDirection: 'column',
        transform: 'scale(1)',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'scale(1.02)',
        },
        '&:active': {
          transform: 'scale(0.98)',
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
            bgcolor: isSelected ? 'primary.main' :
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
          fontWeight={isSelected ? 'bold' : 'medium'}
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
  );
});

FacilityCard.displayName = 'FacilityCard';

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
  buildableFacilities,
}) => {
  const { t } = useTranslation();

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

        // Use API-provided buildable facilities if available, otherwise fall back to hardcoded compatibility
        let compatible = false;
        let buildable = false;

        if (buildableFacilities && buildableFacilities.length > 0) {
          // Use API-based buildable facilities list
          compatible = buildableFacilities.includes(type);
          buildable = compatible;
        } else {
          // Fall back to hardcoded compatibility (for backward compatibility)
          const typeCompatibility = LAND_TYPE_COMPATIBILITY[type] || [];
          compatible = typeCompatibility.some(landType => compatibleLandTypes?.includes(landType));
          buildable = compatible && (!showBuildableOnly || compatible);
        }

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
  }, [compatibleLandTypes, showBuildableOnly, showOnlyCompatible, t, buildableFacilities]);

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
              <FacilityCard
                facility={facility}
                isSelected={selectedType === facility.type}
                onSelect={handleFacilitySelect}
                t={t}
              />
            </Grid>
          ))
        ) : null}
      </Grid>

      {/* No Results */}
      {filteredFacilities.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('facilityManagement.NO_FACILITIES_FOUND')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('facilityManagement.NO_COMPATIBLE_FACILITIES')}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

FacilityTypeSelector.displayName = 'FacilityTypeSelector';

export default FacilityTypeSelector;