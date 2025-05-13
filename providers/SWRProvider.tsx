// providers/SWRProvider.tsx
import React from 'react';
import { SWRConfig } from 'swr';
import { fetcher } from '@/utils/swr-config';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false, // Disable auto-revalidation on focus (mobile optimization)
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        dedupingInterval: 2000, // Deduplicate requests made within 2 seconds
        focusThrottleInterval: 5000, // Only revalidate once per 5 seconds during rapid focus events
        loadingTimeout: 3000, // Show error UI if data doesn't load within 3 seconds
        suspense: false, // Set to true when using React Suspense
        onError: (error, key) => {
          console.error(`SWR Error for ${key}:`, error);
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}