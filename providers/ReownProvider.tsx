'use client'

import { wagmiAdapter, projectId } from '@/config/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { celo, celoAlfajores } from '@reown/appkit/networks'
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
  icons: ['/images/logo.png']
}

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [celo, celoAlfajores], // Simplified to just Celo networks for mobile
  defaultNetwork: celo,
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: [],
    emailShowWallets: true
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#FCD34D',
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