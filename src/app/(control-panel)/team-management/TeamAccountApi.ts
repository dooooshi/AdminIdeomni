import { createSelector, WithSlice } from '@reduxjs/toolkit';
import { apiService as api } from 'src/store/apiService';
import TeamAccountService from 'src/lib/services/teamAccountService';
import TeamTransferService from 'src/lib/services/teamTransferService';
import {
  TeamAccountWithTeam
} from 'src/types/teamAccount';
import {
  TransferGoldRequest,
  TransferCarbonRequest,
  TransferResponse,
  PaginatedOperationHistory,
  PaginatedTransferHistory,
  PaginatedBalanceHistory,
  OperationSummary,
  OperationHistoryQuery,
  TransferHistoryQuery,
  BalanceHistoryQuery,
  OperationSummaryQuery,
  AvailableTeam
} from 'src/types/teamTransfer';

export const addTagTypes = ['team_account', 'team_transfers', 'team_history'] as const;

const TeamAccountApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // Get current user's team account
      getCurrentUserTeamAccount: build.query<TeamAccountWithTeam, void>({
        queryFn: async () => {
          try {
            const data = await TeamAccountService.getCurrentUserTeamAccount();
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
        providesTags: ['team_account']
      }),

      // ===============================
      // TRANSFER OPERATIONS
      // ===============================

      // Transfer gold to another team
      transferGold: build.mutation<TransferResponse, TransferGoldRequest>({
        queryFn: async (request) => {
          try {
            const data = await TeamTransferService.transferGold(request);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to transfer gold'
              } 
            };
          }
        },
        invalidatesTags: ['team_account', 'team_transfers', 'team_history']
      }),

      // Transfer carbon to another team
      transferCarbon: build.mutation<TransferResponse, TransferCarbonRequest>({
        queryFn: async (request) => {
          try {
            const data = await TeamTransferService.transferCarbon(request);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to transfer carbon'
              } 
            };
          }
        },
        invalidatesTags: ['team_account', 'team_transfers', 'team_history']
      }),

      // ===============================
      // HISTORY TRACKING
      // ===============================

      // Get operation history
      getOperationHistory: build.query<PaginatedOperationHistory, OperationHistoryQuery>({
        queryFn: async (query) => {
          try {
            const data = await TeamTransferService.getOperationHistory(query);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to get operation history'
              } 
            };
          }
        },
        providesTags: ['team_history']
      }),

      // Get transfer history
      getTransferHistory: build.query<PaginatedTransferHistory, TransferHistoryQuery>({
        queryFn: async (query) => {
          try {
            const data = await TeamTransferService.getTransferHistory(query);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to get transfer history'
              } 
            };
          }
        },
        providesTags: ['team_history']
      }),

      // Get balance history
      getBalanceHistory: build.query<PaginatedBalanceHistory, BalanceHistoryQuery>({
        queryFn: async (query) => {
          try {
            const data = await TeamTransferService.getBalanceHistory(query);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to get balance history'
              } 
            };
          }
        },
        providesTags: ['team_history']
      }),

      // Get operation summary
      getOperationSummary: build.query<OperationSummary, OperationSummaryQuery>({
        queryFn: async (query) => {
          try {
            const data = await TeamTransferService.getOperationSummary(query);
            return { data };
          } catch (error: any) {
            return { 
              error: { 
                status: error.response?.status || error.httpStatus || 500, 
                data: error.response?.data?.message || error.message || 'Failed to get operation summary'
              } 
            };
          }
        },
        providesTags: ['team_history']
      }),

      // ===============================
      // HELPER ENDPOINTS
      // ===============================

      // Get available teams for transfer
      getAvailableTeamsForTransfer: build.query<AvailableTeam[], void>({
        queryFn: async () => {
          try {
            const data = await TeamTransferService.getAvailableTeamsForTransfer();
            // Ensure we always return an array
            return { data: Array.isArray(data) ? data : [] };
          } catch (error: any) {
            // Return empty array instead of error to prevent UI crashes
            console.warn('getAvailableTeamsForTransfer failed, returning empty array:', error);
            return { data: [] };
          }
        },
        providesTags: ['team_transfers']
      })
    }),
    overrideExisting: false
  });

export default TeamAccountApi;

export const {
  // Account queries
  useGetCurrentUserTeamAccountQuery,
  
  // Transfer mutations
  useTransferGoldMutation,
  useTransferCarbonMutation,
  
  // History queries
  useGetOperationHistoryQuery,
  useGetTransferHistoryQuery,
  useGetBalanceHistoryQuery,
  useGetOperationSummaryQuery,
  
  // Helper queries
  useGetAvailableTeamsForTransferQuery
} = TeamAccountApi;

export type TeamAccountApiType = {
  [TeamAccountApi.reducerPath]: ReturnType<typeof TeamAccountApi.reducer>;
};

/**
 * Lazy load
 */
declare module '@/store/rootReducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof TeamAccountApi> {}
}

// Selectors
export const selectCurrentUserTeamAccount = createSelector(
  TeamAccountApi.endpoints.getCurrentUserTeamAccount.select(),
  (result) => result.data
);