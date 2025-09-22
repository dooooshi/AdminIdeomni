import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  School as LearnIcon,
  FilterList as FilterListIcon,
  Lock as LockIcon
} from '@mui/icons-material';

import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface MtoType2Opportunity {
  requirementId: number;
  requirementName: string;
  status: string;
  totalBudget: number;
  releaseTime: string;
  settlementTime: string;
  productFormulaName: string;
  participatingMalls: number;
  averagePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  totalSubmissions: number;
}

interface FilterState {
  status: string;
  minBudget: number;
  maxBudget: number;
}

export const MtoType2StudentView: React.FC = () => {
  const { t } = useTranslation();

  const [opportunities, setOpportunities] = useState<MtoType2Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<MtoType2Opportunity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    minBudget: 0,
    maxBudget: 0
  });

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      // Use the student-specific endpoint
      const data = await MtoType2Service.getOpportunitiesForStudents();

      // Transform data for display
      const studentData = data.map((item) => ({
        requirementId: item.requirementId,
        requirementName: item.requirementName,
        status: item.status,
        totalBudget: item.totalBudget,
        releaseTime: item.releaseTime,
        settlementTime: item.settlementTime,
        productFormulaName: item.productFormulaName,
        participatingMalls: item.marketInsights?.participatingMalls || 0,
        averagePrice: item.marketInsights?.averagePrice,
        minPrice: item.marketInsights?.priceRange?.min,
        maxPrice: item.marketInsights?.priceRange?.max,
        totalSubmissions: item.marketInsights?.totalSubmissions || 0
      }));

      setOpportunities(studentData);

      // Update filter max budget
      const maxBudget = Math.max(...studentData.map(o => o.totalBudget), 0);
      setFilters(prev => ({ ...prev, maxBudget }));
    } catch (error) {
      console.error('Error loading opportunities:', error);
      // Simple error handling without toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.status !== 'ALL' && opp.status !== filters.status) return false;
    if (filters.minBudget > 0 && opp.totalBudget < filters.minBudget) return false;
    if (filters.maxBudget > 0 && opp.totalBudget > filters.maxBudget) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'RELEASED': return 'primary';
      case 'IN_PROGRESS': return 'warning';
      case 'SETTLED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const calculateTimeRemaining = (targetTime: string) => {
    const target = new Date(targetTime);
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return t('common.expired');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const handleViewDetails = (opportunity: MtoType2Opportunity) => {
    setSelectedOpportunity(opportunity);
    setDetailsOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      status: 'ALL',
      minBudget: 0,
      maxBudget: Math.max(...opportunities.map(o => o.totalBudget), 0)
    });
  };

  if (loading && opportunities.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* MALL Required Banner */}
      <Alert
        severity="info"
        icon={<LockIcon />}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<LearnIcon />}
            onClick={() => setLearnMoreOpen(true)}
          >
            {t('mto.type2.student.learnMore')}
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          {t('mto.type2.student.mallRequired')}
        </Typography>
        <Typography variant="body2">
          {t('mto.type2.student.mallRequiredDetail')}
        </Typography>
      </Alert>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {t('mto.type2.student.marketInsights')}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersOpen(true)}
          >
            {t('common.filter')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadOpportunities}
            disabled={loading}
          >
            {t('common.refresh')}
          </Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {t('mto.type2.student.activeOpportunities')}
                  </Typography>
                  <Typography variant="h5">
                    {filteredOpportunities.filter(o => o.status === 'RELEASED' || o.status === 'IN_PROGRESS').length}
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
                    {t('mto.type2.student.totalBudget')}
                  </Typography>
                  <Typography variant="h5">
                    ${filteredOpportunities.reduce((sum, o) => sum + o.totalBudget, 0).toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoneyIcon color="success" sx={{ fontSize: 40 }} />
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
                    {t('mto.type2.student.participatingMalls')}
                  </Typography>
                  <Typography variant="h5">
                    {filteredOpportunities.reduce((sum, o) => sum + o.participatingMalls, 0)}
                  </Typography>
                </Box>
                <StoreIcon color="info" sx={{ fontSize: 40 }} />
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
                    {t('mto.type2.student.totalSubmissions')}
                  </Typography>
                  <Typography variant="h5">
                    {filteredOpportunities.reduce((sum, o) => sum + o.totalSubmissions, 0)}
                  </Typography>
                </Box>
                <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <Alert severity="info">
          {opportunities.length === 0
            ? t('mto.type2.student.noOpportunities')
            : t('mto.type2.student.noMatchingOpportunities')
          }
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredOpportunities.map((opportunity) => (
            <Grid size={{ xs: 12, lg: 6 }} key={opportunity.requirementId}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                {/* View Only Badge */}
                <Chip
                  icon={<LockIcon />}
                  label={t('mto.type2.student.viewOnly')}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1
                  }}
                />

                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">
                      {opportunity.requirementName}
                    </Typography>
                    <Chip
                      label={opportunity.status}
                      color={getStatusColor(opportunity.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {opportunity.productFormulaName}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Key Metrics */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {t('mto.type2.student.budget')}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            ${opportunity.totalBudget.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {t('mto.type2.student.timeRemaining')}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {calculateTimeRemaining(opportunity.settlementTime)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Market Insights */}
                  {opportunity.participatingMalls > 0 && (
                    <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }} elevation={0}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('mto.type2.student.marketActivity')}
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          {t('mto.type2.student.malls')}: {opportunity.participatingMalls}
                        </Typography>
                        <Typography variant="body2">
                          {t('mto.type2.student.submissions')}: {opportunity.totalSubmissions}
                        </Typography>
                        {opportunity.averagePrice && (
                          <Typography variant="body2">
                            {t('mto.type2.student.averagePrice')}: ${opportunity.averagePrice.toLocaleString()}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* Actions */}
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(opportunity)}
                    >
                      {t('common.viewDetails')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filters Dialog */}
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('common.filterOptions')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label={t('common.status')}
              >
                <MenuItem value="ALL">{t('common.all')}</MenuItem>
                <MenuItem value="DRAFT">{t('mto.type2.status.draft')}</MenuItem>
                <MenuItem value="RELEASED">{t('mto.type2.status.released')}</MenuItem>
                <MenuItem value="IN_PROGRESS">{t('mto.type2.status.inProgress')}</MenuItem>
                <MenuItem value="SETTLED">{t('mto.type2.status.settled')}</MenuItem>
                <MenuItem value="CANCELLED">{t('mto.type2.status.cancelled')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('mto.type2.student.minBudget')}
              type="number"
              value={filters.minBudget || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minBudget: parseInt(e.target.value) || 0 }))}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              fullWidth
              label={t('mto.type2.student.maxBudget')}
              type="number"
              value={filters.maxBudget || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: parseInt(e.target.value) || 0 }))}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>{t('common.reset')}</Button>
          <Button onClick={() => setFiltersOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={() => setFiltersOpen(false)} variant="contained">
            {t('common.apply')}
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
        <DialogTitle>
          {t('mto.type2.student.opportunityDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedOpportunity && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedOpportunity.requirementName}
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                {t('mto.type2.student.viewingOnly')}
              </Alert>

              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th">{t('common.status')}</TableCell>
                      <TableCell>
                        <Chip
                          label={selectedOpportunity.status}
                          color={getStatusColor(selectedOpportunity.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">{t('mto.type2.student.totalBudget')}</TableCell>
                      <TableCell>${selectedOpportunity.totalBudget.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">{t('mto.type2.student.formula')}</TableCell>
                      <TableCell>{selectedOpportunity.productFormulaName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">{t('mto.type2.student.releaseTime')}</TableCell>
                      <TableCell>{new Date(selectedOpportunity.releaseTime).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">{t('mto.type2.student.settlementTime')}</TableCell>
                      <TableCell>{new Date(selectedOpportunity.settlementTime).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">{t('mto.type2.student.participatingMalls')}</TableCell>
                      <TableCell>{selectedOpportunity.participatingMalls}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">{t('mto.type2.student.totalSubmissions')}</TableCell>
                      <TableCell>{selectedOpportunity.totalSubmissions}</TableCell>
                    </TableRow>
                    {selectedOpportunity.minPrice && selectedOpportunity.maxPrice && (
                      <TableRow>
                        <TableCell component="th">{t('mto.type2.student.priceRange')}</TableCell>
                        <TableCell>
                          ${selectedOpportunity.minPrice.toLocaleString()} - ${selectedOpportunity.maxPrice.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Learn More Dialog */}
      <Dialog
        open={learnMoreOpen}
        onClose={() => setLearnMoreOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('mto.type2.student.howToParticipate')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Alert severity="info" icon={<StoreIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                {t('mto.type2.student.requirementTitle')}
              </Typography>
              <Typography variant="body2">
                {t('mto.type2.student.requirementDesc')}
              </Typography>
            </Alert>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('mto.type2.student.stepsTitle')}
              </Typography>
              <ol>
                <li>{t('mto.type2.student.step1')}</li>
                <li>{t('mto.type2.student.step2')}</li>
                <li>{t('mto.type2.student.step3')}</li>
                <li>{t('mto.type2.student.step4')}</li>
              </ol>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('mto.type2.student.benefitsTitle')}
              </Typography>
              <ul>
                <li>{t('mto.type2.student.benefit1')}</li>
                <li>{t('mto.type2.student.benefit2')}</li>
                <li>{t('mto.type2.student.benefit3')}</li>
              </ul>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLearnMoreOpen(false)} variant="contained">
            {t('common.understood')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType2StudentView;