// Announcement Types and Interfaces

export enum AnnouncementReactionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE'
}

export interface AnnouncementAuthor {
  id: string;
  username: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  userType: 1 | 2 | 3;
}

export interface Announcement {
  id: string;
  activityId: string;
  authorId: string;
  title: string;
  content: string;
  isActive: boolean;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  author?: AnnouncementAuthor;
  myReaction?: AnnouncementReactionType;
  activity?: {
    id: string;
    name: string;
  };
}

export interface AnnouncementReaction {
  id: string;
  announcementId: string;
  userId: string;
  reactionType: AnnouncementReactionType;
  createdAt: string;
  updatedAt: string;
  announcement?: {
    likeCount: number;
    dislikeCount: number;
  };
}

// DTOs
export interface CreateAnnouncementDto {
  title: string;
  content: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
}

export interface CreateReactionDto {
  reactionType: AnnouncementReactionType;
}

// Pagination
export interface AnnouncementPaginationParams {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

export interface AnnouncementPaginationResponse {
  items: Announcement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Response types
export interface AnnouncementDetailResponse {
  id: string;
  title: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  updatedAt: string;
  author: AnnouncementAuthor;
  myReaction?: AnnouncementReactionType;
  reactions: {
    likes: number;
    dislikes: number;
    total: number;
  };
}

export interface ReactionResponse {
  id: string;
  announcementId: string;
  userId: string;
  reactionType: AnnouncementReactionType;
  createdAt: string;
  updatedAt: string;
  announcement: {
    likeCount: number;
    dislikeCount: number;
  };
}

export interface RemoveReactionResponse {
  removed: boolean;
  announcement: {
    likeCount: number;
    dislikeCount: number;
  };
}

// State types for Redux
export interface AnnouncementState {
  announcements: Announcement[];
  currentAnnouncement: AnnouncementDetailResponse | null;
  myAnnouncements: Announcement[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  myAnnouncementsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}