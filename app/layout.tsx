import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SWRProvider } from '@/providers/SWRProvider'
import ReownProvider from '@/providers/ReownProvider'
import DynamicProvider from '@/providers/DynamicProvider'
import { Toaster } from 'sonner'
import { headers } from 'next/headers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Pesia's Kitchen - Fighting Food Waste Together",
  description: 'Join our community in fighting food waste. Volunteer, earn rewards, and make a real impact in your community.',
  keywords: ['Food rescue', 'Volunteer', 'Community impact', 'Sustainability', 'Food waste'],
  authors: [{ name: "Pesia's Kitchen" }],
  openGraph: {
    title: "Pesia's Kitchen - Fighting Food Waste Together",
    description: 'Join our community in fighting food waste. Volunteer, earn rewards, and make a real impact.',
    url: 'https://www.pesiaskitchen.org',
    siteName: "Pesia's Kitchen",
    images: [
      {
        url: '/images/pesias-kitchen-header.jpg',
        width: 1200,
        height: 630,
        alt: "Pesia's Kitchen - Community volunteers",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Pesia's Kitchen - Fighting Food Waste",
    description: 'Join our community volunteers in fighting food waste and earning rewards.',
    images: ['/images/pesias-kitchen-header.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Pesia's Kitchen",
  },
  formatDetection: {
    telephone: false,
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

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
            <DynamicProvider>
              {children}
            </DynamicProvider>
          </ReownProvider>
        </SWRProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}