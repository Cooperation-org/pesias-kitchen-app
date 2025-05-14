// hooks/useActivities.ts
import useSWR from 'swr';
import { buildApiUrl, fetcher } from '@/utils/swr-config';

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

export interface ActivityMetrics {
  totalGDollars: number;
  totalNFTs: number;
  totalFoodDistributed: number;
  totalMealsProvided: number;
  totalWasteReduced: number;
  uniqueVolunteers: number;
  uniqueRecipients: number;
}

export function useActivities(filter?: string) {
  console.log('useActivities hook called with filter:', filter);
  
  const url = buildApiUrl('activity');

  
  const { data, error, isLoading, mutate } = useSWR<Activity[]>(
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

  console.log('SWR state:', { 
    hasData: !!data,
    isArray: Array.isArray(data),
    length: data?.length,
    firstActivity: data?.[0]
  });

  const activities = data || [];

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

  // Calculate metrics
  const metrics: ActivityMetrics = filteredActivities.reduce((acc, activity) => {
    // Count unique volunteers and recipients
    if (activity.event.activityType === 'food_sorting') {
      acc.uniqueVolunteers++;
      acc.totalWasteReduced += activity.quantity * 2; // 1 unit = 2kg waste reduced
    }
    if (activity.event.activityType === 'food_distribution') {
      acc.uniqueRecipients++;
      acc.totalFoodDistributed += activity.quantity; // 1 unit = 1kg food
      acc.totalMealsProvided += Math.round(activity.quantity * 12.5); // 1kg = 12.5 meals
    }
    
    // Count rewards
    if (activity.rewardAmount) {
      acc.totalGDollars += activity.rewardAmount;
    }
    if (activity.nftMinted || activity.nftId) {
      acc.totalNFTs++;
    }
    
    return acc;
  }, {
    totalGDollars: 0,
    totalNFTs: 0,
    totalFoodDistributed: 0,
    totalMealsProvided: 0,
    totalWasteReduced: 0,
    uniqueVolunteers: 0,
    uniqueRecipients: 0
  });

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

