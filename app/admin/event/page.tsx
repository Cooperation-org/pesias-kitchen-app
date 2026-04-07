'use client'
import EventsPage from '@/components/Events'
import React from 'react'
import { getallActivities } from '@/services/api'

const Page = () => {

  React.useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await getallActivities()
      return response.data
    } catch (error) {
      console.error('Error fetching activities:', error)
      return []
    }
  }
 
  return (
    <div>
      <EventsPage />
    </div>
  )
}

export default Page
