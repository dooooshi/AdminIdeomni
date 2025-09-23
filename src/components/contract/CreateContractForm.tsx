'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,

  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { contractService } from '@/lib/services/contractService';
import { CreateContractRequest, CONTRACT_VALIDATION } from '@/types/contract';
import TeamSelector from './TeamSelector';
import ContractPreview from './ContractPreview';

interface CreateContractFormProps {
  userTeamId?: string;
}

const CreateContractForm: React.FC<CreateContractFormProps> = ({ userTeamId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<CreateContractRequest>({
    title: '',
    content: '',
    teamIds: []
  });
  
  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const steps = [
    t('contract.CONTRACT_INFO'),
    t('contract.SELECT_TEAMS'),
    t('contract.PREVIEW')
  ];

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate title
    if (!formData.title) {
      errors.title = t('contract.TITLE_REQUIRED');
    } else if (formData.title.length < CONTRACT_VALIDATION.title.minLength) {
      errors.title = t('contract.TITLE_TOO_SHORT');
    } else if (formData.title.length > CONTRACT_VALIDATION.title.maxLength) {
      errors.title = t('contract.TITLE_TOO_LONG');
    }
    
    // Validate content
    if (!formData.content) {
      errors.content = t('contract.CONTENT_REQUIRED');
    } else if (formData.content.length < CONTRACT_VALIDATION.content.minLength) {
      errors.content = t('contract.CONTENT_TOO_SHORT');
    } else if (formData.content.length > CONTRACT_VALIDATION.content.maxLength) {
      errors.content = t('contract.CONTENT_TOO_LONG');
    }
    
    // Validate teams
    if (formData.teamIds.length < CONTRACT_VALIDATION.teams.minCount - 1) {
      errors.teams = t('contract.TEAMS_REQUIRED');
    } else if (formData.teamIds.length > CONTRACT_VALIDATION.teams.maxCount - 1) {
      errors.teams = t('contract.TOO_MANY_TEAMS');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Contract Info
        if (!formData.title) {
          errors.title = t('contract.TITLE_REQUIRED');
        } else if (formData.title.length < CONTRACT_VALIDATION.title.minLength) {
          errors.title = t('contract.TITLE_TOO_SHORT');
        } else if (formData.title.length > CONTRACT_VALIDATION.title.maxLength) {
          errors.title = t('contract.TITLE_TOO_LONG');
        }
        
        if (!formData.content) {
          errors.content = t('contract.CONTENT_REQUIRED');
        } else if (formData.content.length < CONTRACT_VALIDATION.content.minLength) {
          errors.content = t('contract.CONTENT_TOO_SHORT');
        } else if (formData.content.length > CONTRACT_VALIDATION.content.maxLength) {
          errors.content = t('contract.CONTENT_TOO_LONG');
        }
        break;
        
      case 1: // Select Teams
        if (formData.teamIds.length < CONTRACT_VALIDATION.teams.minCount - 1) {
          errors.teams = t('contract.TEAMS_REQUIRED');
        } else if (formData.teamIds.length > CONTRACT_VALIDATION.teams.maxCount - 1) {
          errors.teams = t('contract.TOO_MANY_TEAMS');
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await contractService.createContract(formData);
      
      // Show success message
      // Navigate to contract detail
      router.push(`/contract-management/${response.contractId}`);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_CREATE_CONTRACT'));
      console.error('Failed to create contract:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/contract-management');
  };

  // Handle input change
  const handleInputChange = (field: keyof CreateContractRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Contract Info
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('contract.CONTRACT_INFO')}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('contract.TITLE')}
                  placeholder={t('contract.TITLE_PLACEHOLDER')}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!validationErrors.title}
                  helperText={
                    validationErrors.title || 
                    `${formData.title.length}/${CONTRACT_VALIDATION.title.maxLength}`
                  }
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  label={t('contract.CONTENT')}
                  placeholder={t('contract.CONTENT_PLACEHOLDER')}
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  error={!!validationErrors.content}
                  helperText={
                    validationErrors.content || 
                    `${formData.content.length}/${CONTRACT_VALIDATION.content.maxLength}`
                  }
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1: // Select Teams
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('contract.SELECT_TEAMS')}
            </Typography>
            
            {validationErrors.teams && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.teams}
              </Alert>
            )}
            
            <TeamSelector
              selectedTeamIds={formData.teamIds}
              onChange={(teamIds) => handleInputChange('teamIds', teamIds)}
              userTeamId={userTeamId}
              maxTeams={CONTRACT_VALIDATION.teams.maxCount - 1}
            />
            
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              {t('contract.MIN_TEAMS_REQUIRED')} • {t('contract.MAX_TEAMS_EXCEEDED')}
            </Typography>
          </Box>
        );
        
      case 2: // Preview
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('contract.PREVIEW_CONTRACT')}
            </Typography>
            
            <ContractPreview
              title={formData.title}
              content={formData.content}
              teamIds={formData.teamIds}
              userTeamId={userTeamId}
            />
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Actions */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          startIcon={<CancelIcon />}
        >
          {t('common.cancel')}
        </Button>
        
        <Box display="flex" gap={2}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              {t('common.back')}
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NextIcon />}
            >
              {t('common.next')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {submitting ? t('contract.CREATING_CONTRACT') : t('contract.SUBMIT_CONTRACT')}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateContractForm;
