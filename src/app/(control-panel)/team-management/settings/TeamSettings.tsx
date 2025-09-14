'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { 
  useGetCurrentTeamQuery, 
  useUpdateTeamMutation 
} from '../TeamApi';
import { UpdateTeamRequest } from 'src/types/team';

type FormData = {
  name: string;
  description?: string;
  maxMembers: number;
  isOpen?: boolean;
};

/**
 * Team Settings Component
 */
function TeamSettings() {
  const { t } = useTranslation();
  
  // Validation schema - must be inside component to access t function
  const schema = yup.object({
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
      .min(2, t('teamManagement.TEAM_MIN_MEMBERS'))
      .max(20, t('teamManagement.TEAM_MAX_MEMBERS')),
    isOpen: yup.boolean().optional()
  });
  const router = useRouter();
  
  const { data: team, isLoading: teamLoading, error: teamError } = useGetCurrentTeamQuery();
  const [updateTeam, { isLoading: isUpdating, error: updateError }] = useUpdateTeamMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      description: '',
      maxMembers: 4,
      isOpen: true
    }
  });

  const maxMembersValue = watch('maxMembers');
  const currentMembersCount = team?.members.filter(m => m.status === 'ACTIVE').length || 0;

  // Update form when team data loads
  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description || '',
        maxMembers: team.maxMembers,
        isOpen: team.isOpen
      });
    }
  }, [team, reset]);

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (teamLoading) {
    return <IdeomniLoading />;
  }

  if (teamError || !team) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8">
        <Alert severity="error">
          {t('teamManagement.FAILED_TO_LOAD_TEAM_SETTINGS')}
        </Alert>
        <Button
          onClick={() => router.push('/team-management/dashboard')}
          className="mt-4"
        >
          {t('teamManagement.BACK_TO_DASHBOARD')}
        </Button>
      </div>
    );
  }

  // Check if user is team leader
  const isLeader = team.leader.id === team.members.find(m => m.status === 'ACTIVE')?.user.id;
  
  if (!isLeader) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8">
        <Alert severity="warning">
          {t('teamManagement.ONLY_TEAM_LEADERS_CAN_ACCESS')}
        </Alert>
        <Button
          onClick={() => router.push('/team-management/dashboard')}
          className="mt-4"
        >
          {t('teamManagement.BACK_TO_DASHBOARD')}
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      const updateData: UpdateTeamRequest = {
        name: data.name !== team.name ? data.name : undefined,
        description: data.description !== (team.description || '') ? data.description : undefined,
        maxMembers: data.maxMembers !== team.maxMembers ? data.maxMembers : undefined,
        isOpen: data.isOpen !== team.isOpen ? data.isOpen : undefined
      };

      // Only send fields that have changed
      const hasChanges = Object.values(updateData).some(value => value !== undefined);
      
      if (hasChanges) {
        await updateTeam(updateData).unwrap();
        router.push('/team-management/dashboard');
      }
    } catch (err) {
      console.error('Failed to update team:', err);
    }
  };


  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="text"
                onClick={() => router.push('/team-management/dashboard')}
                startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
              >
                {t('teamManagement.BACK_TO_DASHBOARD')}
              </Button>
            </div>
            <Typography variant="h3" className="font-semibold">
              {t('teamManagement.TEAM_SETTINGS')}
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              {t('teamManagement.MANAGE_TEAM_CONFIG')}
            </Typography>
          </motion.div>

          {/* Update Error Alert */}
          {updateError && (
            <motion.div variants={item}>
              <Alert severity="error">
                {t('teamManagement.FAILED_TO_UPDATE_TEAM_SETTINGS')}
              </Alert>
            </motion.div>
          )}

          {/* Settings Form */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamManagement.GENERAL_SETTINGS')}
              </Typography>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Team Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('teamManagement.TEAM_NAME')}
                      placeholder={t('teamManagement.ENTER_TEAM_NAME')}
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
                      label={t('teamManagement.DESCRIPTION')}
                      placeholder={t('teamManagement.DESCRIBE_TEAM_PURPOSE')}
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
                          min={Math.max(2, currentMembersCount)} // Cannot go below current member count
                          max={20}
                          step={1}
                          marks={[
                            { value: Math.max(2, currentMembersCount), label: String(Math.max(2, currentMembersCount)) },
                            { value: 5, label: '5' },
                            { value: 10, label: '10' },
                            { value: 15, label: '15' },
                            { value: 20, label: '20' }
                          ]}
                        />
                        <Typography variant="body2" color="text.secondary" className="mt-2">
                          {t('teamManagement.TEAM_WILL_ALLOW')} {maxMembersValue} {t('teamManagement.MEMBERS')} ({t('teamManagement.CURRENT')}: {currentMembersCount})
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
                            {t('teamManagement.ALLOW_OTHERS_TO_JOIN')}
                          </Typography>
                        </div>
                      }
                    />
                  )}
                />

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isUpdating || !isDirty}
                    startIcon={<IdeomniSvgIcon>heroicons-outline:check</IdeomniSvgIcon>}
                    fullWidth
                  >
                    {isUpdating ? t('teamManagement.SAVING_CHANGES') : t('teamManagement.SAVE_CHANGES')}
                  </Button>
                </div>
              </form>
            </Paper>
          </motion.div>

        </motion.div>
      </div>

    </div>
  );
}

export default TeamSettings;