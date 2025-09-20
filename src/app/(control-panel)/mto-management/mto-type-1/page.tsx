'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  Button,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  List as ListIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import MtoType1RequirementList from '@/components/mto/type1/manager/MtoType1RequirementList';
import MtoType1RequirementForm from '@/components/mto/type1/manager/MtoType1RequirementForm';
import { MtoType1Requirement } from '@/lib/types/mtoType1';
import { useAuth } from '@/lib/auth';

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
      id={`mto-type1-tabpanel-${index}`}
      aria-labelledby={`mto-type1-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MtoType1ManagementPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<MtoType1Requirement | undefined>();
  const [refreshList, setRefreshList] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateClick = () => {
    setSelectedRequirement(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (requirement: MtoType1Requirement) => {
    setSelectedRequirement(requirement);
    setFormOpen(true);
  };

  const handleViewClick = (requirement: MtoType1Requirement) => {
    setSelectedRequirement(requirement);
    setTabValue(1);
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
        <Chip
          icon={<AssessmentIcon />}
          label={t('mto.type1.populationBased')}
          color="primary"
          variant="outlined"
        />
      </Stack>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="MTO Type 1 tabs">
            <Tab
              icon={<ListIcon />}
              iconPosition="start"
              label={t('mto.type1.tabs.requirements')}
              id="mto-type1-tab-0"
            />
            <Tab
              icon={<AssessmentIcon />}
              iconPosition="start"
              label={t('mto.type1.tabs.analytics')}
              id="mto-type1-tab-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <MtoType1RequirementList
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
            onViewClick={handleViewClick}
            onDeleteSuccess={handleDeleteSuccess}
            refresh={refreshList}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('mto.type1.analytics.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mto.type1.analytics.comingSoon')}
            </Typography>
          </Box>
        </TabPanel>
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
    </Container>
  );
}