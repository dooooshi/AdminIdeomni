'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';
import { useTranslation } from 'react-i18next';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useGetTeamAccountsQuery } from '../ManagerTeamAccountApi';
import { TeamAccountListItem } from '@/types/teamAccount';
import TeamAccountService from '@/lib/services/teamAccountService';

interface AccountsOverviewProps {
  onSelectTeam?: (teamId: string) => void;
  onEditBalances?: (teamId: string, teamName: string) => void;
}

/**
 * Manager Team Accounts Overview Component
 * Shows paginated list of all team accounts in the manager's activity
 */
function AccountsOverview({ onSelectTeam, onEditBalances }: AccountsOverviewProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Manual debounce implementation to avoid non-serializable values in Redux
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { 
    data: accountsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetTeamAccountsQuery({
    page: page + 1, // API uses 1-based pagination
    pageSize,
    search: debouncedSearch
  });

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // Reset page when search term changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const handleSelectTeam = useCallback((teamId: string) => {
    onSelectTeam?.(teamId);
  }, [onSelectTeam]);

  const handleEditBalances = useCallback((team: TeamAccountListItem) => {
    onEditBalances?.(team.teamId, team.team.name);
  }, [onEditBalances]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common:retry')}
            </Button>
          }
        >
          {t('teamAccounts:failedToLoadAccounts')}
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Typography variant="h5" className="font-semibold">
                {t('teamAccounts:teamAccounts')}
              </Typography>
              
              {/* Search */}
              <TextField
                size="small"
                placeholder={t('teamAccounts:searchTeams')}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IdeomniSvgIcon className="text-gray-400">
                        heroicons-outline:search
                      </IdeomniSvgIcon>
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <IdeomniSvgIcon>heroicons-outline:x-mark</IdeomniSvgIcon>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accounts Table */}
      <motion.div variants={item}>
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('teamAccounts:teamName')}</TableCell>
                  <TableCell>{t('teamAccounts:teamLeader')}</TableCell>
                  <TableCell align="center">{t('teamAccounts:members')}</TableCell>
                  <TableCell align="right">{t('teamAccounts:gold')}</TableCell>
                  <TableCell align="right">{t('teamAccounts:carbon')}</TableCell>
                  <TableCell align="center">{t('common:actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: pageSize }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell align="center"><Skeleton variant="text" width={40} /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                      <TableCell align="center"><Skeleton variant="rectangular" width={80} height={32} /></TableCell>
                    </TableRow>
                  ))
                ) : accountsData?.data.length === 0 ? (
                  // No data
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-12">
                      <Box className="text-center">
                        <IdeomniSvgIcon className="text-6xl text-gray-300 mb-4">
                          heroicons-outline:currency-dollar
                        </IdeomniSvgIcon>
                        <Typography variant="h6" color="textSecondary" className="mb-2">
                          {searchTerm ? t('teamAccounts:noAccountsFound') : t('teamAccounts:noAccountsYet')}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {searchTerm 
                            ? t('teamAccounts:tryDifferentSearch')
                            : t('teamAccounts:accountsWillAppearHere')
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  accountsData?.data.map((account) => (
                    <TableRow 
                      key={account.id}
                      hover
                      className="cursor-pointer"
                      onClick={() => handleSelectTeam(account.teamId)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" className="font-medium">
                            {account.team.name}
                          </Typography>
                          {account.team.description && (
                            <Typography variant="caption" color="textSecondary">
                              {account.team.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {account.team.leader.firstName && account.team.leader.lastName
                            ? `${account.team.leader.firstName} ${account.team.leader.lastName}`
                            : account.team.leader.username
                          }
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {account.team.leader.email}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={account.team._count.members}
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          className={`font-mono ${TeamAccountService.getResourceColor(account.gold, 'gold')}`}
                        >
                          {TeamAccountService.formatResourceAmount(account.gold)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          className={`font-mono ${TeamAccountService.getResourceColor(account.carbon, 'carbon')}`}
                        >
                          {TeamAccountService.formatResourceAmount(account.carbon)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <IdeomniSvgIcon>heroicons-outline:pencil</IdeomniSvgIcon>
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBalances(account);
                          }}
                        >
                          {t('teamAccounts:editBalances')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {accountsData && (
            <TablePagination
              component="div"
              count={accountsData.total}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage={t('common:itemsPerPage')}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} ${t('common:of')} ${count !== -1 ? count : `${t('common:moreThan')} ${to}`}`
              }
            />
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default AccountsOverview;