import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertProps, 
  Slide, 
  SlideProps,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { 
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: React.ReactNode;
  details?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (message: string, details?: string, duration?: number) => void;
  showError: (message: string, details?: string, duration?: number) => void;
  showWarning: (message: string, details?: string, duration?: number) => void;
  showInfo: (message: string, details?: string, duration?: number) => void;
  closeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 6000,
      ...toast,
    };

    setToasts(prev => {
      // Limit the number of toasts
      const updated = [newToast, ...prev.slice(0, maxToasts - 1)];
      return updated;
    });

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        closeToast(id);
      }, newToast.duration);
    }
  }, [maxToasts, generateId]);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, details?: string, duration?: number) => {
    showToast({ message, details, type: 'success', duration });
  }, [showToast]);

  const showError = useCallback((message: string, details?: string, duration?: number) => {
    showToast({ message, details, type: 'error', duration: duration || 8000 });
  }, [showToast]);

  const showWarning = useCallback((message: string, details?: string, duration?: number) => {
    showToast({ message, details, type: 'warning', duration });
  }, [showToast]);

  const showInfo = useCallback((message: string, details?: string, duration?: number) => {
    showToast({ message, details, type: 'info', duration });
  }, [showToast]);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <SuccessIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return null;
    }
  };

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render active toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'right' 
          }}
          sx={{
            '& .MuiSnackbar-root': {
              position: 'static',
            },
            position: 'fixed',
            bottom: 16 + (index * 80),
            right: 16,
            zIndex: 1400 + index,
            maxWidth: '400px',
          }}
        >
          <Alert
            severity={toast.type}
            variant="filled"
            icon={getIcon(toast.type)}
            action={
              <Box display="flex" alignItems="center" gap={1}>
                {toast.action}
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => closeToast(toast.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            sx={{
              minWidth: '300px',
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {toast.message}
              </Typography>
              {toast.details && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }}>
                  {toast.details}
                </Typography>
              )}
            </Box>
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;