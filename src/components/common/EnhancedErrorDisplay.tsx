'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { 
  AdminUserActivityError, 
  ErrorType, 
  ErrorHandler,
  LocalizedErrorMessages
} from '@/lib/errors/AdminUserActivityError';

interface EnhancedErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  context?: string;
}

interface ErrorReportDialogProps {
  open: boolean;
  error: AdminUserActivityError;
  onClose: () => void;
  context?: string;
}

/**
 * Error Report Dialog Component
 * Displays detailed error information for debugging/reporting
 */
const ErrorReportDialog: React.FC<ErrorReportDialogProps> = ({
  open,
  error,
  onClose,
  context
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyError = async () => {
    const errorReport = {
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      context,
      details: error.details,
      stack: error.stack
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error report:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <BugReportIcon color="error" />
            <Typography variant="h6">{t('activityManagement.ERROR_REPORT')}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            {t('activityManagement.HELP_IMPROVE')}
          </Alert>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <List dense>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary={LocalizedErrorMessages.getErrorTypeDisplayName(error.type, t.language)}
                  secondary={error.type}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary={t('activityManagement.ERROR_CODE')}
                  secondary={error.code}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary={t('activityManagement.TIMESTAMP')}
                  secondary={format(error.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                />
              </ListItem>
              {context && (
                <ListItem>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary={t('activityManagement.ERROR_CONTEXT')}
                    secondary={context}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary={t('activityManagement.USER_MESSAGE')}
                  secondary={error.userMessage}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary={t('activityManagement.TECHNICAL_MESSAGE')}
                  secondary={error.message}
                />
              </ListItem>
            </List>
          </Paper>

          {error.details && Object.keys(error.details).length > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('activityManagement.ADDITIONAL_DETAILS')}
              </Typography>
              <Box component="pre" sx={{ 
                fontSize: '0.8rem', 
                overflow: 'auto',
                backgroundColor: 'grey.50',
                p: 1,
                borderRadius: 1,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(error.details, null, 2)}
              </Box>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyError}
          color={copied ? 'success' : 'primary'}
        >
          {copied ? t('activityManagement.ERROR_COPIED') : t('activityManagement.COPY_ERROR_REPORT')}
        </Button>
        <Button onClick={onClose}>{t('activityManagement.CLOSE')}</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Enhanced Error Display Component
 * Provides comprehensive error display with user-friendly messages and debugging capabilities
 */
const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false,
  context
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showDetailedView, setShowDetailedView] = useState(showDetails);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Process the error to ensure it's in our standard format
  const processedError = error instanceof AdminUserActivityError 
    ? error 
    : ErrorHandler.processError(error, context, t.language);

  // Get severity level for the alert
  const getSeverity = (errorType: ErrorType): 'error' | 'warning' | 'info' => {
    switch (errorType) {
      case ErrorType.VALIDATION:
        return 'warning';
      case ErrorType.PERMISSION:
        return 'error';
      case ErrorType.BUSINESS_LOGIC:
        return 'warning';
      case ErrorType.NOT_FOUND:
        return 'info';
      case ErrorType.NETWORK:
      case ErrorType.SERVER_ERROR:
      case ErrorType.TIMEOUT:
        return 'error';
      default:
        return 'error';
    }
  };

  // Get appropriate icon for error type
  const getErrorIcon = (errorType: ErrorType) => {
    switch (errorType) {
      case ErrorType.VALIDATION:
        return <WarningIcon />;
      case ErrorType.PERMISSION:
        return <ErrorIcon />;
      case ErrorType.BUSINESS_LOGIC:
        return <WarningIcon />;
      case ErrorType.NOT_FOUND:
        return <InfoIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  // Check if error should show retry option
  const canRetry = ErrorHandler.shouldRetry(processedError) && onRetry;

  const severity = getSeverity(processedError.type);

  if (compact) {
    return (
      <Alert 
        severity={severity}
        onClose={onDismiss}
        action={
          canRetry ? (
            <Button 
              color="inherit" 
              size="small" 
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              {t('activityManagement.RETRY')}
            </Button>
          ) : undefined
        }
      >
        {processedError.userMessage}
      </Alert>
    );
  }

  return (
    <>
      <Alert 
        severity={severity}
        icon={getErrorIcon(processedError.type)}
        onClose={onDismiss}
        sx={{ mb: showDetailedView ? 0 : undefined }}
      >
        <AlertTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1">
              {LocalizedErrorMessages.getErrorTypeDisplayName(processedError.type, t.language)}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={`${t('activityManagement.ERROR_CODE')}: ${processedError.code}`} 
                size="small" 
                variant="outlined"
                color={severity === 'error' ? 'error' : 'default'}
              />
            </Stack>
          </Box>
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {processedError.userMessage}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {canRetry && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              color={severity === 'error' ? 'error' : 'primary'}
            >
              {t('activityManagement.TRY_AGAIN')}
            </Button>
          )}
          
          <Button
            variant="text"
            size="small"
            startIcon={showDetailedView ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowDetailedView(!showDetailedView)}
          >
            {showDetailedView ? t('activityManagement.HIDE_DETAILS') : t('activityManagement.SHOW_DETAILS')}
          </Button>

          <Button
            variant="text"
            size="small"
            startIcon={<BugReportIcon />}
            onClick={() => setShowReportDialog(true)}
          >
            {t('activityManagement.REPORT_ISSUE')}
          </Button>
        </Stack>
      </Alert>

      <Collapse in={showDetailedView}>
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 1, 
            p: 2, 
            backgroundColor: theme.palette.grey[50] 
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {t('activityManagement.TECHNICAL_DETAILS')}
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText
                primary={t('activityManagement.ERROR_TYPE')}
                secondary={processedError.type}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('activityManagement.ERROR_CODE')}
                secondary={processedError.code}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t('activityManagement.TIMESTAMP')}
                secondary={format(processedError.timestamp, 'MMM dd, yyyy HH:mm:ss')}
              />
            </ListItem>
            {context && (
              <ListItem>
                <ListItemText
                  primary={t('activityManagement.CONTEXT')}
                  secondary={context}
                />
              </ListItem>
            )}
            <ListItem>
              <ListItemText
                primary={t('activityManagement.TECHNICAL_MESSAGE')}
                secondary={processedError.message}
              />
            </ListItem>
          </List>

          {processedError.details && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('activityManagement.ADDITIONAL_DETAILS_AVAILABLE')}
              </Typography>
            </>
          )}
        </Paper>
      </Collapse>

      <ErrorReportDialog
        open={showReportDialog}
        error={processedError}
        onClose={() => setShowReportDialog(false)}
        context={context}
      />
    </>
  );
};

export default EnhancedErrorDisplay;
export { ErrorReportDialog };