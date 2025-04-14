"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

// Sample activities data
const SAMPLE_ACTIVITIES = [
  { id: 1, title: 'Event xyz', date: '24 nov 2021' },
  { id: 2, title: 'Event xyz', date: '24 nov 2021' },
  { id: 3, title: 'Event xyz', date: '24 nov 2021' },
  { id: 4, title: 'Event xyz', date: '24 nov 2021' }
]

export default function DashboardPage() {
  const [activities, setActivities] = useState(SAMPLE_ACTIVITIES)
  const [activitiesCount, setActivitiesCount] = useState(43)
  const [goodDollarsEarned, setGoodDollarsEarned] = useState(234)
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with stats */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="flex items-center">
              <div className="bg-blue-100 w-6 h-6 rounded-md flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div className="text-lg font-medium">{activitiesCount}</div>
            </div>
            <div className="text-xs text-gray-500">Activities attended</div>
          </div>
          
          <div>
            <div className="flex items-center justify-end">
              <div className="bg-blue-100 w-6 h-6 rounded-md flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-lg font-medium">${goodDollarsEarned}</div>
            </div>
            <div className="text-xs text-gray-500 text-right">G$ earned</div>
          </div>
        </div>
        
        {/* Connect GoodWallet Button */}
        <div className="rounded-lg border border-gray-200 mt-4 mb-4">
          <div className="p-4">
            <div className="font-medium mb-2">Link GoodWallet to Claim Good Dollars</div>
            <button className="flex items-center bg-blue-50 text-blue-600 rounded-lg px-4 py-2 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add GoodWallet
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="px-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Recent Receipts</h2>
          <Link href="/activities" className="text-blue-500 text-sm">See all</Link>
        </div>
        
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="border-b border-gray-100 pb-4">
              <div className="font-medium">{activity.title}</div>
              <div className="text-xs text-gray-500">{activity.date}</div>
              <div className="text-right text-sm">$325.00</div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}