'use client';

import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { AnnouncementAuthor } from '@/types/announcement';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { formatDateWithEdit } from '@/lib/utils/dateFormatter';

interface AnnouncementMetaProps {
  author: AnnouncementAuthor;
  createdAt: string;
  updatedAt?: string;
  size?: 'small' | 'medium';
}

export default function AnnouncementMeta({
  author,
  createdAt,
  updatedAt,
  size = 'medium'
}: AnnouncementMetaProps) {
  const { t, i18n } = useTranslation();
  const displayName = author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username;

  const formattedDate = formatDateWithEdit(createdAt, updatedAt, t, i18n.language);

  return (
    <Box display="flex" alignItems="center" gap={size === 'small' ? 1 : 1.5}>
      <Avatar
        sx={{
          width: size === 'small' ? 32 : 40,
          height: size === 'small' ? 32 : 40,
          bgcolor: author.userType === 1 ? 'primary.main' : 'secondary.main'
        }}
      >
        {displayName.charAt(0).toUpperCase()}
      </Avatar>
      <Box>
        <Typography
          variant={size === 'small' ? 'body2' : 'body1'}
          fontWeight={500}
        >
          {displayName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formattedDate}
        </Typography>
      </Box>
    </Box>
  );
}