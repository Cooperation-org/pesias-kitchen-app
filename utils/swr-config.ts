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
  console.log('Fetcher called with URL:', url);
  
  try {
    // Get authentication headers
    const headers = getAuthHeaders();
    
    // Add cache-busting parameter for event endpoints
    const isEventEndpoint = url.includes('/event');
    const urlWithCacheBuster = isEventEndpoint 
      ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
      : url;
    
    console.log('Making fetch request to:', urlWithCacheBuster);
    
    // Make the request with proper headers
    const response = await fetch(urlWithCacheBuster, { 
      headers: {
        ...headers,
        'Cache-Control': isEventEndpoint ? 'no-cache, no-store' : 'max-age=300',
        'Pragma': isEventEndpoint ? 'no-cache' : ''
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      const error = new Error('An error occurred while fetching the data.') as SWRError;
      try {
        const errorData = await response.json();
        error.info = errorData;
      } catch {
        error.info = { message: response.statusText };
      }
      error.status = response.status;
      throw error;
    }
    
    const data = await response.json();
    
    // Handle different response formats
    const result = data.data !== undefined ? data.data : data;
    
    return result as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Consolidated SWR configuration for real-time data
export const swrConfig = {
  fetcher,
  revalidateOnFocus: true,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  dedupingInterval: 0, // Always refetch when mutate is called
  refreshInterval: 30000, // Refresh every 30 seconds automatically
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  suspense: false
};