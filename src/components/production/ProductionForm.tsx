'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  InputAdornment,
  Slider
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Water as WaterIcon,
  Power as PowerIcon,
  AccountBalance as GoldIcon,
  Cloud as CarbonIcon
} from '@mui/icons-material';
import { ProductionRequest, RawMaterial, ProductionEstimate } from '@/types/rawMaterialProduction';
import rawMaterialProductionService from '@/lib/services/rawMaterialProductionService';
import RawMaterialSelector from './RawMaterialSelector';

interface ProductionFormProps {
  facilityId: string;
  facilityType: string;
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

const ProductionForm: React.FC<ProductionFormProps> = ({
  facilityId,
  facilityType,
  onSuccess,
  onCancel
}) => {
  const { t } = useTranslation();
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [quantity, setQuantity] = useState<number>(10);
  const [estimate, setEstimate] = useState<ProductionEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleQuantityChange = async (value: number) => {
    setQuantity(value);
    if (selectedMaterial) {
      await getEstimate(selectedMaterial.id, value);
    }
  };

  const handleMaterialSelect = async (material: RawMaterial) => {
    setSelectedMaterial(material);
    await getEstimate(material.id, quantity);
  };

  const getEstimate = async (materialId: number, qty: number) => {
    setEstimating(true);
    try {
      const result = await rawMaterialProductionService.estimateProduction({
        facilityId,
        rawMaterialId: materialId,
        quantity: qty
      });
      setEstimate(result);
    } catch (error) {
      console.error('Failed to get estimate:', error);
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMaterial) {
      setError(t('production.selectMaterialFirst'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const request: ProductionRequest = {
        facilityId,
        rawMaterialId: selectedMaterial.id,
        quantity
      };

      const result = await rawMaterialProductionService.produceRawMaterial(request);

      if (result.success) {
        setSuccess(t('production.success'));
        if (onSuccess) onSuccess(result);
      } else {
        setError(result.error || t('production.failed'));
      }
    } catch (error: any) {
      setError(error.message || t('production.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('production.startProduction')}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <RawMaterialSelector
          selectedMaterial={selectedMaterial || undefined}
          onSelect={handleMaterialSelect}
          facilityType={facilityType}
          disabled={loading}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>
          {t('production.quantity')}: {quantity}
        </Typography>
        <Slider
          value={quantity}
          onChange={(_, value) => handleQuantityChange(value as number)}
          min={1}
          max={500}
          step={1}
          marks={[
            { value: 1, label: '1' },
            { value: 100, label: '100' },
            { value: 250, label: '250' },
            { value: 500, label: '500' }
          ]}
          valueLabelDisplay="auto"
          disabled={loading || !selectedMaterial}
        />
      </Box>

      {estimate && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            {t('production.estimate')}
          </Typography>

          {estimating ? (
            <CircularProgress size={24} />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WaterIcon color={estimate.requirements.water.available ? 'primary' : 'disabled'} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('production.water')}
                  </Typography>
                  <Typography variant="body2">
                    {estimate.requirements.water.needed} @ {estimate.requirements.water.unitPrice}/unit
                  </Typography>
                  <Typography variant="caption" color={estimate.requirements.water.available ? 'success.main' : 'error.main'}>
                    {estimate.requirements.water.available ? t('common.available') : t('common.unavailable')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PowerIcon color={estimate.requirements.power.available ? 'primary' : 'disabled'} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('production.power')}
                  </Typography>
                  <Typography variant="body2">
                    {estimate.requirements.power.needed} @ {estimate.requirements.power.unitPrice}/unit
                  </Typography>
                  <Typography variant="caption" color={estimate.requirements.power.available ? 'success.main' : 'error.main'}>
                    {estimate.requirements.power.available ? t('common.available') : t('common.unavailable')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GoldIcon color={estimate.requirements.funds.sufficient ? 'primary' : 'disabled'} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('production.totalCost')}
                  </Typography>
                  <Typography variant="body2">
                    {estimate.costs.totalCost}
                  </Typography>
                  <Typography variant="caption" color={estimate.requirements.funds.sufficient ? 'success.main' : 'error.main'}>
                    {t('production.fundsAvailable')}: {estimate.requirements.funds.available}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CarbonIcon color={estimate.requirements.space.sufficient ? 'primary' : 'disabled'} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('production.spaceRequired')}
                  </Typography>
                  <Typography variant="body2">
                    {estimate.requirements.space.needed}
                  </Typography>
                  <Typography variant="caption" color={estimate.requirements.space.sufficient ? 'success.main' : 'error.main'}>
                    {t('production.spaceAvailable')}: {estimate.requirements.space.available}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {estimate.issues.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('production.issues')}:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {estimate.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading ||
            !selectedMaterial ||
            !estimate ||
            !estimate.feasible
          }
          startIcon={loading ? <CircularProgress size={20} /> : <FactoryIcon />}
        >
          {loading ? t('production.producing') : t('production.produce')}
        </Button>
      </Box>
    </Paper>
  );
};

export default ProductionForm;