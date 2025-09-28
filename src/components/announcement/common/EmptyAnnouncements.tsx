'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Campaign as AnnouncementIcon } from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface EmptyAnnouncementsProps {
  isManager?: boolean;
  onCreateClick?: () => void;
}

export default function EmptyAnnouncements({
  isManager = false,
  onCreateClick
}: EmptyAnnouncementsProps) {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={3}
      textAlign="center"
    >
      <AnnouncementIcon
        sx={{
          fontSize: 64,
          color: 'text.secondary',
          mb: 2,
          opacity: 0.5
        }}
      />
      <Typography variant="h6" gutterBottom>
        {t('announcement.noAnnouncements')}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {isManager
          ? t('announcement.noAnnouncementsManagerHint')
          : t('announcement.noAnnouncementsStudentHint')}
      </Typography>
      {isManager && onCreateClick && (
        <Button variant="contained" onClick={onCreateClick}>
          {t('announcement.create')}
        </Button>
      )}
    </Box>
  );
}