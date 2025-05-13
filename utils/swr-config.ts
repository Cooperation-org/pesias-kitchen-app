// utils/swr-config.ts
import { getToken } from '@/services/authServices';

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
  get: (key: string) => {
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
  set: (key: string, data: any, ttl = CACHE_TTL) => {
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

// Enhanced fetcher with caching
export const fetcher = async (url: string) => {
  // Check cache first
  const cacheKey = `swr-cache:${url}`;
  const cachedData = storage.get(cacheKey);
  
  if (cachedData) {
    // Return cached data immediately
    return cachedData;
  }
  
  // If not in cache, make the actual request
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const data = await response.json().catch(() => null);
    (error as any).info = data;
    (error as any).status = response.status;
    throw error;
  }
  
  const data = await response.json();
  
  // Cache the result
  storage.set(cacheKey, data);
  
  return data;
};

/**
 * SWR configuration options with reasonable defaults
 */
export const swrConfig = {
  fetcher,
  revalidateOnFocus: false, // Don't revalidate when window is focused
  revalidateOnReconnect: true, // Revalidate when browser regains connection
  refreshInterval: 0, // No polling by default
  shouldRetryOnError: true, // Retry on error
  errorRetryCount: 3, // Number of retries
  dedupingInterval: 2000, // Dedupe requests in this time span
};