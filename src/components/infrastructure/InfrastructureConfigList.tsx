import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import InfrastructureConfigService from '@/lib/services/infrastructureConfigService';
import MapTemplateService from '@/lib/services/mapTemplateService';
import { InfrastructureConfig } from '@/types/infrastructure';
import InfrastructureConfigForm from './InfrastructureConfigForm';
import { alpha, useTheme } from '@mui/material/styles';

interface InfrastructureConfigListProps {
  templateId?: number;
  onConfigSelect?: (config: InfrastructureConfig) => void;
}

const InfrastructureConfigList: React.FC<InfrastructureConfigListProps> = ({
  templateId,
  onConfigSelect
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [configs, setConfigs] = useState<InfrastructureConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<InfrastructureConfig | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, [templateId, includeDeleted]);

  const loadConfigs = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (templateId) {
        const config = await InfrastructureConfigService.getConfig(templateId);
        setConfigs([config]);
      } else {
        const response = await InfrastructureConfigService.listConfigs({ includeDeleted });
        setConfigs(response.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404 && templateId) {
        setConfigs([]);
      } else {
        console.error('Failed to load infrastructure configs:', error);
        setError(t('infrastructure.FAILED_TO_LOAD_CONFIGS'));
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleEdit = (config: InfrastructureConfig) => {
    setSelectedConfig(config);
    setEditDialogOpen(true);
  };

  const handleDelete = (config: InfrastructureConfig) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConfig) return;

    try {
      await InfrastructureConfigService.deleteConfig(selectedConfig.templateId);
      setDeleteDialogOpen(false);
      setSelectedConfig(null);
      loadConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      setError(t('infrastructure.FAILED_TO_DELETE_CONFIG'));
    }
  };


  const handleApplyDefaults = async (templateId: number) => {
    try {
      await InfrastructureConfigService.applyDefaults(templateId);
      loadConfigs();
    } catch (error) {
      console.error('Failed to apply defaults:', error);
      setError(t('infrastructure.FAILED_TO_APPLY_DEFAULTS'));
    }
  };

  const handleSaveEdit = (config: InfrastructureConfig) => {
    setEditDialogOpen(false);
    setSelectedConfig(null);
    loadConfigs();
  };

  const formatValue = (value: string | number, type: 'currency' | 'decimal' | 'number') => {
    return InfrastructureConfigService.formatValue(value, type);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <CardHeader
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2,
            backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.12)}, transparent)`
          }}
          title={
            <Typography variant="h6" fontWeight={500}>
              {templateId ? t('infrastructure.INFRASTRUCTURE_CONFIG') : t('infrastructure.ALL_INFRASTRUCTURE_CONFIGS')}
            </Typography>
          }
          action={
            <Box display="flex" alignItems="center" gap={2}>
              {!templateId && (
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={includeDeleted}
                      onChange={(e) => setIncludeDeleted(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">{t('infrastructure.SHOW_DELETED')}</Typography>}
                />
              )}
              <Tooltip title={t('infrastructure.REFRESH')}>
                <IconButton size="small" onClick={loadConfigs}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {templateId && configs.length === 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleApplyDefaults(templateId)}
                >
                  {t('infrastructure.CREATE_CONFIG')}
                </Button>
              )}
            </Box>
          }
        />
        
        <CardContent sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" sx={{ m: 3 }} variant="outlined">
              {error}
            </Alert>
          )}

          {configs.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('infrastructure.NO_CONFIGS_FOUND')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('infrastructure.NO_CONFIGS_DESCRIPTION')}
              </Typography>
              {templateId && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleApplyDefaults(templateId)}
                >
                  {t('infrastructure.CREATE_DEFAULT_CONFIG')}
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.05 : 0.10)}, transparent)`
                    }}
                  >
                    {!templateId && <TableCell sx={{ fontWeight: 500, py: 2 }}>{t('infrastructure.TEMPLATE')}</TableCell>}
                    <TableCell sx={{ fontWeight: 500, py: 2 }}>{t('infrastructure.WATER_RESOURCES')}</TableCell>
                    <TableCell sx={{ fontWeight: 500, py: 2 }}>{t('infrastructure.ELECTRICITY_RESOURCES')}</TableCell>
                    <TableCell sx={{ fontWeight: 500, py: 2 }}>{t('infrastructure.OPERATION_POINTS')}</TableCell>
                    <TableCell sx={{ fontWeight: 500, py: 2 }}>{t('infrastructure.BASE_COSTS')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, py: 2 }}>{t('infrastructure.STATUS')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, py: 2 }}>{t('infrastructure.ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map((config, index) => (
                    <TableRow 
                      key={config.id}
                      sx={{ 
                        opacity: config.deletedAt ? 0.5 : 1,
                        cursor: onConfigSelect ? 'pointer' : 'default',
                        bgcolor: index % 2 === 0
                          ? theme.palette.background.paper
                          : (theme.palette.mode === 'light'
                              ? alpha(theme.palette.text.primary, 0.02)
                              : alpha(theme.palette.common.white, 0.04)),
                        '&:hover': onConfigSelect ? { bgcolor: theme.palette.action.hover } : {},
                        '& td': { py: 2.5 }
                      }}
                      onClick={() => onConfigSelect && onConfigSelect(config)}
                    >
                      {!templateId && (
                        <TableCell>
                          <Typography variant="body2">
                            {config.template?.name || `Template #${config.templateId}`}
                          </Typography>
                          {config.template?.isDefault && (
                            <Typography variant="caption" color="primary">
                              {t('infrastructure.DEFAULT')}
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {formatValue(config.waterResourceBasePrice, 'currency')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Index: {formatValue(config.waterPlantIndex, 'decimal')}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {formatValue(config.electricityResourceBasePrice, 'currency')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Index: {formatValue(config.powerPlantIndex, 'decimal')}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {config.waterPlantBaseOperationPoints} / {config.waterPlantUpgradeOperationPoints}
                          </Typography>
                          <Typography variant="body2">
                            {config.powerPlantBaseOperationPoints} / {config.powerPlantUpgradeOperationPoints}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {t('infrastructure.BASE')}: {formatValue(config.baseStationBaseCost, 'currency')}
                          </Typography>
                          <Typography variant="body2">
                            {t('infrastructure.FIRE')}: {formatValue(config.fireStationBaseCost, 'currency')}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          color={
                            config.deletedAt ? 'error.main' : 
                            config.isActive ? 'success.main' : 
                            'text.secondary'
                          }
                        >
                          {config.deletedAt ? t('infrastructure.DELETED') : config.isActive ? t('infrastructure.ACTIVE') : t('infrastructure.INACTIVE')}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                          <Tooltip title={t('infrastructure.EDIT')}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(config);
                              }}
                              disabled={!!config.deletedAt}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('infrastructure.DELETE')}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(config);
                              }}
                              disabled={!!config.deletedAt}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>


      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('infrastructure.EDIT_INFRASTRUCTURE_CONFIG')}</DialogTitle>
        <DialogContent>
          {selectedConfig && (
            <InfrastructureConfigForm
              templateId={selectedConfig.templateId}
              config={selectedConfig}
              onSave={handleSaveEdit}
              onCancel={() => setEditDialogOpen(false)}
              isEmbedded
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('infrastructure.DELETE_CONFIG')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('infrastructure.DELETE_CONFIG_CONFIRMATION')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('infrastructure.CANCEL')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('infrastructure.DELETE')}
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default InfrastructureConfigList;