'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Slider,
  Stack,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Collapse,
  Fade,
  Zoom,
  keyframes
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon,
  EcoOutlined as EcoIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import {
  AvailableTile,
  LandPurchaseRequest,
  PurchaseValidation,
  LandPurchase
} from '@/types/land';

const slideInAnimation = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

const PurchasePanel = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  height: '100vh',
  width: '480px',
  zIndex: 1300,
  borderRadius: `${theme.spacing(2)} 0 0 ${theme.spacing(2)}`,
  boxShadow: theme.shadows[24],
  animation: `${slideInAnimation} 0.3s ease-out`,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
    borderRadius: 0,
  },
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.primary.main}05 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(3), // Extra space for visual hierarchy
  },
}));

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(0),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: '3px',
  },
  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    '&::-webkit-scrollbar': {
      display: 'none', // Hide scrollbar on mobile for cleaner look
    },
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    '&:hover': {
      background: theme.palette.grey[400],
    },
  },
}));

const PanelFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'flex-end',
}));

const AnimatedCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const CostCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.success.main}08)`,
  border: `2px solid ${theme.palette.success.main}30`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.success.main,
    animation: `${pulseAnimation} 2s infinite`,
  },
}));

const ErrorCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.error.light}15, ${theme.palette.error.main}08)`,
  border: `2px solid ${theme.palette.error.main}30`,
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    width: 24,
    height: 24,
    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
    '&::before': {
      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
    },
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px rgb(${theme.palette.primary.main} / 16%)`,
      '& .airbnb-bar': {
        width: 9,
        height: 9,
        opacity: 1,
      },
    },
    '&.Mui-active': {
      width: 28,
      height: 28,
      '& .airbnb-bar': {
        width: 12,
        height: 12,
      },
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: theme.palette.text.primary,
    '&::before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    },
  },
  '& .MuiSlider-track': {
    border: 'none',
    height: 5,
    borderRadius: 3,
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    backgroundColor: '#bfbfbf',
    height: 5,
    borderRadius: 3,
  },
}));

interface EnhancedPurchasePanelProps {
  open: boolean;
  onClose: () => void;
  tile: AvailableTile | null;
  onPurchaseComplete: (purchase: LandPurchase) => void;
}

const EnhancedPurchasePanel: React.FC<EnhancedPurchasePanelProps> = ({
  open,
  onClose,
  tile,
  onPurchaseComplete
}) => {
  const theme = useTheme();
  
  // Form state
  const [area, setArea] = useState(1);
  const [description, setDescription] = useState('');
  const [enablePriceProtection, setEnablePriceProtection] = useState(false);
  const [maxGoldCost, setMaxGoldCost] = useState<number | undefined>();
  const [maxCarbonCost, setMaxCarbonCost] = useState<number | undefined>();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Validation and loading states
  const [validation, setValidation] = useState<PurchaseValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick action buttons
  const quickActions = [
    { label: '1 Unit', value: 1, icon: <SpeedIcon />, color: 'primary' as const },
    { label: '5 Units', value: 5, icon: <TrendingUpIcon />, color: 'secondary' as const },
    { label: '10 Units', value: 10, icon: <TimelineIcon />, color: 'success' as const },
  ];

  // Animation state
  const [showContent, setShowContent] = useState(false);

  // Reset form when modal opens/closes or tile changes
  useEffect(() => {
    if (open && tile) {
      resetForm();
      generateDefaultDescription();
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [open, tile]);

  // Validate purchase when area changes
  useEffect(() => {
    if (tile && area > 0 && open) {
      validatePurchase();
    }
  }, [tile, area, open]);

  const resetForm = () => {
    setArea(1);
    setDescription('');
    setEnablePriceProtection(false);
    setMaxGoldCost(undefined);
    setMaxCarbonCost(undefined);
    setValidation(null);
    setError(null);
    setShowAdvancedOptions(false);
  };

  const generateDefaultDescription = () => {
    if (!tile) return;
    setDescription(`Strategic purchase of ${area} units on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
  };

  const validatePurchase = async () => {
    if (!tile || area <= 0) return;

    try {
      setValidating(true);
      setError(null);
      
      const validationResult = await LandService.validatePurchase(tile.tileId, area);
      setValidation(validationResult);
    } catch (err: any) {
      console.error('Validation failed:', err);
      setError(LandService.getErrorMessage(err));
      setValidation(null);
    } finally {
      setValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!tile || !validation?.canPurchase) return;

    try {
      setPurchasing(true);
      setError(null);

      const purchaseRequest: LandPurchaseRequest = {
        tileId: tile.tileId,
        area: area,
        description: description || undefined,
      };

      if (enablePriceProtection) {
        if (maxGoldCost) purchaseRequest.maxGoldCost = maxGoldCost;
        if (maxCarbonCost) purchaseRequest.maxCarbonCost = maxCarbonCost;
      }

      const purchase = await LandService.purchaseLand(purchaseRequest);
      onPurchaseComplete(purchase);
      onClose();
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setPurchasing(false);
    }
  };

  const handleAreaChange = (event: Event, newValue: number | number[]) => {
    const newArea = Array.isArray(newValue) ? newValue[0] : newValue;
    const integerArea = Math.round(newArea);
    setArea(integerArea);
    
    if (tile) {
      setDescription(`Strategic purchase of ${integerArea} units on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
    }
  };

  const handleQuickAction = (value: number) => {
    setArea(value);
    if (tile) {
      setDescription(`Quick purchase of ${value} units on ${LandService.formatLandType(tile.landType)} tile ${tile.tileId}`);
    }
  };

  const canPurchase = validation?.canPurchase && !purchasing && !validating;
  const totalCost = validation ? (validation.goldCost || 0) + (validation.carbonCost || 0) : 0;

  // Memoized cost breakdown for performance
  const costBreakdown = useMemo(() => {
    if (!validation) return null;
    
    const goldPercentage = totalCost > 0 ? ((validation.goldCost || 0) / totalCost) * 100 : 0;
    const carbonPercentage = totalCost > 0 ? ((validation.carbonCost || 0) / totalCost) * 100 : 0;
    
    return { goldPercentage, carbonPercentage };
  }, [validation, totalCost]);

  if (!open || !tile) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1200,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Purchase Panel */}
      <PurchasePanel elevation={24}>
        {/* Header */}
        <PanelHeader>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <ShoppingCartIcon color="primary" sx={{ fontSize: '2rem' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Purchase Land
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tile {tile.tileId} • {LandService.formatLandType(tile.landType)}
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Close Panel">
              <IconButton onClick={onClose} size="large">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </PanelHeader>

        {/* Content */}
        <PanelContent>
          <Fade in={showContent} timeout={500}>
            <Stack spacing={3} sx={{ p: 3 }}>
              {/* Error Display */}
              {error && (
                <Zoom in={!!error}>
                  <Alert severity="error" variant="filled">
                    {error}
                  </Alert>
                </Zoom>
              )}

              {/* Tile Information Card */}
              <AnimatedCard variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <MoneyIcon color="warning" />
                    Tile Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gold Price
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                        {LandService.formatCurrency(tile.currentGoldPrice || 0, 'gold')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Carbon Price
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {LandService.formatCurrency(tile.currentCarbonPrice || 0, 'carbon')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Your Owned
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {LandService.formatArea(tile.teamOwnedArea || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Available
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        Unlimited
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnimatedCard>

              {/* Quick Action Buttons */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Purchase Options
                </Typography>
                <Stack direction="row" spacing={2}>
                  {quickActions.map((action, index) => (
                    <Fade in={showContent} timeout={600} style={{ transitionDelay: `${index * 100}ms` }} key={action.value}>
                      <QuickActionButton
                        variant={area === action.value ? "contained" : "outlined"}
                        color={action.color}
                        startIcon={action.icon}
                        onClick={() => handleQuickAction(action.value)}
                        size="small"
                      >
                        {action.label}
                      </QuickActionButton>
                    </Fade>
                  ))}
                </Stack>
              </Box>

              {/* Area Selection */}
              <Box>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                  <CalculateIcon />
                  Custom Area Selection
                </Typography>
                <Box sx={{ px: 2, py: 1 }}>
                  <StyledSlider
                    value={area}
                    onChange={handleAreaChange}
                    min={1}
                    max={100}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100+' }
                    ]}
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => `${Math.round(value)} units`}
                    disabled={purchasing}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    Selected: {Math.round(area)} units
                  </Typography>
                  <Typography variant="caption" color="primary">
                    Cost per unit: {LandService.formatCurrency((tile.currentGoldPrice || 0) + (tile.currentCarbonPrice || 0))}
                  </Typography>
                </Box>
              </Box>

              {/* Real-time Cost Display */}
              {validating ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Calculating costs...
                  </Typography>
                </Box>
              ) : validation ? (
                <Zoom in={!!validation} timeout={400}>
                  <CostCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                        <TrendingUpIcon color="success" />
                        Purchase Summary
                      </Typography>
                      
                      {/* Cost breakdown with visual indicators */}
                      <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <MoneyIcon color="warning" sx={{ fontSize: '2rem', mb: 1 }} />
                            <Typography variant="h5" color="warning.main" fontWeight="bold">
                              {LandService.formatCurrency(validation.goldCost || 0, 'gold')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Gold Cost
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <EcoIcon color="success" sx={{ fontSize: '2rem', mb: 1 }} />
                            <Typography variant="h5" color="success.main" fontWeight="bold">
                              {LandService.formatCurrency(validation.carbonCost || 0, 'carbon')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Carbon Cost
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <ShoppingCartIcon color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                            <Typography variant="h5" color="primary.main" fontWeight="bold">
                              {LandService.formatCurrency(totalCost)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Cost
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Visual cost breakdown */}
                      {costBreakdown && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Cost Distribution
                          </Typography>
                          <Box display="flex" height={8} borderRadius={1} overflow="hidden">
                            <Box 
                              sx={{ 
                                width: `${costBreakdown.goldPercentage}%`, 
                                bgcolor: 'warning.main',
                                transition: 'width 0.3s ease-in-out'
                              }} 
                            />
                            <Box 
                              sx={{ 
                                width: `${costBreakdown.carbonPercentage}%`, 
                                bgcolor: 'success.main',
                                transition: 'width 0.3s ease-in-out'
                              }} 
                            />
                          </Box>
                        </Box>
                      )}

                      {/* Team Balance Display */}
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Team Gold Balance
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="warning.main">
                            {LandService.formatCurrency(validation.teamGoldBalance || 0, 'gold')}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(((validation.goldCost || 0) / (validation.teamGoldBalance || 1)) * 100, 100)}
                            color="warning" 
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Team Carbon Balance
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            {LandService.formatCurrency(validation.teamCarbonBalance || 0, 'carbon')}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(((validation.carbonCost || 0) / (validation.teamCarbonBalance || 1)) * 100, 100)}
                            color="success" 
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </CostCard>
                </Zoom>
              ) : null}

              {/* Validation Errors */}
              {validation && validation.errors && validation.errors.length > 0 && (
                <Zoom in timeout={300}>
                  <ErrorCard>
                    <CardContent>
                      <Typography variant="subtitle2" color="error.main" gutterBottom>
                        Purchase Issues
                      </Typography>
                      <Stack spacing={1}>
                        {validation.errors.map((error, index) => (
                          <Typography key={index} variant="body2" color="error.main">
                            • {error}
                          </Typography>
                        ))}
                      </Stack>
                    </CardContent>
                  </ErrorCard>
                </Zoom>
              )}

              {/* Advanced Options */}
              <Box>
                <Button
                  variant="text"
                  startIcon={showAdvancedOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  sx={{ mb: 1 }}
                >
                  Advanced Options
                </Button>
                
                <Collapse in={showAdvancedOptions}>
                  <Stack spacing={2}>
                    {/* Price Protection */}
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={enablePriceProtection}
                            onChange={(e) => setEnablePriceProtection(e.target.checked)}
                            disabled={purchasing}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <SecurityIcon fontSize="small" />
                            <Typography variant="body2">
                              Enable Price Protection
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <Collapse in={enablePriceProtection}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <TextField
                              label="Max Gold Cost"
                              type="number"
                              fullWidth
                              size="small"
                              value={maxGoldCost || ''}
                              onChange={(e) => setMaxGoldCost(e.target.value ? Number(e.target.value) : undefined)}
                              inputProps={{ min: 0, step: 0.01 }}
                              disabled={purchasing}
                              helperText={validation ? `Current: ${(validation.goldCost || 0).toFixed(2)}` : ''}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label="Max Carbon Cost"
                              type="number"
                              fullWidth
                              size="small"
                              value={maxCarbonCost || ''}
                              onChange={(e) => setMaxCarbonCost(e.target.value ? Number(e.target.value) : undefined)}
                              inputProps={{ min: 0, step: 0.01 }}
                              disabled={purchasing}
                              helperText={validation ? `Current: ${(validation.carbonCost || 0).toFixed(2)}` : ''}
                            />
                          </Grid>
                        </Grid>
                      </Collapse>
                    </Box>

                    {/* Description */}
                    <TextField
                      label="Purchase Description (Optional)"
                      multiline
                      rows={2}
                      fullWidth
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a description for this purchase..."
                      disabled={purchasing}
                    />
                  </Stack>
                </Collapse>
              </Box>

              {/* Purchase Status */}
              {validation && (
                <Box display="flex" justifyContent="center">
                  <Chip
                    label={validation.canPurchase ? 'Purchase Available' : 'Cannot Purchase'}
                    color={validation.canPurchase ? 'success' : 'error'}
                    variant="filled"
                    size="large"
                    icon={validation.canPurchase ? <ShoppingCartIcon /> : <CloseIcon />}
                  />
                </Box>
              )}
            </Stack>
          </Fade>
        </PanelContent>

        {/* Footer */}
        <PanelFooter>
          <Button onClick={onClose} disabled={purchasing} size="large">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePurchase}
            disabled={!canPurchase}
            startIcon={purchasing ? <CircularProgress size={16} /> : <ShoppingCartIcon />}
            size="large"
            sx={{ 
              minWidth: 180,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            {purchasing ? 'Purchasing...' : `Purchase for ${validation ? LandService.formatCurrency(totalCost) : '...'}`}
          </Button>
        </PanelFooter>
      </PurchasePanel>
    </>
  );
};

export default EnhancedPurchasePanel;