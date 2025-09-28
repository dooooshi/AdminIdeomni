'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import AnnouncementFeed from '@/components/announcement/student/AnnouncementFeed';

export default function StudentAnnouncementsPage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('announcement.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('announcement.studentDescription')}
        </Typography>
      </Box>

      <AnnouncementFeed />
    </Container>
  );
}