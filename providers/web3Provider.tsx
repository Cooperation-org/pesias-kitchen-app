'use client';

import React from 'react';
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { 
  WagmiConfig, 
  createConfig,
  configureChains,
  mainnet,
  sepolia,

} from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { 
  ConnectKitProvider, 
  getDefaultConfig 
} from "connectkit";
import { celoAlfajores } from 'wagmi/chains';
import { useRouter } from 'next/navigation';

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

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
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
        {children}
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

// Authentication context to manage redirection
interface AuthContextValue {
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  redirectToLogin: () => {},
  redirectToDashboard: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: Web3ProviderProps) {
  const router = useRouter();
  
  const redirectToLogin = () => router.push('/');
  const redirectToDashboard = () => router.push('/dashboard');
  
  return (
    <AuthContext.Provider value={{ redirectToLogin, redirectToDashboard }}>
      {children}
    </AuthContext.Provider>
  );
}

// Combine both providers for ease of use
export function AppProvider({ children }: Web3ProviderProps) {
  return (
    <Web3Provider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Web3Provider>
  );
}