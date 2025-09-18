'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfrastructureHistoryViewer from '@/components/infrastructure/InfrastructureHistoryViewer';

export default function InfrastructureHistoryPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('infrastructure.INFRASTRUCTURE_HISTORY')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('infrastructure.history.overview')}
          </Typography>
          <InfrastructureHistoryViewer />
        </CardContent>
      </Card>
    </Container>
  );
}