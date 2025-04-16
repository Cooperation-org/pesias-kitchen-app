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
  { id: 1, title: 'Event xyz', date: '26 Nov 2021', amount: '$321.00' },
  { id: 2, title: 'Event xyz', date: '14 Nov 2021', amount: '$321.00' },
  { id: 3, title: 'Event xyz', date: '01 Nov 2021', amount: '$321.00' },
  { id: 4, title: 'Event xyz', date: '24 Nov 2021', amount: '$321.00' }
]

export default function Dashboard() {
  const [activities, setActivities] = useState(SAMPLE_ACTIVITIES)
  const [activitiesCount, setActivitiesCount] = useState(43)
  const [goodDollarsEarned, setGoodDollarsEarned] = useState(234)
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [hasGoodWallet, setHasGoodWallet] = useState(true) // Toggle between the two UI states

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
          title: lastScanResult.type || 'Event xyz',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            .replace(/ /g, ' ')
            .toLowerCase(),
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

  const toggleWallet = () => {
    setHasGoodWallet(!hasGoodWallet)
  }
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
    
      {/* Stats Card */}
      <div className="mx-4 mt-4 bg-white rounded-lg shadow-sm">
        <div className="p-4 flex justify-between">
          <div className="flex flex-col items-center">
            <div className="bg-yellow-100 p-2 rounded-md mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 8.5H10C9.45 8.5 9 8.95 9 9.5V10C9 10.55 9.45 11 10 11H14C14.55 11 15 10.55 15 10V9.5C15 8.95 14.55 8.5 14 8.5Z" fill="#FFD54F"/>
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.25 16H7.75C7.34 16 7 15.66 7 15.25C7 14.84 7.34 14.5 7.75 14.5H16.25C16.66 14.5 17 14.84 17 15.25C17 15.66 16.66 16 16.25 16ZM16.25 12.5H7.75C7.34 12.5 7 12.16 7 11.75C7 11.34 7.34 11 7.75 11H16.25C16.66 11 17 11.34 17 11.75C17 12.16 16.66 12.5 16.25 12.5ZM16.25 9H7.75C7.34 9 7 8.66 7 8.25C7 7.84 7.34 7.5 7.75 7.5H16.25C16.66 7.5 17 7.84 17 8.25C17 8.66 16.66 9 16.25 9Z" fill="#FFD54F"/>
              </svg>
            </div>
            <div className="text-lg font-bold">{activitiesCount}</div>
            <div className="text-xs text-gray-500">Activities attended</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-2 rounded-md mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#2196F3"/>
                <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#2196F3"/>
              </svg>
            </div>
            <div className="text-lg font-bold">${goodDollarsEarned}</div>
            <div className="text-xs text-gray-500">G$ earned</div>
          </div>
        </div>
      </div>
      
      {/* Wallet Section - Conditional rendering based on wallet status */}
      {!hasGoodWallet && (
        <div className="mx-4 mt-4">
          <h3 className="text-md font-medium mb-2">Link GoodWallet to Claim Good Dollars</h3>
          <button onClick={toggleWallet} className="w-full bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-center text-blue-500 font-medium">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#4F46E5" strokeWidth="2"/>
              <path d="M12 8V16" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 12H16" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add GoodWallet
          </button>
        </div>
      )}
      
      {/* Recent Receipts Section */}
      <div className="mx-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-md font-medium">Recent Receipts</h2>
          <Link href="/activities" className="text-blue-500 text-sm">See all</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {activities.map((activity, index) => (
            <div key={activity.id} className={`p-4 flex justify-between ${index !== activities.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div>
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-xs text-gray-500">{activity.date}</p>
              </div>
              <div className="text-md font-medium">{activity.amount}</div>
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
    </div>
  )
}