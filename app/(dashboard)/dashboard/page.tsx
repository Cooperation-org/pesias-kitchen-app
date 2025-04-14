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
      
      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 p-2 mt-auto">
        <div className="flex justify-around">
          <Link href="/dashboard" className="flex flex-col items-center py-1 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>
          
          <Link href="/activities" className="flex flex-col items-center py-1 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            <span className="text-xs">Activities</span>
          </Link>
          
          <Link href="/scan" className="flex flex-col items-center relative">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center absolute -top-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              </svg>
            </div>
            <span className="text-xs mt-6">Scan</span>
          </Link>
          
          <Link href="/rewards" className="flex flex-col items-center py-1 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <span className="text-xs">Rewards</span>
          </Link>
          
          <Link href="/nfts" className="flex flex-col items-center py-1 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-xs">NFTs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}