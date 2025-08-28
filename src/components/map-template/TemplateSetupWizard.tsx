'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  Alert,
  Paper,
  Divider,
  Chip,
  FormControlLabel,
  Switch,
  Slider,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AutoFixHigh as AutoFixHighIcon,
  Settings as SettingsIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  GenerateMapTemplateDto,
  MapTemplate,
  LandType,
  TileFacilityConfigStatistics,
} from '@/components/map/types';
import MapTemplateService from '@/lib/services/mapTemplateService';

interface TemplateSetupWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (template: MapTemplate) => void;
}

interface WizardData {
  // Step 1: Basic Information
  templateName: string;
  description: string;
  templateType: 'generate' | 'manual';
  
  // Step 2: Map Configuration
  width: number;
  height: number;
  marinePercentage: number;
  coastalPercentage: number;
  plainPercentage: number;
  randomSeed?: number;
  
  // Step 3: Facility Configuration
  initializeFacilityConfigs: boolean;
  difficultyPreset: 'easy' | 'normal' | 'hard' | 'custom';
  customDifficultySettings?: {
    goldMultiplier: number;
    carbonMultiplier: number;
    upgradeMultiplier: number;
  };
  
  // Step 4: Advanced Settings
  customEconomicSettings: boolean;
  economicSettings?: {
    [key in LandType]: {
      initialPrice: number;
      initialPopulation: number;
      transportationCost: number;
    };
  };
}

const steps = [
  'BASIC_INFORMATION',
  'MAP_CONFIGURATION', 
  'FACILITY_CONFIGURATION',
  'ADVANCED_SETTINGS',
  'REVIEW_AND_CREATE'
];

const TemplateSetupWizard: React.FC<TemplateSetupWizardProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const { t } = useTranslation();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [createdTemplate, setCreatedTemplate] = useState<MapTemplate | null>(null);
  const [facilityStats, setFacilityStats] = useState<TileFacilityConfigStatistics | null>(null);

  const [wizardData, setWizardData] = useState<WizardData>({
    templateName: '',
    description: '',
    templateType: 'generate',
    width: 15,
    height: 7,
    marinePercentage: 33,
    coastalPercentage: 33,
    plainPercentage: 34,
    initializeFacilityConfigs: true,
    difficultyPreset: 'normal',
    customEconomicSettings: false,
  });

  // Reset wizard when dialog opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setValidationErrors({});
      setCreatedTemplate(null);
      setFacilityStats(null);
      setWizardData({
        templateName: '',
        description: '',
        templateType: 'generate',
        width: 15,
        height: 7,
        marinePercentage: 33,
        coastalPercentage: 33,
        plainPercentage: 34,
        initializeFacilityConfigs: true,
        difficultyPreset: 'normal',
        customEconomicSettings: false,
      });
    }
  }, [open]);

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
    // Clear validation errors for updated fields
    const newErrors = { ...validationErrors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setValidationErrors(newErrors);
  };

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Basic Information
        if (!wizardData.templateName.trim()) {
          errors.templateName = t('mapTemplate.VALIDATION_TEMPLATE_NAME_REQUIRED');
        } else if (wizardData.templateName.trim().length < 3) {
          errors.templateName = t('mapTemplate.VALIDATION_TEMPLATE_NAME_TOO_SHORT');
        }
        break;

      case 1: // Map Configuration
        if (wizardData.templateType === 'generate') {
          const totalPercentage = wizardData.marinePercentage + wizardData.coastalPercentage + wizardData.plainPercentage;
          if (Math.abs(totalPercentage - 100) > 0.01) {
            errors.landDistribution = t('mapTemplate.LAND_PERCENTAGES_MUST_SUM_TO_100');
          }
          if (wizardData.width < 5 || wizardData.width > 25) {
            errors.width = t('mapTemplate.WIDTH_MUST_BE_BETWEEN_5_AND_25');
          }
          if (wizardData.height < 3 || wizardData.height > 20) {
            errors.height = t('mapTemplate.HEIGHT_MUST_BE_BETWEEN_3_AND_20');
          }
        }
        break;

      case 2: // Facility Configuration
        // No validation required for this step
        break;

      case 3: // Advanced Settings
        if (wizardData.customEconomicSettings && wizardData.economicSettings) {
          Object.entries(wizardData.economicSettings).forEach(([landType, settings]) => {
            if (settings.initialPrice < 0) {
              errors[`${landType}_price`] = t('mapTemplate.VALIDATION_PRICE_NEGATIVE');
            }
            if (settings.initialPopulation < 0) {
              errors[`${landType}_population`] = t('mapTemplate.VALIDATION_POPULATION_NEGATIVE');
            }
            if (settings.transportationCost < 0) {
              errors[`${landType}_transport`] = t('mapTemplate.VALIDATION_TRANSPORT_NEGATIVE');
            }
          });
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCreateTemplate = async () => {
    try {
      setIsLoading(true);

      let template: MapTemplate;

      if (wizardData.templateType === 'generate') {
        // Generate template with tiles
        const generateParams: GenerateMapTemplateDto = {
          name: wizardData.templateName,
          description: wizardData.description,
          width: wizardData.width,
          height: wizardData.height,
          marinePercentage: wizardData.marinePercentage,
          coastalPercentage: wizardData.coastalPercentage,
          plainPercentage: wizardData.plainPercentage,
          randomSeed: wizardData.randomSeed,
        };

        // TODO: Custom economic settings are not yet supported by the backend API
        // The GenerateMapTemplateDto interface needs to be extended to support custom pricing
        // if (wizardData.customEconomicSettings && wizardData.economicSettings) {
        //   // Custom economic settings will be handled in a future update
        // }

        template = await MapTemplateService.generateMapTemplate(generateParams);
      } else {
        // Create basic template
        template = await MapTemplateService.createMapTemplate({
          name: wizardData.templateName,
          description: wizardData.description,
          width: wizardData.width,
          height: wizardData.height,
        });
      }

      setCreatedTemplate(template);

      // Initialize facility configurations if requested
      if (wizardData.initializeFacilityConfigs) {
        const result = await MapTemplateService.createCompleteTemplate({
          name: template.name,
          description: template.description,
          initializeFacilityConfigs: true,
        });

        // Apply difficulty preset if not normal
        if (wizardData.difficultyPreset !== 'normal') {
          await MapTemplateService.applyDifficultyPreset(
            template.id,
            wizardData.difficultyPreset
          );
        }

        // Load facility statistics
        try {
          const stats = await MapTemplateService.getTemplateStatistics(template.id);
          setFacilityStats(stats.facilityStatistics || null);
        } catch (error) {
          console.warn('Failed to load facility statistics:', error);
        }
      }

      // Move to completion step
      setActiveStep(steps.length - 1);

    } catch (error) {
      console.error('Failed to create template:', error);
      setValidationErrors({ 
        creation: error instanceof Error ? error.message : 'Template creation failed' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLandDistributionChange = (landType: LandType, value: number) => {
    const updates: Partial<WizardData> = {};
    
    switch (landType) {
      case LandType.MARINE:
        updates.marinePercentage = value;
        break;
      case LandType.COASTAL:
        updates.coastalPercentage = value;
        break;
      case LandType.PLAIN:
        updates.plainPercentage = value;
        break;
    }
    
    updateWizardData(updates);
  };

  const getEstimatedTileCount = (): number => {
    return wizardData.width * wizardData.height;
  };

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Information
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('mapTemplate.TEMPLATE_NAME')}
                value={wizardData.templateName}
                onChange={(e) => updateWizardData({ templateName: e.target.value })}
                error={!!validationErrors.templateName}
                helperText={validationErrors.templateName}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('mapTemplate.DESCRIPTION')}
                value={wizardData.description}
                onChange={(e) => updateWizardData({ description: e.target.value })}
                placeholder={t('mapTemplate.TEMPLATE_DESCRIPTION_PLACEHOLDER')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth sx={{ minWidth: 250 }}>
                <InputLabel>{t('mapTemplate.TEMPLATE_TYPE')}</InputLabel>
                <Select
                  value={wizardData.templateType}
                  label={t('mapTemplate.TEMPLATE_TYPE')}
                  onChange={(e) => updateWizardData({ templateType: e.target.value as 'generate' | 'manual' })}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        minWidth: 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="generate" sx={{ minWidth: 280 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AutoFixHighIcon />
                      {t('mapTemplate.GENERATED_TEMPLATE')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="manual" sx={{ minWidth: 280 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SettingsIcon />
                      {t('mapTemplate.MANUAL_TEMPLATE')}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1: // Map Configuration
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('mapTemplate.WIDTH')}
                value={wizardData.width}
                onChange={(e) => updateWizardData({ width: Number(e.target.value) })}
                error={!!validationErrors.width}
                helperText={validationErrors.width}
                inputProps={{ min: 5, max: 25 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('mapTemplate.HEIGHT')}
                value={wizardData.height}
                onChange={(e) => updateWizardData({ height: Number(e.target.value) })}
                error={!!validationErrors.height}
                helperText={validationErrors.height}
                inputProps={{ min: 3, max: 20 }}
              />
            </Grid>

            {wizardData.templateType === 'generate' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>
                      {t('mapTemplate.LAND_DISTRIBUTION')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('mapTemplate.ESTIMATED_TILES')}: {getEstimatedTileCount()}
                    </Typography>
                    {validationErrors.landDistribution && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {validationErrors.landDistribution}
                      </Alert>
                    )}
                  </Paper>
                </Grid>

                {Object.values(LandType).map((landType) => {
                  const percentage = landType === LandType.MARINE ? wizardData.marinePercentage :
                                   landType === LandType.COASTAL ? wizardData.coastalPercentage :
                                   wizardData.plainPercentage;

                  return (
                    <Grid key={landType} size={{ xs: 12 }}>
                      <Box sx={{ px: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2">
                            {t(`LAND_TYPE_${landType}`)}
                          </Typography>
                          <Chip 
                            label={`${percentage}%`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                        <Slider
                          value={percentage}
                          onChange={(e, value) => handleLandDistributionChange(landType, value as number)}
                          min={0}
                          max={100}
                          step={1}
                          marks={[
                            { value: 0, label: '0%' },
                            { value: 25, label: '25%' },
                            { value: 50, label: '50%' },
                            { value: 75, label: '75%' },
                            { value: 100, label: '100%' },
                          ]}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    </Grid>
                  );
                })}

                <Grid size={{ xs: 12 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">{t('mapTemplate.ADVANCED_GENERATION_OPTIONS')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        fullWidth
                        type="number"
                        label={t('mapTemplate.RANDOM_SEED')}
                        value={wizardData.randomSeed || ''}
                        onChange={(e) => updateWizardData({ 
                          randomSeed: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        helperText={t('mapTemplate.RANDOM_SEED_HELP_TEXT')}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </>
            )}
          </Grid>
        );

      case 2: // Facility Configuration
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={wizardData.initializeFacilityConfigs}
                    onChange={(e) => updateWizardData({ initializeFacilityConfigs: e.target.checked })}
                  />
                }
                label={t('mapTemplate.INITIALIZE_FACILITY_CONFIGURATIONS')}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('mapTemplate.INITIALIZE_FACILITY_CONFIGS_HELP_TEXT')}
              </Typography>
            </Grid>

            {wizardData.initializeFacilityConfigs && (
              <>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth sx={{ minWidth: 200 }}>
                    <InputLabel>{t('mapTemplate.DIFFICULTY_PRESET')}</InputLabel>
                    <Select
                      value={wizardData.difficultyPreset}
                      label={t('mapTemplate.DIFFICULTY_PRESET')}
                      onChange={(e) => updateWizardData({ 
                        difficultyPreset: e.target.value as 'easy' | 'normal' | 'hard' | 'custom' 
                      })}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            minWidth: 350,
                          },
                        },
                      }}
                    >
                      <MenuItem value="easy">
                        <Box>
                          <Typography variant="body2">{t('mapTemplate.EASY_MODE')}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('mapTemplate.EASY_MODE_DESCRIPTION')}
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="normal">
                        <Box>
                          <Typography variant="body2">{t('mapTemplate.NORMAL_MODE')}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('mapTemplate.NORMAL_MODE_DESCRIPTION')}
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="hard">
                        <Box>
                          <Typography variant="body2">{t('mapTemplate.HARD_MODE')}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('mapTemplate.HARD_MODE_DESCRIPTION')}
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="custom">
                        <Box>
                          <Typography variant="body2">{t('mapTemplate.CUSTOM_DIFFICULTY')}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('mapTemplate.CUSTOM_DIFFICULTY_DESCRIPTION')}
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {wizardData.difficultyPreset === 'custom' && (
                  <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('mapTemplate.CUSTOM_DIFFICULTY_SETTINGS')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="body2" gutterBottom>
                            {t('mapTemplate.GOLD_MULTIPLIER')}: {wizardData.customDifficultySettings?.goldMultiplier || 1.0}
                          </Typography>
                          <Slider
                            value={wizardData.customDifficultySettings?.goldMultiplier || 1.0}
                            onChange={(e, value) => updateWizardData({
                              customDifficultySettings: {
                                ...wizardData.customDifficultySettings,
                                goldMultiplier: value as number,
                                carbonMultiplier: wizardData.customDifficultySettings?.carbonMultiplier || 1.0,
                                upgradeMultiplier: wizardData.customDifficultySettings?.upgradeMultiplier || 1.0,
                              }
                            })}
                            min={0.5}
                            max={3.0}
                            step={0.1}
                            marks={[
                              { value: 0.5, label: '0.5x' },
                              { value: 1.0, label: '1.0x' },
                              { value: 2.0, label: '2.0x' },
                              { value: 3.0, label: '3.0x' },
                            ]}
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="body2" gutterBottom>
                            {t('mapTemplate.CARBON_MULTIPLIER')}: {wizardData.customDifficultySettings?.carbonMultiplier || 1.0}
                          </Typography>
                          <Slider
                            value={wizardData.customDifficultySettings?.carbonMultiplier || 1.0}
                            onChange={(e, value) => updateWizardData({
                              customDifficultySettings: {
                                ...wizardData.customDifficultySettings,
                                goldMultiplier: wizardData.customDifficultySettings?.goldMultiplier || 1.0,
                                carbonMultiplier: value as number,
                                upgradeMultiplier: wizardData.customDifficultySettings?.upgradeMultiplier || 1.0,
                              }
                            })}
                            min={0.5}
                            max={3.0}
                            step={0.1}
                            marks={[
                              { value: 0.5, label: '0.5x' },
                              { value: 1.0, label: '1.0x' },
                              { value: 2.0, label: '2.0x' },
                              { value: 3.0, label: '3.0x' },
                            ]}
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="body2" gutterBottom>
                            {t('mapTemplate.UPGRADE_MULTIPLIER')}: {wizardData.customDifficultySettings?.upgradeMultiplier || 1.0}
                          </Typography>
                          <Slider
                            value={wizardData.customDifficultySettings?.upgradeMultiplier || 1.0}
                            onChange={(e, value) => updateWizardData({
                              customDifficultySettings: {
                                ...wizardData.customDifficultySettings,
                                goldMultiplier: wizardData.customDifficultySettings?.goldMultiplier || 1.0,
                                carbonMultiplier: wizardData.customDifficultySettings?.carbonMultiplier || 1.0,
                                upgradeMultiplier: value as number,
                              }
                            })}
                            min={0.5}
                            max={3.0}
                            step={0.1}
                            marks={[
                              { value: 0.5, label: '0.5x' },
                              { value: 1.0, label: '1.0x' },
                              { value: 2.0, label: '2.0x' },
                              { value: 3.0, label: '3.0x' },
                            ]}
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        );

      case 3: // Advanced Settings
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={wizardData.customEconomicSettings}
                    onChange={(e) => updateWizardData({ customEconomicSettings: e.target.checked })}
                  />
                }
                label={t('mapTemplate.CUSTOM_ECONOMIC_SETTINGS')}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('mapTemplate.CUSTOM_ECONOMIC_SETTINGS_HELP_TEXT')}
              </Typography>
            </Grid>

            {wizardData.customEconomicSettings && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('mapTemplate.ECONOMIC_SETTINGS_BY_LAND_TYPE')}
                  </Typography>
                  {Object.values(LandType).map((landType) => (
                    <Accordion key={landType}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">
                          {t(`LAND_TYPE_${landType}`)} {t('mapTemplate.SETTINGS')}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label={t('mapTemplate.INITIAL_PRICE')}
                              value={wizardData.economicSettings?.[landType]?.initialPrice || 0}
                              onChange={(e) => {
                                const settings = { ...wizardData.economicSettings };
                                if (!settings[landType]) {
                                  settings[landType] = { initialPrice: 0, initialPopulation: 0, transportationCost: 0 };
                                }
                                settings[landType].initialPrice = Number(e.target.value);
                                updateWizardData({ economicSettings: settings });
                              }}
                              error={!!validationErrors[`${landType}_price`]}
                              helperText={validationErrors[`${landType}_price`]}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label={t('mapTemplate.INITIAL_POPULATION')}
                              value={wizardData.economicSettings?.[landType]?.initialPopulation || 0}
                              onChange={(e) => {
                                const settings = { ...wizardData.economicSettings };
                                if (!settings[landType]) {
                                  settings[landType] = { initialPrice: 0, initialPopulation: 0, transportationCost: 0 };
                                }
                                settings[landType].initialPopulation = Number(e.target.value);
                                updateWizardData({ economicSettings: settings });
                              }}
                              error={!!validationErrors[`${landType}_population`]}
                              helperText={validationErrors[`${landType}_population`]}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label={t('mapTemplate.TRANSPORTATION_COST')}
                              value={wizardData.economicSettings?.[landType]?.transportationCost || 0}
                              onChange={(e) => {
                                const settings = { ...wizardData.economicSettings };
                                if (!settings[landType]) {
                                  settings[landType] = { initialPrice: 0, initialPopulation: 0, transportationCost: 0 };
                                }
                                settings[landType].transportationCost = Number(e.target.value);
                                updateWizardData({ economicSettings: settings });
                              }}
                              error={!!validationErrors[`${landType}_transport`]}
                              helperText={validationErrors[`${landType}_transport`]}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>
        );

      case 4: // Review and Create
        return (
          <Grid container spacing={3}>
            {!createdTemplate ? (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('mapTemplate.REVIEW_TEMPLATE_SETTINGS')}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('mapTemplate.BASIC_INFORMATION')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('mapTemplate.NAME')}:</strong> {wizardData.templateName}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>{t('mapTemplate.TYPE')}:</strong> {t(wizardData.templateType === 'generate' ? 'GENERATED_TEMPLATE' : 'MANUAL_TEMPLATE')}
                    </Typography>
                    {wizardData.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>{t('mapTemplate.DESCRIPTION')}:</strong> {wizardData.description}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('mapTemplate.MAP_CONFIGURATION')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('mapTemplate.DIMENSIONS')}:</strong> {wizardData.width} × {wizardData.height}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>{t('mapTemplate.ESTIMATED_TILES')}:</strong> {getEstimatedTileCount()}
                    </Typography>
                    {wizardData.templateType === 'generate' && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>{t('mapTemplate.LAND_DISTRIBUTION')}:</strong>
                        </Typography>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="caption">
                            {t('mapTemplate.LAND_TYPE_MARINE')}: {wizardData.marinePercentage}%
                          </Typography><br />
                          <Typography variant="caption">
                            {t('mapTemplate.LAND_TYPE_COASTAL')}: {wizardData.coastalPercentage}%
                          </Typography><br />
                          <Typography variant="caption">
                            {t('mapTemplate.LAND_TYPE_PLAIN')}: {wizardData.plainPercentage}%
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('mapTemplate.FACILITY_CONFIGURATION')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('mapTemplate.INITIALIZE_FACILITY_CONFIGURATIONS')}:</strong> {wizardData.initializeFacilityConfigs ? t('mapTemplate.YES') : t('mapTemplate.NO')}
                    </Typography>
                    {wizardData.initializeFacilityConfigs && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>{t('mapTemplate.DIFFICULTY_PRESET')}:</strong> {t(`${wizardData.difficultyPreset.toUpperCase()}_MODE`)}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {validationErrors.creation && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      {validationErrors.creation}
                    </Alert>
                  </Grid>
                )}
              </>
            ) : (
              // Template created successfully
              <>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    <Typography variant="h6">
                      {t('mapTemplate.TEMPLATE_CREATED_SUCCESSFULLY')}
                    </Typography>
                    <Typography variant="body2">
                      {t('mapTemplate.TEMPLATE_CREATION_SUCCESS_MESSAGE')}
                    </Typography>
                  </Alert>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('mapTemplate.TEMPLATE_DETAILS')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('mapTemplate.ID')}:</strong> {createdTemplate.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>{t('mapTemplate.NAME')}:</strong> {createdTemplate.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>{t('mapTemplate.CREATED')}:</strong> {new Date(createdTemplate.createdAt).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>

                {facilityStats && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('mapTemplate.FACILITY_STATISTICS')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('mapTemplate.TOTAL_CONFIGURATIONS')}:</strong> {facilityStats.totalConfigs}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>{t('mapTemplate.ALLOWED_FACILITIES')}:</strong> {facilityStats.allowedConfigs}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>{t('mapTemplate.UPGRADABLE_FACILITIES')}:</strong> {facilityStats.upgradableConfigs}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoFixHighIcon />
          <Typography variant="h6">
            {t('mapTemplate.TEMPLATE_SETUP_WIZARD')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 600 }}>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={step}>
                <StepLabel>{t(step)}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('mapTemplate.CANCEL')}
        </Button>

        {activeStep > 0 && activeStep < steps.length - 1 && (
          <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
            {t('mapTemplate.BACK')}
          </Button>
        )}

        {activeStep < steps.length - 1 && !createdTemplate && (
          <>
            {activeStep === steps.length - 2 ? (
              <LoadingButton
                onClick={handleCreateTemplate}
                loading={isLoading}
                variant="contained"
                startIcon={<AutoFixHighIcon />}
              >
                {t('mapTemplate.CREATE_TEMPLATE')}
              </LoadingButton>
            ) : (
              <Button onClick={handleNext} endIcon={<ArrowForwardIcon />}>
                {t('mapTemplate.NEXT')}
              </Button>
            )}
          </>
        )}

        {createdTemplate && (
          <Button
            onClick={() => {
              onComplete(createdTemplate);
              onClose();
            }}
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            {t('mapTemplate.COMPLETE')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSetupWizard;