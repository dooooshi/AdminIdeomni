'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import managerTeamApiService from '../../ManagerTeamApi';
import { TeamMember, User, Team } from 'src/types/team';

interface TeamDetailsProps {
  teamId: string;
}

/**
 * Team Details Component (Manager View)
 */
function TeamDetails({ teamId }: TeamDetailsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showDisbandDialog, setShowDisbandDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [newLeader, setNewLeader] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Fetch team details
  const fetchTeamDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await managerTeamApiService.getManagerTeamDetails(teamId);
      setTeam(response);
    } catch (err: any) {
      console.error('Failed to fetch team details:', err);
      setError(err.message || 'Failed to load team details');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch team details on mount
  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  if (isLoading) {
    return <IdeomniLoading />;
  }

  if (error || !team) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8">
        <Typography variant="h6" className="mb-4">
          {t('teamAdministration:NO_TEAMS_FOUND')}
        </Typography>
        <Button
          onClick={() => router.push('/team-administration/teams')}
          startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
        >
          {t('teamAdministration:MANAGE_TEAMS')}
        </Button>
      </div>
    );
  }

  const activeMembers = team.members.filter(m => m.status === 'ACTIVE');
  const eligibleLeaders = activeMembers.filter(m => m.user.id !== team.leader.id);

  const handleMemberAction = (event: React.MouseEvent<HTMLButtonElement>, member: TeamMember) => {
    event.stopPropagation();
    setSelectedMember(member);
    setMemberMenuAnchor(event.currentTarget);
  };

  const handleCloseMemberMenu = () => {
    setMemberMenuAnchor(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    try {
      setIsRemoving(true);
      await managerTeamApiService.forceRemoveMember(teamId, selectedMember.user.id);
      setShowRemoveDialog(false);
      handleCloseMemberMenu();
      // Refresh team details
      await fetchTeamDetails();
    } catch (err: any) {
      console.error('Failed to remove member:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDisbandTeam = async () => {
    try {
      setIsDisbanding(true);
      await managerTeamApiService.forceDisbandTeam(teamId);
      router.push('/team-administration/teams');
    } catch (err: any) {
      console.error('Failed to disband team:', err);
    } finally {
      setIsDisbanding(false);
    }
  };

  const handleTransferLeadership = async () => {
    if (!newLeader) return;
    
    try {
      setIsTransferring(true);
      await managerTeamApiService.forceTransferLeadership(teamId, newLeader.id);
      setShowTransferDialog(false);
      setNewLeader(null);
      // Refresh team details
      await fetchTeamDetails();
    } catch (err: any) {
      console.error('Failed to transfer leadership:', err);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <motion.div
          className="flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={item} className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="text"
                  onClick={() => router.push('/team-administration/teams')}
                  startIcon={<IdeomniSvgIcon>heroicons-outline:arrow-left</IdeomniSvgIcon>}
                >
                  {t('teamAdministration:MANAGE_TEAMS')}
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h3" className="font-semibold">
                  {team.name}
                </Typography>
                <Chip
                  label={team.isOpen ? t('teamAdministration:OPEN') : t('teamAdministration:CLOSED')}
                  color={team.isOpen ? 'success' : 'default'}
                  variant="outlined"
                />
                {activeMembers.length >= team.maxMembers && (
                  <Chip
                    label={t('teamAdministration:FULL')}
                    color="error"
                    variant="outlined"
                  />
                )}
              </div>
              <Typography color="text.secondary">
                {team.description || 'No description provided'}
              </Typography>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outlined"
                onClick={() => setShowTransferDialog(true)}
                disabled={eligibleLeaders.length === 0}
                startIcon={<IdeomniSvgIcon>heroicons-outline:switch-horizontal</IdeomniSvgIcon>}
              >
                {t('teamAdministration:PROMOTE_TO_LEADER')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowDisbandDialog(true)}
                startIcon={<IdeomniSvgIcon>heroicons-outline:trash</IdeomniSvgIcon>}
              >
                {t('teamAdministration:DISBAND_TEAM')}
              </Button>
            </div>
          </motion.div>

          {/* Team Stats */}
          <motion.div variants={item}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4 text-center">
                  <Typography variant="h4" className="font-bold text-blue-600">
                    {activeMembers.length}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamAdministration:ACTIVE_TEAMS')}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4 text-center">
                  <Typography variant="h4" className="font-bold text-green-600">
                    {team.maxMembers}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamAdministration:MAXIMUM_MEMBERS')}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4 text-center">
                  <Typography variant="h4" className="font-bold text-purple-600">
                    {Math.round((activeMembers.length / team.maxMembers) * 100)}%
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamAdministration:CURRENT_MEMBERS')}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper className="p-4 text-center">
                  <Typography variant="h4" className="font-bold text-orange-600">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('teamAdministration:CREATED')}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>

          {/* Team Members */}
          <motion.div variants={item}>
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4">
                {t('teamAdministration:TEAM_MEMBERS')} ({activeMembers.length})
              </Typography>
              
              <div className="space-y-3">
                {activeMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                        {member.user.firstName && member.user.lastName
                          ? `${member.user.firstName[0]}${member.user.lastName[0]}`
                          : member.user.username[0].toUpperCase()}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <Typography variant="subtitle1" className="font-medium">
                            {member.user.firstName && member.user.lastName
                              ? `${member.user.firstName} ${member.user.lastName}`
                              : member.user.username}
                          </Typography>
                          {member.user.id === team.leader.id && (
                            <Chip
                              size="small"
                              label={t('teamAdministration:LEADER')}
                              color="primary"
                              variant="outlined"
                              icon={<IdeomniSvgIcon size={16}>heroicons-solid:star</IdeomniSvgIcon>}
                            />
                          )}
                        </div>
                        <Typography variant="body2" color="text.secondary">
                          {member.user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('teamAdministration:MEMBER_SINCE')} {new Date(member.joinedAt).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Typography variant="body2" color="text.secondary">
                        {t('teamAdministration:USER_TYPE')}: {member.user.userType === 1 ? t('teamAdministration:MANAGER') : member.user.userType === 2 ? t('teamAdministration:WORKER') : t('teamAdministration:STUDENT')}
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => handleMemberAction(e, member)}
                        startIcon={<IdeomniSvgIcon>heroicons-outline:cog</IdeomniSvgIcon>}
                      >
                        {t('teamAdministration:ACTIONS')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Paper>
          </motion.div>
        </motion.div>
      </div>

      {/* Member Action Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleCloseMemberMenu}
      >
        {selectedMember?.user.id !== team.leader.id && (
          <MenuItem onClick={() => {
            setNewLeader(selectedMember.user);
            setShowTransferDialog(true);
            handleCloseMemberMenu();
          }}>
            <IdeomniSvgIcon className="mr-2">heroicons-outline:star</IdeomniSvgIcon>
            {t('teamAdministration:PROMOTE_TO_LEADER')}
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => setShowRemoveDialog(true)}
          className="text-red-600"
        >
          <IdeomniSvgIcon className="mr-2">heroicons-outline:trash</IdeomniSvgIcon>
          {t('teamAdministration:REMOVE_MEMBER')}
        </MenuItem>
      </Menu>

      {/* Remove Member Dialog */}
      <Dialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center gap-2">
            <IdeomniSvgIcon className="text-red-500">
              heroicons-outline:exclamation-triangle
            </IdeomniSvgIcon>
            {t('teamAdministration:REMOVE_MEMBER')}
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            {t('teamAdministration:MEMBER_REMOVE_ERROR')}: <strong>
              {selectedMember?.user.firstName && selectedMember?.user.lastName
                ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}`
                : selectedMember?.user.username}
            </strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('teamAdministration:CANNOT_UNDO')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRemoveDialog(false)}>
            {t('teamAdministration:CANCEL')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemoveMember}
            disabled={isRemoving}
            startIcon={<IdeomniSvgIcon>heroicons-outline:trash</IdeomniSvgIcon>}
          >
            {isRemoving ? t('teamAdministration:MEMBER_REMOVE_ERROR') : t('teamAdministration:REMOVE_MEMBER')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Leadership Dialog */}
      <Dialog
        open={showTransferDialog}
        onClose={() => {
          setShowTransferDialog(false);
          setNewLeader(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('teamAdministration:PROMOTE_TO_LEADER')}
        </DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            {t('teamAdministration:PROMOTE_TO_LEADER')}: <strong>{team.name}</strong>
          </Typography>
          <Autocomplete
            options={eligibleLeaders.map(m => m.user)}
            getOptionLabel={(user) => 
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName} (${user.username})`
                : user.username
            }
            value={newLeader}
            onChange={(_, value) => setNewLeader(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('teamAdministration:LEADER')}
                placeholder={t('teamAdministration:TEAM_MEMBERS')}
              />
            )}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowTransferDialog(false);
            setNewLeader(null);
          }}>
            {t('teamAdministration:CANCEL')}
          </Button>
          <Button
            variant="contained"
            onClick={handleTransferLeadership}
            disabled={!newLeader || isTransferring}
            startIcon={<IdeomniSvgIcon>heroicons-outline:switch-horizontal</IdeomniSvgIcon>}
          >
            {isTransferring ? t('teamAdministration:LEADER_PROMOTED_SUCCESS') : t('teamAdministration:PROMOTE_TO_LEADER')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disband Team Dialog */}
      <Dialog
        open={showDisbandDialog}
        onClose={() => setShowDisbandDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center gap-2">
            <IdeomniSvgIcon className="text-red-500">
              heroicons-outline:exclamation-triangle
            </IdeomniSvgIcon>
            {t('teamAdministration:DISBAND_TEAM_CONFIRMATION')}
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            {t('teamAdministration:DISBAND_WARNING')}: <strong>{team.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('teamAdministration:DISBAND_WARNING')} {t('teamAdministration:CANNOT_UNDO')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisbandDialog(false)}>
            {t('teamAdministration:CANCEL')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDisbandTeam}
            disabled={isDisbanding}
            startIcon={<IdeomniSvgIcon>heroicons-outline:trash</IdeomniSvgIcon>}
          >
            {isDisbanding ? t('teamAdministration:DISBANDING') : t('teamAdministration:DISBAND_TEAM')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TeamDetails;