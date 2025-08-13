import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useInfrastructureTranslation } from '@/lib/i18n/hooks/useTranslation';
import InfrastructureConfigService from '@/lib/services/infrastructureConfigService';
import { InfrastructureConfigStatistics } from '@/types/infrastructure';
import { alpha, useTheme } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle
}) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.04 : 0.10)}, transparent)`
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={600} sx={{ mt: 1, mb: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

interface InfrastructureConfigStatisticsProps {
  templateId?: number;
  refreshInterval?: number;
}

const InfrastructureConfigStatisticsComponent: React.FC<InfrastructureConfigStatisticsProps> = ({
  templateId,
  refreshInterval = 60000
}) => {
  const { t } = useInfrastructureTranslation();
  const theme = useTheme();
  const [statistics, setStatistics] = useState<InfrastructureConfigStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadStatistics();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [templateId, refreshInterval]);

  const loadStatistics = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const stats = await InfrastructureConfigService.getStatistics();
      setStatistics(stats);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load infrastructure statistics:', error);
      setError(t('FAILED_TO_LOAD_STATISTICS'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return InfrastructureConfigService.formatValue(value, 'currency');
  };

  const formatDecimal = (value: number) => {
    return InfrastructureConfigService.formatValue(value, 'decimal');
  };

  const calculateCompletionRate = () => {
    if (!statistics) return 0;
    const total = statistics.totalConfigured + statistics.unconfiguredTemplates;
    return total > 0 ? (statistics.totalConfigured / total) * 100 : 0;
  };

  if (isLoading && !statistics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardHeader
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.12)}, transparent)`
        }}
        title={
          <Typography variant="h6" fontWeight={500}>
            {t('INFRASTRUCTURE_STATISTICS')}
          </Typography>
        }
        action={
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="caption" color="text.secondary">
              {lastRefresh.toLocaleTimeString()}
            </Typography>
            <Tooltip title={t('REFRESH')}>
              <IconButton size="small" onClick={loadStatistics} disabled={isLoading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      
      <CardContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} variant="outlined">
            {error}
          </Alert>
        )}

        {statistics && (
          <>
            <Box mb={4}>
              <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={1}>
                <Typography variant="subtitle2" fontWeight={500} textTransform="uppercase" letterSpacing={0.5} color="text.secondary">
                  {t('CONFIGURATION_COVERAGE')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {calculateCompletionRate().toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculateCompletionRate()}
                color="primary"
                sx={{
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: theme.palette.mode === 'light'
                    ? alpha(theme.palette.text.primary, 0.06)
                    : alpha(theme.palette.common.white, 0.08)
                }}
              />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="caption" color="text.secondary">
                  {statistics.totalConfigured} {t('CONFIGURED')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.unconfiguredTemplates} {t('UNCONFIGURED')}
                </Typography>
              </Box>
            </Box>


            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
              <Box>
                <StatCard
                  title={t('AVG_WATER_PRICE')}
                  value={formatCurrency(statistics.avgWaterPrice)}
                  subtitle={t('PER_UNIT')}
                />
              </Box>

              <Box>
                <StatCard
                  title={t('AVG_ELECTRICITY_PRICE')}
                  value={formatCurrency(statistics.avgElectricityPrice)}
                  subtitle={t('PER_UNIT')}
                />
              </Box>

              <Box>
                <StatCard
                  title={t('AVG_WATER_PLANT_INDEX')}
                  value={formatDecimal(statistics.avgWaterPlantIndex)}
                  subtitle={t('EFFICIENCY_INDEX')}
                />
              </Box>

              <Box>
                <StatCard
                  title={t('AVG_POWER_PLANT_INDEX')}
                  value={formatDecimal(statistics.avgPowerPlantIndex)}
                  subtitle={t('EFFICIENCY_INDEX')}
                />
              </Box>
            </Box>

            <Box mt={4} pt={3} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('TOTAL_TEMPLATES')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {statistics.totalConfigured + statistics.unconfiguredTemplates}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('AVG_RESOURCE_PRICE')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatCurrency((statistics.avgWaterPrice + statistics.avgElectricityPrice) / 2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('AVG_PLANT_INDEX')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDecimal((statistics.avgWaterPlantIndex + statistics.avgPowerPlantIndex) / 2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('STATUS')}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight={500}
                    color={
                      calculateCompletionRate() === 100 
                        ? 'success.main' 
                        : calculateCompletionRate() > 50 
                        ? 'warning.main'
                        : 'error.main'
                    }
                  >
                    {
                      calculateCompletionRate() === 100 
                        ? t('COMPLETE') 
                        : calculateCompletionRate() > 50 
                        ? t('IN_PROGRESS')
                        : t('INCOMPLETE')
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InfrastructureConfigStatisticsComponent;