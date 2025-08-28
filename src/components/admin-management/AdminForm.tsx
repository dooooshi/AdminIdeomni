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
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Shield as ShieldIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AdminService, { Admin, CreateAdminRequest, UpdateAdminRequest } from '@/lib/services/adminService';

interface AdminFormProps {
  open: boolean;
  onClose: () => void;
  admin?: Admin | null; // If provided, this is edit mode
  onSuccess: (admin: Admin) => void;
}

interface AdminFormValues {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  adminType: 1 | 2;
  isActive: boolean;
}

const AdminForm: React.FC<AdminFormProps> = ({
  open,
  onClose,
  admin,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(admin);

  // Validation schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, t('adminManagement.USERNAME_MIN_LENGTH'))
      .max(50, t('adminManagement.USERNAME_MAX_LENGTH'))
      .matches(/^[a-zA-Z0-9_]+$/, t('adminManagement.USERNAME_INVALID_CHARS'))
      .required(t('adminManagement.USERNAME_REQUIRED')),
    
    email: Yup.string()
      .email(t('adminManagement.EMAIL_INVALID'))
      .required(t('adminManagement.EMAIL_REQUIRED')),
    
    password: isEditMode 
      ? Yup.string() // Password optional in edit mode
      : Yup.string()
          .min(6, t('adminManagement.PASSWORD_MIN_LENGTH'))
          .required(t('adminManagement.PASSWORD_REQUIRED')),
    
    firstName: Yup.string()
      .max(100, t('adminManagement.FIRST_NAME_MAX_LENGTH')),
    
    lastName: Yup.string()
      .max(100, t('adminManagement.LAST_NAME_MAX_LENGTH')),
    
    adminType: Yup.number()
      .oneOf([1, 2], t('adminManagement.ADMIN_TYPE_INVALID'))
      .required(t('adminManagement.ADMIN_TYPE_REQUIRED')),
    
    isActive: Yup.boolean(),
  });

  const formik = useFormik<AdminFormValues>({
    initialValues: {
      username: admin?.username || '',
      email: admin?.email || '',
      password: '',
      firstName: admin?.firstName || '',
      lastName: admin?.lastName || '',
      adminType: admin?.adminType || 2,
      isActive: admin?.isActive ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        if (isEditMode && admin) {
          // Edit mode - only send changed fields
          const updateData: UpdateAdminRequest = {};
          
          if (values.username !== admin.username) updateData.username = values.username;
          if (values.email !== admin.email) updateData.email = values.email;
          if (values.firstName !== admin.firstName) updateData.firstName = values.firstName;
          if (values.lastName !== admin.lastName) updateData.lastName = values.lastName;
          if (values.adminType !== admin.adminType) updateData.adminType = values.adminType;
          if (values.isActive !== admin.isActive) updateData.isActive = values.isActive;

          const updatedAdmin = await AdminService.updateAdmin(admin.id, updateData);
          onSuccess(updatedAdmin);
        } else {
          // Create mode
          const createData: CreateAdminRequest = {
            username: values.username,
            email: values.email,
            password: values.password,
            firstName: values.firstName || undefined,
            lastName: values.lastName || undefined,
            adminType: values.adminType,
          };

          const newAdmin = await AdminService.createAdmin(createData);
          onSuccess(newAdmin);
        }

        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('adminManagement.ADMIN_CREATE_ERROR'));
      } finally {
        setLoading(false);
      }
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      formik.resetForm();
    }
  }, [open, admin]);

  const handleClose = () => {
    if (!loading) {
      formik.resetForm();
      setError(null);
      onClose();
    }
  };

  const getAdminTypeInfo = (type: 1 | 2) => {
    if (type === 1) {
      return {
        name: t('adminManagement.SUPER_ADMIN'),
        description: t('adminManagement.SUPER_ADMIN_DESCRIPTION'),
        icon: <ShieldIcon />,
        color: 'error' as const,
      };
    }
    return {
      name: t('adminManagement.LIMITED_ADMIN'),
      description: t('adminManagement.LIMITED_ADMIN_DESCRIPTION'),
      icon: <PersonIcon />,
      color: 'primary' as const,
    };
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {isEditMode ? t('adminManagement.ADMIN_FORM_EDIT_TITLE') : t('adminManagement.ADMIN_FORM_CREATE_TITLE')}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
        {isEditMode && admin && (
          <Typography variant="body2" color="text.secondary">
            {t('adminManagement.ADMIN_FORM_EDITING_INFO', { username: admin.username, email: admin.email })}
          </Typography>
        )}
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                {t('adminManagement.ADMIN_FORM_BASIC_INFO')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('adminManagement.USERNAME_LABEL')}
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                required
                autoComplete="username"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('adminManagement.EMAIL_LABEL')}
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                required
                autoComplete="email"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('adminManagement.FIRST_NAME_LABEL')}
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                autoComplete="given-name"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('adminManagement.LAST_NAME_LABEL')}
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                autoComplete="family-name"
              />
            </Grid>

            {/* Password */}
            {(!isEditMode || formik.values.password) && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={isEditMode ? t('adminManagement.PASSWORD_LABEL') + " " + t('adminManagement.PASSWORD_EDIT_HINT') : t('adminManagement.PASSWORD_LABEL')}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  required={!isEditMode}
                  autoComplete={isEditMode ? "new-password" : "new-password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={t('adminManagement.TOGGLE_PASSWORD_VISIBILITY')}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            {/* Admin Configuration */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
                {t('adminManagement.ADMIN_TYPE_LABEL')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>{t('adminManagement.ADMIN_TYPE_LABEL')}</InputLabel>
                <Select
                  name="adminType"
                  value={formik.values.adminType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.adminType && Boolean(formik.errors.adminType)}
                  label={t('adminManagement.ADMIN_TYPE_LABEL')}
                >
                  <MenuItem value={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      <Box>
                        <Typography variant="body1">{t('adminManagement.LIMITED_ADMIN')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('adminManagement.LIMITED_ADMIN_DESCRIPTION')}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShieldIcon color="error" />
                      <Box>
                        <Typography variant="body1">{t('adminManagement.SUPER_ADMIN')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('adminManagement.SUPER_ADMIN_DESCRIPTION')}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {/* Admin Type Info */}
              {formik.values.adminType && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={getAdminTypeInfo(formik.values.adminType).icon}
                    label={getAdminTypeInfo(formik.values.adminType).name}
                    color={getAdminTypeInfo(formik.values.adminType).color}
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                    {getAdminTypeInfo(formik.values.adminType).description}
                  </Typography>
                </Box>
              )}
            </Grid>

            {isEditMode && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formik.values.isActive}
                      onChange={formik.handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">
                        {t('adminManagement.IS_ACTIVE_LABEL')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formik.values.isActive 
                          ? t('adminManagement.ACTIVE')
                          : t('adminManagement.INACTIVE')}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            )}

            {/* Warnings */}
            {formik.values.adminType === 1 && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning">
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    {t('adminManagement.SECURITY_WARNING')}
                  </Typography>
                  <Typography variant="body2">
                    {t('adminManagement.SUPER_ADMIN_WARNING')}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            color="inherit"
          >
            {t('adminManagement.CANCEL_BUTTON')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formik.isValid}
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {loading 
              ? t('adminManagement.LOADING')
              : (isEditMode ? t('adminManagement.UPDATE_ADMIN_BUTTON') : t('adminManagement.CREATE_ADMIN_BUTTON'))
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminForm; 