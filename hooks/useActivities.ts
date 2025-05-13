// hooks/useActivities.ts
import useSWR from 'swr';
import { buildApiUrl } from '@/utils/swr-config';

export function useActivities() {
  const { data, error, isLoading, mutate } = useSWR(
    buildApiUrl('/activity/user')
  );
  
  return {
    activities: data?.data || [],
    isLoading,
    error,
    mutate // For refreshing data after changes
  };
}

