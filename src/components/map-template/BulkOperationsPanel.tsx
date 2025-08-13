'use client';

import React, { useState, useEffect } from 'react';
import { useMapTemplateTranslation } from '@/lib/i18n/hooks/useTranslation';
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
  Grid,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Switch,
  FormControlLabel,
  Slider,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Preview as PreviewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  LandType,
  BulkUpdateByLandTypeDto,
  BulkUpdateResult,
  TileFacilityConfigStatistics,
} from '@/components/map/types';
import TileFacilityBuildConfigService from '@/lib/services/tileFacilityBuildConfigService';

interface BulkOperationsPanelProps {
  templateId: number;
  onOperationComplete?: () => void;
}

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
      id={`bulk-operations-tabpanel-${index}`}
      aria-labelledby={`bulk-operations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  templateId,
  onOperationComplete,
}) => {
  const { t } = useMapTemplateTranslation();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [selectedLandType, setSelectedLandType] = useState<LandType>(LandType.PLAIN);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [statistics, setStatistics] = useState<TileFacilityConfigStatistics | null>(null);

  // Multiplier updates
  const [useMultipliers, setUseMultipliers] = useState(true);
  const [goldMultiplier, setGoldMultiplier] = useState(1.0);
  const [carbonMultiplier, setCarbonMultiplier] = useState(1.0);
  const [upgradeGoldMultiplier, setUpgradeGoldMultiplier] = useState(1.0);
  const [upgradeCarbonMultiplier, setUpgradeCarbonMultiplier] = useState(1.0);

  // Fixed value updates
  const [fixedGold, setFixedGold] = useState<number | ''>('');
  const [fixedCarbon, setFixedCarbon] = useState<number | ''>('');
  const [fixedMaxLevel, setFixedMaxLevel] = useState<number | ''>('');

  // Status updates
  const [updateAllowedStatus, setUpdateAllowedStatus] = useState(false);
  const [allowedStatus, setAllowedStatus] = useState(true);

  // Preset scenarios
  const [presetScenario, setPresetScenario] = useState<'easy' | 'normal' | 'hard' | 'custom'>('custom');

  // Dialog states
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUpdateResult | null>(null);

  // Load statistics
  useEffect(() => {
    loadStatistics();
  }, [templateId]);

  const loadStatistics = async () => {
    try {
      const stats = await TileFacilityBuildConfigService.getConfigStatistics(templateId);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePresetScenarioChange = (scenario: 'easy' | 'normal' | 'hard' | 'custom') => {
    setPresetScenario(scenario);
    
    switch (scenario) {
      case 'easy':
        setGoldMultiplier(0.75);
        setCarbonMultiplier(0.75);
        setUpgradeGoldMultiplier(0.8);
        setUpgradeCarbonMultiplier(0.8);
        setUseMultipliers(true);
        break;
      case 'normal':
        setGoldMultiplier(1.0);
        setCarbonMultiplier(1.0);
        setUpgradeGoldMultiplier(1.0);
        setUpgradeCarbonMultiplier(1.0);
        setUseMultipliers(true);
        break;
      case 'hard':
        setGoldMultiplier(1.5);
        setCarbonMultiplier(1.75);
        setUpgradeGoldMultiplier(2.0);
        setUpgradeCarbonMultiplier(1.8);
        setUseMultipliers(true);
        break;
      case 'custom':
        // Keep current values
        break;
    }
  };

  const buildUpdateData = (): BulkUpdateByLandTypeDto => {
    const updateData: BulkUpdateByLandTypeDto = {};

    if (useMultipliers) {
      if (goldMultiplier !== 1.0) updateData.requiredGoldMultiplier = goldMultiplier;
      if (carbonMultiplier !== 1.0) updateData.requiredCarbonMultiplier = carbonMultiplier;
      if (upgradeGoldMultiplier !== 1.0) updateData.upgradeGoldCostMultiplier = upgradeGoldMultiplier;
      if (upgradeCarbonMultiplier !== 1.0) updateData.upgradeCarbonCostMultiplier = upgradeCarbonMultiplier;
    } else {
      if (fixedGold !== '') updateData.fixedRequiredGold = Number(fixedGold);
      if (fixedCarbon !== '') updateData.fixedRequiredCarbon = Number(fixedCarbon);
      if (fixedMaxLevel !== '') updateData.fixedMaxLevel = Number(fixedMaxLevel);
    }

    if (updateAllowedStatus) {
      updateData.isAllowed = allowedStatus;
    }

    return updateData;
  };

  const validateUpdateData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const updateData = buildUpdateData();

    if (Object.keys(updateData).length === 0) {
      errors.push(t('NO_CHANGES_SPECIFIED'));
    }

    if (useMultipliers) {
      if (goldMultiplier < 0.1 || goldMultiplier > 10) {
        errors.push(t('GOLD_MULTIPLIER_INVALID'));
      }
      if (carbonMultiplier < 0.1 || carbonMultiplier > 10) {
        errors.push(t('CARBON_MULTIPLIER_INVALID'));
      }
    } else {
      if (fixedGold !== '' && (Number(fixedGold) < 0 || Number(fixedGold) > 1000000)) {
        errors.push(t('FIXED_GOLD_INVALID'));
      }
      if (fixedCarbon !== '' && (Number(fixedCarbon) < 0 || Number(fixedCarbon) > 20000)) {
        errors.push(t('FIXED_CARBON_INVALID'));
      }
      if (fixedMaxLevel !== '' && (Number(fixedMaxLevel) < 1 || Number(fixedMaxLevel) > 10)) {
        errors.push(t('FIXED_MAX_LEVEL_INVALID'));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handlePreview = async () => {
    const validation = validateUpdateData();
    if (!validation.isValid) {
      // Show validation errors
      return;
    }

    setPreviewDialogOpen(true);
  };

  const handleConfirmUpdate = () => {
    setPreviewDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleExecuteUpdate = async () => {
    const updateData = buildUpdateData();

    try {
      setIsLoading(true);
      setConfirmDialogOpen(false);

      const result = await TileFacilityBuildConfigService.bulkUpdateByLandType(
        templateId,
        selectedLandType,
        updateData
      );

      setBulkResult(result);
      setResultDialogOpen(true);
      
      // Refresh statistics
      await loadStatistics();
      
      if (onOperationComplete) {
        onOperationComplete();
      }
    } catch (error) {
      console.error('Bulk update failed:', error);
      setBulkResult({
        updated: 0,
        failed: 1,
        details: [{ configId: 'unknown', success: false, error: 'Update failed' }],
        message: t('BULK_UPDATE_OPERATION_FAILED')
      });
      setResultDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setIsLoading(true);
      await TileFacilityBuildConfigService.initializeDefaultConfigs(templateId);
      await loadStatistics();
      if (onOperationComplete) {
        onOperationComplete();
      }
    } catch (error) {
      console.error('Failed to initialize defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setGoldMultiplier(1.0);
    setCarbonMultiplier(1.0);
    setUpgradeGoldMultiplier(1.0);
    setUpgradeCarbonMultiplier(1.0);
    setFixedGold('');
    setFixedCarbon('');
    setFixedMaxLevel('');
    setUpdateAllowedStatus(false);
    setAllowedStatus(true);
    setPresetScenario('custom');
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <BuildIcon />
            <Typography variant="h6">{t('BULK_OPERATIONS')}</Typography>
          </Box>
        }
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStatistics}
            size="small"
          >
            {t('REFRESH_STATS')}
          </Button>
        }
      />

      <CardContent>
        {/* Statistics Overview */}
        {statistics && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {t('CURRENT_STATS')}: {statistics.totalConfigs} {t('TOTAL_CONFIGS')}, {' '}
              {statistics.allowedConfigs} {t('ALLOWED')}, {' '}
              {statistics.disallowedConfigs} {t('DISALLOWED')}
            </Typography>
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('BULK_UPDATE')} icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label={t('INITIALIZE_DEFAULTS')} icon={<BuildIcon />} iconPosition="start" />
            <Tab label={t('ADVANCED_OPERATIONS')} icon={<AssessmentIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Bulk Update Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Land Type Selection */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>{t('TARGET_LAND_TYPE')}</InputLabel>
                <Select
                  value={selectedLandType}
                  label={t('TARGET_LAND_TYPE')}
                  onChange={(e) => setSelectedLandType(e.target.value as LandType)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        minWidth: 250,
                      },
                    },
                  }}
                >
                  {Object.values(LandType).map((type) => (
                    <MenuItem key={type} value={type} sx={{ minWidth: 200 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {t(`LAND_TYPE_${type}`)}
                        <Chip 
                          label={statistics?.configsByLandType[type] || 0} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Preset Scenarios */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>{t('PRESET_SCENARIO')}</InputLabel>
                <Select
                  value={presetScenario}
                  label={t('PRESET_SCENARIO')}
                  onChange={(e) => handlePresetScenarioChange(e.target.value as any)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        minWidth: 200,
                      },
                    },
                  }}
                >
                  <MenuItem value="easy" sx={{ minWidth: 180 }}>{t('EASY_MODE')}</MenuItem>
                  <MenuItem value="normal" sx={{ minWidth: 180 }}>{t('NORMAL_MODE')}</MenuItem>
                  <MenuItem value="hard" sx={{ minWidth: 180 }}>{t('HARD_MODE')}</MenuItem>
                  <MenuItem value="custom" sx={{ minWidth: 180 }}>{t('CUSTOM')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Update Method Selection */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useMultipliers}
                    onChange={(e) => setUseMultipliers(e.target.checked)}
                  />
                }
                label={t('USE_MULTIPLIERS_VS_FIXED_VALUES')}
              />
            </Grid>

            {/* Multiplier Updates */}
            {useMultipliers && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('COST_MULTIPLIERS')}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" gutterBottom>
                    {t('GOLD_MULTIPLIER')}: {goldMultiplier.toFixed(2)}
                  </Typography>
                  <Slider
                    value={goldMultiplier}
                    onChange={(e, value) => setGoldMultiplier(value as number)}
                    min={0.1}
                    max={3.0}
                    step={0.05}
                    marks={[
                      { value: 0.5, label: '0.5x' },
                      { value: 1.0, label: '1.0x' },
                      { value: 1.5, label: '1.5x' },
                      { value: 2.0, label: '2.0x' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" gutterBottom>
                    {t('CARBON_MULTIPLIER')}: {carbonMultiplier.toFixed(2)}
                  </Typography>
                  <Slider
                    value={carbonMultiplier}
                    onChange={(e, value) => setCarbonMultiplier(value as number)}
                    min={0.1}
                    max={3.0}
                    step={0.05}
                    marks={[
                      { value: 0.5, label: '0.5x' },
                      { value: 1.0, label: '1.0x' },
                      { value: 1.5, label: '1.5x' },
                      { value: 2.0, label: '2.0x' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" gutterBottom>
                    {t('UPGRADE_GOLD_MULTIPLIER')}: {upgradeGoldMultiplier.toFixed(2)}
                  </Typography>
                  <Slider
                    value={upgradeGoldMultiplier}
                    onChange={(e, value) => setUpgradeGoldMultiplier(value as number)}
                    min={0.1}
                    max={3.0}
                    step={0.05}
                    marks={[
                      { value: 0.5, label: '0.5x' },
                      { value: 1.0, label: '1.0x' },
                      { value: 1.5, label: '1.5x' },
                      { value: 2.0, label: '2.0x' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" gutterBottom>
                    {t('UPGRADE_CARBON_MULTIPLIER')}: {upgradeCarbonMultiplier.toFixed(2)}
                  </Typography>
                  <Slider
                    value={upgradeCarbonMultiplier}
                    onChange={(e, value) => setUpgradeCarbonMultiplier(value as number)}
                    min={0.1}
                    max={3.0}
                    step={0.05}
                    marks={[
                      { value: 0.5, label: '0.5x' },
                      { value: 1.0, label: '1.0x' },
                      { value: 1.5, label: '1.5x' },
                      { value: 2.0, label: '2.0x' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </>
            )}

            {/* Fixed Value Updates */}
            {!useMultipliers && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('FIXED_VALUES')}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('FIXED_GOLD_COST')}
                    value={fixedGold}
                    onChange={(e) => setFixedGold(e.target.value === '' ? '' : Number(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('FIXED_CARBON_COST')}
                    value={fixedCarbon}
                    onChange={(e) => setFixedCarbon(e.target.value === '' ? '' : Number(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">CO₂</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('FIXED_MAX_LEVEL')}
                    value={fixedMaxLevel}
                    onChange={(e) => setFixedMaxLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>
              </>
            )}

            {/* Status Updates */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={updateAllowedStatus}
                    onChange={(e) => setUpdateAllowedStatus(e.target.checked)}
                  />
                }
                label={t('UPDATE_ALLOWED_STATUS')}
              />
            </Grid>

            {updateAllowedStatus && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowedStatus}
                      onChange={(e) => setAllowedStatus(e.target.checked)}
                    />
                  }
                  label={t('SET_AS_ALLOWED')}
                />
              </Grid>
            )}

            {/* Actions */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button onClick={resetForm}>
                  {t('RESET')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreview}
                >
                  {t('PREVIEW')}
                </Button>
                <LoadingButton
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleConfirmUpdate}
                  loading={isLoading}
                >
                  {t('APPLY_CHANGES')}
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Initialize Defaults Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {t('INITIALIZE_DEFAULTS_INFO')}
              </Typography>
            </Alert>

            <Box display="flex" justifyContent="center">
              <LoadingButton
                variant="contained"
                startIcon={<BuildIcon />}
                onClick={handleInitializeDefaults}
                loading={isLoading}
                size="large"
              >
                {t('INITIALIZE_DEFAULT_CONFIGS')}
              </LoadingButton>
            </Box>
          </Box>
        </TabPanel>

        {/* Advanced Operations Tab */}
        <TabPanel value={tabValue} index={2}>
          <Alert severity="warning">
            <Typography variant="body2">
              {t('ADVANCED_OPERATIONS_COMING_SOON')}
            </Typography>
          </Alert>
        </TabPanel>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('PREVIEW_CHANGES')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              {t('PREVIEW_CHANGES_INFO', { landType: t(`LAND_TYPE_${selectedLandType}`) })}
            </Typography>

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('CHANGES_TO_APPLY')}:
              </Typography>
              {/* Display preview of changes */}
              <pre style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {JSON.stringify(buildUpdateData(), null, 2)}
              </pre>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialogOpen(false)}>
              {t('CANCEL')}
            </Button>
            <Button variant="contained" onClick={handleConfirmUpdate}>
              {t('PROCEED')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <WarningIcon color="warning" />
              {t('CONFIRM_BULK_UPDATE')}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('BULK_UPDATE_WARNING')}
            </Alert>
            <Typography>
              {t('BULK_UPDATE_CONFIRM', { 
                landType: t(`LAND_TYPE_${selectedLandType}`),
                count: statistics?.configsByLandType[selectedLandType] || 0
              })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              {t('CANCEL')}
            </Button>
            <LoadingButton
              onClick={handleExecuteUpdate}
              color="warning"
              variant="contained"
              loading={isLoading}
            >
              {t('CONFIRM_UPDATE')}
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Result Dialog */}
        <Dialog open={resultDialogOpen} onClose={() => setResultDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              {bulkResult?.failed === 0 ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
              {t('BULK_UPDATE_RESULT')}
            </Box>
          </DialogTitle>
          <DialogContent>
            {bulkResult && (
              <Box>
                <Alert 
                  severity={bulkResult.failed === 0 ? 'success' : 'warning'} 
                  sx={{ mb: 2 }}
                >
                  {t('BULK_UPDATE_SUMMARY', {
                    updated: bulkResult.updated,
                    failed: bulkResult.failed
                  })}
                </Alert>

                {bulkResult.failed > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('FAILED_OPERATIONS')}:
                    </Typography>
                    <List dense>
                      {bulkResult.details
                        .filter(detail => !detail.success)
                        .map((detail, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={detail.configId}
                              secondary={detail.error}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResultDialogOpen(false)} variant="contained">
              {t('CLOSE')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading overlay */}
        {isLoading && (
          <Box sx={{ position: 'relative' }}>
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkOperationsPanel;