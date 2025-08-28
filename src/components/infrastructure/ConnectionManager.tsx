'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  WaterDrop as WaterIcon,
  PowerSettingsNew as PowerIcon,
  CheckCircle as AcceptIcon,
  Cancel as CancelIcon,
  Delete as DisconnectIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Block as RejectIcon,
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import infrastructureService, {
  ConnectionRequest,
  Connection,
  RequestStatus,
  ConnectionStatus,
  TeamFacility,
} from '@/lib/services/infrastructureService';

interface ConnectionManagerProps {
  facilities: TeamFacility[];
  onUpdate: () => void;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  facilities,
  onUpdate,
}) => {
  const { t } = useTranslation('infrastructure');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [consumerConnections, setConsumerConnections] = useState<Connection[]>([]);
  const [providerConnections, setProviderConnections] = useState<Connection[]>([]);
  const [consumerRequests, setConsumerRequests] = useState<ConnectionRequest[]>([]);
  const [providerRequests, setProviderRequests] = useState<ConnectionRequest[]>([]);
  
  // Dialog states
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [unitPrice, setUnitPrice] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadData();
  }, [tabValue]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tabValue === 0) {
        // Load consumer data
        const [connectionsData, requestsData] = await Promise.all([
          infrastructureService.getConsumerConnections(),
          infrastructureService.getConsumerRequests(),
        ]);
        console.log('Consumer connections raw data:', connectionsData);
        console.log('Consumer requests raw data:', requestsData);
        
        // Extract connections safely
        const connections = connectionsData?.connections || connectionsData || [];
        const requests = requestsData?.requests || requestsData || [];
        
        console.log('Consumer connections processed:', connections);
        console.log('Consumer requests processed:', requests);
        
        setConsumerConnections(Array.isArray(connections) ? connections : []);
        setConsumerRequests(Array.isArray(requests) ? requests : []);
      } else {
        // Load provider data
        const [connectionsData, requestsData] = await Promise.all([
          infrastructureService.getProviderConnections(),
          infrastructureService.getProviderRequests(),
        ]);
        console.log('Provider connections raw data:', connectionsData);
        console.log('Provider requests raw data:', requestsData);
        
        // Extract connections safely
        const connections = connectionsData?.connections || connectionsData || [];
        const requests = requestsData?.requests || requestsData || [];
        
        console.log('Provider connections processed:', connections);
        console.log('Provider requests processed:', requests);
        
        setProviderConnections(Array.isArray(connections) ? connections : []);
        setProviderRequests(Array.isArray(requests) ? requests : []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || t('ERROR_LOADING_DATA'));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest || !unitPrice) return;
    
    setLoading(true);
    try {
      await infrastructureService.acceptConnectionRequest(
        selectedRequest.id,
        parseFloat(unitPrice)
      );
      setAcceptDialogOpen(false);
      setSelectedRequest(null);
      setUnitPrice('');
      loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('ERROR_ACCEPTING_REQUEST'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await infrastructureService.rejectConnectionRequest(
        selectedRequest.id,
        reason
      );
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setReason('');
      loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('ERROR_REJECTING_REQUEST'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await infrastructureService.cancelConnectionRequest(
        selectedRequest.id,
        reason
      );
      setCancelDialogOpen(false);
      setSelectedRequest(null);
      setReason('');
      loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('ERROR_CANCELLING_REQUEST'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedConnection) return;
    
    setLoading(true);
    try {
      await infrastructureService.disconnectConnection(
        selectedConnection.id,
        reason
      );
      setDisconnectDialogOpen(false);
      setSelectedConnection(null);
      setReason('');
      loadData();
      onUpdate();
    } catch (err: any) {
      setError(err.message || t('ERROR_DISCONNECTING'));
    } finally {
      setLoading(false);
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    return type === 'WATER' ? <WaterIcon fontSize="small" /> : <PowerIcon fontSize="small" />;
  };

  const getStatusColor = (status: RequestStatus | ConnectionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
      case 'DISCONNECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab 
            label={
              <Badge badgeContent={consumerRequests.filter(r => r.status === 'PENDING' || r.status === RequestStatus.PENDING).length} color="warning">
                {t('AS_CONSUMER')}
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={providerRequests.filter(r => r.status === 'PENDING' || r.status === RequestStatus.PENDING).length} color="warning">
                {t('AS_PROVIDER')}
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Consumer Tab */}
      {tabValue === 0 && (
        <Box>
          {/* Active Connections */}
          <Typography variant="h6" gutterBottom>
            {t('ACTIVE_CONNECTIONS')}
          </Typography>
          {consumerConnections.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('NO_ACTIVE_CONNECTIONS')}
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('TYPE')}</TableCell>
                    <TableCell>{t('PROVIDER')}</TableCell>
                    <TableCell>{t('UNIT_PRICE')}</TableCell>
                    <TableCell>{t('DISTANCE')}</TableCell>
                    <TableCell>{t('STATUS')}</TableCell>
                    <TableCell>{t('ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consumerConnections.map((connection) => (
                    <TableRow key={`consumer-conn-${connection.id}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getConnectionTypeIcon(connection.connectionType)}
                          {t(connection.connectionType)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{connection.providerTeam?.name || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {connection.providerFacility?.facilityType || '-'} (Level {connection.providerFacility?.level || 0})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>${connection.unitPrice || '0'}</TableCell>
                      <TableCell>{(connection.operationPointsCost || 1) - 1}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(connection.status)}
                          color={getStatusColor(connection.status as ConnectionStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedConnection(connection);
                            setDisconnectDialogOpen(true);
                          }}
                        >
                          <DisconnectIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Connection Requests */}
          <Typography variant="h6" gutterBottom>
            {t('CONNECTION_REQUESTS')}
          </Typography>
          {consumerRequests.length === 0 ? (
            <Alert severity="info">
              {t('NO_CONNECTION_REQUESTS')}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('TYPE')}</TableCell>
                    <TableCell>{t('PROVIDER')}</TableCell>
                    <TableCell>{t('PROPOSED_PRICE')}</TableCell>
                    <TableCell>{t('DISTANCE')}</TableCell>
                    <TableCell>{t('STATUS')}</TableCell>
                    <TableCell>{t('CREATED_AT')}</TableCell>
                    <TableCell>{t('ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consumerRequests.map((request) => (
                    <TableRow key={`consumer-req-${request.id}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getConnectionTypeIcon(request.connectionType)}
                          {t(request.connectionType)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{request.providerTeam?.name || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.providerFacility?.facilityType || '-'} (Level {request.providerFacility?.level || 0})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {request.proposedUnitPrice ? `$${request.proposedUnitPrice}` : '-'}
                      </TableCell>
                      <TableCell>{request.distance}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(request.status)}
                          color={getStatusColor(request.status as RequestStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {(request.status === 'PENDING' || request.status === RequestStatus.PENDING) ? (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedRequest(request);
                              setCancelDialogOpen(true);
                            }}
                            title={t('CANCEL_REQUEST')}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Provider Tab */}
      {tabValue === 1 && (
        <Box>
          {/* Active Connections */}
          <Typography variant="h6" gutterBottom>
            {t('PROVIDED_CONNECTIONS')}
          </Typography>
          {providerConnections.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('NO_PROVIDED_CONNECTIONS')}
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('TYPE')}</TableCell>
                    <TableCell>{t('CONSUMER')}</TableCell>
                    <TableCell>{t('UNIT_PRICE')}</TableCell>
                    <TableCell>{t('OP_COST')}</TableCell>
                    <TableCell>{t('STATUS')}</TableCell>
                    <TableCell>{t('ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providerConnections.map((connection) => (
                    <TableRow key={`provider-conn-${connection.id}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getConnectionTypeIcon(connection.connectionType)}
                          {t(connection.connectionType)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{connection.consumerTeam?.name || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {connection.consumerFacility?.facilityType || '-'} (Level {connection.consumerFacility?.level || 0})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>${connection.unitPrice || '0'}</TableCell>
                      <TableCell>{connection.operationPointsCost || '0'}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(connection.status)}
                          color={getStatusColor(connection.status as ConnectionStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedConnection(connection);
                            setDisconnectDialogOpen(true);
                          }}
                        >
                          <DisconnectIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Incoming Requests */}
          <Typography variant="h6" gutterBottom>
            {t('INCOMING_REQUESTS')}
          </Typography>
          {providerRequests.length === 0 ? (
            <Alert severity="info">
              {t('NO_INCOMING_REQUESTS')}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('TYPE')}</TableCell>
                    <TableCell>{t('CONSUMER')}</TableCell>
                    <TableCell>{t('DISTANCE')}</TableCell>
                    <TableCell>{t('OP_NEEDED')}</TableCell>
                    <TableCell>{t('PROPOSED_PRICE')}</TableCell>
                    <TableCell>{t('STATUS')}</TableCell>
                    <TableCell>{t('ACTIONS')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providerRequests.map((request) => (
                    <TableRow key={`provider-req-${request.id}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getConnectionTypeIcon(request.connectionType)}
                          {t(request.connectionType)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{request.consumerTeam?.name || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.consumerFacility?.facilityType || '-'} (Level {request.consumerFacility?.level || 0})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{request.distance}</TableCell>
                      <TableCell>{request.operationPointsNeeded}</TableCell>
                      <TableCell>
                        {request.proposedUnitPrice ? `$${request.proposedUnitPrice}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(request.status)}
                          color={getStatusColor(request.status as RequestStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {(request.status === 'PENDING' || request.status === RequestStatus.PENDING) ? (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedRequest(request);
                                setUnitPrice(request.proposedUnitPrice?.toString() || '');
                                setAcceptDialogOpen(true);
                              }}
                            >
                              <AcceptIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedRequest(request);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)}>
        <DialogTitle>{t('ACCEPT_CONNECTION_REQUEST')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('UNIT_PRICE')}
            type="number"
            fullWidth
            variant="outlined"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAcceptDialogOpen(false);
            setSelectedRequest(null);
            setUnitPrice('');
          }}>{t('CANCEL')}</Button>
          <Button onClick={handleAcceptRequest} variant="contained" disabled={!unitPrice || loading}>
            {t('ACCEPT')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>{t('REJECT_CONNECTION_REQUEST')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('REASON')}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectDialogOpen(false);
            setSelectedRequest(null);
            setReason('');
          }}>{t('CANCEL')}</Button>
          <Button onClick={handleRejectRequest} variant="contained" color="error" disabled={loading}>
            {t('REJECT')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Request Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>{t('CANCEL_CONNECTION_REQUEST')}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('CANCEL_REQUEST_INFO')}
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label={t('REASON')}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCancelDialogOpen(false);
            setSelectedRequest(null);
            setReason('');
          }}>{t('CLOSE')}</Button>
          <Button onClick={handleCancelRequest} variant="contained" color="warning" disabled={loading}>
            {t('CANCEL_REQUEST')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={disconnectDialogOpen} onClose={() => setDisconnectDialogOpen(false)}>
        <DialogTitle>{t('DISCONNECT_CONNECTION')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('DISCONNECT_WARNING')}
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label={t('REASON')}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDisconnectDialogOpen(false);
            setSelectedConnection(null);
            setReason('');
          }}>{t('CANCEL')}</Button>
          <Button onClick={handleDisconnect} variant="contained" color="error" disabled={loading}>
            {t('DISCONNECT')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConnectionManager;