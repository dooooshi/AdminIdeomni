'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import useDebounce from '@/@ideomni/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Slider,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import LandService from '@/lib/services/landService';
import {
  AvailableTile,
  LandPurchaseRequest,
  PurchaseValidation,
  LandPurchase
} from '@/types/land';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    padding: 0,
    maxWidth: '420px',
    width: '100%',
    margin: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${theme.palette.grey[100]}`,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '24px',
  '&:first-of-type': {
    paddingTop: '24px',
  },
}));

const CostSummary = styled(Box)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: '6px',
  padding: '16px',
}));

const ErrorSummary = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(239, 68, 68, 0.04)',
  border: '1px solid rgba(239, 68, 68, 0.1)',
  borderRadius: '6px',
  padding: '12px',
}));

export interface LandPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  tile: AvailableTile | null;
  onPurchaseComplete: (purchase: LandPurchase) => void;
}

const LandPurchaseModal: React.FC<LandPurchaseModalProps> = ({
  open,
  onClose,
  tile,
  onPurchaseComplete
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { t: tCommon } = useTranslation();
  
  // Form state
  const [area, setArea] = useState(1);
  const [description, setDescription] = useState('');

  // Validation and loading states
  const [validation, setValidation] = useState<PurchaseValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingValidation, setPendingValidation] = useState(false);

  // Track if modal just opened to prevent initial double validation
  const isInitialMount = useRef(true);

  // Helper functions
  const resetForm = () => {
    setArea(1); // NEW: Always start with 1 unit (integer only)
    setDescription('');
    setValidation(null);
    setError(null);
  };

  const generateDefaultDescription = () => {
    if (!tile) return;
    setDescription(t('land.PURCHASE_AREA_ON_TILE_FORMATTED', {
      amount: area,
      landType: LandService.formatLandType(tile.landType),
      tileId: tile.tileId
    }));
  };

  // Validation function
  const validatePurchase = useCallback(async () => {
    if (!tile || area <= 0) return;

    try {
      setValidating(true);
      setPendingValidation(false);
      setError(null);

      const validationResult = await LandService.validatePurchase(tile.tileId, area);
      setValidation(validationResult);
    } catch (err: any) {
      console.error('Validation failed:', err);
      setError(LandService.getErrorMessage(err));
      setValidation(null);
    } finally {
      setValidating(false);
    }
  }, [tile, area]);

  // Debounced validation function (500ms delay)
  const debouncedValidation = useDebounce(validatePurchase, 500);

  // Reset form when modal opens/closes or tile changes
  useEffect(() => {
    if (open && tile) {
      isInitialMount.current = true; // Mark as initial mount when modal opens
      resetForm();
      generateDefaultDescription();
    }
  }, [open, tile]);

  // Validate purchase when area changes (debounced) - but skip on initial mount
  useEffect(() => {
    // Skip validation if this is the initial mount (modal just opened)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Perform initial validation without debounce
      if (tile && area > 0) {
        validatePurchase();
      }
      return;
    }

    // For subsequent changes, use debounced validation
    if (tile && area > 0) {
      setPendingValidation(true);
      debouncedValidation();
    }
  }, [tile, area, debouncedValidation]);

  const handlePurchase = async () => {
    if (!tile || !validation?.canPurchase) return;

    try {
      setPurchasing(true);
      setError(null);

      const purchaseRequest: LandPurchaseRequest = {
        tileId: tile.tileId,
        area: area,
        description: description || undefined,
      };

      const purchase = await LandService.purchaseLand(purchaseRequest);
      onPurchaseComplete(purchase);
      onClose();
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setError(LandService.getErrorMessage(err));
    } finally {
      setPurchasing(false);
    }
  };

  const handleAreaChange = (event: Event, newValue: number | number[]) => {
    const newArea = Array.isArray(newValue) ? newValue[0] : newValue;
    const integerArea = Math.round(newArea); // NEW: Ensure integer values
    setArea(integerArea);
    
    // Update description with new area
    if (tile) {
      setDescription(t('land.PURCHASE_AREA_ON_TILE_FORMATTED', {
        amount: integerArea,
        landType: LandService.formatLandType(tile.landType),
        tileId: tile.tileId
      }));
    }
  };

  const handleClose = () => {
    if (!purchasing) {
      onClose();
    }
  };

  if (!tile) return null;

  const canPurchase = validation?.canPurchase && !purchasing && !validating;

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <StyledDialogContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight={400} sx={{ fontSize: '18px', mb: 0.5 }}>
              {t('land.PURCHASE_DIALOG_TITLE', { tileId: tile.tileId })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
              {tile.tileId} · {LandService.formatLandType(tile.landType)}
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            disabled={purchasing}
            sx={{ 
              minWidth: 'auto', 
              p: 0.5,
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'transparent', color: 'text.primary' }
            }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Box>

        <Stack spacing={3}>
          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                color: 'rgb(127, 29, 29)',
                fontSize: '14px',
                '& .MuiAlert-icon': {
                  color: 'rgb(239, 68, 68)',
                }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Area Selection */}
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontSize: '13px' }}>
              {t('land.AREA')}
            </Typography>
            <Typography variant="h6" fontWeight={300} mb={2} sx={{ fontSize: '24px' }}>
              {area} {area === 1 ? t('land.UNIT') : t('land.UNITS')}
            </Typography>
            <Slider
              value={area}
              onChange={handleAreaChange}
              min={1}
              max={6}
              step={1}
              disabled={purchasing}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                },
                '& .MuiSlider-track': {
                  height: 4,
                  border: 'none',
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  opacity: 0.2,
                },
              }}
            />
          </Box>

          {/* Cost Display */}
          {(validating || pendingValidation) ? (
            <Box display="flex" alignItems="center" py={2}>
              <CircularProgress size={16} sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                {pendingValidation ? t('land.WAITING') : t('land.CALCULATING')}
              </Typography>
            </Box>
          ) : validation && (
            <CostSummary>
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                    {t('land.GOLD')}
                  </Typography>
                  <Typography variant="body2" fontWeight={400}>
                    {LandService.formatCurrency(validation.goldCost || 0, 'gold')}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                    {t('land.CARBON')}
                  </Typography>
                  <Typography variant="body2" fontWeight={400}>
                    {LandService.formatCurrency(validation.carbonCost || 0, 'carbon')}
                  </Typography>
                </Box>
              </Stack>
            </CostSummary>
          )}

          {/* Validation Errors */}
          {validation && validation.errors && validation.errors.length > 0 && (
            <ErrorSummary>
              <Stack spacing={1}>
                {validation.errors.map((error, index) => (
                  <Typography key={index} variant="body2" color="rgb(127, 29, 29)" sx={{ fontSize: '13px' }}>
                    {error}
                  </Typography>
                ))}
              </Stack>
            </ErrorSummary>
          )}

          {/* Description */}
          <TextField
            label={t('land.DESCRIPTION')}
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('land.OPTIONAL_DESCRIPTION_PLACEHOLDER')}
            disabled={purchasing}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '13px',
              }
            }}
          />

          {/* Actions */}
          <Stack direction="row" spacing={2} pt={1}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={purchasing}
              sx={{ 
                flex: 1,
                borderRadius: '6px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: 'text.secondary',
                fontSize: '14px',
                fontWeight: 400,
                py: 1,
                '&:hover': { 
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  backgroundColor: 'transparent'
                }
              }}
            >
              {t('land.CANCEL')}
            </Button>
            <Button
              variant="contained"
              onClick={handlePurchase}
              disabled={!canPurchase}
              startIcon={purchasing ? <CircularProgress size={16} /> : null}
              sx={{
                flex: 1,
                borderRadius: '6px',
                boxShadow: 'none',
                fontSize: '14px',
                fontWeight: 400,
                py: 1,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgb(37, 37, 37)' : theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgb(23, 23, 23)' : theme.palette.primary.dark
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                }
              }}
            >
              {purchasing ? tCommon('common.PROCESSING') : t('land.PURCHASE_UNITS', { amount: area })}
            </Button>
          </Stack>
        </Stack>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default LandPurchaseModal;