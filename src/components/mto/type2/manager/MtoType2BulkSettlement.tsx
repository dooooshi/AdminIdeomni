'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import {
  MtoType2Requirement,
  MtoType2BulkSettleRequest,
  MtoType2BulkSettleResponse
} from '@/lib/types/mtoType2';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2BulkSettlementProps {
  activityId: string;
}

const MtoType2BulkSettlement: React.FC<MtoType2BulkSettlementProps> = ({
  activityId
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<MtoType2Requirement[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [settling, setSettling] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [skipValidation, setSkipValidation] = useState(false);
  const [notifyTeams, setNotifyTeams] = useState(true);
  const [settlementResult, setSettlementResult] = useState<MtoType2BulkSettleResponse | null>(null);
  const [progress, setProgress] = useState(0);

  const loadRequirements = async () => {
    setLoading(true);
    try {
      const data = await MtoType2Service.getRequirements({
        status: 'IN_PROGRESS'
      });
      // Filter requirements that are ready for settlement
      const readyForSettlement = data.items.filter(r => {
        const now = new Date();
        const settlementTime = new Date(r.settlementTime);
        return settlementTime <= now && r.status === 'IN_PROGRESS';
      });
      setRequirements(readyForSettlement);
    } catch (error) {
      showError(t('mto.type2.errors.loadRequirements'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [activityId]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(requirements.map(r => r.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleBulkSettle = async () => {
    if (selected.length === 0) {
      showWarning(t('mto.type2.bulkSettlement.noSelection'));
      return;
    }

    setConfirmDialog(false);
    setSettling(true);
    setProgress(0);

    try {
      const request: MtoType2BulkSettleRequest = {
        mtoType2Ids: selected,
        skipValidation,
        notifyTeams
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await MtoType2Service.bulkSettle(request);

      clearInterval(progressInterval);
      setProgress(100);
      setSettlementResult(result);

      const successCount = result.successful;
      const failedCount = result.failed;

      if (successCount > 0) {
        showSuccess(t('mto.type2.bulkSettlement.success', { count: successCount }));
      }
      if (failedCount > 0) {
        showError(t('mto.type2.bulkSettlement.failed', { count: failedCount }));
      }

      // Reload requirements
      loadRequirements();
      setSelected([]);
    } catch (error) {
      showError((error as Error).message || t('mto.type2.errors.bulkSettle'));
    } finally {
      setSettling(false);
      setProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'info';
      case 'SETTLING': return 'warning';
      case 'SETTLED': return 'success';
      default: return 'default';
    }
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckIcon color="success" />;
      case 'FAILED': return <ErrorIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('mto.type2.bulkSettlement.title')}
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          {t('mto.type2.bulkSettlement.description')}
        </Alert>

        {settling && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('mto.type2.bulkSettlement.processing')}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t('mto.type2.bulkSettlement.selected', { count: selected.length })}
            </Typography>
            {selected.length > 0 && (
              <Button
                size="small"
                onClick={() => setSelected([])}
              >
                {t('common.clearSelection')}
              </Button>
            )}
          </Stack>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={() => setConfirmDialog(true)}
            disabled={selected.length === 0 || settling}
          >
            {t('mto.type2.bulkSettlement.settleSelected')}
          </Button>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < requirements.length}
                    checked={requirements.length > 0 && selected.length === requirements.length}
                    onChange={handleSelectAll}
                    disabled={settling}
                  />
                </TableCell>
                <TableCell>{t('mto.type2.bulkSettlement.id')}</TableCell>
                <TableCell>{t('mto.type2.bulkSettlement.formula')}</TableCell>
                <TableCell>{t('mto.type2.bulkSettlement.budget')}</TableCell>
                <TableCell>{t('mto.type2.bulkSettlement.settlementTime')}</TableCell>
                <TableCell align="center">{t('mto.type2.bulkSettlement.submissions')}</TableCell>
                <TableCell align="center">{t('mto.type2.bulkSettlement.status')}</TableCell>
                <TableCell align="center">{t('mto.type2.bulkSettlement.readiness')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requirements.map((requirement) => {
                const isItemSelected = isSelected(requirement.id);
                const now = new Date();
                const settlementTime = new Date(requirement.settlementTime);
                const isReady = settlementTime <= now;

                return (
                  <TableRow
                    key={requirement.id}
                    hover
                    onClick={() => handleSelect(requirement.id)}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        disabled={settling}
                      />
                    </TableCell>
                    <TableCell>#{requirement.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Formula #{requirement.managerProductFormulaId}
                      </Typography>
                      {requirement.metadata?.name && (
                        <Typography variant="caption" color="text.secondary">
                          {requirement.metadata.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      ${requirement.overallPurchaseBudget.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">
                          {new Date(requirement.settlementTime).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(requirement.settlementTime).toLocaleTimeString()}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={requirement.totalSubmissions || 0}
                        size="small"
                        color={requirement.totalSubmissions ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={requirement.status}
                        size="small"
                        color={getStatusColor(requirement.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {isReady ? (
                        <Chip
                          label={t('mto.type2.bulkSettlement.ready')}
                          size="small"
                          color="success"
                          icon={<CheckIcon />}
                        />
                      ) : (
                        <Chip
                          label={t('mto.type2.bulkSettlement.notReady')}
                          size="small"
                          color="warning"
                          icon={<ScheduleIcon />}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {requirements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {t('mto.type2.bulkSettlement.noRequirements')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Settlement Results */}
      {settlementResult && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('mto.type2.bulkSettlement.results')}
          </Typography>

          <Stack spacing={2}>
            <Alert
              severity={settlementResult.failed > 0 ? 'warning' : 'success'}
              icon={<ReportIcon />}
            >
              <Typography variant="subtitle2">
                {t('mto.type2.bulkSettlement.summary')}
              </Typography>
              <Typography variant="body2">
                {t('mto.type2.bulkSettlement.resultSummary', {
                  total: settlementResult.totalItems,
                  successful: settlementResult.successful,
                  failed: settlementResult.failed
                })}
              </Typography>
            </Alert>

            <Divider />

            <List>
              {settlementResult.results.map((result) => (
                <ListItem key={result.mtoType2Id}>
                  <ListItemIcon>
                    {getResultIcon(result.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`MTO Type 2 #${result.mtoType2Id}`}
                    secondary={result.message || t(`mto.type2.bulkSettlement.${result.status.toLowerCase()}`)}
                  />
                  {result.settlementId && (
                    <Chip
                      label={`Settlement #${result.settlementId}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Stack>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          {t('mto.type2.bulkSettlement.confirmTitle')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('mto.type2.bulkSettlement.confirmMessage', { count: selected.length })}
          </Alert>

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={skipValidation}
                  onChange={(e) => setSkipValidation(e.target.checked)}
                />
              }
              label={t('mto.type2.bulkSettlement.skipValidation')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={notifyTeams}
                  onChange={(e) => setNotifyTeams(e.target.checked)}
                />
              }
              label={t('mto.type2.bulkSettlement.notifyTeams')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkSettle}
            startIcon={<PlayIcon />}
          >
            {t('mto.type2.bulkSettlement.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType2BulkSettlement;