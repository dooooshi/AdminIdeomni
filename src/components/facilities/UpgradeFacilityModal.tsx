'use client';

import React, { useState, useEffect } from 'react';
import { RESOURCE_ICONS } from '@/constants/resourceIcons';
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
  IconButton,
} from '@mui/material';
import {
  UpgradeOutlined,
  TrendingUpOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  CloseOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import type {
  TileFacilityInstance,
  UpgradeFacilityRequest,
  UpgradeCostCalculation,
  UpgradeCostApiResponse,
} from '@/types/facilities';

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

  const maxLevel = 4; // Fixed max level

  // Reset state when modal opens/closes or facility changes
  useEffect(() => {
    if (open && facility) {
      // Ensure we don't exceed max level
      const nextLevel = Math.min(facility.level + 1, maxLevel);
      setTargetLevel(nextLevel);
      setError(null);
      setUpgradeCalculation(null);
    }
  }, [open, facility]);

  // Calculate upgrade costs when target level changes
  useEffect(() => {
    if (facility && targetLevel > facility.level && targetLevel <= maxLevel) {
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

  const canAffordUpgrade = () => {
    if (!upgradeCalculation || !teamBalance) return false;
    return (
      teamBalance.gold >= getTotalGoldCost(upgradeCalculation) &&
      teamBalance.carbon >= getTotalCarbonCost(upgradeCalculation)
    );
  };

  if (!facility) return null;

  const facilityIcon = StudentFacilityService.getFacilityIcon(facility.facilityType);
  const facilityName = t(`facilityManagement:FACILITY_TYPE_${facility.facilityType}`);
  const levelsToUpgrade = targetLevel - facility.level;
  const canUpgrade = facility.level < maxLevel;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography sx={{ fontSize: '1.5rem' }}>{facilityIcon}</Typography>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {t('facilityManagement:UPGRADE_FACILITY')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {facilityName} • {t('facilityManagement:TILE')} {facility.tileId}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!canUpgrade ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {t('facilityManagement:FACILITY_AT_MAX_LEVEL')}
            </Typography>
          </Alert>
        ) : (
          <>
            {/* Level Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('facilityManagement:UPGRADE_LEVEL')}
              </Typography>
              
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'grey.50',
                  textAlign: 'center',
                  minWidth: 80
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('facilityManagement:CURRENT')}
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="text.primary">
                    {facility.level}
                  </Typography>
                </Box>

                <ArrowForwardOutlined sx={{ color: 'primary.main' }} />

                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'primary.50',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  textAlign: 'center',
                  minWidth: 80
                }}>
                  <Typography variant="caption" color="primary.main" display="block">
                    {t('facilityManagement:TARGET')}
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="primary.main">
                    {targetLevel}
                  </Typography>
                </Box>

                <Chip
                  label={`+${levelsToUpgrade} ${t('facilityManagement:LEVELS', { count: levelsToUpgrade })}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Stack>

              <Box sx={{ px: 2 }}>
                <Slider
                  value={targetLevel}
                  onChange={(e, value) => setTargetLevel(value as number)}
                  min={facility.level + 1}
                  max={maxLevel}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  disabled={loading || !canUpgrade}
                />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {t('facilityManagement:LEVEL')} {facility.level + 1}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('facilityManagement:MAX_LEVEL')}: {maxLevel}
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* Loading */}
            {loading && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <CircularProgress size={20} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {t('facilityManagement:CALCULATING_COSTS')}
                </Typography>
              </Box>
            )}

            {/* Cost Display */}
            {upgradeCalculation && !loading && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('facilityManagement:UPGRADE_COST')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <Typography variant="h6">
                              {RESOURCE_ICONS.GOLD_EMOJI}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('facilityManagement:GOLD')}
                            </Typography>
                          </Stack>
                          <Typography variant="h5" fontWeight={600}>
                            {new Intl.NumberFormat().format(getTotalGoldCost(upgradeCalculation))}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <Typography variant="h6">
                              {RESOURCE_ICONS.CARBON_EMOJI}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('facilityManagement:CARBON')}
                            </Typography>
                          </Stack>
                          <Typography variant="h5" fontWeight={600}>
                            {new Intl.NumberFormat().format(getTotalCarbonCost(upgradeCalculation))}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                {/* Balance Check */}
                {teamBalance && (
                  <Alert
                    severity={canAffordUpgrade() ? 'success' : 'warning'}
                    icon={canAffordUpgrade() ? <CheckCircleOutlined /> : <WarningAmberOutlined />}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {t('facilityManagement:YOUR_BALANCE')}:
                    </Typography>
                    <Stack direction="row" spacing={3} mt={0.5}>
                      <Typography 
                        variant="body2" 
                        color={teamBalance.gold >= getTotalGoldCost(upgradeCalculation) ? 'success.main' : 'error.main'}
                      >
                        {RESOURCE_ICONS.GOLD_EMOJI} {new Intl.NumberFormat().format(teamBalance.gold)}
                      </Typography>
                      <Typography 
                        variant="body2"
                        color={teamBalance.carbon >= getTotalCarbonCost(upgradeCalculation) ? 'success.main' : 'error.main'}
                      >
                        {RESOURCE_ICONS.CARBON_EMOJI} {new Intl.NumberFormat().format(teamBalance.carbon)}
                      </Typography>
                    </Stack>
                    {!canAffordUpgrade() && (
                      <Typography variant="caption" color="error" display="block" mt={1}>
                        {t('facilityManagement:INSUFFICIENT_RESOURCES')}
                      </Typography>
                    )}
                  </Alert>
                )}

              </>
            )}
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={upgrading}>
          {t('common:CANCEL')}
        </Button>

        {canUpgrade && (
          <LoadingButton
            variant="contained"
            onClick={handleUpgrade}
            loading={upgrading}
            disabled={
              !upgradeCalculation ||
              loading ||
              (teamBalance && !canAffordUpgrade())
            }
            startIcon={!upgrading && <TrendingUpOutlined />}
          >
            {upgrading
              ? t('facilityManagement:UPGRADING')
              : t('facilityManagement:CONFIRM_UPGRADE')
            }
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeFacilityModal;