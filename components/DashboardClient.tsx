"use client"

import { useCallback, useMemo, memo } from "react"
import useSWR from 'swr'
import { Activity, NFT, Reward } from '@/types/api'
import { getUserActivities, getRewardsHistory, getUserNFTs, mintActivityNFT } from "@/services/api"
import { swrConfig } from '@/utils/swr-config'
import { StatsCard } from './dashboard/StatsCard'
import { RecentActivities } from './RecentActivities'
import { LoadingSkeleton } from './dashboard/LoadingSkeleton'
import { ErrorState } from './dashboard/ErrorState'
import { toast } from 'sonner'

// Memoized activity transformer
const transformActivity = (activity: Activity, nfts: NFT[] = [], rewards: Reward[] = []) => {
  const timestamp = new Date(activity.timestamp);
  return {
    ...activity,
    title: typeof activity.event === 'object' ? activity.event.title : 'Activity',
    activityType: typeof activity.event === 'object' ? activity.event.activityType : 'other',
    location: typeof activity.event === 'object' ? activity.event.location : 'Unknown Location',
    date: timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    nftMinted: nfts.some(nft => nft.activityId === activity._id),
    rewardAmount: rewards.find(r => r.activityId === activity._id)?.rewardAmount || 0
  };
};

// Custom hook for fetching dashboard data
function useDashboardData() {
  const { data: dashboardData, error, isLoading, mutate } = useSWR(
    'dashboard-data',
    async () => {
      const [activitiesRes, rewardsRes, nftsRes] = await Promise.all([
        getUserActivities(),
        getRewardsHistory(),
        getUserNFTs()
      ]);
      
      return {
        activities: activitiesRes.data,
        rewards: rewardsRes.rewards,
        nfts: nftsRes.nfts,
        totalRewards: rewardsRes.totalRewards
      };
    },
    { 
      ...swrConfig,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const activities = useMemo(() => {
    if (!dashboardData?.activities) return [];
    return dashboardData.activities.map(activity => 
      transformActivity(activity, dashboardData.nfts, dashboardData.rewards)
    );
  }, [dashboardData]);

  const stats = useMemo(() => ({
    activitiesCount: activities.length,
    goodDollarsEarned: dashboardData?.totalRewards || 0,
    nftCount: dashboardData?.nfts?.length || 0
  }), [activities.length, dashboardData?.totalRewards, dashboardData?.nfts?.length]);

  const handleMintNFT = useCallback(async (activityId: string) => {
    try {
      toast.loading('Minting NFT...', { id: 'mint-nft' });
      await mintActivityNFT(activityId);
      await mutate(); // Single mutate call to refresh all data
      toast.success('NFT minted successfully!', { id: 'mint-nft' });
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT. Please try again.', { id: 'mint-nft' });
    }
  }, [mutate]);

  return {
    activities,
    stats,
    isLoading,
    error: error ? 'Failed to load dashboard data' : null,
    handleMintNFT
  };
}

// Memoized dashboard component
const DashboardClient = memo(function DashboardClient() {
  const { activities, stats, isLoading, error, handleMintNFT } = useDashboardData();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Stats Card */}
      <StatsCard stats={stats} />

      {/* Recent Activities Section */}
      <div className="mx-4 mt-6">
        <RecentActivities 
          activities={activities}
          onMintNFT={handleMintNFT}
          maxItems={5}
          showViewAll={true}
        />
      </div>
    </div>
  );
});

export default DashboardClient;