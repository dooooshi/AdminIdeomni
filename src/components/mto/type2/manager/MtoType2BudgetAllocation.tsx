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
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

import { MtoType2Requirement, MtoType2MallBudget } from '@/lib/types/mtoType2';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2BudgetAllocationProps {
  requirement: MtoType2Requirement;
  onRefresh?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const MtoType2BudgetAllocation: React.FC<MtoType2BudgetAllocationProps> = ({
  requirement,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [budgets, setBudgets] = useState<MtoType2MallBudget[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedTile, setSelectedTile] = useState<MtoType2MallBudget | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await MtoType2Service.getMallBudgets(requirement.id);
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
      showError('Failed to load budget allocation', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgets = async () => {
    try {
      setCalculating(true);
      const data = await MtoType2Service.calculateBudgets(requirement.id);
      setBudgets(data);
      showSuccess('Budget allocation calculated successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Error calculating budgets:', error);
      showError('Failed to calculate budget allocation', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [requirement.id]);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.allocatedBudget, 0);
  const totalUsed = budgets.reduce((sum, budget) => sum + budget.usedBudget, 0);
  const totalMalls = budgets.reduce((sum, budget) => sum + budget.mallCount, 0);
  const totalPopulation = budgets.reduce((sum, budget) => sum + budget.tilePopulation, 0);

  const pieChartData = budgets.map((budget, index) => ({
    name: `Tile ${budget.tileId}`,
    value: budget.allocatedBudget,
    percentage: totalBudget > 0 ? (budget.allocatedBudget / totalBudget * 100).toFixed(1) : '0',
    population: budget.tilePopulation,
    mallCount: budget.mallCount,
    color: COLORS[index % COLORS.length],
  }));

  const barChartData = budgets.map(budget => ({
    tileId: `Tile ${budget.tileId}`,
    allocated: budget.allocatedBudget,
    used: budget.usedBudget,
    remaining: budget.remainingBudget,
    population: budget.tilePopulation,
    mallCount: budget.mallCount,
  }));

  const utilizationRate = totalBudget > 0 ? (totalUsed / totalBudget * 100).toFixed(1) : '0';

  const handleTileClick = (budget: MtoType2MallBudget) => {
    setSelectedTile(budget);
    setDetailsOpen(true);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {data.name}
          </Typography>
          <Typography variant="body2">
            Budget: ${data.value.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage}%
          </Typography>
          <Typography variant="body2">
            Population: {data.population.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            MALLs: {data.mallCount}
          </Typography>
        </Box>
      );
    }
    return null;
  };

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
          Budget Allocation - {requirement.metadata?.name || `Requirement ${requirement.id}`}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadBudgets}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<TrendingUpIcon />}
            onClick={calculateBudgets}
            disabled={calculating || requirement.status !== 'DRAFT'}
            color="primary"
          >
            {calculating ? <CircularProgress size={20} /> : 'Calculate Budgets'}
          </Button>
        </Box>
      </Box>

      {/* Status Alert */}
      {requirement.status !== 'DRAFT' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Budget allocation can only be calculated for requirements in DRAFT status.
          Current status: {requirement.status}
        </Alert>
      )}

      {budgets.length === 0 ? (
        <Alert severity="warning">
          No budget allocation found. Click "Calculate Budgets" to generate the allocation based on tile population and MALL distribution.
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Total Budget
                      </Typography>
                      <Typography variant="h5">
                        ${totalBudget.toLocaleString()}
                      </Typography>
                    </Box>
                    <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
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
                        Budget Used
                      </Typography>
                      <Typography variant="h5">
                        ${totalUsed.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {utilizationRate}% utilized
                      </Typography>
                    </Box>
                    <TrendingUpIcon color="secondary" sx={{ fontSize: 40 }} />
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
                        Total MALLs
                      </Typography>
                      <Typography variant="h5">
                        {totalMalls}
                      </Typography>
                    </Box>
                    <StoreIcon color="success" sx={{ fontSize: 40 }} />
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
                        Total Population
                      </Typography>
                      <Typography variant="h5">
                        {totalPopulation.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      component="div"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 20,
                      }}
                    >
                      👥
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Visualization Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Budget Distribution by Tile" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Budget Allocation vs Usage" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tileId" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                      <Bar dataKey="used" fill="#82ca9d" name="Used" />
                      <Bar dataKey="remaining" fill="#ffc658" name="Remaining" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Table */}
          <Card>
            <CardHeader title="Detailed Budget Allocation by Tile" />
            <CardContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tile ID</TableCell>
                      <TableCell align="right">Population</TableCell>
                      <TableCell align="right">MALL Count</TableCell>
                      <TableCell align="right">Allocated Budget</TableCell>
                      <TableCell align="right">Used Budget</TableCell>
                      <TableCell align="right">Remaining Budget</TableCell>
                      <TableCell align="right">Utilization</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map((budget) => {
                      const utilization = budget.allocatedBudget > 0
                        ? (budget.usedBudget / budget.allocatedBudget * 100).toFixed(1)
                        : '0';

                      return (
                        <TableRow key={budget.id} hover>
                          <TableCell>
                            <Chip
                              label={budget.tileId}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {budget.tilePopulation.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={budget.mallCount}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            ${budget.allocatedBudget.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            ${budget.usedBudget.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            ${budget.remainingBudget.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${utilization}%`}
                              color={parseFloat(utilization) > 80 ? 'success' : parseFloat(utilization) > 50 ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleTileClick(budget)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tile Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Tile {selectedTile?.tileId} - Detailed Information
        </DialogTitle>
        <DialogContent>
          {selectedTile && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Budget Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Allocated: ${selectedTile.allocatedBudget.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Used: ${selectedTile.usedBudget.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Remaining: ${selectedTile.remainingBudget.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tile Statistics
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Population: {selectedTile.tilePopulation.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      MALL Count: {selectedTile.mallCount}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    MALL Details
                  </Typography>
                  <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>MALL ID</TableCell>
                          <TableCell>Team ID</TableCell>
                          <TableCell align="right">Level</TableCell>
                          <TableCell align="right">Submissions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTile.mallDetails.map((mall) => (
                          <TableRow key={mall.mallId}>
                            <TableCell>{mall.mallId}</TableCell>
                            <TableCell>{mall.teamId}</TableCell>
                            <TableCell align="right">
                              <Chip label={mall.level} size="small" />
                            </TableCell>
                            <TableCell align="right">{mall.submissions}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MtoType2BudgetAllocation;