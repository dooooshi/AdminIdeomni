'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogContent,
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Chip,
  IconButton,
  Paper,
  Slider,
  Stack,
  Fade,
  Grow
} from '@mui/material';
import {
  Close as CloseIcon,
  Factory as FactoryIcon,
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon,
  Nature as NatureIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { RawMaterial, ProductionEstimate } from '@/types/rawMaterialProduction';
import rawMaterialProductionService from '@/lib/services/rawMaterialProductionService';
import FacilitySelector from './FacilitySelector';

interface ProductionModalProps {
  open: boolean;
  onClose: () => void;
  material: RawMaterial | null;
  facilityId: string;
  onFacilityChange: (facilityId: string) => void;
  onSuccess?: (result: any) => void;
}

const QUICK_QUANTITIES = [1, 10, 50, 100, 500];

const ProductionModal: React.FC<ProductionModalProps> = ({
  open,
  onClose,
  material,
  facilityId,
  onFacilityChange,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<ProductionEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [producing, setProducing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open && material) {
      setQuantity(1);
      setEstimate(null);
      setError(null);
      setShowSuccess(false);
      if (facilityId) {
        loadEstimate(1);
      }
    }
  }, [open, material]);

  useEffect(() => {
    if (facilityId && material && quantity > 0) {
      loadEstimate(quantity);
    }
  }, [facilityId]);

  const loadEstimate = async (qty: number) => {
    if (!material || qty <= 0 || !facilityId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await rawMaterialProductionService.estimateProduction({
        facilityId,
        rawMaterialId: material.id,
        quantity: qty
      }, material);
      setEstimate(result);
    } catch (err: any) {
      setError(err.message || 'Failed to estimate production');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const qty = parseInt(value) || 0;
    setQuantity(qty);
    if (qty > 0) {
      loadEstimate(qty);
    }
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const qty = newValue as number;
    setQuantity(qty);
    loadEstimate(qty);
  };

  const adjustQuantity = (delta: number) => {
    const newQty = Math.max(1, quantity + delta);
    setQuantity(newQty);
    loadEstimate(newQty);
  };

  const handleProduce = async () => {
    if (!material || !estimate) return;

    setProducing(true);
    setError(null);
    try {
      const result = await rawMaterialProductionService.produceRawMaterial({
        facilityId,
        rawMaterialId: material.id,
        quantity
      }, material);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess?.(result);
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Production failed');
      }
    } catch (err: any) {
      setError(err.message || 'Production failed');
    } finally {
      setProducing(false);
    }
  };

  if (!material) return null;

  const waterRequired = (material.requirements?.water || material.waterRequired || 0) * quantity;
  const powerRequired = (material.requirements?.power || material.powerRequired || 0) * quantity;
  const goldRequired = (material.requirements?.gold || material.goldCost || 0) * quantity;
  const carbonEmission = material.carbonEmission * quantity;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 0.5
        }
      }}
    >
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}>
        {/* Header */}
        <Box 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={`#${material.materialNumber}`}
                  size="small"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                {material.origin && (
                  <Chip label={material.origin} size="small" variant="outlined" />
                )}
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {material.name}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Facility Selection */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'warning.light',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.08)',
                  border: 1,
                  borderColor: 'warning.main',
                  borderRadius: 2
                }}
              >
                <FacilitySelector
                  value={facilityId}
                  onChange={onFacilityChange}
                  facilityType={material?.origin}
                  disabled={producing}
                />
              </Paper>
            </Grid>

            {/* Quantity Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.default',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t('production.quantity')}
                </Typography>
                
                {/* Quantity Input with Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <IconButton 
                    onClick={() => adjustQuantity(-10)}
                    disabled={quantity <= 1 || producing}
                    color="primary"
                    sx={{ border: 1, borderColor: 'divider' }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <TextField
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    type="number"
                    inputProps={{ 
                      min: 1,
                      style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }
                    }}
                    disabled={producing}
                    sx={{ 
                      width: 150,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                  
                  <IconButton 
                    onClick={() => adjustQuantity(10)}
                    disabled={producing}
                    color="primary"
                    sx={{ border: 1, borderColor: 'divider' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                {/* Slider */}
                <Box sx={{ px: 2, mb: 2 }}>
                  <Slider
                    value={quantity}
                    onChange={handleSliderChange}
                    min={1}
                    max={1000}
                    disabled={producing}
                    sx={{
                      '& .MuiSlider-thumb': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      },
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }
                    }}
                  />
                </Box>

                {/* Quick Select Buttons */}
                <Stack direction="row" spacing={1}>
                  {QUICK_QUANTITIES.map((qty) => (
                    <Chip
                      key={qty}
                      label={qty}
                      onClick={() => {
                        setQuantity(qty);
                        loadEstimate(qty);
                      }}
                      variant={quantity === qty ? "filled" : "outlined"}
                      color="primary"
                      clickable
                      disabled={producing}
                    />
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Resource Requirements */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {t('production.requirements')}
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterIcon color="primary" />
                      <Typography variant="body2">{t('production.water')}</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {waterRequired.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PowerIcon color="warning" />
                      <Typography variant="body2">{t('production.power')}</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {powerRequired.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon color="success" />
                      <Typography variant="body2">{t('production.gold')}</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {goldRequired.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NatureIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t('production.carbonEmission')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {carbonEmission.toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Cost Summary */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {t('production.costBreakdown')}
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : estimate ? (
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('production.quantity')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {quantity}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('production.costPerUnit')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${estimate.costs.costPerUnit?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t('production.totalCost')}:
                      </Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold"
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        ${estimate.costs.totalCost.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                ) : null}
              </Paper>
            </Grid>

            {/* Success Message */}
            <Fade in={showSuccess}>
              <Grid item xs={12}>
                <Alert severity="success" icon={<CheckIcon />}>
                  {t('production.success')}
                </Alert>
              </Grid>
            </Fade>

            {/* Error Display */}
            {error && (
              <Grow in={!!error}>
                <Grid item xs={12}>
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                </Grid>
              </Grow>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={onClose} 
                  disabled={producing}
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleProduce}
                  variant="contained"
                  disabled={!estimate || producing || quantity <= 0 || !facilityId}
                  size="large"
                  sx={{ 
                    minWidth: 150,
                    background: producing ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b4ca0 100%)'
                    }
                  }}
                  startIcon={producing ? <CircularProgress size={20} color="inherit" /> : <FactoryIcon />}
                >
                  {producing ? t('production.producing') : t('production.produce')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default ProductionModal;