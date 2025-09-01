'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { RawMaterial } from '@/types/rawMaterialProduction';
import rawMaterialProductionService from '@/lib/services/rawMaterialProductionService';

interface RawMaterialSelectorProps {
  selectedMaterial?: RawMaterial;
  onSelect: (material: RawMaterial) => void;
  facilityType?: string;
  disabled?: boolean;
}

const RawMaterialSelector: React.FC<RawMaterialSelectorProps> = ({
  selectedMaterial,
  onSelect,
  facilityType,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');

  useEffect(() => {
    loadMaterials();
  }, [facilityType, selectedOrigin]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await rawMaterialProductionService.getRawMaterials({
        origin: selectedOrigin || undefined,
        search: searchTerm || undefined
      });
      
      let filteredMaterials = response.data.materials;
      
      // Filter by facility type if provided
      if (facilityType) {
        filteredMaterials = filteredMaterials.filter(
          (m: RawMaterial) => m.requiredFacilityType === facilityType
        );
      }
      
      setMaterials(filteredMaterials);
    } catch (error) {
      console.error('Failed to load materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Debounce search
    setTimeout(() => loadMaterials(), 300);
  };

  const getOriginColor = (origin: string) => {
    const colors: Record<string, string> = {
      MINE: 'error',
      QUARRY: 'warning',
      FOREST: 'success',
      FARM: 'primary',
      RANCH: 'secondary',
      FISHERY: 'info'
    };
    return colors[origin] || 'default';
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder={t('production.searchMaterials')}
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('production.origin')}</InputLabel>
          <Select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            label={t('production.origin')}
          >
            <MenuItem value="">
              <em>{t('common.all')}</em>
            </MenuItem>
            <MenuItem value="MINE">{t('production.origins.mine')}</MenuItem>
            <MenuItem value="QUARRY">{t('production.origins.quarry')}</MenuItem>
            <MenuItem value="FOREST">{t('production.origins.forest')}</MenuItem>
            <MenuItem value="FARM">{t('production.origins.farm')}</MenuItem>
            <MenuItem value="RANCH">{t('production.origins.ranch')}</MenuItem>
            <MenuItem value="FISHERY">{t('production.origins.fishery')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <FormControl fullWidth disabled={disabled}>
        <InputLabel>{t('production.selectMaterial')}</InputLabel>
        <Select
          value={selectedMaterial?.id || ''}
          onChange={(e) => {
            const material = materials.find(m => m.id === e.target.value);
            if (material) onSelect(material);
          }}
          label={t('production.selectMaterial')}
        >
          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} />
            </MenuItem>
          ) : (
            materials.map((material) => (
              <MenuItem key={material.id} value={material.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      {material.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('production.materialNumber')}: {material.materialNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={material.origin}
                      size="small"
                      color={getOriginColor(material.origin) as any}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {t('production.cost')}: {material.totalCost}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {selectedMaterial && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('production.materialDetails')}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t('production.waterRequired')}: {selectedMaterial.waterRequired}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('production.powerRequired')}: {selectedMaterial.powerRequired}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('production.goldCost')}: {selectedMaterial.goldCost}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('production.carbonEmission')}: {selectedMaterial.carbonEmission}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RawMaterialSelector;