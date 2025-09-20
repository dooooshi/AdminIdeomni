'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import {
  AddCircle as CreatedIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Delete as DeletedIcon
} from '@mui/icons-material';
import { contractService } from '@/lib/services/contractService';
import { ContractHistory as ContractHistoryType, ContractOperationType } from '@/types/contract';

interface ContractHistoryProps {
  contractId: string;
}

const ContractHistory: React.FC<ContractHistoryProps> = ({ contractId }) => {
  const { t } = useTranslation();
  
  // State
  const [history, setHistory] = useState<ContractHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch history
  const fetchHistory = async () => {
    try {
      setError(null);
      const response = await contractService.getContractHistory({
        contractId,
        limit: 20
      });
      setHistory(response.history);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_LOAD_HISTORY'));
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchHistory();
  }, [contractId]);

  // Get operation icon
  const getOperationIcon = (type: ContractOperationType) => {
    switch (type) {
      case ContractOperationType.CREATED:
        return <CreatedIcon />;
      case ContractOperationType.APPROVED:
        return <ApprovedIcon />;
      case ContractOperationType.REJECTED:
        return <RejectedIcon />;
      case ContractOperationType.DELETED:
        return <DeletedIcon />;
      default:
        return null;
    }
  };

  // Get operation color
  const getOperationColor = (type: ContractOperationType): any => {
    switch (type) {
      case ContractOperationType.CREATED:
        return 'primary';
      case ContractOperationType.APPROVED:
        return 'success';
      case ContractOperationType.REJECTED:
        return 'error';
      case ContractOperationType.DELETED:
        return 'grey';
      default:
        return 'grey';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString()
      };
    } catch {
      return { date: dateString, time: '' };
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (history.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" align="center" py={2}>
        {t('contract.NO_HISTORY')}
      </Typography>
    );
  }

  return (
    <Timeline position="right" sx={{ p: 0 }}>
      {history.map((item, index) => {
        const dateTime = formatDate(item.createdAt);
        
        return (
          <TimelineItem key={item.id}>
            <TimelineOppositeContent
              sx={{ flex: 0.3, px: 1 }}
            >
              <Typography variant="caption" display="block" color="textSecondary">
                {dateTime.date}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                {dateTime.time}
              </Typography>
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={getOperationColor(item.operationType)}>
                {getOperationIcon(item.operationType)}
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t(`contract.OPERATION_${item.operationType}`)}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {item.description}
                </Typography>
                
                {/* Operator Info */}
                {item.operator && (
                  <Box mt={1}>
                    <Typography variant="caption" color="textSecondary">
                      {t('contract.OPERATOR')}: {item.operator.firstName} {item.operator.lastName}
                    </Typography>
                  </Box>
                )}
                
                {/* Team Info */}
                {item.operatorTeam && (
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {t('contract.TEAM')}: {item.operatorTeam.name}
                    </Typography>
                  </Box>
                )}
                
                {/* Status Change */}
                {(item.previousStatus || item.newStatus) && (
                  <Box display="flex" gap={1} mt={1} alignItems="center">
                    {item.previousStatus && (
                      <Chip 
                        label={item.previousStatus} 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                    {item.previousStatus && item.newStatus && (
                      <Typography variant="caption">→</Typography>
                    )}
                    {item.newStatus && (
                      <Chip 
                        label={item.newStatus} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default ContractHistory;