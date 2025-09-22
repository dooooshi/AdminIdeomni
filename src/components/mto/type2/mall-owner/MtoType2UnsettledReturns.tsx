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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Calculate as CalculateIcon,
  Warehouse as WarehouseIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import {
  MtoType2Submission,
  MtoType2UnsettledReturn,
  MtoType2UnsettledReturnRequest
} from '@/lib/types/mtoType2';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2UnsettledReturnsProps {
  teamId: string;
  activityId: string;
}

const MtoType2UnsettledReturns: React.FC<MtoType2UnsettledReturnsProps> = ({
  teamId,
  activityId
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToast();

  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<MtoType2Submission[]>([]);
  const [returns, setReturns] = useState<MtoType2UnsettledReturn[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<MtoType2Submission | null>(null);
  const [returnDialog, setReturnDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Return form state
  const [targetFacilityId, setTargetFacilityId] = useState('');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [transportationFee, setTransportationFee] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [validatingCapacity, setValidatingCapacity] = useState(false);
  const [capacityValid, setCapacityValid] = useState(false);
  const [availableSpace, setAvailableSpace] = useState(0);

  const loadUnsettledSubmissions = async () => {
    setLoading(true);
    try {
      // Get submissions with unsettled products
      const allSubmissions = await MtoType2Service.getMallSubmissions();
      const unsettled = allSubmissions.filter(
        s => s.submissionStatus === 'UNSETTLED' ||
             s.submissionStatus === 'PARTIALLY_SETTLED'
      );
      setSubmissions(unsettled);

      // Get existing returns
      const existingReturns = await MtoType2Service.getUnsettledReturns(teamId);
      setReturns(existingReturns);
    } catch (error: any) {
      showError(error.message || t('mto.type2.errors.loadSubmissions'));
    } finally {
      setLoading(false);
    }
  };

  const loadFacilities = async () => {
    try {
      // Mock loading facilities - replace with actual API call
      const mockFacilities = [
        { id: 'facility-1', name: t('mto.type2.unsettled.mainWarehouse'), type: 'WAREHOUSE', tileId: 'tile-1' },
        { id: 'facility-2', name: t('mto.type2.unsettled.secondaryStorage'), type: 'STORAGE', tileId: 'tile-2' },
        { id: 'facility-3', name: t('mto.type2.unsettled.distributionCenter'), type: 'WAREHOUSE', tileId: 'tile-3' }
      ];
      setFacilities(mockFacilities);
    } catch (error: any) {
      showError(t('mto.type2.errors.loadFacilities'));
    }
  };

  useEffect(() => {
    loadUnsettledSubmissions();
    loadFacilities();
  }, [teamId, activityId]);

  const calculateTransportationFee = async () => {
    if (!selectedSubmission || !targetFacilityId) return;

    try {
      const result = await MtoType2Service.calculateTransportationFee(
        selectedSubmission.mallFacilityId.toString(),
        targetFacilityId,
        selectedSubmission.productQuantity - (selectedSubmission.settledQuantity || 0)
      );

      setTransportationFee(result.fee);
      setEstimatedTime(result.estimatedTime);
      setActiveStep(1);
    } catch (error: any) {
      showError(t('mto.type2.errors.calculateFee'));
    }
  };

  const validateCapacity = async () => {
    if (!selectedSubmission || !targetFacilityId) return;

    setValidatingCapacity(true);
    try {
      const unsettledQuantity = selectedSubmission.productQuantity - (selectedSubmission.settledQuantity || 0);
      const result = await MtoType2Service.validateFacilityCapacity(
        targetFacilityId,
        unsettledQuantity
      );

      setCapacityValid(result.hasCapacity);
      setAvailableSpace(result.availableSpace);

      if (!result.hasCapacity) {
        showWarning(result.message || t('mto.type2.validation.insufficientCapacity'));
      } else {
        setActiveStep(2);
      }
    } catch (error: any) {
      showError(t('mto.type2.errors.validateCapacity'));
    } finally {
      setValidatingCapacity(false);
    }
  };

  const confirmReturn = async () => {
    if (!selectedSubmission || !targetFacilityId) return;

    try {
      const returnRequest: MtoType2UnsettledReturnRequest = {
        submissionId: selectedSubmission.id,
        targetFacilitySpaceId: parseInt(targetFacilityId)
      };

      const result = await MtoType2Service.createUnsettledReturn(returnRequest);

      showSuccess(t('mto.type2.success.returnRequested'));
      setReturnDialog(false);
      resetReturnForm();
      loadUnsettledSubmissions();
    } catch (error: any) {
      showError(error.message || t('mto.type2.errors.returnRequest'));
    }
  };

  const resetReturnForm = () => {
    setSelectedSubmission(null);
    setTargetFacilityId('');
    setTransportationFee(null);
    setEstimatedTime('');
    setCapacityValid(false);
    setAvailableSpace(0);
    setActiveStep(0);
  };

  const getReturnStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'IN_TRANSIT': return 'info';
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const getReturnStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <InfoIcon />;
      case 'IN_TRANSIT': return <ShippingIcon />;
      case 'COMPLETED': return <CheckIcon />;
      case 'FAILED': return <ErrorIcon />;
      default: return null;
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('mto.type2.unsettledReturns.title')}
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          {t('mto.type2.unsettledReturns.description')}
        </Alert>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('mto.type2.unsettledReturns.submission')}</TableCell>
                <TableCell>{t('mto.type2.unsettledReturns.mall')}</TableCell>
                <TableCell align="center">{t('mto.type2.unsettledReturns.totalQuantity')}</TableCell>
                <TableCell align="center">{t('mto.type2.unsettledReturns.settledQuantity')}</TableCell>
                <TableCell align="center">{t('mto.type2.unsettledReturns.unsettledQuantity')}</TableCell>
                <TableCell align="right">{t('mto.type2.unsettledReturns.value')}</TableCell>
                <TableCell align="center">{t('mto.type2.unsettledReturns.status')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => {
                const unsettledQty = submission.productQuantity - (submission.settledQuantity || 0);
                const existingReturn = returns.find(r => r.submissionId === submission.id);

                return (
                  <TableRow key={submission.id}>
                    <TableCell>#{submission.id}</TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">
                          Mall #{submission.mallFacilityId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Level {submission.mallLevel}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">{submission.productQuantity}</TableCell>
                    <TableCell align="center">{submission.settledQuantity || 0}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={unsettledQty}
                        color={unsettledQty > 0 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${(unsettledQty * submission.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      {existingReturn ? (
                        <Chip
                          label={existingReturn.returnStatus}
                          color={getReturnStatusColor(existingReturn.returnStatus)}
                          icon={getReturnStatusIcon(existingReturn.returnStatus)}
                          size="small"
                        />
                      ) : (
                        <Chip label="NO_RETURN" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {unsettledQty > 0 && !existingReturn && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ShippingIcon />}
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setReturnDialog(true);
                          }}
                        >
                          {t('mto.type2.unsettledReturns.requestReturn')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {t('mto.type2.unsettledReturns.noUnsettled')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Existing Returns */}
      {returns.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('mto.type2.unsettledReturns.existingReturns')}
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('mto.type2.unsettledReturns.returnId')}</TableCell>
                  <TableCell>{t('mto.type2.unsettledReturns.targetFacility')}</TableCell>
                  <TableCell align="center">{t('mto.type2.unsettledReturns.quantity')}</TableCell>
                  <TableCell align="right">{t('mto.type2.unsettledReturns.transportFee')}</TableCell>
                  <TableCell align="center">{t('mto.type2.unsettledReturns.status')}</TableCell>
                  <TableCell>{t('mto.type2.unsettledReturns.requestedAt')}</TableCell>
                  <TableCell>{t('mto.type2.unsettledReturns.completedAt')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returns.map((returnItem) => (
                  <TableRow key={returnItem.submissionId}>
                    <TableCell>#{returnItem.submissionId}</TableCell>
                    <TableCell>{returnItem.targetFacilityName}</TableCell>
                    <TableCell align="center">{returnItem.unsettledQuantity}</TableCell>
                    <TableCell align="right">${returnItem.transportationFee.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={returnItem.returnStatus}
                        color={getReturnStatusColor(returnItem.returnStatus)}
                        icon={getReturnStatusIcon(returnItem.returnStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(returnItem.requestedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {returnItem.completedAt && (
                        <Typography variant="caption">
                          {new Date(returnItem.completedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Return Request Dialog */}
      <Dialog
        open={returnDialog}
        onClose={() => {
          setReturnDialog(false);
          resetReturnForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('mto.type2.unsettledReturns.returnDialogTitle')}
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {t('mto.type2.unsettledReturns.returnWarning', {
                    quantity: selectedSubmission.productQuantity - (selectedSubmission.settledQuantity || 0)
                  })}
                </Typography>
              </Alert>

              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>
                    {t('mto.type2.unsettledReturns.step1Title')}
                  </StepLabel>
                  <StepContent>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>{t('mto.type2.unsettledReturns.targetFacility')}</InputLabel>
                      <Select
                        value={targetFacilityId}
                        onChange={(e) => setTargetFacilityId(e.target.value)}
                        startAdornment={<WarehouseIcon sx={{ mr: 1 }} />}
                      >
                        {facilities.map((facility) => (
                          <MenuItem key={facility.id} value={facility.id}>
                            {facility.name} ({facility.type})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={calculateTransportationFee}
                      disabled={!targetFacilityId}
                      startIcon={<CalculateIcon />}
                    >
                      {t('mto.type2.unsettledReturns.calculateFee')}
                    </Button>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>
                    {t('mto.type2.unsettledReturns.step2Title')}
                  </StepLabel>
                  <StepContent>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.type2.unsettledReturns.transportFee')}:
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              ${transportationFee?.toFixed(2)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              {t('mto.type2.unsettledReturns.estimatedTime')}:
                            </Typography>
                            <Typography variant="body1">
                              {estimatedTime}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                    <Button
                      variant="contained"
                      onClick={validateCapacity}
                      disabled={validatingCapacity}
                      startIcon={validatingCapacity ? <CircularProgress size={20} /> : <CheckIcon />}
                    >
                      {t('mto.type2.unsettledReturns.validateCapacity')}
                    </Button>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>
                    {t('mto.type2.unsettledReturns.step3Title')}
                  </StepLabel>
                  <StepContent>
                    {capacityValid ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {t('mto.type2.unsettledReturns.capacityValid', {
                          available: availableSpace
                        })}
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {t('mto.type2.unsettledReturns.capacityInvalid', {
                          available: availableSpace,
                          required: selectedSubmission.productQuantity - (selectedSubmission.settledQuantity || 0)
                        })}
                      </Alert>
                    )}
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setReturnDialog(false);
            resetReturnForm();
          }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={confirmReturn}
            disabled={!capacityValid || activeStep !== 2}
            startIcon={<ShippingIcon />}
          >
            {t('mto.type2.unsettledReturns.confirmReturn')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType2UnsettledReturns;