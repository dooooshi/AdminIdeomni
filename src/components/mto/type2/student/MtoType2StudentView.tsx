import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
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

export const MtoType2StudentView: React.FC = () => {
  const { t } = useTranslation();

  const [opportunities, setOpportunities] = useState<MtoType2Opportunity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await MtoType2Service.getOpportunitiesForStudents();

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
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'SETTLED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          MTO Type 2 Market Opportunities
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadOpportunities}
          disabled={loading}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Formula Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Settlement Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No opportunities available at the moment
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opportunity) => (
                <TableRow key={opportunity.requirementId}>
                  <TableCell>{opportunity.requirementId}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {opportunity.requirementName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {opportunity.productFormulaName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={opportunity.status}
                      color={getStatusColor(opportunity.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(opportunity.settlementTime)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MtoType2StudentView;