'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Stack,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Description as DocumentIcon,
  Groups as TeamsIcon
} from '@mui/icons-material';
import { contractService } from '@/lib/services/contractService';

interface Team {
  teamId: string;
  teamName: string;
}

interface ContractPreviewProps {
  title: string;
  content: string;
  teamIds: string[];
  userTeamId?: string;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({
  title,
  content,
  teamIds,
  userTeamId
}) => {
  const { t } = useTranslation();
  
  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team details
  const fetchTeams = async () => {
    try {
      setError(null);
      const response = await contractService.getAvailableTeams();
      const selectedTeams = response.teams.filter(team => 
        teamIds.includes(team.teamId)
      );
      setTeams(selectedTeams);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_LOAD_TEAMS'));
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams when teamIds change
  useEffect(() => {
    if (teamIds.length > 0) {
      fetchTeams();
    } else {
      setTeams([]);
      setLoading(false);
    }
  }, [teamIds]);

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <DocumentIcon color="primary" />
          <Typography variant="h6">
            {t('contract.CONTRACT_PREVIEW')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Contract Number (Example) */}
        <Typography variant="caption" color="textSecondary" display="block" mb={1}>
          {t('contract.CONTRACT_NUMBER')}: CTR-{new Date().getFullYear()}-XXXX
        </Typography>

        {/* Title */}
        <Typography variant="h5" gutterBottom>
          {title || t('contract.NO_TITLE')}
        </Typography>

        {/* Content */}
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            bgcolor: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'grey.50',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.12)',
            my: 3 
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              color: (theme) => theme.palette.text.primary
            }}
          >
            {content || t('contract.NO_CONTENT')}
          </Typography>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Teams Section */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TeamsIcon color="primary" />
            <Typography variant="subtitle1">
              {t('contract.PARTICIPATING_TEAMS')}
            </Typography>
            <Chip 
              label={`${teamIds.length + (userTeamId ? 1 : 0)} ${t('contract.TEAMS')}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error">
              {error}
            </Alert>
          ) : (
            <List>
              {/* User's Team (Auto-included) */}
              {userTeamId && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {t('contract.YOUR_TEAM').charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('contract.YOUR_TEAM')}
                    secondary={
                      <Chip 
                        label={t('contract.CREATOR_TEAM')} 
                        size="small" 
                        color="primary"
                      />
                    }
                  />
                </ListItem>
              )}

              {/* Selected Teams */}
              {teams.map((team) => (
                <ListItem key={team.teamId}>
                  <ListItemAvatar>
                    <Avatar>
                      {team.teamName.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={team.teamName}
                  />
                </ListItem>
              ))}

              {/* No teams selected */}
              {teams.length === 0 && !userTeamId && (
                <ListItem>
                  <ListItemText
                    primary={t('contract.NO_TEAMS_SELECTED')}
                    secondary={t('contract.SELECT_TEAMS_TO_CONTINUE')}
                  />
                </ListItem>
              )}
            </List>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Footer Note */}
        <Typography variant="caption" color="textSecondary">
          {t('contract.PREVIEW_NOTE')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ContractPreview;