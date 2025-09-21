'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  List as ListIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  People as PeopleIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import MtoType1RequirementList from '@/components/mto/type1/manager/MtoType1RequirementList';
import MtoType1RequirementForm from '@/components/mto/type1/manager/MtoType1RequirementForm';
import MtoType1HistoryDashboard from '@/components/mto/type1/manager/MtoType1HistoryDashboard';
import { MtoType1Requirement } from '@/lib/types/mtoType1';
import { useAuth } from '@/lib/auth';

export default function MtoType1ManagementPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<MtoType1Requirement | undefined>();
  const [refreshList, setRefreshList] = useState(0);

  const handleCreateClick = () => {
    setSelectedRequirement(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (requirement: MtoType1Requirement) => {
    setSelectedRequirement(requirement);
    setFormOpen(true);
  };


  const handleFormSave = (requirement: MtoType1Requirement) => {
    setFormOpen(false);
    setRefreshList(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedRequirement(undefined);
  };

  const handleDeleteSuccess = () => {
    setRefreshList(prev => prev + 1);
  };

  const handleOpenHistory = () => {
    setHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setHistoryOpen(false);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            {t('common.home')}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/mto-management"
          >
            {t('navigation.mtoManagement')}
          </Link>
          <Typography color="text.primary">{t('mto.type1.title')}</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('mto.type1.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mto.type1.description')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={handleOpenHistory}
          >
            {t('mto.type1.viewHistory')}
          </Button>
          <Chip
            icon={<PeopleIcon />}
            label={t('mto.type1.populationBased')}
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Paper sx={{ width: '100%', p: 3 }}>
        <MtoType1RequirementList
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onDeleteSuccess={handleDeleteSuccess}
          refresh={refreshList}
        />
      </Paper>

      <Dialog
        open={formOpen}
        onClose={handleFormCancel}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={handleFormCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          <MtoType1RequirementForm
            requirement={selectedRequirement}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={historyOpen}
        onClose={handleCloseHistory}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { minHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <HistoryIcon />
              <Typography variant="h6">{t('mto.type1.history.title')}</Typography>
            </Stack>
            <IconButton
              aria-label="close"
              onClick={handleCloseHistory}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <MtoType1HistoryDashboard />
        </DialogContent>
      </Dialog>
    </Container>
  );
}