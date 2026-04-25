import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, getToken, clearAuthData, setWalletConnectionStatus } from '@/services/authServices';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';
import { getCurrentUser } from '@/services/api';

// Fetcher function for SWR
const authFetcher = async () => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    return undefined;
  }
  
  return { token, user };
};

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  
  // Use SWR to manage auth state with automatic revalidation
  const { data, error, isLoading, mutate: mutateAuth } = useSWR(
    isConnected ? '/api/auth' : undefined,
    authFetcher,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: false, // Avoid reconnect-triggered loops
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 0, // Do not auto-retry to avoid multiple redirects
      onError: () => {
        clearAuthData();
        router.replace('/')
      },
    }
  );

  // Memoized navigation functions
  const redirectToLogin = useCallback(() => {
    try {
      router.replace('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    try {
      router.replace('/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/dashboard';
    }
  }, [router]);

  // Optimized logout function that clears SWR cache
  const logout = useCallback(async () => {
    clearAuthData();
    await mutateAuth(undefined, { revalidate: false });
    await mutate('/api/auth', undefined, { revalidate: false });
    redirectToLogin();
    toast.success('Logged out successfully');
  }, [mutateAuth, redirectToLogin]);

  // Update wallet connection status and handle disconnection
  useEffect(() => {
    const isProtected = pathname !== '/';

    if (!isProtected) {
      setWalletConnectionStatus(isConnected);
      return;
    }

    const wasConnected = document.cookie.includes('walletConnected=true');
    setWalletConnectionStatus(isConnected);
    
    // Only trigger logout if we were previously connected
    if (!isConnected && wasConnected && data?.token) {
      logout();
    }
  }, [isConnected, pathname, data?.token, logout]);

  // Load initial auth data when wallet changes
  useEffect(() => {
    const syncAuthWithBackend = async () => {
      if (!isConnected || !address) return;

      const storedToken = getToken();
      const storedUser = getUser();

      if (!storedToken || !storedUser) return;

      // Wallet mismatch → logout
      if (address.toLowerCase() !== storedUser.walletAddress?.toLowerCase()) {
        clearAuthData();
        logout();
        return;
      }

      // Fetch canonical user from backend
      const res = await getCurrentUser();
      const backendUser = res.data;

      // If role differs, update local storage + cookie from backend
      if (backendUser.role !== storedUser.role) {
        const updatedUser = { ...storedUser, role: backendUser.role };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        document.cookie = `userRole=${backendUser.role}; path=/; max-age=2592000`;
      }

      // Ensure SWR state uses backend user
      mutateAuth(
        { token: storedToken, user: { ...storedUser, role: backendUser.role } },
        { revalidate: false }
      );

    };

    syncAuthWithBackend();
  }, [address, isConnected, logout, mutateAuth]);

  return {
    // Auth state
    isConnected,
    isAuthenticated: !!data?.token && !!data?.user && isConnected,
    user: data?.user ?? null,
    token: data?.token ?? null,
    address,
    isLoading,
    error,

    // Actions
    logout,
    redirectToLogin,
    redirectToDashboard,
    mutateAuth,
  };
}