'use client';
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";

// Enhanced chart data with more information
const impactData = [
  { name: "Volunteers", value: 450, color: "#3B82F6", description: "Active community members" },
  { name: "Recipients", value: 600, color: "#10B981", description: "Individuals receiving aid" }
];


const impactMetrics = [
  { name: "Total G$ Rewarded", value: "$124.00", color: "#F59E0B", icon: "💰" },
  { name: "NFTs Rewarded", value: "132", color: "#8B5CF6", icon: "🏆" },
  { name: "Food Distributed", value: "132kg", color: "#EC4899", icon: "🍲" },
  { name: "Meals Provided", value: "1,650", color: "#F97316", icon: "🍽️" },
  { name: "Waste Reduced", value: "256kg", color: "#84CC16", icon: "♻️" }
];

export default function ImpactDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props) => {
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
                    data={impactData}
                    cx="50%"
                    cy="50%"
                    innerRadius={windowWidth < 768 ? 60 : 80}
                    outerRadius={windowWidth < 768 ? 80 : 110}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    paddingAngle={3}
                  >
                    {impactData.map((entry, index) => (
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
              {impactData.map((entry, index) => (
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
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-gray-700">We have a 3:4 ratio of volunteers to recipients</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-gray-700">Each volunteer helps approximately 1.33 recipients on average</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-gray-700">Community engagement has increased by 15% compared to last month</span>
                </li>
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
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <h3 className="font-medium text-gray-800">Food Distribution Event</h3>
                  <p className="text-sm text-gray-500">Today, 2:30 PM - Nairobi Center</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-1">
                  <h3 className="font-medium text-gray-800">Food Rescue Operation</h3>
                  <p className="text-sm text-gray-500">Yesterday, 9:00 AM - Downtown Market</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4 py-1">
                  <h3 className="font-medium text-gray-800">Volunteer Training Session</h3>
                  <p className="text-sm text-gray-500">May 10, 2025 - Community Center</p>
                </div>
              </div>
              
              <button className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors">
                View All Activities
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}