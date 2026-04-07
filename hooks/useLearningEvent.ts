import useSWR from 'swr';
import { buildApiUrl } from '@/utils/swr-config';

export function useLearningEvent() {
  const { data, error, isLoading, mutate } = useSWR(
    buildApiUrl('/event/learning')
  );

  return {
    learningEventId: data?._id || null,
    isLoading,
    error,
    mutate,
  };
}