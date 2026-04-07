import type { Metadata } from 'next'

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

export default async function InternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  return (
    <div>
      {children}
    </div>
  )
}