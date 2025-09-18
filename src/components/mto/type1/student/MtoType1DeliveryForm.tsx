'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import {
  MtoType1TeamView,
  MtoType1DeliveryRequest
} from '@/lib/types/mtoType1';
import MtoType1Service from '@/lib/services/mtoType1Service';
import { enqueueSnackbar } from 'notistack';

interface MtoType1DeliveryFormProps {
  requirement: MtoType1TeamView;
  onSave: () => void;
  onCancel: () => void;
}

interface TileDelivery {
  tileId: string;
  quantity: number;
  transportationCost: number;
  distance: number;
  facilitySpaceId?: number;
}

const MtoType1DeliveryForm: React.FC<MtoType1DeliveryFormProps> = ({
  requirement,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTile, setSelectedTile] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [facilitySpaceId, setFacilitySpaceId] = useState<number | undefined>();
  const [transportationCost, setTransportationCost] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calculatingCost, setCalculatingCost] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedTile && quantity > 0) {
      calculateTransportationCost();
    }
  }, [selectedTile, quantity]);

  const calculateTransportationCost = async () => {
    if (!selectedTile || quantity <= 0) return;

    setCalculatingCost(true);
    try {
      // This would need the actual from tile (team's facility location)
      // For now using a mock calculation
      const result = await MtoType1Service.calculateTransportationCost(
        'team-facility-tile', // This should be actual team facility tile
        selectedTile,
        quantity
      );
      setTransportationCost(result.cost);
      setDistance(result.distance);
    } catch (error) {
      console.error('Failed to calculate transportation cost:', error);
      // Use estimated cost from requirement data
      const tile = requirement.availableTiles?.find(t => t.tileId === selectedTile);
      if (tile) {
        setTransportationCost(tile.transportationCost * quantity);
        setDistance(tile.distance);
      }
    } finally {
      setCalculatingCost(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedTile) {
      newErrors.tile = t('mto.student.validation.tileRequired');
    }

    if (quantity <= 0) {
      newErrors.quantity = t('mto.student.validation.invalidQuantity');
    }

    const tile = requirement.availableTiles?.find(t => t.tileId === selectedTile);
    if (tile && quantity > tile.remaining) {
      newErrors.quantity = t('mto.student.validation.exceedsRemaining', {
        max: tile.remaining
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const deliveryData: MtoType1DeliveryRequest = {
        requirementId: requirement.requirementId,
        tileId: selectedTile,
        productQuantity: quantity,
        facilitySpaceId
      };

      await MtoType1Service.createDelivery(deliveryData);
      enqueueSnackbar(t('mto.student.messages.deliveryCreated'), { variant: 'success' });
      onSave();
    } catch (error: any) {
      console.error('Failed to create delivery:', error);
      const message = error.response?.data?.message || t('mto.student.errors.deliveryFailed');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const calculateRevenue = () => {
    return quantity * requirement.unitPrice;
  };

  const calculateProfit = () => {
    return calculateRevenue() - transportationCost;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('$', '');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('mto.student.createDelivery')}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('mto.student.deliveryInfo', {
          requirement: requirement.requirementName || `#${requirement.requirementId}`,
          price: formatCurrency(requirement.unitPrice)
        })}
      </Alert>

      <Box component="form" noValidate>
        <Stack spacing={3}>
          {/* Tile Selection */}
          <FormControl fullWidth error={!!errors.tile}>
            <InputLabel>{t('mto.student.selectTile')}</InputLabel>
            <Select
              value={selectedTile}
              label={t('mto.student.selectTile')}
              onChange={(e) => {
                setSelectedTile(e.target.value);
                if (errors.tile) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.tile;
                    return newErrors;
                  });
                }
              }}
              startAdornment={
                <InputAdornment position="start">
                  <LocationIcon />
                </InputAdornment>
              }
            >
              {requirement.availableTiles?.map((tile) => (
                <MenuItem key={tile.tileId} value={tile.tileId}>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <Typography>{t('mto.student.tile', { id: tile.tileId })}</Typography>
                    <Chip
                      label={t('mto.student.remaining', { count: tile.remaining })}
                      size="small"
                      color={tile.remaining > 0 ? 'success' : 'default'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {t('mto.student.distance', { km: tile.distance })}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {errors.tile && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.tile}
              </Typography>
            )}
          </FormControl>

          {/* Quantity Input */}
          <TextField
            fullWidth
            type="number"
            label={t('mto.student.quantity')}
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value) || 0);
              if (errors.quantity) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.quantity;
                  return newErrors;
                });
              }
            }}
            error={!!errors.quantity}
            helperText={errors.quantity || t('mto.student.quantityHelper')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InventoryIcon />
                </InputAdornment>
              ),
              endAdornment: selectedTile && (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    {t('mto.student.maxQuantity', {
                      max: requirement.availableTiles?.find(t => t.tileId === selectedTile)?.remaining || 0
                    })}
                  </Typography>
                </InputAdornment>
              )
            }}
          />

          {/* Facility Space (Optional) */}
          <TextField
            fullWidth
            type="number"
            label={t('mto.student.facilitySpaceId')}
            value={facilitySpaceId || ''}
            onChange={(e) => setFacilitySpaceId(parseInt(e.target.value) || undefined)}
            helperText={t('mto.student.facilitySpaceHelper')}
          />

          {/* Cost Calculation */}
          {selectedTile && quantity > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <CalculateIcon color="primary" />
                <Typography variant="h6">{t('mto.student.costCalculation')}</Typography>
                {calculatingCost && <CircularProgress size={20} />}
              </Stack>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>{t('mto.student.unitPrice')}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(requirement.unitPrice)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('mto.student.quantity')}</TableCell>
                      <TableCell align="right">{quantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('mto.student.revenue')}</TableCell>
                      <TableCell align="right">
                        <Typography color="success.main">
                          {formatCurrency(calculateRevenue())}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('mto.student.transportationCost')}</TableCell>
                      <TableCell align="right">
                        <Typography color="error.main">
                          -{formatCurrency(transportationCost)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {t('mto.student.estimatedProfit')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={calculateProfit() > 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(calculateProfit())}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {distance > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {t('mto.student.transportDistance', { km: distance })}
                </Typography>
              )}
            </Paper>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={saving || !selectedTile || quantity <= 0}
            >
              {t('mto.student.submitDelivery')}
            </Button>
          </Stack>

          {/* Warning */}
          <Alert severity="warning" icon={<InfoIcon />}>
            {t('mto.student.deliveryWarning')}
          </Alert>
        </Stack>
      </Box>
    </Paper>
  );
};

export default MtoType1DeliveryForm;