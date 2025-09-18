'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Science as ScienceIcon,
  Factory as FactoryIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Water as WaterIcon,
  Bolt as PowerIcon,
  MonetizationOn as GoldIcon,
  Park as EcoIcon
} from '@mui/icons-material';
import { ManagerProductFormula } from '@/lib/types/managerProductFormula';
import ManagerProductFormulaService from '@/lib/services/managerProductFormulaService';
import { format } from 'date-fns';

interface ManagerFormulaDetailViewProps {
  open: boolean;
  formulaId: number;
  onClose: () => void;
}

const ManagerFormulaDetailView: React.FC<ManagerFormulaDetailViewProps> = ({
  open,
  formulaId,
  onClose
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formula, setFormula] = useState<ManagerProductFormula | null>(null);

  useEffect(() => {
    if (open && formulaId) {
      loadFormulaDetails();
    }
  }, [open, formulaId]);

  const loadFormulaDetails = async () => {
    setLoading(true);
    try {
      const data = await ManagerProductFormulaService.getProductFormulaById(formulaId);
      setFormula(data);
    } catch (error) {
      console.error('Failed to load formula details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const getOriginColor = (origin: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      MINE: 'error',
      QUARRY: 'warning',
      FOREST: 'success',
      FARM: 'primary',
      RANCH: 'secondary',
      FISHERY: 'info',
      SHOPS: 'default'
    };
    return colorMap[origin] || 'default';
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {t('managerProductFormula.formulaDetails')}
          </Typography>
          {formula && (
            <Stack direction="row" spacing={1}>
              {formula.isLocked ? (
                <Chip
                  label={t('managerProductFormula.locked')}
                  size="small"
                  color="error"
                  icon={<LockIcon fontSize="small" />}
                />
              ) : (
                <Chip
                  label={t('managerProductFormula.active')}
                  size="small"
                  color="success"
                  icon={<UnlockIcon fontSize="small" />}
                />
              )}
              <Chip
                label={`#${formula.formulaNumber}`}
                size="small"
                color="primary"
              />
            </Stack>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : formula ? (
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="h5" gutterBottom>
                    {formula.productName}
                  </Typography>
                  {formula.productDescription && (
                    <Typography variant="body2" color="textSecondary">
                      {formula.productDescription}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {t('managerProductFormula.createdAt')}:
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(formula.createdAt), t('managerProductFormula.dateFormat'))}
                      </Typography>
                    </Stack>
                    {formula.createdBy && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {t('managerProductFormula.createdBy')}:
                        </Typography>
                        <Typography variant="body2">
                          {formula.createdBy}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {formula.activity && (
                    <Stack spacing={1}>
                      <Typography variant="body2" color="textSecondary">
                        {t('managerProductFormula.activity')}:
                      </Typography>
                      <Typography variant="body2">
                        {formula.activity.name}
                      </Typography>
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {formula.mtoUsage && (formula.mtoUsage.totalRequirements > 0) && (
              <Alert severity="info">
                {t('managerProductFormula.mtoUsageInfo', {
                  type1: formula.mtoUsage.type1Count,
                  type2: formula.mtoUsage.type2Count,
                  total: formula.mtoUsage.totalRequirements
                })}
              </Alert>
            )}

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <ScienceIcon color="primary" />
                <Typography variant="h6">
                  {t('managerProductFormula.materials')} ({formula.materials?.length || 0})
                </Typography>
              </Stack>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('managerProductFormula.materialNumber')}</TableCell>
                      <TableCell>{t('managerProductFormula.materialName')}</TableCell>
                      <TableCell>{t('managerProductFormula.origin')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.quantity')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.unitCost')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.totalCost')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.carbonEmission')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formula.materials?.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>#{material.rawMaterial?.materialNumber}</TableCell>
                        <TableCell>
                          {material.rawMaterial?.name || material.rawMaterial?.nameEn}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={material.rawMaterial?.origin}
                            size="small"
                            color={getOriginColor(material.rawMaterial?.origin || '')}
                          />
                        </TableCell>
                        <TableCell align="right">{formatNumber(material.quantity, 3)}</TableCell>
                        <TableCell align="right">
                          ${formatNumber(Number(material.rawMaterial?.totalCost || 0))}
                        </TableCell>
                        <TableCell align="right">
                          ${formatNumber(material.quantity * Number(material.rawMaterial?.totalCost || 0))}
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(material.quantity * Number(material.rawMaterial?.carbonEmission || 0), 3)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <FactoryIcon color="primary" />
                <Typography variant="h6">
                  {t('managerProductFormula.craftCategories')} ({formula.craftCategories?.length || 0})
                </Typography>
              </Stack>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('managerProductFormula.categoryType')}</TableCell>
                      <TableCell>{t('managerProductFormula.technologyLevel')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.fixedCosts')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.variablePercentages')}</TableCell>
                      <TableCell align="right">{t('managerProductFormula.yield')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formula.craftCategories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.craftCategory?.nameEn}
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
                              <WaterIcon fontSize="inherit" /> {category.craftCategory?.fixedWaterCost}
                            </Typography>
                            <Typography variant="caption">
                              <PowerIcon fontSize="inherit" /> {category.craftCategory?.fixedPowerCost}
                            </Typography>
                            <Typography variant="caption">
                              <GoldIcon fontSize="inherit" /> ${category.craftCategory?.fixedGoldCost}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack spacing={0.5}>
                            <Typography variant="caption">
                              <WaterIcon fontSize="inherit" /> {category.craftCategory?.variableWaterPercent}%
                            </Typography>
                            <Typography variant="caption">
                              <PowerIcon fontSize="inherit" /> {category.craftCategory?.variablePowerPercent}%
                            </Typography>
                            <Typography variant="caption">
                              <GoldIcon fontSize="inherit" /> {category.craftCategory?.variableGoldPercent}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          {category.craftCategory?.yieldPercentage}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('managerProductFormula.costSummary')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('managerProductFormula.totalMaterialCost')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${formatNumber(formula.totalMaterialCost)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('managerProductFormula.totalSetupCost')}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      <WaterIcon fontSize="small" /> {formula.totalSetupWaterCost}
                    </Typography>
                    <Typography variant="body2">
                      <PowerIcon fontSize="small" /> {formula.totalSetupPowerCost}
                    </Typography>
                    <Typography variant="body2">
                      <GoldIcon fontSize="small" /> ${formatNumber(formula.totalSetupGoldCost)}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('managerProductFormula.totalVariablePercent')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {formatNumber(formula.totalPercent)}%
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('managerProductFormula.carbonEmission')}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EcoIcon color="success" />
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatNumber(formula.productFormulaCarbonEmission, 3)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        ) : (
          <Alert severity="error">
            {t('managerProductFormula.errors.loadFailed')}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagerFormulaDetailView;