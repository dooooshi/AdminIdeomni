'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchAnnouncementById,
  selectCurrentAnnouncement,
  selectAnnouncementLoading,
  selectAnnouncementError,
  clearCurrentAnnouncement,
  clearError
} from '@/store/announcementSlice';
import AnnouncementMeta from '@/components/announcement/common/AnnouncementMeta';
import ReactionButtons from './ReactionButtons';
import AnnouncementService from '@/lib/services/announcementService';

interface AnnouncementDetailDialogProps {
  open: boolean;
  onClose: () => void;
  announcementId: string;
}

export default function AnnouncementDetailDialog({
  open,
  onClose,
  announcementId
}: AnnouncementDetailDialogProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const announcement = useSelector(selectCurrentAnnouncement);
  const loading = useSelector(selectAnnouncementLoading);
  const error = useSelector(selectAnnouncementError);

  useEffect(() => {
    if (open && announcementId) {
      dispatch(fetchAnnouncementById(announcementId));
    }
    return () => {
      if (!open) {
        dispatch(clearCurrentAnnouncement());
        dispatch(clearError());
      }
    };
  }, [dispatch, open, announcementId]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {announcement?.title || t('announcement.title')}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {announcement && !loading && (
          <>
            {/* Author and date */}
            {announcement.author && (
              <Box mb={2}>
                <AnnouncementMeta
                  author={announcement.author}
                  createdAt={announcement.createdAt}
                  updatedAt={announcement.updatedAt}
                />
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Content */}
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.8
              }}
            >
              {announcement.content}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Reaction stats */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('announcement.engagementStats')}
              </Typography>
              <Box display="flex" gap={2} mb={2}>
                <Typography variant="body2" color="text.secondary">
                  {t('announcement.stats.totalReactions', {
                    count: announcement.reactions.total
                  })}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {t('announcement.stats.likesCount', {
                    count: announcement.reactions.likes
                  })}
                </Typography>
                <Typography variant="body2" color="error.main">
                  {t('announcement.stats.dislikesCount', {
                    count: announcement.reactions.dislikes
                  })}
                </Typography>
              </Box>

              {/* Reaction buttons */}
              <ReactionButtons
                announcementId={announcement.id}
                likeCount={announcement.likeCount}
                dislikeCount={announcement.dislikeCount}
                myReaction={announcement.myReaction}
                size="large"
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}