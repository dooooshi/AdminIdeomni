'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMaterials, fetchFacilitySpaces } from '@/store/shopSlice';
import ShopCatalog from '@/components/shop/student/ShopCatalog';
import TransactionHistory from '@/components/shop/student/TransactionHistory';

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
      id={`student-shop-tabpanel-${index}`}
      aria-labelledby={`student-shop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StudentShopPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { materialsError } = useSelector((state: RootState) => state.shop);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load initial data
    dispatch(fetchMaterials(undefined));
    dispatch(fetchFacilitySpaces());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchMaterials(undefined)),
      dispatch(fetchFacilitySpaces()),
    ]);
    setRefreshing(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {t('shop.STUDENT_TITLE')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {t('shop.STUDENT_SUBTITLE')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setActiveTab(1)}
          >
            {t('shop.TRANSACTION_HISTORY')}
          </Button>

          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            title={t('shop.RETRY')}
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

      {/* Main Content Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="student shop tabs">
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon fontSize="small" />
                  {t('shop.CATALOG')}
                </Box>
              }
              id="student-shop-tab-0"
              aria-controls="student-shop-tabpanel-0"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon fontSize="small" />
                  {t('shop.TRANSACTION_HISTORY')}
                </Box>
              }
              id="student-shop-tab-1"
              aria-controls="student-shop-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ShopCatalog />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TransactionHistory />
        </TabPanel>
      </Box>
    </Box>
  );
}