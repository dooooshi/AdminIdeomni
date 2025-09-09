'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon
} from '@mui/icons-material';
import MaterialSelector from './MaterialSelector';
import CraftCategorySelector from './CraftCategorySelector';
import CostCalculatorPanel from './CostCalculatorPanel';
import { 
  MaterialRequirement, 
  ProductFormulaCraftCategory,
  CreateProductFormulaDto 
} from '@/lib/types/productFormula';
import ProductFormulaService from '@/lib/services/productFormulaService';

interface CreateFormulaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateFormulaModal: React.FC<CreateFormulaModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState<MaterialRequirement[]>([]);
  const [craftCategories, setCraftCategories] = useState<ProductFormulaCraftCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const steps = [
    t('productFormula.steps.basicInfo'),
    t('productFormula.steps.materials'),
    t('productFormula.steps.craftCategories'),
    t('productFormula.steps.review')
  ];

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: string[] = [];

    switch (step) {
      case 0:
        if (!productName || productName.trim().length === 0) {
          stepErrors.push(t('productFormula.productNameRequired'));
        }
        if (productName && productName.length > 200) {
          stepErrors.push(t('productFormula.productNameTooLong'));
        }
        if (description && description.length > 500) {
          stepErrors.push(t('productFormula.descriptionTooLong'));
        }
        break;
      case 1:
        if (materials.length === 0) {
          stepErrors.push(t('productFormula.noMaterials'));
        }
        if (materials.length > 99) {
          stepErrors.push(t('productFormula.tooManyMaterials'));
        }
        break;
      case 2:
        if (craftCategories.length === 0) {
          stepErrors.push(t('productFormula.noCraftCategories'));
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const formulaData: CreateProductFormulaDto = {
        productName: productName.trim(),
        productDescription: description || undefined,
        materials: materials.map(m => ({
          rawMaterialId: m.rawMaterialId,
          quantity: m.quantity
        })),
        craftCategories: craftCategories.map(cc => ({
          craftCategoryId: cc.craftCategoryId
        }))
      };

      const validationErrors = ProductFormulaService.validateFormula(formulaData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      await ProductFormulaService.createProductFormula(formulaData);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create formula:', error);
      setErrors([error.message || t('productFormula.createFailed')]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setProductName('');
    setDescription('');
    setMaterials([]);
    setCraftCategories([]);
    setErrors([]);
    onClose();
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              required
              label={t('productFormula.productName')}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t('productFormula.productNamePlaceholder')}
              helperText={t('productFormula.productNameHelper')}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('productFormula.description')}
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('productFormula.descriptionPlaceholder')}
              helperText={t('productFormula.descriptionHelper')}
            />
          </Box>
        );
      case 1:
        return (
          <MaterialSelector
            materials={materials}
            onChange={setMaterials}
          />
        );
      case 2:
        return (
          <CraftCategorySelector
            craftCategories={craftCategories}
            onChange={setCraftCategories}
          />
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('productFormula.reviewFormula')}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('productFormula.productName')}:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {productName}
              </Typography>
            </Box>

            {description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('productFormula.description')}:
                </Typography>
                <Typography variant="body1">
                  {description}
                </Typography>
              </Box>
            )}

            {/* Materials List */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                {t('productFormula.materials')} ({materials.length})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {materials.length > 0 ? (
                  <Stack spacing={1}>
                    {materials.map((material, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="body2">
                          {material.rawMaterial?.name || `Material ID: ${material.rawMaterialId}`}
                        </Typography>
                        <Chip 
                          label={`Qty: ${material.quantity}`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('productFormula.noMaterials')}
                  </Typography>
                )}
              </Paper>
            </Box>

            {/* Craft Categories List */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                {t('productFormula.craftCategories')} ({craftCategories.length})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {craftCategories.length > 0 ? (
                  <Stack spacing={1}>
                    {craftCategories.map((category, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 1,
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="body2">
                          {category.craftCategory?.name || `Category ID: ${category.craftCategoryId}`}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('productFormula.noCraftCategories')}
                  </Typography>
                )}
              </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            <CostCalculatorPanel
              materials={materials}
              craftCategories={craftCategories}
            />
          </Box>
        );
      default:
        return null;
    }
  };

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
        {t('productFormula.createNewFormula')}
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} startIcon={<CancelIcon />}>
          {t('common.cancel')}
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} startIcon={<BackIcon />}>
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
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {t('productFormula.create')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateFormulaModal;