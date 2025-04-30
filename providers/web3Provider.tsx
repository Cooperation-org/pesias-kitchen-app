'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
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
import { setWalletConnectionStatus, getUser, getToken, clearAuthData } from '@/services/authServices';

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

// Auth context type
interface AuthContextValue {
  // Navigation functions
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
  
  // Authentication state
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  logout: () => void;
  
  // Loading state
  isLoading: boolean;
}

// User data type
interface UserData {
  id: string;
  walletAddress: string;
  role: string;
  [key: string]: string | number | boolean;
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
  
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation functions
  const redirectToLogin = () => {
    console.log("Redirecting to login page");
    try {
      router.replace('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };
  const redirectToDashboard = () => {
    console.log("Redirecting to dashboard");
    try {
      router.replace('/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/dashboard';
    }
  };
  
  // Logout function
  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    redirectToLogin();
  };
  
  // Update wallet connection status
  useEffect(() => {
    setWalletConnectionStatus(isConnected);
    if (!isConnected) {
      logout();
    }
  }, [isConnected]);
  
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

  // Auth context value
  const value = useMemo(() => ({
    redirectToLogin,
    redirectToDashboard,
    isAuthenticated: !!token && !!user && isConnected,
    user,
    token,
    logout,
    isLoading
  }), [token, user, isLoading, isConnected]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Final AppProvider with all providers combined
export function AppProvider({ children }: AuthProviderProps) {
  // Memoize the theme object
  const theme = useMemo(() => ({
    "--ck-connectbutton-background": "#f7c334",
    "--ck-connectbutton-color": "#303030",
    "--ck-connectbutton-hover-background": "#f5bb20",
    "--ck-body-background": "#ffffff",
    "--ck-body-color": "#303030",
    "--ck-primary-button-background": "#f7c334",
    "--ck-primary-button-font-weight": "600",
    "--ck-primary-button-color": "#303030",
  }), []);

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider 
        theme="auto"
        mode="dark" 
        customTheme={theme}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}