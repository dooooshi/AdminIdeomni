'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Stack,
  Slider,
  Chip,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  UpgradeOutlined,
  TrendingUpOutlined,
  MonetizationOnOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  ExpandMoreOutlined,
  InfoOutlined,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from 'react-i18next';
import type {
  TileFacilityInstance,
  UpgradeFacilityRequest,
  UpgradeCostCalculation,
  UpgradeCostApiResponse,
} from '@/types/facilities';
import type { UpgradeCostCalculation as MapUpgradeCostCalculation } from '@/components/map/types';

// Union type to handle both expected interface and actual API response
type UpgradeCostData = UpgradeCostCalculation | UpgradeCostApiResponse;

interface UpgradeFacilityModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (upgradedFacility: TileFacilityInstance) => void;
  facility: TileFacilityInstance | null;
  teamBalance?: {
    gold: number;
    carbon: number;
  };
}

const UpgradeFacilityModal: React.FC<UpgradeFacilityModalProps> = ({
  open,
  onClose,
  onSuccess,
  facility,
  teamBalance,
}) => {
  const { t } = useTranslation(['facilityManagement', 'common']);

  // State management
  const [targetLevel, setTargetLevel] = useState(2);
  const [upgradeCalculation, setUpgradeCalculation] = useState<UpgradeCostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes or facility changes
  useEffect(() => {
    if (open && facility) {
      const maxLevel = 10; // Could come from facility config
      const nextLevel = Math.min(facility.level + 1, maxLevel);
      setTargetLevel(nextLevel);
      setError(null);
      setUpgradeCalculation(null);
    }
  }, [open, facility]);

  // Calculate upgrade costs when target level changes
  useEffect(() => {
    if (facility && targetLevel > facility.level) {
      calculateUpgradeCosts();
    }
  }, [facility, targetLevel]);

  const calculateUpgradeCosts = async () => {
    if (!facility) return;

    try {
      setLoading(true);
      setError(null);

      const calculation = await StudentFacilityService.calculateUpgradeCosts({
        facilityType: facility.facilityType,
        fromLevel: facility.level,
        toLevel: targetLevel,
      });

      setUpgradeCalculation(calculation);
    } catch (err) {
      console.error('Failed to calculate upgrade costs:', err);
      setError(t('facilityManagement:UPGRADE_CALCULATION_ERROR'));
      setUpgradeCalculation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!facility || !upgradeCalculation) return;

    try {
      setUpgrading(true);
      setError(null);

      const request: UpgradeFacilityRequest = {
        targetLevel: targetLevel,
      };

      const upgradedFacility = await StudentFacilityService.upgradeFacility(facility.id, request);
      onSuccess(upgradedFacility);
      onClose();
    } catch (err) {
      console.error('Upgrade failed:', err);
      setError(t('facilityManagement:FACILITY_UPGRADE_ERROR'));
    } finally {
      setUpgrading(false);
    }
  };

  // Helper functions to handle different interface structures
  const getTotalGoldCost = (calc: UpgradeCostData | null): number => {
    if (!calc) return 0;
    // Try API response structure first (actual response format)
    if ('totalCost' in calc && calc.totalCost?.gold) {
      return calc.totalCost.gold;
    }
    // Try facilities interface structure
    if ('totalUpgradeCost' in calc && calc.totalUpgradeCost?.gold) {
      return calc.totalUpgradeCost.gold;
    }
    return 0;
  };

  const getTotalCarbonCost = (calc: UpgradeCostData | null): number => {
    if (!calc) return 0;
    // Try API response structure first (actual response format)
    if ('totalCost' in calc && calc.totalCost?.carbon) {
      return calc.totalCost.carbon;
    }
    // Try facilities interface structure
    if ('totalUpgradeCost' in calc && calc.totalUpgradeCost?.carbon) {
      return calc.totalUpgradeCost.carbon;
    }
    return 0;
  };

  const getLevelCosts = (calc: UpgradeCostData | null) => {
    if (!calc) return [];
    // Try API response structure first (actual response format)
    if ('upgradeCosts' in calc && calc.upgradeCosts) {
      return calc.upgradeCosts;
    }
    // Try facilities interface structure
    if ('levelCosts' in calc && calc.levelCosts) {
      return calc.levelCosts;
    }
    return [];
  };

  const canAffordUpgrade = () => {
    if (!upgradeCalculation || !teamBalance) return false;
    return (
      teamBalance.gold >= getTotalGoldCost(upgradeCalculation) &&
      teamBalance.carbon >= getTotalCarbonCost(upgradeCalculation)
    );
  };

  const getProgressValue = (current: number, max: number): number => {
    return Math.min((current / max) * 100, 100);
  };

  if (!facility) return null;

  const facilityIcon = StudentFacilityService.getFacilityIcon(facility.facilityType);
  const facilityName = StudentFacilityService.getFacilityTypeName(facility.facilityType);
  const maxLevel = 10; // Could come from facility config
  const levelsToUpgrade = targetLevel - facility.level;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: 600,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <UpgradeOutlined color="primary" sx={{ fontSize: 24 }} />
          <Box flex={1}>
            <Typography variant="h5" fontWeight={500}>
              {t('facilityManagement:UPGRADE_FACILITY')}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <Typography sx={{ fontSize: '1.1rem' }}>{facilityIcon}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {facilityName} - Tile {facility.tileId}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Current Facility Info */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {t('facilityManagement:CURRENT_FACILITY_STATUS')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  {t('facilityManagement:CURRENT_LEVEL')}
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {facility.level}
                </Typography>
              </Grid>
              {facility.capacity && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    {t('facilityManagement:CAPACITY')}
                  </Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat().format(facility.capacity)}
                  </Typography>
                </Grid>
              )}
              {facility.efficiency && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    {t('facilityManagement:EFFICIENCY')}
                  </Typography>
                  <Typography variant="h6">
                    {facility.efficiency}%
                  </Typography>
                </Grid>
              )}
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  {t('facilityManagement:TOTAL_INVESTMENT')}
                </Typography>
                <Typography variant="h6" color="success.main">
                  {StudentFacilityService.formatCurrency(
                    StudentFacilityService.calculateTotalInvestment(facility),
                    0
                  )}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Upgrade Level Selection */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {t('facilityManagement:SELECT_TARGET_LEVEL')}
            </Typography>
            <Box sx={{ px: 2, py: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  {t('facilityManagement:TARGET_LEVEL')}: {targetLevel}
                </Typography>
                <Chip
                  label={`+${levelsToUpgrade} ${levelsToUpgrade === 1 ? 'level' : 'levels'}`}
                  color="primary"
                  size="small"
                />
              </Stack>
              <Slider
                value={targetLevel}
                onChange={(e, value) => setTargetLevel(value as number)}
                min={facility.level + 1}
                max={Math.min(facility.level + 5, maxLevel)} // Allow upgrading up to 5 levels at once
                step={1}
                marks
                valueLabelDisplay="auto"
                disabled={loading}
              />
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Level {facility.level + 1}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Level {Math.min(facility.level + 5, maxLevel)}
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              {t('facilityManagement:CALCULATING_UPGRADE_COSTS')}
            </Typography>
          </Box>
        )}

        {/* Upgrade Calculation Results */}
        {upgradeCalculation && !loading && (
          <Box>
            {/* Cost Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {t('facilityManagement:UPGRADE_COSTS')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      {t('facilityManagement:GOLD_COST')}
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      🪙 {StudentFacilityService.formatResource(
                        getTotalGoldCost(upgradeCalculation),
                        'gold'
                      ).replace('🪙 ', '')}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      {t('facilityManagement:CARBON_COST')}
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      🔥 {getTotalCarbonCost(upgradeCalculation)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      {t('facilityManagement:TOTAL_COST')}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      💰 {getTotalGoldCost(upgradeCalculation) + getTotalCarbonCost(upgradeCalculation)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Balance Check */}
            {teamBalance && (
              <Alert
                severity={canAffordUpgrade() ? 'success' : 'warning'}
                sx={{ mb: 3 }}
                icon={canAffordUpgrade() ? <CheckCircleOutlined /> : <WarningAmberOutlined />}
              >
                <Typography variant="body2">
                  {t('facilityManagement:CURRENT_BALANCE')}: {' '}
                  🪙 {new Intl.NumberFormat().format(teamBalance.gold)} | {' '}
                  🔥 {new Intl.NumberFormat().format(teamBalance.carbon)}
                </Typography>
                {!canAffordUpgrade() && (
                  <Typography variant="caption" color="error" display="block" mt={0.5}>
                    {teamBalance.gold < getTotalGoldCost(upgradeCalculation) && 
                      t('facilityManagement:INSUFFICIENT_GOLD')
                    }
                    {teamBalance.carbon < getTotalCarbonCost(upgradeCalculation) && 
                      ` ${t('facilityManagement:INSUFFICIENT_CARBON')}`
                    }
                  </Typography>
                )}
              </Alert>
            )}

            {/* Detailed Breakdown */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                <Typography variant="subtitle1">
                  {t('facilityManagement:DETAILED_UPGRADE_BREAKDOWN')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('facilityManagement:LEVEL')}</TableCell>
                        <TableCell align="right">{t('facilityManagement:GOLD_COST')}</TableCell>
                        <TableCell align="right">{t('facilityManagement:CARBON_COST')}</TableCell>
                        <TableCell align="right">{t('facilityManagement:CUMULATIVE_GOLD')}</TableCell>
                        <TableCell align="right">{t('facilityManagement:CUMULATIVE_CARBON')}</TableCell>
                        <TableCell align="center">{t('facilityManagement:PROGRESS')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getLevelCosts(upgradeCalculation).map((cost, index) => {
                        const levelCosts = getLevelCosts(upgradeCalculation);
                        const cumulativeGold = levelCosts
                          .slice(0, index + 1)
                          .reduce((sum, c) => sum + (c?.goldCost || 0), 0);
                        const cumulativeCarbon = levelCosts
                          .slice(0, index + 1)
                          .reduce((sum, c) => sum + (c?.carbonCost || 0), 0);

                        return (
                          <TableRow key={cost?.level || index}>
                            <TableCell>
                              <Chip
                                label={cost?.level || facility.level + index + 1}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              {new Intl.NumberFormat().format(cost?.goldCost || 0)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              {new Intl.NumberFormat().format(cost?.carbonCost || 0)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {new Intl.NumberFormat().format(cumulativeGold)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {new Intl.NumberFormat().format(cumulativeCarbon)}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ width: '100px' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={getProgressValue(
                                    cumulativeGold,
                                    getTotalGoldCost(upgradeCalculation) || 1
                                  )}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            {/* Expected Benefits */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <InfoOutlined color="info" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle1">
                    {t('facilityManagement:EXPECTED_BENEFITS')}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t('facilityManagement:UPGRADE_BENEFITS_DESCRIPTION')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* No Calculation Data */}
        {!upgradeCalculation && !loading && (
          <Alert severity="info">
            {t('facilityManagement:NO_UPGRADE_CALCULATION_DATA')}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={upgrading}>
          {t('facilityManagement:CANCEL')}
        </Button>

        <LoadingButton
          variant="contained"
          onClick={handleUpgrade}
          loading={upgrading}
          disabled={
            !upgradeCalculation ||
            loading ||
            (teamBalance && !canAffordUpgrade())
          }
          startIcon={upgrading ? undefined : <TrendingUpOutlined />}
          color="primary"
        >
          {upgrading
            ? t('facilityManagement:UPGRADING')
            : t('facilityManagement:UPGRADE_TO_LEVEL', { level: targetLevel })
          }
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeFacilityModal;