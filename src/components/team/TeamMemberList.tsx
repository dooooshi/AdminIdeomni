'use client';

import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { TeamMember, Team } from 'src/types/team';

interface TeamMemberListProps {
  team: Team;
  onMemberAction?: (member: TeamMember, event: React.MouseEvent) => void;
  showActions?: boolean;
  actionLabel?: string;
  actionIcon?: string;
  actionColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  isCompact?: boolean;
  className?: string;
}

/**
 * Reusable Team Member List Component
 */
function TeamMemberList({
  team,
  onMemberAction,
  showActions = false,
  actionLabel = 'Actions',
  actionIcon = 'heroicons-outline:cog',
  actionColor = 'primary',
  isCompact = false,
  className = ''
}: TeamMemberListProps) {
  const { t } = useTranslation();
  const activeMembers = team.members.filter(m => m.status === 'ACTIVE');

  const container = {
    show: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <Paper className={`p-6 ${className}`}>
      <Typography variant="h6" className="mb-4">
        {t('teamManagement:TEAM_MEMBERS')} ({activeMembers.length}/{team.maxMembers})
      </Typography>
      
      <motion.div 
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {activeMembers.map((member) => (
          <motion.div 
            key={member.id} 
            variants={item}
            className={`flex items-center justify-between p-${isCompact ? '3' : '4'} bg-gray-50 dark:bg-gray-800 rounded-lg`}
          >
            <div className="flex items-center gap-${isCompact ? '2' : '3'}">
              <div className={`w-${isCompact ? '8' : '10'} h-${isCompact ? '8' : '10'} rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold ${isCompact ? 'text-xs' : ''}`}>
                {member.user.firstName && member.user.lastName
                  ? `${member.user.firstName[0]}${member.user.lastName[0]}`
                  : member.user.username[0].toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Typography variant={isCompact ? 'body2' : 'subtitle1'} className="font-medium truncate">
                    {member.user.firstName && member.user.lastName
                      ? `${member.user.firstName} ${member.user.lastName}`
                      : member.user.username}
                  </Typography>
                  {member.user.id === team.leader.id && (
                    <Chip
                      size="small"
                      label={t('teamManagement:LEADER')}
                      color="primary"
                      variant="outlined"
                      icon={<IdeomniSvgIcon size={14}>heroicons-solid:star</IdeomniSvgIcon>}
                    />
                  )}
                </div>
                {!isCompact && (
                  <Typography variant="body2" color="text.secondary" className="truncate">
                    {member.user.email}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {t('teamManagement:JOINED')} {new Date(member.joinedAt).toLocaleDateString()}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isCompact && (
                <div className="text-right">
                  <Typography variant="body2" color="text.secondary">
                    {member.user.userType === 1 ? t('teamManagement:MANAGER') : 
                     member.user.userType === 2 ? t('teamManagement:WORKER') : t('teamManagement:STUDENT')}
                  </Typography>
                </div>
              )}
              
              {showActions && onMemberAction && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => onMemberAction(member, e)}
                  startIcon={<IdeomniSvgIcon>{actionIcon}</IdeomniSvgIcon>}
                  color={actionColor}
                >
                  {actionLabel}
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Show empty slots if team is not full */}
        {team.maxMembers > activeMembers.length && (
          <>
            {Array.from({ length: team.maxMembers - activeMembers.length }).map((_, index) => (
              <motion.div 
                key={`empty-${index}`}
                variants={item}
                className={`flex items-center gap-${isCompact ? '2' : '3'} p-${isCompact ? '3' : '4'} border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg`}
              >
                <div className={`w-${isCompact ? '8' : '10'} h-${isCompact ? '8' : '10'} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
                  <IdeomniSvgIcon className="text-gray-400" size={isCompact ? 16 : 20}>
                    heroicons-outline:plus
                  </IdeomniSvgIcon>
                </div>
                <Typography variant="body2" color="text.secondary">
                  {t('teamManagement:AVAILABLE_SPOT')}
                </Typography>
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
    </Paper>
  );
}

export default TeamMemberList;