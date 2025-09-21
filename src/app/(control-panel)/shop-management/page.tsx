'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Alert,
  Skeleton,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMaterials, fetchShopHistory } from '@/store/shopSlice';
import MaterialList from '@/components/shop/manager/MaterialList';
import AddMaterialDialog from '@/components/shop/manager/AddMaterialDialog';
import ShopHistoryTable from '@/components/shop/manager/ShopHistoryTable';
import ShopStatistics from '@/components/shop/manager/ShopStatistics';

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
      id={`shop-tabpanel-${index}`}
      aria-labelledby={`shop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ShopManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    materials = [],
    materialsLoading = false,
    materialsError = null,
    shopHistory = [],
    shopHistoryLoading = false
  } = useSelector(
    (state: RootState) => state.shop || {}
  );

  const [activeTab, setActiveTab] = useState(0);
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load initial data
    dispatch(fetchMaterials());
    dispatch(fetchShopHistory({ limit: 50 }));
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchMaterials()),
      dispatch(fetchShopHistory({ limit: 50 })),
    ]);
    setRefreshing(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Calculate statistics with safety checks
  const totalMaterials = materials?.length || 0;
  const totalRevenue = (shopHistory || [])
    .filter(h => h.actionType === 'PURCHASE_COMPLETED')
    .reduce((sum, h) => sum + (h.newValue?.totalAmount || 0), 0);
  const recentTransactions = (shopHistory || [])
    .filter(h => h.actionType === 'PURCHASE_COMPLETED')
    .slice(0, 5).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Shop Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddMaterialOpen(true)}
          >
            Add Material
          </Button>
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshIcon className={refreshing ? 'animate-spin' : ''} />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {materialsError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {materialsError}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Total Materials
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {materialsLoading ? <Skeleton width={60} /> : totalMaterials}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Active in shop
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {shopHistoryLoading ? <Skeleton width={100} /> : `${totalRevenue.toFixed(2)}g`}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                All time sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Recent Sales
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {shopHistoryLoading ? <Skeleton width={60} /> : recentTransactions}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Price Changes
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {shopHistoryLoading ? (
                  <Skeleton width={60} />
                ) : (
                  (shopHistory || []).filter(h => h.actionType === 'MATERIAL_PRICE_SET').length
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                This week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="shop management tabs">
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon fontSize="small" />
                  Materials
                  <Chip label={totalMaterials} size="small" />
                </Box>
              }
              id="shop-tab-0"
              aria-controls="shop-tabpanel-0"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon fontSize="small" />
                  History
                </Box>
              }
              id="shop-tab-1"
              aria-controls="shop-tabpanel-1"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" />
                  Analytics
                </Box>
              }
              id="shop-tab-2"
              aria-controls="shop-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <MaterialList />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ShopHistoryTable />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ShopStatistics />
        </TabPanel>
      </Paper>

      {/* Add Material Dialog */}
      <AddMaterialDialog
        open={addMaterialOpen}
        onClose={() => setAddMaterialOpen(false)}
      />
    </Box>
  );
}