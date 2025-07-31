'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Badge,
} from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import type { LandType, FacilityCategory } from '@/types/facilities';
import { FacilityType } from '@/types/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from 'react-i18next';

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
  description: string;
  compatible: boolean;
  buildable?: boolean;
  cost?: { gold: number; carbon: number; total: number };
}

const FACILITY_CATEGORIES = [
  'ALL',
  'RAW_MATERIAL_PRODUCTION',
  'FUNCTIONAL',
  'INFRASTRUCTURE',
  'OTHER',
] as const;

const LAND_TYPE_COMPATIBILITY: Record<FacilityType, LandType[]> = {
  // Marine-only and coastal facilities
  [FacilityType.FISHERY]: ['MARINE', 'COASTAL'],
  [FacilityType.WATER_PLANT]: ['MARINE', 'PLAIN'],
  [FacilityType.BASE_STATION]: ['MARINE', 'PLAIN'],
  
  // Coastal and plain facilities
  [FacilityType.FARM]: ['COASTAL', 'PLAIN'],
  [FacilityType.FACTORY]: ['COASTAL', 'PLAIN'],
  [FacilityType.MALL]: ['COASTAL', 'PLAIN'],
  [FacilityType.WAREHOUSE]: ['COASTAL', 'PLAIN'],
  [FacilityType.HOSPITAL]: ['COASTAL', 'PLAIN'],
  
  // Plain-only facilities
  [FacilityType.MINE]: ['PLAIN'],
  [FacilityType.QUARRY]: ['PLAIN'],
  [FacilityType.FOREST]: ['PLAIN'],
  [FacilityType.RANCH]: ['PLAIN'],
  [FacilityType.MEDIA_BUILDING]: ['PLAIN'],
  [FacilityType.POWER_PLANT]: ['PLAIN'],
  [FacilityType.FIRE_STATION]: ['PLAIN'],
  [FacilityType.SCHOOL]: ['PLAIN'],
  [FacilityType.PARK]: ['PLAIN'],
  [FacilityType.CINEMA]: ['PLAIN'],
};

const FacilityTypeSelector: React.FC<FacilityTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  compatibleLandTypes = ['MARINE', 'COASTAL', 'PLAIN'],
  showOnlyCompatible = false,
  showBuildableOnly = false,
  selectedTileId,
  showCosts = false,
  facilityCosts,
  className,
}) => {
  const { t } = useTranslation(['facilityManagement', 'common']);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Create facility options
  const facilityOptions: FacilityOption[] = useMemo(() => {
    const facilityTypes = Object.values(FacilityType);
    if (!facilityTypes || facilityTypes.length === 0) {
      return [];
    }

    return facilityTypes.map((type) => {
      const name = StudentFacilityService.getFacilityTypeName(type);
      const icon = StudentFacilityService.getFacilityIcon(type);
      const category = StudentFacilityService.getFacilityCategory(type) as FacilityCategory;
      const description = t(`facilityManagement:FACILITY_TYPE_${type}_DESCRIPTION`, { defaultValue: '' });
      const typeCompatibility = LAND_TYPE_COMPATIBILITY[type] || [];
      const compatible = typeCompatibility.some(landType => compatibleLandTypes?.includes(landType));
      
      // For now, assume all compatible facilities are buildable
      // In a real implementation, you would check build validation here
      const buildable = compatible && (!showBuildableOnly || compatible);
      
      let cost;
      if (showCosts && facilityCosts?.[type]) {
        const facilityCost = facilityCosts[type];
        cost = {
          gold: facilityCost.gold,
          carbon: facilityCost.carbon,
          total: facilityCost.gold + facilityCost.carbon,
        };
      }

      return {
        type,
        name,
        icon,
        category: category as FacilityCategory,
        description,
        compatible,
        buildable,
        cost,
      };
    });
  }, [compatibleLandTypes, showCosts, facilityCosts, showBuildableOnly, t]);

  // Filter facilities based on category, search, and compatibility
  const filteredFacilities = useMemo(() => {
    if (!facilityOptions || facilityOptions.length === 0) {
      return [];
    }

    return facilityOptions.filter((facility) => {
      // Category filter
      if (selectedCategory !== 'ALL' && facility.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !facility.name.toLowerCase().includes(searchLower) &&
          !facility.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

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
  }, [facilityOptions, selectedCategory, searchTerm, showOnlyCompatible, showBuildableOnly]);

  // Count facilities by category for tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!facilityOptions || facilityOptions.length === 0) {
      FACILITY_CATEGORIES.forEach(category => {
        counts[category] = 0;
      });
      return counts;
    }

    FACILITY_CATEGORIES.forEach(category => {
      if (category === 'ALL') {
        counts[category] = facilityOptions.length;
      } else {
        counts[category] = facilityOptions.filter(f => f.category === category).length;
      }
    });
    return counts;
  }, [facilityOptions]);

  const handleCategoryChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const handleFacilitySelect = (type: FacilityType) => {
    onTypeSelect(type);
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'ALL': return t('facilityManagement:ALL_CATEGORIES');
      case 'RAW_MATERIAL_PRODUCTION': return t('facilityManagement:RAW_MATERIAL_PRODUCTION');
      case 'FUNCTIONAL': return t('facilityManagement:FUNCTIONAL');
      case 'INFRASTRUCTURE': return t('facilityManagement:INFRASTRUCTURE');
      case 'OTHER': return t('facilityManagement:OTHER');
      default: return category;
    }
  };

  return (
    <Box className={className}>
      {/* Search */}
      <Box mb={2}>
        <TextField
          fullWidth
          placeholder={t('facilityManagement:SEARCH_FACILITY_TYPES')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {/* Category Tabs */}
      <Box mb={2}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {FACILITY_CATEGORIES.map((category) => (
            <Tab
              key={category}
              value={category}
              label={
                <Badge
                  badgeContent={categoryCounts[category]}
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                >
                  {getCategoryLabel(category)}
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Facility Grid */}
      <Grid container spacing={2}>
        {filteredFacilities && filteredFacilities.length > 0 ? (
          filteredFacilities.map((facility) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={facility.type}>
              <Card
                onClick={() => handleFacilitySelect(facility.type)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: selectedType === facility.type ? 2 : 1,
                  borderColor: selectedType === facility.type ? 'primary.main' : 'divider',
                  opacity: (facility.compatible && facility.buildable !== false) ? 1 : 0.6,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {/* Header with Icon and Name */}
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar
                      sx={{
                        bgcolor: (facility.compatible && facility.buildable !== false) ? 'primary.main' : 'grey.400',
                        width: 40,
                        height: 40,
                        fontSize: '1.2rem',
                      }}
                    >
                      {facility.icon}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {facility.name}
                      </Typography>
                      <Chip
                        label={getCategoryLabel(facility.category)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: 32,
                      mb: 1,
                    }}
                  >
                    {facility.description || ''}
                  </Typography>

                  {/* Cost Information */}
                  {showCosts && facility.cost && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('facilityManagement:BUILD_COST')}:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                        <Chip
                          label={`🪙 ${facility.cost.gold}`}
                          size="small"
                          variant="outlined"
                          color="warning"
                        />
                        <Chip
                          label={`🔥 ${facility.cost.carbon}`}
                          size="small"
                          variant="outlined"
                          color="error"
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Compatibility Indicator */}
                  {!facility.compatible && (
                    <Box mt={1}>
                      <Chip
                        label={t('facilityManagement:NOT_COMPATIBLE', { defaultValue: 'Not Compatible' })}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    </Box>
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
            {searchTerm
              ? t('facilityManagement:NO_SEARCH_RESULTS')
              : t('facilityManagement:NO_COMPATIBLE_FACILITIES')
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FacilityTypeSelector;