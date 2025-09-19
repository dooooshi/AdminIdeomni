import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  GridLegacy as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

import {
  MtoType2Requirement,
  MtoType2Submission,
  MtoType2Settlement,
  MtoType2SettlementHistory,
  MtoType2MallBudget,
} from '@/lib/types/mtoType2';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2SettlementManagerProps {
  requirement?: MtoType2Requirement;
  activityId?: string;
  onRefresh?: () => void;
}

export const MtoType2SettlementManager: React.FC<MtoType2SettlementManagerProps> = ({
  requirement,
  activityId,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [submissions, setSubmissions] = useState<MtoType2Submission[]>([]);
  const [settlements, setSettlements] = useState<MtoType2Settlement[]>([]);
  const [settlementHistory, setSettlementHistory] = useState<MtoType2SettlementHistory[]>([]);
  const [budgets, setBudgets] = useState<MtoType2MallBudget[]>([]);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsData, settlementsData, historyData, budgetsData] = await Promise.all([
        MtoType2Service.getSubmissions(requirement.id),
        MtoType2Service.getSettlements(requirement.id),
        MtoType2Service.getSettlementHistory(requirement.id),
        MtoType2Service.getMallBudgets(requirement.id),
      ]);

      setSubmissions(submissionsData);
      setSettlements(settlementsData);
      setSettlementHistory(historyData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading settlement data:', error);
      showError('Failed to load settlement data', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    try {
      setSettling(true);
      const result = await MtoType2Service.settleRequirement(requirement.id);
      showSuccess('Settlement process completed successfully');
      setConfirmDialogOpen(false);
      loadData();
      onRefresh?.();
    } catch (error) {
      console.error('Error during settlement:', error);
      showError('Failed to process settlement', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSettling(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requirement.id]);

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(s => s.submissionStatus === 'PENDING').length;
  const validatedSubmissions = submissions.filter(s => s.submissionStatus === 'VALIDATED').length;
  const settledSubmissions = submissions.filter(s => s.submissionStatus === 'SETTLED').length;
  const partiallySettledSubmissions = submissions.filter(s => s.submissionStatus === 'PARTIALLY_SETTLED').length;
  const unsettledSubmissions = submissions.filter(s => s.submissionStatus === 'UNSETTLED').length;

  const totalRequestedValue = submissions.reduce((sum, s) => sum + s.totalValue, 0);
  const totalSettledValue = settlements.reduce((sum, s) => sum + s.totalPayment, 0);
  const settlementRate = totalRequestedValue > 0 ? (totalSettledValue / totalRequestedValue * 100).toFixed(1) : '0';

  // Sort submissions by priority (price ascending, then by mall level descending)
  const prioritizedSubmissions = [...submissions].sort((a, b) => {
    if (a.unitPrice !== b.unitPrice) {
      return a.unitPrice - b.unitPrice; // Lower price first
    }
    return b.mallLevel - a.mallLevel; // Higher level first for same price
  });

  // Group submissions by tile for better visualization
  const submissionsByTile = submissions.reduce((acc, submission) => {
    if (!acc[submission.tileId]) {
      acc[submission.tileId] = [];
    }
    acc[submission.tileId].push(submission);
    return acc;
  }, {} as Record<string, MtoType2Submission[]>);

  // Price analysis data for chart
  const priceDistributionData = submissions.reduce((acc, submission) => {
    const priceRange = Math.floor(submission.unitPrice / 10) * 10;
    const key = `$${priceRange}-${priceRange + 10}`;
    if (!acc[key]) {
      acc[key] = { range: key, count: 0, totalValue: 0 };
    }
    acc[key].count++;
    acc[key].totalValue += submission.totalValue;
    return acc;
  }, {} as Record<string, { range: string; count: number; totalValue: number }>);

  const priceChartData = Object.values(priceDistributionData);

  const settlementSteps = [
    'Validate Submissions',
    'Calculate Priorities',
    'Allocate Budget',
    'Process Payments',
    'Complete Settlement',
  ];

  const canSettle = requirement.status === 'IN_PROGRESS' && pendingSubmissions === 0 && validatedSubmissions > 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Settlement Manager - {requirement.metadata?.name || `Requirement ${requirement.id}`}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => setConfirmDialogOpen(true)}
            disabled={!canSettle || settling}
            color="primary"
          >
            Start Settlement
          </Button>
        </Box>
      </Box>

      {/* Status Alert */}
      {!canSettle && (
        <Alert
          severity={requirement.status === 'SETTLED' ? 'success' : 'info'}
          sx={{ mb: 3 }}
        >
          {requirement.status === 'SETTLED'
            ? 'This requirement has been settled.'
            : requirement.status !== 'IN_PROGRESS'
            ? `Settlement is only available for requirements in IN_PROGRESS status. Current status: ${requirement.status}`
            : pendingSubmissions > 0
            ? `Settlement cannot start while there are ${pendingSubmissions} pending submissions. All submissions must be validated first.`
            : 'No validated submissions available for settlement.'
          }
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Submissions
                  </Typography>
                  <Typography variant="h5">
                    {totalSubmissions}
                  </Typography>
                </Box>
                <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Settlement Rate
                  </Typography>
                  <Typography variant="h5">
                    {settlementRate}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ${totalSettledValue.toLocaleString()} of ${totalRequestedValue.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Settled Submissions
                  </Typography>
                  <Typography variant="h5">
                    {settledSubmissions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {partiallySettledSubmissions} partial, {unsettledSubmissions} unsettled
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Validations
                  </Typography>
                  <Typography variant="h5">
                    {pendingSubmissions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {validatedSubmissions} validated
                  </Typography>
                </Box>
                <Badge badgeContent={pendingSubmissions} color="warning">
                  <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settlement Progress Stepper */}
      {requirement.status === 'IN_PROGRESS' && (
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title="Settlement Process"
            avatar={<TimelineIcon />}
          />
          <CardContent>
            <Stepper activeStep={activeStep} orientation="horizontal">
              {settlementSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(activeStep / (settlementSteps.length - 1)) * 100}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Price Distribution Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Price Distribution Analysis" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Submission Status Distribution" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Validated: {validatedSubmissions}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalSubmissions > 0 ? (validatedSubmissions / totalSubmissions) * 100 : 0}
                  color="success"
                  sx={{ mb: 1 }}
                />

                <Typography variant="body2" gutterBottom>
                  Pending: {pendingSubmissions}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalSubmissions > 0 ? (pendingSubmissions / totalSubmissions) * 100 : 0}
                  color="warning"
                  sx={{ mb: 1 }}
                />

                <Typography variant="body2" gutterBottom>
                  Settled: {settledSubmissions}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalSubmissions > 0 ? (settledSubmissions / totalSubmissions) * 100 : 0}
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submissions by Priority Ranking */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Settlement Priority Ranking"
          subheader="Sorted by price (ascending) and mall level (descending)"
        />
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Team ID</TableCell>
                  <TableCell>Tile ID</TableCell>
                  <TableCell>MALL Level</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Settled Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prioritizedSubmissions.map((submission, index) => (
                  <TableRow
                    key={submission.id}
                    sx={{
                      backgroundColor:
                        submission.submissionStatus === 'SETTLED' ? 'success.light' :
                        submission.submissionStatus === 'PARTIALLY_SETTLED' ? 'warning.light' :
                        submission.submissionStatus === 'UNSETTLED' ? 'error.light' :
                        'inherit'
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={index + 1}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{submission.teamId}</TableCell>
                    <TableCell>
                      <Chip
                        label={submission.tileId}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.mallLevel}
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${submission.unitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {submission.productQuantity.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ${submission.totalValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.submissionStatus}
                        color={
                          submission.submissionStatus === 'SETTLED' ? 'success' :
                          submission.submissionStatus === 'VALIDATED' ? 'primary' :
                          submission.submissionStatus === 'PARTIALLY_SETTLED' ? 'warning' :
                          submission.submissionStatus === 'UNSETTLED' ? 'error' :
                          'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {submission.settledAmount ? `$${submission.settledAmount.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Submissions by Tile */}
      <Card>
        <CardHeader title="Submissions by Tile" />
        <CardContent>
          {Object.entries(submissionsByTile).map(([tileId, tileSubmissions]) => {
            const tileBudget = budgets.find(b => b.tileId === tileId);
            return (
              <Accordion key={tileId}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Typography variant="h6">Tile {tileId}</Typography>
                    <Chip
                      label={`${tileSubmissions.length} submissions`}
                      size="small"
                    />
                    {tileBudget && (
                      <Chip
                        label={`Budget: $${tileBudget.allocatedBudget.toLocaleString()}`}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Team ID</TableCell>
                          <TableCell>MALL Level</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Total Value</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tileSubmissions
                          .sort((a, b) => a.unitPrice - b.unitPrice)
                          .map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>{submission.teamId}</TableCell>
                            <TableCell>
                              <Chip
                                label={submission.mallLevel}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              ${submission.unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              {submission.productQuantity.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              ${submission.totalValue.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={submission.submissionStatus}
                                color={
                                  submission.submissionStatus === 'SETTLED' ? 'success' :
                                  submission.submissionStatus === 'VALIDATED' ? 'primary' :
                                  submission.submissionStatus === 'PARTIALLY_SETTLED' ? 'warning' :
                                  submission.submissionStatus === 'UNSETTLED' ? 'error' :
                                  'default'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </CardContent>
      </Card>

      {/* Settlement Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Settlement Process</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will start the settlement process and cannot be undone.
          </Alert>
          <Typography variant="body1" gutterBottom>
            Settlement Summary:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • Total submissions to process: {validatedSubmissions}
            </Typography>
            <Typography variant="body2">
              • Total budget available: ${requirement.overallPurchaseBudget.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              • Settlement will prioritize by price (lowest first) and mall level (highest first for same price)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSettle}
            disabled={settling}
            variant="contained"
            color="primary"
          >
            {settling ? <CircularProgress size={20} /> : 'Start Settlement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType2SettlementManager;