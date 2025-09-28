'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Paper,
  Divider,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Business as Building2,
  Bolt as Zap,
  WaterDrop as Droplets,
  CellTower as Radio,
  Security as Shield,
  Schedule as Clock,
  Warning as AlertCircle,
  CheckCircle,
  Cancel as XCircle,
  ChevronRight
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import infrastructureHistoryService from '@/lib/services/infrastructureHistoryService';
import {
  InfrastructureOperationLog,
  OperationType,
  InfrastructureHistoryQuery,
  ConnectionTerminationDetail,
  ServiceType,
} from '@/types/infrastructureHistory';
import { InfrastructureType } from '@/lib/services/infrastructureService';
import {
  formatOperationType,
  getOperationTypeColor,
  getEventDescription,
} from '@/lib/utils/infrastructureHistoryHelpers';



export default function InfrastructureHistoryViewer() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [historyLogs, setHistoryLogs] = useState<InfrastructureOperationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<InfrastructureOperationLog | null>(null);
  const [terminationDetail, setTerminationDetail] = useState<ConnectionTerminationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadHistoryData = useCallback(async () => {
    setLoading(true);
    try {
      const query: InfrastructureHistoryQuery = {
        page: page + 1, // API uses 1-based pagination
        pageSize: rowsPerPage
      };

      const historyResponse = await infrastructureHistoryService.getTeamInfrastructureHistory(query);
      
      setHistoryLogs(historyResponse.logs || []);
      setTotalCount(historyResponse.total || 0);
    } catch (error) {
      console.error('Failed to load history data:', error);
      enqueueSnackbar(t('infrastructure.history.error.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, enqueueSnackbar, t]);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  const handleLogSelect = async (log: InfrastructureOperationLog) => {
    setSelectedLog(log);
    
    if (log.operationType === OperationType.CONNECTION_DISCONNECTED && log.entityId) {
      try {
        const detail = await infrastructureHistoryService.getTerminationDetails(log.entityId);
        setTerminationDetail(detail);
      } catch (error) {
        console.error('Failed to load termination details:', error);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getInfrastructureIcon = (log: InfrastructureOperationLog) => {
    // Check top-level fields first, then details
    const type = log.infrastructureType || 
                 log.serviceType ||
                 (log.details as any)?.infrastructureType ||
                 (log.details as any)?.connectionType || 
                 (log.details as any)?.serviceType;
    
    switch (type) {
      case 'WATER':
        return <Droplets sx={{ fontSize: 20, color: 'primary.main' }} />;
      case 'POWER':
        return <Zap sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'BASE_STATION':
        return <Radio sx={{ fontSize: 20, color: 'info.main' }} />;
      case 'FIRE_STATION':
        return <Shield sx={{ fontSize: 20, color: 'error.main' }} />;
      default:
        return <Building2 sx={{ fontSize: 20 }} />;
    }
  };

  const getStatusIcon = (type: OperationType) => {
    switch (type) {
      case OperationType.CONNECTION_ACCEPTED:
      case OperationType.SUBSCRIPTION_ACCEPTED:
        return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
      case OperationType.CONNECTION_REJECTED:
      case OperationType.SUBSCRIPTION_REJECTED:
        return <XCircle sx={{ fontSize: 20, color: 'error.main' }} />;
      case OperationType.CONNECTION_DISCONNECTED:
      case OperationType.CONNECTION_CANCELLED:
      case OperationType.SUBSCRIPTION_CANCELLED:
        return <AlertCircle sx={{ fontSize: 20, color: 'warning.main' }} />;
      default:
        return <Clock sx={{ fontSize: 20, color: 'info.main' }} />;
    }
  };

  const getEventDescriptionText = (log: InfrastructureOperationLog): string => {
    const actorName = log.providerTeam?.name || log.consumerTeam?.name || 'Unknown';
    
    // Get infrastructure type from top-level or details
    const rawType = log.infrastructureType || 
                    log.serviceType ||
                    (log.details as any)?.infrastructureType ||
                    (log.details as any)?.connectionType || 
                    (log.details as any)?.serviceType || '';
    
    // Format the infrastructure/service type for display
    const formatType = (type: string) => {
      return type.toLowerCase().replace(/_/g, ' ');
    };
    
    const infrastructureType = formatType(rawType);
    
    switch (log.operationType) {
      case OperationType.CONNECTION_ACCEPTED:
        return `${actorName} accepted a ${infrastructureType} connection`;
      case OperationType.CONNECTION_REQUESTED:
        return `${actorName} requested a ${infrastructureType} connection`;
      case OperationType.CONNECTION_REJECTED:
        return `${actorName} rejected a ${infrastructureType} connection`;
      case OperationType.CONNECTION_CANCELLED:
        return `${actorName} cancelled a ${infrastructureType} connection`;
      case OperationType.CONNECTION_DISCONNECTED:
        return `${actorName} disconnected a ${infrastructureType} connection`;
      case OperationType.SUBSCRIPTION_ACCEPTED:
        return `${actorName} accepted a ${infrastructureType} subscription`;
      case OperationType.SUBSCRIPTION_REQUESTED:
        return `${actorName} requested a ${infrastructureType} subscription`;
      case OperationType.SUBSCRIPTION_REJECTED:
        return `${actorName} rejected a ${infrastructureType} subscription`;
      case OperationType.SUBSCRIPTION_CANCELLED:
        return `${actorName} cancelled a ${infrastructureType} subscription`;
      default:
        return formatOperationType(log.operationType);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Main Content */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{t('infrastructure.history.title')}</Typography>
          {loading ? (
            <LinearProgress />
          ) : historyLogs.length > 0 ? (
            <>
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('infrastructure.history.table.type')}</TableCell>
                      <TableCell>{t('infrastructure.history.table.operation')}</TableCell>
                      <TableCell>{t('infrastructure.history.table.provider')}</TableCell>
                      <TableCell>{t('infrastructure.history.table.consumer')}</TableCell>
                      <TableCell>{t('infrastructure.history.table.details')}</TableCell>
                      <TableCell>{t('infrastructure.history.table.performedBy')}</TableCell>
                      <TableCell>{t('infrastructure.history.table.timestamp')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        hover
                        onClick={() => handleLogSelect(log)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getInfrastructureIcon(log)}
                            <Typography variant="caption">
                              {(() => {
                                const type = log.infrastructureType || log.serviceType || (log.details as any)?.infrastructureType || (log.details as any)?.connectionType || (log.details as any)?.serviceType;
                                if (!type) return '-';
                                const key = `infrastructure.history.types.${type.toLowerCase().replace(/_/g, '')}`;
                                return t(key);
                              })()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(log.operationType)}
                            <Chip 
                              label={t(`infrastructure.history.operations.${log.operationType}`)} 
                              size="small"
                              color={getOperationTypeColor(log.operationType) as any}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{log.providerTeam?.name || '-'}</TableCell>
                        <TableCell>{log.consumerTeam?.name || '-'}</TableCell>
                        <TableCell>
                          {(log.details as any)?.agreedUnitPrice !== undefined && (
                            <Typography variant="caption" display="block">
                              {t('infrastructure.history.table.unitPrice')}: ${(log.details as any).agreedUnitPrice}
                            </Typography>
                          )}
                          {(log.details as any)?.unitPrice !== undefined && (
                            <Typography variant="caption" display="block">
                              {t('infrastructure.history.table.unitPrice')}: ${(log.details as any).unitPrice}
                            </Typography>
                          )}
                          {(log.details as any)?.annualFee !== undefined && (
                            <Typography variant="caption" display="block">
                              {t('infrastructure.history.table.annualFee')}: ${(log.details as any).annualFee}
                            </Typography>
                          )}
                          {(log.details as any)?.rejectionReason !== undefined && (
                            <Typography variant="caption" display="block">
                              {t('infrastructure.history.table.rejectionReason')}: {(log.details as any).rejectionReason || t('infrastructure.history.table.noReasonProvided')}
                            </Typography>
                          )}
                          {(log.details as any)?.connectionPath && (
                            <Typography variant="caption" display="block">
                              {t('infrastructure.history.table.pathLength')}: {(log.details as any).connectionPath.length} {t('infrastructure.history.table.tiles')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.performedByUser && (
                            <Typography variant="caption">
                              {log.performedByUser.name}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {format(new Date(log.timestamp), 'PPp')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={t('common.rowsPerPage')}
              />
            </>
          ) : (
            <Alert severity="info">{t('infrastructure.history.empty.noHistory')}</Alert>
          )}
        </CardContent>
      </Card>

        {/* Detail Panel */}
        {selectedLog && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('infrastructure.history.detail.title')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.operation')}</Typography>
                  <Typography variant="body1">{t(`infrastructure.history.operations.${selectedLog.operationType}`)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.timestamp')}</Typography>
                  <Typography variant="body1">{format(new Date(selectedLog.timestamp), 'PPpp')}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.provider')}</Typography>
                  <Typography variant="body1">{selectedLog.providerTeam?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.consumer')}</Typography>
                  <Typography variant="body1">{selectedLog.consumerTeam?.name || '-'}</Typography>
                </Grid>
                {selectedLog.performedByUser && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.performedBy')}</Typography>
                      <Typography variant="body1">
                        {selectedLog.performedByUser.name} ({selectedLog.performedByUser.email})
                      </Typography>
                    </Grid>
                  </>
                )}
                {((selectedLog.details as any)?.agreedUnitPrice !== undefined || (selectedLog.details as any)?.unitPrice !== undefined) && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.unitPrice')}</Typography>
                    <Typography variant="body1">${(selectedLog.details as any).agreedUnitPrice || (selectedLog.details as any).unitPrice}</Typography>
                  </Grid>
                )}
                {(selectedLog.details as any)?.annualFee !== undefined && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.annualFee')}</Typography>
                    <Typography variant="body1">${(selectedLog.details as any).annualFee}</Typography>
                  </Grid>
                )}
                {(selectedLog.details as any)?.connectionPath && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.pathLength')}</Typography>
                    <Typography variant="body1">{(selectedLog.details as any).connectionPath.length} {t('infrastructure.history.detail.tiles')}</Typography>
                  </Grid>
                )}
                {(selectedLog.details as any)?.rejectionReason !== undefined && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.rejectionReason')}</Typography>
                    <Typography variant="body1">{(selectedLog.details as any).rejectionReason || t('infrastructure.history.detail.noReasonProvided')}</Typography>
                  </Grid>
                )}
              </Grid>

              {terminationDetail && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>{t('infrastructure.history.detail.terminationInfo')}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.terminationType')}</Typography>
                      <Typography variant="body1">{terminationDetail.terminationType}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.initiatedBy')}</Typography>
                      <Typography variant="body1">{terminationDetail.initiatedBy}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.duration')}</Typography>
                      <Typography variant="body1">{terminationDetail.connectionDuration} {t('infrastructure.history.detail.days')}</Typography>
                    </Grid>
                    {terminationDetail.outstandingBalance && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.outstandingBalance')}</Typography>
                        <Typography variant="body1">${terminationDetail.outstandingBalance}</Typography>
                      </Grid>
                    )}
                    {terminationDetail.detailedReason && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">{t('infrastructure.history.detail.rejectionReason')}</Typography>
                        <Typography variant="body1">{terminationDetail.detailedReason}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        )}
    </Box>
  );
}