/**
 * Manager Team Status Redux Slice
 * State management for Manager Team Status Dashboard
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import ManagerTeamStatusService from '@/lib/services/managerTeamStatusService';
import type {
  TeamSummary,
  TeamStatus,
  TeamOperation,
  TeamFacility,
  TeamLandOwnership,
  TeamMemberDetail,
  TeamBalanceHistory,
  PaginatedResponse,
  PaginationMeta,
  ListTeamsQuery,
  OperationsQuery,
  FacilitiesQuery,
  LandQuery,
  MembersQuery,
  BalanceHistoryQuery,
  TeamListFilters,
  OperationFilters,
  FacilityFilters,
  LandFilters,
  MemberFilters,
} from '@/types/managerTeamStatus';

// ==================== State Types ====================

export interface ManagerTeamStatusState {
  // Teams List
  teams: TeamSummary[];
  teamsLoading: boolean;
  teamsError: string | null;
  teamsPagination: PaginationMeta | null;

  // Selected Team Detail
  selectedTeam: TeamStatus | null;
  selectedTeamId: string | null;
  teamDetailLoading: boolean;
  teamDetailError: string | null;

  // Team Operations
  operations: TeamOperation[];
  operationsLoading: boolean;
  operationsError: string | null;
  operationsPagination: PaginationMeta | null;

  // Team Facilities
  facilities: TeamFacility[];
  facilitiesLoading: boolean;
  facilitiesError: string | null;
  facilitiesPagination: PaginationMeta | null;

  // Team Land Ownership
  landOwnership: TeamLandOwnership[];
  landOwnershipLoading: boolean;
  landOwnershipError: string | null;
  landOwnershipPagination: PaginationMeta | null;

  // Team Members
  members: TeamMemberDetail[];
  membersLoading: boolean;
  membersError: string | null;
  membersPagination: PaginationMeta | null;

  // Team Balance History
  balanceHistory: TeamBalanceHistory[];
  balanceHistoryLoading: boolean;
  balanceHistoryError: string | null;
  balanceHistoryPagination: PaginationMeta | null;

  // Filters
  teamListFilters: TeamListFilters;
  operationFilters: OperationFilters;
  facilityFilters: FacilityFilters;
  landFilters: LandFilters;
  memberFilters: MemberFilters;

  // Dashboard Summary
  dashboardSummary: {
    totalTeams: number;
    totalMembers: number;
    totalGold: string;
    totalCarbon: string;
    openTeams: number;
    closedTeams: number;
  } | null;
}

const initialState: ManagerTeamStatusState = {
  teams: [],
  teamsLoading: false,
  teamsError: null,
  teamsPagination: null,

  selectedTeam: null,
  selectedTeamId: null,
  teamDetailLoading: false,
  teamDetailError: null,

  operations: [],
  operationsLoading: false,
  operationsError: null,
  operationsPagination: null,

  facilities: [],
  facilitiesLoading: false,
  facilitiesError: null,
  facilitiesPagination: null,

  landOwnership: [],
  landOwnershipLoading: false,
  landOwnershipError: null,
  landOwnershipPagination: null,

  members: [],
  membersLoading: false,
  membersError: null,
  membersPagination: null,

  balanceHistory: [],
  balanceHistoryLoading: false,
  balanceHistoryError: null,
  balanceHistoryPagination: null,

  teamListFilters: {
    search: '',
    sort: 'name',
    order: 'ASC',
  },
  operationFilters: {},
  facilityFilters: {},
  landFilters: {},
  memberFilters: {},

  dashboardSummary: null,
};

// ==================== Async Thunks ====================

/**
 * Fetch teams list with pagination and filters
 */
export const fetchTeams = createAsyncThunk(
  'managerTeamStatus/fetchTeams',
  async (params: ListTeamsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.getTeams(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

/**
 * Fetch detailed status for a specific team
 */
export const fetchTeamStatus = createAsyncThunk(
  'managerTeamStatus/fetchTeamStatus',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.getTeamStatus(teamId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team status');
    }
  }
);

/**
 * Fetch operations for a specific team
 */
export const fetchTeamOperations = createAsyncThunk(
  'managerTeamStatus/fetchTeamOperations',
  async ({ teamId, params }: { teamId: string; params?: OperationsQuery }, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.getTeamOperations(teamId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch operations');
    }
  }
);

/**
 * Fetch facilities for a specific team
 */
export const fetchTeamFacilities = createAsyncThunk(
  'managerTeamStatus/fetchTeamFacilities',
  async ({ teamId, params }: { teamId: string; params?: FacilitiesQuery }, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.getTeamFacilities(teamId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch facilities');
    }
  }
);

/**
 * Fetch land ownership for a specific team
 */
export const fetchTeamLand = createAsyncThunk(
  'managerTeamStatus/fetchTeamLand',
  async ({ teamId, params }: { teamId: string; params?: LandQuery }, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.getTeamLand(teamId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch land ownership');
    }
  }
);

/**
 * Fetch members for a specific team
 */
export const fetchTeamMembers = createAsyncThunk(
  'managerTeamStatus/fetchTeamMembers',
  async ({ teamId, params }: { teamId: string; params?: MembersQuery }, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.getTeamMembers(teamId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);

/**
 * Fetch balance history for a specific team
 */
export const fetchTeamBalanceHistory = createAsyncThunk(
  'managerTeamStatus/fetchTeamBalanceHistory',
  async ({ teamId, params }: { teamId: string; params?: BalanceHistoryQuery }, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.getTeamBalanceHistory(teamId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance history');
    }
  }
);

/**
 * Refresh all dashboard data
 */
export const refreshDashboard = createAsyncThunk(
  'managerTeamStatus/refreshDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ManagerTeamStatusService.refreshDashboardData();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh dashboard');
    }
  }
);

// ==================== Slice ====================

export const managerTeamStatusSlice = createSlice({
  name: 'managerTeamStatus',
  initialState,
  reducers: {
    // Teams List Actions
    setTeamListFilters: (state, action: PayloadAction<Partial<TeamListFilters>>) => {
      state.teamListFilters = { ...state.teamListFilters, ...action.payload };
    },
    clearTeamListFilters: (state) => {
      state.teamListFilters = initialState.teamListFilters;
    },

    // Team Selection
    setSelectedTeamId: (state, action: PayloadAction<string | null>) => {
      state.selectedTeamId = action.payload;
    },
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
      state.selectedTeamId = null;
    },

    // Operation Filters
    setOperationFilters: (state, action: PayloadAction<Partial<OperationFilters>>) => {
      state.operationFilters = { ...state.operationFilters, ...action.payload };
    },
    clearOperationFilters: (state) => {
      state.operationFilters = {};
    },

    // Facility Filters
    setFacilityFilters: (state, action: PayloadAction<Partial<FacilityFilters>>) => {
      state.facilityFilters = { ...state.facilityFilters, ...action.payload };
    },
    clearFacilityFilters: (state) => {
      state.facilityFilters = {};
    },

    // Land Filters
    setLandFilters: (state, action: PayloadAction<Partial<LandFilters>>) => {
      state.landFilters = { ...state.landFilters, ...action.payload };
    },
    clearLandFilters: (state) => {
      state.landFilters = {};
    },

    // Member Filters
    setMemberFilters: (state, action: PayloadAction<Partial<MemberFilters>>) => {
      state.memberFilters = { ...state.memberFilters, ...action.payload };
    },
    clearMemberFilters: (state) => {
      state.memberFilters = {};
    },

    // Clear All Data
    clearAllData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Teams
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.teamsLoading = true;
        state.teamsError = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teamsLoading = false;
        state.teams = action.payload.items;
        state.teamsPagination = action.payload.pagination;
        // Calculate dashboard summary
        if (action.payload.items.length > 0) {
          ManagerTeamStatusService.getDashboardSummary(action.payload.items).then((summary) => {
            state.dashboardSummary = summary;
          });
        }
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.teamsLoading = false;
        state.teamsError = action.payload as string;
      });

    // Fetch Team Status
    builder
      .addCase(fetchTeamStatus.pending, (state) => {
        state.teamDetailLoading = true;
        state.teamDetailError = null;
      })
      .addCase(fetchTeamStatus.fulfilled, (state, action) => {
        state.teamDetailLoading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(fetchTeamStatus.rejected, (state, action) => {
        state.teamDetailLoading = false;
        state.teamDetailError = action.payload as string;
      });

    // Fetch Team Operations
    builder
      .addCase(fetchTeamOperations.pending, (state) => {
        state.operationsLoading = true;
        state.operationsError = null;
      })
      .addCase(fetchTeamOperations.fulfilled, (state, action) => {
        state.operationsLoading = false;
        state.operations = action.payload.items;
        state.operationsPagination = action.payload.pagination;
      })
      .addCase(fetchTeamOperations.rejected, (state, action) => {
        state.operationsLoading = false;
        state.operationsError = action.payload as string;
      });

    // Fetch Team Facilities
    builder
      .addCase(fetchTeamFacilities.pending, (state) => {
        state.facilitiesLoading = true;
        state.facilitiesError = null;
      })
      .addCase(fetchTeamFacilities.fulfilled, (state, action) => {
        state.facilitiesLoading = false;
        state.facilities = action.payload.items;
        state.facilitiesPagination = action.payload.pagination;
      })
      .addCase(fetchTeamFacilities.rejected, (state, action) => {
        state.facilitiesLoading = false;
        state.facilitiesError = action.payload as string;
      });

    // Fetch Team Land
    builder
      .addCase(fetchTeamLand.pending, (state) => {
        state.landOwnershipLoading = true;
        state.landOwnershipError = null;
      })
      .addCase(fetchTeamLand.fulfilled, (state, action) => {
        state.landOwnershipLoading = false;
        state.landOwnership = action.payload.items;
        state.landOwnershipPagination = action.payload.pagination;
      })
      .addCase(fetchTeamLand.rejected, (state, action) => {
        state.landOwnershipLoading = false;
        state.landOwnershipError = action.payload as string;
      });

    // Fetch Team Members
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = action.payload.items;
        state.membersPagination = action.payload.pagination;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.payload as string;
      });

    // Fetch Team Balance History
    builder
      .addCase(fetchTeamBalanceHistory.pending, (state) => {
        state.balanceHistoryLoading = true;
        state.balanceHistoryError = null;
      })
      .addCase(fetchTeamBalanceHistory.fulfilled, (state, action) => {
        state.balanceHistoryLoading = false;
        state.balanceHistory = action.payload.items;
        state.balanceHistoryPagination = action.payload.pagination;
      })
      .addCase(fetchTeamBalanceHistory.rejected, (state, action) => {
        state.balanceHistoryLoading = false;
        state.balanceHistoryError = action.payload as string;
      });

    // Refresh Dashboard
    builder
      .addCase(refreshDashboard.pending, (state) => {
        state.teamsLoading = true;
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.teamsLoading = false;
        state.teams = action.payload.teams.items;
        state.teamsPagination = action.payload.teams.pagination;
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.teamsLoading = false;
        state.teamsError = action.payload as string;
      });
  },
});

// ==================== Actions ====================

export const {
  setTeamListFilters,
  clearTeamListFilters,
  setSelectedTeamId,
  clearSelectedTeam,
  setOperationFilters,
  clearOperationFilters,
  setFacilityFilters,
  clearFacilityFilters,
  setLandFilters,
  clearLandFilters,
  setMemberFilters,
  clearMemberFilters,
  clearAllData,
} = managerTeamStatusSlice.actions;

// ==================== Selectors ====================

export const selectTeams = (state: RootState) => state.managerTeamStatus?.teams || [];
export const selectTeamsLoading = (state: RootState) => state.managerTeamStatus?.teamsLoading || false;
export const selectTeamsError = (state: RootState) => state.managerTeamStatus?.teamsError || null;
export const selectTeamsPagination = (state: RootState) => state.managerTeamStatus?.teamsPagination || null;

export const selectSelectedTeam = (state: RootState) => state.managerTeamStatus?.selectedTeam || null;
export const selectTeamDetailLoading = (state: RootState) => state.managerTeamStatus?.teamDetailLoading || false;
export const selectTeamDetailError = (state: RootState) => state.managerTeamStatus?.teamDetailError || null;

export const selectOperations = (state: RootState) => state.managerTeamStatus?.operations || [];
export const selectOperationsLoading = (state: RootState) => state.managerTeamStatus?.operationsLoading || false;

export const selectFacilities = (state: RootState) => state.managerTeamStatus?.facilities || [];
export const selectFacilitiesLoading = (state: RootState) => state.managerTeamStatus?.facilitiesLoading || false;

export const selectLandOwnership = (state: RootState) => state.managerTeamStatus?.landOwnership || [];
export const selectLandOwnershipLoading = (state: RootState) => state.managerTeamStatus?.landOwnershipLoading || false;

export const selectMembers = (state: RootState) => state.managerTeamStatus?.members || [];
export const selectMembersLoading = (state: RootState) => state.managerTeamStatus?.membersLoading || false;

export const selectBalanceHistory = (state: RootState) => state.managerTeamStatus?.balanceHistory || [];
export const selectBalanceHistoryLoading = (state: RootState) => state.managerTeamStatus?.balanceHistoryLoading || false;

export const selectTeamListFilters = (state: RootState) => state.managerTeamStatus?.teamListFilters || initialState.teamListFilters;
export const selectDashboardSummary = (state: RootState) => state.managerTeamStatus?.dashboardSummary || null;

// ==================== Export ====================

export default managerTeamStatusSlice.reducer;