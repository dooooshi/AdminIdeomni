'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Stack,
  Container
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { useProductProduction } from '@/hooks/useProductProduction';
import {
  FactorySelector,
  FormulaSelector,
  ProductionQuantityInput,
  CostCalculationDisplay
} from '@/components/product-production';

const ProductProductionPage = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const {
    // State
    factories,
    formulas,
    selectedFactory,
    selectedFormula,
    quantity,
    costData,
    
    // Loading states
    loadingFactories,
    loadingFormulas,
    calculatingCost,
    producing,
    
    // Errors
    factoriesError,
    formulasError,
    costError,
    productionError,
    
    // Actions
    setSelectedFactory,
    setSelectedFormula,
    setQuantity,
    startProduction
  } = useProductProduction();

  const steps = [
    t('productProduction.selectFactory'),
    t('productProduction.selectFormula'),
    t('productProduction.setQuantity'),
    t('productProduction.reviewCosts'),
    t('productProduction.confirmProduction')
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStartProduction = async () => {
    const success = await startProduction();
    if (success) {
      setShowSuccessMessage(true);
      setActiveStep(0);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  };

  const canProceedToNext = () => {
    switch (activeStep) {
      case 0:
        return selectedFactory !== null;
      case 1:
        return selectedFormula !== null;
      case 2:
        return quantity > 0;
      case 3:
        return costData?.validation?.canProduce || false;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FactorySelector
            factories={factories}
            selectedFactory={selectedFactory}
            onSelectFactory={(factory) => {
              setSelectedFactory(factory);
              if (factory) handleNext();
            }}
            loading={loadingFactories}
            error={factoriesError}
          />
        );
      
      case 1:
        return (
          <FormulaSelector
            formulas={formulas}
            selectedFormula={selectedFormula}
            selectedFactory={selectedFactory}
            onSelectFormula={(formula) => {
              setSelectedFormula(formula);
              if (formula) handleNext();
            }}
          />
        );
      
      case 2:
        return (
          <ProductionQuantityInput
            quantity={quantity}
            onQuantityChange={setQuantity}
            selectedFactory={selectedFactory}
            selectedFormula={selectedFormula}
          />
        );
      
      case 3:
      case 4:
        return (
          <CostCalculationDisplay
            costData={costData}
            loading={calculatingCost}
            error={costError}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('productProduction.title')}
        </Typography>
        
        {showSuccessMessage && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            onClose={() => setShowSuccessMessage(false)}
            sx={{ mb: 3 }}
          >
            {t('productProduction.productionSuccessful')}
          </Alert>
        )}
        
        {productionError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {productionError}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent()}
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'space-between' }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<BackIcon />}
            >
              {t('productProduction.back')}
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartProduction}
                  disabled={!canProceedToNext() || producing}
                  startIcon={producing ? <CircularProgress size={20} /> : <StartIcon />}
                >
                  {producing ? t('productProduction.processing') : t('productProduction.startProduction')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  endIcon={<NextIcon />}
                >
                  {t('productProduction.next')}
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProductProductionPage;