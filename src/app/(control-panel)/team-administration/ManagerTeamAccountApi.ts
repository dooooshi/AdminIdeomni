import { createSelector, WithSlice } from '@reduxjs/toolkit';
import { apiService as api } from 'src/store/apiService';
import TeamAccountService from 'src/lib/services/teamAccountService';
import {
  TeamAccountWithTeam,
  PaginatedTeamAccounts,
  AccountSummaryStatistics,
  UpdateBalancesRequest,
  SetBalancesRequest,
  TeamAccountListQuery,
  TeamAccount
} from 'src/types/teamAccount';

export const addTagTypes = ['manager_team_accounts', 'account_summary', 'team_account_detail'] as const;

const ManagerTeamAccountApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // Get all team accounts in manager's activity
      getTeamAccounts: build.query<PaginatedTeamAccounts, TeamAccountListQuery>({
        queryFn: async (params = {}) => {
          try {
            const data = await TeamAccountService.getTeamAccounts(params);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to get team accounts'
              } 
            };
          }
        },
        providesTags: ['manager_team_accounts']
      }),

      // Get account summary statistics
      getAccountSummary: build.query<AccountSummaryStatistics, void>({
        queryFn: async () => {
          try {
            const data = await TeamAccountService.getAccountSummary();
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to get account summary'
              } 
            };
          }
        },
        providesTags: ['account_summary']
      }),

      // Get specific team account
      getTeamAccount: build.query<TeamAccountWithTeam, string>({
        queryFn: async (teamId) => {
          try {
            const data = await TeamAccountService.getTeamAccount(teamId);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to get team account'
              } 
            };
          }
        },
        providesTags: (result, error, teamId) => [
          { type: 'team_account_detail', id: teamId }
        ]
      }),

      // Update team balances (delta changes)
      updateTeamBalances: build.mutation<TeamAccount, { teamId: string; changes: UpdateBalancesRequest }>({
        queryFn: async ({ teamId, changes }) => {
          try {
            const data = await TeamAccountService.updateTeamBalances(teamId, changes);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to update team balances'
              } 
            };
          }
        },
        invalidatesTags: (result, error, { teamId }) => [
          'manager_team_accounts',
          'account_summary',
          { type: 'team_account_detail', id: teamId }
        ]
      }),

      // Set team balances (absolute values)
      setTeamBalances: build.mutation<TeamAccount, { teamId: string; balances: SetBalancesRequest }>({
        queryFn: async ({ teamId, balances }) => {
          try {
            const data = await TeamAccountService.setTeamBalances(teamId, balances);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to set team balances'
              } 
            };
          }
        },
        invalidatesTags: (result, error, { teamId }) => [
          'manager_team_accounts',
          'account_summary',
          { type: 'team_account_detail', id: teamId }
        ]
      })
    }),
    overrideExisting: false
  });

export default ManagerTeamAccountApi;

export const {
  useGetTeamAccountsQuery,
  useGetAccountSummaryQuery,
  useGetTeamAccountQuery,
  useUpdateTeamBalancesMutation,
  useSetTeamBalancesMutation
} = ManagerTeamAccountApi;

export type ManagerTeamAccountApiType = {
  [ManagerTeamAccountApi.reducerPath]: ReturnType<typeof ManagerTeamAccountApi.reducer>;
};

// Note: LazyLoadedSlices extension is handled in the main apiService file

// Selectors
export const selectTeamAccounts = createSelector(
  (params: TeamAccountListQuery) => ManagerTeamAccountApi.endpoints.getTeamAccounts.select(params),
  (selectTeamAccounts) => (state: any) => selectTeamAccounts(state)?.data
);

export const selectAccountSummary = createSelector(
  ManagerTeamAccountApi.endpoints.getAccountSummary.select(),
  (result) => result.data
);

export const selectTeamAccountDetail = createSelector(
  (teamId: string) => ManagerTeamAccountApi.endpoints.getTeamAccount.select(teamId),
  (selectTeamAccount) => (state: any) => selectTeamAccount(state)?.data
);