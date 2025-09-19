'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Info as InfoIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { MtoType2SettlementPriority } from '@/lib/types/mtoType2';
import { useToast } from '@/components/common/ToastProvider';

interface MtoType2SettlementPriorityProps {
  requirementId: number;
  isManager: boolean;
}

const MtoType2SettlementPriority: React.FC<MtoType2SettlementPriorityProps> = ({
  requirementId,
  isManager
}) => {
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [priorities, setPriorities] = useState<MtoType2SettlementPriority[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const loadPriorities = async () => {
    setLoading(true);
    try {
      const data = await MtoType2Service.getSettlementPriorities(requirementId);
      // Sort by settlement order
      data.sort((a, b) => a.settlementOrder - b.settlementOrder);
      setPriorities(data);
    } catch (error: any) {
      showError(error.message || t('mto.type2.errors.loadPriorities'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, [requirementId]);

  const getMallLevelColor = (level: number) => {
    switch (level) {
      case 5: return 'error'; // Red for highest priority
      case 4: return 'warning';
      case 3: return 'info';
      case 2: return 'success';
      case 1: return 'default';
      default: return 'default';
    }
  };

  const getMallLevelIcon = (level: number) => {
    if (level === 5) return <TrophyIcon fontSize="small" />;
    return Array.from({ length: level }).map((_, i) => (
      <StarIcon key={i} fontSize="small" sx={{ width: 14, height: 14 }} />
    ));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            {t('mto.type2.settlementPriority.title')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => setShowExplanation(true)}
            >
              {t('mto.type2.settlementPriority.howItWorks')}
            </Button>
            <IconButton onClick={loadPriorities} size="small">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          {t('mto.type2.settlementPriority.description')}
        </Alert>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" width={80}>
                  {t('mto.type2.settlementPriority.order')}
                </TableCell>
                <TableCell>
                  {t('mto.type2.settlementPriority.team')}
                </TableCell>
                <TableCell align="center">
                  {t('mto.type2.settlementPriority.mallLevel')}
                </TableCell>
                <TableCell align="right">
                  {t('mto.type2.settlementPriority.unitPrice')}
                </TableCell>
                <TableCell>
                  {t('mto.type2.settlementPriority.submissionTime')}
                </TableCell>
                <TableCell align="center">
                  {t('mto.type2.settlementPriority.priorityScore')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priorities.map((priority, index) => (
                <TableRow
                  key={priority.submissionId}
                  sx={{
                    backgroundColor: index < 3 ? 'action.hover' : 'inherit',
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell align="center">
                    <Chip
                      label={priority.settlementOrder}
                      color={index === 0 ? 'primary' : 'default'}
                      size="small"
                      icon={index === 0 ? <TrophyIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Submission #{priority.submissionId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`Level ${priority.mallLevel}`}
                      color={getMallLevelColor(priority.mallLevel)}
                      size="small"
                      icon={
                        <Box display="flex" alignItems="center">
                          {getMallLevelIcon(priority.mallLevel)}
                        </Box>
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      ${priority.unitPrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(priority.submittedAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={priority.explanation}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                        <Typography variant="body2">
                          {priority.priorityScore.toFixed(2)}
                        </Typography>
                        <InfoIcon fontSize="small" color="action" />
                      </Stack>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {priorities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {t('mto.type2.settlementPriority.noSubmissions')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Priority Explanation Dialog */}
      <Dialog
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('mto.type2.settlementPriority.howItWorks')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                {t('mto.type2.settlementPriority.priorityRules')}
              </Typography>
            </Alert>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                1. {t('mto.type2.settlementPriority.rule1Title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('mto.type2.settlementPriority.rule1Description')}
              </Typography>
              <Stack direction="row" spacing={1} mb={2}>
                {[5, 4, 3, 2, 1].map(level => (
                  <Chip
                    key={level}
                    label={`Level ${level}`}
                    color={getMallLevelColor(level)}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                2. {t('mto.type2.settlementPriority.rule2Title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('mto.type2.settlementPriority.rule2Description')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                3. {t('mto.type2.settlementPriority.rule3Title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('mto.type2.settlementPriority.rule3Description')}
              </Typography>
            </Box>

            <Alert severity="warning">
              <Typography variant="body2">
                {t('mto.type2.settlementPriority.budgetNote')}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MtoType2SettlementPriority;