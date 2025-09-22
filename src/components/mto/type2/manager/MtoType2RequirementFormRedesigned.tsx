'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Box,
  FormHelperText,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Stack
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2CreateRequest, MtoType2Requirement } from '@/lib/types/mtoType2';
import MtoType2Service from '@/lib/services/mtoType2Service';
import { useToast } from '@/components/common/ToastProvider';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Preview as PreviewIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon
} from '@mui/icons-material';

interface MtoType2RequirementFormRedesignedProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: MtoType2Requirement | null;
  managerFormulas?: Array<{
    id: number;
    name: string;
    productName?: string;
    totalMaterialCost?: string;
    materialCount?: number;
    craftCategoryCount?: number;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`requirement-tabpanel-${index}`}
      aria-labelledby={`requirement-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export const MtoType2RequirementFormRedesigned: React.FC<MtoType2RequirementFormRedesignedProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
  managerFormulas = []
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingFormulas, setLoadingFormulas] = useState(!managerFormulas.length);
  const [availableFormulas, setAvailableFormulas] = useState(managerFormulas);
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [formulaSearch, setFormulaSearch] = useState('');
  const [showFormulaPreview, setShowFormulaPreview] = useState(false);

  const initialFormData: MtoType2CreateRequest = {
    managerProductFormulaId: editData?.managerProductFormulaId || 0,
    releaseTime: editData?.releaseTime || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    settlementTime: editData?.settlementTime || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    overallPurchaseBudget: editData?.overallPurchaseBudget || 10000,
    metadata: editData?.metadata || {
      name: '',
      description: '',
      notes: ''
    }
  };

  const [formData, setFormData] = useState<MtoType2CreateRequest>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    {
      label: t('mto.type2.steps.selectFormula'),
      icon: <InventoryIcon />,
      description: t('mto.type2.steps.selectFormulaDesc')
    },
    {
      label: t('mto.type2.steps.configureSchedule'),
      icon: <ScheduleIcon />,
      description: t('mto.type2.steps.configureScheduleDesc')
    },
    {
      label: t('mto.type2.steps.setBudget'),
      icon: <MoneyIcon />,
      description: t('mto.type2.steps.setBudgetDesc')
    },
    {
      label: t('mto.type2.steps.addDetails'),
      icon: <DescriptionIcon />,
      description: t('mto.type2.steps.addDetailsDesc')
    }
  ];

  useEffect(() => {
    if (open && !managerFormulas.length) {
      loadManagerFormulas();
    }
  }, [open]);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...initialFormData,
        ...editData
      });
      const formula = availableFormulas.find(f => f.id === editData.managerProductFormulaId);
      if (formula) {
        setSelectedFormula(formula);
      }
    } else {
      setFormData(initialFormData);
      setSelectedFormula(null);
    }
    setErrors({});
    setActiveStep(0);
    setTabValue(0);
  }, [editData, open]);

  const loadManagerFormulas = async () => {
    try {
      setLoadingFormulas(true);
      const response = await MtoType2Service.getManagerFormulas({ limit: 100 });
      if (response?.items) {
        setAvailableFormulas(response.items);
      }
    } catch (error) {
      console.error('Failed to load formulas:', error);
      showError(t('mto.type2.errors.loadFormulasFailed'));
    } finally {
      setLoadingFormulas(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Formula selection
        if (!formData.managerProductFormulaId || formData.managerProductFormulaId < 1) {
          stepErrors.managerProductFormulaId = t('mto.type2.validation.formulaRequired');
        }
        break;
      case 1: // Schedule
        if (!formData.releaseTime) {
          stepErrors.releaseTime = t('mto.type2.validation.releaseTimeRequired');
        }
        if (!formData.settlementTime) {
          stepErrors.settlementTime = t('mto.type2.validation.settlementTimeRequired');
        } else if (formData.releaseTime && new Date(formData.settlementTime) <= new Date(formData.releaseTime)) {
          stepErrors.settlementTime = t('mto.type2.validation.settlementAfterRelease');
        }
        break;
      case 2: // Budget
        if (!formData.overallPurchaseBudget || formData.overallPurchaseBudget < 0.01) {
          stepErrors.overallPurchaseBudget = t('mto.type2.validation.budgetRequired');
        }
        break;
      case 3: // Details
        // Optional fields, no validation needed
        break;
    }

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
      showError(t('common.validation.fixErrors'));
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    // Validate all steps
    let isValid = true;
    for (let i = 0; i <= 3; i++) {
      if (!validateStep(i)) {
        isValid = false;
      }
    }

    if (!isValid) {
      showError(t('common.validation.fixErrors'));
      return;
    }

    try {
      setLoading(true);

      if (editData) {
        await MtoType2Service.updateRequirement(editData.id, formData);
        showSuccess(t('mto.type2.messages.updateSuccess'));
      } else {
        await MtoType2Service.createRequirement(formData);
        showSuccess(t('mto.type2.messages.createSuccess'));
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to save requirement:', error);
      showError(error.message || t('mto.type2.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setErrors({});
      setSelectedFormula(null);
      setActiveStep(0);
      setTabValue(0);
      onClose();
    }
  };

  const handleFieldChange = (field: keyof MtoType2CreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleMetadataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleFormulaSelect = (formula: any) => {
    setSelectedFormula(formula);
    if (formula) {
      handleFieldChange('managerProductFormulaId', formula.id);
      if (!formData.metadata?.name) {
        handleMetadataChange('name', formula.productName || formula.name || '');
      }
    }
  };

  const filteredFormulas = availableFormulas.filter(formula =>
    (formula.productName || formula.name || '').toLowerCase().includes(formulaSearch.toLowerCase())
  );

  const getDuration = () => {
    if (formData.releaseTime && formData.settlementTime) {
      const start = new Date(formData.releaseTime);
      const end = new Date(formData.settlementTime);
      const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      return hours;
    }
    return 0;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown={loading}
      PaperProps={{
        sx: {
          minHeight: '80vh',
          borderRadius: 2
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper'
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {editData ? t('mto.type2.editRequirement') : t('mto.type2.createRequirement')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {editData
              ? t('mto.type2.editRequirementDesc')
              : t('mto.type2.createRequirementDesc')}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Sidebar with Stepper */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ borderRight: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('mto.type2.progress')}
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel
                      icon={step.icon}
                      optional={
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      }
                      onClick={() => {
                        if (index < activeStep || editData) {
                          setActiveStep(index);
                        }
                      }}
                      sx={{ cursor: index < activeStep || editData ? 'pointer' : 'default' }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Quick Summary */}
              {(selectedFormula || formData.releaseTime) && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('mto.type2.summary')}
                  </Typography>
                  <List dense>
                    {selectedFormula && (
                      <ListItem>
                        <ListItemIcon>
                          <InventoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={selectedFormula.productName || selectedFormula.name}
                          secondary={t('mto.type2.fields.productFormula')}
                        />
                      </ListItem>
                    )}
                    {formData.overallPurchaseBudget > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <MoneyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`$${formData.overallPurchaseBudget.toLocaleString()}`}
                          secondary={t('mto.type2.fields.budget')}
                        />
                      </ListItem>
                    )}
                    {getDuration() > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${getDuration()} ${t('common.hours')}`}
                          secondary={t('mto.type2.duration')}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Main Content Area */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ p: 4 }}>
              {editData?.status && editData.status !== 'DRAFT' && (
                <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
                  {t('mto.type2.warnings.onlyDraftEditable')}
                </Alert>
              )}

              {/* Step 0: Formula Selection */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('mto.type2.steps.selectFormula')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('mto.type2.steps.selectFormulaHelp')}
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder={t('mto.type2.searchFormulas')}
                    value={formulaSearch}
                    onChange={(e) => setFormulaSearch(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />

                  {loadingFormulas ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {filteredFormulas.map((formula) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={formula.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: 2,
                              borderColor: selectedFormula?.id === formula.id ? 'primary.main' : 'transparent',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.light',
                                transform: 'translateY(-2px)',
                                boxShadow: 2
                              }
                            }}
                            onClick={() => handleFormulaSelect(formula)}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {formula.productName || formula.name}
                                  </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    <Chip
                                      label={`${formula.materialCount || 0} ${t('mto.type2.materials')}`}
                                      size="small"
                                      sx={{ mr: 1 }}
                                    />
                                    <Chip
                                      label={`$${formula.totalMaterialCost || 0}`}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </Box>
                                </Box>
                                {selectedFormula?.id === formula.id && (
                                  <CheckCircleIcon color="primary" />
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {errors.managerProductFormulaId && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.managerProductFormulaId}
                    </Alert>
                  )}
                </Box>
              )}

              {/* Step 1: Schedule Configuration */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('mto.type2.steps.configureSchedule')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('mto.type2.steps.configureScheduleHelp')}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label={t('mto.type2.fields.releaseTime')}
                          value={new Date(formData.releaseTime)}
                          onChange={(date) => date && handleFieldChange('releaseTime', date.toISOString())}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !!errors.releaseTime,
                              helperText: errors.releaseTime || t('mto.type2.helpers.releaseTime')
                            }
                          }}
                          disabled={editData && editData.status !== 'DRAFT'}
                          minDateTime={editData ? undefined : new Date()}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label={t('mto.type2.fields.settlementTime')}
                          value={new Date(formData.settlementTime)}
                          onChange={(date) => date && handleFieldChange('settlementTime', date.toISOString())}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !!errors.settlementTime,
                              helperText: errors.settlementTime || t('mto.type2.helpers.settlementTime')
                            }
                          }}
                          disabled={editData && editData.status !== 'DRAFT'}
                          minDateTime={new Date(formData.releaseTime)}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Paper sx={{ p: 2, bgcolor: 'info.light', bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InfoIcon color="info" />
                          <Box>
                            <Typography variant="subtitle2" color="info.main">
                              {t('mto.type2.procurementDuration')}
                            </Typography>
                            <Typography variant="h6" color="text.primary">
                              {getDuration()} {t('common.hours')}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 2: Budget Configuration */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('mto.type2.steps.setBudget')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('mto.type2.steps.setBudgetHelp')}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label={t('mto.type2.fields.overallBudget')}
                        value={formData.overallPurchaseBudget}
                        onChange={(e) => handleFieldChange('overallPurchaseBudget', Number(e.target.value))}
                        error={!!errors.overallPurchaseBudget}
                        helperText={errors.overallPurchaseBudget || t('mto.type2.helpers.budget')}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: { min: 0.01, step: 100 }
                        }}
                        disabled={editData && editData.status !== 'DRAFT'}
                      />

                      {/* Budget Presets */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('mto.type2.quickPresets')}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {[5000, 10000, 20000, 50000].map((amount) => (
                            <Chip
                              key={amount}
                              label={`$${amount.toLocaleString()}`}
                              onClick={() => handleFieldChange('overallPurchaseBudget', amount)}
                              variant={formData.overallPurchaseBudget === amount ? 'filled' : 'outlined'}
                              color={formData.overallPurchaseBudget === amount ? 'primary' : 'default'}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper sx={{ p: 2, bgcolor: 'warning.light', bgcolor: 'rgba(255, 152, 0, 0.08)' }}>
                        <TrendingUpIcon color="warning" sx={{ mb: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('mto.type2.budgetAnalysis')}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {t('mto.type2.estimatedUnits')}: {Math.floor(formData.overallPurchaseBudget / (parseFloat(selectedFormula?.totalMaterialCost || '100') || 100))}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 3: Additional Details */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('mto.type2.steps.addDetails')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('mto.type2.steps.addDetailsHelp')}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label={t('mto.type2.fields.requirementName')}
                        value={formData.metadata?.name || ''}
                        onChange={(e) => handleMetadataChange('name', e.target.value)}
                        placeholder={selectedFormula?.productName || selectedFormula?.name || t('mto.type2.placeholders.requirementName')}
                        helperText={t('mto.type2.helpers.nameOptional')}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={t('mto.type2.fields.description')}
                        value={formData.metadata?.description || ''}
                        onChange={(e) => handleMetadataChange('description', e.target.value)}
                        placeholder={t('mto.type2.placeholders.description')}
                        helperText={t('mto.type2.helpers.descriptionOptional')}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label={t('mto.type2.fields.notes')}
                        value={formData.metadata?.notes || ''}
                        onChange={(e) => handleMetadataChange('notes', e.target.value)}
                        placeholder={t('mto.type2.placeholders.notes')}
                        helperText={t('mto.type2.helpers.notesOptional')}
                      />
                    </Grid>
                  </Grid>

                  {/* Review Summary */}
                  <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.light', bgcolor: 'rgba(76, 175, 80, 0.08)' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {t('mto.type2.reviewSummary')}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('mto.type2.fields.productFormula')}
                        </Typography>
                        <Typography variant="body1">
                          {selectedFormula?.productName || selectedFormula?.name || '-'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('mto.type2.fields.budget')}
                        </Typography>
                        <Typography variant="body1">
                          ${formData.overallPurchaseBudget.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('mto.type2.fields.releaseTime')}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(formData.releaseTime).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('mto.type2.fields.settlementTime')}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(formData.settlementTime).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={activeStep === 0 ? handleClose : handleBack}
                  disabled={loading}
                  startIcon={activeStep === 0 ? <CloseIcon /> : <NavigateBeforeIcon />}
                >
                  {activeStep === 0 ? t('common.cancel') : t('common.back')}
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep < 3 && (
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(3)}
                      disabled={loading}
                    >
                      {t('common.skipToEnd')}
                    </Button>
                  )}
                  {activeStep < 3 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading || loadingFormulas}
                      endIcon={<NavigateNextIcon />}
                    >
                      {t('common.next')}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading || loadingFormulas}
                      startIcon={loading && <CircularProgress size={20} />}
                    >
                      {editData ? t('common.update') : t('common.create')}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};