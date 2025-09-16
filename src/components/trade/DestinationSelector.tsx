'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Skeleton,
  Radio,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Warehouse as WarehouseIcon,
  Factory as FactoryIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import Grid2 from '@mui/material/GridLegacy';
import { motion, AnimatePresence } from 'motion/react';
import { DestinationOption, TradeOrder, TradePreviewResponse } from '@/types/trade';
import TradeService from '@/lib/services/tradeService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface DestinationSelectorProps {
  open: boolean;
  onClose: () => void;
  trade: TradeOrder | null;
  onDestinationSelected: (
    destinationId: string,
    preview: TradePreviewResponse
  ) => void;
}

/**
 * Destination Selector Component
 * Allows receivers to choose where they want traded items delivered
 * Shows available facilities with space and calculates transport costs
 */
export default function DestinationSelector({
  open,
  onClose,
  trade,
  onDestinationSelected
}: DestinationSelectorProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [preview, setPreview] = useState<TradePreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available destinations when dialog opens
  useEffect(() => {
    if (open && trade) {
      fetchDestinations();
    }
  }, [open, trade]);

  // Preview cost when destination changes
  useEffect(() => {
    if (selectedDestination && trade) {
      previewTradeCost();
    }
  }, [selectedDestination, trade]);

  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);

    try {
      const options = await TradeService.getTeamDestinationOptions();
      setDestinations(options);

      // Auto-select first option if available
      if (options.length > 0) {
        setSelectedDestination(options[0].inventoryId);
      }
    } catch (err: any) {
      console.error('Failed to fetch destinations:', err);
      setError('Failed to load available facilities');
    } finally {
      setLoading(false);
    }
  };

  const previewTradeCost = async () => {
    if (!trade || !selectedDestination) return;

    setPreviewLoading(true);
    setError(null);

    try {
      const result = await TradeService.previewTrade(trade.id, selectedDestination);
      setPreview(result);
    } catch (err: any) {
      console.error('Failed to preview trade:', err);
      setError('Failed to calculate transport cost');
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedDestination && preview) {
      onDestinationSelected(selectedDestination, preview);
    }
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'WAREHOUSE':
        return <WarehouseIcon />;
      case 'FACTORY':
        return <FactoryIcon />;
      default:
        return <StorageIcon />;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'success';
    if (utilization < 80) return 'warning';
    return 'error';
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown';
    return `${distance} tiles`;
  };

  const selectedDestinationDetails = useMemo(() => {
    return destinations.find(d => d.inventoryId === selectedDestination);
  }, [destinations, selectedDestination]);

  if (!trade) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Choose Destination for Trade Items
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box py={3}>
            <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={100} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : destinations.length === 0 ? (
          <Alert severity="warning">
            No facilities with available space found. Please free up space in your facilities first.
          </Alert>
        ) : (
          <Box>
            {/* Facility Selection */}
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
              >
                <Grid2 container spacing={2}>
                  {destinations.map((dest) => (
                    <Grid2 item xs={12} key={dest.inventoryId}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          sx={{
                            border: selectedDestination === dest.inventoryId
                              ? `2px solid ${theme.palette.primary.main}`
                              : '1px solid',
                            borderColor: selectedDestination === dest.inventoryId
                              ? 'primary.main'
                              : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                          onClick={() => setSelectedDestination(dest.inventoryId)}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="flex-start">
                              <FormControlLabel
                                value={dest.inventoryId}
                                control={<Radio />}
                                label=""
                                sx={{ mr: 2 }}
                              />

                              <Box flex={1}>
                                <Box display="flex" alignItems="center" mb={1}>
                                  {getFacilityIcon(dest.facilityType)}
                                  <Typography variant="h6" sx={{ ml: 1 }}>
                                    {dest.facilityName}
                                  </Typography>
                                  <Chip
                                    label={dest.facilityType}
                                    size="small"
                                    sx={{ ml: 'auto' }}
                                  />
                                </Box>

                                <Grid2 container spacing={2}>
                                  <Grid2 item xs={6}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                      <LocationIcon fontSize="small" color="action" />
                                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                                        Location: ({dest.location.q}, {dest.location.r})
                                      </Typography>
                                    </Box>
                                  </Grid2>
                                  <Grid2 item xs={6}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                      <StorageIcon fontSize="small" color="action" />
                                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                                        Available: {dest.availableSpace.toLocaleString()} units
                                      </Typography>
                                    </Box>
                                  </Grid2>
                                </Grid2>

                                <Box mt={1}>
                                  <Typography variant="caption" color="text.secondary">
                                    Utilization
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={dest.currentUtilization}
                                    sx={{
                                      height: 8,
                                      borderRadius: 1,
                                      bgcolor: 'grey.200',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: getUtilizationColor(dest.currentUtilization)
                                      }
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {dest.currentUtilization.toFixed(1)}% used
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid2>
                  ))}
                </Grid2>
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Cost Preview */}
            {selectedDestination && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Cost Breakdown
                </Typography>

                {previewLoading ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={32} />
                  </Box>
                ) : preview ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1">Items Cost:</Typography>
                          <Typography variant="h6">
                            {preview.itemsCost.toLocaleString()} gold
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center">
                            <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body1">Transport Cost:</Typography>
                          </Box>
                          <Typography variant="h6" color="warning.main">
                            {preview.transportCost.toLocaleString()} gold
                          </Typography>
                        </Box>

                        {preview.transport && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Distance: {formatDistance(preview.transport.distance)} |
                              Tier: {preview.transport.tier}
                            </Typography>
                          </Box>
                        )}

                        <Divider />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">Total Cost:</Typography>
                          <Typography variant="h5" color="primary">
                            {preview.totalCost.toLocaleString()} gold
                          </Typography>
                        </Box>

                        {/* Validation Status */}
                        <Box>
                          {preview.validation.canAccept ? (
                            <Alert severity="success" icon={<CheckIcon />}>
                              Trade can be accepted
                            </Alert>
                          ) : (
                            <Alert severity="error" icon={<WarningIcon />}>
                              Cannot accept trade: {preview.validation.errors?.join(', ')}
                            </Alert>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={
            !selectedDestination ||
            !preview ||
            !preview.validation.canAccept ||
            previewLoading
          }
        >
          Confirm Destination
        </Button>
      </DialogActions>
    </Dialog>
  );
}