'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  InputAdornment,
  Box,
  FormHelperText,
  Paper,
  Typography,
  TablePagination,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Card,
  CardContent,
  Skeleton,
  Fade,
  Badge
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
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Engineering as EngineeringIcon,
  Visibility as VisibilityIcon,
  NavigateNext as NavigateNextIcon,
  Factory as FactoryIcon,
  Science as ScienceIcon,
  LocalOffer as PriceTagIcon
} from '@mui/icons-material';
import debounce from 'lodash/debounce';

interface MtoType2RequirementFormWithPaginationProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: MtoType2Requirement | null;
}

interface FormulaData {
  id: number;
  formulaNumber?: number;
  productName?: string;
  name: string;
  productDescription?: string;
  totalMaterialCost?: string;
  totalSetupWaterCost?: number;
  totalSetupPowerCost?: number;
  totalSetupGoldCost?: string;
  materialCount?: number;
  craftCategoryCount?: number;
  materials?: Array<{ id: number; name: string; quantity?: number }>;
  craftCategories?: Array<{ id: number; name: string; count?: number }>;
  isLocked?: boolean;
}

const FormulaSelector: React.FC<{
  selectedFormula: FormulaData | null;
  onSelect: (formula: FormulaData | null) => void;
  disabled?: boolean;
}> = ({ selectedFormula, onSelect, disabled }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formulas, setFormulas] = useState<FormulaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Load formulas with pagination
  const loadFormulas = useCallback(async (search: string, pageNum: number, limit: number) => {
    setLoading(true);
    try {
      const response = await MtoType2Service.getManagerFormulas({
        page: pageNum + 1,
        limit: limit,
        searchTerm: search
      });

      if (response) {
        setFormulas(response.items || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load formulas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setPage(0);
      loadFormulas(search, 0, rowsPerPage);
    }, 500),
    [rowsPerPage]
  );

  useEffect(() => {
    if (open) {
      loadFormulas(searchTerm, page, rowsPerPage);
    }
  }, [open, page, rowsPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSelect = (formula: FormulaData) => {
    onSelect(formula);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {/* Main Selection Field */}
      <FormControl fullWidth required disabled={disabled}>
        <InputLabel shrink>{t('mto.type2.fields.productFormula')}</InputLabel>
        <Box
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            cursor: disabled ? 'not-allowed' : 'pointer',
            '&:hover': disabled ? {} : {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => !disabled && setOpen(true)}
        >
          {selectedFormula ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {selectedFormula.productName}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    icon={<PriceTagIcon />}
                    label={`$${selectedFormula.totalMaterialCost}`}
                    color="primary"
                    variant="outlined"
                  />
                  {selectedFormula.materialCount > 0 && (
                    <Chip
                      size="small"
                      icon={<CategoryIcon />}
                      label={`${selectedFormula.materialCount} materials`}
                      variant="outlined"
                    />
                  )}
                  {selectedFormula.isLocked && (
                    <Chip
                      size="small"
                      label={t('common.locked')}
                      color="warning"
                      variant="filled"
                    />
                  )}
                </Stack>
              </Box>
              {!disabled && (
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}>
                  <ClearIcon />
                </IconButton>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <SearchIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {t('mto.type2.selectFormula')}
              </Typography>
            </Box>
          )}
        </Box>
        <FormHelperText>{t('mto.type2.helpers.selectFormulaFromList')}</FormHelperText>
      </FormControl>

      {/* Formula Selection Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{t('mto.type2.selectProductFormula')}</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <ClearIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Search Bar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder={t('mto.type2.searchFormulas')}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => {
                      setSearchTerm('');
                      loadFormulas('', 0, rowsPerPage);
                    }}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box sx={{ height: 'calc(100% - 140px)', overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ p: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box key={i} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={80} />
                      </Box>
                    ))}
                  </Box>
                ) : formulas.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <FactoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      {searchTerm ? t('mto.type2.noFormulasFound') : t('mto.type2.noFormulasAvailable')}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {formulas.map((formula, index) => (
                      <React.Fragment key={formula.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          disablePadding>
                          <ListItemButton
                            selected={selectedFormula?.id === formula.id}
                            onClick={() => handleSelect(formula)}
                            sx={{
                              '&.Mui-selected': {
                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                borderLeft: 3,
                                borderColor: 'primary.main'
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.light' }}>
                                <ScienceIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="medium" component="span">
                                    {formula.productName}
                                  </Typography>
                                  {formula.isLocked && (
                                    <Chip size="small" label={t('common.locked')} color="warning" />
                                  )}
                                  {selectedFormula?.id === formula.id && (
                                    <CheckCircleIcon color="primary" fontSize="small" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} component="span">
                                  <Typography variant="body2" color="text.secondary" component="span">
                                    #{formula.formulaNumber}
                                  </Typography>
                                  <Typography variant="body2" color="primary" component="span">
                                    ${formula.totalMaterialCost}
                                  </Typography>
                                  {formula.materialCount > 0 && (
                                    <Typography variant="body2" color="text.secondary" component="span">
                                      {formula.materialCount} materials
                                    </Typography>
                                  )}
                                  {formula.craftCategoryCount > 0 && (
                                    <Typography variant="body2" color="text.secondary" component="span">
                                      {formula.craftCategoryCount} categories
                                    </Typography>
                                  )}
                                </Stack>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
          </Box>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const MtoType2RequirementFormWithPagination: React.FC<MtoType2RequirementFormWithPaginationProps> = ({
  open,
  onClose,
  onSuccess,
  editData
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<FormulaData | null>(null);

  const initialFormData: MtoType2CreateRequest = {
    managerProductFormulaId: editData?.managerProductFormulaId || 0,
    releaseTime: editData?.releaseTime || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    settlementTime: editData?.settlementTime || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    overallPurchaseBudget: Number(editData?.overallPurchaseBudget) || 10000,
    metadata: editData?.metadata || {
      name: '',
      description: '',
      notes: ''
    }
  };

  const [formData, setFormData] = useState<MtoType2CreateRequest>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editData) {
      // Only copy the fields that can be edited
      setFormData({
        managerProductFormulaId: editData.managerProductFormulaId,
        releaseTime: editData.releaseTime,
        settlementTime: editData.settlementTime,
        overallPurchaseBudget: typeof editData.overallPurchaseBudget === 'string'
          ? Number(editData.overallPurchaseBudget)
          : editData.overallPurchaseBudget,
        metadata: editData.metadata || {
          name: '',
          description: '',
          notes: ''
        }
      });
      // Load the selected formula if editing
      if (editData.managerProductFormulaId) {
        // In real scenario, you might want to load the formula details
        // For now, we'll just set the ID
        setSelectedFormula({
          id: editData.managerProductFormulaId,
          formulaNumber: 0,
          name: editData.metadata?.name || 'Formula',
          productName: editData.metadata?.name || 'Formula',
          totalMaterialCost: '0'
        });
      }
    } else {
      setFormData(initialFormData);
      setSelectedFormula(null);
    }
    setErrors({});
  }, [editData, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.managerProductFormulaId || formData.managerProductFormulaId < 1) {
      newErrors.managerProductFormulaId = t('mto.type2.validation.formulaRequired');
    }

    if (!formData.overallPurchaseBudget || formData.overallPurchaseBudget < 0.01) {
      newErrors.overallPurchaseBudget = t('mto.type2.validation.budgetRequired');
    }

    if (!formData.releaseTime) {
      newErrors.releaseTime = t('mto.type2.validation.releaseTimeRequired');
    }

    if (!formData.settlementTime) {
      newErrors.settlementTime = t('mto.type2.validation.settlementTimeRequired');
    } else if (formData.releaseTime && new Date(formData.settlementTime) <= new Date(formData.releaseTime)) {
      newErrors.settlementTime = t('mto.type2.validation.settlementAfterRelease');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError(t('common.validation.fixErrors'));
      return;
    }

    try {
      setLoading(true);

      if (editData) {
        // Only send the fields that are allowed for update
        const updateData = {
          releaseTime: formData.releaseTime,
          settlementTime: formData.settlementTime,
          overallPurchaseBudget: formData.overallPurchaseBudget,
          metadata: formData.metadata
        };
        await MtoType2Service.updateRequirement(editData.id, updateData);
        showSuccess(t('mto.type2.messages.updateSuccess'));
      } else {
        await MtoType2Service.createRequirement(formData);
        showSuccess(t('mto.type2.messages.createSuccess'));
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to save requirement:', error);
      showError((error as Error).message || t('mto.type2.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setErrors({});
      setSelectedFormula(null);
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

  const handleFormulaSelect = (formula: FormulaData | null) => {
    setSelectedFormula(formula);
    if (formula) {
      handleFieldChange('managerProductFormulaId', formula.id);
      if (!formData.metadata?.name) {
        handleMetadataChange('name', formula.productName);
      }
    } else {
      handleFieldChange('managerProductFormulaId', 0);
    }
    setErrors(prev => ({ ...prev, managerProductFormulaId: '' }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        {editData ? t('mto.type2.editRequirement') : t('mto.type2.createRequirement')}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {editData?.status && editData.status !== 'DRAFT' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('mto.type2.warnings.onlyDraftEditable')}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('mto.type2.fields.requirementName')}
                value={formData.metadata?.name || ''}
                onChange={(e) => handleMetadataChange('name', e.target.value)}
                placeholder={selectedFormula?.productName || t('mto.type2.placeholders.requirementName')}
                helperText={
                  selectedFormula && !formData.metadata?.name
                    ? t('mto.type2.helpers.nameAutoFilled')
                    : ''
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormulaSelector
                selectedFormula={selectedFormula}
                onSelect={handleFormulaSelect}
                disabled={editData && editData.status !== 'DRAFT'}
              />
              {errors.managerProductFormulaId && (
                <FormHelperText error>{errors.managerProductFormulaId}</FormHelperText>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label={t('mto.type2.fields.overallBudget')}
                value={formData.overallPurchaseBudget}
                onChange={(e) => handleFieldChange('overallPurchaseBudget', Number(e.target.value))}
                error={!!errors.overallPurchaseBudget}
                helperText={errors.overallPurchaseBudget}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0.01, step: 100 }
                }}
                disabled={editData && editData.status !== 'DRAFT'}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {selectedFormula && (
                <Paper sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('mto.type2.estimatedUnits')}
                  </Typography>
                  <Typography variant="h6">
                    ~{Math.floor(formData.overallPurchaseBudget / (parseFloat(selectedFormula.totalMaterialCost) || 1))} units
                  </Typography>
                </Paper>
              )}
            </Grid>

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
                      helperText: errors.releaseTime
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
                      helperText: errors.settlementTime
                    }
                  }}
                  disabled={editData && editData.status !== 'DRAFT'}
                  minDateTime={new Date(formData.releaseTime)}
                />
              </LocalizationProvider>
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
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {editData ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};