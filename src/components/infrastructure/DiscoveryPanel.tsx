'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Search as SearchIcon,
  WaterDrop as WaterIcon,
  PowerSettingsNew as PowerIcon,
  CellTower as BaseStationIcon,
  LocalFireDepartment as FireStationIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import infrastructureService, {
  TeamFacility,
  DetailedProviderInfo,
  ServiceProvider,
} from '@/lib/services/infrastructureService';

interface DiscoveryPanelProps {
  facilities: TeamFacility[];
  onRequestConnection: () => void;
  onSubscribeService: () => void;
}

const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({
  facilities,
  onRequestConnection,
  onSubscribeService,
}) => {
  const { t } = useTranslation();
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [searchType, setSearchType] = useState<'connections' | 'services'>('connections');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<{
    consumerFacility: any;
    waterProviders?: DetailedProviderInfo[];
    powerProviders?: DetailedProviderInfo[];
    baseStations?: ServiceProvider[];
    fireStations?: ServiceProvider[];
  } | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<(DetailedProviderInfo | ServiceProvider) & { type?: 'WATER' | 'POWER' } | null>(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);

  // Filter facilities that need infrastructure
  const consumerFacilities = facilities.filter(f => 
    ['MINE', 'QUARRY', 'FOREST', 'FARM', 'RANCH', 'FISHERY', 'FACTORY', 'MALL', 'WAREHOUSE']
      .includes(f.facilityType)
  );

  const handleSearch = async () => {
    if (!selectedFacility) return;
    
    setLoading(true);
    setError(null);
    try {
      if (searchType === 'connections') {
        const data = await infrastructureService.discoverConnections(selectedFacility);
        setProviders(data);
      } else {
        const data = await infrastructureService.discoverServices(selectedFacility);
        setProviders(data);
      }
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_SEARCHING'));
    } finally {
      setLoading(false);
    }
  };

  const validatePrice = (price: string): boolean => {
    if (!price) return true; // Empty is valid (will use default)
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      setPriceError(t('infrastructure.PRICE_MUST_BE_POSITIVE'));
      return false;
    }
    
    // For connections, check if price is at least the unit price
    if (searchType === 'connections' && selectedProvider && 'unitPrice' in selectedProvider) {
      if (priceValue < selectedProvider.unitPrice) {
        setPriceError(t('infrastructure.PRICE_MUST_BE_HIGHER_THAN_UNIT', { unitPrice: selectedProvider.unitPrice }));
        return false;
      }
    }
    
    setPriceError(null);
    return true;
  };

  const handlePriceChange = (value: string) => {
    setProposedPrice(value);
    if (value) {
      validatePrice(value);
    } else {
      setPriceError(null);
    }
  };

  const handleRequestConnection = async () => {
    if (!selectedProvider) return;
    
    // Validate price before submitting
    if (!validatePrice(proposedPrice)) return;
    
    setLoading(true);
    try {
      // Default to double the unit price if no price is specified
      const finalPrice = proposedPrice
        ? parseFloat(proposedPrice)
        : 'unitPrice' in selectedProvider ? selectedProvider.unitPrice * 2 : 0;
      
      await infrastructureService.requestConnection(
        selectedFacility,
        selectedProvider.providerId,
        selectedProvider.type || 'WATER', // Default to WATER if type is not set
        finalPrice
      );
      setRequestDialogOpen(false);
      setSelectedProvider(null);
      setProposedPrice('');
      setPriceError(null);
      onRequestConnection();
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_REQUESTING_CONNECTION'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeService = async () => {
    if (!selectedProvider) return;
    
    // Validate price before submitting
    if (!validatePrice(proposedPrice)) return;
    
    setLoading(true);
    try {
      await infrastructureService.subscribeToService(
        selectedFacility,
        'serviceId' in selectedProvider ? selectedProvider.serviceId : '',
        proposedPrice ? parseFloat(proposedPrice) : undefined
      );
      setRequestDialogOpen(false);
      setSelectedProvider(null);
      setProposedPrice('');
      setPriceError(null);
      onSubscribeService();
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_SUBSCRIBING'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('infrastructure.SEARCH_FOR_PROVIDERS')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('infrastructure.SELECT_FACILITY')}</InputLabel>
              <Select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                label={t('infrastructure.SELECT_FACILITY')}
              >
                {consumerFacilities.map(facility => (
                  <MenuItem key={facility.facilityId} value={facility.facilityId}>
                    {t(`infrastructure.${facility.facilityType}`)} - ({facility.tileCoordinates.q}, {facility.tileCoordinates.r})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t('infrastructure.SEARCH_TYPE')}</InputLabel>
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'connections' | 'services')}
                label={t('infrastructure.SEARCH_TYPE')}
              >
                <MenuItem value="connections">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WaterIcon fontSize="small" />
                    <PowerIcon fontSize="small" />
                    {t('infrastructure.WATER_POWER')}
                  </Box>
                </MenuItem>
                <MenuItem value="services">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BaseStationIcon fontSize="small" />
                    <FireStationIcon fontSize="small" />
                    {t('infrastructure.BASE_FIRE_STATIONS')}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!selectedFacility || loading}
              startIcon={<SearchIcon />}
              sx={{ minWidth: 120 }}
            >
              {t('infrastructure.SEARCH')}
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {loading && <CircularProgress />}

      {/* Results for Water/Power Providers */}
      {providers && searchType === 'connections' && (
        <Box>
          {/* Show no providers message if both water and power providers are empty */}
          {(!providers.waterProviders || providers.waterProviders.length === 0) && 
           (!providers.powerProviders || providers.powerProviders.length === 0) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('infrastructure.NO_PROVIDERS_FOUND_FOR_FACILITY')}
            </Alert>
          )}
          
          {providers.waterProviders && providers.waterProviders.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WaterIcon /> {t('infrastructure.AVAILABLE_WATER_PROVIDERS')}
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">{t('infrastructure.PROVIDER')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LOCATION')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LEVEL')}</TableCell>
                      <TableCell align="center">{t('infrastructure.DISTANCE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.OP_COST')}</TableCell>
                      <TableCell align="center">{t('infrastructure.UNIT_PRICE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.AVAILABLE_CAPACITY')}</TableCell>
                      <TableCell align="center">{t('infrastructure.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.waterProviders.map((provider: DetailedProviderInfo) => (
                      <TableRow key={provider.providerId}>
                        <TableCell align="center">{provider.providerTeamName}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" />
                            ({provider.location.q}, {provider.location.r})
                          </Box>
                        </TableCell>
                        <TableCell align="center">{provider.facilityLevel}</TableCell>
                        <TableCell align="center">{provider.distance}</TableCell>
                        <TableCell align="center">{provider.operationPointsCost}</TableCell>
                        <TableCell align="center">${provider.unitPrice}</TableCell>
                        <TableCell align="center">{provider.availableCapacity}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setSelectedProvider({ ...provider, type: 'WATER' });
                              setRequestDialogOpen(true);
                            }}
                            disabled={!provider.pathValid}
                          >
                            {t('infrastructure.REQUEST')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {providers.powerProviders && providers.powerProviders.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PowerIcon /> {t('infrastructure.AVAILABLE_POWER_PROVIDERS')}
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">{t('infrastructure.PROVIDER')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LOCATION')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LEVEL')}</TableCell>
                      <TableCell align="center">{t('infrastructure.DISTANCE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.OP_COST')}</TableCell>
                      <TableCell align="center">{t('infrastructure.UNIT_PRICE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.AVAILABLE_CAPACITY')}</TableCell>
                      <TableCell align="center">{t('infrastructure.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.powerProviders.map((provider: DetailedProviderInfo) => (
                      <TableRow key={provider.providerId}>
                        <TableCell align="center">{provider.providerTeamName}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" />
                            ({provider.location.q}, {provider.location.r})
                          </Box>
                        </TableCell>
                        <TableCell align="center">{provider.facilityLevel}</TableCell>
                        <TableCell align="center">{provider.distance}</TableCell>
                        <TableCell align="center">{provider.operationPointsCost}</TableCell>
                        <TableCell align="center">${provider.unitPrice}</TableCell>
                        <TableCell align="center">{provider.availableCapacity}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setSelectedProvider({ ...provider, type: 'POWER' });
                              setRequestDialogOpen(true);
                            }}
                            disabled={!provider.pathValid}
                          >
                            {t('infrastructure.REQUEST')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {/* Results for Base/Fire Station Services */}
      {providers && searchType === 'services' && (
        <Box>
          {/* Show no services message if both base and fire stations are empty */}
          {(!providers.baseStations || providers.baseStations.length === 0) && 
           (!providers.fireStations || providers.fireStations.length === 0) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('infrastructure.NO_SERVICES_FOUND_FOR_FACILITY')}
            </Alert>
          )}
          
          {providers.baseStations && providers.baseStations.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BaseStationIcon /> {t('infrastructure.AVAILABLE_BASE_STATIONS')}
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">{t('infrastructure.PROVIDER')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LOCATION')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LEVEL')}</TableCell>
                      <TableCell align="center">{t('infrastructure.DISTANCE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.IN_RANGE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.ANNUAL_FEE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.baseStations.map((service: ServiceProvider) => (
                      <TableRow key={service.serviceId}>
                        <TableCell align="center">{service.providerTeamName}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" />
                            ({service.location.q}, {service.location.r})
                          </Box>
                        </TableCell>
                        <TableCell align="center">{service.facilityLevel}</TableCell>
                        <TableCell align="center">{service.distance}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={service.inRange ? t('infrastructure.YES') : t('infrastructure.NO')}
                            color={service.inRange ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">${service.annualFee}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setSelectedProvider(service);
                              setRequestDialogOpen(true);
                            }}
                            disabled={!service.inRange}
                          >
                            {t('infrastructure.SUBSCRIBE')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {providers.fireStations && providers.fireStations.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FireStationIcon /> {t('infrastructure.AVAILABLE_FIRE_STATIONS')}
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">{t('infrastructure.PROVIDER')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LOCATION')}</TableCell>
                      <TableCell align="center">{t('infrastructure.LEVEL')}</TableCell>
                      <TableCell align="center">{t('infrastructure.DISTANCE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.IN_RANGE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.ANNUAL_FEE')}</TableCell>
                      <TableCell align="center">{t('infrastructure.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.fireStations.map((service: ServiceProvider) => (
                      <TableRow key={service.serviceId}>
                        <TableCell align="center">{service.providerTeamName}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <LocationIcon fontSize="small" />
                            ({service.location.q}, {service.location.r})
                          </Box>
                        </TableCell>
                        <TableCell align="center">{service.facilityLevel}</TableCell>
                        <TableCell align="center">{service.distance}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={service.inRange ? t('infrastructure.YES') : t('infrastructure.NO')}
                            color={service.inRange ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">${service.annualFee}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setSelectedProvider(service);
                              setRequestDialogOpen(true);
                            }}
                            disabled={!service.inRange}
                          >
                            {t('infrastructure.SUBSCRIBE')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {/* Request/Subscribe Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => {
        setRequestDialogOpen(false);
        setPriceError(null);
        setProposedPrice('');
      }}>
        <DialogTitle>
          {searchType === 'connections' ? t('infrastructure.REQUEST_CONNECTION') : t('infrastructure.SUBSCRIBE_TO_SERVICE')}
        </DialogTitle>
        <DialogContent>
          {searchType === 'connections' && selectedProvider && 'unitPrice' in selectedProvider && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('infrastructure.CURRENT_UNIT_PRICE')}: ${selectedProvider.unitPrice}
            </Typography>
          )}
          {searchType === 'services' && selectedProvider && 'annualFee' in selectedProvider && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('infrastructure.CURRENT_ANNUAL_FEE')}: ${selectedProvider.annualFee}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={searchType === 'connections' ? t('infrastructure.PROPOSED_UNIT_PRICE') : t('infrastructure.PROPOSED_ANNUAL_FEE')}
            type="number"
            fullWidth
            variant="outlined"
            value={proposedPrice}
            onChange={(e) => handlePriceChange(e.target.value)}
            error={!!priceError}
            helperText={
              priceError || 
              (searchType === 'connections' && selectedProvider && 'unitPrice' in selectedProvider
                ? `Leave blank for default (2x unit price = $${selectedProvider.unitPrice * 2})`
                : t('infrastructure.OPTIONAL_LEAVE_BLANK_FOR_DEFAULT'))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRequestDialogOpen(false);
            setPriceError(null);
            setProposedPrice('');
          }}>{t('infrastructure.CANCEL')}</Button>
          <Button
            onClick={searchType === 'connections' ? handleRequestConnection : handleSubscribeService}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!!priceError}
          >
            {searchType === 'connections' ? t('infrastructure.SEND_REQUEST') : t('infrastructure.SUBSCRIBE')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiscoveryPanel;