'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Avatar,
  AvatarGroup,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Groups as TeamsIcon,
  Person as PersonIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ContractListItem, ContractStatus } from '@/types/contract';
import ContractStatusBadge from './ContractStatusBadge';

interface ContractCardProps {
  contract: ContractListItem;
  onView: () => void;
  userTeamId?: string;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onView, userTeamId }) => {
  const { t } = useTranslation();

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Check if user's team has approved
  const userTeamApproved = userTeamId ? 
    contract.teams.find(team => team.teamId === userTeamId)?.approved || false : 
    false;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Contract Number and Status */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="caption" color="textSecondary">
            {contract.contractNumber}
          </Typography>
          <ContractStatusBadge status={contract.status} />
        </Box>

        {/* Title */}
        <Typography variant="h6" gutterBottom noWrap>
          {contract.title}
        </Typography>

        {/* Teams */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TeamsIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            {t('contract.TEAM_COUNT', { count: contract.teamCount })}
          </Typography>
        </Box>

        {/* Team Avatars */}
        <AvatarGroup max={4} sx={{ mb: 2, justifyContent: 'flex-start' }}>
          {contract.teams.map((team) => (
            <Tooltip key={team.teamId} title={team.teamName}>
              <Avatar sx={{ bgcolor: team.approved ? 'success.main' : 'grey.400' }}>
                {team.teamName.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>

        {/* Your Team Status */}
        {userTeamId && contract.teams.find(t => t.teamId === userTeamId) && (
          <Box mb={2}>
            <Chip
              size="small"
              label={userTeamApproved ? t('contract.APPROVED') : t('contract.PENDING')}
              color={userTeamApproved ? 'success' : 'warning'}
              variant="outlined"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Creator Info */}
        {contract.createdBy && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {contract.createdBy.firstName} {contract.createdBy.lastName}
            </Typography>
          </Box>
        )}

        {/* Date Info */}
        <Box display="flex" alignItems="center" gap={1}>
          <TimeIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            {contract.status === ContractStatus.SIGNED && contract.signedAt
              ? `${t('contract.SIGNED_AT')}: ${formatDate(contract.signedAt)}`
              : contract.status === ContractStatus.REJECTED && contract.rejectedAt
              ? `${t('contract.REJECTED_AT')}: ${formatDate(contract.rejectedAt)}`
              : `${t('contract.CREATED_AT')}: ${formatDate(contract.createdAt)}`
            }
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={onView}
        >
          {t('contract.VIEW_DETAILS')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ContractCard;