"use client"

import { motion } from 'framer-motion'
import { Activity } from '@/types/api'

interface EventModalProps {
  activity: Activity
  onClose: () => void
}

export function EventModal({ activity, onClose }: EventModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-md w-full relative overflow-hidden shadow-xl"
      >
        {/* Modal header */}
        <div className={`bg-gradient-to-r ${
          activity.activityType === 'food_sorting' ? 'from-green-500 to-green-600' : 
          activity.activityType === 'food_distribution' ? 'from-blue-500 to-blue-600' : 
          'from-purple-500 to-purple-600'
        } h-32 p-6`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 rounded-full p-2"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h3 className="text-xl font-bold text-white mt-6">{activity.title}</h3>
        </div>
        
        {/* Modal content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="ml-2 text-sm">{activity.date} • {activity.time}</span>
            </div>
            <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              {activity.amount} G$
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium mb-2">Location</h4>
            <div className="flex items-center text-gray-600 mb-4">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 13.17 9.42 18.92 11.24 21.11C11.64 21.59 12.37 21.59 12.77 21.11C14.58 18.92 19 13.17 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
              </svg>
              {activity.location}
            </div>
            
            <h4 className="font-medium mb-2">Activity Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Activity Type</span>
                <span className="font-medium capitalize">{activity.activityType?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Quantity</span>
                <span className="font-medium">{activity.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">NFT Status</span>
                {activity.hasNFT ? (
                  <span className="font-medium text-green-600">Minted</span>
                ) : (
                  <span className="font-medium text-yellow-600">Available to Mint</span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              {!activity.hasNFT && (
                <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium">
                  Mint NFT
                </button>
              )}
              <button 
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 