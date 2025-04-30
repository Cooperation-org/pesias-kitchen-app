import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/utils/api-client';

/**
 * Hook states for API requests
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

/**
 * Hook for easily making API requests with React state management
 * 
 * @returns Object with API methods and state variables
 */
export function useApi() {
  // Generic state handler for any API request
  function useApiRequest<T>() {
    const [state, setState] = useState<ApiState<T>>({
      data: null,
      loading: false,
      error: null,
      status: null,
    });

    // Reset state to initial values
    const reset = useCallback(() => {
      setState({
        data: null,
        loading: false,
        error: null,
        status: null,
      });
    }, []);

    // Handle response and update state
    const handleResponse = useCallback((response: ApiResponse<T>) => {
      setState({
        data: response.data,
        loading: false,
        error: response.error,
        status: response.status,
      });
      return response;
    }, []);

    return {
      state,
      setState,
      reset,
      handleResponse,
    };
  }

  /**
   * Hook for making GET requests
   */
  function useGet<T>() {
    const { state, setState, reset, handleResponse } = useApiRequest<T>();

    const execute = useCallback(
      async (endpoint: string, queryParams?: Record<string, string | number | boolean>) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiGet<T>(endpoint, queryParams);
        return handleResponse(response);
      },
      [setState, handleResponse]
    );

    return { ...state, execute, reset };
  }

  /**
   * Hook for making POST requests
   */
  function usePost<T, U = unknown>() {
    const { state, setState, reset, handleResponse } = useApiRequest<T>();

    const execute = useCallback(
      async (endpoint: string, body: U) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiPost<T, U>(endpoint, body);
        return handleResponse(response);
      },
      [setState, handleResponse]
    );

    return { ...state, execute, reset };
  }

  /**
   * Hook for making PUT requests
   */
  function usePut<T, U = unknown>() {
    const { state, setState, reset, handleResponse } = useApiRequest<T>();

    const execute = useCallback(
      async (endpoint: string, body: U) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiPut<T, U>(endpoint, body);
        return handleResponse(response);
      },
      [setState, handleResponse]
    );

    return { ...state, execute, reset };
  }

  /**
   * Hook for making DELETE requests
   */
  function useDelete<T>() {
    const { state, setState, reset, handleResponse } = useApiRequest<T>();

    const execute = useCallback(
      async (endpoint: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiDelete<T>(endpoint);
        return handleResponse(response);
      },
      [setState, handleResponse]
    );

    return { ...state, execute, reset };
  }

  return {
    useGet,
    usePost,
    usePut,
    useDelete,
  };
}