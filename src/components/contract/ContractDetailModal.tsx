'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Groups as TeamsIcon,
  Description as ContentIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  Assignment as ContractIcon,
  History as HistoryIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { contractService } from '@/lib/services/contractService';
import { ContractDetailsResponse, ContractStatus, ContractHistoryResponse } from '@/types/contract';
import ContractStatusBadge from './ContractStatusBadge';
import ContractActions from './ContractActions';

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
      id={`contract-tabpanel-${index}`}
      aria-labelledby={`contract-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ContractDetailModalProps {
  contractId: string;
  userTeamId?: string;
  onRefresh?: () => void;
}

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ 
  contractId, 
  userTeamId,
  onRefresh 
}) => {
  const { t } = useTranslation();
  
  // State
  const [contract, setContract] = useState<ContractDetailsResponse | null>(null);
  const [history, setHistory] = useState<ContractHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Fetch contract details
  const fetchContract = async () => {
    try {
      setError(null);
      const response = await contractService.getContractDetails(contractId);
      setContract(response);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_LOAD_CONTRACT'));
      console.error('Failed to fetch contract:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch contract history
  const fetchHistory = async () => {
    try {
      const response = await contractService.getContractHistory({ 
        contractId,
        page: 1,
        limit: 50 
      });
      setHistory(response);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchContract();
    fetchHistory();
  }, [contractId]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContract();
    fetchHistory();
  };

  // Handle action complete
  const handleActionComplete = () => {
    fetchContract();
    fetchHistory();
    onRefresh?.();
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return dateString;
    }
  };

  // Calculate approval progress
  const getApprovalProgress = () => {
    if (!contract?.teams) return 0;
    const approvedCount = contract.teams.filter(t => t.approved).length;
    return (approvedCount / contract.teams.length) * 100;
  };

  // Get status icon
  const getStatusIcon = (status: ContractStatus | string) => {
    const statusStr = String(status).toUpperCase();
    
    if (statusStr === 'SIGNED' || status === ContractStatus.SIGNED) {
      return <ApprovedIcon color="success" />;
    }
    if (statusStr === 'REJECTED' || status === ContractStatus.REJECTED) {
      return <RejectedIcon color="error" />;
    }
    return <PendingIcon color="warning" />;
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !contract) {
    return (
      <Alert severity="error">
        {error || t('contract.CONTRACT_NOT_FOUND')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <ContractIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                {contract.contractNumber}
              </Typography>
              <ContractStatusBadge status={contract.status} size="medium" />
            </Stack>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {contract.title}
            </Typography>
            <Stack direction="row" spacing={3} mt={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  {contract.createdBy?.firstName} {contract.createdBy?.lastName || contract.createdBy?.username}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <DateIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  {formatDate(contract.createdAt)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <Tooltip title={t('common.refresh')}>
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Approval Progress */}
        {contract.status === ContractStatus.PENDING_APPROVAL && (
          <Box mt={3}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="textSecondary">
                {t('contract.APPROVAL_PROGRESS')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {contract.teams.filter(t => t.approved).length} / {contract.teams.length} {t('contract.TEAMS_APPROVED')}
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={getApprovalProgress()} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<InfoIcon />} label={t('contract.OVERVIEW')} />
          <Tab icon={<TeamsIcon />} label={t('contract.TEAMS')} />
          <Tab icon={<HistoryIcon />} label={t('contract.HISTORY')} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Tab */}
        <Stack spacing={3}>
          {/* Contract Content */}
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <ContentIcon color="primary" />
                <Typography variant="h6">{t('contract.CONTRACT_CONTENT')}</Typography>
              </Stack>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.08)',
                  background: (theme) => theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.03) 0%, 
                        rgba(255, 255, 255, 0.05) 100%)`
                    : `linear-gradient(135deg, 
                        rgba(0, 0, 0, 0.01) 0%, 
                        rgba(0, 0, 0, 0.03) 100%)`,
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    lineHeight: 1.8,
                    color: (theme) => theme.palette.text.primary,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '0.95rem',
                  }}
                >
                  {contract.content}
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('contract.QUICK_INFO')}
              </Typography>
              <Stack spacing={2}>
                {contract.status === ContractStatus.SIGNED && (
                  <Stack direction="row" spacing={2}>
                    <Chip 
                      icon={<ApprovedIcon />} 
                      label={`${t('contract.SIGNED_AT')}: ${formatDate(contract.signedAt)}`}
                      color="success"
                      variant="outlined"
                    />
                  </Stack>
                )}
                {contract.status === ContractStatus.REJECTED && (
                  <Stack direction="row" spacing={2}>
                    <Chip 
                      icon={<RejectedIcon />} 
                      label={`${t('contract.REJECTED_AT')}: ${formatDate(contract.rejectedAt)}`}
                      color="error"
                      variant="outlined"
                    />
                  </Stack>
                )}
                <Stack direction="row" spacing={2}>
                  <Chip 
                    icon={<TeamsIcon />} 
                    label={`${contract.teams.length} ${t('contract.TEAMS_INVOLVED')}`}
                    variant="outlined"
                  />
                  <Chip 
                    icon={<PersonIcon />} 
                    label={`${t('contract.CREATED_BY')}: ${contract.createdBy?.firstName} ${contract.createdBy?.lastName}`}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Actions */}
          {userTeamId && contract.status === ContractStatus.PENDING_APPROVAL && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('contract.ACTIONS')}
                </Typography>
                <ContractActions
                  contract={contract}
                  userTeamId={userTeamId}
                  onActionComplete={handleActionComplete}
                />
              </CardContent>
            </Card>
          )}
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Teams Tab */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('contract.PARTICIPATING_TEAMS')} ({contract.teams.length})
            </Typography>
            <List>
              {contract.teams.map((team, index) => (
                <React.Fragment key={team.teamId}>
                  <ListItem
                    sx={{
                      bgcolor: team.teamId === userTeamId ? 'action.hover' : 'transparent',
                      borderRadius: 2,
                      mb: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: team.approved 
                          ? 'success.main' 
                          : contract.status === ContractStatus.REJECTED
                            ? 'error.main'
                            : 'grey.400',
                        width: 48,
                        height: 48
                      }}>
                        {team.teamName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" fontWeight="medium">
                            {team.teamName}
                          </Typography>
                          {team.teamId === userTeamId && (
                            <Chip 
                              label={t('contract.YOUR_TEAM')} 
                              size="small" 
                              color="primary"
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Box component="div">
                          <Stack direction="row" spacing={2} mt={1}>
                            {team.approved ? (
                              <Chip
                                icon={<ApprovedIcon />}
                                label={`${t('contract.APPROVED')} • ${formatDate(team.approvedAt)}`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              // If contract is rejected, teams that didn't approve are considered as having rejected
                              contract.status === ContractStatus.REJECTED ? (
                                <Chip
                                  icon={<RejectedIcon />}
                                  label={t('contract.REJECTED')}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  icon={<PendingIcon />}
                                  label={t('contract.WAITING_FOR_APPROVAL')}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )
                            )}
                            <Typography variant="body2" color="textSecondary" component="span">
                              {t('contract.JOINED_AT')}: {formatDate(team.joinedAt)}
                            </Typography>
                          </Stack>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                  {index < contract.teams.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* History Tab */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('contract.OPERATION_HISTORY')}
            </Typography>
            {history && history.history.length > 0 ? (
              <List>
                {history.history.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: 
                            item.operationType === 'APPROVED' ? 'success.main' :
                            item.operationType === 'REJECTED' ? 'error.main' :
                            item.operationType === 'CREATED' ? 'primary.main' : 'grey.500'
                        }}>
                          {item.operationType === 'APPROVED' && <ApprovedIcon />}
                          {item.operationType === 'REJECTED' && <RejectedIcon />}
                          {item.operationType === 'CREATED' && <ContractIcon />}
                          {!['APPROVED', 'REJECTED', 'CREATED'].includes(item.operationType) && <HistoryIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight="medium">
                              {item.operationType}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatDate(item.createdAt)}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box component="div">
                            <Typography variant="body2" color="textSecondary" component="div">
                              {item.description}
                            </Typography>
                            {item.operator && (
                              <Typography variant="caption" color="textSecondary" component="div">
                                {t('contract.BY')}: {item.operator.firstName} {item.operator.lastName}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    {index < history.history.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center" py={4}>
                {t('contract.NO_HISTORY')}
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default ContractDetailModal;