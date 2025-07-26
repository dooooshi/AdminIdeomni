/**
 * Enhanced Retry Hook for Admin User-Activity Management
 * Provides intelligent retry functionality with exponential backoff
 */

import { useState, useCallback, useRef } from 'react';
import { 
  AdminUserActivityError, 
  ErrorHandler, 
  ErrorType 
} from '@/lib/errors/AdminUserActivityError';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: AdminUserActivityError, attempt: number) => boolean;
}

interface RetryState {
  isLoading: boolean;
  error: AdminUserActivityError | null;
  retryCount: number;
  isRetrying: boolean;
  canRetry: boolean;
  lastAttemptAt: Date | null;
}

interface RetryableOperationResult<T> extends RetryState {
  execute: () => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  data: T | null;
}

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryCondition: (error: AdminUserActivityError, attempt: number) => {
    // Only retry network, timeout, and server errors
    const retryableTypes = [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.SERVER_ERROR,
      ErrorType.RATE_LIMIT
    ];

    return retryableTypes.includes(error.type) && attempt < 3;
  }
};

/**
 * Exponential backoff delay calculation
 */
const calculateDelay = (
  attempt: number, 
  initialDelay: number, 
  maxDelay: number, 
  multiplier: number
): number => {
  const delay = initialDelay * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Add jitter to delay to prevent thundering herd
 */
const addJitter = (delay: number): number => {
  return delay + Math.random() * delay * 0.1; // Add up to 10% jitter
};

/**
 * Sleep utility function
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Enhanced retryable operation hook
 */
export function useRetryableOperation<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): RetryableOperationResult<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    isRetrying: false,
    canRetry: false,
    lastAttemptAt: null
  });

  const [data, setData] = useState<T | null>(null);

  /**
   * Execute the operation with retry logic
   */
  const executeWithRetry = useCallback(async (
    isRetryAttempt: boolean = false
  ): Promise<T | null> => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        isRetrying: isRetryAttempt,
        error: null,
        lastAttemptAt: new Date()
      }));

      const result = await operation();
      
      // Success - reset retry count and update data
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRetrying: false,
        error: null,
        retryCount: 0,
        canRetry: false
      }));

      setData(result);
      return result;

    } catch (error: any) {
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      // Process the error
      const processedError = error instanceof AdminUserActivityError 
        ? error 
        : ErrorHandler.processError(error);

      const newRetryCount = state.retryCount + 1;
      const canRetry = finalConfig.retryCondition(processedError, newRetryCount) && 
                      newRetryCount < finalConfig.maxRetries;

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRetrying: false,
        error: processedError,
        retryCount: newRetryCount,
        canRetry
      }));

      // Log the error
      ErrorHandler.logError(processedError, `useRetryableOperation (attempt ${newRetryCount})`);

      // If we can retry, schedule the retry
      if (canRetry && !isRetryAttempt) {
        const delay = calculateDelay(
          newRetryCount - 1,
          finalConfig.initialDelay,
          finalConfig.maxDelay,
          finalConfig.backoffMultiplier
        );

        const jitteredDelay = addJitter(delay);

        // Schedule retry
        setTimeout(async () => {
          if (!abortControllerRef.current?.signal.aborted) {
            await executeWithRetry(true);
          }
        }, jitteredDelay);
      }

      return null;
    }
  }, [operation, finalConfig, state.retryCount]);

  /**
   * Execute the operation
   */
  const execute = useCallback(async (): Promise<T | null> => {
    return executeWithRetry(false);
  }, [executeWithRetry]);

  /**
   * Manual retry function
   */
  const retry = useCallback(async (): Promise<T | null> => {
    if (!state.canRetry) {
      return null;
    }
    return executeWithRetry(true);
  }, [executeWithRetry, state.canRetry]);

  /**
   * Reset the operation state
   */
  const reset = useCallback(() => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
      canRetry: false,
      lastAttemptAt: null
    });

    setData(null);
  }, []);

  return {
    ...state,
    data,
    execute,
    retry,
    reset
  };
}

/**
 * Specialized hook for API operations with common retry patterns
 */
export function useRetryableApiOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    context?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: AdminUserActivityError) => void;
  } = {}
): RetryableOperationResult<T> {
  const {
    maxRetries = 3,
    context,
    onSuccess,
    onError
  } = options;

  const result = useRetryableOperation(operation, {
    maxRetries,
    retryCondition: (error, attempt) => {
      // API-specific retry logic
      const retryableTypes = [
        ErrorType.NETWORK,
        ErrorType.TIMEOUT,
        ErrorType.SERVER_ERROR
      ];

      // Don't retry validation or permission errors
      if ([ErrorType.VALIDATION, ErrorType.PERMISSION].includes(error.type)) {
        return false;
      }

      // For rate limiting, always retry with longer delays
      if (error.type === ErrorType.RATE_LIMIT) {
        return attempt < maxRetries;
      }

      return retryableTypes.includes(error.type) && attempt < maxRetries;
    }
  });

  // Enhanced execute with callbacks
  const enhancedExecute = useCallback(async (): Promise<T | null> => {
    const data = await result.execute();
    
    if (data && onSuccess) {
      onSuccess(data);
    } else if (result.error && onError) {
      onError(result.error);
    }

    return data;
  }, [result, onSuccess, onError]);

  return {
    ...result,
    execute: enhancedExecute
  };
}

/**
 * Hook for batch operations with partial success handling
 */
export function useRetryableBatchOperation<T, R>(
  operation: (items: T[]) => Promise<R>,
  options: {
    batchSize?: number;
    maxRetries?: number;
    retryFailedOnly?: boolean;
  } = {}
): {
  execute: (items: T[]) => Promise<R[]>;
  isLoading: boolean;
  error: AdminUserActivityError | null;
  progress: { completed: number; total: number; failed: number };
  reset: () => void;
} {
  const {
    batchSize = 10,
    maxRetries = 3,
    retryFailedOnly = true
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AdminUserActivityError | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, failed: 0 });

  const execute = useCallback(async (items: T[]): Promise<R[]> => {
    setIsLoading(true);
    setError(null);
    setProgress({ completed: 0, total: items.length, failed: 0 });

    const results: R[] = [];
    const batches: T[][] = [];

    // Split items into batches
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        let attempts = 0;
        let success = false;

        while (attempts < maxRetries && !success) {
          try {
            const batchResult = await operation(batch);
            results.push(batchResult);
            success = true;

            setProgress(prev => ({
              ...prev,
              completed: prev.completed + batch.length
            }));

          } catch (err) {
            attempts++;
            const processedError = ErrorHandler.processError(err);

            if (attempts >= maxRetries) {
              setProgress(prev => ({
                ...prev,
                failed: prev.failed + batch.length
              }));

              if (!retryFailedOnly) {
                throw processedError;
              }
            } else {
              // Wait before retry
              const delay = calculateDelay(attempts - 1, 1000, 5000, 2);
              await sleep(delay);
            }
          }
        }
      }

      return results;

    } catch (err) {
      const processedError = ErrorHandler.processError(err);
      setError(processedError);
      ErrorHandler.logError(processedError, 'useRetryableBatchOperation');
      throw processedError;

    } finally {
      setIsLoading(false);
    }
  }, [operation, batchSize, maxRetries, retryFailedOnly]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setProgress({ completed: 0, total: 0, failed: 0 });
  }, []);

  return {
    execute,
    isLoading,
    error,
    progress,
    reset
  };
}

export default useRetryableOperation;