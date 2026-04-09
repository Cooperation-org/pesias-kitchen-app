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

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardClient />
    </main>
  )
}