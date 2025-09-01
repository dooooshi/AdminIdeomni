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
  IconButton,
  Fade,
  Collapse,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Factory as FactoryIcon,
  Water as WaterIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircleOutline as CheckIcon
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

const PRESET_AMOUNTS = [10, 50, 100, 500];

const ProductionModal: React.FC<ProductionModalProps> = ({
  open,
  onClose,
  material,
  facilityId,
  onFacilityChange,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<ProductionEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [producing, setProducing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open && material) {
      setQuantity(10);
      setEstimate(null);
      setError(null);
      setShowSuccess(false);
      if (facilityId) {
        loadEstimate(10);
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
      setError(err.message || t('production.failed'));
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
        setError(result.message || t('production.failed'));
      }
    } catch (err: any) {
      setError(err.message || t('production.failed'));
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
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Minimalist Header */}
      <Box 
        sx={{ 
          px: 4,
          py: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.5, fontSize: '0.7rem' }}>
              {t('production.material').toUpperCase()} #{material.materialNumber}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 300, mt: 0.5 }}>
              {material.name}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'action.hover' 
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Loading Progress */}
      {loading && (
        <LinearProgress 
          sx={{ 
            height: 1,
            bgcolor: 'transparent'
          }} 
        />
      )}

      <DialogContent sx={{ px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Facility Selection - Simplified */}
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 1.5,
                display: 'block'
              }}
            >
              {t('production.productionFacility')}
            </Typography>
            <FacilitySelector
              value={facilityId}
              onChange={onFacilityChange}
              facilityType={material?.origin}
              disabled={producing}
            />
          </Box>

          {/* Quantity Control - Minimalist Design */}
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 2,
                display: 'block'
              }}
            >
              {t('production.quantity')}
            </Typography>
            
            {/* Main Quantity Controls */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 3
              }}
            >
              <IconButton 
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1 || producing}
                size="large"
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'text.primary',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <RemoveIcon />
              </IconButton>
              
              <TextField
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                type="number"
                inputProps={{ 
                  min: 1,
                  style: { 
                    textAlign: 'center', 
                    fontSize: '2rem', 
                    fontWeight: 200 
                  }
                }}
                disabled={producing}
                sx={{ 
                  width: 160,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'divider',
                      borderRadius: 2
                    },
                    '&:hover fieldset': {
                      borderColor: 'text.primary'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'text.primary',
                      borderWidth: 1
                    }
                  }
                }}
              />
              
              <IconButton 
                onClick={() => adjustQuantity(1)}
                disabled={producing}
                size="large"
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'text.primary',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* Preset Amounts */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => {
                    setQuantity(amount);
                    loadEstimate(amount);
                  }}
                  variant={quantity === amount ? "contained" : "outlined"}
                  size="small"
                  disabled={producing}
                  sx={{ 
                    minWidth: 60,
                    borderRadius: 2,
                    borderColor: 'divider',
                    color: quantity === amount ? 'white' : 'text.primary',
                    bgcolor: quantity === amount ? 'text.primary' : 'transparent',
                    '&:hover': {
                      borderColor: 'text.primary',
                      bgcolor: quantity === amount ? 'text.secondary' : 'action.hover'
                    }
                  }}
                >
                  {amount}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Expected Cost Display - Prominent */}
          {estimate && (
            <Box 
              sx={{ 
                p: 3,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('production.expectedCost')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 300, mt: 1 }}>
                ${estimate.costs.totalCost.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {t('production.quantity')}: {quantity} × ${estimate.costs.costPerUnit?.toFixed(2) || '0.00'} = ${estimate.costs.totalCost.toFixed(2)}
              </Typography>
            </Box>
          )}

          {/* Resources & Costs - Clean Grid Layout */}
          {estimate && (
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 2,
                  display: 'block'
                }}
              >
                {t('production.requirementsCosts')}
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 3,
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}
              >
                {/* Resources */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('production.requirements')}</Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WaterIcon sx={{ fontSize: 18, color: 'info.main' }} />
                    <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                      {t('production.water')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {waterRequired.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PowerIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                    <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                      {t('production.power')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {powerRequired.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MoneyIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                      {t('production.gold')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {goldRequired.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Cost Breakdown */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('production.costBreakdown')}</Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                      {t('production.waterCost')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${estimate.costs.waterCost?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                      {t('production.powerCost')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${estimate.costs.powerCost?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
                      {t('production.materialCost')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${estimate.costs.materialBaseCost?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Carbon Footprint - Subtle */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mt: 2,
                  color: 'text.secondary'
                }}
              >
                <EcoIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {t('production.carbonEmission')}: {carbonEmission.toFixed(2)} {t('production.units')}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Success Message */}
          <Collapse in={showSuccess}>
            <Alert 
              severity="success" 
              icon={<CheckIcon />}
              sx={{ 
                borderRadius: 2,
                bgcolor: 'success.light',
                '& .MuiAlert-icon': {
                  color: 'success.main'
                }
              }}
            >
              {t('production.successMessage')}
            </Alert>
          </Collapse>

          {/* Error Display */}
          <Collapse in={!!error}>
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ 
                borderRadius: 2,
                bgcolor: 'error.light',
                '& .MuiAlert-icon': {
                  color: 'error.main'
                }
              }}
            >
              {error}
            </Alert>
          </Collapse>

          {/* Action Buttons - Clean and Simple */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'flex-end',
              pt: 2
            }}
          >
            <Button 
              onClick={onClose} 
              disabled={producing}
              size="large"
              sx={{ 
                px: 4,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleProduce}
              variant="contained"
              disabled={!estimate || producing || quantity <= 0 || !facilityId}
              size="large"
              sx={{ 
                px: 4,
                bgcolor: 'text.primary',
                color: 'background.paper',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'text.secondary',
                  boxShadow: 'none'
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground'
                }
              }}
              startIcon={producing ? <CircularProgress size={18} color="inherit" /> : <FactoryIcon />}
            >
              {producing ? t('production.processing') : t('production.produce')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionModal;