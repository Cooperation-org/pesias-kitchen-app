"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useAuth } from '@/hooks/useAuth';
import { UserData } from '@/services/authServices';

// Auth context type
interface AuthContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  address: `0x${string}` | undefined;
  isLoading: boolean;
  error: Error | null;
  enhancedLogout: () => Promise<void>;
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
  mutateAuth: (data?: { token: string; user: UserData } | undefined, options?: { revalidate: boolean }) => Promise<{ token: string; user: UserData } | undefined>;
  
  // Reown specific methods
  openAppKit: () => void;
  closeAppKit: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  isConnected: false,
  isAuthenticated: false,
  user: null,
  token: null,
  address: undefined,
  isLoading: false,
  error: null,
  enhancedLogout: async () => {},
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
  const { disconnect } = useDisconnect();
  const { open, close } = useAppKit();
  
  // Use your existing auth hook
  const auth = useAuth();

  // Enhanced logout that also disconnects from Reown
  const enhancedLogout = async () => {
    try {
      // First disconnect from wagmi/Reown
      disconnect();
      // Then run your existing logout logic
      await auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force disconnect even if auth logout fails
      disconnect();
    }
  };

  // Reown-specific methods
  const openAppKit = () => {
    if (!auth.isConnected) {
      open();
    }
  };

  const closeAppKit = () => {
    close();
  };

  const contextValue: AuthContextType = {
    ...auth,
    enhancedLogout,
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
function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default AppProvider