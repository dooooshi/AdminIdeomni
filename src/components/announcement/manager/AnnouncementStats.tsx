'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Campaign as TotalIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  TrendingUp as EngagementIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { Announcement } from '@/types/announcement';

interface AnnouncementStatsProps {
  announcements: Announcement[];
}

export default function AnnouncementStats({ announcements }: AnnouncementStatsProps) {
  const { t } = useTranslation();

  // Calculate stats
  const totalAnnouncements = announcements.length;
  const activeAnnouncements = announcements.filter(a => a.isActive).length;
  const totalLikes = announcements.reduce((sum, a) => sum + a.likeCount, 0);
  const totalDislikes = announcements.reduce((sum, a) => sum + a.dislikeCount, 0);
  const totalReactions = totalLikes + totalDislikes;
  const engagementRate = totalAnnouncements > 0
    ? ((totalReactions / (totalAnnouncements * 2)) * 100).toFixed(1)
    : '0';

  const stats = [
    {
      title: t('announcement.stats.total'),
      value: totalAnnouncements,
      subtitle: `${activeAnnouncements} ${t('common.active')}`,
      icon: TotalIcon,
      color: 'primary.main'
    },
    {
      title: t('announcement.stats.likes'),
      value: totalLikes,
      subtitle: t('announcement.stats.totalLikes'),
      icon: LikeIcon,
      color: 'success.main'
    },
    {
      title: t('announcement.stats.dislikes'),
      value: totalDislikes,
      subtitle: t('announcement.stats.totalDislikes'),
      icon: DislikeIcon,
      color: 'error.main'
    },
    {
      title: t('announcement.stats.engagement'),
      value: `${engagementRate}%`,
      subtitle: t('announcement.stats.engagementRate'),
      icon: EngagementIcon,
      color: 'warning.main'
    }
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: `${stat.color}15`,
                      mr: 2
                    }}
                  >
                    <Icon sx={{ color: stat.color }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}