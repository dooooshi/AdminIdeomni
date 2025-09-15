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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Close as CloseIcon,
  Science as ScienceIcon,
  Factory as FactoryIcon,
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon,
  Nature as NatureIcon
} from '@mui/icons-material';
import { ProductFormula } from '@/lib/types/productFormula';
import ProductFormulaService from '@/lib/services/productFormulaService';

interface FormulaDetailViewProps {
  open: boolean;
  formulaId: number | null;
  onClose: () => void;
}

const FormulaDetailView: React.FC<FormulaDetailViewProps> = ({
  open,
  formulaId,
  onClose
}) => {
  const { t } = useTranslation();
  const [formula, setFormula] = useState<ProductFormula | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formulaId && open) {
      loadFormulaDetails();
    }
  }, [formulaId, open]);

  const loadFormulaDetails = async () => {
    if (!formulaId) return;
    
    setLoading(true);
    try {
      const data = await ProductFormulaService.getProductFormulaById(formulaId);
      setFormula(data);
    } catch (error) {
      console.error('Failed to load formula details:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!formula) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              {formula.productName || t('productFormula.formulaDetails')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              #{formula.formulaNumber} · {new Date(formula.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          {formula.productDescription && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                {formula.productDescription}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('productFormula.costSummary')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    {t('productFormula.setupCosts')}
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WaterIcon fontSize="small" color="primary" />
                        <Typography variant="body2">{t('productFormula.water')}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="medium">
                        {formula.totalSetupWaterCost}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PowerIcon fontSize="small" color="warning" />
                        <Typography variant="body2">{t('productFormula.power')}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="medium">
                        {formula.totalSetupPowerCost}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MoneyIcon fontSize="small" color="success" />
                        <Typography variant="body2">{t('productFormula.gold')}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="medium">
                        {formula.totalSetupGoldCost}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    {t('productFormula.variablePercents')}
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WaterIcon fontSize="small" color="primary" />
                        <Typography variant="body2">{t('productFormula.water')}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="medium">
                        {formula.totalWaterPercent}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PowerIcon fontSize="small" color="warning" />
                        <Typography variant="body2">{t('productFormula.power')}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="medium">
                        {formula.totalPowerPercent}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MoneyIcon fontSize="small" color="success" />
                        <Typography variant="body2">{t('productFormula.gold')}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="medium">
                        {formula.totalGoldPercent}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('productFormula.materialCost')}:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {formula.totalMaterialCost?.toFixed(2)}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.08)' : 'green.50', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NatureIcon fontSize="small" sx={{ color: 'green' }} />
                    <Typography variant="body2" color="text.secondary">
                      {t('productFormula.carbonEmission')}:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      {formula.productFormulaCarbonEmission?.toFixed(3)}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('productFormula.materials')} ({formula.materials.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('productFormula.material')}</TableCell>
                        <TableCell>{t('productFormula.origin')}</TableCell>
                        <TableCell align="right">{t('productFormula.quantity')}</TableCell>
                        <TableCell align="right">{t('productFormula.cost')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formula.materials.map((material, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {material.rawMaterial?.name || material.rawMaterial?.nameEn}
                            </Typography>
                            {material.rawMaterial?.nameZh && (
                              <Typography variant="caption" color="text.secondary">
                                {material.rawMaterial?.nameZh}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={material.rawMaterial?.origin}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {material.quantity}
                            {material.unit && ` ${material.unit}`}
                          </TableCell>
                          <TableCell align="right">
                            {material.materialCost?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {t('productFormula.totalMaterialCost')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formula.totalMaterialCost?.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('productFormula.craftCategories')} ({formula.craftCategories.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('productFormula.categoryType')}</TableCell>
                        <TableCell>{t('productFormula.technologyLevel')}</TableCell>
                        <TableCell align="center">{t('productFormula.yield')}</TableCell>
                        <TableCell align="center">{t('productFormula.setupCosts')}</TableCell>
                        <TableCell align="center">{t('productFormula.variablePercents')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formula.craftCategories.map((cc, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {cc.craftCategory?.name || cc.craftCategory?.nameEn}
                            </Typography>
                            {cc.craftCategory?.nameZh && (
                              <Typography variant="caption" color="text.secondary">
                                {cc.craftCategory?.nameZh}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                              {cc.craftCategory?.categoryType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={cc.craftCategory?.technologyLevel}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {cc.craftCategory?.yieldPercentage}%
                          </TableCell>
                          <TableCell align="center">
                            <Stack spacing={0.5}>
                              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <WaterIcon sx={{ fontSize: 14 }} color="primary" />
                                <Typography variant="caption">
                                  {cc.craftCategory?.costs?.fixed?.water || cc.craftCategory?.fixedWaterCost || 0}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <PowerIcon sx={{ fontSize: 14 }} color="warning" />
                                <Typography variant="caption">
                                  {cc.craftCategory?.costs?.fixed?.power || cc.craftCategory?.fixedPowerCost || 0}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <MoneyIcon sx={{ fontSize: 14 }} color="success" />
                                <Typography variant="caption">
                                  {cc.craftCategory?.costs?.fixed?.gold || cc.craftCategory?.fixedGoldCost || 0}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            <Stack spacing={0.5}>
                              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <WaterIcon sx={{ fontSize: 14 }} color="primary" />
                                <Typography variant="caption">
                                  {cc.craftCategory?.costs?.variable?.water || cc.craftCategory?.variableWaterPercent || 0}%
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <PowerIcon sx={{ fontSize: 14 }} color="warning" />
                                <Typography variant="caption">
                                  {cc.craftCategory?.costs?.variable?.power || cc.craftCategory?.variablePowerPercent || 0}%
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <MoneyIcon sx={{ fontSize: 14 }} color="success" />
                                <Typography variant="caption">
                                  {cc.craftCategory?.costs?.variable?.gold || cc.craftCategory?.variableGoldPercent || 0}%
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
          </Grid>

        </Stack>
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Button onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormulaDetailView;