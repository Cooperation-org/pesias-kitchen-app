// hooks/useEvents.ts
import useSWR from 'swr';
import { buildApiUrl } from '@/utils/swr-config';

export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR(
    buildApiUrl('/event')
  );
  
  return {
    events: data?.data || [],
    isLoading,
    error,
    mutate
  };
}