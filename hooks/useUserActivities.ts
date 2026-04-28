import { useCallback, useMemo } from "react"
import useSWR from 'swr';
import { Activity as ApiActivity, Participant, Reward, NFT, SWR_ENDPOINTS } from '@/types/api'
import { getUserActivities, getRewardsHistory, getUserNFTs, mintActivityNFT } from "@/services/api"
import { toast } from 'sonner'

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

export const useUserActivities = (enabled: boolean) => {
  // Fetch activities
  const { data: activitiesData, error: activitiesError, isLoading: isLoadingActivities, mutate: mutateActivities } = useSWR<ApiActivity[]>(
    enabled ? [SWR_ENDPOINTS.USER_ACTIVITIES.key] : null,
    async () => {
      const response = await getUserActivities();
      return response.data;
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 30000, // Refresh every 30 seconds
      onError: (error) => {
        console.error('Error fetching activities:', error);
        toast.error('Failed to load activities. Please try again later.');
      }
    }
  );

  // Fetch rewards
  const { data: rewardsData, error: rewardsError, mutate: mutateRewards } = useSWR<Reward[]>(
    enabled ? [SWR_ENDPOINTS.REWARDS.key] : null,
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
  const { data: nftsData, error: nftsError, mutate: mutateNFTs } = useSWR<NFT[]>(
    enabled ? [SWR_ENDPOINTS.NFTS.key] : null,
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

  // Function to handle NFT minting
  const handleMintNFT = useCallback(async (activityId: string) => {
    try {
      toast.loading('Claiming G$ and minting NFT...', { id: 'mint-nft' });
      await mintActivityNFT(activityId);
      
      // Revalidate both activities and NFTs data
      await Promise.all([
        mutateActivities(),
        mutateNFTs()
      ]);

      toast.success('G$ claimed and NFT minted successfully!', { id: 'mint-nft' });
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to claim G$ and mint NFT. Please try again.', { id: 'mint-nft' });
    }
  }, [mutateActivities, mutateNFTs]);

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
      
      // Get reward amount - use actual reward amount from activity or QR code
      const activityId = activity._id;
      const reward = activityRewardsMap[activityId];
      const rewardAmount = reward ? reward.rewardAmount : (
        // Use actual reward amount from activity (should always be available now)
        (activity as any).rewardAmount || 1 // Default to 1 if somehow missing
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
    isLoading: enabled ? isLoading : false,
    error: enabled ? error?.message : null,
    handleMintNFT,
    mutateActivities,
    mutateRewards,
    mutateNFTs
  };
};