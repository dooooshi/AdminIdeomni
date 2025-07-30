import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxItems?: number; // Maximum number of items to cache
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
}

interface CacheHookOptions<T> extends CacheOptions {
  fetcher: () => Promise<T>;
  key: string;
  enabled?: boolean;
  dependencies?: any[];
}

const globalCache = new Map<string, CacheItem<any>>();

export function useCache<T>({
  fetcher,
  key,
  ttl = 5 * 60 * 1000, // 5 minutes default
  maxItems = 100,
  staleWhileRevalidate = true,
  enabled = true,
  dependencies = []
}: CacheHookOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const fetcherRef = useRef(fetcher);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Clean up old cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(globalCache.entries());
    
    // Remove expired items
    entries.forEach(([cacheKey, item]) => {
      if (item.expiresAt < now) {
        globalCache.delete(cacheKey);
      }
    });

    // Remove oldest items if cache is too large
    if (globalCache.size > maxItems) {
      const sortedEntries = entries
        .filter(([, item]) => item.expiresAt >= now)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const itemsToRemove = sortedEntries.slice(0, globalCache.size - maxItems);
      itemsToRemove.forEach(([cacheKey]) => {
        globalCache.delete(cacheKey);
      });
    }
  }, [maxItems]);

  const fetchData = useCallback(async (useStale = false) => {
    if (!enabled) return;

    // Check cache first
    const cachedItem = globalCache.get(key);
    const now = Date.now();
    
    if (cachedItem) {
      const isExpired = cachedItem.expiresAt < now;
      
      if (!isExpired) {
        // Fresh data available
        setData(cachedItem.data);
        setIsStale(false);
        setError(null);
        setLoading(false);
        return cachedItem.data;
      } else if (staleWhileRevalidate && useStale) {
        // Return stale data while fetching fresh data
        setData(cachedItem.data);
        setIsStale(true);
        setError(null);
      }
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const freshData = await fetcherRef.current();

      // Cache the fresh data
      globalCache.set(key, {
        data: freshData,
        timestamp: now,
        expiresAt: now + ttl
      });

      setData(freshData);
      setIsStale(false);
      setLoading(false);
      
      // Clean up old cache entries
      cleanupCache();

      return freshData;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was aborted, don't update state
      }

      setError(err as Error);
      setLoading(false);

      // If we have stale data and this is a background refresh, keep the stale data
      if (cachedItem && staleWhileRevalidate) {
        setData(cachedItem.data);
        setIsStale(true);
      } else {
        setData(null);
        setIsStale(false);
      }

      throw err;
    }
  }, [enabled, key, ttl, staleWhileRevalidate, cleanupCache]);

  // Invalidate cache entry
  const invalidate = useCallback(() => {
    globalCache.delete(key);
    setData(null);
    setIsStale(false);
    setError(null);
  }, [key]);

  // Refresh data (bypass cache)
  const refresh = useCallback(async () => {
    invalidate();
    return fetchData();
  }, [invalidate, fetchData]);

  // Mutate data optimistically
  const mutate = useCallback((newData: T | ((current: T | null) => T), shouldRevalidate = true) => {
    const updatedData = typeof newData === 'function' 
      ? (newData as (current: T | null) => T)(data)
      : newData;

    setData(updatedData);
    
    if (shouldRevalidate) {
      // Update cache and trigger revalidation
      const now = Date.now();
      globalCache.set(key, {
        data: updatedData,
        timestamp: now,
        expiresAt: now + ttl
      });
      
      // Revalidate in background
      setTimeout(() => fetchData(true), 0);
    }
  }, [data, key, ttl, fetchData]);

  // Initial data fetch and dependency-based refetch
  useEffect(() => {
    if (enabled) {
      fetchData(true);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    isStale,
    refresh,
    invalidate,
    mutate,
    // Utility functions
    refetch: fetchData,
    clearCache: () => globalCache.clear(),
    getCacheSize: () => globalCache.size,
  };
}

// Utility function to prefetch data
export function prefetchCache<T>(
  key: string, 
  fetcher: () => Promise<T>, 
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000 } = options;
  
  return fetcher().then(data => {
    const now = Date.now();
    globalCache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    return data;
  });
}

// Clear specific cache entries
export function clearCacheEntry(key: string) {
  globalCache.delete(key);
}

// Clear all cache entries
export function clearAllCache() {
  globalCache.clear();
}

export default useCache;