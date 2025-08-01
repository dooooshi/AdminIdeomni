'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { 
  useGetCurrentUserTeamAccountQuery, 
  useTransferCarbonMutation,
  useGetAvailableTeamsForTransferQuery 
} from '../../TeamAccountApi';
import TeamTransferService from '@/lib/services/teamTransferService';
import { TransferCarbonRequest, TeamResourceType, TransferFormState } from '@/types/teamTransfer';

/**
 * Carbon Transfer Page - Minimalist Business Design
 * Form for transferring carbon to other teams
 */
function CarbonTransferPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: teamAccount, isLoading, error } = useGetCurrentUserTeamAccountQuery();
  const { data: availableTeams = [], isLoading: loadingTeams } = useGetAvailableTeamsForTransferQuery();
  const [transferCarbon, { isLoading: isTransferring }] = useTransferCarbonMutation();

  const [formState, setFormState] = useState<TransferFormState>({
    selectedTeamId: null,
    amount: '',
    description: '',
    isLoading: false,
    error: null
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  };

  // Validate form in real-time
  useEffect(() => {
    if (!teamAccount || !formState.selectedTeamId || !formState.amount) {
      setValidationErrors([]);
      setValidationWarnings([]);
      return;
    }

    const request: TransferCarbonRequest = {
      targetTeamId: formState.selectedTeamId,
      amount: parseFloat(formState.amount) || 0,
      description: formState.description || undefined
    };

    const validation = TeamTransferService.validateTransferRequest(
      request,
      teamAccount.carbon,
      teamAccount.teamId
    );

    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
  }, [formState, teamAccount]);

  const handleAmountChange = (value: string) => {
    const regex = /^\d*\.?\d{0,3}$/;
    if (regex.test(value) || value === '') {
      setFormState(prev => ({ ...prev, amount: value }));
    }
  };

  const handleSubmit = () => {
    if (validationErrors.length > 0) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmTransfer = async () => {
    if (!formState.selectedTeamId || !formState.amount || !teamAccount) {
      return;
    }

    try {
      const request: TransferCarbonRequest = {
        targetTeamId: formState.selectedTeamId,
        amount: parseFloat(formState.amount),
        description: formState.description || undefined
      };

      await transferCarbon(request).unwrap();
      
      setShowConfirmDialog(false);
      router.push('/team-management/transfers?success=carbon');
    } catch (error: any) {
      const errorMessage = TeamTransferService.parseTransferError(error);
      setFormState(prev => ({ ...prev, error: errorMessage }));
      setShowConfirmDialog(false);
    }
  };

  if (isLoading) {
    return <IdeomniLoading />;
  }

  if (error || !teamAccount) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Paper className="p-16 text-center border border-gray-100 dark:border-gray-800 shadow-none">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
              <IdeomniSvgIcon size={24} className="text-red-500 dark:text-red-400">
                heroicons-outline:exclamation-triangle
              </IdeomniSvgIcon>
            </div>
            <Typography variant="h5" className="font-medium mb-3 text-gray-900 dark:text-white">
              {t('teamManagement:NOT_IN_TEAM_YET')}
            </Typography>
            <Typography color="text.secondary" className="mb-8 max-w-sm mx-auto">
              {t('teamManagement:JOIN_OR_CREATE_TEAM')}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push('/team-management/dashboard')}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
            >
              {t('teamManagement:TEAM_DASHBOARD')}
            </Button>
          </Paper>
        </div>
      </div>
    );
  }

  if (teamAccount.carbon <= 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Paper className="p-16 text-center border border-gray-100 dark:border-gray-800 shadow-none">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center">
              <IdeomniSvgIcon size={24} className="text-green-600">
                heroicons-outline:leaf
              </IdeomniSvgIcon>
            </div>
            <Typography variant="h5" className="font-medium mb-3 text-gray-900 dark:text-white">
              {t('teamManagement:INSUFFICIENT_BALANCE_ERROR')}
            </Typography>
            <Typography color="text.secondary" className="mb-8 max-w-sm mx-auto">
              You don't have any carbon to transfer. Your current balance is {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/transfers')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
              >
                {t('teamManagement:TRANSFER_HUB')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/team-management/dashboard')}
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
              >
                {t('teamManagement:TEAM_DASHBOARD')}
              </Button>
            </div>
          </Paper>
        </div>
      </div>
    );
  }

  const confirmationData = formState.selectedTeamId && formState.amount ? {
    targetTeam: Array.isArray(availableTeams) ? availableTeams.find(team => team?.id === formState.selectedTeamId) : null,
    amount: parseFloat(formState.amount),
    currentBalance: teamAccount.carbon,
    balanceAfter: teamAccount.carbon - parseFloat(formState.amount)
  } : null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="text"
                onClick={() => router.push('/team-management/transfers')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
              >
                {t('teamManagement:BACK')}
              </Button>
            </div>
            <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
              {t('teamManagement:TRANSFER_CARBON_TO_TEAM')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('teamManagement:TRANSFER_CARBON_SUBTITLE')}
            </Typography>
          </div>

          {/* Current Balance */}
          <Paper className="p-6 border border-gray-100 dark:border-gray-800 shadow-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center">
                <IdeomniSvgIcon size={20} className="text-green-600">
                  heroicons-solid:leaf
                </IdeomniSvgIcon>
              </div>
              <div>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-medium">
                  {t('teamManagement:AVAILABLE_BALANCE')}
                </Typography>
                <Typography variant="h5" className="font-light text-gray-900 dark:text-white mt-1">
                  {TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}
                </Typography>
              </div>
            </div>
          </Paper>

          {/* Transfer Form */}
          <Paper className="p-8 border border-gray-100 dark:border-gray-800 shadow-none">
            <div className="space-y-6">
              {/* Target Team Selection */}
              <div>
                <Typography variant="body1" className="mb-3 font-medium text-gray-900 dark:text-white">
                  {t('teamManagement:SELECT_TARGET_TEAM')} <span className="text-red-500">*</span>
                </Typography>
                <Autocomplete
                  options={Array.isArray(availableTeams) ? availableTeams : []}
                  getOptionLabel={(team) => team?.name || 'Unknown Team'}
                  loading={loadingTeams}
                  value={Array.isArray(availableTeams) ? availableTeams.find(team => team?.id === formState.selectedTeamId) || null : null}
                  onChange={(_, newValue) => {
                    setFormState(prev => ({ 
                      ...prev, 
                      selectedTeamId: newValue?.id || null 
                    }));
                  }}
                  noOptionsText={loadingTeams ? t('teamManagement:LOADING_TEAMS') : t('teamManagement:NO_TEAMS_AVAILABLE_FOR_TRANSFER')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t('teamManagement:SELECT_TEAM_PLACEHOLDER')}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingTeams && <LinearProgress />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, team) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                      <div className="flex items-center gap-3 w-full py-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-medium">
                          {team.name[0]}
                        </div>
                        <div className="flex-1">
                          <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                            {team.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {team?.memberCount || 0}/{team?.maxMembers || 0} {t('teamManagement:MEMBERS')} • {team?.leader?.firstName ? `${team.leader.firstName} ${team.leader.lastName}` : team?.leader?.username || 'Unknown'}
                          </Typography>
                        </div>
                      </div>
                      </Box>
                    );
                  }}
                />
              </div>

              {/* Amount Input */}
              <div>
                <Typography variant="body1" className="mb-3 font-medium text-gray-900 dark:text-white">
                  {t('teamManagement:TRANSFER_AMOUNT')} <span className="text-red-500">*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('teamManagement:AMOUNT_PLACEHOLDER')}
                  value={formState.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <IdeomniSvgIcon size={20} className="text-green-600 mr-2">
                        heroicons-solid:leaf
                      </IdeomniSvgIcon>
                    ),
                  }}
                  helperText={`${t('teamManagement:AVAILABLE_BALANCE')}: ${TeamTransferService.formatTransferAmount(teamAccount.carbon, TeamResourceType.CARBON)}`}
                />
              </div>

              {/* Description */}
              <div>
                <Typography variant="body1" className="mb-3 font-medium text-gray-900 dark:text-white">
                  {t('teamManagement:TRANSFER_DESCRIPTION')}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder={t('teamManagement:TRANSFER_DESCRIPTION_PLACEHOLDER')}
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  inputProps={{ maxLength: 200 }}
                  helperText={`${formState.description.length}/200 ${t('teamManagement:DESCRIPTION_CHAR_COUNT')}`}
                />
              </div>

              {/* Validation Messages */}
              {validationErrors.length > 0 && (
                <Alert severity="error">
                  <ul className="list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {validationWarnings.length > 0 && (
                <Alert severity="warning">
                  <ul className="list-disc list-inside">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {formState.error && (
                <Alert severity="error">
                  {formState.error}
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  variant="outlined"
                  onClick={() => router.push('/team-management/transfers')}
                  className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                >
                  {t('teamManagement:CANCEL_TRANSFER')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSubmit}
                  disabled={
                    !formState.selectedTeamId || 
                    !formState.amount || 
                    validationErrors.length > 0 ||
                    isTransferring
                  }
                  className="border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900"
                  startIcon={<IdeomniSvgIcon>heroicons-outline:paper-airplane</IdeomniSvgIcon>}
                >
                  {t('teamManagement:SEND_TRANSFER')}
                </Button>
              </div>
            </div>
          </Paper>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('teamManagement:TRANSFER_CONFIRMATION')}
        </DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            {t('teamManagement:REVIEW_TRANSFER_DETAILS')}
          </Typography>
          
          {confirmationData && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Typography variant="body2" color="text.secondary">
                  {t('teamManagement:TARGET_TEAM')}:
                </Typography>
                <Typography variant="body2" className="font-medium">
                  {confirmationData.targetTeam?.name}
                </Typography>
              </div>
              <div className="flex justify-between">
                <Typography variant="body2" color="text.secondary">
                  {t('teamManagement:AMOUNT')}:
                </Typography>
                <Typography variant="body2" className="font-medium text-green-600">
                  {TeamTransferService.formatTransferAmount(confirmationData.amount, TeamResourceType.CARBON)}
                </Typography>
              </div>
              {formState.description && (
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    {t('teamManagement:DESCRIPTION')}:
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {formState.description}
                  </Typography>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between mb-1">
                  <Typography variant="body2" color="text.secondary">
                    {t('teamManagement:CURRENT_BALANCE')}:
                  </Typography>
                  <Typography variant="body2">
                    {TeamTransferService.formatTransferAmount(confirmationData.currentBalance, TeamResourceType.CARBON)}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">
                    {t('teamManagement:BALANCE_AFTER_TRANSFER')}:
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {TeamTransferService.formatTransferAmount(confirmationData.balanceAfter, TeamResourceType.CARBON)}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowConfirmDialog(false)} 
            disabled={isTransferring}
          >
            {t('teamManagement:CANCEL_TRANSFER')}
          </Button>
          <Button 
            onClick={handleConfirmTransfer} 
            variant="contained"
            disabled={isTransferring}
          >
            {isTransferring ? t('teamManagement:SENDING_TRANSFER') : t('teamManagement:CONFIRM_TRANSFER')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CarbonTransferPage;