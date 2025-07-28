import { createSelector, WithSlice } from '@reduxjs/toolkit';
import { apiService as api } from 'src/store/apiService';
import TeamAccountService from 'src/lib/services/teamAccountService';
import {
  TeamAccountWithTeam
} from 'src/types/teamAccount';

export const addTagTypes = ['team_account'] as const;

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
      })
    }),
    overrideExisting: false
  });

export default TeamAccountApi;

export const {
  useGetCurrentUserTeamAccountQuery
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