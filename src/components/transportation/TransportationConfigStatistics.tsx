import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Chip } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { 
  TrendingUp as TrendingUpIcon,
  LocalShipping as LocalShippingIcon,
  MonetizationOn as MonetizationOnIcon,
  Park as EcoIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import TransportationConfigService from '@/lib/services/transportationConfigService';
import { TransportationStatistics } from '@/types/transportation';

interface TransportationConfigStatisticsProps {
  templateId?: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="caption">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight={600}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}.50`,
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TransportationConfigStatistics: React.FC<TransportationConfigStatisticsProps> = ({ templateId }) => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<TransportationStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!templateId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const stats = await TransportationConfigService.getStatistics(templateId);
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to fetch transportation statistics:', error);
        setStatistics({
          totalTransfers: 0,
          totalGoldSpent: 0,
          totalCarbonEmitted: 0,
          transfersByTier: {
            tierA: 0,
            tierB: 0,
            tierC: 0,
            tierD: 0
          },
          averageCostPerTransfer: 0,
          averageDistance: 0,
          mostUsedTier: 'TIER_A'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [templateId]);

  if (!templateId) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t('transportation.SELECT_TEMPLATE_FOR_STATISTICS')}
        </Typography>
      </Card>
    );
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  return (
    <Box>
      {/* Statistics sections removed */}
    </Box>
  );
};

export default TransportationConfigStatistics;