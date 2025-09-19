import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  GridLegacy as Grid,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Badge,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import {
  MtoType2MallOwnerView,
  MtoType2Status,
} from '@/lib/types/mtoType2';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useToast } from '@/components/common/ToastProvider';
import MtoType2SubmissionForm from './MtoType2SubmissionForm';

interface MtoType2MarketViewProps {
  activityId?: string;
  teamId?: string;
  onSubmissionCreated?: () => void;
}

interface FilterState {
  status: keyof MtoType2Status | 'ALL';
  minBudget: number;
  maxBudget: number;
  hasMyMalls: boolean;
}

export const MtoType2MarketView: React.FC<MtoType2MarketViewProps> = ({
  activityId,
  teamId,
  onSubmissionCreated,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [requirements, setRequirements] = useState<MtoType2MallOwnerView[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<MtoType2MallOwnerView | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submissionFormOpen, setSubmissionFormOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    minBudget: 0,
    maxBudget: 0,
    hasMyMalls: false,
  });

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const data = await MtoType2Service.getAvailableForMall(activityId);
      setRequirements(data);

      // Update filter max budget based on loaded data
      const maxBudget = Math.max(...data.map(r => r.totalBudget), 0);
      setFilters(prev => ({ ...prev, maxBudget }));
    } catch (error) {
      console.error('Error loading requirements:', error);
      showError('Failed to load MTO Type 2 opportunities', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [activityId]);

  const filteredRequirements = requirements.filter(req => {
    if (filters.status !== 'ALL' && req.status !== filters.status) return false;
    if (filters.minBudget > 0 && req.totalBudget < filters.minBudget) return false;
    if (filters.maxBudget > 0 && req.totalBudget > filters.maxBudget) return false;
    if (filters.hasMyMalls && req.myMalls.length === 0) return false;
    return true;
  });

  const getStatusColor = (status: keyof MtoType2Status) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'RELEASED': return 'primary';
      case 'IN_PROGRESS': return 'warning';
      case 'SETTLED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: keyof MtoType2Status) => {
    switch (status) {
      case 'DRAFT': return <ScheduleIcon />;
      case 'RELEASED': return <TrendingUpIcon />;
      case 'IN_PROGRESS': return <TimelineIcon />;
      case 'SETTLED': return <AttachMoneyIcon />;
      case 'CANCELLED': return <ScheduleIcon />;
      default: return <InfoIcon />;
    }
  };

  const calculateTimeRemaining = (targetTime: string) => {
    const target = new Date(targetTime);
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getOpportunityScore = (req: MtoType2MallOwnerView) => {
    let score = 0;

    // Base score from number of owned malls
    score += req.myMalls.length * 20;

    // Budget size bonus
    if (req.totalBudget > 100000) score += 30;
    else if (req.totalBudget > 50000) score += 20;
    else if (req.totalBudget > 10000) score += 10;

    // Competition penalty
    const avgCompetitors = req.myMalls.reduce((sum, mall) => sum + mall.competitorCount, 0) / req.myMalls.length;
    if (avgCompetitors < 3) score += 20;
    else if (avgCompetitors < 5) score += 10;
    else score -= 10;

    // Status bonus
    if (req.status === 'RELEASED') score += 15;
    else if (req.status === 'IN_PROGRESS') score += 10;

    return Math.max(0, Math.min(100, score));
  };

  const handleViewDetails = (requirement: MtoType2MallOwnerView) => {
    setSelectedRequirement(requirement);
    setDetailsOpen(true);
  };

  const handleCreateSubmission = (requirement: MtoType2MallOwnerView) => {
    setSelectedRequirement(requirement);
    setSubmissionFormOpen(true);
  };

  const handleSubmissionCreated = () => {
    setSubmissionFormOpen(false);
    loadRequirements();
    onSubmissionCreated?.();
  };

  const resetFilters = () => {
    setFilters({
      status: 'ALL',
      minBudget: 0,
      maxBudget: Math.max(...requirements.map(r => r.totalBudget), 0),
      hasMyMalls: false,
    });
  };

  if (loading && requirements.length === 0) {
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
          MTO Type 2 Market Opportunities
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
            onClick={loadRequirements}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Available Opportunities
                  </Typography>
                  <Typography variant="h5">
                    {filteredRequirements.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    of {requirements.length} total
                  </Typography>
                </Box>
                <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Total Budget Available
                  </Typography>
                  <Typography variant="h5">
                    ${filteredRequirements.reduce((sum, req) => sum + req.totalBudget, 0).toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoneyIcon color="success" sx={{ fontSize: 40 }} />
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
                    My Eligible MALLs
                  </Typography>
                  <Typography variant="h5">
                    {filteredRequirements.reduce((sum, req) => sum + req.myMalls.length, 0)}
                  </Typography>
                </Box>
                <StoreIcon color="info" sx={{ fontSize: 40 }} />
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
                    Active Submissions
                  </Typography>
                  <Typography variant="h5">
                    {filteredRequirements.reduce((sum, req) => sum + req.mySubmissions.length, 0)}
                  </Typography>
                </Box>
                <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requirements List */}
      {filteredRequirements.length === 0 ? (
        <Alert severity="info">
          {requirements.length === 0
            ? 'No MTO Type 2 opportunities are currently available.'
            : 'No opportunities match your current filters. Try adjusting your filter criteria.'
          }
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredRequirements.map((requirement) => {
            const opportunityScore = getOpportunityScore(requirement);
            const hasSubmissions = requirement.mySubmissions.length > 0;

            return (
              <Grid item xs={12} lg={6} key={requirement.requirementId}>
                <Card
                  sx={{
                    height: '100%',
                    border: opportunityScore > 70 ? '2px solid' : '1px solid',
                    borderColor: opportunityScore > 70 ? 'success.main' : 'divider',
                    position: 'relative',
                  }}
                >
                  {/* Opportunity Badge */}
                  {opportunityScore > 70 && (
                    <Chip
                      label="High Opportunity"
                      color="success"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardHeader
                    avatar={getStatusIcon(requirement.status)}
                    title={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">
                          {requirement.requirementName || `Requirement ${requirement.requirementId}`}
                        </Typography>
                        <Chip
                          label={requirement.status}
                          color={getStatusColor(requirement.status)}
                          size="small"
                        />
                      </Box>
                    }
                    subheader={`Budget: $${requirement.totalBudget.toLocaleString()}`}
                  />

                  <CardContent>
                    {/* Key Metrics */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          My MALLs
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {requirement.myMalls.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          My Submissions
                        </Typography>
                        <Typography variant="h6" color={hasSubmissions ? 'success.main' : 'textSecondary'}>
                          {requirement.mySubmissions.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Opportunity Score
                        </Typography>
                        <Typography
                          variant="h6"
                          color={
                            opportunityScore > 70 ? 'success.main' :
                            opportunityScore > 50 ? 'warning.main' :
                            'error.main'
                          }
                        >
                          {opportunityScore}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* MALL Details */}
                    {requirement.myMalls.length > 0 && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Eligible MALLs ({requirement.myMalls.length})
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                          {requirement.myMalls.slice(0, 3).map((mall) => (
                            <Tooltip
                              key={mall.mallId}
                              title={`Population: ${mall.population.toLocaleString()}, Competitors: ${mall.competitorCount}, Budget Share: $${mall.estimatedBudgetShare.toLocaleString()}`}
                            >
                              <Chip
                                label={`Tile ${mall.tileId} (L${mall.level})`}
                                size="small"
                                variant="outlined"
                                color={mall.competitorCount < 3 ? 'success' : mall.competitorCount < 5 ? 'warning' : 'error'}
                              />
                            </Tooltip>
                          ))}
                          {requirement.myMalls.length > 3 && (
                            <Chip
                              label={`+${requirement.myMalls.length - 3} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </>
                    )}

                    {/* Market Insights */}
                    {requirement.marketInsights && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Market Insights
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Participating MALLs: {requirement.marketInsights.participatingMalls}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Avg Submission: {requirement.marketInsights.averageSubmissionSize.toLocaleString()}
                          </Typography>
                          {requirement.marketInsights.priceRange && (
                            <Typography variant="body2" color="textSecondary">
                              Price Range: ${requirement.marketInsights.priceRange.min.toLocaleString()} - ${requirement.marketInsights.priceRange.max.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}

                    {/* Submission Summary */}
                    {hasSubmissions && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          My Submissions
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {requirement.mySubmissions.slice(0, 2).map((submission) => (
                            <Box key={`${submission.mallId}-${submission.tileId}`} sx={{ mb: 1 }}>
                              <Typography variant="body2">
                                Tile {submission.tileId}: {submission.quantity.toLocaleString()} @ ${submission.unitPrice.toLocaleString()}
                                <Chip
                                  label={submission.status}
                                  size="small"
                                  sx={{ ml: 1 }}
                                  color={
                                    submission.status === 'SETTLED' ? 'success' :
                                    submission.status === 'PENDING' ? 'warning' :
                                    'default'
                                  }
                                />
                              </Typography>
                            </Box>
                          ))}
                          {requirement.mySubmissions.length > 2 && (
                            <Typography variant="body2" color="textSecondary">
                              +{requirement.mySubmissions.length - 2} more submissions
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}

                    {/* Action Buttons */}
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(requirement)}
                      >
                        Details
                      </Button>
                      {requirement.myMalls.length > 0 && requirement.status === 'RELEASED' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleCreateSubmission(requirement)}
                        >
                          Submit
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Filters Dialog */}
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Opportunities</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  label="Status"
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="RELEASED">Released</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="SETTLED">Settled</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Budget"
                type="number"
                value={filters.minBudget || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minBudget: parseInt(e.target.value) || 0 }))}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Budget"
                type="number"
                value={filters.maxBudget || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: parseInt(e.target.value) || 0 }))}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>MALL Eligibility</InputLabel>
                <Select
                  value={filters.hasMyMalls ? 'eligible' : 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasMyMalls: e.target.value === 'eligible' }))}
                  label="MALL Eligibility"
                >
                  <MenuItem value="all">All Opportunities</MenuItem>
                  <MenuItem value="eligible">Only Where I Have MALLs</MenuItem>
                </Select>
              </FormControl>
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Opportunity Details
        </DialogTitle>
        <DialogContent>
          {selectedRequirement && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedRequirement.requirementName || `Requirement ${selectedRequirement.requirementId}`}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={selectedRequirement.status}
                      color={getStatusColor(selectedRequirement.status)}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body1" component="span">
                      Budget: ${selectedRequirement.totalBudget.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    My Eligible MALLs
                  </Typography>
                  <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tile ID</TableCell>
                          <TableCell>Level</TableCell>
                          <TableCell align="right">Population</TableCell>
                          <TableCell align="right">Competitors</TableCell>
                          <TableCell align="right">Est. Budget Share</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRequirement.myMalls.map((mall) => (
                          <TableRow key={mall.mallId}>
                            <TableCell>{mall.tileId}</TableCell>
                            <TableCell>
                              <Chip label={mall.level} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              {mall.population.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={mall.competitorCount}
                                size="small"
                                color={mall.competitorCount < 3 ? 'success' : mall.competitorCount < 5 ? 'warning' : 'error'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              ${mall.estimatedBudgetShare.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {selectedRequirement.mySubmissions.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      My Submissions
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tile ID</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Expected Revenue</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Settled Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRequirement.mySubmissions.map((submission, index) => (
                            <TableRow key={index}>
                              <TableCell>{submission.tileId}</TableCell>
                              <TableCell align="right">
                                {submission.quantity.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                ${submission.unitPrice.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                ${submission.expectedRevenue.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={submission.status}
                                  size="small"
                                  color={
                                    submission.status === 'SETTLED' ? 'success' :
                                    submission.status === 'PENDING' ? 'warning' :
                                    'default'
                                  }
                                />
                              </TableCell>
                              <TableCell align="right">
                                {submission.settledAmount
                                  ? `$${submission.settledAmount.toLocaleString()}`
                                  : '-'
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedRequirement?.myMalls.length > 0 && selectedRequirement.status === 'RELEASED' && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailsOpen(false);
                handleCreateSubmission(selectedRequirement);
              }}
            >
              Create Submission
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Submission Form Dialog */}
      <Dialog
        open={submissionFormOpen}
        onClose={() => setSubmissionFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequirement && (
          <MtoType2SubmissionForm
            requirement={selectedRequirement}
            onSubmissionCreated={handleSubmissionCreated}
            onClose={() => setSubmissionFormOpen(false)}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default MtoType2MarketView;