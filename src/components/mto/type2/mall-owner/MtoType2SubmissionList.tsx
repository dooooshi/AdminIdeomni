import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Badge,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import {
  MtoType2Submission,
  MtoType2Settlement,
  MtoType2SubmissionRequest,
} from '@/lib/types/mtoType2';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2SubmissionListProps {
  mallId?: number;
  requirementId?: number;
  teamId?: string;
  activityId?: string;
}

interface FilterState {
  status: string;
  tileId: string;
  dateFrom: string;
  dateTo: string;
  minValue: number;
  maxValue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const MtoType2SubmissionList: React.FC<MtoType2SubmissionListProps> = ({
  mallId,
  requirementId,
  teamId,
  activityId,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToast();

  const [submissions, setSubmissions] = useState<MtoType2Submission[]>([]);
  const [settlements, setSettlements] = useState<MtoType2Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<MtoType2Submission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [submissionToWithdraw, setSubmissionToWithdraw] = useState<MtoType2Submission | null>(null);

  const [editFormData, setEditFormData] = useState<{
    productQuantity: number;
    unitPrice: number;
  }>({
    productQuantity: 0,
    unitPrice: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    tileId: 'ALL',
    dateFrom: '',
    dateTo: '',
    minValue: 0,
    maxValue: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsData, settlementsData] = await Promise.all([
        MtoType2Service.getMallSubmissions(mallId, requirementId),
        MtoType2Service.getMallSettlements(teamId),
      ]);

      setSubmissions(submissionsData);
      setSettlements(settlementsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      showError('Failed to load submissions', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mallId, requirementId, teamId]);

  const filteredSubmissions = submissions.filter(submission => {
    if (filters.status !== 'ALL' && submission.submissionStatus !== filters.status) return false;
    if (filters.tileId !== 'ALL' && submission.tileId !== filters.tileId) return false;
    if (filters.dateFrom && new Date(submission.submittedAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(submission.submittedAt) > new Date(filters.dateTo)) return false;
    if (filters.minValue > 0 && submission.totalValue < filters.minValue) return false;
    if (filters.maxValue > 0 && submission.totalValue > filters.maxValue) return false;
    return true;
  });

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(s => s.submissionStatus === 'PENDING').length;
  const validatedSubmissions = submissions.filter(s => s.submissionStatus === 'VALIDATED').length;
  const settledSubmissions = submissions.filter(s => s.submissionStatus === 'SETTLED').length;
  const partiallySettledSubmissions = submissions.filter(s => s.submissionStatus === 'PARTIALLY_SETTLED').length;
  const unsettledSubmissions = submissions.filter(s => s.submissionStatus === 'UNSETTLED').length;

  const totalSubmissionValue = submissions.reduce((sum, s) => sum + s.totalValue, 0);
  const totalSettledValue = submissions.reduce((sum, s) => sum + (s.settledAmount || 0), 0);
  const settlementRate = totalSubmissionValue > 0 ? (totalSettledValue / totalSubmissionValue * 100).toFixed(1) : '0';

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Pending', value: pendingSubmissions, color: COLORS[0] },
    { name: 'Validated', value: validatedSubmissions, color: COLORS[1] },
    { name: 'Settled', value: settledSubmissions, color: COLORS[2] },
    { name: 'Partially Settled', value: partiallySettledSubmissions, color: COLORS[3] },
    { name: 'Unsettled', value: unsettledSubmissions, color: COLORS[4] },
  ].filter(item => item.value > 0);

  // Group submissions by tile
  const submissionsByTile = submissions.reduce((acc, submission) => {
    if (!acc[submission.tileId]) {
      acc[submission.tileId] = [];
    }
    acc[submission.tileId].push(submission);
    return acc;
  }, {} as Record<string, MtoType2Submission[]>);

  const uniqueTiles = Array.from(new Set(submissions.map(s => s.tileId))).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'VALIDATED': return 'primary';
      case 'SETTLED': return 'success';
      case 'PARTIALLY_SETTLED': return 'info';
      case 'UNSETTLED': return 'error';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <ScheduleIcon />;
      case 'VALIDATED': return <CheckCircleIcon />;
      case 'SETTLED': return <AttachMoneyIcon />;
      case 'PARTIALLY_SETTLED': return <TrendingUpIcon />;
      case 'UNSETTLED': return <CancelIcon />;
      case 'REJECTED': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const canEdit = (submission: MtoType2Submission) => {
    return submission.submissionStatus === 'PENDING' || submission.submissionStatus === 'VALIDATED';
  };

  const canWithdraw = (submission: MtoType2Submission) => {
    return submission.submissionStatus === 'PENDING' || submission.submissionStatus === 'VALIDATED';
  };

  const handleViewDetails = (submission: MtoType2Submission) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const handleEditSubmission = (submission: MtoType2Submission) => {
    setSelectedSubmission(submission);
    setEditFormData({
      productQuantity: submission.productQuantity,
      unitPrice: submission.unitPrice,
    });
    setEditFormOpen(true);
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const updatedData: Partial<MtoType2SubmissionRequest> = {
        productQuantity: editFormData.productQuantity,
        unitPrice: editFormData.unitPrice,
      };

      await MtoType2Service.updateSubmission(selectedSubmission.id, updatedData);
      showSuccess('Submission updated successfully');
      setEditFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating submission:', error);
      showError('Failed to update submission', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleWithdrawSubmission = async () => {
    if (!submissionToWithdraw) return;

    try {
      await MtoType2Service.withdrawSubmission(submissionToWithdraw.id);
      showSuccess('Submission withdrawn successfully');
      setWithdrawConfirmOpen(false);
      setSubmissionToWithdraw(null);
      loadData();
    } catch (error) {
      console.error('Error withdrawing submission:', error);
      showError('Failed to withdraw submission', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'ALL',
      tileId: 'ALL',
      dateFrom: '',
      dateTo: '',
      minValue: 0,
      maxValue: 0,
    });
  };

  if (loading && submissions.length === 0) {
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
          My Submissions & Settlement Status
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersOpen(true)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    ${totalSettledValue.toLocaleString()} of ${totalSubmissionValue.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    {partiallySettledSubmissions} partial
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Reviews
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

      {/* Status Distribution Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Submission Status Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Settlement Progress" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Settled: {settledSubmissions} submissions
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalSubmissions > 0 ? (settledSubmissions / totalSubmissions) * 100 : 0}
                  color="success"
                  sx={{ mb: 2, height: 8 }}
                />

                <Typography variant="body2" gutterBottom>
                  Partially Settled: {partiallySettledSubmissions} submissions
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalSubmissions > 0 ? (partiallySettledSubmissions / totalSubmissions) * 100 : 0}
                  color="info"
                  sx={{ mb: 2, height: 8 }}
                />

                <Typography variant="body2" gutterBottom>
                  Pending/Validated: {pendingSubmissions + validatedSubmissions} submissions
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalSubmissions > 0 ? ((pendingSubmissions + validatedSubmissions) / totalSubmissions) * 100 : 0}
                  color="warning"
                  sx={{ mb: 2, height: 8 }}
                />

                <Typography variant="body2" gutterBottom>
                  Unsettled: {unsettledSubmissions} submissions
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalSubmissions > 0 ? (unsettledSubmissions / totalSubmissions) * 100 : 0}
                  color="error"
                  sx={{ height: 8 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submissions by Tile */}
      {totalSubmissions === 0 ? (
        <Alert severity="info">
          No submissions found. Create submissions in the Market View to participate in MTO Type 2 opportunities.
        </Alert>
      ) : (
        <Card>
          <CardHeader title="Submissions by Tile" />
          <CardContent>
            {Object.entries(submissionsByTile).map(([tileId, tileSubmissions]) => (
              <Accordion key={tileId}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Typography variant="h6">Tile {tileId}</Typography>
                    <Chip
                      label={`${tileSubmissions.length} submissions`}
                      size="small"
                    />
                    <Chip
                      label={`$${tileSubmissions.reduce((sum, s) => sum + s.totalValue, 0).toLocaleString()} total value`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`$${tileSubmissions.reduce((sum, s) => sum + (s.settledAmount || 0), 0).toLocaleString()} settled`}
                      color="success"
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} elevation={1}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Requirement</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total Value</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Settled Amount</TableCell>
                          <TableCell>Submitted</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tileSubmissions
                          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                          .map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>{submission.requirementId}</TableCell>
                            <TableCell align="right">
                              {submission.productQuantity.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              ${submission.unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              ${submission.totalValue.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(submission.submissionStatus)}
                                label={submission.submissionStatus}
                                color={getStatusColor(submission.submissionStatus)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {submission.settledAmount
                                ? `$${submission.settledAmount.toLocaleString()}`
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewDetails(submission)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {canEdit(submission) && (
                                  <Tooltip title="Edit Submission">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditSubmission(submission)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {canWithdraw(submission) && (
                                  <Tooltip title="Withdraw Submission">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => {
                                        setSubmissionToWithdraw(submission);
                                        setWithdrawConfirmOpen(true);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters Dialog */}
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Submissions</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="VALIDATED">Validated</MenuItem>
                  <MenuItem value="SETTLED">Settled</MenuItem>
                  <MenuItem value="PARTIALLY_SETTLED">Partially Settled</MenuItem>
                  <MenuItem value="UNSETTLED">Unsettled</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tile ID</InputLabel>
                <Select
                  value={filters.tileId}
                  onChange={(e) => setFilters(prev => ({ ...prev, tileId: e.target.value }))}
                  label="Tile ID"
                >
                  <MenuItem value="ALL">All Tiles</MenuItem>
                  {uniqueTiles.map(tileId => (
                    <MenuItem key={tileId} value={tileId}>Tile {tileId}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Date From"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Date To"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Min Value"
                type="number"
                value={filters.minValue || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minValue: parseInt(e.target.value) || 0 }))}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Max Value"
                type="number"
                value={filters.maxValue || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxValue: parseInt(e.target.value) || 0 }))}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button onClick={() => setFiltersOpen(false)}>Cancel</Button>
          <Button onClick={() => setFiltersOpen(false)} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submission Details</DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Requirement ID:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedSubmission.requirementId}
                  </Typography>

                  <Typography variant="subtitle2">Team ID:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedSubmission.teamId}
                  </Typography>

                  <Typography variant="subtitle2">Tile ID:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedSubmission.tileId}
                  </Typography>

                  <Typography variant="subtitle2">MALL Level:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedSubmission.mallLevel}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Product Quantity:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedSubmission.productQuantity.toLocaleString()}
                  </Typography>

                  <Typography variant="subtitle2">Unit Price:</Typography>
                  <Typography variant="body2" gutterBottom>
                    ${selectedSubmission.unitPrice.toLocaleString()}
                  </Typography>

                  <Typography variant="subtitle2">Total Value:</Typography>
                  <Typography variant="body2" gutterBottom color="primary" fontWeight="bold">
                    ${selectedSubmission.totalValue.toLocaleString()}
                  </Typography>

                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip
                    icon={getStatusIcon(selectedSubmission.submissionStatus)}
                    label={selectedSubmission.submissionStatus}
                    color={getStatusColor(selectedSubmission.submissionStatus)}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2">Settlement Information:</Typography>
                  {selectedSubmission.settledQuantity ? (
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2">
                        Settled Quantity: {selectedSubmission.settledQuantity.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Settled Amount: ${selectedSubmission.settledAmount?.toLocaleString()}
                      </Typography>
                      {selectedSubmission.settledAt && (
                        <Typography variant="body2">
                          Settled At: {new Date(selectedSubmission.settledAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ pl: 2 }}>
                      Not yet settled
                    </Typography>
                  )}
                </Grid>

                {selectedSubmission.validationErrors && selectedSubmission.validationErrors.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      <Typography variant="subtitle2" gutterBottom>
                        Validation Errors:
                      </Typography>
                      <List dense>
                        {selectedSubmission.validationErrors.map((error, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <WarningIcon color="error" />
                            </ListItemIcon>
                            <ListItemText primary={error} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="textSecondary">
                    Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedSubmission && canEdit(selectedSubmission) && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailsOpen(false);
                handleEditSubmission(selectedSubmission);
              }}
            >
              Edit Submission
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={editFormOpen} onClose={() => setEditFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Submission</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Product Quantity"
                type="number"
                value={editFormData.productQuantity}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  productQuantity: parseInt(e.target.value) || 0
                }))}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={editFormData.unitPrice}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  unitPrice: parseFloat(e.target.value) || 0
                }))}
                InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Total Value: ${(editFormData.productQuantity * editFormData.unitPrice).toLocaleString()}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFormOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateSubmission}
            variant="contained"
            disabled={editFormData.productQuantity <= 0 || editFormData.unitPrice <= 0}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog
        open={withdrawConfirmOpen}
        onClose={() => setWithdrawConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Withdrawal</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The submission will be permanently removed.
          </Alert>
          {submissionToWithdraw && (
            <Typography variant="body1">
              Are you sure you want to withdraw the submission for Tile {submissionToWithdraw.tileId}?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleWithdrawSubmission}
            variant="contained"
            color="error"
          >
            Withdraw Submission
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType2SubmissionList;