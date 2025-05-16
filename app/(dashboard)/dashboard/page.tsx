// app/(dashboard)/dashboard/page.tsx
import { Metadata } from 'next'
import DashboardClient from '@/components/DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard | Persias Kitchen',
  description: 'View your activities, rewards, and NFTs in your Persias Kitchen dashboard',
  openGraph: {
    title: 'Dashboard | Persias Kitchen',
    description: 'View your activities, rewards, and NFTs in your Persias Kitchen dashboard',
    type: 'website',
  },
}

// Force dynamic rendering since we're using client-side data fetching
export const dynamic = 'force-dynamic'

// Disable static page generation since we need real-time data
export const revalidate = 0

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardClient />
    </main>
  )
}