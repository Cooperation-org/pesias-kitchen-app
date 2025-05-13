// hooks/useNFTs.ts
import useSWR from 'swr';
import { buildApiUrl } from '@/utils/swr-config';

export function useNFTs() {
  const { data, error, isLoading, mutate } = useSWR(
    buildApiUrl('/nft/user')
  );
  
  return {
    nfts: data?.nfts || [],
    isLoading,
    error,
    mutate
  };
}