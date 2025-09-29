'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Chip,
  Autocomplete,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { RawMaterial, MaterialRequirement } from '@/lib/types/productFormula';
import ProductFormulaService from '@/lib/services/productFormulaService';

interface MaterialSelectorProps {
  materials: MaterialRequirement[];
  onChange: (materials: MaterialRequirement[]) => void;
  maxMaterials?: number;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  materials,
  onChange,
  maxMaterials = 99
}) => {
  const { t } = useTranslation();
  const [availableMaterials, setAvailableMaterials] = useState<RawMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async (search?: string) => {
    setLoading(true);
    try {
      const response = await ProductFormulaService.getAllRawMaterials({
        isActive: true,
        search
      });
      setAvailableMaterials(response.materials || []);
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial || !quantity) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0.001 || qty > 999.999) {
      alert(t('productFormula.invalidQuantity'));
      return;
    }

    if (materials.some(m => m.rawMaterialId === selectedMaterial.id)) {
      alert(t('productFormula.duplicateMaterial'));
      return;
    }

    if (materials.length >= maxMaterials) {
      alert(t('productFormula.maxMaterialsReached'));
      return;
    }

    const newMaterial: MaterialRequirement = {
      rawMaterialId: selectedMaterial.id,
      rawMaterial: selectedMaterial,
      quantity: qty,
      unit: selectedMaterial.unit,
      materialCost: qty * selectedMaterial.totalCost
    };

    onChange([...materials, newMaterial]);
    setSelectedMaterial(null);
    setQuantity('1');
    setSearchInput('');
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    onChange(newMaterials);
  };

  const handleQuantityChange = (index: number, newQuantity: string) => {
    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty < 0.001 || qty > 999.999) return;

    const newMaterials = materials.map((m, i) => {
      if (i === index) {
        return {
          ...m,
          quantity: qty,
          materialCost: qty * (m.rawMaterial?.totalCost || 0)
        };
      }
      return m;
    });
    onChange(newMaterials);
  };

  const getTotalCost = () => {
    return materials.reduce((sum, m) => sum + (m.materialCost || 0), 0);
  };

  const getOriginColor = (origin: string) => {
    const colors: { [key: string]: any } = {
      FARM: 'success',
      RANCH: 'warning',
      MINE: 'info',
      QUARRY: 'secondary',
      FOREST: 'success',
      FISHERY: 'primary',
      SHOPS: 'error'
    };
    return colors[origin] || 'default';
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('productFormula.addMaterial')}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Autocomplete
            options={availableMaterials}
            value={selectedMaterial}
            onChange={(_, value) => setSelectedMaterial(value)}
            inputValue={searchInput}
            onInputChange={(_, value) => {
              setSearchInput(value);
              if (value.length > 2) {
                loadMaterials(value);
              }
            }}
            getOptionLabel={(option) => option.name || `${option.nameEn || ''} (${option.nameZh || ''})`}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props as any;
              return (
                <Box component="li" key={key} {...otherProps}>
                  <Stack spacing={0.5} sx={{ width: '100%' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        {option.name || `${option.nameEn || ''} (${option.nameZh || ''})`.trim()}
                      </Typography>
                      <Chip
                        label={t(`rawMaterial.origin.${option.origin}`)}
                        size="small"
                        color={getOriginColor(option.origin)}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        {t('productFormula.cost')}: {option.totalCost}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              );
            }}
            sx={{ flex: 1 }}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('productFormula.selectMaterial')}
                size="small"
              />
            )}
          />
          <TextField
            label={t('productFormula.quantity')}
            type="number"
            size="small"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{
              min: 0.001,
              max: 999.999,
              step: 0.001
            }}
            sx={{ width: 150 }}
          />
          <IconButton
            color="primary"
            onClick={handleAddMaterial}
            disabled={!selectedMaterial || !quantity}
          >
            <AddIcon />
          </IconButton>
        </Stack>
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('productFormula.materialLimit', { current: materials.length, max: maxMaterials })}
        </Alert>
      </Paper>

      {materials.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('productFormula.material')}</TableCell>
                <TableCell>{t('productFormula.origin')}</TableCell>
                <TableCell align="right">{t('productFormula.quantity')}</TableCell>
                <TableCell align="right">{t('productFormula.unitCost')}</TableCell>
                <TableCell align="right">{t('productFormula.totalCost')}</TableCell>
                <TableCell align="center">{t('productFormula.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2">
                      {material.rawMaterial?.name || `${material.rawMaterial?.nameEn || ''} (${material.rawMaterial?.nameZh || ''})`.trim()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={material.rawMaterial?.origin ? t(`rawMaterial.origin.${material.rawMaterial.origin}`) : ''}
                      size="small"
                      color={getOriginColor(material.rawMaterial?.origin || '')}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={material.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      inputProps={{
                        min: 0.001,
                        max: 999.999,
                        step: 0.001
                      }}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {material.rawMaterial?.totalCost?.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {material.materialCost?.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    {t('productFormula.totalMaterialCost')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {getTotalCost().toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MaterialSelector;