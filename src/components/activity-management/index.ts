// Core components
export { default as ActivityList } from './ActivityList';
export { default as ActivityForm } from './ActivityForm';
export { default as ActivityStatistics } from './ActivityStatistics';

// Types and services (re-export for convenience)
export type {
  Activity,
  ActivityType,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivitySearchParams,
  ActivitySearchResponse,
  StatusActivity,
} from '@/lib/services/activityService';

// Rename to avoid conflict
export type { ActivityStatistics as ActivityStatsData } from '@/lib/services/activityService';
export { ActivityService } from '@/lib/services/activityService'; 