import { createSelector, WithSlice } from '@reduxjs/toolkit';
import { apiService as api } from 'src/store/apiService';
import TeamService from 'src/lib/services/teamService';
import {
  Team,
  TeamListItem,
  TeamMember,
  PaginatedResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
  InviteMembersRequest,
  TransferLeadershipRequest,
  InviteResponse,
  TeamListQuery
} from 'src/types/team';

export const addTagTypes = ['team', 'team_members', 'available_teams'] as const;

const TeamApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // Get current user's team
      getCurrentTeam: build.query<Team, void>({
        queryFn: async () => {
          try {
            const data = await TeamService.getCurrentTeam();
            return { data };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        providesTags: ['team']
      }),

      // Create a new team
      createTeam: build.mutation<Team, CreateTeamRequest>({
        queryFn: async (teamData) => {
          try {
            const data = await TeamService.createTeam(teamData);
            return { data };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        invalidatesTags: ['team', 'available_teams']
      }),

      // Update team settings
      updateTeam: build.mutation<Team, UpdateTeamRequest>({
        queryFn: async (teamData) => {
          try {
            const data = await TeamService.updateTeam(teamData);
            return { data };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        invalidatesTags: ['team']
      }),



      // Get available teams
      getAvailableTeams: build.query<PaginatedResponse<TeamListItem>, TeamListQuery>({
        queryFn: async (params = {}) => {
          try {
            const data = await TeamService.getAvailableTeams(params);
            return { data };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        providesTags: ['available_teams']
      }),

      // Join a team
      joinTeam: build.mutation<void, string>({
        queryFn: async (teamId) => {
          try {
            await TeamService.joinTeam(teamId);
            return { data: undefined };
          } catch (error: any) {
            console.error('Error in joinTeam:', error);
            return { 
              error: { 
                status: error?.httpStatus || error?.status || 500, 
                data: error?.message || error?.data || 'Failed to join team'
              } 
            };
          }
        },
        invalidatesTags: ['team', 'available_teams']
      }),

      // Get team details
      getTeamDetails: build.query<Team, string>({
        queryFn: async (teamId) => {
          try {
            const data = await TeamService.getTeamDetails(teamId);
            return { data };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        providesTags: ['team']
      }),

      // Get team members
      getTeamMembers: build.query<TeamMember[], void>({
        queryFn: async () => {
          try {
            const data = await TeamService.getTeamMembers();
            return { data };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        providesTags: ['team_members']
      }),

      // Invite members
      inviteMembers: build.mutation<InviteResponse, InviteMembersRequest>({
        queryFn: async (inviteData) => {
          try {
            const data = await TeamService.inviteMembers(inviteData);
            return { data };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        invalidatesTags: ['team_members']
      }),


      // Transfer leadership
      transferLeadership: build.mutation<void, TransferLeadershipRequest>({
        queryFn: async (transferData) => {
          try {
            await TeamService.transferLeadership(transferData);
            return { data: undefined };
          } catch (error: any) {
            return { error: { status: error.httpStatus || 500, data: error.message } };
          }
        },
        invalidatesTags: ['team', 'team_members']
      })
    }),
    overrideExisting: false
  });

export default TeamApi;

export const {
  useGetCurrentTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useGetAvailableTeamsQuery,
  useJoinTeamMutation,
  useGetTeamDetailsQuery,
  useGetTeamMembersQuery,
  useInviteMembersMutation,
  useTransferLeadershipMutation
} = TeamApi;

export type TeamApiType = {
  [TeamApi.reducerPath]: ReturnType<typeof TeamApi.reducer>;
};

/**
 * Lazy load
 */
declare module '@/store/rootReducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof TeamApi> {}
}

// Selectors
export const selectCurrentTeam = createSelector(
  TeamApi.endpoints.getCurrentTeam.select(),
  (result) => result.data
);

export const selectAvailableTeams = createSelector(
  TeamApi.endpoints.getAvailableTeams.select({}),
  (result) => result.data
);

export const selectTeamMembers = createSelector(
  TeamApi.endpoints.getTeamMembers.select(),
  (result) => result.data
);