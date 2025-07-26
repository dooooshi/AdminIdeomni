'use client';

import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useTranslation } from 'react-i18next';
import { TeamListItem } from 'src/types/team';

interface TeamCardProps {
  team: TeamListItem;
  showActions?: boolean;
  onViewDetails?: (teamId: string) => void;
  onJoinTeam?: (teamId: string) => void;
  onAction?: (team: TeamListItem, event: React.MouseEvent) => void;
  isJoining?: boolean;
  actionLabel?: string;
  actionIcon?: string;
  actionColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  className?: string;
}

/**
 * Reusable Team Card Component
 */
function TeamCard({
  team,
  showActions = true,
  onViewDetails,
  onJoinTeam,
  onAction,
  isJoining = false,
  actionLabel = 'Join',
  actionIcon = 'heroicons-outline:plus',
  actionColor = 'primary',
  className = ''
}: TeamCardProps) {
  const { t } = useTranslation();
  const canJoin = team.isOpen && team.currentMembers < team.maxMembers;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Paper 
      component={motion.div}
      variants={item}
      className={`p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Team Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Typography variant="h6" className="font-semibold mb-1">
              {team.name}
            </Typography>
            <div className="flex items-center gap-2">
              <Chip
                size="small"
                label={team.isOpen ? t('teamManagement:OPEN') : t('teamManagement:CLOSED')}
                color={team.isOpen ? 'success' : 'default'}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {team.currentMembers}/{team.maxMembers} {t('teamManagement:MEMBERS')}
              </Typography>
              {team.currentMembers >= team.maxMembers && (
                <Chip
                  size="small"
                  label={t('teamManagement:FULL')}
                  color="error"
                  variant="outlined"
                />
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {team.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            className="mb-4 flex-1"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {team.description}
          </Typography>
        )}

        {/* Team Leader */}
        <div className="mb-4">
          <Typography variant="body2" color="text.secondary" className="mb-1">
            {t('teamManagement:TEAM_LEADER')}
          </Typography>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold">
              {team.leader.firstName && team.leader.lastName
                ? `${team.leader.firstName[0]}${team.leader.lastName[0]}`
                : team.leader.username[0].toUpperCase()}
            </div>
            <Typography variant="body2">
              {team.leader.firstName && team.leader.lastName
                ? `${team.leader.firstName} ${team.leader.lastName}`
                : team.leader.username}
            </Typography>
          </div>
        </div>

        {/* Created Date */}
        <Typography variant="body2" color="text.secondary" className="mb-4">
          {t('teamManagement:CREATED')} {new Date(team.createdAt).toLocaleDateString()}
        </Typography>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-auto">
            {onViewDetails && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => onViewDetails(team.id)}
                startIcon={<IdeomniSvgIcon>heroicons-outline:eye</IdeomniSvgIcon>}
              >
                {t('teamManagement:VIEW_DETAILS')}
              </Button>
            )}
            
            {onJoinTeam && canJoin && (
              <Button
                variant="contained"
                size="small"
                onClick={() => onJoinTeam(team.id)}
                disabled={isJoining}
                startIcon={<IdeomniSvgIcon>{actionIcon}</IdeomniSvgIcon>}
                color={actionColor}
              >
                {isJoining ? t('teamManagement:JOINING') : (actionLabel === 'Join' ? t('teamManagement:JOIN') : actionLabel)}
              </Button>
            )}

            {onAction && (
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => onAction(team, e)}
                startIcon={<IdeomniSvgIcon>{actionIcon}</IdeomniSvgIcon>}
                color={actionColor}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Paper>
  );
}

export default TeamCard;