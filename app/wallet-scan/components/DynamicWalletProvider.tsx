"use client";

import React from 'react';
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import WalletChoice from './WalletChoice';

interface QRData {
  eventId: string;
  type: 'volunteer' | 'recipient';
  quantity?: number;
  rewardAmount?: number;
  expiresAt?: string;
  metadata?: {
    location?: string;
    eventTitle?: string;
  };
}

interface DynamicWalletProviderProps {
  qrData: QRData;
}

export default function DynamicWalletProvider({ qrData }: DynamicWalletProviderProps) {
  // Get Dynamic environment ID from environment variables
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'live_07fec66a-b32d-44a2-86c8-2ea3b8db4c9f';

  return (
    <DynamicContextProvider
      settings={{
        environmentId: environmentId,
        walletConnectors: [EthereumWalletConnectors],
        appName: "Pesia's Kitchen",
        appLogoUrl: "/images/Pesia-logo-black.png",
        
        // Configure for anonymous wallets
        newToWeb3WalletChainMap: {
          '1': ['embedded'], // Ethereum mainnet - use embedded wallet
          '137': ['embedded'], // Polygon - use embedded wallet  
          '42220': ['embedded'], // Celo - use embedded wallet
        },
        
        // UI customization
        cssOverrides: `
          .dynamic-widget-card {
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .dynamic-widget-button {
            background-color: #F4cf6A;
            color: #1f2937;
          }
          .dynamic-widget-button:hover {
            background-color: rgba(244, 207, 106, 0.9);
          }
        `,
        
        // Privacy settings
        privacyPolicyUrl: 'https://pesiaskitchen.org/privacy',
        termsOfServiceUrl: 'https://pesiaskitchen.org/terms',
        
        // Wallet connection settings
        initialAuthenticationMode: 'connect-only',
        
        // Only show embedded wallet in auth flow
        multiWallet: false,
        
        // Event handlers
        eventsCallbacks: {
          onAuthSuccess: (args) => {
            console.log('Auth success:', args);
          },
          onLogout: (args) => {
            console.log('Logout:', args);
          },
        }
      }}
    >
      <WalletChoice qrData={qrData} />
    </DynamicContextProvider>
  );
}