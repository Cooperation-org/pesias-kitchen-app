// hooks/useEvent.ts - For single event details
import useSWR from 'swr';
import { buildApiUrl } from '@/utils/swr-config';

export function useEvent(eventId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? buildApiUrl(`/event/${eventId}`) : null
  );
  
  return {
    event: data?.data || null,
    isLoading,
    error,
    mutate
  };
}