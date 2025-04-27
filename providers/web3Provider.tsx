'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WagmiConfig, 
  createConfig,
  configureChains,
  mainnet,
  sepolia,
  useAccount
} from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { 
  ConnectKitProvider, 
  getDefaultConfig 
} from "connectkit";
import { celoAlfajores } from 'wagmi/chains';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/utils/api-client';

// Configure the chains you want to support
const { chains } = configureChains(
  [mainnet, sepolia, celoAlfajores],
  [publicProvider()]
);

// Create wagmi config with ConnectKit
const config = createConfig(
  getDefaultConfig({
    appName: "Global Classrooms App",
    chains,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  }),
);

// Auth utilities
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getUser = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data', error);
      }
    }
  }
  return null;
};

const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Auth context type
interface AuthContextValue {
  // Navigation functions
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
  
  // Authentication state
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  logout: () => void;
  
  // Loading state
  isLoading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextValue>({
  redirectToLogin: () => {},
  redirectToDashboard: () => {},
  isAuthenticated: false,
  user: null,
  token: null,
  logout: () => {},
  isLoading: false
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation functions
  const redirectToLogin = () => router.push('/');
  const redirectToDashboard = () => router.push('/dashboard');
  
  // Logout function
  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    redirectToLogin();
  };
  
  // Load auth data on mount and when wallet changes
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser && isConnected) {
      if (address && address.toLowerCase() === storedUser.walletAddress?.toLowerCase()) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        clearAuthData();
      }
    }
    
    setIsLoading(false);
  }, [address, isConnected]);

  // Cleanup when wallet disconnects
  useEffect(() => {
    if (!isConnected && token) {
      logout();
    }
  }, [isConnected, token]);

  // Auth context value
  const value = {
    redirectToLogin,
    redirectToDashboard,
    isAuthenticated: !!token && !!user,
    user,
    token,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Final AppProvider with all providers combined
export function AppProvider({ children }: AuthProviderProps) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider 
        theme="auto"
        mode="dark" 
        customTheme={{
          "--ck-connectbutton-background": "#f7c334",
          "--ck-connectbutton-color": "#303030",
          "--ck-connectbutton-hover-background": "#f5bb20",
          "--ck-body-background": "#ffffff",
          "--ck-body-color": "#303030",
          "--ck-primary-button-background": "#f7c334",
          "--ck-primary-button-font-weight": "600",
          "--ck-primary-button-color": "#303030",
        }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}