"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// User data type
interface UserData {
  id: string;
  walletAddress: string;
  role: string;
  [key: string]: string | number | boolean;
}

// Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
  mutateAuth: (data?: { token: string; user: UserData } | undefined, options?: { revalidate: boolean }) => Promise<{ token: string; user: UserData } | undefined>;
  
  // Reown specific methods
  openAppKit: () => void;
  closeAppKit: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
  logout: async () => {},
  redirectToLogin: () => {},
  redirectToDashboard: () => {},
  mutateAuth: async () => undefined,
  openAppKit: () => {},
  closeAppKit: () => {},
});

// Hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open, close } = useAppKit();
  const router = useRouter();
  
  // Use your existing auth hook
  const auth = useAuth();

  // Enhanced logout that also disconnects from Reown
  const enhancedLogout = async () => {
    try {
      // First disconnect from wagmi/Reown
      disconnect();
      // Then run your existing logout logic
      await auth.logout();
      // Redirect to login page after logout
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force disconnect even if auth logout fails
      disconnect();
      router.push('/login');
    }
  };

  // Reown-specific methods
  const openAppKit = () => {
    if (!isConnected) {
      open();
    }
  };

  const closeAppKit = () => {
    close();
  };

  const contextValue: AuthContextType = {
    ...auth,
    logout: enhancedLogout,
    openAppKit,
    closeAppKit,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Enhanced provider that wraps both Reown and Auth
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}