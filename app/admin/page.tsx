'use client';
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { getallActivities } from '@/services/api';
import { toast } from 'sonner';
import Link from "next/link";

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

interface ChartData {
  name: string;
  value: number;
  color: string;
  description: string;
}

interface MetricData {
  name: string;
  value: string;
  color: string;
  icon: string;
}

interface RecentActivity {
  title: string;
  time: string;
  location: string;
  color: string;
}

export default function ImpactDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Data states
  const [participationData, setParticipationData] = useState<ChartData[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<MetricData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Fetch activities data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getallActivities();
        setActivities(response.data || []);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load impact data. Please try again later.');
        toast.error('Failed to load impact data');
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
  }, [activities]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Process activities data to create chart data and metrics
  const processActivitiesData = () => {
    // Get unique volunteers and recipients
    const uniqueVolunteers = new Set();
    const uniqueRecipients = new Set();
    
    let totalGDollars = 0;
    let totalNFTs = 0;
    let totalFoodDistributed = 0;
    let totalMealsProvided = 0;
    let totalWasteReduced = 0;
    
    // Process activities to extract data
    activities.forEach(activity => {
      // Count users as volunteers for food_sorting activities
      if (activity.event.activityType === 'food_sorting') {
        uniqueVolunteers.add(activity.user._id);
        // Estimate waste reduced - using quantity as a proxy (1 unit = 2kg waste reduced)
        totalWasteReduced += activity.quantity * 2;
      }
      
      // Count users as recipients for food_distribution activities
      if (activity.event.activityType === 'food_distribution') {
        uniqueRecipients.add(activity.user._id);
        // Estimate food distributed - using quantity as a proxy (1 unit = 1kg food)
        totalFoodDistributed += activity.quantity;
        // Estimate meals provided - using quantity as a proxy (1kg = 12.5 meals)
        totalMealsProvided += Math.round(activity.quantity * 12.5);
      }
      
      // Count G$ rewards
      if (activity.rewardAmount) {
        totalGDollars += activity.rewardAmount;
      }
      
      // Count NFTs
      if (activity.nftMinted || activity.nftId) {
        totalNFTs++;
      }
    });
    
    // Create participation chart data
    const chartData: ChartData[] = [
      { 
        name: "Volunteers", 
        value: uniqueVolunteers.size, 
        color: "#3B82F6", 
        description: "Active community members"
      },
      { 
        name: "Recipients", 
        value: uniqueRecipients.size, 
        color: "#10B981", 
        description: "Individuals receiving aid"
      }
    ];
    
    // Default to placeholder values if no data available
    if (uniqueVolunteers.size === 0 && uniqueRecipients.size === 0) {
      chartData[0].value = 1;
      chartData[1].value = 0;
    }
    
    setParticipationData(chartData);
    
    // Create metrics data
    const metrics: MetricData[] = [
      { 
        name: "Total G$ Rewarded", 
        value: `$${totalGDollars.toFixed(2)}`, 
        color: "#F59E0B", 
        icon: "💰" 
      },
      { 
        name: "NFTs Rewarded", 
        value: totalNFTs.toString(), 
        color: "#8B5CF6", 
        icon: "🏆" 
      },
      { 
        name: "Food Distributed", 
        value: `${totalFoodDistributed}kg`, 
        color: "#EC4899", 
        icon: "🍲" 
      },
      { 
        name: "Meals Provided", 
        value: totalMealsProvided.toLocaleString(), 
        color: "#F97316", 
        icon: "🍽️" 
      },
      { 
        name: "Waste Reduced", 
        value: `${totalWasteReduced}kg`, 
        color: "#84CC16", 
        icon: "♻️" 
      }
    ];
    
    setImpactMetrics(metrics);
    
    // Create recent activities data - getting the 3 most recent activities
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const recent: RecentActivity[] = sortedActivities.slice(0, 3).map(activity => {
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
      
      let timeText = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      if (isToday) {
        timeText = `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (isYesterday) {
        timeText = `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Create readable title based on activity type
      let title = activity.event.title;
      if (!title && activity.event.activityType) {
        const activityType = activity.event.activityType.replace('_', ' ');
        title = activityType.charAt(0).toUpperCase() + activityType.slice(1) + " Activity";
      }
      
      return {
        title,
        time: timeText,
        location: activity.event.location || "Unknown location",
        color
      };
    });
    
    // If no recent activities, add placeholder
    if (recent.length === 0) {
      recent.push({
        title: "No recent activities",
        time: "N/A",
        location: "N/A",
        color: "#6B7280"
      });
    }
    
    setRecentActivities(recent);
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={fill} fontSize={windowWidth < 768 ? 16 : 24} fontWeight="bold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#666" fontSize={windowWidth < 768 ? 14 : 18}>
          {value} People
        </text>
        <text x={cx} y={cy + 35} textAnchor="middle" fill="#999" fontSize={windowWidth < 768 ? 12 : 14}>
          {(percent * 100).toFixed(0)}% of Total
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 15}
          fill={fill}
        />
      </g>
    );
  };

  // Calculate key insights based on actual data
  const getKeyInsights = () => {
    if (participationData.length < 2 || participationData[0].value === 0 || participationData[1].value === 0) {
      return [
        "Not enough data to generate insights yet",
        "Start recording activities to see community impact",
        "Check back after more events have been completed"
      ];
    }
    
    const volunteers = participationData[0].value;
    const recipients = participationData[1].value;
    const ratio = (recipients / volunteers).toFixed(2);
    
    // Calculate month-over-month growth if possible
    const lastMonthActivities = activities.filter(a => {
      const date = new Date(a.timestamp);
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      return date >= lastMonth && date < now;
    });
    
    const twoMonthsAgoActivities = activities.filter(a => {
      const date = new Date(a.timestamp);
      const lastMonth = new Date();
      const twoMonthsAgo = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      return date >= twoMonthsAgo && date < lastMonth;
    });
    
    let growthRate = 0;
    if (twoMonthsAgoActivities.length > 0) {
      growthRate = Math.round((lastMonthActivities.length - twoMonthsAgoActivities.length) / twoMonthsAgoActivities.length * 100);
    }
    
    return [
      `We have a ${volunteers}:${recipients} ratio of volunteers to recipients`,
      `Each volunteer helps approximately ${ratio} recipients on average`,
      growthRate !== 0 
        ? `Community engagement has ${growthRate > 0 ? 'increased' : 'decreased'} by ${Math.abs(growthRate)}% compared to last month`
        : "We're tracking community engagement month over month"
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading impact data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
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

  // Calculate key insights
  const keyInsights = getKeyInsights();

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Community Impact Dashboard</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tracking our collective efforts to reduce food waste and support communities in need
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Participation</h2>
            
            <div className="h-80 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={participationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={windowWidth < 768 ? 60 : 80}
                    outerRadius={windowWidth < 768 ? 80 : 110}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    paddingAngle={3}
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} People`, name]}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '8px', 
                      padding: '10px 14px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend & Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {participationData.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-full mt-1`} style={{ backgroundColor: entry.color }}></div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{entry.name}: {entry.value}</h3>
                    <p className="text-sm text-gray-600">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Insights</h3>
              <ul className="space-y-2">
                {keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Impact Metrics</h2>
              
              <div className="space-y-4">
                {impactMetrics.map((metric, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-4 rounded-xl transition-all hover:shadow-md"
                    style={{ backgroundColor: `${metric.color}10` }}  // 10% opacity of the color
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: metric.color }}
                      >
                        <span className="text-lg">{metric.icon}</span>
                      </div>
                      <span className="font-medium text-gray-800">{metric.name}</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: metric.color }}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className={`border-l-4 pl-4 py-1`} style={{ borderColor: activity.color }}>
                    <h3 className="font-medium text-gray-800">{activity.title}</h3>
                    <p className="text-sm text-gray-500">{activity.time} - {activity.location}</p>
                  </div>
                ))}
              </div>
              <Link href="/admin/activity" className="mt-6 w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
                View All Activities
              </Link>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}