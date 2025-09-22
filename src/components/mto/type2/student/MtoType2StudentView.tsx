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
  Refresh as RefreshIcon,
  Send as SendIcon
} from '@mui/icons-material';

import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import MtoType2RequirementDetailsModal from './MtoType2RequirementDetailsModal';
import MtoType2StudentSubmissionModal from './MtoType2StudentSubmissionModal';

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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedRequirementForSubmission, setSelectedRequirementForSubmission] = useState<{ id: number; name: string } | null>(null);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return t('mto.type2.student.statusActive');
      case 'SETTLED': return t('mto.type2.student.statusSettled');
      case 'CANCELLED': return t('mto.type2.student.statusCancelled');
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const handleViewDetails = (requirementId: number) => {
    setSelectedRequirementId(requirementId);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedRequirementId(null);
  };

  const handleSubmitProducts = (requirementId: number, requirementName: string) => {
    setSelectedRequirementForSubmission({ id: requirementId, name: requirementName });
    setSubmissionModalOpen(true);
  };

  const handleCloseSubmissionModal = () => {
    setSubmissionModalOpen(false);
    setSelectedRequirementForSubmission(null);
  };

  const handleSubmissionCreated = () => {
    handleCloseSubmissionModal();
    loadOpportunities(); // Refresh the list
  };

  const canSubmit = (status: string) => {
    return status === 'ACTIVE' || status === 'IN_PROGRESS' || status === 'RELEASED';
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
          {t('mto.type2.student.marketOpportunities')}
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
              <TableCell>{t('mto.type2.student.tableId')}</TableCell>
              <TableCell>{t('mto.type2.student.tableFormulaName')}</TableCell>
              <TableCell>{t('mto.type2.student.tableStatus')}</TableCell>
              <TableCell>{t('mto.type2.student.tableSettlementDate')}</TableCell>
              <TableCell align="center" width="150">{t('mto.type2.student.tableActions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    {t('mto.type2.student.noOpportunitiesAvailable')}
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
                      label={getStatusLabel(opportunity.status)}
                      color={getStatusColor(opportunity.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(opportunity.settlementTime)}</TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <Tooltip title={t('mto.type2.student.viewDetailsTooltip')}>
                        <IconButton size="small" onClick={() => handleViewDetails(opportunity.requirementId)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canSubmit(opportunity.status) && (
                        <Tooltip title={t('mto.type2.student.submitProductsTooltip')}>
                          <IconButton
                            size="small"
                            onClick={() => handleSubmitProducts(opportunity.requirementId, opportunity.requirementName)}
                            color="primary"
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Requirement Details Modal */}
      <MtoType2RequirementDetailsModal
        open={detailsModalOpen}
        requirementId={selectedRequirementId}
        onClose={handleCloseDetailsModal}
      />

      {/* Student Submission Modal */}
      <MtoType2StudentSubmissionModal
        open={submissionModalOpen}
        requirementId={selectedRequirementForSubmission?.id || null}
        requirementName={selectedRequirementForSubmission?.name}
        onClose={handleCloseSubmissionModal}
        onSubmissionCreated={handleSubmissionCreated}
      />
    </Box>
  );
};

export default MtoType2StudentView;