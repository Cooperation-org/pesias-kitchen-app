'use client';
import { useState, useEffect } from "react";
import { getallActivities } from '@/services/api';
import { toast } from 'sonner';

// Define types for our data
interface Activity {
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
    participants: any[];
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
  // Optional fields that might exist in some activities
  rewardAmount?: number;
  nftMinted?: boolean;
  nftTokenId?: string;
}

interface RecentActivity {
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

export default function RecentActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Fetch activities data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getallActivities();
        setActivities(response.data || []);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities data. Please try again later.');
        toast.error('Failed to load activities data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Process data when activities change
  useEffect(() => {
    if (activities.length > 0) {
      processActivitiesData();
    }
  }, [activities, filter]);

  // Process activities data to create formatted activities list
  const processActivitiesData = () => {
    // Create recent activities data - sorting from newest to oldest
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const filteredActivities = filter === 'all' 
      ? sortedActivities 
      : sortedActivities.filter(activity => activity.event.activityType === filter);
    
    const recent: RecentActivity[] = filteredActivities.map(activity => {
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
      
      let dateText = date.toLocaleDateString('en-US', { 
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
      
      let timeText = date.toLocaleTimeString('en-US', { 
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
    
    // If no activities, add placeholder
    if (recent.length === 0) {
      recent.push({
        _id: "no-activities",
        title: "No activities found",
        time: "N/A",
        date: "N/A",
        location: "N/A",
        color: "#6B7280",
        activityType: "none",
        userName: "N/A",
        quantity: 0,
        verified: false
      });
    }
    
    setRecentActivities(recent);
  };

  const getActivityTypeLabel = (type: string) => {
    switch(type) {
      case 'food_sorting':
        return 'Food Sorting';
      case 'food_distribution':
        return 'Food Distribution';
      case 'food_pickup':
        return 'Food Pickup';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen py-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Activities</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recent Activities</h1>
          <p className="text-gray-600 mt-2">View all community activities and their details</p>
        </header>
        
        {/* Filter controls */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Activities
          </button>
          <button 
            onClick={() => setFilter('food_sorting')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'food_sorting' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Food Sorting
          </button>
          <button 
            onClick={() => setFilter('food_distribution')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'food_distribution' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Food Distribution
          </button>
          <button 
            onClick={() => setFilter('food_pickup')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'food_pickup' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Food Pickup
          </button>
        </div>
        
        {/* Activities list */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: activity.color }}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <div className="text-xs text-gray-500">{getActivityTypeLabel(activity.activityType)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{activity.date}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{activity.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activity.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty state for no activities after filtering */}
          {recentActivities.length === 1 && recentActivities[0]._id === "no-activities" && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? "There are no recorded activities yet." 
                  : `No ${getActivityTypeLabel(filter)} activities found.`}
              </p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 bg-gray-100 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-200"
                >
                  View all activities
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Basic pagination placeholder */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{recentActivities.length}</span> activities
          </div>
          <div className="flex-1 flex justify-end">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}