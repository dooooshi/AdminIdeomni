// Admin Management Components
export { default as AdminList } from './AdminList';
export { default as AdminForm } from './AdminForm';
export { default as OperationLogs } from './OperationLogs';

// Re-export types from service
export type {
  Admin,
  AdminOperationLog,
  CreateAdminRequest,
  UpdateAdminRequest,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  LogsQueryParams,
  SystemLogsQueryParams,
  // New paginated API types
  PaginatedResponse,
  ApiResponse,
  AdminSearchResponseDto,
  AdminListParams,
  OperationLogDetailsDto,
  OperationLogsSearchResponseDto,
  AdminOperationLogsParams,
} from '@/lib/services/adminService'; 