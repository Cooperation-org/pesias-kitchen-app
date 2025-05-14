'use client'
import React, { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/utils/swr-config';
import { toast } from 'sonner';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleSWRError = (event: CustomEvent<{ message: string; code?: string }>) => {
      const { message, code } = event.detail;
      
      // Handle specific error codes
      switch (code) {
        case 'UNAUTHORIZED':
          toast.error(message, {
            action: {
              label: 'Login',
              onClick: () => window.location.href = '/login'
            }
          });
          break;
        case 'FORBIDDEN':
          toast.error(message, {
            action: {
              label: 'Go Home',
              onClick: () => window.location.href = '/'
            }
          });
          break;
        default:
          toast.error(message);
      }
    };

    window.addEventListener('swr-error', handleSWRError as EventListener);
    
    return () => {
      window.removeEventListener('swr-error', handleSWRError as EventListener);
    };
  }, []);

  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}