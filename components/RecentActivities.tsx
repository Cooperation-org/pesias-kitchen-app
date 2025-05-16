import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from '@/types/api';
import { useState, useCallback } from 'react';

interface RecentActivitiesProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  showViewAll?: boolean;
  maxItems?: number;
  className?: string;
  onMintNFT?: (activityId: string) => Promise<void>;
}

// Define the event object type
type EventObject = {
  _id: string;
  title: string;
  activityType: 'food_sorting' | 'food_distribution' | 'food_pickup' | 'other';
  location?: string;
  date?: string;
};

interface ProcessedActivity {
  _id: string;
  event: string | EventObject;
  title: string;
  date: string;
  time: string;
  location: string;
  activityType: string;
  amount: string;
  quantity: number;
  hasNFT: boolean;
  timestamp: string;
}

export function RecentActivities({ 
  activities, 
  onActivityClick,
  showViewAll = true,
  maxItems = 5,
  className = '',
  onMintNFT
}: RecentActivitiesProps) {
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ProcessedActivity | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Process activities for display
  const processedActivities = activities.map(activity => {
    const eventDetails = typeof activity.event === 'object' ? activity.event : null;
    const activityType = eventDetails?.activityType || 'default';
    
    // Format date/time
    const timestamp = new Date(activity.timestamp);
    const formattedDate = timestamp.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const formattedTime = timestamp.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      ...activity,
      title: eventDetails?.title || 'Activity',
      activityType: activityType,
      location: eventDetails?.location || 'Unknown Location',
      date: formattedDate,
      time: formattedTime,
      timestamp: activity.timestamp,
      amount: `${activity.rewardAmount || 0}`,
      hasNFT: !!activity.nftId || !!activity.nftMinted
    } as ProcessedActivity;
  });

  const handleActivityClick = useCallback((activity: ProcessedActivity) => {
    setSelectedActivity(activity);
    setShowEventModal(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedActivity(null);
  }, []);

  const handleMintClick = useCallback(async (activity: ProcessedActivity) => {
    if (isMinting || !onMintNFT) return;
    
    setIsMinting(true);
    try {
      await onMintNFT(activity._id);
      closeEventModal();
    } finally {
      setIsMinting(false);
    }
  }, [onMintNFT, isMinting, closeEventModal]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        {showViewAll && (
          <Link href="/dashboard/activities" className="text-blue-500 text-sm flex items-center hover:text-blue-600 transition-colors">
            See all
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
            </svg>
          </Link>
        )}
      </div>
      
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {processedActivities.length > 0 ? (
            processedActivities.slice(0, maxItems).map((activity, index) => (
              <motion.div 
                key={activity._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 hover:bg-gray-50 transition-colors ${onActivityClick ? 'cursor-pointer' : ''}`}
                onClick={() => handleActivityClick(activity)}
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
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-500">{activity.date} • {activity.time}</p>
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
                    <span className={`mt-1 px-2 py-0.5 rounded-full text-xs ${
                      activity.activityType === 'food_sorting' ? 'bg-green-50 text-green-600' : 
                      activity.activityType === 'food_distribution' ? 'bg-blue-50 text-blue-600' : 
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {activity.activityType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No recent activities
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedActivity && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-md w-full relative overflow-hidden shadow-xl"
          >
            <div className={`bg-gradient-to-r ${
              selectedActivity.activityType === 'food_sorting' ? 'from-green-500 to-green-600' : 
              selectedActivity.activityType === 'food_distribution' ? 'from-blue-500 to-blue-600' : 
              'from-purple-500 to-purple-600'
            } h-32 p-6`}>
              <button 
                onClick={closeEventModal}
                className="absolute top-4 right-4 bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h3 className="text-xl font-bold text-white mt-6">{selectedActivity.title}</h3>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="ml-2 text-sm">{selectedActivity.date} • {selectedActivity.time}</span>
                </div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  {selectedActivity.amount} G$
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium mb-2">Location</h4>
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 13.17 9.42 18.92 11.24 21.11C11.64 21.59 12.37 21.59 12.77 21.11C14.58 18.92 19 13.17 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                  </svg>
                  {selectedActivity.location}
                </div>
                
                <h4 className="font-medium mb-2">Activity Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Activity Type</span>
                    <span className="font-medium capitalize">{selectedActivity.activityType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-medium">{selectedActivity.quantity}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">NFT Status</span>
                    {selectedActivity.hasNFT ? (
                      <span className="font-medium text-green-600">Minted</span>
                    ) : (
                      <span className="font-medium text-gray-600">Not Minted</span>
                    )}
                  </div>
                </div>

                {/* Add Mint NFT Button */}
                {!selectedActivity.hasNFT && onMintNFT && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleMintClick(selectedActivity)}
                      disabled={isMinting}
                      className={`flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium flex items-center justify-center ${
                        isMinting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-600'
                      } transition-colors`}
                    >
                      {isMinting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Minting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Mint NFT
                        </>
                      )}
                    </button>
                    <button 
                      onClick={closeEventModal}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
} 