'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Divider,
  InputAdornment,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Calculate as CalculateIcon,
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Inventory as InventoryIcon,
  Route as RouteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MtoType1Calculator } from '@/lib/utils/mtoType1Calculator';

interface TransportationEstimate {
  distance: number;
  baseRate: number;
  volumeMultiplier: number;
  totalFee: number;
  estimatedTime: number;
  route: string;
}

interface Props {
  onFeeCalculated?: (fee: number) => void;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultQuantity?: number;
}

const TransportationFeeCalculator: React.FC<Props> = ({
  onFeeCalculated,
  defaultOrigin = '',
  defaultDestination = '',
  defaultQuantity = 1
}) => {
  const { t } = useTranslation(['mto']);
  const calculator = new MtoType1Calculator();

  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [transportMode, setTransportMode] = useState<'standard' | 'express' | 'economy'>('standard');
  const [estimate, setEstimate] = useState<TransportationEstimate | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const transportModes = {
    economy: { multiplier: 0.7, time: 2, label: 'Economy (2x time, 30% cheaper)' },
    standard: { multiplier: 1.0, time: 1, label: 'Standard' },
    express: { multiplier: 1.5, time: 0.5, label: 'Express (2x faster, 50% more)' }
  };

  useEffect(() => {
    if (origin && destination && quantity > 0) {
      calculateFee();
    }
  }, [origin, destination, quantity, transportMode]);

  const calculateFee = () => {
    if (!origin || !destination || quantity <= 0) {
      setEstimate(null);
      return;
    }

    const distance = calculator.calculateDistance(origin, destination);
    const baseFee = calculator.calculateTransportationFee(distance, quantity);
    const modeMultiplier = transportModes[transportMode].multiplier;
    const totalFee = baseFee * modeMultiplier;

    const volumeMultiplier = Math.ceil(quantity / 100);
    const estimatedTime = distance * transportModes[transportMode].time;

    const newEstimate: TransportationEstimate = {
      distance: Math.round(distance * 10) / 10,
      baseRate: baseFee / volumeMultiplier,
      volumeMultiplier,
      totalFee: Math.round(totalFee * 100) / 100,
      estimatedTime: Math.round(estimatedTime),
      route: `${origin} → ${destination}`
    };

    setEstimate(newEstimate);

    if (onFeeCalculated) {
      onFeeCalculated(newEstimate.totalFee);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getDistanceColor = (distance: number) => {
    if (distance < 10) return 'success';
    if (distance < 50) return 'warning';
    return 'error';
  };

  const getFeeColor = (fee: number) => {
    if (fee < 100) return 'success';
    if (fee < 500) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <ShippingIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            {t('mto:mtoType1.transportation.calculator')}
          </Typography>
          <Tooltip title={t('mto:mtoType1.transportation.info')}>
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('mto:mtoType1.transportation.origin')}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g., tile-5-10"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('mto:mtoType1.transportation.destination')}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., tile-15-20"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography gutterBottom>
                {t('mto:mtoType1.transportation.quantity')}: {quantity}
              </Typography>
              <Slider
                value={quantity}
                onChange={(_, value) => setQuantity(value as number)}
                min={1}
                max={1000}
                step={10}
                marks={[
                  { value: 1, label: '1' },
                  { value: 250, label: '250' },
                  { value: 500, label: '500' },
                  { value: 750, label: '750' },
                  { value: 1000, label: '1000' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('mto:mtoType1.transportation.mode')}</InputLabel>
              <Select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as any)}
                label={t('mto:mtoType1.transportation.mode')}
              >
                <MenuItem value="economy">
                  <Box display="flex" alignItems="center">
                    <SpeedIcon sx={{ mr: 1 }} />
                    {transportModes.economy.label}
                  </Box>
                </MenuItem>
                <MenuItem value="standard">
                  <Box display="flex" alignItems="center">
                    <ShippingIcon sx={{ mr: 1 }} />
                    {transportModes.standard.label}
                  </Box>
                </MenuItem>
                <MenuItem value="express">
                  <Box display="flex" alignItems="center">
                    <SpeedIcon sx={{ mr: 1 }} />
                    {transportModes.express.label}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<CalculateIcon />}
              onClick={calculateFee}
              disabled={!origin || !destination || quantity <= 0}
            >
              {t('mto:mtoType1.transportation.calculate')}
            </Button>
          </Grid>
        </Grid>

        {estimate && (
          <>
            <Divider sx={{ my: 3 }} />

            <Paper elevation={0} sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2 }}>
              <Typography variant="h4" align="center" color="primary.contrastText">
                {formatCurrency(estimate.totalFee)}
              </Typography>
              <Typography variant="body2" align="center" color="primary.contrastText">
                {t('mto:mtoType1.transportation.totalFee')}
              </Typography>
            </Paper>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Box textAlign="center">
                  <Chip
                    icon={<RouteIcon />}
                    label={`${estimate.distance} units`}
                    color={getDistanceColor(estimate.distance)}
                    variant="outlined"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {t('mto:mtoType1.transportation.distance')}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box textAlign="center">
                  <Chip
                    icon={<InventoryIcon />}
                    label={`×${estimate.volumeMultiplier}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {t('mto:mtoType1.transportation.volumeMultiplier')}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box textAlign="center">
                  <Chip
                    icon={<MoneyIcon />}
                    label={formatCurrency(estimate.baseRate)}
                    color="secondary"
                    variant="outlined"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {t('mto:mtoType1.transportation.baseRate')}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box textAlign="center">
                  <Chip
                    icon={<SpeedIcon />}
                    label={`~${estimate.estimatedTime}h`}
                    color="info"
                    variant="outlined"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {t('mto:mtoType1.transportation.estimatedTime')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Calculation Details
              </Button>
            </Box>

            {showDetails && (
              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('mto:mtoType1.transportation.breakdown')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <RouteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Route"
                      secondary={estimate.route}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Distance calculation"
                      secondary={`√((x₂-x₁)² + (y₂-y₁)²) = ${estimate.distance} units`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Volume multiplier"
                      secondary={`ceil(${quantity} / 100) = ${estimate.volumeMultiplier}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Base fee"
                      secondary={`${estimate.distance} × 0.1 × ${estimate.volumeMultiplier} = ${formatCurrency(estimate.baseRate * estimate.volumeMultiplier)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Mode adjustment"
                      secondary={`${transportModes[transportMode].label}: ×${transportModes[transportMode].multiplier}`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={<Typography fontWeight="bold">Total</Typography>}
                      secondary={<Typography color="primary" fontWeight="bold">{formatCurrency(estimate.totalFee)}</Typography>}
                    />
                  </ListItem>
                </List>
              </Paper>
            )}

            {estimate.totalFee > 500 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {t('mto:mtoType1.transportation.highFeeWarning')}
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportationFeeCalculator;