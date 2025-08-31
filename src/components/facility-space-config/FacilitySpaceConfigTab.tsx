'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  PlaylistAdd as BatchIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Category as CategoryIcon,
  RestartAlt as InitializeIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import FacilitySpaceConfigList from './FacilitySpaceConfigList';
import FacilitySpaceConfigForm from './FacilitySpaceConfigForm';
import CategorySpaceSettings from './CategorySpaceSettings';
import {
  FacilitySpaceConfig,
  TemplateSpaceSummary,
} from '@/types/facilitySpace';
import FacilitySpaceConfigService from '@/lib/services/facilitySpaceConfigService';

interface FacilitySpaceConfigTabProps {
  templateId: number;
}

const FacilitySpaceConfigTab: React.FC<FacilitySpaceConfigTabProps> = ({
  templateId,
}) => {
  const { t } = useTranslation();
  
  // State
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<FacilitySpaceConfig | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [sourceTemplateId, setSourceTemplateId] = useState<number | null>(null);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle create new config
  const handleCreate = () => {
    setSelectedConfig(undefined);
    setFormMode('create');
    setFormDialogOpen(true);
    handleMenuClose();
  };

  // Handle edit config
  const handleEdit = (config: FacilitySpaceConfig) => {
    setSelectedConfig(config);
    setFormMode('edit');
    setFormDialogOpen(true);
  };

  // Handle delete config
  const handleDelete = async (config: FacilitySpaceConfig) => {
    const facilityTypeName = t(`facilityManagement:FACILITY_TYPE_${config.facilityType}`);
    if (!window.confirm(t('facilitySpace.CONFIRM_DELETE', { type: facilityTypeName }))) {
      return;
    }

    try {
      setIsLoading(true);
      await FacilitySpaceConfigService.deleteFacilitySpaceConfig(config.id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save config
  const handleSave = async (config: FacilitySpaceConfig) => {
    setFormDialogOpen(false);
    setSelectedConfig(undefined);
    setRefreshKey(prev => prev + 1);
  };

  // Handle initialize defaults
  const handleInitializeDefaults = async () => {
    if (!window.confirm(t('facilitySpace.CONFIRM_INITIALIZE_DEFAULTS'))) {
      return;
    }

    try {
      setIsLoading(true);
      await FacilitySpaceConfigService.initializeDefaultSpaceConfigs(templateId);
      setRefreshKey(prev => prev + 1);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to initialize defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copy from template
  const handleCopyFromTemplate = async () => {
    if (!sourceTemplateId) return;

    try {
      setIsLoading(true);
      await FacilitySpaceConfigService.copySpaceConfigs(templateId, sourceTemplateId);
      setCopyDialogOpen(false);
      setSourceTemplateId(null);
      setRefreshKey(prev => prev + 1);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to copy configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle import configs
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const text = await file.text();
      await FacilitySpaceConfigService.importConfigs(templateId, text);
      setImportDialogOpen(false);
      setRefreshKey(prev => prev + 1);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to import configs:', error);
      alert(t('facilitySpace.IMPORT_ERROR'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export configs
  const handleExport = async () => {
    try {
      const response = await FacilitySpaceConfigService.getFacilitySpaceConfigs(templateId);
      const configs = Array.isArray(response) ? response : response?.data || [];
      const jsonData = FacilitySpaceConfigService.exportConfigs(configs);
      
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facility-space-configs-template-${templateId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to export configs:', error);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('facilitySpace.FACILITY_SPACE_CONFIGURATION')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('facilitySpace.TAB_DESCRIPTION')}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<CategoryIcon />}
            onClick={() => setCategoryDialogOpen(true)}
          >
            {t('facilitySpace.CATEGORY_SETTINGS')}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            {t('facilitySpace.ADD_CONFIG')}
          </Button>

          <Tooltip title={t('facilitySpace.MORE_OPTIONS')}>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Configuration List */}
      <FacilitySpaceConfigList
        key={refreshKey}
        templateId={templateId}
        onConfigEdit={handleEdit}
        onConfigDelete={handleDelete}
      />

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleInitializeDefaults}>
          <ListItemIcon>
            <InitializeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('facilitySpace.INITIALIZE_DEFAULTS')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { setCopyDialogOpen(true); handleMenuClose(); }}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('facilitySpace.COPY_FROM_TEMPLATE')}</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => { setImportDialogOpen(true); handleMenuClose(); }}>
          <ListItemIcon>
            <UploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('facilitySpace.IMPORT_CONFIGS')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleExport}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('facilitySpace.EXPORT_CONFIGS')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <FacilitySpaceConfigForm
          templateId={templateId}
          config={selectedConfig}
          mode={formMode}
          onSave={handleSave}
          onCancel={() => setFormDialogOpen(false)}
          isLoading={isLoading}
        />
      </Dialog>

      {/* Category Settings Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <CategorySpaceSettings
          templateId={templateId}
          onClose={() => setCategoryDialogOpen(false)}
          onSave={() => {
            setCategoryDialogOpen(false);
            setRefreshKey(prev => prev + 1);
          }}
        />
      </Dialog>

      {/* Copy From Template Dialog */}
      <Dialog
        open={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
      >
        <DialogTitle>{t('facilitySpace.COPY_FROM_TEMPLATE')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('facilitySpace.COPY_FROM_TEMPLATE_DESCRIPTION')}
          </Typography>
          <input
            type="number"
            placeholder={t('facilitySpace.SOURCE_TEMPLATE_ID')}
            value={sourceTemplateId || ''}
            onChange={(e) => setSourceTemplateId(parseInt(e.target.value) || null)}
            style={{ width: '100%', padding: '8px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>
            {t('common.CANCEL')}
          </Button>
          <LoadingButton
            onClick={handleCopyFromTemplate}
            loading={isLoading}
            disabled={!sourceTemplateId}
          >
            {t('facilitySpace.COPY')}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      >
        <DialogTitle>{t('facilitySpace.IMPORT_CONFIGS')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('facilitySpace.IMPORT_DESCRIPTION')}
          </Typography>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            {t('common.CANCEL')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilitySpaceConfigTab;