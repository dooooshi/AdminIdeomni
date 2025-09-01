'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  History as HistoryIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import PageTitle from '@/components/PageTitle';
import { ProductionHistory, MaterialsTable } from '@/components/production';

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
      id={`production-tabpanel-${index}`}
      aria-labelledby={`production-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StudentProductionPage() {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <PageTitle
        title={t('production.title')}
        subtitle={t('production.subtitle')}
      />

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            icon={<InventoryIcon />}
            label={t('production.tabs.materials')}
            iconPosition="start"
          />
          <Tab
            icon={<HistoryIcon />}
            label={t('production.tabs.history')}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <MaterialsTable />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ProductionHistory
              limit={20}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}