"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains, mainnet, sepolia } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { celo, celoAlfajores } from 'wagmi/chains';
import { useAuth } from '@/hooks/useAuth';

// User data type
interface UserData {
  id: string;
  walletAddress: string;
  role: string;
  [key: string]: string | number | boolean;
}

// Configure the chains you want to support
const { chains } = configureChains(
  [celo, celoAlfajores, mainnet, sepolia],
  [publicProvider()]
);

// Create wagmi config
const config = createConfig(
  getDefaultConfig({
    appName: "Pesia's Kitchen App",
    chains,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  })
);

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
});

// Hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom theme type for ConnectKit
type CustomTheme = {
  "--ck-connectbutton-background": string;
  "--ck-connectbutton-hover-background": string;
  "--ck-connectbutton-active-background": string;
  "--ck-connectbutton-color": string;
  "--ck-connectbutton-radius": string;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider
        theme="auto"
        mode="light"
        customTheme={{
          "--ck-connectbutton-background": "#FCD34D",
          "--ck-connectbutton-hover-background": "#FBBF24",
          "--ck-connectbutton-active-background": "#F59E0B",
          "--ck-connectbutton-color": "#1F2937",
          "--ck-connectbutton-radius": "9999px",
        } as CustomTheme}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
