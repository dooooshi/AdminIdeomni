'use client';

import React, { useState, useEffect } from 'react';
import { RESOURCE_ICONS } from '@/constants/resourceIcons';
import {
  Dialog,
  DialogContent,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Slider,
  IconButton,
} from '@mui/material';
import {
  CloseOutlined,
  MonetizationOn,
  Nature,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { ApiError } from '@/lib/http/axios-config';
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
  const { t } = useTranslation();

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
    } catch (err: any) {
      console.error('Failed to calculate upgrade costs:', err);

      // Use the localized message from the API response
      const errorMessage = err instanceof ApiError && err.message
        ? err.message
        : t('facilityManagement.UPGRADE_CALCULATION_ERROR');

      setError(errorMessage);
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
    } catch (err: any) {
      console.error('Upgrade failed:', err);

      // Use the localized message from the API response
      const errorMessage = err instanceof ApiError && err.message
        ? err.message
        : t('facilityManagement.FACILITY_UPGRADE_ERROR');

      setError(errorMessage);
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
  const facilityName = t(`facilityManagement.FACILITY_TYPE_${facility.facilityType}`);
  const levelsToUpgrade = targetLevel - facility.level;
  const canUpgrade = facility.level < maxLevel;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0px 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
          overflow: 'visible'
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>        
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary',
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
            },
          }}
        >
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Header */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={500} sx={{ mb: 0.5 }}>
            {t('facilityManagement.UPGRADE_FACILITY')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {facilityName} • {t('facilityManagement.TILE')} {facility.tileId}
          </Typography>
        </Box>
        {/* Error Alert - Fixed Layout */}
        {error && (
          <Box sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'error.900' : 'error.50',
            border: '1px solid', 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'error.700' : 'error.200',
            borderRadius: 1,
            minHeight: 56
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setError(null)} 
                sx={{ 
                  color: 'error.main', 
                  ml: 1,
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'error.800' : 'error.100'
                  }
                }}
              >
                <CloseOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Box>
        )}

        {!canUpgrade ? (
          <Box sx={{ 
            p: 2, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'info.900' : 'info.50',
            border: '1px solid', 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'info.700' : 'info.200',
            borderRadius: 1, 
            mb: 2,
            minHeight: 56,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant="body2" color="info.main">
              {t('facilityManagement.FACILITY_AT_MAX_LEVEL')}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Level Selection - Fixed Layout */}
            <Box mb={2}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                {t('facilityManagement.UPGRADE_LEVEL')}
              </Typography>
              
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={4} mb={3}>
                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('facilityManagement.CURRENT')}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 500, 
                      color: 'text.primary',
                      fontFamily: 'monospace',
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {facility.level}
                  </Typography>
                </Box>

                <Box sx={{ 
                  width: 1, 
                  height: 32, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300' 
                }} />

                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('facilityManagement.TARGET')}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 500, 
                      color: 'primary.main',
                      fontFamily: 'monospace',
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {targetLevel}
                  </Typography>
                </Box>
              </Stack>

              <Slider
                value={targetLevel}
                onChange={(e, value) => setTargetLevel(value as number)}
                min={facility.level + 1}
                max={maxLevel}
                step={1}
                marks
                valueLabelDisplay="auto"
                disabled={loading || !canUpgrade}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                  '& .MuiSlider-track': {
                    height: 3,
                  },
                  '& .MuiSlider-rail': {
                    height: 3,
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
                  },
                }}
              />
            </Box>

            {/* Cost Display - Fixed Layout */}
            <Box sx={{ mb: 2, minHeight: loading ? 80 : 'auto' }}>
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                {t('facilityManagement.UPGRADE_COST')}
              </Typography>
              
              <Paper sx={{ 
                p: 2, 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                borderRadius: 1, 
                border: '1px solid', 
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      {t('facilityManagement.CALCULATING_COSTS')}
                    </Typography>
                  </Stack>
                ) : upgradeCalculation ? (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MonetizationOn color="warning" />
                      <Typography 
                        variant="body1" 
                        fontWeight={500}
                        sx={{ 
                          fontFamily: 'monospace',
                          minWidth: '80px',
                          textAlign: 'right'
                        }}
                      >
                        {new Intl.NumberFormat().format(getTotalGoldCost(upgradeCalculation))}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Nature color="success" />
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        sx={{
                          fontFamily: 'monospace',
                          minWidth: '60px',
                          textAlign: 'right'
                        }}
                      >
                        {new Intl.NumberFormat().format(getTotalCarbonCost(upgradeCalculation))}
                      </Typography>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('facilityManagement.NO_UPGRADE_CALCULATION_DATA')}
                  </Typography>
                )}
              </Paper>
            </Box>

          </>
        )}
        
        {/* Actions - Dark/Light Mode Support */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: '1px solid', 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'
          }}
        >
          <Button 
            onClick={onClose} 
            disabled={upgrading}
            variant="outlined"
            sx={{ 
              flex: 1, 
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
              color: 'text.secondary',
              '&:hover': { 
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.500' : 'grey.400',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'
              } 
            }}
          >
            {t('common.CANCEL')}
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
              sx={{ 
                flex: 1,
                backgroundColor: 'primary.main',
                boxShadow: 'none',
                '&:hover': { 
                  backgroundColor: 'primary.dark',
                  boxShadow: 'none' 
                },
                '&:disabled': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                  color: (theme) => theme.palette.mode === 'dark' ? 'grey.500' : 'grey.500'
                }
              }}
            >
              {upgrading
                ? t('facilityManagement.UPGRADING')
                : t('facilityManagement.CONFIRM_UPGRADE')
              }
            </LoadingButton>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeFacilityModal;