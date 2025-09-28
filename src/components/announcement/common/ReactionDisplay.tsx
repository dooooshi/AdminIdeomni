'use client';

import React from 'react';
import { Box, Chip } from '@mui/material';
import {
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon
} from '@mui/icons-material';

interface ReactionDisplayProps {
  likeCount: number;
  dislikeCount: number;
  size?: 'small' | 'medium';
  showLabels?: boolean;
}

export default function ReactionDisplay({
  likeCount,
  dislikeCount,
  size = 'small',
  showLabels = false
}: ReactionDisplayProps) {
  return (
    <Box display="flex" gap={1} alignItems="center">
      <Chip
        icon={<LikeIcon />}
        label={showLabels ? `Like (${likeCount})` : likeCount}
        size={size}
        variant="outlined"
        color="success"
        sx={{ borderColor: 'success.light' }}
      />
      <Chip
        icon={<DislikeIcon />}
        label={showLabels ? `Dislike (${dislikeCount})` : dislikeCount}
        size={size}
        variant="outlined"
        color="error"
        sx={{ borderColor: 'error.light' }}
      />
    </Box>
  );
}