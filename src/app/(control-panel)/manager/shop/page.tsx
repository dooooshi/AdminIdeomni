'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMaterials, fetchShopHistory } from '@/store/shopSlice';
import AddMaterialDialog from '@/components/shop/manager/AddMaterialDialog';
import ShopMaterialsList from '@/components/shop/manager/ShopMaterialsList';
import ShopStatistics from '@/components/shop/manager/ShopStatistics';
import ShopHistoryTable from '@/components/shop/manager/ShopHistoryTable';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ShopManagerPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const shopState = useSelector((state: RootState) => state.shop);
  const materialsLoading = shopState?.materialsLoading || false;
  const materialsError = shopState?.materialsError || null;

  const [tabValue, setTabValue] = useState(0);
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);

  useEffect(() => {
    // Load initial data
    dispatch(fetchMaterials(undefined));
    dispatch(fetchShopHistory(undefined));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchMaterials(undefined));
    if (tabValue === 2) {
      dispatch(fetchShopHistory(undefined));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('SHOP_DASHBOARD')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={materialsLoading}
            >
              {t('shop.RETRY')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddMaterialOpen(true)}
            >
              {t('shop.ADD_MATERIAL')}
            </Button>
          </Box>
        </Box>

        {materialsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {materialsError}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('shop.MATERIALS_LIST')} />
            <Tab label={t('shop.STATISTICS')} />
            <Tab label={t('shop.TRANSACTION_HISTORY')} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ShopMaterialsList />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ShopStatistics />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ShopHistoryTable />
        </TabPanel>
      </Box>

      <AddMaterialDialog
        open={addMaterialOpen}
        onClose={() => setAddMaterialOpen(false)}
      />
    </Container>
  );
}