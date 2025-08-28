'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Slider,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  CompareArrows as CompareArrowsIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  LandType,
  FacilityType,
  TileFacilityBuildConfig,
  UpgradeCostCalculation,
} from '@/components/map/types';
import TileFacilityBuildConfigService from '@/lib/services/tileFacilityBuildConfigService';

interface FacilityUpgradeCalculatorProps {
  templateId: number;
  initialLandType?: LandType;
  initialFacilityType?: FacilityType;
  maxHeight?: number;
}

interface ComparisonData {
  landType: LandType;
  facilityType: FacilityType;
  calculation: UpgradeCostCalculation;
  config: TileFacilityBuildConfig;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const FacilityUpgradeCalculator: React.FC<FacilityUpgradeCalculatorProps> = ({
  templateId,
  initialLandType = LandType.PLAIN,
  initialFacilityType = FacilityType.FARM,
  maxHeight = 700,
}) => {
  const { t } = useTranslation();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [selectedLandType, setSelectedLandType] = useState(initialLandType);
  const [selectedFacilityType, setSelectedFacilityType] = useState(initialFacilityType);
  const [targetLevel, setTargetLevel] = useState(5);
  const [currentCalculation, setCurrentCalculation] = useState<UpgradeCostCalculation | null>(null);
  const [currentConfig, setCurrentConfig] = useState<TileFacilityBuildConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  // Load configuration and calculate costs
  const calculateUpgradeCosts = async () => {
    try {
      setIsLoading(true);
      
      const [calculation, configs] = await Promise.all([
        TileFacilityBuildConfigService.calculateUpgradeCosts(
          templateId,
          selectedLandType,
          selectedFacilityType,
          targetLevel
        ),
        TileFacilityBuildConfigService.getConfigsByFacilityType(templateId, selectedFacilityType)
      ]);

      setCurrentCalculation(calculation);
      
      // Find the config for the selected land type
      const config = configs.find(c => c.landType === selectedLandType);
      setCurrentConfig(config || null);
      
    } catch (error) {
      console.error('Failed to calculate upgrade costs:', error);
      setCurrentCalculation(null);
      setCurrentConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Compare across land types for the same facility
  const compareAcrossLandTypes = async () => {
    try {
      setIsLoading(true);
      
      const landTypes = Object.values(LandType);
      const comparisonPromises = landTypes.map(async (landType) => {
        try {
          const [calculation, configs] = await Promise.all([
            TileFacilityBuildConfigService.calculateUpgradeCosts(
              templateId,
              landType,
              selectedFacilityType,
              targetLevel
            ),
            TileFacilityBuildConfigService.getConfigsByFacilityType(templateId, selectedFacilityType)
          ]);

          const config = configs.find(c => c.landType === landType);
          
          return config ? {
            landType,
            facilityType: selectedFacilityType,
            calculation,
            config
          } : null;
        } catch (error) {
          console.warn(`Failed to calculate for ${landType}:`, error);
          return null;
        }
      });

      const results = await Promise.all(comparisonPromises);
      setComparisons(results.filter((r): r is ComparisonData => r !== null));
      
    } catch (error) {
      console.error('Failed to perform comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to auto-calculate when inputs change
  useEffect(() => {
    if (tabValue === 0) {
      calculateUpgradeCosts();
    }
  }, [templateId, selectedLandType, selectedFacilityType, targetLevel, tabValue]);

  // Effect to auto-compare when comparison tab is active
  useEffect(() => {
    if (tabValue === 1) {
      compareAcrossLandTypes();
    }
  }, [templateId, selectedFacilityType, targetLevel, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculateCostEfficiency = (calculation: UpgradeCostCalculation): number => {
    if (!calculation?.totalCost?.gold || calculation.totalCost.gold === 0) return 0;
    return calculation.targetLevel / (calculation.totalCost.gold / 1000);
  };

  const formatEfficiency = (efficiency: number): string => {
    return `${efficiency.toFixed(3)} ${t('mapTemplate.LEVELS_PER_K_GOLD')}`;
  };

  const getLandTypeColor = (landType: LandType): 'primary' | 'secondary' | 'success' => {
    switch (landType) {
      case LandType.MARINE: return 'primary';
      case LandType.COASTAL: return 'secondary';
      case LandType.PLAIN: return 'success';
      default: return 'primary';
    }
  };

  const getProgressValue = (current: number, max: number): number => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <Card sx={{ height: maxHeight }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <CalculateIcon />
            <Typography variant="h6">{t('mapTemplate.FACILITY_UPGRADE_CALCULATOR')}</Typography>
          </Box>
        }
        action={
          <LoadingButton
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={tabValue === 0 ? calculateUpgradeCosts : compareAcrossLandTypes}
            loading={isLoading}
            size="small"
          >
            {tabValue === 0 ? t('mapTemplate.CALCULATE') : t('mapTemplate.COMPARE')}
          </LoadingButton>
        }
      />

      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={t('mapTemplate.SINGLE_CALCULATION')} 
              icon={<CalculateIcon />} 
              iconPosition="start" 
            />
            <Tab 
              label={t('mapTemplate.LAND_TYPE_COMPARISON')} 
              icon={<CompareArrowsIcon />} 
              iconPosition="start" 
            />
          </Tabs>
        </Box>

        {/* Single Calculation Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Input Controls */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>{t('mapTemplate.FACILITY_TYPE')}</InputLabel>
                    <Select
                      value={selectedFacilityType}
                      label={t('mapTemplate.FACILITY_TYPE')}
                      onChange={(e) => setSelectedFacilityType(e.target.value as FacilityType)}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            minWidth: 280,
                          },
                        },
                      }}
                    >
                      {Object.values(FacilityType).map((type) => (
                        <MenuItem key={type} value={type} sx={{ minWidth: 260 }}>
                          {t(`FACILITY_TYPE_${type}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>{t('mapTemplate.LAND_TYPE')}</InputLabel>
                    <Select
                      value={selectedLandType}
                      label={t('mapTemplate.LAND_TYPE')}
                      onChange={(e) => setSelectedLandType(e.target.value as LandType)}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            minWidth: 180,
                          },
                        },
                      }}
                    >
                      {Object.values(LandType).map((type) => (
                        <MenuItem key={type} value={type} sx={{ minWidth: 160 }}>
                          {t(`LAND_TYPE_${type}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ px: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {t('mapTemplate.TARGET_LEVEL')}: {targetLevel}
                    </Typography>
                    <Slider
                      value={targetLevel}
                      onChange={(e, value) => setTargetLevel(value as number)}
                      min={2}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Configuration Info */}
            {currentConfig && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('mapTemplate.FACILITY_CONFIGURATION')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.BUILD_COST')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {TileFacilityBuildConfigService.formatCurrency(currentConfig.requiredGold)} / {currentConfig.requiredCarbon} CO₂
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.BASE_UPGRADE_COST')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {TileFacilityBuildConfigService.formatCurrency(currentConfig.upgradeGoldCost)} / {currentConfig.upgradeCarbonCost} CO₂
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.UPGRADE_MULTIPLIER')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {currentConfig.upgradeMultiplier}x
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.MAX_LEVEL')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {currentConfig.maxLevel}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Loading */}
            {isLoading && (
              <Grid size={{ xs: 12 }}>
                <LinearProgress />
              </Grid>
            )}

            {/* Calculation Results */}
            {currentCalculation && !isLoading && (
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  {/* Summary Cards */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        {TileFacilityBuildConfigService.formatCurrency(currentCalculation?.totalCost?.gold || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.TOTAL_GOLD_COST')}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" color="secondary">
                        {TileFacilityBuildConfigService.formatNumber(currentCalculation?.totalCost?.carbon || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.TOTAL_CARBON_COST')}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main">
                        {currentCalculation?.upgradeCosts?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.UPGRADE_STEPS')}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" color="info.main">
                        {formatEfficiency(calculateCostEfficiency(currentCalculation))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('mapTemplate.COST_EFFICIENCY')}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Detailed Breakdown */}
                  <Grid size={{ xs: 12 }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">{t('mapTemplate.DETAILED_BREAKDOWN')}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>{t('mapTemplate.LEVEL')}</TableCell>
                                <TableCell align="right">{t('mapTemplate.GOLD_COST')}</TableCell>
                                <TableCell align="right">{t('mapTemplate.CARBON_COST')}</TableCell>
                                <TableCell align="right">{t('mapTemplate.CUMULATIVE_GOLD')}</TableCell>
                                <TableCell align="right">{t('mapTemplate.CUMULATIVE_CARBON')}</TableCell>
                                <TableCell align="center">{t('mapTemplate.PROGRESS')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(currentCalculation?.upgradeCosts || []).map((cost, index) => {
                                const cumulativeGold = (currentCalculation?.upgradeCosts || [])
                                  .slice(0, index + 1)
                                  .reduce((sum, c) => sum + (c?.goldCost || 0), 0);
                                const cumulativeCarbon = (currentCalculation?.upgradeCosts || [])
                                  .slice(0, index + 1)
                                  .reduce((sum, c) => sum + (c?.carbonCost || 0), 0);

                                return (
                                  <TableRow key={cost?.level || index}>
                                    <TableCell>
                                      <Chip 
                                        label={cost?.level || index + 1} 
                                        color="primary" 
                                        variant="outlined" 
                                        size="small" 
                                      />
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                      {TileFacilityBuildConfigService.formatCurrency(cost?.goldCost || 0)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                      {TileFacilityBuildConfigService.formatNumber(cost?.carbonCost || 0)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                      {TileFacilityBuildConfigService.formatCurrency(cumulativeGold)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                      {TileFacilityBuildConfigService.formatNumber(cumulativeCarbon)}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box sx={{ width: '100px' }}>
                                        <LinearProgress 
                                          variant="determinate" 
                                          value={getProgressValue(cumulativeGold, currentCalculation?.totalCost?.gold || 1)}
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
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* No Results */}
            {!currentCalculation && !isLoading && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  {t('mapTemplate.NO_CALCULATION_DATA')}
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Land Type Comparison Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Controls */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>{t('mapTemplate.FACILITY_TYPE')}</InputLabel>
                    <Select
                      value={selectedFacilityType}
                      label={t('mapTemplate.FACILITY_TYPE')}
                      onChange={(e) => setSelectedFacilityType(e.target.value as FacilityType)}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            minWidth: 280,
                          },
                        },
                      }}
                    >
                      {Object.values(FacilityType).map((type) => (
                        <MenuItem key={type} value={type} sx={{ minWidth: 260 }}>
                          {t(`FACILITY_TYPE_${type}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ px: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {t('mapTemplate.TARGET_LEVEL')}: {targetLevel}
                    </Typography>
                    <Slider
                      value={targetLevel}
                      onChange={(e, value) => setTargetLevel(value as number)}
                      min={2}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, value) => value && setViewMode(value)}
                    size="small"
                  >
                    <ToggleButton value="table">
                      <BarChartIcon />
                    </ToggleButton>
                    <ToggleButton value="chart">
                      <PieChartIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
            </Grid>

            {/* Loading */}
            {isLoading && (
              <Grid size={{ xs: 12 }}>
                <LinearProgress />
              </Grid>
            )}

            {/* Comparison Results */}
            {comparisons.length > 0 && !isLoading && (
              <Grid size={{ xs: 12 }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('mapTemplate.LAND_TYPE')}</TableCell>
                        <TableCell align="right">{t('mapTemplate.BUILD_COST')}</TableCell>
                        <TableCell align="right">{t('mapTemplate.UPGRADE_COST_TO_LEVEL', { level: targetLevel })}</TableCell>
                        <TableCell align="right">{t('mapTemplate.TOTAL_INVESTMENT')}</TableCell>
                        <TableCell align="center">{t('mapTemplate.EFFICIENCY')}</TableCell>
                        <TableCell align="center">{t('mapTemplate.STATUS')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisons
                        .sort((a, b) => (a.calculation?.totalCost?.gold || 0) - (b.calculation?.totalCost?.gold || 0))
                        .map((comparison) => {
                          const totalInvestment = comparison.config.requiredGold + (comparison.calculation?.totalCost?.gold || 0);
                          const efficiency = calculateCostEfficiency(comparison.calculation);
                          const isRecommended = comparison === comparisons
                            .reduce((best, current) => 
                              calculateCostEfficiency(current.calculation) > calculateCostEfficiency(best.calculation) 
                                ? current : best
                            );

                          return (
                            <TableRow 
                              key={comparison.landType}
                              sx={{ 
                                bgcolor: isRecommended ? 'success.light' : 'inherit',
                                opacity: comparison.config.isAllowed ? 1 : 0.5
                              }}
                            >
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    label={t(`LAND_TYPE_${comparison.landType}`)}
                                    color={getLandTypeColor(comparison.landType)}
                                    variant="outlined"
                                    size="small"
                                  />
                                  {isRecommended && (
                                    <Chip label={t('mapTemplate.RECOMMENDED')} color="success" size="small" />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                <Box>
                                  <Typography variant="body2">
                                    {TileFacilityBuildConfigService.formatCurrency(comparison.config.requiredGold)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {comparison.config.requiredCarbon} CO₂
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                <Box>
                                  <Typography variant="body2">
                                    {TileFacilityBuildConfigService.formatCurrency(comparison.calculation?.totalCost?.gold || 0)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {comparison.calculation?.totalCost?.carbon || 0} CO₂
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                {TileFacilityBuildConfigService.formatCurrency(totalInvestment)}
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color={isRecommended ? 'success.main' : 'inherit'}>
                                  {formatEfficiency(efficiency)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {comparison.config.isAllowed ? (
                                  <Chip label={t('mapTemplate.ALLOWED')} color="success" variant="outlined" size="small" />
                                ) : (
                                  <Chip label={t('mapTemplate.NOT_ALLOWED')} color="error" variant="outlined" size="small" />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {/* No Comparison Data */}
            {comparisons.length === 0 && !isLoading && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  {t('mapTemplate.NO_COMPARISON_DATA')}
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default FacilityUpgradeCalculator;