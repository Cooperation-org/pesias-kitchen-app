"use client"

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from '@/types/api'

interface ActivityListProps {
  activities: Activity[]
  onActivityClick: (activity: Activity) => void
}

export function ActivityList({ activities, onActivityClick }: ActivityListProps) {
  console.log(activities, 'activities')
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mx-4 mt-6 mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        <Link href="/activities" className="text-blue-500 text-sm flex items-center">
          See all
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
          </svg>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AnimatePresence>
          {activities.length > 0 ? (
            activities.slice(0, 5).map((activity, index) => (
              <motion.div 
                key={activity._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 ${index !== activities.slice(0, 5).length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                onClick={() => onActivityClick(activity)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      activity.activityType === 'food_sorting' ? 'bg-green-100 text-green-500' : 
                      activity.activityType === 'food_distribution' ? 'bg-blue-100 text-blue-500' : 
                      'bg-purple-100 text-purple-500'
                    }`}>
                      {activity.hasNFT ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM10.67 18L5 12.33L7.13 10.21L10.67 13.75L16.88 7.54L19 9.66L10.67 18Z" fill="currentColor"/>
                        </svg>
                      ) : (
                        activity.activityType === 'food_sorting' ? (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 6l-4.22 5.63 1.25 1.67L14 9.33 19 16h-8.46l-4.01-5.37L1 18h22L14 6zM5 16l1.52-2.03L8.04 16H5z" fill="currentColor"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.54-4.46a1 1 0 0 1 1.42-1.42 3 3 0 0 0 4.24 0 1 1 0 0 1 1.42 1.42 5 5 0 0 1-7.08 0zM9 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/>
                          </svg>
                        )
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{activity.title || "Activity"}</h3>
                      <p className="text-xs text-gray-500">{activity.date} at {activity.time}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {activity.amount} G$
                    </div>
                    {activity.hasNFT && (
                      <span className="text-xs text-green-600 mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                        </svg>
                        NFT Minted
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <div>
                    <span className="inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                      </svg>
                      {activity.location}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full ${
                      activity.activityType === 'food_sorting' ? 'bg-green-50 text-green-600' : 
                      activity.activityType === 'food_distribution' ? 'bg-blue-50 text-blue-600' : 
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {activity.activityType?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
              </svg>
              <p>No activities recorded yet</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Scan QR to get started
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
} 