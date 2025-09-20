import React, { useState } from 'react';
import {
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  ExpandMore as ExpandMoreIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TransportationConfig } from '@/types/transportation';
import TransportationConfigService from '@/lib/services/transportationConfigService';

interface TransportationConfigFormProps {
  config: TransportationConfig;
  onSave: (config: TransportationConfig) => void;
  onCancel: () => void;
}

const TransportationConfigForm: React.FC<TransportationConfigFormProps> = ({
  config,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TransportationConfig>(config);
  const [errors, setErrors] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | false>('tierA');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleChange = (field: keyof TransportationConfig, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleSave = async () => {
    const validation = await TransportationConfigService.validateConfig(formData);
    if (!validation.valid) {
      setErrors(validation.errors || []);
      return;
    }
    onSave(formData);
  };

  const tierConfigs = [
    {
      id: 'tierA',
      title: t('transportation.TIER_A_CONFIG'),
      prefix: 'tierA',
      color: '#4CAF50'
    },
    {
      id: 'tierB',
      title: t('transportation.TIER_B_CONFIG'),
      prefix: 'tierB',
      color: '#2196F3'
    },
    {
      id: 'tierC',
      title: t('transportation.TIER_C_CONFIG'),
      prefix: 'tierC',
      color: '#FF9800'
    },
    {
      id: 'tierD',
      title: t('transportation.TIER_D_CONFIG'),
      prefix: 'tierD',
      color: '#9C27B0'
    }
  ];

  const renderTierConfig = (tier: typeof tierConfigs[0]) => {
    const prefix = tier.prefix as 'tierA' | 'tierB' | 'tierC' | 'tierD';
    const isLastTier = prefix === 'tierD';

    return (
      <Accordion
        key={tier.id}
        expanded={expanded === tier.id}
        onChange={handleAccordionChange(tier.id)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={2} width="100%">
            <Box
              sx={{
                width: 8,
                height: 24,
                bgcolor: tier.color,
                borderRadius: 1
              }}
            />
            <Typography variant="subtitle1" fontWeight={600}>
              {tier.title}
            </Typography>
            <Box ml="auto" mr={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData[`${prefix}Enabled` as keyof TransportationConfig] as boolean}
                    onChange={(e) => handleChange(`${prefix}Enabled`, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                label={t('common.ENABLED')}
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('transportation.BASE_COST')}
                type="number"
                value={formData[`${prefix}BaseCost` as keyof TransportationConfig] || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleChange(`${prefix}BaseCost`, isNaN(value) ? 0 : value);
                }}
                helperText={t('transportation.BASE_COST_HELP')}
                InputProps={{
                  endAdornment: t('common.GOLD')
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('transportation.EMISSION_RATE')}
                type="number"
                value={formData[`${prefix}EmissionRate` as keyof TransportationConfig] || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleChange(`${prefix}EmissionRate`, isNaN(value) ? 0 : value);
                }}
                helperText={t('transportation.EMISSION_RATE_HELP')}
                InputProps={{
                  endAdornment: t('common.CARBON')
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('transportation.MIN_DISTANCE')}
                type="number"
                value={formData[`${prefix}MinDistance` as keyof TransportationConfig] || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleChange(`${prefix}MinDistance`, isNaN(value) ? 0 : value);
                }}
                InputProps={{
                  endAdornment: t('transportation.HEX_UNIT')
                }}
              />
            </Grid>
            {!isLastTier && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('transportation.MAX_DISTANCE')}
                  type="number"
                  value={formData[`${prefix}MaxDistance` as keyof TransportationConfig] || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    handleChange(`${prefix}MaxDistance`, isNaN(value) ? 0 : value);
                  }}
                  InputProps={{
                    endAdornment: t('transportation.HEX_UNIT')
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('transportation.SPACE_BASIS')}
                type="number"
                value={formData[`${prefix}SpaceBasis` as keyof TransportationConfig] || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleChange(`${prefix}SpaceBasis`, isNaN(value) ? 0 : value);
                }}
                helperText={t('transportation.SPACE_BASIS_HELP')}
                InputProps={{
                  endAdornment: t('transportation.UNITS')
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LocalShippingIcon />
          <Typography variant="h6">
            {t('transportation.EDIT_CONFIG')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {t('transportation.TIER_SETTINGS')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('transportation.TIER_SETTINGS_DESCRIPTION')}
          </Typography>
          {tierConfigs.map(renderTierConfig)}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {t('transportation.GENERAL_SETTINGS')}
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableCrossTeamTransfers}
                    onChange={(e) => handleChange('enableCrossTeamTransfers', e.target.checked)}
                  />
                }
                label={t('transportation.ENABLE_CROSS_TEAM_TRANSFERS')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('transportation.MAX_TRANSFER_QUANTITY')}
                type="number"
                value={formData.maxTransferQuantity || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleChange('maxTransferQuantity', isNaN(value) ? undefined : value);
                }}
                helperText={t('transportation.MAX_TRANSFER_QUANTITY_HELP')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('transportation.TRANSFER_COOLDOWN')}
                type="number"
                value={formData.transferCooldownMinutes || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleChange('transferCooldownMinutes', isNaN(value) ? 0 : value);
                }}
                helperText={t('transportation.TRANSFER_COOLDOWN_HELP')}
                InputProps={{
                  endAdornment: t('common.MINUTES')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('transportation.DESCRIPTION')}
                multiline
                rows={2}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                helperText={t('transportation.DESCRIPTION_HELP')}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>
          {t('common.CANCEL')}
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {t('common.SAVE')}
        </Button>
      </DialogActions>
    </>
  );
};

export default TransportationConfigForm;