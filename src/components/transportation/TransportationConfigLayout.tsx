import React from 'react';
import { Box, Typography, Card, CardHeader, CardContent } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import TransportationConfigList from './TransportationConfigList';
import TransportationConfigStatistics from './TransportationConfigStatistics';

interface TransportationConfigLayoutProps {
  templateId?: number;
}

const TransportationConfigLayout: React.FC<TransportationConfigLayoutProps> = ({ templateId }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: 'transparent',
      }}
    >
      {/* Transportation Config header removed */}
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TransportationConfigStatistics templateId={templateId} />
        </Grid>

        <Grid item xs={12}>
          <TransportationConfigList templateId={templateId} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransportationConfigLayout;