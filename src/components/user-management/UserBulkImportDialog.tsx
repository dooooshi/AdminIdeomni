'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,

} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { UserImportTemplateGenerator } from '@/lib/utils/userImportTemplate';
import {
  UserBulkImportService,
  ImportValidationResult,
  ImportValidationError
} from '@/lib/services/userBulkImportService';
import UserService, { BulkImportUserDto, BulkOperationResultDto } from '@/lib/services/userService';
import { BulkImportRequest } from '@/lib/services/userBulkImportRequest';

interface UserBulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: BulkOperationResultDto) => void;
}

const UserBulkImportDialog: React.FC<UserBulkImportDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<BulkOperationResultDto | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsing, setParsing] = useState(false);

  const steps = [
    t('userManagement.BULK_IMPORT_STEP_UPLOAD'),
    t('userManagement.BULK_IMPORT_STEP_VALIDATE'),
    t('userManagement.BULK_IMPORT_STEP_IMPORT'),
    t('userManagement.BULK_IMPORT_STEP_COMPLETE'),
  ];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setParsing(true);
    setParseProgress(0);

    try {
      const result = await UserBulkImportService.parseFile(
        selectedFile,
        (current, total) => {
          setParseProgress(Math.round((current / total) * 100));
        }
      );

      setValidationResult(result);
      setActiveStep(1);
      setParsing(false);

      if (result.errors.length > 0) {
        setShowErrors(true);
      }
    } catch (error) {
      console.error('Failed to parse file:', error);
      alert(t('userManagement.BULK_IMPORT_PARSE_ERROR'));
      setParsing(false);
      setFile(null);
    }
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleDownloadTemplate = (format: 'csv' | 'excel') => {
    if (format === 'csv') {
      UserImportTemplateGenerator.downloadCSVTemplate();
    } else {
      UserImportTemplateGenerator.downloadExcelTemplate();
    }
  };

  const handleImport = async () => {
    if (!validationResult || validationResult.validUsers.length === 0) return;

    setImporting(true);
    setImportProgress(0);
    setActiveStep(2);

    try {
      // Client-side validation first
      const validationErrors = BulkImportRequest.validateImportData({
        users: validationResult.validUsers,
      });

      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        alert(t('userManagement.BULK_IMPORT_ERROR'));
        setActiveStep(1);
        setImporting(false);
        return;
      }

      // Optional: Server-side validation before actual import
      setImportProgress(10);
      try {
        await BulkImportRequest.validateWithServer({
          users: validationResult.validUsers,
        });
      } catch (validationError) {
        console.error('Server validation failed:', validationError);
        // Continue with import even if validation endpoint fails
      }

      // Use enhanced bulk import request with progress tracking
      const result = await BulkImportRequest.processBulkImport(
        {
          users: validationResult.validUsers,
        },
        {
          onProgress: (progress) => {
            // Start from 20% since validation took 10%
            setImportProgress(20 + (progress.percentage * 0.8));
          },
          batchSize: 50,
          retryAttempts: 3,
          retryDelay: 1000,
        }
      );

      setImportProgress(100);
      setImportResult(result);
      setActiveStep(3);

      // Call success callback if all succeeded
      if (result.failedCount === 0) {
        setTimeout(() => {
          onSuccess(result);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Failed to import users:', error);
      const errorMessage = error.response?.data?.message || error.message || t('userManagement.BULK_IMPORT_ERROR');
      alert(errorMessage);
      setActiveStep(1); // Go back to validation step on error
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadErrors = () => {
    if (validationResult && validationResult.errors.length > 0) {
      UserBulkImportService.downloadErrorReport(validationResult.errors);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    setImportProgress(0);
    setShowErrors(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderUploadStep = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('userManagement.BULK_IMPORT_INFO')}
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          {t('userManagement.DOWNLOAD_TEMPLATE')}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleDownloadTemplate('csv')}
          >
            {t('userManagement.DOWNLOAD_CSV_TEMPLATE')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleDownloadTemplate('excel')}
          >
            {t('userManagement.DOWNLOAD_EXCEL_TEMPLATE')}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
        {t('userManagement.UPLOAD_FILE')}
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          {isDragActive
            ? t('userManagement.DROP_FILE_HERE')
            : t('userManagement.DRAG_DROP_FILE')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('userManagement.SUPPORTED_FORMATS')}
        </Typography>
      </Box>

      {parsing && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={parseProgress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('userManagement.PARSING_FILE')} {parseProgress}%
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderValidationStep = () => (
    <Box>
      {validationResult && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {validationResult.totalRows}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userManagement.TOTAL_ROWS')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {validationResult.validRows}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userManagement.VALID_ROWS')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {validationResult.invalidRows}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userManagement.INVALID_ROWS')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {validationResult.errors.length > 0 && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button
                  size="small"
                  onClick={handleDownloadErrors}
                  startIcon={<FileDownloadIcon />}
                >
                  {t('userManagement.DOWNLOAD_ERRORS')}
                </Button>
              }
            >
              {t('userManagement.VALIDATION_ERRORS_FOUND', { count: validationResult.errors.length })}
            </Alert>
          )}

          {validationResult.errors.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Button
                onClick={() => setShowErrors(!showErrors)}
                endIcon={showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showErrors ? t('userManagement.HIDE_ERRORS') : t('userManagement.SHOW_ERRORS')}
              </Button>
              <Collapse in={showErrors}>
                <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('userManagement.ROW')}</TableCell>
                        <TableCell>{t('userManagement.FIELD')}</TableCell>
                        <TableCell>{t('userManagement.ERROR')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validationResult.errors.slice(0, 50).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.field}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                      {validationResult.errors.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            <Typography variant="body2" color="text.secondary">
                              {t('userManagement.AND_MORE_ERRORS', { count: validationResult.errors.length - 50 })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Box>
          )}

          {validationResult.validRows > 0 && (
            <Alert severity="success">
              {t('userManagement.READY_TO_IMPORT', { count: validationResult.validRows })}
            </Alert>
          )}
        </>
      )}
    </Box>
  );

  const renderImportStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <LinearProgress variant="determinate" value={importProgress} sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        {t('userManagement.IMPORTING_USERS')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('userManagement.IMPORT_PROGRESS', { progress: importProgress })}
      </Typography>
    </Box>
  );

  const renderCompleteStep = () => (
    <Box>
      {importResult && (
        <>
          <Alert
            severity={importResult.failedCount === 0 ? 'success' : 'warning'}
            sx={{ mb: 3 }}
          >
            {importResult.failedCount === 0
              ? t('userManagement.IMPORT_SUCCESS', { count: importResult.successCount })
              : t('userManagement.IMPORT_PARTIAL', {
                  success: importResult.successCount,
                  failed: importResult.failedCount,
                })}
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {importResult.successCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userManagement.IMPORTED_SUCCESSFULLY')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" color="error.main">
                  {importResult.failedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userManagement.IMPORT_FAILED')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <InfoIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {importResult.totalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('userManagement.TOTAL_PROCESSED')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {importResult.failedCount > 0 && importResult.details && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('userManagement.FAILED_IMPORTS')}
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('userManagement.IDENTIFIER')}</TableCell>
                      <TableCell>{t('userManagement.ERROR')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importResult.details
                      .filter(d => !d.success)
                      .map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.identifier}</TableCell>
                          <TableCell>{detail.error}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderUploadStep();
      case 1:
        return renderValidationStep();
      case 2:
        return renderImportStep();
      case 3:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return file !== null && !parsing;
      case 1:
        return validationResult !== null && validationResult.validRows > 0;
      case 2:
        return !importing;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{t('userManagement.BULK_IMPORT')}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={handleReset} disabled={importing}>
            {t('userManagement.RESET')}
          </Button>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)} disabled={importing}>
              {t('userManagement.BACK')}
            </Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!canProceed()}
              startIcon={<CloudUploadIcon />}
            >
              {t('userManagement.IMPORT_USERS')}
            </Button>
          </>
        )}

        {activeStep === 3 && (
          <Button variant="contained" onClick={handleClose}>
            {t('userManagement.CLOSE')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserBulkImportDialog;