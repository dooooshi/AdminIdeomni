'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useCreateTeamMutation } from '../TeamApi';
import { CreateTeamRequest } from 'src/types/team';

// Validation schema factory
const createSchema = (t: (key: string) => string) => yup.object({
  name: yup
    .string()
    .required(t('teamManagement:TEAM_NAME_REQUIRED'))
    .min(1, t('teamManagement:TEAM_NAME_MIN_LENGTH'))
    .max(50, t('teamManagement:TEAM_NAME_MAX_LENGTH')),
  description: yup
    .string()
    .optional()
    .max(200, t('teamManagement:DESCRIPTION_MAX_LENGTH')),
  maxMembers: yup
    .number()
    .required(t('teamManagement:MAX_MEMBERS_REQUIRED'))
    .min(2, t('teamManagement:MIN_MEMBERS'))
    .max(20, t('teamManagement:MAX_MEMBERS_LIMIT')),
  isOpen: yup.boolean().optional()
});

type FormData = yup.InferType<typeof schema>;

/**
 * Create Team Component
 */
function CreateTeam() {
  const { t } = useTranslation();
  const router = useRouter();
  const [createTeam, { isLoading, error }] = useCreateTeamMutation();
  
  const schema = createSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
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

  const onSubmit = async (data: FormData) => {
    try {
      const teamData: CreateTeamRequest = {
        name: data.name,
        description: data.description || undefined,
        maxMembers: data.maxMembers,
        isOpen: data.isOpen
      };

      await createTeam(teamData).unwrap();
      router.push('/team-management/dashboard');
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
                onClick={() => router.back()}
                startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
              >
                {t('teamManagement:BACK')}
              </Button>
            </div>
            <Typography variant="h3" className="font-semibold">
              {t('teamManagement:CREATE_NEW_TEAM')}
            </Typography>
            <Typography color="text.secondary" className="mt-2">
              {t('teamManagement:CREATE_TEAM_SUBTITLE')}
            </Typography>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div variants={item}>
              <Alert severity="error">
                {t('teamManagement:FAILED_TO_CREATE_TEAM')}
              </Alert>
            </motion.div>
          )}

          {/* Form */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Team Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('teamManagement:TEAM_NAME')}
                      placeholder={t('teamManagement:TEAM_NAME_PLACEHOLDER')}
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
                      label={t('teamManagement:DESCRIPTION_OPTIONAL')}
                      placeholder={t('teamManagement:DESCRIPTION_PLACEHOLDER')}
                      error={!!errors.description}
                      helperText={errors.description?.message || `${field.value?.length || 0}/200 ${t('teamManagement:DESCRIPTION_CHAR_COUNT')}`}
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
                    {t('teamManagement:MAXIMUM_MEMBERS')}
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
                          {t('teamManagement:TEAM_WILL_ALLOW')} {maxMembersValue} {t('teamManagement:MEMBERS')}
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
                            {t('teamManagement:OPEN_TEAM')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('teamManagement:OPEN_TEAM_DESCRIPTION')}
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
                    disabled={isLoading}
                    startIcon={<IdeomniSvgIcon>heroicons-outline:plus</IdeomniSvgIcon>}
                    fullWidth
                  >
                    {isLoading ? t('teamManagement:CREATING_TEAM') : t('teamManagement:CREATE_TEAM')}
                  </Button>
                </div>
              </form>
            </Paper>
          </motion.div>

          {/* Info Card */}
          <motion.div variants={item}>
            <Paper className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <IdeomniSvgIcon className="text-blue-600 mt-1">
                  heroicons-outline:information-circle
                </IdeomniSvgIcon>
                <div>
                  <Typography variant="subtitle2" className="mb-1">
                    {t('teamManagement:TEAM_CREATION_GUIDELINES')}
                  </Typography>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>{t('teamManagement:GUIDELINE_ONE_TEAM')}</li>
                    <li>{t('teamManagement:GUIDELINE_AUTO_LEADER')}</li>
                    <li>{t('teamManagement:GUIDELINE_UNIQUE_NAME')}</li>
                    <li>{t('teamManagement:GUIDELINE_CHANGE_SETTINGS')}</li>
                  </ul>
                </div>
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateTeam;