import { apiClient } from '@/lib/http';
import { AdminBulkCreateUserDto, BulkOperationResultDto, ApiResponse } from './userService';

export interface BulkImportProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  percentage: number;
}

export interface BulkImportOptions {
  onProgress?: (progress: BulkImportProgress) => void;
  batchSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Enhanced bulk import request handler with progress tracking and retry logic
 */
export class BulkImportRequest {
  private static readonly DEFAULT_BATCH_SIZE = 50;
  private static readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000; // 1 second

  /**
   * Process bulk user import with batching and progress tracking
   */
  static async processBulkImport(
    data: AdminBulkCreateUserDto,
    options: BulkImportOptions = {}
  ): Promise<BulkOperationResultDto> {
    const {
      onProgress,
      batchSize = this.DEFAULT_BATCH_SIZE,
      retryAttempts = this.DEFAULT_RETRY_ATTEMPTS,
      retryDelay = this.DEFAULT_RETRY_DELAY,
    } = options;

    const users = data.users;
    const totalUsers = users.length;

    // If total is less than batch size, send all at once
    if (totalUsers <= batchSize) {
      return this.sendBulkRequest(data, retryAttempts, retryDelay);
    }

    // Process in batches
    const results: BulkOperationResultDto[] = [];
    let processed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    for (let i = 0; i < totalUsers; i += batchSize) {
      const batch = users.slice(i, Math.min(i + batchSize, totalUsers));

      try {
        const batchResult = await this.sendBulkRequest(
          { users: batch },
          retryAttempts,
          retryDelay
        );

        results.push(batchResult);
        processed += batch.length;
        totalSuccess += batchResult.successCount;
        totalFailed += batchResult.failedCount;

        // Report progress
        if (onProgress) {
          onProgress({
            total: totalUsers,
            processed,
            success: totalSuccess,
            failed: totalFailed,
            percentage: Math.round((processed / totalUsers) * 100),
          });
        }

        // Add small delay between batches to avoid overwhelming the server
        if (i + batchSize < totalUsers) {
          await this.delay(500);
        }
      } catch (error) {
        // Count entire batch as failed if request fails
        processed += batch.length;
        totalFailed += batch.length;

        if (onProgress) {
          onProgress({
            total: totalUsers,
            processed,
            success: totalSuccess,
            failed: totalFailed,
            percentage: Math.round((processed / totalUsers) * 100),
          });
        }
      }
    }

    // Combine all batch results
    return this.combineResults(results, totalUsers);
  }

  /**
   * Send bulk request with retry logic
   */
  private static async sendBulkRequest(
    data: AdminBulkCreateUserDto,
    retryAttempts: number,
    retryDelay: number
  ): Promise<BulkOperationResultDto> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        const response = await apiClient.post<ApiResponse<BulkOperationResultDto>>(
          '/admin/users/bulk-import',
          data,
          {
            timeout: 30000, // 30 second timeout for bulk operations
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success && response.data.data) {
          return response.data.data;
        }

        throw new Error(response.data.message || 'Bulk import failed');
      } catch (error: any) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }

        // Retry for server errors (5xx) or network errors
        if (attempt < retryAttempts - 1) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Bulk import failed after multiple attempts');
  }

  /**
   * Validate bulk import data with the server before actual import
   */
  static async validateWithServer(data: AdminBulkCreateUserDto): Promise<BulkOperationResultDto> {
    try {
      const response = await apiClient.post<ApiResponse<BulkOperationResultDto>>(
        '/admin/users/bulk-import/validate',
        data,
        {
          timeout: 15000, // 15 second timeout for validation
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Validation failed');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Combine results from multiple batches
   */
  private static combineResults(
    results: BulkOperationResultDto[],
    totalCount: number
  ): BulkOperationResultDto {
    const successCount = results.reduce((sum, r) => sum + r.successCount, 0);
    const failedCount = results.reduce((sum, r) => sum + r.failedCount, 0);

    // Combine all details
    const allDetails = results.flatMap(r => r.details || []);

    return {
      successCount,
      failedCount,
      totalCount,
      details: allDetails,
    };
  }

  /**
   * Helper function to delay execution
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate import data before sending
   */
  static validateImportData(data: AdminBulkCreateUserDto): string[] {
    const errors: string[] = [];

    if (!data.users || !Array.isArray(data.users)) {
      errors.push('Users data must be an array');
    }

    if (data.users.length === 0) {
      errors.push('No users to import');
    }

    if (data.users.length > 1000) {
      errors.push('Maximum 1000 users can be imported at once');
    }

    // Validate each user
    data.users.forEach((user, index) => {
      if (!user.username) {
        errors.push(`User at row ${index + 1}: Username is required`);
      }
      if (!user.email) {
        errors.push(`User at row ${index + 1}: Email is required`);
      }
      if (!user.password) {
        errors.push(`User at row ${index + 1}: Password is required`);
      }
      if (!user.userType || ![1, 2, 3].includes(user.userType)) {
        errors.push(`User at row ${index + 1}: Invalid user type`);
      }
    });

    return errors;
  }
}