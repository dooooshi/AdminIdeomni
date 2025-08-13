'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation, useMapTemplateTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Fab,
  Zoom,
  Chip,
  Grid,
} from '@mui/material';
import {
  Map as MapIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  AutoFixHigh as AutoFixHighIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  List as ListIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Factory as FactoryIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import { motion } from 'motion/react';

import { 
  MapTemplate, 
  MapTile, 
  UpdateTileDto, 
  GenerateMapTemplateDto,
  CreateMapTemplateDto,
  EnhancedMapTemplate 
} from '@/components/map/types';
import MapTemplateService from '@/lib/services/mapTemplateService';
import MapConfigurationInterface from '@/components/map/ui/MapConfigurationInterface';
import TemplateGenerationForm from '@/components/map/ui/TemplateGenerationForm';
import TileConfigurationPanel from '@/components/map/ui/TileConfigurationPanel';

// Import new facility management components
import TileFacilityConfigList from '@/components/map-template/TileFacilityConfigList';
import TemplateSetupWizard from '@/components/map-template/TemplateSetupWizard';
// NEW: Import bulk tile management component
import BulkTileManagementPanel from '@/components/map-template/BulkTileManagementPanel';
// Import infrastructure configuration components
import { 
  InfrastructureConfigForm, 
  InfrastructureConfigList,
  InfrastructureConfigStatistics,
  InfrastructureConfigLayout
} from '@/components/infrastructure';

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
      id={`map-template-tabpanel-${index}`}
      aria-labelledby={`map-template-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `map-template-tab-${index}`,
    'aria-controls': `map-template-tabpanel-${index}`,
  };
}

// Template List Component
interface TemplateListProps {
  templates: EnhancedMapTemplate[];
  isLoading: boolean;
  onSelectTemplate: (template: MapTemplate) => void;
  onCreateTemplate: () => void;
  onGenerateTemplate: () => void;
  onRefresh: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  isLoading,
  onSelectTemplate,
  onCreateTemplate,
  onGenerateTemplate,
  onRefresh,
}) => {
  const { t } = useMapTemplateTranslation();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>{t('LOADING_TEMPLATES')}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">{t('MAP_TEMPLATES')}</Typography>
        <Box>
          <Tooltip title={t('REFRESH')}>
            <IconButton onClick={onRefresh} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreateTemplate}
            sx={{ mr: 1 }}
          >
            {t('CREATE_TEMPLATE')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            onClick={onGenerateTemplate}
          >
            {t('GENERATE_TEMPLATE')}
          </Button>
        </Box>
      </Box>

      {!Array.isArray(templates) || templates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <MapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('NO_TEMPLATES_FOUND')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('NO_TEMPLATES_DESCRIPTION')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AutoFixHighIcon />}
              onClick={onGenerateTemplate}
            >
              {t('CREATE_FIRST_TEMPLATE')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={2}>
          {Array.isArray(templates) && templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: template.isDefault ? '2px solid' : '1px solid',
                  borderColor: template.isDefault ? 'primary.main' : 'divider',
                }}
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" noWrap>
                      {template.name}
                    </Typography>
                    {template.isDefault && (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        }}
                      >
                        {t('DEFAULT')}
                      </Typography>
                    )}
                  </Box>
                  
                  {template.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {t('VERSION')}: {template.version}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.tileCount || 0} {t('TILES')}
                    </Typography>
                  </Box>

                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button size="small" startIcon={<SettingsIcon />}>
                      {t('CONFIGURE')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
};

const MapTemplateManagementPage: React.FC = () => {
  const { t } = useMapTemplateTranslation();
  const { t: tNav } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedMapTemplate | null>(null);
  const [selectedTemplateTiles, setSelectedTemplateTiles] = useState<MapTile[]>([]);
  const [generationDialogOpen, setGenerationDialogOpen] = useState(false);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templates, setTemplates] = useState<EnhancedMapTemplate[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectTemplate = useCallback(async (template: MapTemplate) => {
    try {
      setIsLoading(true);
      // Load template with tiles, statistics, and facility configurations
      const fullTemplate = await MapTemplateService.getMapTemplate(template.id, {
        includeTiles: true,
        includeStatistics: true,
        includeFacilityConfigs: true,
      });
      
      setSelectedTemplate(fullTemplate);
      setSelectedTemplateTiles(Array.isArray(fullTemplate.tiles) ? fullTemplate.tiles : []);
      setTabValue(1); // Switch to configuration tab
    } catch (error) {
      console.error('Failed to load template details:', error);
      // Keep the basic template data even if detailed loading fails
      setSelectedTemplate(template as EnhancedMapTemplate);
      setSelectedTemplateTiles([]);
      setTabValue(1); // Still switch to configuration tab
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTemplateCreated = useCallback(async (template: MapTemplate) => {
    try {
      // Refresh templates list
      const response = await MapTemplateService.getMapTemplates();
      const templatesData = Array.isArray(response) ? response : response?.data || [];
      setTemplates(templatesData);
      
      // Select the new template
      await handleSelectTemplate(template);
    } catch (error) {
      console.error('Failed to refresh templates after creation:', error);
    }
  }, [handleSelectTemplate]);

  const loadTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const response = await MapTemplateService.getMapTemplates();
      const templatesData = Array.isArray(response) ? response : response?.data || [];
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Fallback to mock data for development
      const mockTemplates: EnhancedMapTemplate[] = [
        {
          id: 1,
          name: t('DEFAULT_ECONOMIC_TEMPLATE'),
          description: t('DEFAULT_ECONOMIC_TEMPLATE_DESC'),
          version: '1.0',
          isActive: true,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tileCount: 105,
        },
        {
          id: 2,
          name: t('COASTAL_DEVELOPMENT_TEMPLATE'),
          description: t('COASTAL_DEVELOPMENT_TEMPLATE_DESC'),
          version: '1.0',
          isActive: true,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tileCount: 84,
        },
      ];
      setTemplates(mockTemplates);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const handleTileUpdate = useCallback(async (tileId: number, updates: UpdateTileDto) => {
    try {
      await MapTemplateService.updateTile(tileId, updates);
      // Refresh tiles
      if (selectedTemplate) {
        const updatedTemplate = await MapTemplateService.getMapTemplate(selectedTemplate.id, {
          includeTiles: true,
        });
        setSelectedTemplateTiles(updatedTemplate.tiles || []);
      }
    } catch (error) {
      console.error('Failed to update tile:', error);
      throw error;
    }
  }, [selectedTemplate]);

  const handleTemplateRefresh = useCallback(async () => {
    try {
      if (selectedTemplate) {
        const updatedTemplate = await MapTemplateService.getMapTemplate(selectedTemplate.id, {
          includeTiles: true,
        });
        setSelectedTemplateTiles(updatedTemplate.tiles || []);
        // Also update the template data if needed
        setSelectedTemplate(updatedTemplate);
      }
    } catch (error) {
      console.error('Failed to refresh template:', error);
    }
  }, [selectedTemplate]);

  const handleBatchTileUpdate = useCallback(async (tileIds: number[], updates: UpdateTileDto) => {
    try {
      const updateRequests = tileIds.map(tileId => ({ tileId, updates }));
      await MapTemplateService.bulkUpdateTiles(updateRequests);
      // Refresh tiles
      if (selectedTemplate) {
        const updatedTemplate = await MapTemplateService.getMapTemplate(selectedTemplate.id, {
          includeTiles: true,
        });
        setSelectedTemplateTiles(updatedTemplate.tiles || []);
      }
    } catch (error) {
      console.error('Failed to batch update tiles:', error);
      throw error;
    }
  }, [selectedTemplate]);

  const handleSaveTemplate = useCallback(async () => {
    // Template is automatically saved when tiles are updated
    console.log('Template saved');
  }, []);

  const handleGenerateTemplate = useCallback(async (params: GenerateMapTemplateDto) => {
    try {
      setIsLoading(true);
      const newTemplate = await MapTemplateService.generateMapTemplate(params);
      setGenerationDialogOpen(false);
      await handleSelectTemplate(newTemplate);
    } catch (error) {
      console.error('Failed to generate template:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleSelectTemplate]);

  const handleCreateTemplate = useCallback(() => {
    setSetupWizardOpen(true);
  }, []);

  const handleGenerateTemplateAction = useCallback(() => {
    setGenerationDialogOpen(true);
  }, []);

  const handleSetupWizardComplete = useCallback(async (template: MapTemplate) => {
    await handleTemplateCreated(template);
    setSetupWizardOpen(false);
  }, [handleTemplateCreated]);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <IdeomniPageSimple
      header={
        <Box sx={{ p: 3 }}>
          <Breadcrumbs aria-label={tCommon('BREADCRUMB')} sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">
              <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {tNav('DASHBOARD')}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <MapIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {t('MAP_TEMPLATE_MANAGEMENT')}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {t('MAP_TEMPLATE_MANAGEMENT')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {t('MAP_TEMPLATE_MANAGEMENT_SUBTITLE')}
          </Typography>
        </Box>
      }
      content={
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label={tCommon('MAP_TEMPLATE_TABS')}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={t('TEMPLATE_LIST')} 
                icon={<ListIcon />} 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label={selectedTemplate ? t('TILE_CONFIGURATION') : t('SELECT_TEMPLATE')} 
                icon={<SettingsIcon />} 
                iconPosition="start"
                {...a11yProps(1)}
                disabled={!selectedTemplate}
              />
              <Tab 
                label={t('FACILITY_CONFIG')} 
                icon={<BuildIcon />} 
                iconPosition="start"
                {...a11yProps(2)}
                disabled={!selectedTemplate}
              />
              <Tab 
                label={t('BULK_TILE_MANAGEMENT')} 
                icon={<AutoFixHighIcon />} 
                iconPosition="start"
                {...a11yProps(3)}
                disabled={!selectedTemplate}
              />
              <Tab 
                label={t('INFRASTRUCTURE_CONFIG')} 
                icon={<FactoryIcon />} 
                iconPosition="start"
                {...a11yProps(4)}
                disabled={!selectedTemplate}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {/* Template List Tab */}
            <TabPanel value={tabValue} index={0}>
              <TemplateList
                templates={templates}
                isLoading={templatesLoading}
                onSelectTemplate={handleSelectTemplate}
                onCreateTemplate={handleCreateTemplate}
                onGenerateTemplate={handleGenerateTemplateAction}
                onRefresh={loadTemplates}
              />
            </TabPanel>

            {/* Tile Configuration Tab */}
            <TabPanel value={tabValue} index={1}>
              {selectedTemplate && selectedTemplateTiles.length > 0 ? (
                <MapConfigurationInterface
                  template={selectedTemplate}
                  tiles={selectedTemplateTiles}
                  onTemplateUpdate={() => {}}
                  onTileUpdate={handleTileUpdate}
                  onTileBatchUpdate={handleBatchTileUpdate}
                  onTemplateRefresh={handleTemplateRefresh}
                  onSave={handleSaveTemplate}
                  isLoading={isLoading}
                />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                  <Alert severity="info">
                    {t('SELECT_TEMPLATE_TO_CONFIGURE')}
                  </Alert>
                </Box>
              )}
            </TabPanel>

            {/* Facility Configuration Tab */}
            <TabPanel value={tabValue} index={2}>
              {selectedTemplate ? (
                <Box sx={{ p: 3 }}>
                  <TileFacilityConfigList templateId={selectedTemplate.id} />
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                  <Alert severity="info">
                    {t('SELECT_TEMPLATE_FOR_FACILITY_CONFIG')}
                  </Alert>
                </Box>
              )}
            </TabPanel>

            {/* NEW: Bulk Tile Management Tab */}
            <TabPanel value={tabValue} index={3}>
              {selectedTemplate ? (
                <Box sx={{ p: 3 }}>
                  <BulkTileManagementPanel 
                    templateId={selectedTemplate.id}
                    onOperationComplete={() => {
                      // Refresh template data after bulk operations
                      handleTemplateRefresh();
                    }}
                    templateStatistics={{
                      totalTiles: selectedTemplateTiles.length,
                      tilesByLandType: selectedTemplateTiles.reduce((acc, tile) => {
                        acc[tile.landType] = (acc[tile.landType] || 0) + 1;
                        return acc;
                      }, {} as Record<any, number>)
                    }}
                  />
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                  <Alert severity="info">
                    {t('SELECT_TEMPLATE_FOR_BULK_TILE_MANAGEMENT')}
                  </Alert>
                </Box>
              )}
            </TabPanel>

            {/* Infrastructure Configuration Tab */}
            <TabPanel value={tabValue} index={4}>
              {selectedTemplate ? (
                <InfrastructureConfigLayout templateId={selectedTemplate.id} />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                  <Alert severity="info" variant="outlined">
                    {t('SELECT_TEMPLATE_FOR_INFRASTRUCTURE_CONFIG')}
                  </Alert>
                </Box>
              )}
            </TabPanel>

          </Box>

          {/* Floating Action Button for Quick Generation */}
          <Zoom in={tabValue === 0}>
            <Fab
              color="primary"
              aria-label={tCommon('GENERATE_TEMPLATE')}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
              onClick={handleGenerateTemplateAction}
            >
              <AutoFixHighIcon />
            </Fab>
          </Zoom>

          {/* Template Setup Wizard */}
          <TemplateSetupWizard
            open={setupWizardOpen}
            onClose={() => setSetupWizardOpen(false)}
            onComplete={handleSetupWizardComplete}
          />

          {/* Template Generation Dialog */}
          <Dialog
            open={generationDialogOpen}
            onClose={() => setGenerationDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <AutoFixHighIcon />
                <Typography variant="h6">
                  {t('GENERATE_NEW_TEMPLATE')}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <TemplateGenerationForm
                onGenerate={handleGenerateTemplate}
                isLoading={isLoading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setGenerationDialogOpen(false)}>
                {t('CANCEL')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      }
    />
  );
};

export default MapTemplateManagementPage; 