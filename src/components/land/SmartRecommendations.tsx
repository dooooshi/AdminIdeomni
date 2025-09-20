'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,

  LinearProgress,
  IconButton,
  Tooltip,
  Collapse,
  Alert,
  Divider,
  keyframes
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Balance as BalanceIcon,
  Speed as QuickIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Refresh as RefreshIcon,
  Lightbulb as InsightIcon,
  Timeline as AnalyticsIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import LandService from '@/lib/services/landService';
import { AvailableTile, TeamLandSummary } from '@/types/land';

const shimmerAnimation = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const RecommendationCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)`,
    transition: 'left 0.5s ease-in-out',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const PriorityCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.error.light}20, ${theme.palette.error.main}10)`,
  border: `2px solid ${theme.palette.error.main}40`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.error.main,
  },
}));

const OpportunityCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.main}10)`,
  border: `2px solid ${theme.palette.success.main}40`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.success.main,
  },
}));

const InsightCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.info.light}20, ${theme.palette.info.main}10)`,
  border: `2px solid ${theme.palette.info.main}40`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.info.main,
  },
}));

interface MarketInsight {
  type: 'price_trend' | 'opportunity' | 'risk' | 'competition' | 'portfolio';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  data?: any;
}

interface PurchaseRecommendation {
  id: string;
  tile: AvailableTile;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  reasoning: string[];
  expectedROI: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short' | 'medium' | 'long';
  confidence: number;
  estimatedCost: number;
  competitionLevel: number;
  strategicValue: number;
}

interface SmartRecommendationsProps {
  tiles: AvailableTile[];
  teamSummary: TeamLandSummary | null;
  onTileRecommend: (tile: AvailableTile) => void;
  onRefreshData: () => void;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  tiles,
  teamSummary,
  onTileRecommend,
  onRefreshData
}) => {
  const theme = useTheme();
  
  // State
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Generate market insights
  const generateInsights = (): MarketInsight[] => {
    const availableTiles = tiles.filter(tile => tile.canPurchase);
    const averagePrice = availableTiles.reduce((sum, tile) => 
      sum + (tile.currentGoldPrice + tile.currentCarbonPrice), 0) / availableTiles.length;
    
    const insights: MarketInsight[] = [];

    // Price trend analysis
    const cheapTiles = availableTiles.filter(tile => 
      (tile.currentGoldPrice + tile.currentCarbonPrice) < averagePrice * 0.8);
    
    if (cheapTiles.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Below-Market Pricing Detected',
        description: `${cheapTiles.length} tile(s) are priced significantly below market average`,
        impact: 'high',
        confidence: 85,
        actionable: true,
        data: { tiles: cheapTiles, avgPrice: averagePrice }
      });
    }

    // Portfolio diversification
    if (teamSummary) {
      const landTypes = tiles.filter(tile => tile.teamOwnedArea > 0)
        .map(tile => tile.landType);
      const uniqueTypes = [...new Set(landTypes)];
      
      if (uniqueTypes.length < 2) {
        insights.push({
          type: 'portfolio',
          title: 'Portfolio Diversification Opportunity',
          description: 'Consider diversifying across different land types to reduce risk',
          impact: 'medium',
          confidence: 78,
          actionable: true
        });
      }
    }

    // Competition analysis
    const highCompetitionTiles = availableTiles.filter(tile => tile.totalOwnedArea > 15);
    if (highCompetitionTiles.length > 0) {
      insights.push({
        type: 'competition',
        title: 'High Competition Alert',
        description: `${highCompetitionTiles.length} tiles show high competition levels`,
        impact: 'medium',
        confidence: 92,
        actionable: false,
        data: { tiles: highCompetitionTiles }
      });
    }

    // Risk assessment
    const expensiveTiles = availableTiles.filter(tile => 
      (tile.currentGoldPrice + tile.currentCarbonPrice) > averagePrice * 1.5);
    
    if (expensiveTiles.length > 0) {
      insights.push({
        type: 'risk',
        title: 'High-Value Investment Warning',
        description: `${expensiveTiles.length} tiles are priced significantly above market`,
        impact: 'high',
        confidence: 88,
        actionable: true,
        data: { tiles: expensiveTiles }
      });
    }

    return insights;
  };

  // Generate purchase recommendations using AI-like scoring
  const generateRecommendations = (): PurchaseRecommendation[] => {
    const availableTiles = tiles.filter(tile => tile.canPurchase);
    
    return availableTiles
      .map(tile => {
        const basePrice = tile.currentGoldPrice + tile.currentCarbonPrice;
        const landTypeScore = {
          'MARINE': 1.3,
          'COASTAL': 1.2,
          'PLAIN': 1.0
        }[tile.landType] || 1.0;
        
        // Calculate various scores
        const priceScore = Math.max(0, (200 - basePrice) / 200) * 100;
        const availabilityScore = Math.min(tile.availableArea, 25) / 25 * 100;
        const competitionScore = Math.max(0, (25 - tile.totalOwnedArea) / 25) * 100;
        const locationScore = landTypeScore * 100;
        
        // Weighted composite score
        const compositeScore = (
          priceScore * 0.3 +
          availabilityScore * 0.2 +
          competitionScore * 0.2 +
          locationScore * 0.3
        );

        // Determine priority based on composite score
        let priority: 'urgent' | 'high' | 'medium' | 'low';
        if (compositeScore > 90) priority = 'urgent';
        else if (compositeScore > 75) priority = 'high';
        else if (compositeScore > 60) priority = 'medium';
        else priority = 'low';

        // Generate reasoning
        const reasoning: string[] = [];
        if (priceScore > 80) reasoning.push('Excellent value for money');
        if (competitionScore > 70) reasoning.push('Low competition from other teams');
        if (availabilityScore > 80) reasoning.push('High availability for expansion');
        if (landTypeScore > 1.1) reasoning.push('Premium land type with growth potential');
        if (tile.teamOwnedArea > 0) reasoning.push('Opportunity to expand existing holdings');

        return {
          id: `rec_${tile.tileId}`,
          tile,
          priority,
          reasoning: reasoning.length > 0 ? reasoning : ['Standard investment opportunity'],
          expectedROI: Math.round(compositeScore * 0.8 + Math.random() * 20),
          riskLevel: (basePrice > 150 ? 'high' : basePrice > 75 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          timeframe: (priority === 'urgent' ? 'immediate' : priority === 'high' ? 'short' : 'medium') as 'immediate' | 'short' | 'medium' | 'long',
          confidence: Math.round(compositeScore * 0.9 + Math.random() * 10),
          estimatedCost: basePrice,
          competitionLevel: Math.round((tile.totalOwnedArea / 25) * 100),
          strategicValue: Math.round(compositeScore)
        };
      })
      .sort((a, b) => {
        // Sort by priority, then by strategic value
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.strategicValue - a.strategicValue;
      })
      .slice(0, 6); // Top 6 recommendations
  };

  // Run analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRecommendations = generateRecommendations();
    const newInsights = generateInsights();
    
    setRecommendations(newRecommendations);
    setInsights(newInsights);
    setLastAnalysis(new Date());
    setIsAnalyzing(false);
  };

  // Auto-run analysis when data changes
  useEffect(() => {
    if (tiles.length > 0) {
      runAnalysis();
    }
  }, [tiles, teamSummary]);

  // Toggle details visibility
  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get insight icon
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUpIcon />;
      case 'risk': return <WarningIcon />;
      case 'competition': return <BalanceIcon />;
      case 'portfolio': return <AnalyticsIcon />;
      default: return <InsightIcon />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AIIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Smart Recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered investment insights
              {lastAnalysis && (
                <> • Updated {lastAnalysis.toLocaleTimeString()}</>
              )}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Analysis">
            <IconButton onClick={runAnalysis} disabled={isAnalyzing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading State */}
      {isAnalyzing && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
              <AIIcon />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Analyzing Market Conditions...
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Processing {tiles.length} tiles and market data
            </Typography>
            <LinearProgress sx={{ mt: 2, maxWidth: 300, mx: 'auto' }} />
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      {insights.length > 0 && !isAnalyzing && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <InsightIcon color="info" />
            Market Insights
          </Typography>
          
          <Grid container spacing={2}>
            {insights.map((insight, index) => {
              const CardComponent = insight.type === 'risk' ? PriorityCard : 
                                  insight.type === 'opportunity' ? OpportunityCard : 
                                  InsightCard;
              
              return (
                <Grid key={index} item xs={12} md={6}>
                  <CardComponent>
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Avatar 
                          sx={{ 
                            bgcolor: insight.type === 'risk' ? 'error.main' : 
                                   insight.type === 'opportunity' ? 'success.main' : 'info.main',
                            width: 32,
                            height: 32
                          }}
                        >
                          {getInsightIcon(insight.type)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {insight.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {insight.description}
                          </Typography>
                          
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`${insight.impact.toUpperCase()} IMPACT`}
                              size="small"
                              color={insight.impact === 'high' ? 'error' : 
                                    insight.impact === 'medium' ? 'warning' : 'success'}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {insight.confidence}% confidence
                            </Typography>
                          </Stack>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardComponent>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Purchase Recommendations */}
      {recommendations.length > 0 && !isAnalyzing && (
        <Box>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <StarIcon color="warning" />
            Top Purchase Recommendations
          </Typography>
          
          <Grid container spacing={2}>
            {recommendations.map((rec) => (
              <Grid key={rec.id} item xs={12} md={6}>
                <RecommendationCard>
                  <CardContent>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                      <Box display="flex" alignItems="center" gap={2} flex={1}>
                        <Avatar sx={{ bgcolor: `${getPriorityColor(rec.priority)}.main` }}>
                          <Typography variant="body2" fontWeight="bold">
                            {rec.tile.tileId}
                          </Typography>
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Tile {rec.tile.tileId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {LandService.formatLandType(rec.tile.landType)} • {rec.tile.axialQ}, {rec.tile.axialR}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Chip
                          label={rec.priority.toUpperCase()}
                          size="small"
                          color={getPriorityColor(rec.priority) as any}
                          variant="filled"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {rec.confidence}% confidence
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Metrics */}
                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Expected ROI
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {rec.expectedROI}%
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Cost
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {LandService.formatCurrency(rec.estimatedCost)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Risk Level
                        </Typography>
                        <Chip
                          label={rec.riskLevel.toUpperCase()}
                          size="small"
                          color={rec.riskLevel === 'high' ? 'error' : 
                                rec.riskLevel === 'medium' ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>

                    {/* Progress Indicators */}
                    <Stack spacing={1} mb={2}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Strategic Value
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {rec.strategicValue}/100
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={rec.strategicValue}
                          color="primary"
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                      
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Competition Level
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {rec.competitionLevel}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={rec.competitionLevel}
                          color={rec.competitionLevel > 70 ? 'error' : rec.competitionLevel > 40 ? 'warning' : 'success'}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Stack>

                    {/* Reasoning */}
                    <Box mb={2}>
                      <Button
                        size="small"
                        onClick={() => toggleDetails(rec.id)}
                        endIcon={showDetails[rec.id] ? <CollapseIcon /> : <ExpandIcon />}
                      >
                        AI Reasoning
                      </Button>
                      
                      <Collapse in={showDetails[rec.id]}>
                        <Stack spacing={0.5} mt={1}>
                          {rec.reasoning.map((reason, idx) => (
                            <Typography key={idx} variant="body2" color="text.secondary">
                              • {reason}
                            </Typography>
                          ))}
                        </Stack>
                      </Collapse>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Actions */}
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                      <Chip
                        icon={<QuickIcon />}
                        label={`${rec.timeframe} action`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                      
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onTileRecommend(rec.tile)}
                        startIcon={<StarIcon />}
                      >
                        View Tile
                      </Button>
                    </Stack>
                  </CardContent>
                </RecommendationCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && insights.length === 0 && !isAnalyzing && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ bgcolor: 'grey.300', mx: 'auto', mb: 2, width: 64, height: 64 }}>
              <AIIcon sx={{ fontSize: '2rem' }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              No Recommendations Available
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Insufficient data to generate recommendations. Try refreshing the map data.
            </Typography>
            <Button
              variant="outlined"
              onClick={onRefreshData}
              startIcon={<RefreshIcon />}
              sx={{ mt: 2 }}
            >
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SmartRecommendations;