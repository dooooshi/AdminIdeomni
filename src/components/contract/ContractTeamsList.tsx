'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Groups as TeamIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';

interface Team {
  teamId: string;
  teamName: string;
  approved: boolean;
  approvedAt?: string | null;
  joinedAt: string;
}

interface ContractTeamsListProps {
  teams: Team[];
  userTeamId?: string;
}

const ContractTeamsList: React.FC<ContractTeamsListProps> = ({ teams, userTeamId }) => {
  const { t } = useTranslation();

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Handle undefined or null teams array
  const teamsList = teams || [];

  // Empty state
  if (teamsList.length === 0) {
    return (
      <Box textAlign="center" py={2}>
        <Typography variant="body2" color="textSecondary">
          {t('contract.NO_TEAMS')}
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {teamsList.map((team, index) => (
        <React.Fragment key={team.teamId}>
          <ListItem
            sx={{
              bgcolor: team.teamId === userTeamId ? 'action.hover' : 'transparent',
              borderRadius: 1
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: team.approved ? 'success.main' : 'grey.400' }}>
                {team.teamName.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">
                    {team.teamName}
                  </Typography>
                  {team.teamId === userTeamId && (
                    <Chip 
                      label={t('contract.YOUR_TEAM')} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              secondary={
                <Box component="span" display="flex" alignItems="center" gap={1} mt={0.5}>
                  {team.approved ? (
                    <>
                      <ApprovedIcon fontSize="small" color="success" />
                      <Typography component="span" variant="body2" color="success.main">
                        {t('contract.APPROVED')}
                        {team.approvedAt && ` • ${formatDate(team.approvedAt)}`}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <PendingIcon fontSize="small" color="warning" />
                      <Typography component="span" variant="body2" color="warning.main">
                        {t('contract.WAITING_FOR_APPROVAL')}
                      </Typography>
                    </>
                  )}
                </Box>
              }
            />
          </ListItem>
          {index < teamsList.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default ContractTeamsList;