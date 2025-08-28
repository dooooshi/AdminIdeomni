'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Collapse,
  Avatar,
  keyframes
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as AIIcon,
  Timeline as AnalyticsIcon,
  Lightbulb as InsightIcon,
  Star as RecommendIcon,
  Speed as QuickIcon,
  Balance as BalanceIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import LandService from '@/lib/services/landService';
import { AvailableTile, TeamLandSummary, PurchaseValidation } from '@/types/land';

const slideInAnimation = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const WizardContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: '400px',
  zIndex: 1300,
  borderRadius: `0 ${theme.spacing(2)} ${theme.spacing(2)} 0`,
  boxShadow: theme.shadows[24],
  animation: `${slideInAnimation} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`,
  background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
    borderRadius: 0,
  },
}));

const WizardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}10 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const WizardContent = styled(Box)(({ theme }) => ({
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
}));

const RecommendationCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.main}10)`,
  border: `2px solid ${theme.palette.success.main}30`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.success.main,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const WarningCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.warning.light}20, ${theme.palette.warning.main}10)`,
  border: `2px solid ${theme.palette.warning.main}30`,
}));

const InsightCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.info.light}20, ${theme.palette.info.main}10)`,
  border: `2px solid ${theme.palette.info.main}30`,
}));

interface PurchaseRecommendation {
  type: 'optimal' | 'budget' | 'strategic' | 'risky';
  title: string;
  description: string;
  tiles: AvailableTile[];
  totalCost: number;
  expectedROI: number;
  reasoning: string[];
  confidence: number;
}

interface PurchaseWizardProps {
  open: boolean;
  onClose: () => void;
  tiles: AvailableTile[];
  teamSummary: TeamLandSummary | null;
  selectedTile?: AvailableTile | null;
  onPurchaseRecommendation: (tiles: AvailableTile[], area: number) => void;
}

const PurchaseWizard: React.FC<PurchaseWizardProps> = ({
  open,
  onClose,
  tiles,
  teamSummary,
  selectedTile,
  onPurchaseRecommendation
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    budget: 0,
    strategy: 'balanced' as 'aggressive' | 'balanced' | 'conservative',
    priorityLandType: null as string | null,
    timeHorizon: 'medium' as 'short' | 'medium' | 'long',
    riskTolerance: 'medium' as 'low' | 'medium' | 'high'
  });
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);

  // Wizard steps
  const steps = [
    {
      label: 'Budget Analysis',
      description: 'Analyze your team\'s financial capacity',
      icon: <BalanceIcon />
    },
    {
      label: 'Strategy Selection',
      description: 'Choose your investment approach',
      icon: <TrendingUpIcon />
    },
    {
      label: 'AI Recommendations',
      description: 'Get personalized purchase suggestions',
      icon: <AIIcon />
    },
    {
      label: 'Review & Execute',
      description: 'Finalize your purchase decisions',
      icon: <CheckIcon />
    }
  ];

  // Generate AI-powered recommendations
  const generateRecommendations = async () => {
    setGeneratingRecommendations(true);
    
    // Simulate AI analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const availableTiles = tiles.filter(tile => tile.canPurchase);
    const budget = wizardData.budget;
    
    const recs: PurchaseRecommendation[] = [];
    
    // Optimal recommendation (best ROI)
    const optimalTiles = availableTiles
      .filter(tile => (tile.currentGoldPrice + tile.currentCarbonPrice) <= budget * 0.8)
      .sort((a, b) => {
        const aScore = calculateTileScore(a, 'roi');
        const bScore = calculateTileScore(b, 'roi');
        return bScore - aScore;
      })
      .slice(0, 3);
    
    if (optimalTiles.length > 0) {
      recs.push({
        type: 'optimal',
        title: 'Optimal ROI Strategy',
        description: 'Maximize return on investment with calculated risks',
        tiles: optimalTiles,
        totalCost: optimalTiles.reduce((sum, tile) => sum + tile.currentGoldPrice + tile.currentCarbonPrice, 0),
        expectedROI: 85,
        reasoning: [
          'High growth potential based on land type analysis',
          'Competitive pricing compared to market average',
          'Strategic positioning for future expansion'
        ],
        confidence: 92
      });
    }
    
    // Budget-friendly recommendation
    const budgetTiles = availableTiles
      .filter(tile => (tile.currentGoldPrice + tile.currentCarbonPrice) <= budget * 0.5)
      .sort((a, b) => (a.currentGoldPrice + a.currentCarbonPrice) - (b.currentGoldPrice + b.currentCarbonPrice))
      .slice(0, 5);
    
    if (budgetTiles.length > 0) {
      recs.push({
        type: 'budget',
        title: 'Budget-Conscious Approach',
        description: 'Conservative strategy with multiple small investments',
        tiles: budgetTiles,
        totalCost: budgetTiles.reduce((sum, tile) => sum + tile.currentGoldPrice + tile.currentCarbonPrice, 0),
        expectedROI: 65,
        reasoning: [
          'Low-risk diversified portfolio approach',
          'Preserves capital for future opportunities',
          'Builds steady foundation for growth'
        ],
        confidence: 78
      });
    }
    
    // Strategic recommendation based on land type preference
    if (wizardData.priorityLandType) {
      const strategicTiles = availableTiles
        .filter(tile => tile.landType === wizardData.priorityLandType)
        .sort((a, b) => calculateTileScore(b, 'strategic') - calculateTileScore(a, 'strategic'))
        .slice(0, 2);
      
      if (strategicTiles.length > 0) {
        recs.push({
          type: 'strategic',
          title: `${LandService.formatLandType(wizardData.priorityLandType)} Focus`,
          description: `Specialized investment in ${wizardData.priorityLandType.toLowerCase()} territories`,
          tiles: strategicTiles,
          totalCost: strategicTiles.reduce((sum, tile) => sum + tile.currentGoldPrice + tile.currentCarbonPrice, 0),
          expectedROI: 75,
          reasoning: [
            `${LandService.formatLandType(wizardData.priorityLandType)} tiles show strong fundamentals`,
            'Aligned with your strategic preferences',
            'Potential for specialized synergies'
          ],
          confidence: 84
        });
      }
    }
    
    setRecommendations(recs);
    setGeneratingRecommendations(false);
  };

  // Calculate tile scoring for recommendations
  const calculateTileScore = (tile: AvailableTile, criteria: 'roi' | 'strategic') => {
    const basePrice = tile.currentGoldPrice + tile.currentCarbonPrice;
    const landTypeMultiplier = {
      'MARINE': 1.3,
      'COASTAL': 1.2,
      'PLAIN': 1.0
    }[tile.landType] || 1.0;
    
    if (criteria === 'roi') {
      // Higher score for lower price and better land type
      return (landTypeMultiplier * 100) / Math.max(basePrice, 1);
    } else {
      // Strategic scoring based on team's existing holdings
      const teamOwnership = tile.teamOwnedArea || 0;
      return landTypeMultiplier * 10 + (teamOwnership > 0 ? 20 : 0);
    }
  };

  // Handle wizard navigation
  const handleNext = () => {
    if (activeStep === 2 && recommendations.length === 0) {
      generateRecommendations();
    }
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleRecommendationSelect = (index: number) => {
    setSelectedRecommendation(index);
    const recommendation = recommendations[index];
    onPurchaseRecommendation(recommendation.tiles, 1); // Default 1 unit per tile
  };

  // Budget analysis based on team summary
  const budgetAnalysis = useMemo(() => {
    if (!teamSummary) return null;
    
    const totalBalance = (teamSummary.totalGoldSpent || 0) + (teamSummary.totalCarbonSpent || 0);
    const avgSpendingPerPurchase = teamSummary.totalPurchases > 0 
      ? totalBalance / teamSummary.totalPurchases 
      : 0;
    
    return {
      totalSpent: totalBalance,
      avgPerPurchase: avgSpendingPerPurchase,
      recommendedBudget: Math.max(avgSpendingPerPurchase * 1.5, 100),
      riskLevel: totalBalance > 1000 ? 'high' : totalBalance > 500 ? 'medium' : 'low'
    };
  }, [teamSummary]);

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Budget Analysis
        return (
          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <BalanceIcon color="primary" />
              Financial Capacity Analysis
            </Typography>
            
            {budgetAnalysis && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {LandService.formatCurrency(budgetAnalysis.totalSpent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Invested
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {LandService.formatCurrency(budgetAnalysis.avgPerPurchase)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Per Purchase
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Based on your team's spending patterns, we recommend a budget of{' '}
                <strong>{LandService.formatCurrency(budgetAnalysis?.recommendedBudget || 100)}</strong>{' '}
                for your next purchase.
              </Typography>
            </Alert>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Set Your Purchase Budget
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {[100, 250, 500, 1000, 2000].map(amount => (
                  <Chip
                    key={amount}
                    label={LandService.formatCurrency(amount)}
                    onClick={() => setWizardData(prev => ({ ...prev, budget: amount }))}
                    color={wizardData.budget === amount ? 'primary' : 'default'}
                    variant={wizardData.budget === amount ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        );
        
      case 1: // Strategy Selection
        return (
          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon color="primary" />
              Investment Strategy
            </Typography>
            
            <Stack spacing={2}>
              {[
                {
                  value: 'aggressive',
                  title: 'Aggressive Growth',
                  description: 'High-risk, high-reward investments',
                  icon: <TrendingUpIcon />,
                  color: 'error'
                },
                {
                  value: 'balanced',
                  title: 'Balanced Approach',
                  description: 'Mix of growth and stability',
                  icon: <BalanceIcon />,
                  color: 'primary'
                },
                {
                  value: 'conservative',
                  title: 'Conservative Growth',
                  description: 'Steady, low-risk investments',
                  icon: <CheckIcon />,
                  color: 'success'
                }
              ].map(strategy => (
                <Card
                  key={strategy.value}
                  variant={wizardData.strategy === strategy.value ? 'elevation' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    border: wizardData.strategy === strategy.value 
                      ? `2px solid ${theme.palette[strategy.color as keyof typeof theme.palette].main}` 
                      : undefined,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  onClick={() => setWizardData(prev => ({ ...prev, strategy: strategy.value as any }))}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ 
                        bgcolor: `${strategy.color}.main`,
                        color: `${strategy.color}.contrastText`
                      }}>
                        {strategy.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6">{strategy.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {strategy.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('PREFERRED_LAND_TYPE_OPTIONAL')}
              </Typography>
              <Stack direction="row" spacing={1}>
                {['PLAIN', 'COASTAL', 'MARINE'].map(landType => (
                  <Chip
                    key={landType}
                    label={LandService.formatLandType(landType)}
                    onClick={() => setWizardData(prev => ({ 
                      ...prev, 
                      priorityLandType: prev.priorityLandType === landType ? null : landType 
                    }))}
                    color={wizardData.priorityLandType === landType ? 'primary' : 'default'}
                    variant={wizardData.priorityLandType === landType ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        );
        
      case 2: // AI Recommendations
        return (
          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <AIIcon color="primary" />
              AI-Powered Recommendations
            </Typography>
            
            {generatingRecommendations ? (
              <Box textAlign="center" py={4}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing market conditions and your preferences...
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {recommendations.map((rec, index) => (
                  <Fade in timeout={500 + index * 200} key={index}>
                    <RecommendationCard
                      sx={{
                        cursor: 'pointer',
                        border: selectedRecommendation === index 
                          ? `3px solid ${theme.palette.success.main}` 
                          : undefined
                      }}
                      onClick={() => setSelectedRecommendation(index)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <RecommendIcon />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6">{rec.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {rec.description}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="h6" color="success.main">
                              {rec.confidence}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Confidence
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Grid container spacing={2} mb={2}>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total Cost
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {LandService.formatCurrency(rec.totalCost)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Expected ROI
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="success.main">
                              {rec.expectedROI}%
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Tiles
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {rec.tiles.length}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          AI Reasoning:
                        </Typography>
                        <Stack spacing={0.5}>
                          {rec.reasoning.map((reason, idx) => (
                            <Typography key={idx} variant="body2" color="text.secondary">
                              • {reason}
                            </Typography>
                          ))}
                        </Stack>
                      </CardContent>
                    </RecommendationCard>
                  </Fade>
                ))}
              </Stack>
            )}
          </Stack>
        );
        
      case 3: // Review & Execute
        return (
          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <CheckIcon color="primary" />
              Review Your Decision
            </Typography>
            
            {selectedRecommendation !== null && recommendations[selectedRecommendation] && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {recommendations[selectedRecommendation].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {recommendations[selectedRecommendation].description}
                  </Typography>
                  
                  <Stack spacing={2} mt={2}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Tiles:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {recommendations[selectedRecommendation].tiles.map(tile => (
                          <Chip
                            key={tile.tileId}
                            label={`Tile ${tile.tileId} (${LandService.formatLandType(tile.landType)})`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                    
                    <Alert severity="success">
                      <Typography variant="body2">
                        Ready to execute purchase for{' '}
                        <strong>{LandService.formatCurrency(recommendations[selectedRecommendation].totalCost)}</strong>{' '}
                        across {recommendations[selectedRecommendation].tiles.length} tiles.
                      </Typography>
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>
            )}
            
            {selectedRecommendation === null && (
              <Alert severity="warning">
                Please select a recommendation from the previous step to continue.
              </Alert>
            )}
          </Stack>
        );
        
      default:
        return null;
    }
  };

  if (!open) return null;

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

      {/* Wizard Panel */}
      <WizardContainer elevation={24}>
        {/* Header */}
        <WizardHeader>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AIIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Purchase Wizard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-guided investment decisions
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Close Wizard">
              <IconButton onClick={onClose} size="large">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </WizardHeader>

        {/* Content */}
        <WizardContent>
          <Box sx={{ p: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      <Typography variant="caption">{step.description}</Typography>
                    }
                    StepIconComponent={({ active, completed }) => (
                      <Avatar
                        sx={{
                          bgcolor: completed 
                            ? 'success.main' 
                            : active 
                            ? 'primary.main' 
                            : 'grey.400',
                          width: 32,
                          height: 32,
                          fontSize: '1rem'
                        }}
                      >
                        {completed ? <CheckIcon /> : step.icon}
                      </Avatar>
                    )}
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    {renderStepContent(index)}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </WizardContent>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedRecommendation !== null) {
                    handleRecommendationSelect(selectedRecommendation);
                    onClose();
                  }
                }}
                disabled={selectedRecommendation === null}
                startIcon={<CheckIcon />}
              >
                Execute Purchase
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Next
              </Button>
            )}
          </Stack>
        </Box>
      </WizardContainer>
    </>
  );
};

export default PurchaseWizard;