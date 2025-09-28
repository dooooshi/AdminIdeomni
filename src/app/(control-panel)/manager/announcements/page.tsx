'use client';

import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import AnnouncementManagerDashboard from '@/components/announcement/manager/AnnouncementManagerDashboard';

export default function ManagerAnnouncementsPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('announcement.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('announcement.managerDescription')}
        </Typography>
      </Box>

      <AnnouncementManagerDashboard />
    </Container>
  );
}