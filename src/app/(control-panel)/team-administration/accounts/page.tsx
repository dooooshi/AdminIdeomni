'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniPageCarded from '@ideomni/core/IdeomniPageCarded';
import withReducer from 'src/store/withReducer';
import ManagerTeamAccountApi from '../ManagerTeamAccountApi';
import AccountStatistics from './AccountStatistics';
import AccountsOverview from './AccountsOverview';
import BalanceManagement from './BalanceManagement';

interface TeamAccountsPageProps {}

/**
 * Team Accounts Management Page
 * Provides comprehensive team account management for managers
 */
function TeamAccountsPage({}: TeamAccountsPageProps) {
  const { t } = useTranslation();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    // You could navigate to team details or open a modal here
  };

  const handleEditBalances = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setIsBalanceDialogOpen(true);
  };

  const handleCloseBalanceDialog = () => {
    setIsBalanceDialogOpen(false);
    setSelectedTeamId(null);
    setSelectedTeamName('');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      <IdeomniPageCarded
        header={
          <motion.div variants={item} className="p-6">
            <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <Box>
                <Typography variant="h4" className="font-semibold mb-2">
                  {t('teamAccounts:teamAccounts')}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {t('teamAdministration:MANAGE_TEAM_ACCOUNTS_DESCRIPTION')}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        }
        content={
          <motion.div variants={container} className="p-6 space-y-8">
            {/* Statistics Dashboard */}
            <motion.div variants={item}>
              <AccountStatistics />
            </motion.div>

            {/* Accounts Overview */}
            <motion.div variants={item}>
              <AccountsOverview
                onSelectTeam={handleSelectTeam}
                onEditBalances={handleEditBalances}
              />
            </motion.div>

            {/* Balance Management Dialog */}
            <BalanceManagement
              teamId={selectedTeamId}
              teamName={selectedTeamName}
              open={isBalanceDialogOpen}
              onClose={handleCloseBalanceDialog}
            />
          </motion.div>
        }
      />
    </motion.div>
  );
}

export default withReducer('managerTeamAccountApi', ManagerTeamAccountApi.reducer)(TeamAccountsPage);