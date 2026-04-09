import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { headers } from 'next/headers'
import SWRProvider from '@/providers/SWRProvider'
import Web3BaseProvider from '@/providers/Web3BaseProvider'
import AppProvider from '@/providers/AppProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookies = (await headers()).get('cookie')
  
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans h-full`}
      >
        <SWRProvider>
          <Web3BaseProvider cookies={cookies}>
            <AppProvider>
              {children}
            </AppProvider>
          </Web3BaseProvider>
        </SWRProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}