'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useCreateTeamMutation } from '../TeamApi';
import { CreateTeamRequest } from 'src/types/team';

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Validation schema factory
const createSchema = (t: (key: string) => string) => yup.object({
  name: yup
    .string()
    .required(t('teamManagement.TEAM_NAME_REQUIRED'))
    .min(1, t('teamManagement.TEAM_NAME_MIN_LENGTH'))
    .max(50, t('teamManagement.TEAM_NAME_MAX_LENGTH')),
  description: yup
    .string()
    .optional()
    .max(200, t('teamManagement.DESCRIPTION_MAX_LENGTH')),
  maxMembers: yup
    .number()
    .required(t('teamManagement.MAX_MEMBERS_REQUIRED'))
    .min(2, t('teamManagement.MIN_MEMBERS'))
    .max(20, t('teamManagement.MAX_MEMBERS_LIMIT')),
  isOpen: yup.boolean().optional()
});

type FormData = yup.InferType<ReturnType<typeof createSchema>>;

/**
 * Create Team Modal Component
 */
function CreateTeamModal({ open, onClose, onSuccess }: CreateTeamModalProps) {
  const { t } = useTranslation();
  const [createTeam, { isLoading, error }] = useCreateTeamMutation();
  
  const schema = createSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      maxMembers: 4,
      isOpen: true
    }
  });

  const maxMembersValue = watch('maxMembers');

  const onSubmit = async (data: FormData) => {
    try {
      const teamData: CreateTeamRequest = {
        name: data.name,
        description: data.description || undefined,
        maxMembers: data.maxMembers,
        isOpen: data.isOpen
      };

      await createTeam(teamData).unwrap();
      reset(); // Reset form after successful creation
      onSuccess?.(); // Call success callback
      onClose(); // Close modal
    } catch (err: any) {
      console.error('Failed to create team:', {
        status: err?.status,
        data: err?.data,
        error: err?.error,
        message: err?.message,
        fullError: err
      });
    }
  };

  const handleClose = () => {
    reset(); // Reset form when closing
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'rounded-lg'
      }}
    >
      <DialogTitle>
        <div>
          <Typography variant="h6" className="font-semibold">
            {t('teamManagement.CREATE_NEW_TEAM')}
          </Typography>
          <Typography color="text.secondary" variant="body2" className="mt-1">
            {t('teamManagement.CREATE_TEAM_SUBTITLE')}
          </Typography>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        <form className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert severity="error">
              {t('teamManagement.FAILED_TO_CREATE_TEAM')}
            </Alert>
          )}

          {/* Team Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('teamManagement.TEAM_NAME')}
                placeholder={t('teamManagement.TEAM_NAME_PLACEHOLDER')}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <IdeomniSvgIcon className="mr-2">
                      heroicons-outline:user-group
                    </IdeomniSvgIcon>
                  )
                }}
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={3}
                label={t('teamManagement.DESCRIPTION_OPTIONAL')}
                placeholder={t('teamManagement.DESCRIPTION_PLACEHOLDER')}
                error={!!errors.description}
                helperText={errors.description?.message || `${field.value?.length || 0}/200 ${t('teamManagement.DESCRIPTION_CHAR_COUNT')}`}
                InputProps={{
                  startAdornment: (
                    <IdeomniSvgIcon className="mr-2 self-start mt-3">
                      heroicons-outline:document-text
                    </IdeomniSvgIcon>
                  )
                }}
              />
            )}
          />

          {/* Max Members */}
          <div>
            <Typography variant="subtitle1" className="mb-2">
              {t('teamManagement.MAXIMUM_MEMBERS')}
            </Typography>
            <Controller
              name="maxMembers"
              control={control}
              render={({ field }) => (
                <div className="px-3">
                  <Slider
                    {...field}
                    min={2}
                    max={20}
                    step={1}
                    marks={[
                      { value: 2, label: '2' },
                      { value: 5, label: '5' },
                      { value: 10, label: '10' },
                      { value: 15, label: '15' },
                      { value: 20, label: '20' }
                    ]}
                  />
                  <Typography variant="body2" color="text.secondary" className="mt-2">
                    {t('teamManagement.TEAM_WILL_ALLOW')} {maxMembersValue} {t('teamManagement.MEMBERS')}
                  </Typography>
                </div>
              )}
            />
          </div>

          {/* Is Open */}
          <Controller
            name="isOpen"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label={
                  <div>
                    <Typography variant="body1">
                      {t('teamManagement.OPEN_TEAM')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('teamManagement.OPEN_TEAM_DESCRIPTION')}
                    </Typography>
                  </div>
                }
              />
            )}
          />

          {/* Team Creation Guidelines */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <IdeomniSvgIcon className="text-blue-600 mt-1">
                heroicons-outline:information-circle
              </IdeomniSvgIcon>
              <div>
                <Typography variant="subtitle2" className="mb-1">
                  {t('teamManagement.TEAM_CREATION_GUIDELINES')}
                </Typography>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>{t('teamManagement.GUIDELINE_ONE_TEAM')}</li>
                  <li>{t('teamManagement.GUIDELINE_AUTO_LEADER')}</li>
                  <li>{t('teamManagement.GUIDELINE_UNIQUE_NAME')}</li>
                  <li>{t('teamManagement.GUIDELINE_CHANGE_SETTINGS')}</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>

      <DialogActions className="p-6">
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
        >
          {t('common.CANCEL')}
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
          startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
        >
          {isLoading ? t('teamManagement.CREATING_TEAM') : t('teamManagement.CREATE_TEAM')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateTeamModal;