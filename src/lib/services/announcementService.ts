import apiClient from '@/lib/http/api-client';
import {
  Announcement,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  CreateReactionDto,
  AnnouncementPaginationParams,
  AnnouncementPaginationResponse,
  AnnouncementDetailResponse,
  ReactionResponse,
  RemoveReactionResponse
} from '@/types/announcement';

// API Response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export class AnnouncementService {
  private static readonly BASE_PATH = '/announcement'; // No /api prefix needed, it's already in axios config

  // Manager endpoints

  /**
   * Create a new announcement (Manager only)
   */
  static async createAnnouncement(data: CreateAnnouncementDto): Promise<Announcement> {
    const response = await apiClient.post<ApiResponse<Announcement>>(
      this.BASE_PATH,
      data
    );
    return response.data.data;
  }

  /**
   * Update an existing announcement (Manager only, must be author)
   */
  static async updateAnnouncement(
    id: string,
    data: UpdateAnnouncementDto
  ): Promise<Announcement> {
    const response = await apiClient.put<ApiResponse<Announcement>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete an announcement (soft delete, Manager only, must be author)
   */
  static async deleteAnnouncement(id: string): Promise<{ id: string; deletedAt: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string; deletedAt: string }>>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data.data;
  }

  /**
   * Get manager's own announcements
   */
  static async getMyAnnouncements(
    params: AnnouncementPaginationParams = {}
  ): Promise<AnnouncementPaginationResponse> {
    const { page = 1, limit = 20, includeDeleted = false } = params;

    const response = await apiClient.get<ApiResponse<AnnouncementPaginationResponse>>(
      `${this.BASE_PATH}/my`,
      {
        params: {
          page,
          limit,
          includeDeleted
        }
      }
    );
    return response.data.data;
  }

  // Student endpoints

  /**
   * Get all active announcements for the student's activity
   */
  static async getAnnouncements(
    params: AnnouncementPaginationParams = {}
  ): Promise<AnnouncementPaginationResponse> {
    const { page = 1, limit = 20 } = params;

    const response = await apiClient.get<ApiResponse<AnnouncementPaginationResponse>>(
      this.BASE_PATH,
      {
        params: {
          page,
          limit
        }
      }
    );
    return response.data.data;
  }

  /**
   * Get a single announcement by ID
   */
  static async getAnnouncementById(id: string): Promise<AnnouncementDetailResponse> {
    const response = await apiClient.get<ApiResponse<AnnouncementDetailResponse>>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data.data;
  }

  /**
   * Add or update a reaction to an announcement (Student only)
   */
  static async addReaction(
    announcementId: string,
    data: CreateReactionDto
  ): Promise<ReactionResponse> {
    const response = await apiClient.post<ApiResponse<ReactionResponse>>(
      `${this.BASE_PATH}/${announcementId}/reaction`,
      data
    );
    return response.data.data;
  }

  /**
   * Remove reaction from an announcement (Student only)
   */
  static async removeReaction(announcementId: string): Promise<RemoveReactionResponse> {
    const response = await apiClient.delete<ApiResponse<RemoveReactionResponse>>(
      `${this.BASE_PATH}/${announcementId}/reaction`
    );
    return response.data.data;
  }

  // Helper methods

  /**
   * Check if user can edit an announcement
   */
  static canEdit(announcement: Announcement, userId: string): boolean {
    return announcement.authorId === userId && announcement.isActive;
  }

  /**
   * Check if user can delete an announcement
   */
  static canDelete(announcement: Announcement, userId: string): boolean {
    return announcement.authorId === userId;
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }).format(date);
    }
  }
}

export default AnnouncementService;