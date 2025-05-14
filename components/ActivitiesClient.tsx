"use client"

import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getUserActivities, getRewardsHistory, getUserNFTs } from "@/services/api"
import { Activity as ApiActivity, Participant, Reward, NFT } from '@/types/api'
import useSWR from 'swr'
import { toast } from 'sonner'
import { SWR_ENDPOINTS } from '@/types/api'

// Types
interface EventType {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  activityType: "food_sorting" | "food_distribution" | "other";
  capacity: number;
  defaultQuantity: number;
  participants: Participant[];
  createdBy: string;
  createdAt: string;
  __v: number;
}

interface ProcessedActivity {
  _id: string;
  event: string | EventType;
  qrCode: string;
  user: string | {
    _id: string;
    walletAddress: string;
    name: string;
  };
  quantity: number;
  notes: string;
  nftId: string | null;
  txHash: string | null;
  verified: boolean;
  timestamp: string;
  title: string;
  date: string;
  amount: string;
  location: string;
  activityType: string;
  hasNFT: boolean;
  time: string;
  nftTokenId?: string;
}

// Custom hooks
const useActivitiesData = () => {
  // Fetch activities
  const { data: activitiesData, error: activitiesError, isLoading: isLoadingActivities } = useSWR<ApiActivity[]>(
    [SWR_ENDPOINTS.USER_ACTIVITIES.key],
    async () => {
      const response = await getUserActivities();
      return response.data;
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 30000, // Refresh every 30 seconds
      onError: (err) => {
        console.error('Error fetching activities:', err);
        toast.error('Failed to load activities. Please try again later.');
      }
    }
  );

  // Fetch rewards
  const { data: rewardsData, error: rewardsError } = useSWR<Reward[]>(
    [SWR_ENDPOINTS.REWARDS.key],
    async () => {
      const response = await getRewardsHistory();
      return response.rewards || [];
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('Error fetching rewards:', err);
        toast.error('Failed to load rewards. Please try again later.');
      }
    }
  );

  // Fetch NFTs
  const { data: nftsData, error: nftsError } = useSWR<NFT[]>(
    [SWR_ENDPOINTS.NFTS.key],
    async () => {
      const response = await getUserNFTs();
      return response.nfts || [];
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('Error fetching NFTs:', err);
        toast.error('Failed to load NFTs. Please try again later.');
      }
    }
  );

  // Process activities data
  const processedActivities = useMemo(() => {
    if (!activitiesData) return [];

    // Create maps for quick lookups
    const activityRewardsMap = (rewardsData || []).reduce((map, reward) => {
      map[reward.activityId] = reward;
      return map;
    }, {} as Record<string, Reward>);

    const activityNFTMap = (nftsData || []).reduce((map, nft) => {
      const activityId = nft.id.split('-').length > 1 ? nft.id.split('-')[1] : '';
      if (activityId) map[activityId] = nft;
      return map;
    }, {} as Record<string, NFT>);

    // Process each activity
    return activitiesData.map(activity => {
      const eventDetails = typeof activity.event === 'object' ? activity.event : null;
      const activityType = eventDetails?.activityType || 'default';
      
      // Get reward amount
      const activityId = activity._id;
      const reward = activityRewardsMap[activityId];
      const rewardAmount = reward ? reward.rewardAmount : (
        activityType === 'food_sorting' ? 5 : 
        activityType === 'food_distribution' ? 2 : 1
      );
      
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
      
      // Check NFT status
      const hasNFT = !!activity.nftId || !!activityNFTMap[activityId];
      
      return {
        ...activity,
        title: eventDetails?.title || 'Activity',
        activityType: activityType,
        location: eventDetails?.location || 'Unknown Location',
        date: formattedDate,
        time: formattedTime,
        timestamp: activity.timestamp,
        amount: `${rewardAmount}`,
        hasNFT: hasNFT
      } as ProcessedActivity;
    });
  }, [activitiesData, rewardsData, nftsData]);

  const isLoading = isLoadingActivities;
  const error = activitiesError || rewardsError || nftsError;

  return {
    activities: processedActivities,
    isLoading,
    error: error?.message || null
  };
};

export default function ActivitiesClient() {
  const { activities, isLoading, error } = useActivitiesData();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ProcessedActivity | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const [filterType, setFilterType] = useState("all");

  const handleActivityClick = useCallback((activity: ProcessedActivity) => {
    setSelectedActivity(activity);
    setShowEventModal(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedActivity(null);
  }, []);

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    // Filter activities
    const filtered = activities.filter(activity => {
      if (filterType === "all") return true;
      return activity.activityType === filterType;
    });

    // Sort activities
    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === "rewards") {
        return parseInt(b.amount) - parseInt(a.amount);
      } else if (sortBy === "type") {
        return a.activityType.localeCompare(b.activityType);
      }
      return 0;
    });
  }, [activities, filterType, sortBy]);

  // Group activities by month
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ProcessedActivity[]> = {};
    filteredAndSortedActivities.forEach(activity => {
      const month = activity.date.split(' ')[1] + ' ' + activity.date.split(' ')[2];
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(activity);
    });
    return groups;
  }, [filteredAndSortedActivities]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-16 bg-gray-200 rounded-lg"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-center text-gray-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Filter and Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-4 mt-4 p-4 bg-white rounded-lg shadow-md"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Filter by Type</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Activities</option>
              <option value="food_sorting">Food Sorting</option>
              <option value="food_distribution">Food Distribution</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Sort by</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Most Recent</option>
              <option value="rewards">Highest Rewards</option>
              <option value="type">Activity Type</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Total Activities</label>
            <div className="flex items-center h-full">
              <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-medium">
                {activities.length} activities
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Activities List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-4 mt-4 mb-8 flex-1"
      >
        {Object.entries(groupedActivities).length > 0 ? (
          Object.entries(groupedActivities).map(([month, monthActivities]) => (
            <div key={month} className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">{month}</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <AnimatePresence>
                  {monthActivities.map((activity, index) => (
                    <motion.div 
                      key={activity._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 ${index !== monthActivities.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
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
                            <h3 className="font-medium text-gray-800">{activity.title}</h3>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 8V12L15 15M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {activity.date} • {activity.time}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                                </svg>
                                {activity.location}
                              </span>
                            </div>
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
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 mt-4"
          >
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            </svg>
            <p>No activities match your current filters</p>
            <button 
              onClick={() => {setFilterType("all"); setSortBy("date");}}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Event Details Modal */}
      {showEventModal && selectedActivity && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-md w-full relative overflow-hidden shadow-xl"
          >
            {/* Modal content remains the same... */}
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
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}