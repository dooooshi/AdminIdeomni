import apiClient from '@/lib/http/api-client';

// Activity Types enum based on API documentation
export enum ActivityType {
  BizSimulation2_0 = 'BizSimulation2_0',
  BizSimulation2_2 = 'BizSimulation2_2',
  BizSimulation3_1 = 'BizSimulation3_1',
}

// Activity interface based on API response structure
export interface Activity {
  id: string;
  name: string;
  activityType: ActivityType;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  description?: string;
  isActive: boolean;
  mapTemplateId: number; // Map template ID used for this activity
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Create activity request interface
export interface CreateActivityRequest {
  name: string;
  activityType: ActivityType;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  description?: string;
  mapTemplateId: number; // Required field for activity creation
}

// Update activity request interface
export interface UpdateActivityRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  startAt?: string;
  endAt?: string;
  activityType?: ActivityType;
}

// Search parameters interface
export interface ActivitySearchParams {
  page?: number;
  pageSize?: number;
  name?: string;
  activityType?: ActivityType;
  creator?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  startFrom?: string;
  startUntil?: string;
  endFrom?: string;
  endUntil?: string;
}

// Paginated response interface
export interface ActivitySearchResponse {
  data: Activity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Statistics interface
export interface ActivityStatistics {
  total: number;
  active: number;
  upcoming: number;
  ongoing: number;
  byType: {
    [ActivityType.BizSimulation2_0]: number;
    [ActivityType.BizSimulation2_2]: number;
    [ActivityType.BizSimulation3_1]: number;
  };
}

// Status-based activity interface (for upcoming/ongoing)
export interface StatusActivity {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  activityType: ActivityType;
}

// API Response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  businessCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export class ActivityService {
  private static readonly BASE_PATH = '/activity';

  // Create a new activity
  static async createActivity(activityData: CreateActivityRequest): Promise<Activity> {
    const response = await apiClient.post<ApiResponse<Activity>>(this.BASE_PATH, activityData);
    return response.data.data;
  }

  // Search activities with pagination and filters
  static async searchActivities(params: ActivitySearchParams = {}): Promise<ActivitySearchResponse> {
    const {
      page = 1,
      pageSize = 20,
      name,
      activityType,
      creator,
      isActive,
      includeDeleted = false,
      startFrom,
      startUntil,
      endFrom,
      endUntil,
    } = params;

    const queryParams: Record<string, any> = {
      page,
      pageSize,
      includeDeleted,
    };

    if (name) queryParams.name = name;
    if (activityType) queryParams.activityType = activityType;
    if (creator) queryParams.creator = creator;
    if (isActive !== undefined) queryParams.isActive = isActive;
    if (startFrom) queryParams.startFrom = startFrom;
    if (startUntil) queryParams.startUntil = startUntil;
    if (endFrom) queryParams.endFrom = endFrom;
    if (endUntil) queryParams.endUntil = endUntil;

    const response = await apiClient.get<ApiResponse<ActivitySearchResponse>>(this.BASE_PATH, {
      params: queryParams,
    });
    
    // Extract the actual data from the API response wrapper
    return response.data.data;
  }

  // Get activity by ID
  static async getActivityById(id: string): Promise<Activity> {
    const response = await apiClient.get<ApiResponse<Activity>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  // Update activity
  static async updateActivity(id: string, updateData: UpdateActivityRequest): Promise<Activity> {
    const response = await apiClient.put<ApiResponse<Activity>>(`${this.BASE_PATH}/${id}`, updateData);
    return response.data.data;
  }

  // Delete activity (soft delete)
  static async deleteActivity(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  // Restore deleted activity (Super Admin only)
  static async restoreActivity(id: string): Promise<Activity> {
    const response = await apiClient.post<ApiResponse<Activity>>(`${this.BASE_PATH}/${id}/restore`);
    return response.data.data;
  }

  // Get upcoming activities
  static async getUpcomingActivities(limit?: number): Promise<StatusActivity[]> {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;

    const response = await apiClient.get<ApiResponse<StatusActivity[]>>(`${this.BASE_PATH}/status/upcoming`, {
      params,
    });
    return response.data.data;
  }

  // Get ongoing activities
  static async getOngoingActivities(): Promise<StatusActivity[]> {
    const response = await apiClient.get<ApiResponse<StatusActivity[]>>(`${this.BASE_PATH}/status/ongoing`);
    return response.data.data;
  }

  // Get activity statistics overview
  static async getActivityStatistics(): Promise<ActivityStatistics> {
    const response = await apiClient.get<ApiResponse<ActivityStatistics>>(`${this.BASE_PATH}/statistics/overview`);
    return response.data.data;
  }

  // Get activities by creator
  static async getActivitiesByCreator(
    creatorId: string, 
    includeDeleted: boolean = false, 
    limit?: number
  ): Promise<Activity[]> {
    const params: Record<string, any> = { includeDeleted };
    if (limit) params.limit = limit;

    const response = await apiClient.get<Activity[]>(`${this.BASE_PATH}/creator/${creatorId}`, {
      params,
    });
    return response.data;
  }

  // Helper method to get activity type display name
  static getActivityTypeDisplayName(type: ActivityType): string {
    switch (type) {
      case ActivityType.BizSimulation2_0:
        return 'Business Simulation 2.0';
      case ActivityType.BizSimulation2_2:
        return 'Business Simulation 2.2';
      case ActivityType.BizSimulation3_1:
        return 'Business Simulation 3.1';
      default:
        return type;
    }
  }

  // Helper method to check if activity is upcoming
  static isUpcoming(activity: Activity): boolean {
    const now = new Date();
    const startTime = new Date(activity.startAt);
    return startTime > now;
  }

  // Helper method to check if activity is ongoing
  static isOngoing(activity: Activity): boolean {
    const now = new Date();
    const startTime = new Date(activity.startAt);
    const endTime = new Date(activity.endAt);
    return startTime <= now && now <= endTime;
  }

  // Helper method to check if activity is completed
  static isCompleted(activity: Activity): boolean {
    const now = new Date();
    const endTime = new Date(activity.endAt);
    return endTime < now;
  }

  // Helper method to get activity status
  static getActivityStatus(activity: Activity): 'upcoming' | 'ongoing' | 'completed' {
    if (this.isOngoing(activity)) return 'ongoing';
    if (this.isUpcoming(activity)) return 'upcoming';
    return 'completed';
  }
}

export default ActivityService;