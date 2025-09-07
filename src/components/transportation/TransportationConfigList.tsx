import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  Skeleton,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  LocalShipping as LocalShippingIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import TransportationConfigService from '@/lib/services/transportationConfigService';
import TransportationConfigForm from './TransportationConfigForm';
import { TransportationConfig, DEFAULT_TRANSPORTATION_CONFIG } from '@/types/transportation';

interface TransportationConfigListProps {
  templateId?: number;
}

const TransportationConfigList: React.FC<TransportationConfigListProps> = ({ templateId }) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<TransportationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TransportationConfig | null>(null);

  useEffect(() => {
    if (templateId) {
      fetchConfig();
    } else {
      setLoading(false);
    }
  }, [templateId]);

  const fetchConfig = async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      const data = await TransportationConfigService.getConfig(templateId);
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch transportation config:', error);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = () => {
    setEditingConfig({
      ...DEFAULT_TRANSPORTATION_CONFIG,
      templateId: templateId!,
      id: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as TransportationConfig);
    setFormOpen(true);
  };

  const handleEditConfig = () => {
    if (config) {
      setEditingConfig(config);
      setFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingConfig(null);
  };

  const handleFormSave = async (configData: TransportationConfig) => {
    try {
      if (config) {
        // Use the actual config ID for updates, not the templateId
        await TransportationConfigService.updateConfig(config.id, configData);
      } else {
        await TransportationConfigService.createConfig(templateId!, configData);
      }
      await fetchConfig();
      handleFormClose();
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const handleToggleActive = async () => {
    if (config && templateId) {
      try {
        await TransportationConfigService.toggleConfig(templateId, !config.isActive);
        await fetchConfig();
      } catch (error) {
        console.error('Failed to toggle config:', error);
      }
    }
  };

  if (!templateId) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('transportation.SELECT_TEMPLATE_FOR_CONFIG')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Skeleton variant="rectangular" height={200} />
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box textAlign="center" py={4}>
            <LocalShippingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('transportation.NO_CONFIG_FOUND')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('transportation.NO_CONFIG_DESCRIPTION')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateConfig}
            >
              {t('transportation.CREATE_CONFIG')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const tierData = [
    {
      tier: 'A',
      name: t('transportation.TIER_A_NAME'),
      distance: `${config.tierAMinDistance}-${config.tierAMaxDistance} ${t('transportation.HEX_UNIT')}`,
      baseCost: config.tierABaseCost,
      emission: config.tierAEmissionRate,
      spaceBasis: config.tierASpaceBasis,
      enabled: config.tierAEnabled,
      color: 'success'
    },
    {
      tier: 'B',
      name: t('transportation.TIER_B_NAME'),
      distance: `${config.tierBMinDistance}-${config.tierBMaxDistance} ${t('transportation.HEX_UNIT')}`,
      baseCost: config.tierBBaseCost,
      emission: config.tierBEmissionRate,
      spaceBasis: config.tierBSpaceBasis,
      enabled: config.tierBEnabled,
      color: 'info'
    },
    {
      tier: 'C',
      name: t('transportation.TIER_C_NAME'),
      distance: `${config.tierCMinDistance}-${config.tierCMaxDistance} ${t('transportation.HEX_UNIT')}`,
      baseCost: config.tierCBaseCost,
      emission: config.tierCEmissionRate,
      spaceBasis: config.tierCSpaceBasis,
      enabled: config.tierCEnabled,
      color: 'warning'
    },
    {
      tier: 'D',
      name: t('transportation.TIER_D_NAME'),
      distance: `${config.tierDMinDistance}+ ${t('transportation.HEX_UNIT')}`,
      baseCost: config.tierDBaseCost,
      emission: config.tierDEmissionRate,
      spaceBasis: config.tierDSpaceBasis,
      enabled: config.tierDEnabled,
      color: 'secondary'
    }
  ];

  return (
    <>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              {t('transportation.TIER_CONFIGURATION')}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={config.isActive}
                    onChange={handleToggleActive}
                    color="primary"
                  />
                }
                label={config.isActive ? t('common.ACTIVE') : t('common.INACTIVE')}
              />
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditConfig}
              >
                {t('common.EDIT')}
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('transportation.TIER')}</TableCell>
                  <TableCell>{t('transportation.DISTANCE_RANGE')}</TableCell>
                  <TableCell align="right">{t('transportation.BASE_COST')}</TableCell>
                  <TableCell align="right">{t('transportation.EMISSION_RATE')}</TableCell>
                  <TableCell align="right">{t('transportation.SPACE_BASIS')}</TableCell>
                  <TableCell align="center">{t('common.STATUS')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tierData.map((tier) => (
                  <TableRow key={tier.tier}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`${t('transportation.TIER')} ${tier.tier}`}
                          size="small"
                          color={tier.color as 'success' | 'info' | 'warning' | 'secondary'}
                          variant="outlined"
                        />
                        <Typography variant="body2">
                          {tier.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{tier.distance}</TableCell>
                    <TableCell align="right">
                      {tier.baseCost} {t('common.GOLD')}
                    </TableCell>
                    <TableCell align="right">
                      {tier.emission} {t('common.CARBON')}
                    </TableCell>
                    <TableCell align="right">
                      {tier.spaceBasis} {t('transportation.UNITS')}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={tier.enabled ? t('common.ENABLED') : t('common.DISABLED')}
                        color={tier.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Additional Settings section removed */}
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
      >
        {editingConfig && (
          <TransportationConfigForm
            config={editingConfig}
            onSave={handleFormSave}
            onCancel={handleFormClose}
          />
        )}
      </Dialog>
    </>
  );
};

export default TransportationConfigList;