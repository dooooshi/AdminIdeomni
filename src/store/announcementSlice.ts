import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import AnnouncementService from '@/lib/services/announcementService';
import {
  Announcement,
  AnnouncementState,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  CreateReactionDto,
  AnnouncementPaginationParams,
  AnnouncementReactionType
} from '@/types/announcement';

// Initial state
const initialState: AnnouncementState = {
  announcements: [],
  currentAnnouncement: null,
  myAnnouncements: [],
  loading: false,
  error: null,
  pagination: null,
  myAnnouncementsPagination: null
};

// Async thunks

// Manager thunks
export const createAnnouncement = createAsyncThunk(
  'announcement/create',
  async (data: CreateAnnouncementDto) => {
    return await AnnouncementService.createAnnouncement(data);
  }
);

export const updateAnnouncement = createAsyncThunk(
  'announcement/update',
  async ({ id, data }: { id: string; data: UpdateAnnouncementDto }) => {
    return await AnnouncementService.updateAnnouncement(id, data);
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcement/delete',
  async (id: string) => {
    return await AnnouncementService.deleteAnnouncement(id);
  }
);

export const fetchMyAnnouncements = createAsyncThunk(
  'announcement/fetchMy',
  async (params: AnnouncementPaginationParams = {}) => {
    return await AnnouncementService.getMyAnnouncements(params);
  }
);

// Student thunks
export const fetchAnnouncements = createAsyncThunk(
  'announcement/fetchAll',
  async (params: AnnouncementPaginationParams = {}) => {
    return await AnnouncementService.getAnnouncements(params);
  }
);

export const fetchAnnouncementById = createAsyncThunk(
  'announcement/fetchById',
  async (id: string) => {
    return await AnnouncementService.getAnnouncementById(id);
  }
);

export const addReaction = createAsyncThunk(
  'announcement/addReaction',
  async ({ announcementId, data }: { announcementId: string; data: CreateReactionDto }) => {
    return await AnnouncementService.addReaction(announcementId, data);
  }
);

export const removeReaction = createAsyncThunk(
  'announcement/removeReaction',
  async (announcementId: string) => {
    return await AnnouncementService.removeReaction(announcementId);
  }
);

// Slice
export const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAnnouncement: (state) => {
      state.currentAnnouncement = null;
    },
    // Optimistic update for reactions
    updateReactionOptimistic: (
      state,
      action: PayloadAction<{
        announcementId: string;
        reactionType: AnnouncementReactionType | null;
        previousReaction: AnnouncementReactionType | null;
      }>
    ) => {
      const { announcementId, reactionType, previousReaction } = action.payload;
      const announcement = state.announcements.find(a => a.id === announcementId);

      if (announcement) {
        // Remove previous reaction count
        if (previousReaction === AnnouncementReactionType.LIKE) {
          announcement.likeCount--;
        } else if (previousReaction === AnnouncementReactionType.DISLIKE) {
          announcement.dislikeCount--;
        }

        // Add new reaction count
        if (reactionType === AnnouncementReactionType.LIKE) {
          announcement.likeCount++;
        } else if (reactionType === AnnouncementReactionType.DISLIKE) {
          announcement.dislikeCount++;
        }

        // Update myReaction
        announcement.myReaction = reactionType || undefined;
      }

      // Also update in currentAnnouncement if it matches
      if (state.currentAnnouncement && state.currentAnnouncement.id === announcementId) {
        // Remove previous reaction count
        if (previousReaction === AnnouncementReactionType.LIKE) {
          state.currentAnnouncement.likeCount--;
          state.currentAnnouncement.reactions.likes--;
        } else if (previousReaction === AnnouncementReactionType.DISLIKE) {
          state.currentAnnouncement.dislikeCount--;
          state.currentAnnouncement.reactions.dislikes--;
        }

        // Add new reaction count
        if (reactionType === AnnouncementReactionType.LIKE) {
          state.currentAnnouncement.likeCount++;
          state.currentAnnouncement.reactions.likes++;
        } else if (reactionType === AnnouncementReactionType.DISLIKE) {
          state.currentAnnouncement.dislikeCount++;
          state.currentAnnouncement.reactions.dislikes++;
        }

        state.currentAnnouncement.myReaction = reactionType || undefined;
        state.currentAnnouncement.reactions.total =
          state.currentAnnouncement.reactions.likes + state.currentAnnouncement.reactions.dislikes;
      }
    }
  },
  extraReducers: (builder) => {
    // Create announcement
    builder
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.myAnnouncements.unshift(action.payload);
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create announcement';
      });

    // Update announcement
    builder
      .addCase(updateAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myAnnouncements.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.myAnnouncements[index] = action.payload;
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update announcement';
      });

    // Delete announcement
    builder
      .addCase(deleteAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.myAnnouncements = state.myAnnouncements.filter(
          a => a.id !== action.payload.id
        );
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete announcement';
      });

    // Fetch my announcements
    builder
      .addCase(fetchMyAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.myAnnouncements = action.payload.items;
        state.myAnnouncementsPagination = action.payload.pagination;
      })
      .addCase(fetchMyAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch announcements';
      });

    // Fetch all announcements
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch announcements';
      });

    // Fetch announcement by ID
    builder
      .addCase(fetchAnnouncementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncementById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnnouncement = action.payload;
      })
      .addCase(fetchAnnouncementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch announcement';
      });

    // Add reaction
    builder
      .addCase(addReaction.fulfilled, (state, action) => {
        const announcement = state.announcements.find(
          a => a.id === action.payload.announcementId
        );
        if (announcement) {
          announcement.likeCount = action.payload.announcement.likeCount;
          announcement.dislikeCount = action.payload.announcement.dislikeCount;
          announcement.myReaction = action.payload.reactionType;
        }
      });

    // Remove reaction
    builder
      .addCase(removeReaction.fulfilled, (state, action) => {
        const announcementId = action.meta.arg;
        const announcement = state.announcements.find(a => a.id === announcementId);
        if (announcement) {
          announcement.likeCount = action.payload.announcement.likeCount;
          announcement.dislikeCount = action.payload.announcement.dislikeCount;
          announcement.myReaction = undefined;
        }
      });
  }
});

// Actions
export const { clearError, clearCurrentAnnouncement, updateReactionOptimistic } = announcementSlice.actions;

// Selectors
export const selectAnnouncements = (state: RootState) => state.announcement.announcements;
export const selectMyAnnouncements = (state: RootState) => state.announcement.myAnnouncements;
export const selectCurrentAnnouncement = (state: RootState) => state.announcement.currentAnnouncement;
export const selectAnnouncementLoading = (state: RootState) => state.announcement.loading;
export const selectAnnouncementError = (state: RootState) => state.announcement.error;
export const selectAnnouncementPagination = (state: RootState) => state.announcement.pagination;
export const selectMyAnnouncementsPagination = (state: RootState) => state.announcement.myAnnouncementsPagination;

// Reducer
export default announcementSlice.reducer;