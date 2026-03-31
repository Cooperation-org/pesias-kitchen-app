/**
 * API Client - Production-ready wrapper for fetch API
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

export const getAuthHeaders = (): HeadersInit => {
  let headers: HeadersInit = { ...defaultHeaders };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }
  
  return headers;
};

export async function apiGet<T>(
  endpoint: string, 
  queryParams?: Record<string, string | number | boolean>
): Promise<ApiResponse<T>> {
  try {
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
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
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500,
    };
  }
}

export async function apiPost<T, U = unknown>(
  endpoint: string, 
  body: U
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
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
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500,
    };
  }
}

export async function apiPut<T, U = unknown>(
  endpoint: string, 
  body: U
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
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
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500,
    };
  }
}

export async function apiDelete<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
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
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500,
    };
  }
}