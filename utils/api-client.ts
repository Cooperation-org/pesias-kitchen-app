/**
 * API Client - A simple, type-safe wrapper for fetch API
 * 
 * This utility makes it easy to consume APIs with proper error handling and response typing.
 * It supports common HTTP methods, automatic JSON parsing, and includes TypeScript type inference.
 */

// API response type with generic data typing
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
  }
  
  // Base API configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  // Default headers for all requests
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Adds authentication token if available
  export const getAuthHeaders = (): HeadersInit => {
    let headers: HeadersInit = { ...defaultHeaders };
    
    // Get auth token from local storage (if in browser context)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Auth token details:', {
        exists: !!token,
        length: token?.length,
        firstChars: token ? `${token.substring(0, 10)}...` : 'none',
        storageKey: 'token',
        storageType: typeof localStorage.getItem('token')
      });
      
      if (token) {
        headers = {
          ...headers,
          'Authorization': `Bearer ${token}`,
        };
        console.log('Final request headers:', {
          ...headers,
          Authorization: headers.Authorization ? 'Bearer [token]' : 'none'
        });
      } else {
        console.log('No auth token found in localStorage');
      }
    } else {
      console.log('Not in browser context, skipping token check');
    }
    
    return headers;
  };
  
  /**
   * Makes a GET request to the specified endpoint
   * 
   * @param endpoint - The API endpoint to call (without base URL)
   * @param queryParams - Optional query parameters as an object
   * @returns Promise with typed API response
   */
  export async function apiGet<T>(
    endpoint: string, 
    queryParams?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    try {
      // Build URL with query parameters
      let url = `${API_BASE_URL}${endpoint}`;
      
      if (queryParams) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        url += `?${params.toString()}`;
      }
      
      console.log(`Making GET request to: ${url}`);
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      // Parse the response
      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        console.error(`GET request failed with status ${response.status}:`, data);
        return {
          data: null,
          error: data?.message || 'An error occurred',
          status: response.status,
        };
      }
      
      return {
        data: data as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      console.error(`GET request error:`, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500,
      };
    }
  }
  
  /**
   * Makes a POST request to the specified endpoint
   * 
   * @param endpoint - The API endpoint to call (without base URL)
   * @param body - The request body to send
   * @returns Promise with typed API response
   */
  export async function apiPost<T, U = unknown>(
    endpoint: string, 
    body: U
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Making POST request to: ${url}`);
      console.log('Request body:', JSON.stringify(body, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      
      console.log(`POST response status: ${response.status}`);
      
      // Parse the response
      const data = await response.json().catch(() => {
        console.error('Failed to parse response as JSON');
        return null;
      });
      
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.error(`POST request failed with status ${response.status}:`, data);
        return {
          data: null,
          error: data?.message || 'An error occurred',
          status: response.status,
        };
      }
      
      return {
        data: data as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      console.error(`POST request error:`, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500,
      };
    }
  }
  
  /**
   * Makes a PUT request to the specified endpoint
   * 
   * @param endpoint - The API endpoint to call (without base URL)
   * @param body - The request body to send
   * @returns Promise with typed API response
   */
  export async function apiPut<T, U = unknown>(
    endpoint: string, 
    body: U
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Making PUT request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      
      // Parse the response
      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        console.error(`PUT request failed with status ${response.status}:`, data);
        return {
          data: null,
          error: data?.message || 'An error occurred',
          status: response.status,
        };
      }
      
      return {
        data: data as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      console.error(`PUT request error:`, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500,
      };
    }
  }
  
  /**
   * Makes a DELETE request to the specified endpoint
   * 
   * @param endpoint - The API endpoint to call (without base URL)
   * @returns Promise with typed API response
   */
  export async function apiDelete<T>(
    endpoint: string
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Making DELETE request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      // Parse the response
      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        console.error(`DELETE request failed with status ${response.status}:`, data);
        return {
          data: null,
          error: data?.message || 'An error occurred',
          status: response.status,
        };
      }
      
      return {
        data: data as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      console.error(`DELETE request error:`, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500,
      };
    }
  }