import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SWRProvider } from '@/providers/SWRProvider'
import ReownProvider from '@/providers/ReownProvider'
import { Toaster } from 'sonner'
import { headers } from 'next/headers'
import { AppProvider } from '@/providers/web3Provider'

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
          <ReownProvider cookies={cookies}>
            <AppProvider>
              {children}
            </AppProvider>
          </ReownProvider>
        </SWRProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}