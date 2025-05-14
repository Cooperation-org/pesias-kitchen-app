"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR, { mutate } from 'swr'
import { Activity, NFT, Reward } from '@/types/api'
import { getUserActivities, getRewardsHistory, getUserNFTs } from "@/services/api"
import { StatsCard } from './dashboard/StatsCard'
import { ActivityList } from './dashboard/ActivityList'
import { EventModal } from './dashboard/EventModal'
import { LoadingSkeleton } from './dashboard/LoadingSkeleton'
import { ErrorState } from './dashboard/ErrorState'


// Custom hook for fetching dashboard data
function useDashboardData() {
  const { data: activitiesData, error: activitiesError, isLoading: isLoadingActivities } = useSWR(
    'user-activities',
    async () => {
      const response = await getUserActivities()
      return response.data // The API returns ActivitiesResponse directly
    },
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000
    }
  );

  const { data: rewardsData, error: rewardsError, isLoading: isLoadingRewards } = useSWR(
    'user-rewards',
    () => getRewardsHistory(), // RewardsResponse is already the data we want
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000
    }
  );

  const { data: nftsData, error: nftsError, isLoading: isLoadingNFTs } = useSWR(
    'user-nfts',
    () => getUserNFTs(), // NFTsResponse is already the data we want
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000
    }
  );

  const isLoading = isLoadingActivities || isLoadingRewards || isLoadingNFTs;
  const error = activitiesError || rewardsError || nftsError;

  // Function to optimistically update activities when joining an event
  const addActivity = useCallback((newActivity: Activity) => {
    // Optimistically update the activities list
    mutate('user-activities', (currentData: Activity[]) => {
      if (!currentData) return [newActivity];
      
      const timestamp = new Date(newActivity.timestamp);
      const date = timestamp.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      const time = timestamp.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const formattedActivity = {
        ...newActivity,
        title: typeof newActivity.event === 'object' ? newActivity.event.title : 'Activity',
        activityType: typeof newActivity.event === 'object' ? newActivity.event.activityType : 'other',
        location: typeof newActivity.event === 'object' ? newActivity.event.location : 'Unknown Location',
        date,
        time,
        hasNFT: false,
        amount: 0
      };

      return [formattedActivity, ...currentData];
    }, false); // false means don't revalidate immediately

    // Trigger a revalidation in the background
    mutate('user-activities');
  }, []);

  const activities = useMemo(() => {
    if (!activitiesData) return [];
    return activitiesData.map((activity: Activity) => {
      const timestamp = new Date(activity.timestamp);
      const date = timestamp.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      const time = timestamp.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        ...activity,
        title: typeof activity.event === 'object' ? activity.event.title : 'Activity',
        activityType: typeof activity.event === 'object' ? activity.event.activityType : 'other',
        location: typeof activity.event === 'object' ? activity.event.location : 'Unknown Location',
        date,
        time,
        hasNFT: nftsData?.nfts?.some((nft: NFT) => nft.activityId === activity._id) || false,
        amount: rewardsData?.rewards?.find((r: Reward) => r.activityId === activity._id)?.rewardAmount || 0
      };
    });
  }, [activitiesData, nftsData, rewardsData]);

  const stats = useMemo(() => ({
    activitiesCount: activities.length,
    goodDollarsEarned: rewardsData?.totalRewards || 0,
    nftCount: nftsData?.nfts?.length || 0
  }), [activities.length, rewardsData?.totalRewards, nftsData?.nfts?.length]);

  return {
    activities,
    stats,
    isLoading,
    error: error ? 'Failed to load dashboard data' : null,
    addActivity // Expose the mutation function
  };
}

export default function DashboardClient() {
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const { activities, stats, isLoading, error, addActivity } = useDashboardData()

  const handleActivityClick = useCallback((activity: Activity) => {
    setSelectedActivity(activity)
    setShowEventModal(true)
  }, [])

  const closeEventModal = useCallback(() => {
    setShowEventModal(false)
    setSelectedActivity(null)
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Stats Card */}
      <StatsCard stats={stats} />

      {/* Recent Activities Section */}
      <ActivityList 
        activities={activities}
        onActivityClick={handleActivityClick}
      />

      {/* Event Details Modal */}
      {showEventModal && selectedActivity && (
        <EventModal
          activity={selectedActivity}
          onClose={closeEventModal}
        />
      )}
    </div>
  )
}