import React from 'react';
import { Box, Typography, Card, CardHeader, CardContent } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { InfrastructureConfigList, InfrastructureConfigStatistics } from '..';

interface InfrastructureConfigLayoutProps {
  templateId?: number;
}

const InfrastructureConfigLayout: React.FC<InfrastructureConfigLayoutProps> = ({ templateId }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: 'transparent',
      }}
    >
      {/* Banner */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.12)}, transparent)`
        }}
      >
        <CardHeader
          title={
            <Typography variant="h6" fontWeight={600}>
              {templateId ? t('infrastructure.INFRASTRUCTURE_CONFIG') : t('infrastructure.ALL_INFRASTRUCTURE_CONFIGS')}
            </Typography>
          }
          sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2 }}
        />
        <CardContent sx={{ display: 'none' }} />
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <InfrastructureConfigStatistics templateId={templateId} />
        </Grid>

        <Grid item xs={12}>
          <InfrastructureConfigList templateId={templateId} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InfrastructureConfigLayout;


