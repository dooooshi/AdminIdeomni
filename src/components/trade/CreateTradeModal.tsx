'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TradeService } from '@/lib/services/tradeService';
import {
  CreateTradeRequest,
  Team,
  FacilitySpaceInventory,
  FacilityInventoryItem,
  InventoryItemType,
} from '@/types/trade';

interface CreateTradeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (tradeId: string) => void;
}

interface SelectedItem {
  inventoryItemId: string;
  item: FacilityInventoryItem;
  quantity: number;
}

export const CreateTradeModal: React.FC<CreateTradeModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [targetTeamId, setTargetTeamId] = useState<string>('');
  const [sourceFacilityId, setSourceFacilityId] = useState<string>('');
  const [sourceInventoryId, setSourceInventoryId] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  // Available options
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [sourceInventories, setSourceInventories] = useState<FacilitySpaceInventory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<FacilityInventoryItem[]>([]);

  const steps = [
    t('trade.steps.selectFacility', 'Select Facility'),
    t('trade.steps.selectItems', 'Select Items'),
    t('trade.steps.selectTeam', 'Select Target Team'),
    t('trade.steps.setPrice', 'Set Price & Message'),
    t('trade.steps.review', 'Review & Confirm'),
  ];

  useEffect(() => {
    if (open) {
      loadInitialData();
    } else {
      // Reset form when modal closes
      handleReset();
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load available teams
      const teams = await TradeService.getAvailableTeams();
      setAvailableTeams(teams);

      // Load source inventories (inventories with tradeable items)
      const sources = await TradeService.getSourceInventories();
      console.log('Raw source inventories from API:', sources); // Debug log

      // Log detailed facility info
      sources.forEach((source, index) => {
        console.log(`Source ${index}:`, {
          facility: source.facility,
          inventoryIds: source.inventoryIds,
          itemCount: source.items?.length || 0,
          items: source.items?.slice(0, 2) // Show first 2 items for debugging
        });
      });

      // Validate and filter source inventories
      const validSources = sources.filter(source =>
        source.facility?.id &&
        (source.items?.length > 0 || source.itemCount > 0)
      );
      console.log('Filtered valid source inventories:', validSources); // Debug log

      setSourceInventories(validSources);

      // Note: Destination inventories are handled in AcceptTradeModal
    } catch (err) {
      console.error('Failed to load initial data:', err); // Debug log
      setError(err instanceof Error ? err.message : t('trade.error.loadData', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async (inventoryId: string) => {
    // Check if inventoryId is valid before making the API call
    if (!inventoryId || inventoryId === 'undefined') {
      console.warn('Invalid inventoryId provided:', inventoryId);
      setInventoryItems([]);
      return;
    }

    try {
      // Import TransportationService for getting inventory items
      const { TransportationService } = await import('@/lib/services/transportationService');

      // Fetch real items from the selected inventory
      const response = await TransportationService.getFacilityInventoryItems(inventoryId);

      // Extract items from the nested structure
      const allItems: any[] = [];

      // Check if response has data property or is the data directly
      const inventoryData = (response as any).data || response;

      // The response should now be just the data part with inventory structure
      if (inventoryData?.inventory?.rawMaterials?.items) {
        allItems.push(...inventoryData.inventory.rawMaterials.items);
      }

      // Add products if they exist
      if (inventoryData?.inventory?.products?.items) {
        allItems.push(...inventoryData.inventory.products.items);
      }

      // Transform the response to match our interface
      const items: FacilityInventoryItem[] = allItems.map(item => ({
        id: item.id,
        name: item.name || item.nameEn || item.productName || 'Unknown Item',
        type: item.itemType || 'RAW_MATERIAL',
        quantity: parseFloat(item.quantity) || 0,
        unitSpace: parseFloat(item.unitSpaceOccupied) || 1,
      }));

      setInventoryItems(items);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
      // Set empty array on error so the UI doesn't break
      setInventoryItems([]);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setTargetTeamId('');
    setSourceFacilityId('');
    setSourceInventoryId('');
    setSelectedItems([]);
    setTotalPrice(0);
    setMessage('');
    setError(null);
  };


  const handleInventorySelect = (facilityId: string) => {
    if (!facilityId) {
      // Clear selection
      setSourceFacilityId('');
      setSourceInventoryId('');
      setInventoryItems([]);
      setSelectedItems([]);
      return;
    }

    const selectedFacility = sourceInventories.find(inv => inv.facility?.id === facilityId);
    if (selectedFacility?.facility) {
      setSourceFacilityId(selectedFacility.facility.id);

      // For source inventories, we have inventoryIds array
      // Use the first inventory ID as the default
      if (selectedFacility.inventoryIds && selectedFacility.inventoryIds.length > 0) {
        setSourceInventoryId(selectedFacility.inventoryIds[0]);
      } else if (selectedFacility.inventoryId) {
        // Fallback to single inventoryId if provided
        setSourceInventoryId(selectedFacility.inventoryId);
      }

      // Check if items are already included with the source inventory
      if (selectedFacility.items && selectedFacility.items.length > 0) {
        // Transform the items from the source inventory response
        const items: FacilityInventoryItem[] = selectedFacility.items.map(item => ({
          id: item.inventoryItemId || '',
          name: item.name || 'Unknown Item',
          type: (item.itemType === 'PRODUCT' ? InventoryItemType.PRODUCT : InventoryItemType.RAW_MATERIAL),
          quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity as any) || 0,
          unitSpace: typeof item.unitSpace === 'number' ? item.unitSpace : parseFloat(item.unitSpace as any) || 1,
          inventoryId: item.inventoryId, // Keep track of which inventory each item belongs to
        }));
        setInventoryItems(items);
        // Clear previously selected items when changing facility
        setSelectedItems([]);
      } else {
        // Fallback to loading items separately if not included
        setInventoryItems([]);
        setSelectedItems([]);
        if (selectedFacility.inventoryIds && selectedFacility.inventoryIds.length > 0) {
          loadInventoryItems(selectedFacility.inventoryIds[0]);
        } else if (selectedFacility.inventoryId) {
          loadInventoryItems(selectedFacility.inventoryId);
        }
      }
    } else {
      // No facility found
      setInventoryItems([]);
      setSelectedItems([]);
    }
  };

  const handleItemToggle = (item: FacilityInventoryItem) => {
    const existingIndex = selectedItems.findIndex(
      si => si.inventoryItemId === item.id
    );

    if (existingIndex >= 0) {
      // Remove item
      setSelectedItems(selectedItems.filter((_, index) => index !== existingIndex));
    } else {
      // Check if we already have items selected from a different inventory
      if (selectedItems.length > 0 && item.inventoryId) {
        const firstSelectedItem = selectedItems[0].item;
        if (firstSelectedItem.inventoryId && firstSelectedItem.inventoryId !== item.inventoryId) {
          // Items must be from the same inventory - show error
          setError(t('trade.error.sameInventory'));
          return;
        }
      }

      // Add item with default quantity
      setSelectedItems([
        ...selectedItems,
        {
          inventoryItemId: item.id,
          item: item,
          quantity: 1,
        },
      ]);

      // Clear any previous error
      setError(null);

      // Update the sourceInventoryId to match the selected item's inventory
      if (item.inventoryId) {
        setSourceInventoryId(item.inventoryId);
      }
    }
  };

  const handleQuantityChange = (inventoryItemId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map(si =>
        si.inventoryItemId === inventoryItemId
          ? { ...si, quantity: Math.max(1, quantity) }
          : si
      )
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const request: CreateTradeRequest = {
        targetTeamId,
        sourceFacilityId,
        sourceInventoryId,
        items: selectedItems.map(si => ({
          inventoryItemId: si.inventoryItemId,
          quantity: si.quantity,
        })),
        totalPrice,
        message: message.trim() || undefined,
      };

      const trade = await TradeService.createTrade(request);
      onSuccess(trade.id);
      handleReset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trade.error.createTrade'));
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        // Can proceed if a facility is selected and we have a valid inventory ID
        return sourceFacilityId !== '' && sourceInventoryId !== '';
      case 1:
        return selectedItems.length > 0;
      case 2:
        return targetTeamId !== '';
      case 3:
        return totalPrice > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Select Facility/Inventory
        return (
          <Box>
            <Typography variant="body2" color="textSecondary" mb={2}>
              {t('trade.selectFacilityDesc')}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>{t('trade.field.sourceInventory')}</InputLabel>
              <Select
                value={sourceFacilityId || ''}
                onChange={(e) => handleInventorySelect(e.target.value)}
                label={t('trade.field.sourceInventory')}
                renderValue={(selected) => {
                  if (!selected) return '';
                  const selectedInventory = sourceInventories.find(inv => inv.facility?.id === selected);
                  if (!selectedInventory?.facility) return selected;

                  const { facility } = selectedInventory;

                  // Create the same display name logic as in the dropdown
                  if (facility.name && facility.name !== facility.type && facility.name !== 'undefined') {
                    return facility.name;
                  }

                  const typeName = t(`facilityType.${facility.type}`, facility.type);

                  if (facility.tileId) {
                    return `${typeName} (Tile #${facility.tileId})`;
                  }

                  if (facility.location) {
                    return `${typeName} (${facility.location.q},${facility.location.r})`;
                  }

                  if (facility.uniqueKey) {
                    const keyParts = facility.uniqueKey.split('_');
                    if (keyParts.length > 0 && keyParts[0] !== facility.type) {
                      return `${typeName} (${keyParts[0]})`;
                    }
                  }

                  // Use facility ID as fallback
                  if (facility.id) {
                    const idParts = facility.id.split('-');
                    const shortId = idParts.length > 1 ? idParts[idParts.length - 1] : facility.id.slice(-6);
                    return `${typeName} Lv.${facility.level || 1} (ID: ${shortId})`;
                  }

                  return `${typeName} ${facility.level ? `Lv.${facility.level}` : ''}`;
                }}
                displayEmpty
              >
                {sourceInventories.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="textSecondary">
                      {t('trade.inventory.noInventories')}
                    </Typography>
                  </MenuItem>
                ) : (
                  sourceInventories.map(inventory => {
                    // Check if facility exists and has valid data
                    if (!inventory.facility?.id) return null;

                    const itemCount = inventory.items?.length || 0;
                    const totalSpace = inventory.items?.reduce((sum, item) =>
                      sum + ((item.totalSpace || item.quantity * item.unitSpace) || 0), 0
                    ) || 0;

                    // Create a meaningful display name for the facility
                    const facilityDisplayName = (() => {
                      const { facility } = inventory;

                      // If facility has a meaningful name (not just the type), use it
                      if (facility.name && facility.name !== facility.type && facility.name !== 'undefined') {
                        return facility.name;
                      }

                      // Otherwise, create a descriptive name using type and unique identifiers
                      const typeName = t(`facilityType.${facility.type}`, facility.type);

                      // Try different identifiers in order of preference
                      if (facility.tileId) {
                        return `${typeName} (Tile #${facility.tileId})`;
                      }

                      if (facility.location) {
                        return `${typeName} (${facility.location.q},${facility.location.r})`;
                      }

                      if (facility.uniqueKey) {
                        // Parse uniqueKey to get a readable identifier
                        const keyParts = facility.uniqueKey.split('_');
                        if (keyParts.length > 0 && keyParts[0] !== facility.type) {
                          return `${typeName} (${keyParts[0]})`;
                        }
                      }

                      // If we still don't have a unique identifier, use the facility ID
                      if (facility.id) {
                        // Extract last part of ID if it's a UUID or long string
                        const idParts = facility.id.split('-');
                        const shortId = idParts.length > 1 ? idParts[idParts.length - 1] : facility.id.slice(-6);
                        return `${typeName} Lv.${facility.level || 1} (ID: ${shortId})`;
                      }

                      // Final fallback
                      return `${typeName} ${facility.level ? `Lv.${facility.level}` : ''}`;
                    })();

                    return (
                      <MenuItem key={inventory.facility.id} value={inventory.facility.id}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="body1">
                            {facilityDisplayName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {/* Show inventory IDs if multiple */}
                            {inventory.inventoryIds && inventory.inventoryIds.length > 1 && (
                              <>
                                {inventory.inventoryIds.length} {t('trade.inventory.multiple', 'inventories')}
                                {' • '}
                              </>
                            )}
                            {/* Show level if exists */}
                            {inventory.facility.level && (
                              <>
                                {t('trade.inventory.level', 'Level {{level}}', { level: inventory.facility.level })}
                                {' • '}
                              </>
                            )}
                            {/* Show item count and space */}
                            {itemCount > 0 ? (
                              <>
                                {itemCount} {t('trade.units.items')}
                                {totalSpace > 0 && (
                                  <>
                                    {' • '}
                                    {totalSpace.toFixed(1)} {t('trade.units.units')}
                                  </>
                                )}
                              </>
                            ) : (
                              t('trade.inventory.noItems')
                            )}
                            {/* Show facility ID for debugging/identification */}
                            {inventory.facility.id && (
                              <>
                                {' • '}
                                <span style={{ opacity: 0.7, fontSize: '0.85em' }}>
                                  ID: {inventory.facility.id.slice(-6)}
                                </span>
                              </>
                            )}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  }).filter(Boolean)
                )}
              </Select>
            </FormControl>
            {sourceInventories.length === 0 && !loading && (
              <Typography variant="body2" color="textSecondary" mt={2}>
                {t('trade.inventory.noSourceInventoriesHelp')}
              </Typography>
            )}
          </Box>
        );

      case 1:
        // Select Items
        return (
          <Box>
            <Typography variant="body2" color="textSecondary" mb={2}>
              {t('trade.selectItemsDesc')}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>{t('trade.field.itemName')}</TableCell>
                    <TableCell>{t('trade.field.available')}</TableCell>
                    <TableCell>{t('trade.field.quantity')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryItems.map(item => {
                    const isSelected = selectedItems.some(
                      si => si.inventoryItemId === item.id
                    );
                    const selectedItem = selectedItems.find(
                      si => si.inventoryItemId === item.id
                    );

                    // Disable items from different inventories once selection is made
                    const isDisabled = selectedItems.length > 0 &&
                      !isSelected &&
                      item.inventoryId &&
                      selectedItems[0].item.inventoryId &&
                      item.inventoryId !== selectedItems[0].item.inventoryId;

                    return (
                      <TableRow key={item.id} sx={{ opacity: isDisabled ? 0.5 : 1 }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleItemToggle(item)}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell>
                          {item.name}
                          {item.inventoryId && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              {t('trade.inventory.id')}: {item.inventoryId.substring(0, 8)}...
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={selectedItem?.quantity || ''}
                            onChange={(e) =>
                              handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                            }
                            disabled={!isSelected}
                            inputProps={{
                              min: 1,
                              max: item.quantity,
                            }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 2:
        // Select Target Team
        return (
          <Box>
            <Typography variant="body2" color="textSecondary" mb={2}>
              {t('trade.selectTeamDesc')}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>{t('trade.field.targetTeam')}</InputLabel>
              <Select
                value={targetTeamId || ''}
                onChange={(e) => setTargetTeamId(e.target.value)}
                label={t('trade.field.targetTeam')}
                renderValue={(selected) => {
                  if (!selected) return '';
                  const selectedTeam = availableTeams.find(team => team.id === selected);
                  return selectedTeam?.name || selected;
                }}
                displayEmpty
              >
                {availableTeams.map(team => (
                  <MenuItem key={team.id} value={team.id}>
                    <Typography variant="body1">
                      {team.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 3:
        // Set Price & Message
        return (
          <Box>
            <Typography variant="body2" color="textSecondary" mb={2}>
              {t('trade.setPriceDesc')}
            </Typography>
            <Stack spacing={3}>
              <TextField
                label={t('trade.field.totalPrice')}
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">🪙</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 100 }}
              />
              <TextField
                label={t('trade.field.message')}
                multiline
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                placeholder={t('trade.field.messagePlaceholder')}
              />
            </Stack>
          </Box>
        );

      case 4:
        // Review & Confirm
        const targetTeam = availableTeams.find(t => t.id === targetTeamId);
        const sourceInventory = sourceInventories.find(inv => inv.facility?.id === sourceFacilityId);

        return (
          <Box>
            <Typography variant="body2" color="textSecondary" mb={2}>
              {t('trade.reviewDesc')}
            </Typography>
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('trade.field.from')}
                </Typography>
                <Typography variant="body1">
                  {sourceInventory?.facility?.name}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('trade.field.to')}
                </Typography>
                <Typography variant="body1">
                  {targetTeam?.name}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('trade.summary.items')}
                </Typography>
                {selectedItems.map(si => (
                  <Chip
                    key={si.inventoryItemId}
                    label={`${si.item.name} x${si.quantity}`}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('trade.summary.price')}
                </Typography>
                <Typography variant="h6" color="primary">
                  {TradeService.formatCurrency(totalPrice)} 🪙
                </Typography>
              </Paper>

              {message && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('trade.summary.message')}
                  </Typography>
                  <Typography variant="body2">
                    {message}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {t('trade.createTitle')}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {renderStepContent()}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => {
          handleReset();
          onClose();
        }}>
          {t('trade.misc.close')}
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            {t('trade.misc.back')}
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {t('trade.misc.next')}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !canProceed()}
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : (
              t('trade.actions.sendOffer')
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateTradeModal;