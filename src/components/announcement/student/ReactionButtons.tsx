'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  ThumbUpOutlined as LikeOutlinedIcon,
  ThumbDown as DislikeIcon,
  ThumbDownOutlined as DislikeOutlinedIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  addReaction,
  removeReaction,
  updateReactionOptimistic
} from '@/store/announcementSlice';
import { AnnouncementReactionType, CreateReactionDto } from '@/types/announcement';

interface ReactionButtonsProps {
  announcementId: string;
  likeCount: number;
  dislikeCount: number;
  myReaction?: AnnouncementReactionType;
  size?: 'small' | 'medium' | 'large';
}

export default function ReactionButtons({
  announcementId,
  likeCount,
  dislikeCount,
  myReaction,
  size = 'medium'
}: ReactionButtonsProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localDislikeCount, setLocalDislikeCount] = useState(dislikeCount);
  const [localReaction, setLocalReaction] = useState(myReaction);

  // Sync local state with props when they change
  useEffect(() => {
    setLocalLikeCount(likeCount);
    setLocalDislikeCount(dislikeCount);
    setLocalReaction(myReaction);
  }, [likeCount, dislikeCount, myReaction]);

  const handleReaction = async (type: AnnouncementReactionType) => {
    if (loading) return;

    setLoading(true);
    const previousReaction = localReaction;

    try {
      if (localReaction === type) {
        // Remove reaction
        // Optimistic update
        setLocalReaction(undefined);
        if (type === AnnouncementReactionType.LIKE) {
          setLocalLikeCount(prev => prev - 1);
        } else {
          setLocalDislikeCount(prev => prev - 1);
        }

        dispatch(updateReactionOptimistic({
          announcementId,
          reactionType: null,
          previousReaction
        }));

        const result = await dispatch(removeReaction(announcementId)).unwrap();
        // Update local state with server response to ensure consistency
        if (result.announcement) {
          setLocalLikeCount(result.announcement.likeCount);
          setLocalDislikeCount(result.announcement.dislikeCount);
        }
      } else {
        // Add or change reaction
        // Optimistic update
        if (previousReaction === AnnouncementReactionType.LIKE) {
          setLocalLikeCount(prev => prev - 1);
        } else if (previousReaction === AnnouncementReactionType.DISLIKE) {
          setLocalDislikeCount(prev => prev - 1);
        }

        if (type === AnnouncementReactionType.LIKE) {
          setLocalLikeCount(prev => prev + 1);
        } else {
          setLocalDislikeCount(prev => prev + 1);
        }
        setLocalReaction(type);

        dispatch(updateReactionOptimistic({
          announcementId,
          reactionType: type,
          previousReaction
        }));

        const reactionData: CreateReactionDto = { reactionType: type };
        const result = await dispatch(addReaction({ announcementId, data: reactionData })).unwrap();
        // Update local state with server response to ensure consistency
        if (result.announcement) {
          setLocalLikeCount(result.announcement.likeCount);
          setLocalDislikeCount(result.announcement.dislikeCount);
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalReaction(previousReaction);
      setLocalLikeCount(likeCount);
      setLocalDislikeCount(dislikeCount);
      console.error('Failed to update reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';
  const chipSize = size === 'small' ? 'small' : 'medium';

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {/* Like button */}
      <Box display="flex" alignItems="center">
        <IconButton
          size={iconSize}
          color={localReaction === AnnouncementReactionType.LIKE ? 'success' : 'default'}
          onClick={() => handleReaction(AnnouncementReactionType.LIKE)}
          disabled={loading}
        >
          {localReaction === AnnouncementReactionType.LIKE ? (
            <LikeIcon />
          ) : (
            <LikeOutlinedIcon />
          )}
        </IconButton>
        <Chip
          label={localLikeCount}
          size={chipSize}
          variant={localReaction === AnnouncementReactionType.LIKE ? 'filled' : 'outlined'}
          color={localReaction === AnnouncementReactionType.LIKE ? 'success' : 'default'}
        />
      </Box>

      {/* Dislike button */}
      <Box display="flex" alignItems="center">
        <IconButton
          size={iconSize}
          color={localReaction === AnnouncementReactionType.DISLIKE ? 'error' : 'default'}
          onClick={() => handleReaction(AnnouncementReactionType.DISLIKE)}
          disabled={loading}
        >
          {localReaction === AnnouncementReactionType.DISLIKE ? (
            <DislikeIcon />
          ) : (
            <DislikeOutlinedIcon />
          )}
        </IconButton>
        <Chip
          label={localDislikeCount}
          size={chipSize}
          variant={localReaction === AnnouncementReactionType.DISLIKE ? 'filled' : 'outlined'}
          color={localReaction === AnnouncementReactionType.DISLIKE ? 'error' : 'default'}
        />
      </Box>

      {/* Loading indicator */}
      {loading && (
        <CircularProgress size={20} sx={{ ml: 1 }} />
      )}
    </Box>
  );
}