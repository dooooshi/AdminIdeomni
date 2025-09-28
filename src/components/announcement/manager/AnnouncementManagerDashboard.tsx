'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Campaign as ActiveIcon,
  Archive as ArchivedIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchMyAnnouncements,
  selectMyAnnouncements,
  selectAnnouncementLoading,
  selectAnnouncementError,
  selectMyAnnouncementsPagination,
  clearError
} from '@/store/announcementSlice';
import AnnouncementTable from './AnnouncementTable';
import CreateAnnouncementDialog from './CreateAnnouncementDialog';
import EditAnnouncementDialog from './EditAnnouncementDialog';
import AnnouncementStats from './AnnouncementStats';
import EmptyAnnouncements from '@/components/announcement/common/EmptyAnnouncements';
import { Announcement } from '@/types/announcement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`announcement-tabpanel-${index}`}
      aria-labelledby={`announcement-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function AnnouncementManagerDashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const announcements = useSelector(selectMyAnnouncements);
  const loading = useSelector(selectAnnouncementLoading);
  const error = useSelector(selectAnnouncementError);
  const pagination = useSelector(selectMyAnnouncementsPagination);

  // Fetch announcements on mount and when pagination changes
  useEffect(() => {
    dispatch(
      fetchMyAnnouncements({
        page: page + 1,
        limit: rowsPerPage,
        includeDeleted: tabValue === 1
      })
    );
  }, [dispatch, page, rowsPerPage, tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when switching tabs
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
  };

  const handleEditClick = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  // Filter announcements based on tab
  const filteredAnnouncements = announcements.filter(announcement =>
    tabValue === 0 ? announcement.isActive : !announcement.isActive
  );

  return (
    <Box>
      {/* Stats */}
      <AnnouncementStats announcements={announcements} />

      {/* Main Content */}
      <Paper sx={{ mt: 3 }}>
        {/* Header with Tabs and Create Button */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            pt: 1
          }}
        >
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              icon={<ActiveIcon />}
              iconPosition="start"
              label={t('announcement.activeAnnouncements')}
            />
            <Tab
              icon={<ArchivedIcon />}
              iconPosition="start"
              label={t('announcement.archivedAnnouncements')}
            />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            {t('announcement.create')}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={handleDismissError} sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {loading && !announcements.length ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredAnnouncements.length === 0 ? (
            <EmptyAnnouncements
              isManager={true}
              onCreateClick={handleCreateClick}
            />
          ) : (
            <AnnouncementTable
              announcements={filteredAnnouncements}
              onEdit={handleEditClick}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={pagination?.total || 0}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading && !announcements.length ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredAnnouncements.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                {t('announcement.noArchivedAnnouncements')}
              </Typography>
            </Box>
          ) : (
            <AnnouncementTable
              announcements={filteredAnnouncements}
              onEdit={handleEditClick}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={pagination?.total || 0}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              showRestore={true}
            />
          )}
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <CreateAnnouncementDialog
        open={createDialogOpen}
        onClose={handleCreateClose}
      />
      {editingAnnouncement && (
        <EditAnnouncementDialog
          open={editDialogOpen}
          onClose={handleEditClose}
          announcement={editingAnnouncement}
        />
      )}
    </Box>
  );
}

// Add missing import
import { Typography } from '@mui/material';