'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Checkbox,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Factory as FactoryIcon
} from '@mui/icons-material';
import { ManagerCraftCategory, ManagerProductFormulaCraftCategory } from '@/lib/types/managerProductFormula';
import ManagerProductFormulaService from '@/lib/services/managerProductFormulaService';

interface ManagerCraftCategorySelectorProps {
  craftCategories: ManagerProductFormulaCraftCategory[];
  onChange: (categories: ManagerProductFormulaCraftCategory[]) => void;
  disabled?: boolean;
}

const ManagerCraftCategorySelector: React.FC<ManagerCraftCategorySelectorProps> = ({
  craftCategories,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<ManagerCraftCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');

  useEffect(() => {
    if (dialogOpen) {
      loadAvailableCategories();
    }
  }, [dialogOpen, filterType, filterLevel]);

  const loadAvailableCategories = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType) params.categoryType = filterType;
      if (filterLevel) params.technologyLevel = filterLevel;

      const response = await ManagerProductFormulaService.getCraftCategories(params);
      setAvailableCategories(response || []);
    } catch (error) {
      console.error('Failed to load craft categories:', error);
      setAvailableCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategories = () => {
    const existingCategoryIds = new Set(craftCategories.map(c => c.craftCategoryId));
    const existingCategoryTypes = new Set(
      craftCategories
        .map(c => c.craftCategory?.categoryType)
        .filter(Boolean)
    );

    const newCategories: ManagerProductFormulaCraftCategory[] = [];
    const duplicateTypes: string[] = [];

    selectedCategories.forEach(categoryId => {
      if (!existingCategoryIds.has(categoryId)) {
        const category = availableCategories.find(c => c.id === categoryId);
        if (category) {
          if (existingCategoryTypes.has(category.categoryType)) {
            duplicateTypes.push(category.categoryType);
          } else {
            newCategories.push({
              craftCategoryId: categoryId,
              craftCategory: category
            });
            existingCategoryTypes.add(category.categoryType);
          }
        }
      }
    });

    if (duplicateTypes.length > 0) {
      alert(t('managerProductFormula.errors.duplicateCategoryType', { types: duplicateTypes.join(', ') }));
    }

    if (newCategories.length > 0) {
      onChange([...craftCategories, ...newCategories]);
    }

    setDialogOpen(false);
    setSelectedCategories(new Set());
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = [...craftCategories];
    newCategories.splice(index, 1);
    onChange(newCategories);
  };

  const handleToggleCategory = (categoryId: number) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const getTechnologyLevelColor = (level: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      LEVEL_1: 'default',
      LEVEL_2: 'primary',
      LEVEL_3: 'warning',
      LEVEL_4: 'error'
    };
    return colorMap[level] || 'default';
  };

  const categoryTypes = [
    'MECHANICAL_MANUFACTURING',
    'CHEMICAL_ENGINEERING',
    'ELECTRONIC_EQUIPMENT',
    'FOOD_PROCESSING',
    'TEXTILE_CLOTHING',
    'WOOD_PROCESSING',
    'PRECISION_MANUFACTURING'
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="medium">
          {t('managerProductFormula.craftCategories')} ({craftCategories.length})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={disabled}
        >
          {t('managerProductFormula.addCraftCategories')}
        </Button>
      </Stack>

      {craftCategories.length === 0 ? (
        <Alert severity="info">
          {t('managerProductFormula.noCraftCategoriesAdded')}
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('managerProductFormula.categoryType')}</TableCell>
                <TableCell>{t('managerProductFormula.technologyLevel')}</TableCell>
                <TableCell align="right">{t('managerProductFormula.fixedCosts')}</TableCell>
                <TableCell align="right">{t('managerProductFormula.variablePercentages')}</TableCell>
                <TableCell align="right">{t('managerProductFormula.yield')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {craftCategories.map((category, index) => (
                <TableRow key={`${category.craftCategoryId}-${index}`}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FactoryIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {category.craftCategory?.nameEn}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.craftCategory?.technologyLevel}
                      size="small"
                      color={getTechnologyLevelColor(category.craftCategory?.technologyLevel || '')}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack spacing={0.5}>
                      <Typography variant="caption">
                        W: {category.craftCategory?.fixedWaterCost}
                      </Typography>
                      <Typography variant="caption">
                        P: {category.craftCategory?.fixedPowerCost}
                      </Typography>
                      <Typography variant="caption">
                        G: ${category.craftCategory?.fixedGoldCost}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack spacing={0.5}>
                      <Typography variant="caption">
                        W: {category.craftCategory?.variableWaterPercent}%
                      </Typography>
                      <Typography variant="caption">
                        P: {category.craftCategory?.variablePowerPercent}%
                      </Typography>
                      <Typography variant="caption">
                        G: {category.craftCategory?.variableGoldPercent}%
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    {category.craftCategory?.yieldPercentage}%
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveCategory(index)}
                      disabled={disabled}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{t('managerProductFormula.selectCraftCategories')}</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{t('managerProductFormula.filterByType')}</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label={t('managerProductFormula.filterByType')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {categoryTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('managerProductFormula.filterByLevel')}</InputLabel>
              <Select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                label={t('managerProductFormula.filterByLevel')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="LEVEL_1">Level 1</MenuItem>
                <MenuItem value="LEVEL_2">Level 2</MenuItem>
                <MenuItem value="LEVEL_3">Level 3</MenuItem>
                <MenuItem value="LEVEL_4">Level 4</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">{t('common.select')}</TableCell>
                    <TableCell>{t('managerProductFormula.categoryType')}</TableCell>
                    <TableCell>{t('managerProductFormula.technologyLevel')}</TableCell>
                    <TableCell align="right">{t('managerProductFormula.fixedCosts')}</TableCell>
                    <TableCell align="right">{t('managerProductFormula.variablePercentages')}</TableCell>
                    <TableCell align="right">{t('managerProductFormula.yield')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableCategories.map((category) => {
                    const isSelected = selectedCategories.has(category.id);
                    const isAdded = craftCategories.some(c => c.craftCategoryId === category.id);
                    const isSameTypeAdded = craftCategories.some(
                      c => c.craftCategory?.categoryType === category.categoryType
                    );

                    return (
                      <TableRow
                        key={category.id}
                        hover
                        selected={isSelected}
                        sx={{ opacity: isAdded || isSameTypeAdded ? 0.5 : 1 }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggleCategory(category.id)}
                            disabled={isAdded || isSameTypeAdded}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {category.nameEn}
                            </Typography>
                            {(isAdded || isSameTypeAdded) && (
                              <Chip
                                label={
                                  isAdded
                                    ? t('managerProductFormula.alreadyAdded')
                                    : t('managerProductFormula.sameTypeExists')
                                }
                                size="small"
                                color="default"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={category.technologyLevel}
                            size="small"
                            color={getTechnologyLevelColor(category.technologyLevel)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack spacing={0.5}>
                            <Typography variant="caption">
                              W: {category.fixedWaterCost}
                            </Typography>
                            <Typography variant="caption">
                              P: {category.fixedPowerCost}
                            </Typography>
                            <Typography variant="caption">
                              G: ${category.fixedGoldCost}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack spacing={0.5}>
                            <Typography variant="caption">
                              W: {category.variableWaterPercent}%
                            </Typography>
                            <Typography variant="caption">
                              P: {category.variablePowerPercent}%
                            </Typography>
                            <Typography variant="caption">
                              G: {category.variableGoldPercent}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          {category.yieldPercentage}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCategories}
            disabled={selectedCategories.size === 0}
          >
            {t('managerProductFormula.addSelected')} ({selectedCategories.size})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerCraftCategorySelector;