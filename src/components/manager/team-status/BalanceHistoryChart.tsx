'use client';

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { format } from 'date-fns';
import type { TeamBalanceHistory } from '@/types/managerTeamStatus';

interface BalanceHistoryChartProps {
  balanceHistory: TeamBalanceHistory[];
  loading?: boolean;
}

/**
 * Balance history chart component using recharts
 */
export default function BalanceHistoryChart({
  balanceHistory,
  loading = false,
}: BalanceHistoryChartProps) {
  const { t } = useTranslation();
  const [resourceType, setResourceType] = useState<'GOLD' | 'CARBON' | 'BOTH'>('BOTH');

  const handleResourceChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'GOLD' | 'CARBON' | 'BOTH'
  ) => {
    if (newValue !== null) {
      setResourceType(newValue);
    }
  };

  // Transform data for chart
  const chartData = balanceHistory
    .slice()
    .reverse()
    .map((entry) => ({
      timestamp: format(new Date(entry.createdAt), 'MM-dd HH:mm'),
      gold: parseFloat(entry.goldBalance),
      carbon: parseFloat(entry.carbonBalance),
      operation: entry.operation?.type || 'N/A',
    }));

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
      </Paper>
    );
  }

  if (balanceHistory.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('manager.teamStatus.message.noData')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">
          {t('manager.teamStatus.title.balanceHistory')}
        </Typography>

        <ToggleButtonGroup
          value={resourceType}
          exclusive
          onChange={handleResourceChange}
          size="small"
        >
          <ToggleButton value="GOLD">
            {t('manager.teamStatus.detail.field.goldBalance')}
          </ToggleButton>
          <ToggleButton value="CARBON">
            {t('manager.teamStatus.detail.field.carbonBalance')}
          </ToggleButton>
          <ToggleButton value="BOTH">Both</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend />

          {(resourceType === 'GOLD' || resourceType === 'BOTH') && (
            <Line
              type="monotone"
              dataKey="gold"
              stroke="#ff9800"
              strokeWidth={2}
              name="Gold Balance"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}

          {(resourceType === 'CARBON' || resourceType === 'BOTH') && (
            <Line
              type="monotone"
              dataKey="carbon"
              stroke="#4caf50"
              strokeWidth={2}
              name="Carbon Balance"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {balanceHistory.length} balance snapshots
        </Typography>
      </Box>
    </Paper>
  );
}