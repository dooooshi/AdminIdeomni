'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  Typography,

  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import AdminUserActivityService, {
  ExportParams,
  ExportResult,
  USER_TYPES,
} from '@/lib/services/adminUserActivityService';

interface ExportHistory {
  id: string;
  filename: string;
  format: string;
  recordCount: number;
  createdAt: string;
  expiresAt: string;
  downloadUrl: string;
  status: 'completed' | 'expired';
}

const ExportPanel: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State management
  const [exportParams, setExportParams] = useState<ExportParams>({
    format: 'csv',
    includeUnassigned: true,
    includeInactive: false,
    userType: undefined,
    activityId: '',
    fields: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Mock export history (in real app, this would come from API)
  const [exportHistory] = useState<ExportHistory[]>([
    {
      id: '1',
      filename: 'user-activities-2024-01-25.csv',
      format: 'csv',
      recordCount: 850,
      createdAt: '2024-01-25T10:30:00Z',
      expiresAt: '2024-01-26T10:30:00Z',
      downloadUrl: '/downloads/user-activities-2024-01-25.csv',
      status: 'completed',
    },
    {
      id: '2',
      filename: 'team-statistics-2024-01-24.xlsx',
      format: 'excel',
      recordCount: 45,
      createdAt: '2024-01-24T15:45:00Z',
      expiresAt: '2024-01-25T15:45:00Z',
      downloadUrl: '/downloads/team-statistics-2024-01-24.xlsx',
      status: 'expired',
    },
  ]);

  // Available export fields
  const availableFields = [
    { value: 'username', label: t('activityManagement.USERNAME') },
    { value: 'email', label: t('activityManagement.EMAIL') },
    { value: 'firstName', label: t('activityManagement.FIRST_NAME') },
    { value: 'lastName', label: t('activityManagement.LAST_NAME') },
    { value: 'userType', label: t('activityManagement.USER_TYPE') },
    { value: 'isActive', label: t('activityManagement.ACTIVE_STATUS') },
    { value: 'currentActivity', label: t('activityManagement.CURRENT_ACTIVITY') },
    { value: 'activityStatus', label: t('activityManagement.ACTIVITY_STATUS') },
    { value: 'enrolledAt', label: t('activityManagement.ENROLLED_AT') },
    { value: 'currentTeam', label: t('activityManagement.CURRENT_TEAM') },
    { value: 'teamRole', label: t('activityManagement.TEAM_ROLE') },
    { value: 'createdAt', label: t('activityManagement.CREATED_AT') },
  ];

  // Handle export parameter changes
  const handleParamChange = (field: keyof ExportParams, value: any) => {
    setExportParams(prev => ({ ...prev, [field]: value }));
    // Clear any previous messages
    setError(null);
    setSuccess(null);
  };

  // Handle field selection
  const handleFieldToggle = (fieldValue: string) => {
    setExportParams(prev => ({
      ...prev,
      fields: prev.fields?.includes(fieldValue)
        ? prev.fields.filter(f => f !== fieldValue)
        : [...(prev.fields || []), fieldValue]
    }));
  };

  // Handle export execution
  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await AdminUserActivityService.exportUserActivityData(exportParams);
      setExportResult(result);
      setShowResult(true);
      setSuccess(t('activityManagement.EXPORT_COMPLETED_SUCCESSFULLY'));
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : t('activityManagement.EXPORT_FAILED'));
    } finally {
      setLoading(false);
    }
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <TableChartIcon />;
      case 'excel':
        return <DescriptionIcon />;
      case 'json':
        return <CodeIcon />;
      default:
        return <FileDownloadIcon />;
    }
  };

  // Get format description
  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'csv':
        return t('activityManagement.CSV_DESCRIPTION');
      case 'excel':
        return t('activityManagement.EXCEL_DESCRIPTION');
      case 'json':
        return t('activityManagement.JSON_DESCRIPTION');
      default:
        return '';
    }
  };

  // Check if export is valid
  const isExportValid = () => {
    return exportParams.format && 
           (exportParams.includeUnassigned || exportParams.includeInactive || exportParams.userType || exportParams.activityId);
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <DownloadIcon />
        {t('activityManagement.DATA_EXPORT_REPORTS')}
      </Typography>

      <Grid container spacing={3}>
        {/* Export Configuration */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('activityManagement.EXPORT_CONFIGURATION')}
              </Typography>

              <Grid container spacing={3}>
                {/* Export Format */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('activityManagement.EXPORT_FORMAT')}</InputLabel>
                    <Select
                      value={exportParams.format}
                      onChange={(e) => handleParamChange('format', e.target.value)}
                      label={t('activityManagement.EXPORT_FORMAT')}
                    >
                      <MenuItem value="csv">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TableChartIcon fontSize="small" />
                          CSV
                        </Box>
                      </MenuItem>
                      <MenuItem value="excel">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon fontSize="small" />
                          Excel (.xlsx)
                        </Box>
                      </MenuItem>
                      <MenuItem value="json">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CodeIcon fontSize="small" />
                          JSON
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {getFormatDescription(exportParams.format || 'csv')}
                  </Typography>
                </Grid>

                {/* User Type Filter */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('activityManagement.USER_TYPE_FILTER')}</InputLabel>
                    <Select
                      value={exportParams.userType || ''}
                      onChange={(e) => handleParamChange('userType', e.target.value || undefined)}
                      label={t('activityManagement.USER_TYPE_FILTER')}
                    >
                      <MenuItem value="">{t('activityManagement.ALL_USER_TYPES')}</MenuItem>
                      <MenuItem value={USER_TYPES.MANAGER}>{t('activityManagement.MANAGERS_ONLY')}</MenuItem>
                      <MenuItem value={USER_TYPES.WORKER}>{t('activityManagement.WORKERS_ONLY')}</MenuItem>
                      <MenuItem value={USER_TYPES.STUDENT}>{t('activityManagement.STUDENTS_ONLY')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Activity Filter */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>{t('activityManagement.ACTIVITY_FILTER')}</InputLabel>
                    <Select
                      value={exportParams.activityId || ''}
                      onChange={(e) => handleParamChange('activityId', e.target.value)}
                      label={t('activityManagement.ACTIVITY_FILTER')}
                    >
                      <MenuItem value="">{t('activityManagement.ALL_ACTIVITIES')}</MenuItem>
                      {/* TODO: Load from real activities API - hardcoded for now */}
                      <MenuItem value="activity1">{t('activityManagement.BUSINESS_STRATEGY_SIMULATION')}</MenuItem>
                      <MenuItem value="activity2">{t('activityManagement.ADVANCED_LEADERSHIP_TRAINING')}</MenuItem>
                      <MenuItem value="activity3">{t('activityManagement.TEAM_BUILDING_WORKSHOP')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Include Options */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('activityManagement.INCLUDE_OPTIONS')}
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exportParams.includeUnassigned || false}
                          onChange={(e) => handleParamChange('includeUnassigned', e.target.checked)}
                        />
                      }
                      label={t('activityManagement.INCLUDE_UNASSIGNED_USERS')}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exportParams.includeInactive || false}
                          onChange={(e) => handleParamChange('includeInactive', e.target.checked)}
                        />
                      }
                      label={t('activityManagement.INCLUDE_INACTIVE_USERS')}
                    />
                  </Stack>
                </Grid>

                {/* Field Selection */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('activityManagement.EXPORT_FIELDS')} ({t('activityManagement.OPTIONAL')})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('activityManagement.EXPORT_FIELDS_DESCRIPTION')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                    <Grid container spacing={1}>
                      {availableFields.map((field) => (
                        <Grid key={field.value} item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={exportParams.fields?.includes(field.value) || false}
                                onChange={() => handleFieldToggle(field.value)}
                              />
                            }
                            label={field.label}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                  {exportParams.fields && exportParams.fields.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('activityManagement.SELECTED_FIELDS')}:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {exportParams.fields.map((fieldValue) => {
                          const field = availableFields.find(f => f.value === fieldValue);
                          return (
                            <Chip
                              key={fieldValue}
                              label={field?.label || fieldValue}
                              size="small"
                              onDelete={() => handleFieldToggle(fieldValue)}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Export Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {success}
                    </Alert>
                  )}
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setExportParams({
                        format: 'csv',
                        includeUnassigned: true,
                        includeInactive: false,
                        userType: undefined,
                        activityId: '',
                        fields: [],
                      });
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    {t('activityManagement.RESET')}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                    onClick={handleExport}
                    disabled={loading || !isExportValid()}
                  >
                    {loading ? t('activityManagement.EXPORTING') : t('activityManagement.START_EXPORT')}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Export History */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('activityManagement.EXPORT_HISTORY')}
                </Typography>
                <Tooltip title={t('activityManagement.REFRESH_HISTORY')}>
                  <IconButton size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {exportHistory.length === 0 ? (
                <Alert severity="info">
                  {t('activityManagement.NO_EXPORT_HISTORY')}
                </Alert>
              ) : (
                <List>
                  {exportHistory.map((export_, index) => (
                    <React.Fragment key={export_.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          opacity: export_.status === 'expired' ? 0.6 : 1,
                        }}
                        secondaryAction={
                          export_.status === 'completed' && (
                            <Tooltip title={t('activityManagement.DOWNLOAD')}>
                              <IconButton
                                size="small"
                                onClick={() => window.open(export_.downloadUrl, '_blank')}
                              >
                                <FileDownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )
                        }
                      >
                        <ListItemIcon>
                          {export_.status === 'completed' ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <ErrorIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getFormatIcon(export_.format)}
                              <Typography variant="body2" noWrap>
                                {export_.filename}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                {export_.recordCount.toLocaleString()} {t('activityManagement.RECORDS')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(export_.createdAt), 'MMM dd, yyyy HH:mm')}
                              </Typography>
                              {export_.status === 'completed' && (
                                <Typography variant="caption" color="warning.main">
                                  {t('activityManagement.EXPIRES')}: {format(new Date(export_.expiresAt), 'MMM dd, HH:mm')}
                                </Typography>
                              )}
                              {export_.status === 'expired' && (
                                <Typography variant="caption" color="error.main">
                                  {t('activityManagement.EXPIRED')}
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                      {index < exportHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Result Dialog */}
      <Dialog
        open={showResult}
        onClose={() => setShowResult(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            {t('activityManagement.EXPORT_COMPLETED')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {exportResult && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                {exportResult.message}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('activityManagement.EXPORT_DETAILS')}:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={t('activityManagement.FILENAME')}
                        secondary={exportResult.data.filename}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('activityManagement.FORMAT')}
                        secondary={exportResult.data.format.toUpperCase()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('activityManagement.RECORD_COUNT')}
                        secondary={exportResult.data.recordCount.toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={t('activityManagement.EXPIRES_AT')}
                        secondary={format(new Date(exportResult.data.expiresAt), 'MMM dd, yyyy HH:mm')}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResult(false)}>
            {t('activityManagement.CLOSE')}
          </Button>
          {exportResult && (
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={() => window.open(exportResult.data.downloadUrl, '_blank')}
            >
              {t('activityManagement.DOWNLOAD_NOW')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExportPanel;