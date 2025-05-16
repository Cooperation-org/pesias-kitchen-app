// utils/swr-config.ts
import { getAuthHeaders } from '@/utils/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app/api';

/**
 * Builds a complete API URL by appending the endpoint to the base URL
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

// Add proper types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

// Add proper error types
interface SWRError extends Error {
  info?: {
    message: string;
    code?: string;
  };
  status?: number;
}

/**
 * Enhanced fetcher with proper typing and disabled caching for real-time data
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const headers = getAuthHeaders();
    const isEventEndpoint = url.includes('/event');
    
    // Define headers with proper type
    const headersInit: HeadersInit = {
      ...headers,
      'Cache-Control': isEventEndpoint 
        ? 'no-cache, no-store'
        : 'max-age=300, stale-while-revalidate=60',
      ...(isEventEndpoint ? { 'Pragma': 'no-cache' } : {})
    };
    
    const response = await fetch(url, { 
      headers: headersInit,
      mode: 'cors',
      next: { revalidate: isEventEndpoint ? 0 : 300 }
    });
    
    if (!response.ok) {
      const error = new Error('An error occurred while fetching the data.') as SWRError;
      error.status = response.status;
      error.info = { message: response.statusText };
      throw error;
    }
    
    const data = await response.json();
    return (data.data !== undefined ? data.data : data) as T;
  } catch (error) {
    throw error;
  }
};

// Optimized SWR configuration
export const swrConfig = {
  fetcher,
  revalidateOnFocus: false, // Disabled to reduce unnecessary refetches
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  errorRetryCount: 2, // Reduced retry count
  dedupingInterval: 0, // Keep 0 for immediate refetch on mutate
  refreshInterval: 30000,
  focusThrottleInterval: 10000, // Increased to reduce focus events
  loadingTimeout: 5000,
  suspense: false,
  keepPreviousData: true, // Keep old data while loading new data
  compare: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b) // Deep comparison
};