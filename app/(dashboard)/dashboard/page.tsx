"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

// Scanner result type definition
interface ScanResult {
  id: string;
  type: string;
  reward: number;
  location: string;
  timestamp: number;
}

// Sample activities data
const SAMPLE_ACTIVITIES = [
  { id: 1, title: 'Event xyz', date: '24 nov 2021', amount: '$325.00' },
  { id: 2, title: 'Event xyz', date: '24 nov 2021', amount: '$325.00' },
  { id: 3, title: 'Event xyz', date: '24 nov 2021', amount: '$325.00' },
  { id: 4, title: 'Event xyz', date: '24 nov 2021', amount: '$325.00' }
]

export default function DashboardPage() {
  const [activities, setActivities] = useState(SAMPLE_ACTIVITIES)
  const [activitiesCount, setActivitiesCount] = useState(43)
  const [goodDollarsEarned, setGoodDollarsEarned] = useState(234)
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  useEffect(() => {
    // Check if we should show the popup based on localStorage
    const shouldShowPopup = localStorage.getItem('showScanPopup') === 'true'
    if (shouldShowPopup) {
      // Get the last scan result from localStorage
      const lastScanResultStr = localStorage.getItem('lastScanResult')
      if (lastScanResultStr) {
        const lastScanResult = JSON.parse(lastScanResultStr)
        setScanResult(lastScanResult)
        setShowPopup(true)
        
        // Update totals
        setGoodDollarsEarned(prev => prev + lastScanResult.reward)
        setActivitiesCount(prev => prev + 1)
        
        // Add the new activity to the list
        const newActivity = {
          id: Date.now(),
          title: lastScanResult.type || 'Scanned Activity',
          date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase(),
          amount: `$${lastScanResult.reward}.00`
        }
        
        setActivities([newActivity, ...activities.slice(0, 3)])
        
        // Clear the flags so popup won't show again on refresh
        localStorage.removeItem('showScanPopup')
      }
    }
  }, []) // Empty dependency array means this runs once on mount

  const closePopup = () => {
    setShowPopup(false)
  }
  
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
              <div className="text-right text-sm">{activity.amount}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Success Popup */}
      {showPopup && scanResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-green-400 p-6 rounded-lg max-w-sm w-full mx-4 relative overflow-hidden">
            {/* Confetti animation background */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Confetti elements - styling matches Figma design */}
              <div className="absolute top-10 left-12 w-6 h-2 bg-yellow-300 rounded-full rotate-45"></div>
              <div className="absolute top-20 right-10 w-8 h-2 bg-pink-400 rounded-full -rotate-12"></div>
              <div className="absolute bottom-14 left-1/4 w-5 h-2 bg-blue-300 rounded-full rotate-30"></div>
              <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-yellow-300 rounded-full"></div>
              <div className="absolute bottom-1/3 left-20 w-3 h-8 bg-pink-400 rounded-full -rotate-45"></div>
              <div className="absolute top-1/2 right-8 w-2 h-6 bg-blue-300 rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center">
              {/* G logo badge */}
              <div className="bg-white rounded-full h-10 w-10 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-500 font-bold text-xl">G</span>
              </div>
              
              {/* Display earned amount */}
              <h2 className="text-4xl font-bold text-white mb-2">
                {scanResult.reward}
              </h2>
              <p className="text-white font-medium mb-6">Dollars Earned</p>
              
              {/* Close button */}
              <button 
                onClick={closePopup}
                className="bg-white text-green-500 px-10 py-2 rounded-full font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scan Button - Fixed at bottom right */}
      <div className="fixed bottom-6 right-6">
        <Link href="/scan" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
          </svg>
        </Link>
      </div>
    </div>
  )
}