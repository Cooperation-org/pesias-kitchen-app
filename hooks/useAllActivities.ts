
// hooks/useAllActivities.ts - For admin dashboard
import useSWR from 'swr';
import { buildApiUrl } from '@/utils/swr-config';

export function useAllActivities() {
  const { data, error, isLoading, mutate } = useSWR(
    buildApiUrl('/activity')
  );
  
  return {
    activities: data?.data || [],
    isLoading,
    error,
    mutate
  };
}