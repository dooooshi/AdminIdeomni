'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Autocomplete,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import UserActivityService, {
  AddUsersToActivityRequest,
  RemoveUsersFromActivityRequest,
  BulkOperationResponse,
  UserOperationResult,
} from '@/lib/services/userActivityService';
import { Activity } from '@/lib/services/activityService';
import { UserService, User } from '@/lib/services/userService';

interface BulkUserOperationsProps {
  open: boolean;
  onClose: () => void;
  activity: Activity;
  operation: 'add' | 'remove';
  preSelectedUserIds?: string[];
  onSuccess: () => void;
}

interface UserSearchResult {
  users: User[];
  total: number;
}

const BulkUserOperations: React.FC<BulkUserOperationsProps> = ({
  open,
  onClose,
  activity,
  operation,
  preSelectedUserIds = [],
  onSuccess,
}) => {
  const { t } = useTranslation('activityManagement');
  const theme = useTheme();

  // State management
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationResult, setOperationResult] = useState<BulkOperationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load pre-selected users when dialog opens
  useEffect(() => {
    if (open && preSelectedUserIds.length > 0) {
      loadPreSelectedUsers();
    } else if (open) {
      // Reset state when opening for add operation
      setSelectedUsers([]);
      setSearchValue('');
      setSearchResults([]);
      setReason('');
      setSendNotification(true);
      setOperationResult(null);
      setError(null);
      setShowResults(false);
    }
  }, [open, preSelectedUserIds]);

  const loadPreSelectedUsers = async () => {
    try {
      const users = await Promise.all(
        preSelectedUserIds.map(id => UserService.getUserById(id))
      );
      setSelectedUsers(users);
    } catch (err) {
      console.error('Failed to load pre-selected users:', err);
      setError(t('FAILED_TO_LOAD_USERS'));
    }
  };

  // Search users with debouncing
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const result = await UserService.searchUsers({
          q: searchValue,
          page: 1,
          pageSize: 20,
          isActive: true,
        });
        setSearchResults(result.data);
      } catch (err) {
        console.error('User search failed:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchValue]);

  const handleUserSelect = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleOperation = async () => {
    if (selectedUsers.length === 0) {
      setError(t('NO_USERS_SELECTED'));
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const userIds = selectedUsers.map(u => u.id);

      let result: BulkOperationResponse;

      if (operation === 'add') {
        const request: AddUsersToActivityRequest = {
          userIds,
          reason: reason.trim() || undefined,
          sendNotification,
        };
        result = await UserActivityService.addUsersToActivity(activity.id, request);
      } else {
        const request: RemoveUsersFromActivityRequest = {
          userIds,
          reason: reason.trim() || undefined,
          sendNotification,
        };
        result = await UserActivityService.removeUsersFromActivity(activity.id, request);
      }

      setOperationResult(result);
      setShowResults(true);

      if (result.successCount > 0) {
        onSuccess();
      }
    } catch (err) {
      console.error(`${operation} operation failed:`, err);
      setError(err instanceof Error ? err.message : t('OPERATION_FAILED'));
    } finally {
      setOperationLoading(false);
    }
  };

  const handleClose = () => {
    if (!operationLoading) {
      onClose();
    }
  };

  const getOperationIcon = () => {
    return operation === 'add' ? <PersonAddIcon /> : <PersonRemoveIcon />;
  };

  const getOperationTitle = () => {
    return operation === 'add' 
      ? t('ADD_USERS_TO_ACTIVITY')
      : t('REMOVE_USERS_FROM_ACTIVITY');
  };

  const getOperationColor = () => {
    return operation === 'add' ? 'primary' : 'error';
  };

  const formatUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const getUserTypeDisplayName = (userType: number) => {
    switch (userType) {
      case 1: return t('MANAGER');
      case 2: return t('WORKER');
      case 3: return t('STUDENT');
      default: return t('UNKNOWN');
    }
  };

  const getUserTypeColor = (userType: number): 'primary' | 'secondary' | 'info' | 'default' => {
    switch (userType) {
      case 1: return 'primary';
      case 2: return 'secondary';
      case 3: return 'info';
      default: return 'default';
    }
  };

  if (showResults && operationResult) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getOperationIcon()}
            {t('OPERATION_RESULTS')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {activity.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('OPERATION_COMPLETED_AT')}: {new Date(operationResult.metadata.operationTimestamp).toLocaleString()}
            </Typography>
          </Box>

          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {operationResult.totalCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('TOTAL_PROCESSED')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {operationResult.successCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('SUCCESSFUL')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="error.main">
                    {operationResult.failedCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('FAILED')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Detailed Results */}
          <Typography variant="h6" gutterBottom>
            {t('DETAILED_RESULTS')}
          </Typography>
          <List>
            {operationResult.details.map((detail, index) => (
              <ListItem key={detail.userId} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {detail.success ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <ErrorIcon color="error" fontSize="small" />
                      )}
                      <Typography variant="body1">
                        {detail.user ? 
                          `${detail.user.username} (${detail.user.email})` : 
                          detail.userId
                        }
                      </Typography>
                    </Box>
                  }
                  secondary={
                    detail.success ? 
                      t('OPERATION_SUCCESSFUL') : 
                      detail.error || t('OPERATION_FAILED')
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            {t('CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getOperationIcon()}
          {getOperationTitle()}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {activity.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('ACTIVITY_TYPE')}: {activity.activityType}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Main Content Layout */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3,
            ...(operation === 'remove' && { flexDirection: 'column' })
          }}>
            {/* User Search Section */}
            {operation === 'add' && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {t('SEARCH_USERS')}
                </Typography>
                <Autocomplete
                  options={searchResults}
                  getOptionLabel={(user) => `${formatUserDisplayName(user)} (${user.email})`}
                                  renderOption={(props, user) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {formatUserDisplayName(user).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {formatUserDisplayName(user)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={getUserTypeDisplayName(user.userType)}
                          color={getUserTypeColor(user.userType)}
                          size="small"
                        />
                      </Box>
                    </li>
                  );
                }}
                  inputValue={searchValue}
                  onInputChange={(_, value) => setSearchValue(value)}
                  onChange={(_, user) => {
                    if (user) {
                      handleUserSelect(user);
                      setSearchValue('');
                    }
                  }}
                  loading={searchLoading}
                  loadingText={t('SEARCHING_USERS')}
                  noOptionsText={searchValue ? t('NO_USERS_FOUND') : t('START_TYPING_TO_SEARCH')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('SEARCH_USERS_BY_NAME_EMAIL')}
                      placeholder={t('TYPE_TO_SEARCH')}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <>
                            {searchLoading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            )}

            {/* Selected Users Section */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {operation === 'add' ? t('SELECTED_USERS') : t('USERS_TO_REMOVE')}
                </Typography>
                <Badge badgeContent={selectedUsers.length} color="primary">
                  <GroupIcon />
                </Badge>
              </Box>

              {selectedUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <GroupIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1">
                    {operation === 'add' 
                      ? t('NO_USERS_SELECTED_ADD') 
                      : t('NO_USERS_SELECTED_REMOVE')
                    }
                  </Typography>
                </Box>
              ) : (
                <Card variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {selectedUsers.map((user, index) => (
                      <ListItem key={user.id} divider={index < selectedUsers.length - 1}>
                        <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                          {formatUserDisplayName(user).charAt(0).toUpperCase()}
                        </Avatar>
                        <ListItemText
                          primary={formatUserDisplayName(user)}
                          secondary={user.email}
                        />
                        <Chip
                          label={getUserTypeDisplayName(user.userType)}
                          color={getUserTypeColor(user.userType)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}
            </Box>
          </Box>

          {/* Operation Details */}
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('OPERATION_DETAILS')}
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label={t('REASON')}
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  operation === 'add' 
                    ? t('REASON_FOR_ADDING_USERS')
                    : t('REASON_FOR_REMOVING_USERS')
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                  />
                }
                label={t('SEND_EMAIL_NOTIFICATION')}
              />
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={operationLoading}>
          {t('CANCEL')}
        </Button>
        <Button
          onClick={handleOperation}
          variant="contained"
          color={getOperationColor()}
          disabled={operationLoading || selectedUsers.length === 0}
          startIcon={operationLoading ? <CircularProgress size={20} /> : getOperationIcon()}
        >
          {operationLoading 
            ? t('PROCESSING') 
            : operation === 'add' 
              ? t('ADD_USERS') 
              : t('REMOVE_USERS')
          } ({selectedUsers.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUserOperations; 