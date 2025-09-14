'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Container } from '@mui/material';
import InfrastructureHistoryViewer from '@/components/infrastructure/InfrastructureHistoryViewer';

export default function InfrastructureHistoryPage() {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Infrastructure History',
      'overview': 'Connection & Service History'
    };
    return translations[key] || key;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('title')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('overview')}
          </Typography>
          <InfrastructureHistoryViewer />
        </CardContent>
      </Card>
    </Container>
  );
}