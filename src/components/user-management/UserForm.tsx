'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,

  Divider,
  Chip,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  VpnKey as VpnKeyIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import UserService, { 
  AdminUserDetailsDto, 
  AdminCreateUserDto, 
  AdminUpdateUserDto 
} from '@/lib/services/userService';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: AdminUserDetailsDto | null;
  onSuccess: (user: AdminUserDetailsDto) => void;
}

interface UserFormValues extends Omit<AdminCreateUserDto, 'sendWelcomeEmail'> {
  confirmPassword: string;
  sendWelcomeEmail: boolean;
}

const availableRoles = [
  'admin',
  'moderator',
  'viewer',
  'editor',
  'analyst',
];

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  user,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const isEditMode = Boolean(user);

  // Validation schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, t('userManagement.USERNAME_MIN_LENGTH'))
      .max(50, t('userManagement.USERNAME_MAX_LENGTH'))
      .matches(/^[a-zA-Z0-9_]+$/, t('userManagement.USERNAME_INVALID_CHARS'))
      .required(t('userManagement.USERNAME_REQUIRED')),
    
    email: Yup.string()
      .email(t('userManagement.EMAIL_INVALID'))
      .required(t('userManagement.EMAIL_REQUIRED')),
    
    password: isEditMode 
      ? Yup.string()
          .min(6, t('userManagement.PASSWORD_MIN_LENGTH'))
      : Yup.string()
          .min(6, t('userManagement.PASSWORD_MIN_LENGTH'))
          .required(t('userManagement.PASSWORD_REQUIRED')),
    
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('userManagement.PASSWORD_MISMATCH')),
    
    firstName: Yup.string()
      .max(100, t('userManagement.FIRST_NAME_MAX_LENGTH')),
    
    lastName: Yup.string()
      .max(100, t('userManagement.LAST_NAME_MAX_LENGTH')),
    
    userType: Yup.number()
      .oneOf([1, 2, 3], t('userManagement.USER_TYPE_INVALID'))
      .required(t('userManagement.USER_TYPE_REQUIRED')),
    
    isActive: Yup.boolean(),
    
    roles: Yup.array().of(Yup.string()),
    
    sendWelcomeEmail: Yup.boolean(),
  });

  const formik = useFormik<UserFormValues>({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      userType: user?.userType || 3,
      isActive: user?.isActive ?? true,
      roles: user?.roles || [],
      sendWelcomeEmail: !isEditMode,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        if (isEditMode && user) {
          // Edit mode - only send changed fields
          const updateData: AdminUpdateUserDto = {};
          
          if (values.firstName !== user.firstName) updateData.firstName = values.firstName;
          if (values.lastName !== user.lastName) updateData.lastName = values.lastName;
          if (values.email !== user.email) updateData.email = values.email;
          if (values.userType !== user.userType) updateData.userType = values.userType;
          if (values.isActive !== user.isActive) updateData.isActive = values.isActive;
          if (JSON.stringify(values.roles) !== JSON.stringify(user.roles)) updateData.roles = values.roles;

          const updatedUser = await UserService.updateUser(user.id, updateData);
          
          // Handle password reset separately if provided
          if (values.password) {
            await UserService.resetUserPassword(user.id, {
              generateTemporary: false,
              requireChange: false,
              sendEmail: false,
            });
          }
          
          onSuccess(updatedUser);
        } else {
          // Create mode
          const createData: AdminCreateUserDto = {
            username: values.username,
            email: values.email,
            password: values.password,
            firstName: values.firstName || undefined,
            lastName: values.lastName || undefined,
            userType: values.userType,
            isActive: values.isActive,
            roles: values.roles && values.roles.length > 0 ? values.roles : undefined,
            sendWelcomeEmail: values.sendWelcomeEmail,
          };

          const newUser = await UserService.createUser(createData);
          onSuccess(newUser);
        }

        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('userManagement.USER_CREATE_ERROR'));
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    setActiveStep(0);
    setError(null);
    formik.resetForm();
    onClose();
  };

  const nextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getUserTypeIcon = (userType: number) => {
    switch (userType) {
      case 1: return <BusinessIcon />;
      case 2: return <WorkIcon />;
      case 3: return <SchoolIcon />;
      default: return <PersonIcon />;
    }
  };

  const getUserTypeDescription = (userType: number) => {
    switch (userType) {
      case 1: return t('userManagement.MANAGER_DESCRIPTION');
      case 2: return t('userManagement.WORKER_DESCRIPTION');
      case 3: return t('userManagement.STUDENT_DESCRIPTION');
      default: return '';
    }
  };

  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return !formik.errors.username && !formik.errors.email && formik.values.username && formik.values.email;
      case 1: // Password
        return isEditMode || (!formik.errors.password && !formik.errors.confirmPassword && formik.values.password);
      case 2: // User Type & Permissions
        return !formik.errors.userType && formik.values.userType;
      default:
        return true;
    }
  };

  const steps = [
    {
      label: t('userManagement.USER_FORM_BASIC_INFO'),
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="username"
              label={t('userManagement.USERNAME_LABEL')}
              placeholder={t('userManagement.USERNAME_PLACEHOLDER')}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              disabled={loading || isEditMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            {isEditMode && (
              <Typography variant="caption" color="text.secondary">
                {t('userManagement.USERNAME_EDIT_HINT')}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="email"
              label={t('userManagement.EMAIL_LABEL')}
              placeholder={t('userManagement.EMAIL_PLACEHOLDER')}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="firstName"
              label={t('userManagement.FIRST_NAME_LABEL')}
              placeholder={t('userManagement.FIRST_NAME_PLACEHOLDER')}
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="lastName"
              label={t('userManagement.LAST_NAME_LABEL')}
              placeholder={t('userManagement.LAST_NAME_PLACEHOLDER')}
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              disabled={loading}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: t('userManagement.PASSWORD_LABEL'),
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={t('userManagement.PASSWORD_LABEL')}
              placeholder={t('userManagement.PASSWORD_PLACEHOLDER')}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={
                formik.touched.password && formik.errors.password ||
                (isEditMode ? t('userManagement.PASSWORD_EDIT_HINT') : '')
              }
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {!isEditMode && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('userManagement.CONFIRM_PASSWORD_LABEL')}
                placeholder={t('userManagement.CONFIRM_PASSWORD_PLACEHOLDER')}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
        </Grid>
      ),
    },
    {
      label: t('userManagement.USER_FORM_PERMISSIONS'),
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('userManagement.USER_TYPE_LABEL')}</InputLabel>
              <Select
                name="userType"
                value={formik.values.userType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.userType && Boolean(formik.errors.userType)}
                label={t('userManagement.USER_TYPE_LABEL')}
                disabled={loading}
              >
                {UserService.getUserTypeOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getUserTypeIcon(option.value)}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getUserTypeDescription(option.value)}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.userType && formik.errors.userType && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {formik.errors.userType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={availableRoles}
              value={formik.values.roles}
              onChange={(_, newValue) => formik.setFieldValue('roles', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('userManagement.ROLES_LABEL')}
                  placeholder={t('userManagement.ROLES_PLACEHOLDER')}
                  helperText={t('userManagement.ROLES_HELP')}
                />
              )}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isActive}
                  onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                  disabled={loading}
                />
              }
              label={t('userManagement.IS_ACTIVE_LABEL')}
            />
          </Grid>

          {!isEditMode && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.sendWelcomeEmail}
                    onChange={(e) => formik.setFieldValue('sendWelcomeEmail', e.target.checked)}
                    disabled={loading}
                  />
                }
                label={t('userManagement.SEND_WELCOME_EMAIL')}
              />
            </Grid>
          )}
        </Grid>
      ),
    },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isEditMode ? t('userManagement.USER_FORM_EDIT_TITLE') : t('userManagement.USER_FORM_CREATE_TITLE')}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {isEditMode && user && (
          <Typography variant="body2" color="text.secondary">
            {t('USER_FORM_EDITING_INFO', { username: user.username, email: user.email })}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 2 }}>
                  {step.content}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? () => formik.handleSubmit() : nextStep}
                    disabled={!canProceedToNextStep() || loading}
                    sx={{ mt: 1, mr: 1 }}
                    startIcon={loading && <CircularProgress size={16} />}
                  >
                    {index === steps.length - 1 
                      ? (loading ? t('userManagement.SAVING') : (isEditMode ? t('userManagement.UPDATE') : t('userManagement.CREATE')))
                      : t('userManagement.CONTINUE')
                    }
                  </Button>
                  {index > 0 && (
                    <Button
                      onClick={prevStep}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={loading}
                    >
                      {t('userManagement.BACK')}
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('userManagement.CANCEL')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm; 