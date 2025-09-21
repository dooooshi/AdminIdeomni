'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Button,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Collapse,
  IconButton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Timeline as TimelineIcon,
  ArrowBack as ArrowBackIcon,
  FileDownload as DownloadIcon,
  Assessment as AssessmentIcon,
  LocalShipping as DeliveryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MtoType1Service from '@/lib/services/mtoType1Service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mto-tabpanel-${index}`}
      aria-labelledby={`mto-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MtoType1CalculationHistoryDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const requirementId = params.id as string;

  const [requirement, setRequirement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [expandedTiles, setExpandedTiles] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadRequirement();
  }, [requirementId]);

  const loadRequirement = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MtoType1Service.getRequirement(Number(requirementId));
      setRequirement(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requirement');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/mto-management/mto-type-1/history');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleTileExpansion = (tileId: number) => {
    setExpandedTiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tileId)) {
        newSet.delete(tileId);
      } else {
        newSet.add(tileId);
      }
      return newSet;
    });
  };

  const handleExport = async () => {
    try {
      const csvContent = generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `mto_type1_history_${requirementId}_${new Date().toISOString()}.csv`;
      link.click();
    } catch (error) {
      console.error('Failed to export history:', error);
    }
  };

  const generateCSVContent = () => {
    if (!requirement) return '';

    const headers = [
      'Category', 'Field', 'Value'
    ];

    const rows = [
      ['Basic Info', 'ID', requirement.id],
      ['Basic Info', 'Activity ID', requirement.activityId],
      ['Basic Info', 'Status', requirement.status],
      ['Basic Info', 'Purchase Gold Price', requirement.purchaseGoldPrice],
      ['Basic Info', 'Base Purchase Number', requirement.basePurchaseNumber],
      ['Basic Info', 'Overall Purchase Number', requirement.overallPurchaseNumber],
      ['Basic Info', 'Overall Purchase Budget', requirement.overallPurchaseBudget],
      ['Basic Info', 'Base Count Population', requirement.baseCountPopulationNumber],
      ['Basic Info', 'Release Time', requirement.releaseTime],
      ['Basic Info', 'Settlement Time', requirement.settlementTime],
      ['Performance', 'Actual Spent Budget', requirement.actualSpentBudget || 'N/A'],
      ['Performance', 'Actual Purchased Number', requirement.actualPurchasedNumber],
      ['Performance', 'Fulfillment Rate', requirement.fulfillmentRate ? `${requirement.fulfillmentRate}%` : 'N/A']
    ];

    // Add tile requirements
    requirement.tileRequirements?.forEach((tile: any) => {
      rows.push([
        'Tile Requirements',
        tile.tileName,
        `Pop: ${tile.tilePopulation}, Req: ${tile.adjustedRequirementNumber}, Delivered: ${tile.deliveredNumber}`
      ]);
    });

    // Add calculation history
    requirement.calculationHistory?.forEach((calc: any) => {
      rows.push([
        'Calculation History',
        `Step ${calc.calculationStep}`,
        calc.stepDescription
      ]);
    });

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'RELEASED': return 'primary';
      case 'SETTLED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SETTLED': return <CheckCircleIcon fontSize="small" />;
      case 'RELEASED': return <PendingIcon fontSize="small" />;
      case 'CANCELLED': return <WarningIcon fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !requirement) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">
          <AlertTitle>{t('mto.type1.calculationHistory.error')}</AlertTitle>
          {error || t('mto.type1.calculationHistory.requirementNotFound')}
        </Alert>
        <Box mt={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
        </Box>
      </Container>
    );
  }

  const totalRequirement = requirement.tileRequirements?.reduce(
    (sum: number, tile: any) => sum + tile.adjustedRequirementNumber, 0
  ) || 0;

  const totalDelivered = requirement.tileRequirements?.reduce(
    (sum: number, tile: any) => sum + tile.deliveredNumber, 0
  ) || 0;

  const deliveryProgress = totalRequirement > 0 ? (totalDelivered / totalRequirement) * 100 : 0;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            {t('common.home')}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/mto-management"
          >
            {t('navigation.mtoManagement')}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/mto-management/mto-type-1"
          >
            {t('mto.type1.title')}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/mto-management/mto-type-1/history"
          >
            {t('mto.type1.history.title')}
          </Link>
          <Typography color="text.primary">
            {t('mto.type1.calculationHistory.detailsTitle', { id: requirementId })}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1, fontSize: 32 }} />
            {t('mto.type1.calculationHistory.requirementTitle', { id: requirementId })}
          </Typography>
          <Chip
            label={requirement.status}
            color={getStatusColor(requirement.status)}
            icon={getStatusIcon(requirement.status)}
            size="medium"
          />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            {t('mto.type1.calculationHistory.exportCSV')}
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('mto.type1.calculationHistory.overallPurchaseBudget')}
              </Typography>
              <Typography variant="h5" component="div">
                ${Number(requirement.overallPurchaseBudget).toLocaleString()}
              </Typography>
              {requirement.actualSpentBudget && (
                <Typography variant="body2" color="primary">
                  {t('mto.type1.calculationHistory.spent')}: ${Number(requirement.actualSpentBudget).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('mto.type1.calculationHistory.purchaseNumbers')}
              </Typography>
              <Typography variant="h5" component="div">
                {requirement.overallPurchaseNumber.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.calculationHistory.actual')}: {requirement.actualPurchasedNumber.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('mto.type1.calculationHistory.activeTiles')}
              </Typography>
              <Typography variant="h5" component="div">
                {requirement.tileRequirements?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('mto.type1.calculationHistory.totalPopulation')}: {requirement.baseCountPopulationNumber.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {t('mto.type1.calculationHistory.deliveryProgress')}
              </Typography>
              <Typography variant="h5" component="div">
                {deliveryProgress.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={deliveryProgress}
                sx={{ mt: 1 }}
                color={deliveryProgress === 100 ? 'success' : 'primary'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="mto history tabs">
            <Tab
              icon={<AssessmentIcon />}
              label={t('mto.type1.calculationHistory.calculationHistory')}
              iconPosition="start"
            />
            <Tab
              icon={<DeliveryIcon />}
              label={t('mto.type1.calculationHistory.tileRequirementsDeliveries')}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Calculation History Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.step')}</TableCell>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.type')}</TableCell>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.description')}</TableCell>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.tilesProcessed')}</TableCell>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.initialReq')}</TableCell>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.adjustedReq')}</TableCell>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.budgetImpact')}</TableCell>
                  <TableCell align="center">{t('mto.type1.calculationHistory.table.timestamp')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirement.calculationHistory?.map((calc: any) => (
                  <React.Fragment key={calc.id}>
                    <TableRow hover>
                      <TableCell align="center">{calc.calculationStep}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={calc.stepType}
                          size="small"
                          color={calc.stepType === 'FINAL_DISTRIBUTION' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">{calc.stepDescription}</TableCell>
                      <TableCell align="center">{calc.totalTilesProcessed}</TableCell>
                      <TableCell align="center">{calc.totalInitialRequirement.toLocaleString()}</TableCell>
                      <TableCell align="center">{calc.totalAdjustedRequirement.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        {calc.budgetSaved && Number(calc.budgetSaved) > 0 && (
                          <Chip
                            label={`-$${Number(calc.budgetSaved).toLocaleString()}`}
                            color="success"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {calc.calculatedAt ? format(parseISO(calc.calculatedAt), 'MMM dd, HH:mm') : '-'}
                      </TableCell>
                    </TableRow>
                    {calc.tileAdjustments && calc.tileAdjustments.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ py: 0 }}>
                          <Collapse in={expandedTiles.has(calc.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {t('mto.type1.calculationHistory.table.tileAdjustments')}
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align="center">{t('mto.type1.calculationHistory.table.tile')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.calculationHistory.table.population')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.calculationHistory.table.initial')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.calculationHistory.table.adjusted')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.calculationHistory.table.reason')}</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {calc.tileAdjustments.map((adj: any, idx: number) => (
                                    <TableRow key={idx}>
                                      <TableCell align="center">{adj.tileName}</TableCell>
                                      <TableCell align="center">{adj.population.toLocaleString()}</TableCell>
                                      <TableCell align="center">{adj.initialReq}</TableCell>
                                      <TableCell align="center">{adj.adjustedReq}</TableCell>
                                      <TableCell align="center">{adj.reason}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tile Requirements Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.tile')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.population')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.requirement')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.budget')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.delivered')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.settled')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.remaining')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.spent')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.status')}</TableCell>
                  <TableCell align="center">{t('mto.type1.tileRequirements.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirement.tileRequirements?.map((tile: any) => (
                  <React.Fragment key={tile.id}>
                    <TableRow hover>
                      <TableCell align="center">{tile.tileName}</TableCell>
                      <TableCell align="center">{tile.tilePopulation.toLocaleString()}</TableCell>
                      <TableCell align="center">{tile.adjustedRequirementNumber.toLocaleString()}</TableCell>
                      <TableCell align="center">${Number(tile.requirementBudget).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={tile.deliveredNumber.toLocaleString()}
                          color={tile.deliveredNumber > 0 ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{tile.settledNumber.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={tile.remainingNumber.toLocaleString()}
                          color={tile.remainingNumber === 0 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">${Number(tile.spentBudget).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        {tile.isActive ? (
                          <Chip label={t('mto.type1.tileRequirements.status.active')} color="success" size="small" />
                        ) : (
                          <Chip label={t('mto.type1.tileRequirements.status.inactive')} color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {tile.deliveries && tile.deliveries.length > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => toggleTileExpansion(tile.id)}
                          >
                            {expandedTiles.has(tile.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    {tile.deliveries && tile.deliveries.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={10} sx={{ py: 0 }}>
                          <Collapse in={expandedTiles.has(tile.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {t('mto.type1.tileRequirements.deliveryHistory')}
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align="center">{t('mto.type1.tileRequirements.deliveryId')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.tileRequirements.teamName')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.tileRequirements.quantity')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.tileRequirements.table.status')}</TableCell>
                                    <TableCell align="center">{t('mto.type1.tileRequirements.deliveredAt')}</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {tile.deliveries.map((delivery: any) => (
                                    <TableRow key={delivery.id}>
                                      <TableCell align="center">{delivery.id}</TableCell>
                                      <TableCell align="center">{delivery.teamName || '-'}</TableCell>
                                      <TableCell align="center">{delivery.deliveryNumber || delivery.quantity || 0}</TableCell>
                                      <TableCell align="center">{delivery.settlementStatus || delivery.status || '-'}</TableCell>
                                      <TableCell align="center">
                                        {delivery.deliveredAt ? format(parseISO(delivery.deliveredAt), 'MMM dd, HH:mm') : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Stats */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  {t('mto.type1.summaryStats.totalRequirement')}
                </Typography>
                <Typography variant="h6">
                  {totalRequirement.toLocaleString()} {t('mto.type1.summaryStats.units')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  {t('mto.type1.summaryStats.totalDelivered')}
                </Typography>
                <Typography variant="h6" color="primary">
                  {totalDelivered.toLocaleString()} {t('mto.type1.summaryStats.units')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  {t('mto.type1.summaryStats.completionRate')}
                </Typography>
                <Typography variant="h6" color={deliveryProgress === 100 ? 'success.main' : 'warning.main'}>
                  {deliveryProgress.toFixed(1)}%
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Timeline Information */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ mr: 1 }} />
          {t('mto.type1.timeline.title')}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('mto.type1.timeline.createdAt')}
            </Typography>
            <Typography>
              {requirement.createdAt ? format(parseISO(requirement.createdAt), 'MMM dd, yyyy HH:mm:ss') : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('mto.type1.timeline.releaseTime')}
            </Typography>
            <Typography>
              {requirement.releaseTime ? format(parseISO(requirement.releaseTime), 'MMM dd, yyyy HH:mm:ss') : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('mto.type1.timeline.settlementTime')}
            </Typography>
            <Typography>
              {requirement.settlementTime ? format(parseISO(requirement.settlementTime), 'MMM dd, yyyy HH:mm:ss') : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              {t('mto.type1.timeline.lastUpdated')}
            </Typography>
            <Typography>
              {requirement.updatedAt ? format(parseISO(requirement.updatedAt), 'MMM dd, yyyy HH:mm:ss') : '-'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}