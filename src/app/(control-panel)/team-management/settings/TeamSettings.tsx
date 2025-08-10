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

// Validation schema
const schema = yup.object({
  name: yup
    .string()
    .required('Team name is required')
    .min(1, 'Team name must be at least 1 character')
    .max(50, 'Team name must be at most 50 characters'),
  description: yup
    .string()
    .optional()
    .max(200, 'Description must be at most 200 characters'),
  maxMembers: yup
    .number()
    .required('Maximum members is required')
    .min(2, 'Team must allow at least 2 members')
    .max(20, 'Team cannot have more than 20 members'),
  isOpen: yup.boolean().optional()
});

type FormData = yup.InferType<typeof schema>;

/**
 * Team Settings Component
 */
function TeamSettings() {
  const { t } = useTranslation(['teamManagement', 'common']);
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
    resolver: yupResolver(schema),
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
          Failed to load team settings. You may not be the team leader or the team may not exist.
        </Alert>
        <Button
          onClick={() => router.push('/team-management/dashboard')}
          className="mt-4"
        >
          Back to Dashboard
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
          Only team leaders can access team settings.
        </Alert>
        <Button
          onClick={() => router.push('/team-management/dashboard')}
          className="mt-4"
        >
          Back to Dashboard
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
                Back to Dashboard
              </Button>
            </div>
            <Typography variant="h3" className="font-semibold">
              Team Settings
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              Manage your team configuration and preferences
            </Typography>
          </motion.div>

          {/* Update Error Alert */}
          {updateError && (
            <motion.div variants={item}>
              <Alert severity="error">
                Failed to update team settings. Please try again.
              </Alert>
            </motion.div>
          )}

          {/* Settings Form */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                General Settings
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
                      label="Team Name"
                      placeholder="Enter team name"
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
                      label="Description"
                      placeholder="Describe your team's purpose and goals"
                      error={!!errors.description}
                      helperText={errors.description?.message || `${field.value?.length || 0}/200 characters`}
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
                    Maximum Members
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
                          Team will allow up to {maxMembersValue} members (currently has {currentMembersCount})
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
                            Open Team
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Allow others to discover and join your team
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
                    {isUpdating ? t('teamManagement:SAVING_CHANGES') : t('teamManagement:SAVE_CHANGES')}
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