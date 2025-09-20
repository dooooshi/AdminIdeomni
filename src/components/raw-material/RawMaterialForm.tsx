'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,

  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Divider,
  InputAdornment,
  FormHelperText,
  Stack,
  Chip,
  Paper,
  IconButton,
  Fade,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Factory as FactoryIcon,
  Park as ParkIcon,
  Agriculture as AgricultureIcon,
  Water as WaterIcon,
  Bolt as BoltIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
  Science as ScienceIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import RawMaterialService from '@/lib/services/rawMaterialService';
import {
  RawMaterial,
  RawMaterialOrigin,
  CreateRawMaterialRequest,
  UpdateRawMaterialRequest,
} from '@/lib/types/rawMaterial';

interface RawMaterialFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  material?: RawMaterial | null;
  isSuperAdmin: boolean;
}

interface FormData {
  materialNumber: string;
  origin: RawMaterialOrigin | '';
  nameEn: string;
  nameZh: string;
  totalCost: string;
  waterRequired: string;
  powerRequired: string;
  goldCost: string;
  carbonEmission: string;
  modificationReason: string;
}

interface FormErrors {
  materialNumber?: string;
  origin?: string;
  nameEn?: string;
  nameZh?: string;
  totalCost?: string;
  waterRequired?: string;
  powerRequired?: string;
  goldCost?: string;
  carbonEmission?: string;
  modificationReason?: string;
}

const RawMaterialForm: React.FC<RawMaterialFormProps> = ({
  open,
  onClose,
  onSuccess,
  material,
  isSuperAdmin,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const isEdit = !!material;

  const [formData, setFormData] = useState<FormData>({
    materialNumber: '',
    origin: '',
    nameEn: '',
    nameZh: '',
    totalCost: '',
    waterRequired: '',
    powerRequired: '',
    goldCost: '',
    carbonEmission: '',
    modificationReason: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize form data when material changes
  useEffect(() => {
    if (material) {
      setFormData({
        materialNumber: material.materialNumber.toString(),
        origin: material.origin,
        nameEn: material.nameEn,
        nameZh: material.nameZh,
        totalCost: material.totalCost.toString(),
        waterRequired: material.waterRequired.toString(),
        powerRequired: material.powerRequired.toString(),
        goldCost: material.goldCost.toString(),
        carbonEmission: material.carbonEmission.toString(),
        modificationReason: '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        materialNumber: '',
        origin: '',
        nameEn: '',
        nameZh: '',
        totalCost: '',
        waterRequired: '',
        powerRequired: '',
        goldCost: '',
        carbonEmission: '',
        modificationReason: '',
      });
    }
    setErrors({});
    setApiError(null);
  }, [material]);

  // Handle input change
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Material number validation
    if (!formData.materialNumber) {
      newErrors.materialNumber = t('rawMaterial.validation.materialNumberRequired');
    } else {
      const num = parseInt(formData.materialNumber);
      if (isNaN(num) || num < 1) {
        newErrors.materialNumber = t('rawMaterial.validation.materialNumberInvalid');
      }
    }

    // Origin validation
    if (!formData.origin) {
      newErrors.origin = t('rawMaterial.validation.originRequired');
    }

    // Name validation
    if (!formData.nameEn.trim()) {
      newErrors.nameEn = t('rawMaterial.validation.nameEnRequired');
    }
    if (!formData.nameZh.trim()) {
      newErrors.nameZh = t('rawMaterial.validation.nameZhRequired');
    }

    // Cost validation
    if (!formData.totalCost) {
      newErrors.totalCost = t('rawMaterial.validation.totalCostRequired');
    } else {
      const cost = parseFloat(formData.totalCost);
      if (isNaN(cost) || cost <= 0) {
        newErrors.totalCost = t('rawMaterial.validation.totalCostInvalid');
      }
    }

    // Resource validation (can be 0 but not negative)
    const validateNonNegative = (field: keyof FormData, name: string) => {
      if (formData[field] === '') {
        newErrors[field] = t('rawMaterial.validation.fieldRequired', { field: name });
      } else {
        const value = parseFloat(formData[field]);
        if (isNaN(value) || value < 0) {
          newErrors[field] = t('rawMaterial.validation.nonNegative', { field: name });
        }
      }
    };

    validateNonNegative('waterRequired', t('rawMaterial.waterRequired'));
    validateNonNegative('powerRequired', t('rawMaterial.powerRequired'));
    validateNonNegative('goldCost', t('rawMaterial.goldCost'));
    validateNonNegative('carbonEmission', t('rawMaterial.carbonEmission'));

    // Modification reason
    if (!formData.modificationReason.trim()) {
      newErrors.modificationReason = t('rawMaterial.validation.reasonRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setApiError(null);

    try {
      if (isEdit && material) {
        const updateData: UpdateRawMaterialRequest = {
          materialNumber: parseInt(formData.materialNumber),
          origin: formData.origin as RawMaterialOrigin,
          nameEn: formData.nameEn,
          nameZh: formData.nameZh,
          totalCost: parseFloat(formData.totalCost),
          waterRequired: parseFloat(formData.waterRequired),
          powerRequired: parseFloat(formData.powerRequired),
          goldCost: parseFloat(formData.goldCost),
          carbonEmission: parseFloat(formData.carbonEmission),
          modificationReason: formData.modificationReason,
        };
        await RawMaterialService.updateRawMaterial(material.id, updateData);
      } else {
        const createData: CreateRawMaterialRequest = {
          materialNumber: parseInt(formData.materialNumber),
          origin: formData.origin as RawMaterialOrigin,
          nameEn: formData.nameEn,
          nameZh: formData.nameZh,
          totalCost: parseFloat(formData.totalCost),
          waterRequired: parseFloat(formData.waterRequired),
          powerRequired: parseFloat(formData.powerRequired),
          goldCost: parseFloat(formData.goldCost),
          carbonEmission: parseFloat(formData.carbonEmission),
          modificationReason: formData.modificationReason,
        };
        await RawMaterialService.createRawMaterial(createData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setApiError(err.message || t('rawMaterial.error.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  // Get origin icon
  const getOriginIcon = (origin: RawMaterialOrigin) => {
    switch (origin) {
      case RawMaterialOrigin.MINE:
        return <FactoryIcon />;
      case RawMaterialOrigin.QUARRY:
        return <ScienceIcon />;
      case RawMaterialOrigin.FOREST:
        return <ParkIcon />;
      case RawMaterialOrigin.FARM:
      case RawMaterialOrigin.RANCH:
        return <AgricultureIcon />;
      case RawMaterialOrigin.FISHERY:
        return <WaterIcon />;
      case RawMaterialOrigin.SHOPS:
        return <MoneyIcon />;
      default:
        return null;
    }
  };

  // Get origin color
  const getOriginColor = (origin: RawMaterialOrigin) => {
    const isDark = theme.palette.mode === 'dark';
    switch (origin) {
      case RawMaterialOrigin.MINE: return isDark ? '#8D6E63' : '#795548';
      case RawMaterialOrigin.QUARRY: return isDark ? '#78909C' : '#607D8B';
      case RawMaterialOrigin.FOREST: return isDark ? '#66BB6A' : '#4CAF50';
      case RawMaterialOrigin.FARM: return isDark ? '#9CCC65' : '#8BC34A';
      case RawMaterialOrigin.RANCH: return isDark ? '#FFA726' : '#FF9800';
      case RawMaterialOrigin.FISHERY: return isDark ? '#26C6DA' : '#00BCD4';
      case RawMaterialOrigin.SHOPS: return isDark ? '#AB47BC' : '#9C27B0';
      default: return isDark ? '#BDBDBD' : '#9E9E9E';
    }
  };

  // Check if user can edit
  const canEdit = true;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #4c63b6 0%, #5a3f93 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 0.5,
        }
      }}
    >
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main',
                width: 40, 
                height: 40 
              }}>
                {formData.origin ? getOriginIcon(formData.origin as RawMaterialOrigin) : <ScienceIcon />}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {isEdit ? t('rawMaterial.edit') : t('rawMaterial.create')}
                </Typography>
                {isEdit && (
                  <Typography variant="caption" color="text.secondary">
                    {locale === 'zh' ? material?.nameZh : material?.nameEn} (#{material?.materialNumber})
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {apiError && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError(null)}>
                {apiError}
              </Alert>
            </Fade>
          )}

          <Stack spacing={3}>
            {/* Basic Information */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon color="primary" />
                <Typography variant="h6" color="primary" fontWeight="medium">
                  {t('rawMaterial.basicInfo')}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.materialNumber')}
                    value={formData.materialNumber}
                    onChange={(e) => handleChange('materialNumber', e.target.value)}
                    error={!!errors.materialNumber}
                    helperText={errors.materialNumber}
                    disabled={isEdit}
                    type="number"
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.origin} variant="outlined">
                    <InputLabel>{t('rawMaterial.origin')}</InputLabel>
                    <Select
                      value={formData.origin}
                      onChange={(e) => handleChange('origin', e.target.value)}
                      label={t('rawMaterial.origin')}
                                          >
                      {Object.values(RawMaterialOrigin).map((origin) => (
                        <MenuItem key={origin} value={origin}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ color: getOriginColor(origin) }}>
                              {getOriginIcon(origin)}
                            </Box>
                            {t(`rawMaterial.origin.${origin}`)}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.origin && <FormHelperText>{errors.origin}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.nameEn')}
                    value={formData.nameEn}
                    onChange={(e) => handleChange('nameEn', e.target.value)}
                    error={!!errors.nameEn}
                    helperText={errors.nameEn}
                                        variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.nameZh')}
                    value={formData.nameZh}
                    onChange={(e) => handleChange('nameZh', e.target.value)}
                    error={!!errors.nameZh}
                    helperText={errors.nameZh}
                                        variant="outlined"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Economic & Resource Data */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MoneyIcon color="warning" />
                <Typography variant="h6" color="primary" fontWeight="medium">
                  {t('rawMaterial.economicData')}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.totalCost')}
                    value={formData.totalCost}
                    onChange={(e) => handleChange('totalCost', e.target.value)}
                    error={!!errors.totalCost}
                    helperText={errors.totalCost}
                                        type="number"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon color="warning" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.goldCost')}
                    value={formData.goldCost}
                    onChange={(e) => handleChange('goldCost', e.target.value)}
                    error={!!errors.goldCost}
                    helperText={errors.goldCost}
                                        type="number"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon sx={{ color: '#FFD700' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.waterRequired')}
                    value={formData.waterRequired}
                    onChange={(e) => handleChange('waterRequired', e.target.value)}
                    error={!!errors.waterRequired}
                    helperText={errors.waterRequired}
                                        type="number"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WaterIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.powerRequired')}
                    value={formData.powerRequired}
                    onChange={(e) => handleChange('powerRequired', e.target.value)}
                    error={!!errors.powerRequired}
                    helperText={errors.powerRequired}
                                        type="number"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BoltIcon color="warning" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('rawMaterial.carbonEmission')}
                    value={formData.carbonEmission}
                    onChange={(e) => handleChange('carbonEmission', e.target.value)}
                    error={!!errors.carbonEmission}
                    helperText={errors.carbonEmission}
                                        type="number"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EcoIcon color="success" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Modification Reason */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon color="warning" />
                <Typography variant="h6" color="primary" fontWeight="medium">
                  {t('rawMaterial.auditInfo')}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('rawMaterial.modificationReason')}
                value={formData.modificationReason}
                onChange={(e) => handleChange('modificationReason', e.target.value)}
                error={!!errors.modificationReason}
                helperText={errors.modificationReason || t('rawMaterial.modificationReasonHelp')}
                variant="outlined"
              />
            </Paper>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={onClose} 
            disabled={saving}
            size="large"
            sx={{ minWidth: 120 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            size="large"
            sx={{ 
              minWidth: 120,
              backgroundImage: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #4c63b6 30%, #5a3f93 90%)'
                : 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            {isEdit ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default RawMaterialForm;