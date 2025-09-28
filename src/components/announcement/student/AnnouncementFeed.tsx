'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchAnnouncements,
  selectAnnouncements,
  selectAnnouncementLoading,
  selectAnnouncementError,
  selectAnnouncementPagination,
  clearError
} from '@/store/announcementSlice';
import AnnouncementCard from './AnnouncementCard';
import EmptyAnnouncements from '@/components/announcement/common/EmptyAnnouncements';
import AnnouncementSkeleton from '@/components/announcement/common/AnnouncementSkeleton';
import AnnouncementDetailDialog from './AnnouncementDetailDialog';
import { Announcement } from '@/types/announcement';

export default function AnnouncementFeed() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const announcements = useSelector(selectAnnouncements);
  const loading = useSelector(selectAnnouncementLoading);
  const error = useSelector(selectAnnouncementError);
  const pagination = useSelector(selectAnnouncementPagination);

  // Fetch announcements on mount and when page changes
  useEffect(() => {
    dispatch(
      fetchAnnouncements({
        page,
        limit: 10
      })
    );
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    // Refetch to update reaction counts if changed
    dispatch(fetchAnnouncements({ page, limit: 10 }));
  };

  if (loading && !announcements.length) {
    return <AnnouncementSkeleton count={3} />;
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={handleDismissError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <EmptyAnnouncements isManager={false} />
      ) : (
        <>
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onClick={() => handleAnnouncementClick(announcement)}
            />
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Loading more indicator */}
      {loading && announcements.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Detail Dialog */}
      {selectedAnnouncement && (
        <AnnouncementDetailDialog
          open={detailDialogOpen}
          onClose={handleCloseDetail}
          announcementId={selectedAnnouncement.id}
        />
      )}
    </Box>
  );
}