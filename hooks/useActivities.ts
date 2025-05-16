// hooks/useActivities.ts
import useSWR from 'swr';
import { buildApiUrl, fetcher } from '@/utils/swr-config';
import { getFoodHeroesImpact } from '@/services/api';
import { ActivityMetrics } from '@/types/api';

export interface Activity {
  _id: string;
  event: {
    _id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    activityType: string;
    capacity: number;
    defaultQuantity: number;
    participants: Array<{
      _id: string;
      walletAddress: string;
      name: string;
    }>;
    createdBy: string;
    createdAt: string;
    __v: number;
  };
  qrCode: string;
  user: {
    _id: string;
    walletAddress: string;
    name: string;
  };
  quantity: number;
  verified: boolean;
  nftId: string | null;
  txHash: string | null;
  notes: string;
  timestamp: string;
  __v: number;
  rewardAmount?: number;
  nftMinted?: boolean;
  nftTokenId?: string;
}

export interface ProcessedActivity {
  _id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  color: string;
  activityType: string;
  userName: string;
  quantity: number;
  verified: boolean;
}

export function useActivities(filter?: string) {
  console.log('useActivities hook called with filter:', filter);
  
  const url = buildApiUrl('activity');
  
  // Fetch activities
  const { data: activitiesData, error: activitiesError, isLoading: isLoadingActivities, mutate } = useSWR<Activity[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      onSuccess: (data) => {
        console.log('Activities fetched successfully:', data);
      },
      onError: (error) => {
        console.error('Error fetching activities:', error);
      }
    }
  );

  // Fetch analytics data
  const { data: analyticsData, error: analyticsError, isLoading: isLoadingAnalytics } = useSWR<ActivityMetrics>(
    'food-heroes-impact',
    async () => {
      const response = await getFoodHeroesImpact();
      console.log('Analytics API Response:', response);
      
      // Map the API response to our metrics format using only the needed data
      const apiData = response.data;
      const mappedMetrics: ActivityMetrics = {
        // Core Impact Metrics
        totalGDollars: apiData.foodHeroesImpact.totalGDollarsDistributed,
        totalNFTs: apiData.foodHeroesImpact.totalNFTsMinted,
        totalFoodDistributed: apiData.foodHeroesImpact.totalFoodRescued,
        totalWasteReduced: apiData.foodHeroesImpact.totalFoodRescued,
        uniqueVolunteers: apiData.foodHeroesImpact.totalVolunteers,
        uniqueRecipients: apiData.foodHeroesImpact.totalRecipients,
        totalUniqueParticipants: apiData.foodHeroesImpact.totalUniqueParticipants,
        totalActivities: apiData.foodHeroesImpact.totalActivities,
        totalEvents: apiData.foodHeroesImpact.totalEvents,
        avgFoodPerEvent: apiData.foodHeroesImpact.avgFoodPerEvent,
        avgRewardsPerEvent: apiData.foodHeroesImpact.avgRewardsPerEvent,
        
        // QR Code Statistics
        qrStats: apiData.qrStats,
        
        // Metadata
        generatedAt: apiData.generatedAt,
        fromCache: apiData.fromCache,
        calculationTime: apiData.calculationTime
      };
      
      console.log('Mapped metrics:', mappedMetrics);
      return mappedMetrics;
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      onError: (error) => {
        console.error('Error fetching analytics:', error);
      }
    }
  );

  console.log('SWR state:', { 
    hasData: !!activitiesData,
    isArray: Array.isArray(activitiesData),
    length: activitiesData?.length,
    firstActivity: activitiesData?.[0]
  });

  const activities = activitiesData || [];
  const isLoading = isLoadingActivities || isLoadingAnalytics;
  const error = activitiesError || analyticsError;

  // Filter activities if filter is provided
  const filteredActivities = filter && filter !== 'all'
    ? activities.filter(activity => activity.event.activityType === filter)
    : activities;
  
  console.log('Filtered activities:', {
    filter,
    isArray: Array.isArray(filteredActivities),
    length: filteredActivities.length,
    firstActivity: filteredActivities[0]
  });

  // Sort activities by date (newest first)
  const sortedActivities = [...filteredActivities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Process sorted activities
  const processedActivities = sortedActivities.map(activity => {
    // Determine color based on activity type
    let color = "#6B7280"; // Default gray
    if (activity.event.activityType === 'food_sorting') {
      color = "#3B82F6"; // Blue
    } else if (activity.event.activityType === 'food_distribution') {
      color = "#10B981"; // Green
    } else if (activity.event.activityType === 'food_pickup') {
      color = "#8B5CF6"; // Purple
    }
    
    // Format date
    const date = new Date(activity.timestamp);
    const isToday = new Date().toDateString() === date.toDateString();
    const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();
    
    const dateText = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    let dayText = dateText;
    if (isToday) {
      dayText = "Today";
    } else if (isYesterday) {
      dayText = "Yesterday";
    }
    
    const timeText = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Create readable title based on activity type
    let title = activity.event.title;
    if (!title && activity.event.activityType) {
      const activityType = activity.event.activityType.replace('_', ' ');
      title = activityType.charAt(0).toUpperCase() + activityType.slice(1) + " Activity";
    }
    
    return {
      _id: activity._id,
      title,
      time: timeText,
      date: dayText,
      location: activity.event.location || "Unknown location",
      color,
      activityType: activity.event.activityType,
      userName: activity.user.name,
      quantity: activity.quantity,
      verified: activity.verified
    };
  });

  // Use analytics data from the API instead of calculating metrics
  const metrics = analyticsData || {
    // Core Impact Metrics
    totalGDollars: 0,
    totalNFTs: 0,
    totalFoodDistributed: 0,
    totalWasteReduced: 0,
    uniqueVolunteers: 0,
    uniqueRecipients: 0,
    totalUniqueParticipants: 0,
    totalActivities: 0,
    totalEvents: 0,
    avgFoodPerEvent: 0,
    avgRewardsPerEvent: 0,
    
    // QR Code Statistics
    qrStats: {
      totalCodes: 0,
      totalScans: 0,
      avgScansPerCode: 0
    },
    
    // Metadata
    generatedAt: new Date().toISOString(),
    fromCache: false,
    calculationTime: "0ms"
  };

  console.log('Final metrics being used:', metrics);
  console.log('totalGDollars value:', metrics.totalGDollars);

  // Get recent activities (last 3)
  const recentActivities = processedActivities.slice(0, 3);

  return {
    activities: processedActivities,
    recentActivities,
    metrics,
    isLoading,
    error,
    mutate
  };
}

