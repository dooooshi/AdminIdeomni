'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useLogin, useAuth } from '../hooks';
import { UserLoginRequest } from '../types';
import { getDefaultDashboardPath } from '../redirects';
import { showMessage } from '@ideomni/core/IdeomniMessage/IdeomniMessageSlice';
import { useAppDispatch } from 'src/store/hooks';
import { extractErrorMessage } from '../utils';

// Form validation schema
const createSchema = (t: (key: string) => string) => z.object({
  identifier: z.string().nonempty(t('auth:EMAIL_REQUIRED')),
  password: z.string().min(6, t('auth:PASSWORD_TOO_SHORT')).nonempty(t('auth:PASSWORD_REQUIRED')),
});

// Base schema for type inference
const baseSchema = z.object({
  identifier: z.string().nonempty(),
  password: z.string().min(6).nonempty(),
});

type FormType = z.infer<typeof baseSchema>;

const defaultValues: FormType = {
  identifier: '',
  password: '',
};

interface UserSignInFormProps {
  onSuccess?: () => void;
}

export default function UserSignInForm({ onSuccess }: UserSignInFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userLogin, isLoading, error, clearError } = useLogin();
  const { userType, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Create schema with translations
  const schema = createSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormType) => {
    try {
      clearError();
      
      const credentials: UserLoginRequest = {
        identifier: data.identifier.trim(),
        password: data.password.trim(),
      };

      await userLogin(credentials);
      
      // Show success notification
      dispatch(showMessage({
        message: t('auth:SIGNIN_SUCCESS'),
        variant: 'success',
        autoHideDuration: 4000,
      }));
      
      // Reset form
      reset();
      
      // Call success callback or redirect to role-based dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        // Use role-based redirect - redirect to home which will handle role-based routing
        router.push('/');
      }
    } catch (err: any) {
      console.error('User login error:', err);
      
      // Show error notification
      const errorMessage = extractErrorMessage(err, 'Login failed');
      
      dispatch(showMessage({
        message: errorMessage,
        variant: 'error',
        autoHideDuration: 6000,
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      {/* Identifier Field */}
      <Controller
        name="identifier"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={t('auth:EMAIL')}
            placeholder="username or email"
            variant="outlined"
            fullWidth
            error={!!errors.identifier}
            helperText={errors.identifier?.message}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IdeomniSvgIcon size={20} color="action">
                    heroicons-outline:user
                  </IdeomniSvgIcon>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Password Field */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={t('auth:PASSWORD')}
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IdeomniSvgIcon size={20} color="action">
                    heroicons-outline:lock-closed
                  </IdeomniSvgIcon>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    disabled={isLoading}
                  >
                    <IdeomniSvgIcon size={20}>
                      {showPassword ? 'heroicons-outline:eye-slash' : 'heroicons-outline:eye'}
                    </IdeomniSvgIcon>
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={!isValid || isLoading}
        className="mt-6"
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <IdeomniSvgIcon size={20}>heroicons-outline:login</IdeomniSvgIcon>
          )
        }
      >
        {isLoading ? t('auth:SIGNING_IN') : t('auth:SIGN_IN')}
      </Button>
    </Box>
  );
} 