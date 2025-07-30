'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  Stack,
  Grid,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
  Fade,
  keyframes
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  AttachMoney as MoneyIcon,
  EcoOutlined as EcoIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import { AvailableTile, PurchaseValidation } from '@/types/land';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
`;

const CountUpAnimation = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const CalculatorCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `2px solid ${theme.palette.primary.main}20`,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    animation: `${pulseAnimation} 2s infinite`,
  },
}));

const ValueDisplay = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)`,
    transition: 'left 0.5s ease-in-out',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const AnimatedNumber = styled(Typography)(({ theme }) => ({
  animation: `${CountUpAnimation} 0.5s ease-out`,
  fontWeight: 'bold',
  fontSize: '1.5rem',
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    width: 20,
    height: 20,
    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
    '&::before': {
      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
    },
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px rgb(${theme.palette.primary.main} / 16%)`,
    },
  },
  '& .MuiSlider-track': {
    border: 'none',
    height: 4,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '& .MuiSlider-rail': {
    opacity: 0.3,
    backgroundColor: theme.palette.grey[400],
    height: 4,
    borderRadius: 2,
  },
}));

interface PurchaseCostCalculatorProps {
  tile: AvailableTile;
  onAreaChange?: (area: number) => void;
  showAdvanced?: boolean;
}

const PurchaseCostCalculator: React.FC<PurchaseCostCalculatorProps> = ({
  tile,
  onAreaChange,
  showAdvanced = false
}) => {
  const theme = useTheme();
  
  // State
  const [area, setArea] = useState(1);
  const [validation, setValidation] = useState<PurchaseValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [previousArea, setPreviousArea] = useState(1);

  // Quick preset areas
  const presetAreas = [
    { label: '1', value: 1, icon: <SpeedIcon />, description: 'Quick purchase' },
    { label: '5', value: 5, icon: <TrendingUpIcon />, description: 'Small expansion' },
    { label: '10', value: 10, icon: <TimelineIcon />, description: 'Medium investment' },
    { label: '25', value: 25, icon: <AnalyticsIcon />, description: 'Large acquisition' }
  ];

  // Validate purchase when area changes
  useEffect(() => {
    if (tile && area > 0) {
      validatePurchase();
    }
  }, [tile, area]);

  const validatePurchase = async () => {
    if (!tile || area <= 0) return;

    try {
      setValidating(true);
      const validationResult = await LandService.validatePurchase(tile.tileId, area);
      setValidation(validationResult);
    } catch (err: any) {
      console.error('Validation failed:', err);
      setValidation(null);
    } finally {
      setValidating(false);
    }
  };

  const handleAreaChange = (newArea: number) => {
    setPreviousArea(area);
    setArea(newArea);
    onAreaChange?.(newArea);
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    handleAreaChange(Math.round(value));
  };

  const handlePresetClick = (value: number) => {
    handleAreaChange(value);
  };

  // Memoized calculations
  const calculations = useMemo(() => {
    if (!validation) return null;

    const goldCost = validation.goldCost || 0;
    const carbonCost = validation.carbonCost || 0;
    const totalCost = goldCost + carbonCost;
    
    const goldPercentage = totalCost > 0 ? (goldCost / totalCost) * 100 : 0;
    const carbonPercentage = totalCost > 0 ? (carbonCost / totalCost) * 100 : 0;
    
    const costPerUnit = area > 0 ? totalCost / area : 0;
    const goldAffordability = validation.teamGoldBalance > 0 ? (goldCost / validation.teamGoldBalance) * 100 : 0;
    const carbonAffordability = validation.teamCarbonBalance > 0 ? (carbonCost / validation.teamCarbonBalance) * 100 : 0;

    const changeFromPrevious = previousArea !== area ? {
      areaDiff: area - previousArea,
      costDiff: totalCost - ((validation.goldCost || 0) + (validation.carbonCost || 0)) * (previousArea / area)
    } : null;

    return {
      goldCost,
      carbonCost,
      totalCost,
      goldPercentage,
      carbonPercentage,
      costPerUnit,
      goldAffordability,
      carbonAffordability,
      changeFromPrevious
    };
  }, [validation, area, previousArea]);

  return (
    <CalculatorCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <CalculateIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Cost Calculator
          </Typography>
          <Chip 
            label={`Tile ${tile.tileId}`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>

        {/* Quick Presets */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Quick Presets
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {presetAreas.map((preset) => (
              <Tooltip key={preset.value} title={preset.description} arrow>
                <Chip
                  icon={preset.icon}
                  label={`${preset.label} unit${preset.value > 1 ? 's' : ''}`}
                  onClick={() => handlePresetClick(preset.value)}
                  color={area === preset.value ? 'primary' : 'default'}
                  variant={area === preset.value ? 'filled' : 'outlined'}
                  clickable
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Box>

        {/* Area Selection */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle2">
              Area to Purchase
            </Typography>
            <TextField
              size="small"
              type="number"
              value={area}
              onChange={(e) => handleAreaChange(Number(e.target.value) || 1)}
              inputProps={{ min: 1, max: 100 }}
              sx={{ width: 80 }}
            />
          </Box>
          
          <StyledSlider
            value={area}
            onChange={handleSliderChange}
            min={1}
            max={50}
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: 10, label: '10' },
              { value: 25, label: '25' },
              { value: 50, label: '50' }
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value} units`}
          />
        </Box>

        {/* Cost Display */}
        {validating ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Calculating costs...
            </Typography>
          </Box>
        ) : calculations ? (
          <Fade in={!!calculations} timeout={500}>
            <Stack spacing={2}>
              {/* Main Cost Display */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <ValueDisplay sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <MoneyIcon sx={{ fontSize: '2rem', mb: 1 }} />
                    <AnimatedNumber>
                      {LandService.formatCurrency(calculations.goldCost, 'gold')}
                    </AnimatedNumber>
                    <Typography variant="caption">
                      Gold ({calculations.goldPercentage.toFixed(1)}%)
                    </Typography>
                  </ValueDisplay>
                </Grid>
                
                <Grid item xs={4}>
                  <ValueDisplay sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <EcoIcon sx={{ fontSize: '2rem', mb: 1 }} />
                    <AnimatedNumber>
                      {LandService.formatCurrency(calculations.carbonCost, 'carbon')}
                    </AnimatedNumber>
                    <Typography variant="caption">
                      Carbon ({calculations.carbonPercentage.toFixed(1)}%)
                    </Typography>
                  </ValueDisplay>
                </Grid>
                
                <Grid item xs={4}>
                  <ValueDisplay sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <TrendingUpIcon sx={{ fontSize: '2rem', mb: 1 }} />
                    <AnimatedNumber>
                      {LandService.formatCurrency(calculations.totalCost)}
                    </AnimatedNumber>
                    <Typography variant="caption">
                      Total Cost
                    </Typography>
                  </ValueDisplay>
                </Grid>
              </Grid>

              {/* Cost per unit */}
              <Box textAlign="center" py={1}>
                <Typography variant="body2" color="text.secondary">
                  Cost per unit: {LandService.formatCurrency(calculations.costPerUnit)}
                </Typography>
              </Box>

              {/* Affordability Indicators */}
              <Stack spacing={1}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Gold Affordability
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" 
                      color={calculations.goldAffordability > 80 ? 'error.main' : calculations.goldAffordability > 50 ? 'warning.main' : 'success.main'}>
                      {calculations.goldAffordability.toFixed(1)}% of balance
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(calculations.goldAffordability, 100)}
                    color={calculations.goldAffordability > 80 ? 'error' : calculations.goldAffordability > 50 ? 'warning' : 'success'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Carbon Affordability
                    </Typography>
                    <Typography variant="body2" fontWeight="bold"
                      color={calculations.carbonAffordability > 80 ? 'error.main' : calculations.carbonAffordability > 50 ? 'warning.main' : 'success.main'}>
                      {calculations.carbonAffordability.toFixed(1)}% of balance
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(calculations.carbonAffordability, 100)}
                    color={calculations.carbonAffordability > 80 ? 'error' : calculations.carbonAffordability > 50 ? 'warning' : 'success'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>

              {/* Purchase Status */}
              {validation && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Chip
                    label={validation.canPurchase ? '✓ Can Purchase' : '✗ Cannot Purchase'}
                    color={validation.canPurchase ? 'success' : 'error'}
                    variant="filled"
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              )}

              {/* Validation Errors */}
              {validation && validation.errors && validation.errors.length > 0 && (
                <Alert severity="warning" variant="outlined" sx={{ mt: 1 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Purchase Issues:
                  </Typography>
                  {validation.errors.map((error, index) => (
                    <Typography key={index} variant="body2">
                      • {error}
                    </Typography>
                  ))}
                </Alert>
              )}

              {/* Advanced Breakdown Toggle */}
              {showAdvanced && (
                <Box>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <IconButton 
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      size="small"
                    >
                      {showBreakdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {showBreakdown ? 'Hide' : 'Show'} Advanced Breakdown
                    </Typography>
                  </Box>
                  
                  <Collapse in={showBreakdown}>
                    <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Team Gold Balance
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {LandService.formatCurrency(validation?.teamGoldBalance || 0, 'gold')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Team Carbon Balance
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {LandService.formatCurrency(validation?.teamCarbonBalance || 0, 'carbon')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Gold Price per Unit
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {LandService.formatCurrency(tile.currentGoldPrice || 0, 'gold')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Carbon Price per Unit
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {LandService.formatCurrency(tile.currentCarbonPrice || 0, 'carbon')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Stack>
          </Fade>
        ) : null}
      </CardContent>
    </CalculatorCard>
  );
};

export default PurchaseCostCalculator;