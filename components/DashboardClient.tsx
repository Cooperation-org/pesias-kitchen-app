"use client"

import { useCallback, useMemo } from "react"
import useSWR from 'swr'
import { Activity, NFT, Reward, ActivitiesResponse, RewardsResponse, NFTsResponse } from '@/types/api'
import { getUserActivities, getRewardsHistory, getUserNFTs, mintActivityNFT } from "@/services/api"
import { StatsCard } from './dashboard/StatsCard'
import { RecentActivities } from './RecentActivities'
import { LoadingSkeleton } from './dashboard/LoadingSkeleton'
import { ErrorState } from './dashboard/ErrorState'
import { toast } from 'sonner'

// Custom hook for fetching dashboard data
function useDashboardData() {
  const { data: activitiesData, error: activitiesError, isLoading: isLoadingActivities } = useSWR<ActivitiesResponse>(
    'user-activities',
    async () => {
      const response = await getUserActivities()
      return {
        data: response.data,
        total: response.data.length
      } as ActivitiesResponse
    },
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000
    }
  );

  const { data: rewardsData, error: rewardsError, isLoading: isLoadingRewards } = useSWR<RewardsResponse>(
    'user-rewards',
    async () => {
      const response = await getRewardsHistory()
      return response // The API already returns RewardsResponse
    },
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000
    }
  );

  const { data: nftsData, error: nftsError, isLoading: isLoadingNFTs } = useSWR<NFTsResponse>(
    'user-nfts',
    async () => {
      const response = await getUserNFTs()
      return response // The API already returns NFTsResponse
    },
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000
    }
  );

  const isLoading = isLoadingActivities || isLoadingRewards || isLoadingNFTs;
  const error = activitiesError || rewardsError || nftsError;

  const activities = useMemo(() => {
    if (!activitiesData?.data) return [];
    return activitiesData.data.map((activity: Activity) => {
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
        nftMinted: nftsData?.nfts?.some((nft: NFT) => nft.activityId === activity._id) || false,
        rewardAmount: rewardsData?.rewards?.find((r: Reward) => r.activityId === activity._id)?.rewardAmount || 0
      };
    });
  }, [activitiesData, nftsData, rewardsData]);

  const stats = useMemo(() => ({
    activitiesCount: activities.length,
    goodDollarsEarned: rewardsData?.totalRewards || 0,
    nftCount: nftsData?.nfts?.length || 0
  }), [activities.length, rewardsData?.totalRewards, nftsData?.nfts?.length]);

  // Add mutate function for activities and NFTs
  const { mutate: mutateActivities } = useSWR('user-activities');
  const { mutate: mutateNFTs } = useSWR('user-nfts');

  // Function to handle NFT minting
  const handleMintNFT = useCallback(async (activityId: string) => {
    try {
      toast.loading('Minting NFT...', { id: 'mint-nft' });
      await mintActivityNFT(activityId);
      
      // Revalidate both activities and NFTs data
      await Promise.all([
        mutateActivities(),
        mutateNFTs()
      ]);

      toast.success('NFT minted successfully!', { id: 'mint-nft' });
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT. Please try again.', { id: 'mint-nft' });
    }
  }, [mutateActivities, mutateNFTs]);

  return {
    activities,
    stats,
    isLoading,
    error: error ? 'Failed to load dashboard data' : null,
    handleMintNFT
  };
}

export default function DashboardClient() {
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
}