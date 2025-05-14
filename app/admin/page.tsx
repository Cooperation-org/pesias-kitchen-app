'use client';
import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import Link from "next/link";
import { useActivities } from '@/hooks/useActivities';

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

interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: ChartData;
  percent: number;
  value: number;
  name: string;
  index: number;
}

export default function ImpactDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { activities, metrics, recentActivities, isLoading, error } = useActivities();

  // Create participation chart data
  const participationData: ChartData[] = [
    { 
      name: "Volunteers", 
      value: metrics.uniqueVolunteers, 
      color: "#3B82F6", 
      description: "Active community members"
    },
    { 
      name: "Recipients", 
      value: metrics.uniqueRecipients, 
      color: "#10B981", 
      description: "Individuals receiving aid"
    }
  ];

  // Create metrics data
  const impactMetrics: MetricData[] = [
    { 
      name: "Total G$ Rewarded", 
      value: `$${metrics.totalGDollars.toFixed(2)}`, 
      color: "#F59E0B", 
      icon: "💰" 
    },
    { 
      name: "NFTs Rewarded", 
      value: metrics.totalNFTs.toString(), 
      color: "#8B5CF6", 
      icon: "🏆" 
    },
    { 
      name: "Food Distributed", 
      value: `${metrics.totalFoodDistributed}kg`, 
      color: "#EC4899", 
      icon: "🍲" 
    },
    { 
      name: "Meals Provided", 
      value: metrics.totalMealsProvided.toLocaleString(), 
      color: "#F97316", 
      icon: "🍽️" 
    },
    { 
      name: "Waste Reduced", 
      value: `${metrics.totalWasteReduced}kg`, 
      color: "#84CC16", 
      icon: "♻️" 
    }
  ];

  // Calculate key insights
  const getKeyInsights = () => {
    if (metrics.uniqueVolunteers === 0 || metrics.uniqueRecipients === 0) {
      return [
        "Not enough data to generate insights yet",
        "Start recording activities to see community impact",
        "Check back after more events have been completed"
      ];
    }
    
    const ratio = (metrics.uniqueRecipients / metrics.uniqueVolunteers).toFixed(2);
    
    // Calculate month-over-month growth
    const lastMonthActivities = activities.filter(a => {
      const date = new Date(a.date);
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      return date >= lastMonth && date < now;
    });
    
    const twoMonthsAgoActivities = activities.filter(a => {
      const date = new Date(a.date);
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
      `We have a ${metrics.uniqueVolunteers}:${metrics.uniqueRecipients} ratio of volunteers to recipients`,
      `Each volunteer helps approximately ${ratio} recipients on average`,
      growthRate !== 0 
        ? `Community engagement has ${growthRate > 0 ? 'increased' : 'decreased'} by ${Math.abs(growthRate)}% compared to last month`
        : "We're tracking community engagement month over month"
    ];
  };

  // Loading state
  if (isLoading) {
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
          <p className="text-gray-600 mb-4">Failed to load impact data. Please try again later.</p>
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
          <p className="text-gray-600 mt-2">Track community impact and engagement</p>
        </header>

        {/* Key Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {keyInsights.map((insight, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Participation Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Participation Chart */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Participation</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape as any}
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                    >
                      {participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {impactMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{metric.name}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: metric.color }}>
                        {metric.value}
                      </p>
                    </div>
                    <span className="text-3xl">{metric.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-8">
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
              <Link href="/admin/activity">
                <button className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors">
                  View All Activities
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom active shape for the pie chart
function renderActiveShape(props: ActiveShapeProps) {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        className="text-sm"
      >
        {`${value} ${payload.description}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
        className="text-xs"
      >
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
}