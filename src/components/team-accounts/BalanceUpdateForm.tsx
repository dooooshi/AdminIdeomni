'use client';

import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { UpdateBalancesRequest, SetBalancesRequest } from '@/types/teamAccount';
import TeamAccountService from '@/lib/services/teamAccountService';
import ResourceDisplay from './ResourceDisplay';

type OperationMode = 'delta' | 'absolute';

interface BalanceUpdateFormProps {
  currentGold: number;
  currentCarbon: number;
  onSubmit: (data: { mode: OperationMode; changes: UpdateBalancesRequest | SetBalancesRequest }) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Reusable Balance Update Form Component
 * Handles both delta and absolute balance updates with validation and preview
 */
function BalanceUpdateForm({
  currentGold,
  currentCarbon,
  onSubmit,
  isLoading = false,
  className = ''
}: BalanceUpdateFormProps) {
  const { t } = useTranslation();
  const [operationMode, setOperationMode] = useState<OperationMode>('delta');
  const [goldValue, setGoldValue] = useState<string>('');
  const [carbonValue, setCarbonValue] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset form when operation mode changes
  useEffect(() => {
    setGoldValue('');
    setCarbonValue('');
    setValidationErrors([]);
  }, [operationMode]);

  // Validation
  const validateInputs = useCallback(() => {
    const errors: string[] = [];

    if (!goldValue && !carbonValue) {
      errors.push(t('teamAccounts.validation.noChanges'));
      setValidationErrors(errors);
      return false;
    }

    const goldNum = goldValue ? parseFloat(goldValue) : 0;
    const carbonNum = carbonValue ? parseFloat(carbonValue) : 0;

    if (goldValue && (isNaN(goldNum) || !isFinite(goldNum))) {
      errors.push(t('teamAccounts.validation.invalidGold'));
    }

    if (carbonValue && (isNaN(carbonNum) || !isFinite(carbonNum))) {
      errors.push(t('teamAccounts.validation.invalidCarbon'));
    }

    if (operationMode === 'absolute') {
      if (goldValue && goldNum < 0) {
        errors.push(t('teamAccounts.validation.negativeGold'));
      }
      if (carbonValue && carbonNum < 0) {
        errors.push(t('teamAccounts.validation.negativeCarbon'));
      }
    } else if (operationMode === 'delta') {
      // Validate delta changes won't result in negative balances
      const validation = TeamAccountService.validateBalanceChanges(
        currentGold,
        currentCarbon,
        {
          goldDelta: goldValue ? goldNum : undefined,
          carbonDelta: carbonValue ? carbonNum : undefined
        }
      );

      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [goldValue, carbonValue, operationMode, currentGold, currentCarbon, t]);

  // Calculate preview
  const getPreview = useCallback(() => {
    const goldNum = goldValue ? parseFloat(goldValue) : 0;
    const carbonNum = carbonValue ? parseFloat(carbonValue) : 0;

    if (operationMode === 'delta') {
      const preview = TeamAccountService.calculateBalancePreview(
        currentGold,
        currentCarbon,
        {
          goldDelta: goldValue ? goldNum : undefined,
          carbonDelta: carbonValue ? carbonNum : undefined
        }
      );
      return {
        currentGold,
        currentCarbon,
        newGold: preview.newGold,
        newCarbon: preview.newCarbon,
        isValid: preview.isValid
      };
    } else {
      return {
        currentGold,
        currentCarbon,
        newGold: goldValue ? goldNum : currentGold,
        newCarbon: carbonValue ? carbonNum : currentCarbon,
        isValid: true
      };
    }
  }, [currentGold, currentCarbon, goldValue, carbonValue, operationMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    try {
      const goldNum = goldValue ? parseFloat(goldValue) : undefined;
      const carbonNum = carbonValue ? parseFloat(carbonValue) : undefined;

      if (operationMode === 'delta') {
        const changes: UpdateBalancesRequest = {};
        if (goldValue) changes.goldDelta = goldNum;
        if (carbonValue) changes.carbonDelta = carbonNum;

        await onSubmit({ mode: 'delta', changes });
      } else {
        const balances: SetBalancesRequest = {
          gold: goldValue ? goldNum! : currentGold,
          carbon: carbonValue ? carbonNum! : currentCarbon
        };

        await onSubmit({ mode: 'absolute', changes: balances });
      }

      // Reset form on success
      setGoldValue('');
      setCarbonValue('');
      setValidationErrors([]);
    } catch (error: any) {
      console.error('Failed to update balances:', error);
      setValidationErrors([error.data || t('teamAccounts.updateFailed')]);
    }
  };

  const preview = getPreview();

  return (
    <Box className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Balances */}
        <Card variant="outlined">
          <CardContent className="p-4">
            <Typography variant="subtitle2" className="mb-3">
              {t('teamAccounts.currentBalances')}
            </Typography>
            <ResourceDisplay
              gold={currentGold}
              carbon={currentCarbon}
              layout="horizontal"
              variant="card"
              size="medium"
            />
          </CardContent>
        </Card>

        {/* Operation Mode Selection */}
        <Box>
          <FormLabel component="legend" className="mb-3">
            {t('teamAccounts.operationMode')}
          </FormLabel>
          <ButtonGroup variant="outlined" fullWidth>
            <Button
              variant={operationMode === 'delta' ? 'contained' : 'outlined'}
              onClick={() => setOperationMode('delta')}
              startIcon={<IdeomniSvgIcon>heroicons-outline:plus-minus</IdeomniSvgIcon>}
            >
              {t('teamAccounts.deltaMode')}
            </Button>
            <Button
              variant={operationMode === 'absolute' ? 'contained' : 'outlined'}
              onClick={() => setOperationMode('absolute')}
              startIcon={<IdeomniSvgIcon>heroicons-outline:equals</IdeomniSvgIcon>}
            >
              {t('teamAccounts.absoluteMode')}
            </Button>
          </ButtonGroup>
          <Typography variant="caption" color="textSecondary" className="mt-2 block">
            {operationMode === 'delta' 
              ? t('teamAccounts.deltaModeDescription')
              : t('teamAccounts.absoluteModeDescription')
            }
          </Typography>
        </Box>

        {/* Input Fields */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormControl>
            <TextField
              label={operationMode === 'delta' ? t('teamAccounts.goldChange') : t('teamAccounts.newGoldAmount')}
              type="number"
              value={goldValue}
              onChange={(e) => setGoldValue(e.target.value)}
              placeholder={operationMode === 'delta' ? '0' : currentGold.toString()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IdeomniSvgIcon className="text-yellow-600">
                      heroicons-solid:currency-dollar
                    </IdeomniSvgIcon>
                  </InputAdornment>
                )
              }}
              helperText={
                operationMode === 'delta' 
                  ? t('teamAccounts.deltaHelp')
                  : t('teamAccounts.absoluteHelp')
              }
            />
          </FormControl>

          <FormControl>
            <TextField
              label={operationMode === 'delta' ? t('teamAccounts.carbonChange') : t('teamAccounts.newCarbonAmount')}
              type="number"
              value={carbonValue}
              onChange={(e) => setCarbonValue(e.target.value)}
              placeholder={operationMode === 'delta' ? '0' : currentCarbon.toString()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IdeomniSvgIcon className="text-green-600">
                      heroicons-solid:leaf
                    </IdeomniSvgIcon>
                  </InputAdornment>
                )
              }}
              helperText={
                operationMode === 'delta' 
                  ? t('teamAccounts.deltaHelp')
                  : t('teamAccounts.absoluteHelp')
              }
            />
          </FormControl>
        </Box>

        {/* Preview */}
        {preview && (goldValue || carbonValue) && (
          <Card variant="outlined" className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <Typography variant="subtitle2" className="mb-3 flex items-center gap-2">
                <IdeomniSvgIcon>heroicons-outline:eye</IdeomniSvgIcon>
                {t('teamAccounts.preview')}
              </Typography>
              <Box className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('teamAccounts.GOLD')}
                  </Typography>
                  <Box className="flex items-center gap-2">
                    <Typography variant="body2" className="font-mono">
                      {TeamAccountService.formatResourceAmount(preview.currentGold)}
                    </Typography>
                    <IdeomniSvgIcon className="text-sm">heroicons-outline:arrow-right</IdeomniSvgIcon>
                    <Typography 
                      variant="body2" 
                      className={`font-mono font-bold ${TeamAccountService.getResourceColor(preview.newGold, 'gold')}`}
                    >
                      {TeamAccountService.formatResourceAmount(preview.newGold)}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('teamAccounts.CARBON')}
                  </Typography>
                  <Box className="flex items-center gap-2">
                    <Typography variant="body2" className="font-mono">
                      {TeamAccountService.formatResourceAmount(preview.currentCarbon)}
                    </Typography>
                    <IdeomniSvgIcon className="text-sm">heroicons-outline:arrow-right</IdeomniSvgIcon>
                    <Typography 
                      variant="body2" 
                      className={`font-mono font-bold ${TeamAccountService.getResourceColor(preview.newCarbon, 'carbon')}`}
                    >
                      {TeamAccountService.formatResourceAmount(preview.newCarbon)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error">
            <Typography variant="subtitle2" className="mb-2">
              {t('teamAccounts.validationErrors')}:
            </Typography>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Submit Button */}
        <Box className="flex justify-end">
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || validationErrors.length > 0 || (!goldValue && !carbonValue)}
            startIcon={isLoading ? (
              <IdeomniSvgIcon className="animate-spin">
                heroicons-outline:arrow-path
              </IdeomniSvgIcon>
            ) : (
              <IdeomniSvgIcon>heroicons-outline:check</IdeomniSvgIcon>
            )}
          >
            {isLoading ? t('common.saving') : t('teamAccounts.UPDATE_BALANCES')}
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default BalanceUpdateForm;