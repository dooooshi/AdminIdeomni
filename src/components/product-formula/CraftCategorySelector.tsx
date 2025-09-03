'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  ListSubheader
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Factory as FactoryIcon,
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { 
  CraftCategory, 
  ProductFormulaCraftCategory,
  CraftCategoryTypes,
  TechnologyLevels 
} from '@/lib/types/productFormula';
import ProductFormulaService from '@/lib/services/productFormulaService';

interface CraftCategorySelectorProps {
  craftCategories: ProductFormulaCraftCategory[];
  onChange: (craftCategories: ProductFormulaCraftCategory[]) => void;
}

const CraftCategorySelector: React.FC<CraftCategorySelectorProps> = ({
  craftCategories,
  onChange
}) => {
  const { t } = useTranslation();
  const [availableCategories, setAvailableCategories] = useState<CraftCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCraftCategories();
  }, []);

  const loadCraftCategories = async () => {
    setLoading(true);
    try {
      const response = await ProductFormulaService.getAllCraftCategories({
        isActive: true
      });
      setAvailableCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to load craft categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!selectedCategoryId) return;

    const category = availableCategories.find(c => c.id === selectedCategoryId);
    if (!category) return;

    const existingCategory = craftCategories.find(
      cc => cc.craftCategory?.categoryType === category.categoryType
    );

    if (existingCategory) {
      alert(t('productFormula.duplicateCategoryType'));
      return;
    }

    const newCraftCategory: ProductFormulaCraftCategory = {
      craftCategoryId: category.id,
      craftCategory: category
    };

    onChange([...craftCategories, newCraftCategory]);
    setSelectedCategoryId('');
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = craftCategories.filter((_, i) => i !== index);
    onChange(newCategories);
  };

  const getTechnologyLevelColor = (level: string) => {
    const colors: { [key: string]: any } = {
      LEVEL_1: 'default',
      LEVEL_2: 'primary',
      LEVEL_3: 'secondary',
      LEVEL_4: 'error'
    };
    return colors[level] || 'default';
  };

  const getCategoryTypeLabel = (type: string) => {
    return t(`productFormula.categoryTypes.${type}`);
  };

  const getTechnologyLevelLabel = (level: string) => {
    return t(`productFormula.technologyLevels.${level}`);
  };

  const groupedCategories = availableCategories.reduce((acc, category) => {
    if (!acc[category.categoryType]) {
      acc[category.categoryType] = [];
    }
    acc[category.categoryType].push(category);
    return acc;
  }, {} as { [key: string]: CraftCategory[] });

  const getUsedCategoryTypes = () => {
    return new Set(craftCategories.map(cc => cc.craftCategory?.categoryType));
  };

  const usedTypes = getUsedCategoryTypes();

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('productFormula.addCraftCategory')}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl fullWidth size="small">
            <InputLabel>{t('productFormula.selectCraftCategory')}</InputLabel>
            <Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value as number)}
              label={t('productFormula.selectCraftCategory')}
            >
              {Object.entries(groupedCategories).map(([categoryType, categories]) => [
                <ListSubheader key={categoryType}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FactoryIcon fontSize="small" />
                    <Typography variant="subtitle2">
                      {getCategoryTypeLabel(categoryType)}
                    </Typography>
                    {usedTypes.has(categoryType) && (
                      <Chip label={t('productFormula.used')} size="small" color="warning" />
                    )}
                  </Stack>
                </ListSubheader>,
                ...categories.map(category => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                    disabled={usedTypes.has(category.categoryType)}
                  >
                    <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          {category.name || `${category.nameEn} (${category.nameZh})`}
                        </Typography>
                        <Chip
                          label={getTechnologyLevelLabel(category.technologyLevel)}
                          size="small"
                          color={getTechnologyLevelColor(category.technologyLevel)}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {t('productFormula.yield')}: {category.yieldPercentage}%
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
          <IconButton
            color="primary"
            onClick={handleAddCategory}
            disabled={!selectedCategoryId}
          >
            <AddIcon />
          </IconButton>
        </Stack>
        {craftCategories.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('productFormula.noCraftCategory')}
          </Alert>
        )}
      </Paper>

      {craftCategories.length > 0 && (
        <Grid container spacing={2}>
          {craftCategories.map((cc, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {cc.craftCategory?.name || `${cc.craftCategory?.nameEn} (${cc.craftCategory?.nameZh})`}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                          label={getCategoryTypeLabel(cc.craftCategory?.categoryType || '')}
                          size="small"
                          icon={<FactoryIcon />}
                        />
                        <Chip
                          label={getTechnologyLevelLabel(cc.craftCategory?.technologyLevel || '')}
                          size="small"
                          color={getTechnologyLevelColor(cc.craftCategory?.technologyLevel || '')}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('productFormula.yield')}: {cc.craftCategory?.yieldPercentage}%
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('productFormula.setupCosts')}:
                          </Typography>
                          <Stack spacing={0.5}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <WaterIcon fontSize="small" color="primary" />
                              <Typography variant="caption">
                                {cc.craftCategory?.costs?.fixed?.water || cc.craftCategory?.fixedWaterCost || 0}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PowerIcon fontSize="small" color="warning" />
                              <Typography variant="caption">
                                {cc.craftCategory?.costs?.fixed?.power || cc.craftCategory?.fixedPowerCost || 0}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <MoneyIcon fontSize="small" color="success" />
                              <Typography variant="caption">
                                {cc.craftCategory?.costs?.fixed?.gold || cc.craftCategory?.fixedGoldCost || 0}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('productFormula.variablePercents')}:
                          </Typography>
                          <Stack spacing={0.5}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <WaterIcon fontSize="small" color="primary" />
                              <Typography variant="caption">
                                {cc.craftCategory?.costs?.variable?.water || cc.craftCategory?.variableWaterPercent || 0}%
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PowerIcon fontSize="small" color="warning" />
                              <Typography variant="caption">
                                {cc.craftCategory?.costs?.variable?.power || cc.craftCategory?.variablePowerPercent || 0}%
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <MoneyIcon fontSize="small" color="success" />
                              <Typography variant="caption">
                                {cc.craftCategory?.costs?.variable?.gold || cc.craftCategory?.variableGoldPercent || 0}%
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveCategory(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CraftCategorySelector;