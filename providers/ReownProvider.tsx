// @ts-nocheck
'use client'

import { wagmiAdapter, projectId, networks } from '@/config/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, celo } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: "Pesia's Kitchen EAT Initiative",
  description: "Food rescue operations with GoodDollar rewards",
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.pesiaskitchen.org',
  icons: ['/images/logo.png'] // Make sure to add your logo here
}

// Create the modal with Reown AppKit
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: celo, // Set Celo as default since you're using GoodDollar
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    email: false, // Disable email login if not needed
    socials: [], // Disable social logins if not needed
    emailShowWallets: true // Show wallets even when email is enabled
  },
  themeMode: 'light', // or 'dark' or 'auto'
  themeVariables: {
    '--w3m-color-mix': '#FCD34D', // Your yellow theme color
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#FCD34D',
    '--w3m-border-radius-master': '12px'
  }
})

interface ReownProviderProps {
  children: ReactNode
  cookies: string | null
}

function ReownProvider({ children, cookies }: ReownProviderProps) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ReownProvider