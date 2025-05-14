// utils/swr-config.ts
import { mutate, MutatorCallback, MutatorOptions } from 'swr';
import { getAuthHeaders } from '@/utils/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app/api';

/**
 * Builds a complete API URL by appending the endpoint to the base URL
 * @param endpoint - The API endpoint without the base URL (e.g., "/events")
 * @param queryParams - Optional query parameters as a Record<string, string | number | boolean>
 * @returns Complete API URL
 */
export const buildApiUrl = (
  endpoint: string,
  queryParams?: Record<string, string | number | boolean>
): string => {
  // Ensure endpoint starts with "/"
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Start building the URL
  let url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  // Add query parameters if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      // Skip undefined or null values
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
};

// Cache config
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Storage utility for caching
const storage = {
  get: (key: string): unknown => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { data, expiry } = JSON.parse(item);
      
      // Check if cache is expired
      if (expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Error retrieving from cache:', e);
      return null;
    }
  },
  set: <T>(key: string, data: T, ttl = CACHE_TTL): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = {
        data,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.error('Error setting cache:', e);
    }
  }
};

// Add proper types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

// Add cache TTL configuration per endpoint
export const CACHE_TTL_CONFIG = {
  EVENTS: 5 * 60 * 1000, // 5 minutes
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
  ACTIVITIES: 5 * 60 * 1000, // 5 minutes
  NFTS: 10 * 60 * 1000, // 10 minutes
  REWARDS: 5 * 60 * 1000, // 5 minutes
  USERS: 5 * 60 * 1000, // 5 minutes
} as const;

// Add proper error types
interface SWRError extends Error {
  info?: {
    message: string;
    code?: string;
  };
  status?: number;
}

// Enhanced fetcher with proper typing and more logging
export const fetcher = async <T>(url: string): Promise<T> => {
  console.log('Fetcher called with URL:', url);
  
  // Check cache first
  const cacheKey = `swr-cache:${url}`;
  const cachedData = storage.get(cacheKey);
  
  if (cachedData) {
    console.log('Using cached data for:', url);
    return cachedData as T;
  }
  
  console.log('No cached data found, fetching from API:', url);
  const headers = getAuthHeaders();
  console.log('Request headers:', headers);
  
  try {
    console.log('Making fetch request to:', url);
    const response = await fetch(url, { 
      headers,
      mode: 'cors' // Explicitly set CORS mode
    });
    
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      const error = new Error('An error occurred while fetching the data.') as SWRError;
      const data = await response.json().catch(() => null);
      console.error('Fetch error:', { status: response.status, data });
      error.info = data;
      error.status = response.status;
      throw error;
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    console.log('Response structure:', {
      isObject: typeof data === 'object',
      keys: Object.keys(data),
      hasDataProperty: 'data' in data,
      dataType: typeof data.data,
      isArray: Array.isArray(data.data)
    });
    
    // Get the appropriate TTL for this endpoint
    const endpoint = Object.entries(CACHE_TTL_CONFIG).find(([key]) => 
      url.includes(key.toLowerCase())
    );
    const ttl = endpoint ? endpoint[1] : CACHE_TTL_CONFIG.EVENTS;
    
    // Cache the result with endpoint-specific TTL
    storage.set(cacheKey, data, ttl);
    
    return data as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Error transformation utility
const transformError = (error: SWRError): { message: string; code?: string } => {
  if (error.status === 401) {
    return { message: 'Please log in to continue', code: 'UNAUTHORIZED' };
  }
  if (error.status === 403) {
    return { message: 'You do not have permission to perform this action', code: 'FORBIDDEN' };
  }
  if (error.status === 404) {
    return { message: 'The requested resource was not found', code: 'NOT_FOUND' };
  }
  if (error.info?.message) {
    return { message: error.info.message, code: error.info.code };
  }
  return { message: 'An unexpected error occurred', code: 'UNKNOWN' };
};

// Cache invalidation helper
export const invalidateCache = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`swr-cache:${key}`);
  }
};

// Add proper types for optimistic updates
type OptimisticUpdateFn<T> = (current: T | undefined) => T;

// Optimistic update helper with proper typing
export const withOptimisticUpdate = <T>(
  key: string,
  updateFn: OptimisticUpdateFn<T>,
  mutationFn: () => Promise<void>
) => {
  return async () => {
    try {
      await mutate(
        key,
        updateFn as MutatorCallback<T>,
        { revalidate: false } as MutatorOptions
      );
      await mutationFn();
      await mutate(key);
      return true;
    } catch (error: unknown) {
      await mutate(key);
      throw error;
    }
  };
};

// Consolidated SWR configuration
export const swrConfig = {
  fetcher,
  revalidateOnFocus: false,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  suspense: false,
  onError: (error: SWRError, key: string) => {
    console.error(`SWR Error for ${key}:`, error);
    const transformedError = transformError(error);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('swr-error', { 
        detail: { message: transformedError.message, code: transformedError.code }
      }));
    }
  }
};