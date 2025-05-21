import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { getUser, getToken, clearAuthData, setWalletConnectionStatus } from '@/services/authServices';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Fetcher function for SWR
const authFetcher = async () => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    throw new Error('Not authenticated');
  }
  
  return { token, user };
};

export function useAuth() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  // Use SWR to manage auth state with automatic revalidation
  const { data, error, isLoading, mutate: mutateAuth } = useSWR(
    isConnected ? '/api/auth' : null,
    authFetcher,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: true, // Revalidate when reconnecting
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3, // Retry failed requests 3 times
      onError: (err) => {
        if (err.message === 'Not authenticated') {
          clearAuthData();
          router.replace('/');
        }
      },
    }
  );

  // Memoized navigation functions
  const redirectToLogin = () => {
    try {
      router.replace('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  const redirectToDashboard = () => {
    try {
      router.replace('/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/dashboard';
    }
  };

  // Optimized logout function that clears SWR cache
  const logout = async () => {
    clearAuthData();
    await mutateAuth(undefined, { revalidate: false });
    await mutate('/api/auth', undefined, { revalidate: false });
    redirectToLogin();
    toast.success('Logged out successfully');
  };

  // Update wallet connection status and handle disconnection
  useEffect(() => {
    const wasConnected = document.cookie.includes('walletConnected=true');
    setWalletConnectionStatus(isConnected);
    
    // Only trigger logout if we were previously connected
    if (!isConnected && wasConnected) {
      logout();
    }
  }, [isConnected]);

  // Load initial auth data when wallet changes
  useEffect(() => {
    if (isConnected && address) {
      const storedToken = getToken();
      const storedUser = getUser();

      if (storedToken && storedUser) {
        if (address.toLowerCase() === storedUser.walletAddress?.toLowerCase()) {
          // Trigger a revalidation of the auth data
          mutateAuth({ token: storedToken, user: storedUser }, { revalidate: true });
        } else {
          clearAuthData();
          logout();
        }
      }
    }
  }, [address, isConnected]);

  return {
    // Auth state
    isAuthenticated: !!data?.token && !!data?.user && isConnected,
    user: data?.user ?? null,
    token: data?.token ?? null,
    isLoading: isLoading || (!isConnected && !error),
    error,

    // Actions
    logout,
    redirectToLogin,
    redirectToDashboard,
    mutateAuth,
  };
} 