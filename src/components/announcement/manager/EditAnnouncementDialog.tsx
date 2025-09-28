'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { updateAnnouncement, fetchMyAnnouncements } from '@/store/announcementSlice';
import { Announcement, UpdateAnnouncementDto } from '@/types/announcement';

interface EditAnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  announcement: Announcement;
}

export default function EditAnnouncementDialog({
  open,
  onClose,
  announcement
}: EditAnnouncementDialogProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<UpdateAnnouncementDto>({
    title: announcement.title,
    content: announcement.content
  });
  const [errors, setErrors] = useState<Partial<UpdateAnnouncementDto>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when announcement changes
  useEffect(() => {
    setFormData({
      title: announcement.title,
      content: announcement.content
    });
    setErrors({});
    setSubmitError(null);
  }, [announcement]);

  const handleChange = (field: keyof UpdateAnnouncementDto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<UpdateAnnouncementDto> = {};

    if (formData.title !== undefined) {
      if (!formData.title.trim()) {
        newErrors.title = t('announcement.validation.titleRequired');
      } else if (formData.title.length > 200) {
        newErrors.title = t('announcement.validation.titleMaxLength');
      }
    }

    if (formData.content !== undefined && !formData.content.trim()) {
      newErrors.content = t('announcement.validation.contentRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Check if anything has changed
    const hasChanges =
      formData.title !== announcement.title ||
      formData.content !== announcement.content;

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await dispatch(updateAnnouncement({
        id: announcement.id,
        data: formData
      })).unwrap();
      // Refresh the list
      await dispatch(fetchMyAnnouncements({ page: 1, limit: 10 }));
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || t('announcement.error.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: announcement.title,
      content: announcement.content
    });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>{t('announcement.edit')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('announcement.form.title')}
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={
              errors.title ||
              `${(formData.title || '').length}/200 ${t('common.characters')}`
            }
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label={t('announcement.form.content')}
            value={formData.content}
            onChange={handleChange('content')}
            error={!!errors.content}
            helperText={errors.content}
            margin="normal"
            required
            multiline
            rows={6}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}