'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,

  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as ExportIcon,
  Compare as CompareIcon,
  Insights as InsightsIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

import {
  EnhancedMapTemplate,
  TileFacilityConfigStatistics,
  LandType,
  FacilityType,
} from '@/components/map/types';
import MapTemplateService from '@/lib/services/mapTemplateService';
import TileFacilityBuildConfigService from '@/lib/services/tileFacilityBuildConfigService';

interface AnalyticsStatisticsProps {
  templates: EnhancedMapTemplate[];
  selectedTemplateId?: number;
  onTemplateSelect?: (templateId: number) => void;
  maxHeight?: number;
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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface AnalyticsData {
  templateStats: any;
  facilityStats: TileFacilityConfigStatistics | null;
  comparisons: any[];
}

const AnalyticsStatistics: React.FC<AnalyticsStatisticsProps> = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  maxHeight = 800,
}) => {
  const { t } = useTranslation();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedMapTemplate | null>(null);
  const [comparisonTemplates, setComparisonTemplates] = useState<number[]>([]);

  // Load analytics data
  const loadAnalyticsData = async (templateId: number) => {
    try {
      setIsLoading(true);
      
      const [templateStats, facilityStats] = await Promise.all([
        MapTemplateService.getTemplateStatistics(templateId),
        TileFacilityBuildConfigService.getConfigStatistics(templateId).catch(() => null)
      ]);

      setAnalyticsData({
        templateStats: templateStats.tileStatistics,
        facilityStats,
        comparisons: []
      });

      // Set selected template
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplate(template || null);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load comparison data
  const loadComparisonData = async (templateIds: number[]) => {
    if (templateIds.length < 2) return;

    try {
      setIsLoading(true);
      const comparisons = await MapTemplateService.compareTemplates(templateIds);
      
      setAnalyticsData(prev => ({
        ...prev!,
        comparisons
      }));
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (selectedTemplateId) {
      loadAnalyticsData(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    if (comparisonTemplates.length >= 2) {
      loadComparisonData(comparisonTemplates);
    }
  }, [comparisonTemplates]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTemplateChange = (templateId: number) => {
    if (onTemplateSelect) {
      onTemplateSelect(templateId);
    }
    loadAnalyticsData(templateId);
  };

  const handleAddToComparison = (templateId: number) => {
    if (!comparisonTemplates.includes(templateId)) {
      setComparisonTemplates(prev => [...prev, templateId]);
    }
  };

  const handleRemoveFromComparison = (templateId: number) => {
    setComparisonTemplates(prev => prev.filter(id => id !== templateId));
  };

  const calculateCostEfficiency = (stats: TileFacilityConfigStatistics): number => {
    if (stats.averageCosts.requiredGold === 0) return 0;
    return stats.allowedConfigs / (stats.averageCosts.requiredGold / 1000);
  };

  const getLandTypeColor = (landType: LandType): 'primary' | 'secondary' | 'success' => {
    switch (landType) {
      case LandType.MARINE: return 'primary';
      case LandType.COASTAL: return 'secondary';
      case LandType.PLAIN: return 'success';
      default: return 'primary';
    }
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const renderOverviewAnalytics = () => {
    if (!analyticsData || !selectedTemplate) {
      return (
        <Alert severity="info">
          {t('mapTemplate.SELECT_TEMPLATE_FOR_ANALYTICS')}
        </Alert>
      );
    }

    const { facilityStats } = analyticsData;

    return (
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('mapTemplate.KEY_METRICS')}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {selectedTemplate.tileCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mapTemplate.TOTAL_TILES')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {facilityStats?.totalConfigs || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mapTemplate.FACILITY_CONFIGURATIONS')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {facilityStats?.allowedConfigs || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mapTemplate.ALLOWED_FACILITIES')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {facilityStats ? TileFacilityBuildConfigService.formatCurrency(facilityStats.averageCosts.requiredGold) : '$0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mapTemplate.AVERAGE_BUILD_COST')}
            </Typography>
          </Paper>
        </Grid>

        {/* Land Type Distribution */}
        {facilityStats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title={t('mapTemplate.LAND_TYPE_DISTRIBUTION')} />
              <CardContent>
                {Object.entries(facilityStats.configsByLandType).map(([landType, count]) => {
                  const percentage = (count / facilityStats.totalConfigs) * 100;
                  return (
                    <Box key={landType} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip
                          label={t(`mapTemplate.LAND_TYPE_${landType}`)}
                          color={getLandTypeColor(landType as LandType)}
                          variant="outlined"
                          size="small"
                        />
                        <Typography variant="body2">
                          {count} ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Cost Analysis */}
        {facilityStats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title={t('mapTemplate.COST_ANALYSIS')} />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.GOLD_COST_RANGE')}
                    </Typography>
                    <Typography variant="h6">
                      {TileFacilityBuildConfigService.formatCurrency(facilityStats.costRanges.goldRange.min)} - {TileFacilityBuildConfigService.formatCurrency(facilityStats.costRanges.goldRange.max)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.CARBON_COST_RANGE')}
                    </Typography>
                    <Typography variant="h6">
                      {facilityStats.costRanges.carbonRange.min} - {facilityStats.costRanges.carbonRange.max} CO₂
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.AVERAGE_UPGRADE_COST')}
                    </Typography>
                    <Typography variant="h6">
                      {TileFacilityBuildConfigService.formatCurrency(facilityStats.averageCosts.upgradeGoldCost)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.COST_EFFICIENCY')}
                    </Typography>
                    <Typography variant="h6">
                      {calculateCostEfficiency(facilityStats).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Facility Type Breakdown */}
        {facilityStats && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('mapTemplate.FACILITY_TYPE_BREAKDOWN')} />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('mapTemplate.FACILITY_TYPE')}</TableCell>
                        <TableCell align="center">{t('mapTemplate.TOTAL')}</TableCell>
                        <TableCell align="center">{t('mapTemplate.ALLOWED')}</TableCell>
                        <TableCell align="right">{t('mapTemplate.AVERAGE_COST')}</TableCell>
                        <TableCell align="center">{t('mapTemplate.STATUS')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(facilityStats.facilityTypeBreakdown).map(([facilityType, breakdown]) => (
                        <TableRow key={facilityType}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <BuildIcon fontSize="small" />
                              {t(`mapTemplate.FACILITY_TYPE_${facilityType}`)}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={breakdown.total} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={breakdown.allowed} 
                              size="small" 
                              color={breakdown.allowed === breakdown.total ? 'success' : 'warning'}
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                            {TileFacilityBuildConfigService.formatCurrency(breakdown.averageGoldCost)}
                          </TableCell>
                          <TableCell align="center">
                            <LinearProgress
                              variant="determinate"
                              value={(breakdown.allowed / breakdown.total) * 100}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                              color={breakdown.allowed === breakdown.total ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderDetailedAnalytics = () => {
    if (!analyticsData?.facilityStats) {
      return (
        <Alert severity="info">
          {t('mapTemplate.NO_FACILITY_STATISTICS')}
        </Alert>
      );
    }

    const { facilityStats } = analyticsData;

    return (
      <Grid container spacing={3}>
        {/* Max Level Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={t('mapTemplate.MAX_LEVEL_DISTRIBUTION')} />
            <CardContent>
              {Object.entries(facilityStats.maxLevelDistribution).map(([level, count]) => {
                const percentage = (count / facilityStats.totalConfigs) * 100;
                return (
                  <Box key={level} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">
                        {t('mapTemplate.LEVEL')} {level}
                      </Typography>
                      <Typography variant="body2">
                        {count} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Configuration Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={t('mapTemplate.CONFIGURATION_STATUS')} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">{t('mapTemplate.ALLOWED_CONFIGURATIONS')}</Typography>
                    <Typography variant="h6" color="success.main">
                      {facilityStats.allowedConfigs}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(facilityStats.allowedConfigs / facilityStats.totalConfigs) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                    color="success"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">{t('mapTemplate.DISALLOWED_CONFIGURATIONS')}</Typography>
                    <Typography variant="h6" color="error.main">
                      {facilityStats.disallowedConfigs}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(facilityStats.disallowedConfigs / facilityStats.totalConfigs) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                    color="error"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">{t('mapTemplate.UPGRADABLE_CONFIGURATIONS')}</Typography>
                    <Typography variant="h6" color="info.main">
                      {facilityStats.upgradableConfigs}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(facilityStats.upgradableConfigs / facilityStats.totalConfigs) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                    color="info"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Metrics */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t('mapTemplate.ADVANCED_METRICS')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {(facilityStats.allowedConfigs / facilityStats.totalConfigs * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.FACILITY_AVAILABILITY_RATE')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="secondary">
                      {(facilityStats.upgradableConfigs / facilityStats.allowedConfigs * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.UPGRADE_AVAILABILITY_RATE')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {TileFacilityBuildConfigService.formatNumber(facilityStats.averageCosts.requiredCarbon)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.AVERAGE_CARBON_COST')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">
                      {calculateCostEfficiency(facilityStats).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('mapTemplate.OVERALL_EFFICIENCY')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    );
  };

  const renderComparisonAnalytics = () => {
    if (analyticsData?.comparisons.length === 0) {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('mapTemplate.SELECT_TEMPLATES_FOR_COMPARISON')}
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            {t('mapTemplate.SELECT_TEMPLATES_TO_COMPARE')}
          </Typography>
          
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: comparisonTemplates.includes(template.id) ? '2px solid' : '1px solid',
                    borderColor: comparisonTemplates.includes(template.id) ? 'primary.main' : 'divider',
                  }}
                  onClick={() => {
                    if (comparisonTemplates.includes(template.id)) {
                      handleRemoveFromComparison(template.id);
                    } else if (comparisonTemplates.length < 5) {
                      handleAddToComparison(template.id);
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.tileCount || 0} {t('mapTemplate.TILES')}
                    </Typography>
                    {comparisonTemplates.includes(template.id) && (
                      <Chip label={t('mapTemplate.SELECTED')} color="primary" size="small" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    const { comparisons } = analyticsData;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('mapTemplate.TEMPLATE_COMPARISON')} ({comparisons.length} {t('mapTemplate.TEMPLATES')})
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('mapTemplate.TEMPLATE_NAME')}</TableCell>
                  <TableCell align="center">{t('mapTemplate.TILES')}</TableCell>
                  <TableCell align="center">{t('mapTemplate.FACILITY_CONFIGS')}</TableCell>
                  <TableCell align="right">{t('mapTemplate.AVERAGE_BUILD_COST')}</TableCell>
                  <TableCell align="right">{t('mapTemplate.AVERAGE_UPGRADE_COST')}</TableCell>
                  <TableCell align="center">{t('mapTemplate.EFFICIENCY')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisons.map((comparison) => {
                  const efficiency = comparison.facilityStats ? 
                    calculateCostEfficiency(comparison.facilityStats) : 0;
                  
                  return (
                    <TableRow key={comparison.templateId}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {comparison.template.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {comparison.templateId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={comparison.tileCount} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={comparison.facilityStats?.totalConfigs || 0} 
                          color={comparison.facilityStats ? 'primary' : 'default'}
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {comparison.averageCosts ? 
                          TileFacilityBuildConfigService.formatCurrency(comparison.averageCosts.buildCost) : 
                          t('mapTemplate.NOT_AVAILABLE')
                        }
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {comparison.averageCosts ? 
                          TileFacilityBuildConfigService.formatCurrency(comparison.averageCosts.upgradeCost) : 
                          t('mapTemplate.NOT_AVAILABLE')
                        }
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {efficiency.toFixed(2)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(efficiency * 10, 100)}
                            sx={{ width: 50, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Comparison Actions */}
        <Grid item xs={12}>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setComparisonTemplates([])}
            >
              {t('mapTemplate.CLEAR_COMPARISON')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                // Export comparison data
                const dataStr = JSON.stringify(comparisons, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = t('mapTemplate.TEMPLATE_COMPARISON_FILENAME');
                link.click();
              }}
            >
              {t('mapTemplate.EXPORT_COMPARISON')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Card sx={{ height: maxHeight }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon />
            <Typography variant="h6">{t('mapTemplate.ANALYTICS_STATISTICS')}</Typography>
          </Box>
        }
        action={
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>{t('mapTemplate.SELECT_TEMPLATE')}</InputLabel>
              <Select
                value={selectedTemplateId || ''}
                label={t('mapTemplate.SELECT_TEMPLATE')}
                onChange={(e) => handleTemplateChange(Number(e.target.value))}
                MenuProps={{
                  PaperProps: {
                    style: {
                      minWidth: 300,
                    },
                  },
                }}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id} sx={{ minWidth: 280 }}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title={t('mapTemplate.REFRESH_ANALYTICS')}>
              <IconButton 
                onClick={() => selectedTemplateId && loadAnalyticsData(selectedTemplateId)}
                disabled={isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Loading */}
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* View Mode Toggle */}
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="overview">
              <InsightsIcon sx={{ mr: 1 }} />
              {t('mapTemplate.OVERVIEW')}
            </ToggleButton>
            <ToggleButton value="detailed">
              <BarChartIcon sx={{ mr: 1 }} />
              {t('mapTemplate.DETAILED')}
            </ToggleButton>
            <ToggleButton value="comparison">
              <CompareIcon sx={{ mr: 1 }} />
              {t('mapTemplate.COMPARISON')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {viewMode === 'overview' && renderOverviewAnalytics()}
          {viewMode === 'detailed' && renderDetailedAnalytics()}
          {viewMode === 'comparison' && renderComparisonAnalytics()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalyticsStatistics;