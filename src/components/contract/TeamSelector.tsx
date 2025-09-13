'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Groups as TeamIcon
} from '@mui/icons-material';
import { contractService } from '@/lib/services/contractService';

interface Team {
  teamId: string;
  teamName: string;
}

interface TeamSelectorProps {
  selectedTeamIds: string[];
  onChange: (teamIds: string[]) => void;
  userTeamId?: string;
  maxTeams: number;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  selectedTeamIds,
  onChange,
  userTeamId,
  maxTeams
}) => {
  const { t } = useTranslation();
  
  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch available teams
  const fetchTeams = async () => {
    try {
      setError(null);
      const response = await contractService.getAvailableTeams();
      setTeams(response?.teams || []);
    } catch (err: any) {
      setError(err.message || t('contract.FAILED_TO_LOAD_TEAMS'));
      console.error('Failed to fetch teams:', err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTeams();
  }, []);

  // Handle team toggle
  const handleToggle = (teamId: string) => {
    const currentIndex = selectedTeamIds.indexOf(teamId);
    const newChecked = [...selectedTeamIds];

    if (currentIndex === -1) {
      // Add team if not at max
      if (newChecked.length < maxTeams) {
        newChecked.push(teamId);
      }
    } else {
      // Remove team
      newChecked.splice(currentIndex, 1);
    }

    onChange(newChecked);
  };

  // Filter teams by search
  const filteredTeams = (teams || []).filter(team =>
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  // Empty state
  if (teams.length === 0) {
    return (
      <Alert severity="info">
        {t('contract.NO_AVAILABLE_TEAMS')}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Available Teams */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('contract.AVAILABLE_TEAMS')} ({filteredTeams.length})
            </Typography>
            
            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            
            {/* Team List */}
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredTeams.map((team) => {
                const isSelected = selectedTeamIds.includes(team.teamId);
                const isDisabled = !isSelected && selectedTeamIds.length >= maxTeams;
                
                return (
                  <ListItem
                    key={team.teamId}
                    disablePadding
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleToggle(team.teamId)}
                      />
                    }
                  >
                    <ListItemButton
                      onClick={() => handleToggle(team.teamId)}
                      disabled={isDisabled}
                      dense
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: isSelected ? 'primary.main' : 'grey.400' }}>
                          {team.teamName.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={team.teamName}
                        secondary={
                          isDisabled && !isSelected ? 
                          t('contract.MAX_TEAMS_REACHED') : 
                          null
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Selected Teams */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('contract.SELECTED_TEAMS')} ({selectedTeamIds.length}/{maxTeams})
            </Typography>
            
            {selectedTeamIds.length === 0 ? (
              <Box py={4} textAlign="center">
                <TeamIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body2" color="textSecondary" mt={1}>
                  {t('contract.NO_TEAMS_SELECTED')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {selectedTeamIds.map((teamId) => {
                  const team = teams.find(t => t.teamId === teamId);
                  if (!team) return null;
                  
                  return (
                    <Chip
                      key={teamId}
                      label={team.teamName}
                      onDelete={() => handleToggle(teamId)}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            )}
            
            {/* Your Team Note */}
            {userTeamId && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('contract.YOUR_TEAM_AUTO_INCLUDED')}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamSelector;