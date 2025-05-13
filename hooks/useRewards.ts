// hooks/useRewards.ts
import useSWR from 'swr';
import { buildApiUrl } from '@/utils/swr-config';

export function useRewards() {
  const { data, error, isLoading, mutate } = useSWR(
    buildApiUrl('/rewards/history')
  );
  
  return {
    rewards: data?.rewards || [],
    totalRewards: data?.totalRewards || 0,
    isLoading,
    error,
    mutate
  };
}