'use client';

import {
  DynamicContextProvider,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

export default function DynamicProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'test-env-id',
        walletConnectors: [EthereumWalletConnectors],
        // Optimized for production mobile experience
        emailSignInEnabled: false,
        socialProvidersFilter: () => false,
        enableVisitTrackingOnConnectOnly: true,
        // Enhanced biometric/passkey settings for production
        embeddedWalletSettings: {
          createOnSignIn: 'all-users',
          noPromptOnSignature: false,
        },
        // Mobile-first UI optimizations
        initialAuthenticationMode: 'connect-only',
        debugError: false,
        logLevel: 'ERROR',
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}