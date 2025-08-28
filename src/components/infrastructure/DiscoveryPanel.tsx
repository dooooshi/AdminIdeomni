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
  const [selectedProvider, setSelectedProvider] = useState<DetailedProviderInfo | ServiceProvider | null>(null);
  const [proposedPrice, setProposedPrice] = useState('');

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

  const handleRequestConnection = async () => {
    if (!selectedProvider) return;
    
    setLoading(true);
    try {
      await infrastructureService.requestConnection(
        selectedFacility,
        selectedProvider.providerId,
        selectedProvider.type,
        proposedPrice ? parseFloat(proposedPrice) : undefined
      );
      setRequestDialogOpen(false);
      setSelectedProvider(null);
      setProposedPrice('');
      onRequestConnection();
    } catch (err: any) {
      setError(err.message || t('infrastructure.ERROR_REQUESTING_CONNECTION'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeService = async () => {
    if (!selectedProvider) return;
    
    setLoading(true);
    try {
      await infrastructureService.subscribeToService(
        selectedFacility,
        selectedProvider.serviceId,
        proposedPrice ? parseFloat(proposedPrice) : undefined
      );
      setRequestDialogOpen(false);
      setSelectedProvider(null);
      setProposedPrice('');
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
          {providers.waterProviders && providers.waterProviders.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WaterIcon /> {t('infrastructure.AVAILABLE_WATER_PROVIDERS')}
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('infrastructure.PROVIDER')}</TableCell>
                      <TableCell>{t('infrastructure.LEVEL')}</TableCell>
                      <TableCell>{t('infrastructure.DISTANCE')}</TableCell>
                      <TableCell>{t('infrastructure.OP_COST')}</TableCell>
                      <TableCell>{t('infrastructure.UNIT_PRICE')}</TableCell>
                      <TableCell>{t('infrastructure.AVAILABLE_CAPACITY')}</TableCell>
                      <TableCell>{t('infrastructure.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.waterProviders.map((provider: DetailedProviderInfo) => (
                      <TableRow key={provider.providerId}>
                        <TableCell>{provider.providerTeamName}</TableCell>
                        <TableCell>{provider.facilityLevel}</TableCell>
                        <TableCell>{provider.distance}</TableCell>
                        <TableCell>{provider.operationPointsCost}</TableCell>
                        <TableCell>${provider.unitPrice}</TableCell>
                        <TableCell>{provider.availableCapacity}</TableCell>
                        <TableCell>
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
                      <TableCell>{t('infrastructure.PROVIDER')}</TableCell>
                      <TableCell>{t('infrastructure.LEVEL')}</TableCell>
                      <TableCell>{t('infrastructure.DISTANCE')}</TableCell>
                      <TableCell>{t('infrastructure.OP_COST')}</TableCell>
                      <TableCell>{t('infrastructure.UNIT_PRICE')}</TableCell>
                      <TableCell>{t('infrastructure.AVAILABLE_CAPACITY')}</TableCell>
                      <TableCell>{t('infrastructure.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.powerProviders.map((provider: DetailedProviderInfo) => (
                      <TableRow key={provider.providerId}>
                        <TableCell>{provider.providerTeamName}</TableCell>
                        <TableCell>{provider.facilityLevel}</TableCell>
                        <TableCell>{provider.distance}</TableCell>
                        <TableCell>{provider.operationPointsCost}</TableCell>
                        <TableCell>${provider.unitPrice}</TableCell>
                        <TableCell>{provider.availableCapacity}</TableCell>
                        <TableCell>
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
          {providers.baseStations && providers.baseStations.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BaseStationIcon /> {t('infrastructure.AVAILABLE_BASE_STATIONS')}
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('infrastructure.PROVIDER')}</TableCell>
                      <TableCell>{t('infrastructure.LEVEL')}</TableCell>
                      <TableCell>{t('infrastructure.DISTANCE')}</TableCell>
                      <TableCell>{t('infrastructure.IN_RANGE')}</TableCell>
                      <TableCell>{t('infrastructure.ANNUAL_FEE')}</TableCell>
                      <TableCell>{t('infrastructure.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {providers.baseStations.map((service: ServiceProvider) => (
                      <TableRow key={service.serviceId}>
                        <TableCell>{service.providerTeamName}</TableCell>
                        <TableCell>{service.facilityLevel}</TableCell>
                        <TableCell>{service.distance}</TableCell>
                        <TableCell>
                          <Chip
                            label={service.inRange ? t('infrastructure.YES') : t('infrastructure.NO')}
                            color={service.inRange ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${service.annualFee}</TableCell>
                        <TableCell>
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
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}>
        <DialogTitle>
          {searchType === 'connections' ? t('infrastructure.REQUEST_CONNECTION') : t('infrastructure.SUBSCRIBE_TO_SERVICE')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={searchType === 'connections' ? t('infrastructure.PROPOSED_UNIT_PRICE') : t('infrastructure.PROPOSED_ANNUAL_FEE')}
            type="number"
            fullWidth
            variant="outlined"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            helperText={t('infrastructure.OPTIONAL_LEAVE_BLANK_FOR_DEFAULT')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>{t('infrastructure.CANCEL')}</Button>
          <Button
            onClick={searchType === 'connections' ? handleRequestConnection : handleSubscribeService}
            variant="contained"
            startIcon={<SendIcon />}
          >
            {searchType === 'connections' ? t('infrastructure.SEND_REQUEST') : t('infrastructure.SUBSCRIBE')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiscoveryPanel;