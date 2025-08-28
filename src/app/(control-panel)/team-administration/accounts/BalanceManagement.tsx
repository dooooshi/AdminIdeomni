'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { 
  useGetTeamAccountQuery,
  useUpdateTeamBalancesMutation,
  useSetTeamBalancesMutation
} from '../ManagerTeamAccountApi';
import { UpdateBalancesRequest, SetBalancesRequest } from '@/types/teamAccount';
import TeamAccountService from '@/lib/services/teamAccountService';

interface BalanceManagementProps {
  teamId: string | null;
  teamName?: string;
  open: boolean;
  onClose: () => void;
}

type OperationMode = 'delta' | 'absolute';

/**
 * Balance Management Panel Component
 * Allows managers to update team balances using delta or absolute operations
 */
function BalanceManagement({ teamId, teamName, open, onClose }: BalanceManagementProps) {
  const { t } = useTranslation();
  const [operationMode, setOperationMode] = useState<OperationMode>('delta');
  const [goldValue, setGoldValue] = useState<string>('');
  const [carbonValue, setCarbonValue] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // RTK Query hooks
  const { 
    data: teamAccount, 
    isLoading: isLoadingAccount 
  } = useGetTeamAccountQuery(teamId!, { 
    skip: !teamId 
  });

  const [updateBalances, { 
    isLoading: isUpdatingDelta 
  }] = useUpdateTeamBalancesMutation();

  const [setBalances, { 
    isLoading: isSettingAbsolute 
  }] = useSetTeamBalancesMutation();

  const isLoading = isUpdatingDelta || isSettingAbsolute;

  // Reset form when dialog opens/closes or team changes
  useEffect(() => {
    if (open && teamId) {
      setOperationMode('delta');
      setGoldValue('');
      setCarbonValue('');
      setValidationErrors([]);
    }
  }, [open, teamId]);

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
    } else if (operationMode === 'delta' && teamAccount) {
      // Validate delta changes won't result in negative balances
      const validation = TeamAccountService.validateBalanceChanges(
        teamAccount.gold,
        teamAccount.carbon,
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
  }, [goldValue, carbonValue, operationMode, teamAccount, t]);

  // Calculate preview
  const getPreview = useCallback(() => {
    if (!teamAccount) return null;

    const goldNum = goldValue ? parseFloat(goldValue) : 0;
    const carbonNum = carbonValue ? parseFloat(carbonValue) : 0;

    if (operationMode === 'delta') {
      const preview = TeamAccountService.calculateBalancePreview(
        teamAccount.gold,
        teamAccount.carbon,
        {
          goldDelta: goldValue ? goldNum : undefined,
          carbonDelta: carbonValue ? carbonNum : undefined
        }
      );
      return {
        currentGold: teamAccount.gold,
        currentCarbon: teamAccount.carbon,
        newGold: preview.newGold,
        newCarbon: preview.newCarbon,
        isValid: preview.isValid
      };
    } else {
      return {
        currentGold: teamAccount.gold,
        currentCarbon: teamAccount.carbon,
        newGold: goldValue ? goldNum : teamAccount.gold,
        newCarbon: carbonValue ? carbonNum : teamAccount.carbon,
        isValid: true
      };
    }
  }, [teamAccount, goldValue, carbonValue, operationMode]);

  const handleSubmit = async () => {
    if (!teamId || !validateInputs()) return;

    try {
      const goldNum = goldValue ? parseFloat(goldValue) : undefined;
      const carbonNum = carbonValue ? parseFloat(carbonValue) : undefined;

      if (operationMode === 'delta') {
        const changes: UpdateBalancesRequest = {};
        if (goldValue) changes.goldDelta = goldNum;
        if (carbonValue) changes.carbonDelta = carbonNum;

        await updateBalances({
          teamId,
          changes
        }).unwrap();
      } else {
        const balances: SetBalancesRequest = {
          gold: goldValue ? goldNum! : teamAccount!.gold,
          carbon: carbonValue ? carbonNum! : teamAccount!.carbon
        };

        await setBalances({
          teamId,
          balances
        }).unwrap();
      }

      onClose();
    } catch (error: any) {
      console.error('Failed to update balances:', error);
      setValidationErrors([error.data || t('teamAccounts.updateFailed')]);
    }
  };

  const preview = getPreview();

  const container = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: motion.div,
        variants: container,
        initial: "hidden",
        animate: "show"
      }}
    >
      <DialogTitle>
        <Box className="flex items-center gap-3">
          <IdeomniSvgIcon className="text-2xl text-blue-600">
            heroicons-outline:scale
          </IdeomniSvgIcon>
          <Box>
            <Typography variant="h6">
              {t('teamAccounts.manageBalances')}
            </Typography>
            {teamName && (
              <Typography variant="body2" color="textSecondary">
                {teamName}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent className="space-y-6">
        {/* Current Balances */}
        {teamAccount && (
          <Card variant="outlined">
            <CardContent className="p-4">
              <Typography variant="subtitle2" className="mb-3">
                {t('teamAccounts.currentBalances')}
              </Typography>
              <Box className="grid grid-cols-2 gap-4">
                <Box className="text-center">
                  <Typography variant="caption" color="textSecondary">
                    {t('teamAccounts.gold')}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    className={`font-mono ${TeamAccountService.getResourceColor(teamAccount.gold, 'gold')}`}
                  >
                    {TeamAccountService.formatResourceAmount(teamAccount.gold)}
                  </Typography>
                </Box>
                <Box className="text-center">
                  <Typography variant="caption" color="textSecondary">
                    {t('teamAccounts.carbon')}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    className={`font-mono ${TeamAccountService.getResourceColor(teamAccount.carbon, 'carbon')}`}
                  >
                    {TeamAccountService.formatResourceAmount(teamAccount.carbon)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

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
              placeholder={operationMode === 'delta' ? '0' : teamAccount?.gold.toString()}
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
              placeholder={operationMode === 'delta' ? '0' : teamAccount?.carbon.toString()}
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
          <Card variant="outlined" className="bg-blue-50">
            <CardContent className="p-4">
              <Typography variant="subtitle2" className="mb-3 flex items-center gap-2">
                <IdeomniSvgIcon>heroicons-outline:eye</IdeomniSvgIcon>
                {t('teamAccounts.preview')}
              </Typography>
              <Box className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('teamAccounts.gold')}
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
                    {t('teamAccounts.carbon')}
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
      </DialogContent>

      <DialogActions className="p-6 pt-0">
        <Button 
          onClick={onClose}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || validationErrors.length > 0 || (!goldValue && !carbonValue)}
          startIcon={isLoading ? (
            <IdeomniSvgIcon className="animate-spin">
              heroicons-outline:arrow-path
            </IdeomniSvgIcon>
          ) : (
            <IdeomniSvgIcon>heroicons-outline:check</IdeomniSvgIcon>
          )}
        >
          {isLoading ? t('common.saving') : t('teamAccounts.updateBalances')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BalanceManagement;