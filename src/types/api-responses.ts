/**
 * Common API Response Types
 * These types replace 'any' usage throughout the application
 */

// Base API Response structure
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
  error?: string;
}

// Nested API Response structure (common in our backend)
export interface NestedApiResponse<T = unknown> {
  data: {
    data: T;
    meta?: ResponseMeta;
  };
}

// Pagination metadata
export interface ResponseMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Paginated response structure
export interface PaginatedApiResponse<T = unknown> {
  data: T[];
  meta: ResponseMeta;
}

// Error response structure
export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  status: number;
}

// Form data types
export interface FormFieldValue {
  value: string | number | boolean | null;
  label?: string;
  disabled?: boolean;
}

// Table data types
export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

// Filter types
export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

// Search parameters
export interface BaseSearchParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  q?: string;
}

// File upload types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Batch operation types
export interface BatchOperationResult<T = unknown> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  total: number;
  successCount: number;
  failedCount: number;
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  fields?: string[];
  filters?: Record<string, unknown>;
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
}

// Import types
export interface ImportResult {
  processed: number;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

// Status types
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T = unknown> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
  lastFetch?: Date;
}

// Generic CRUD operation types
export interface CrudOperations<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  getAll: (params?: BaseSearchParams) => Promise<PaginatedApiResponse<T>>;
  getById: (id: string | number) => Promise<T>;
  create: (data: CreateDto) => Promise<T>;
  update: (id: string | number, data: UpdateDto) => Promise<T>;
  delete: (id: string | number) => Promise<void>;
  bulkDelete?: (ids: Array<string | number>) => Promise<BatchOperationResult<T>>;
}

// Type guards
export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response
  );
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'status' in error
  );
}

export function isPaginatedResponse<T>(response: unknown): response is PaginatedApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as PaginatedApiResponse<T>).data) &&
    'meta' in response
  );
}