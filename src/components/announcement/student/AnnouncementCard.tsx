'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Divider
} from '@mui/material';
import { ReadMore as ReadMoreIcon } from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { Announcement } from '@/types/announcement';
import AnnouncementMeta from '@/components/announcement/common/AnnouncementMeta';
import ReactionButtons from './ReactionButtons';

interface AnnouncementCardProps {
  announcement: Announcement;
  onClick: () => void;
}

export default function AnnouncementCard({
  announcement,
  onClick
}: AnnouncementCardProps) {
  const { t } = useTranslation();

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Author and date */}
        {announcement.author && (
          <AnnouncementMeta
            author={announcement.author}
            createdAt={announcement.createdAt}
            updatedAt={announcement.updatedAt}
            size="medium"
          />
        )}

        <Divider sx={{ my: 2 }} />

        {/* Title */}
        <Typography variant="h6" gutterBottom>
          {announcement.title}
        </Typography>

        {/* Content preview */}
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {truncateContent(announcement.content)}
        </Typography>

        {/* Read more button if content is truncated */}
        {announcement.content.length > 200 && (
          <Button
            size="small"
            onClick={onClick}
            startIcon={<ReadMoreIcon />}
            sx={{ mb: 1 }}
          >
            {t('common.readMore')}
          </Button>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
        {/* Reaction buttons */}
        <ReactionButtons
          announcementId={announcement.id}
          likeCount={announcement.likeCount}
          dislikeCount={announcement.dislikeCount}
          myReaction={announcement.myReaction}
        />

        {/* View details button */}
        <Button size="small" onClick={onClick}>
          {t('announcement.viewDetails')}
        </Button>
      </CardActions>
    </Card>
  );
}