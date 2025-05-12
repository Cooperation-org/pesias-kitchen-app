'use client';
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Mock data to match the Figma design
const mockChartData = [
  { name: "Volunteers", value: 450, color: "#333333" },
  { name: "Recipients", value: 600, color: "#999999" }
];

const mockActivities = [
  {
    id: "1",
    name: "Activity name",
    date: "26 Mar 2025",
    description: "Description",
    createdAt: "2025-03-26T12:00:00Z"
  },
  {
    id: "2",
    name: "Activity name",
    date: "24 Mar 2025",
    description: "Description",
    createdAt: "2025-03-24T12:00:00Z"
  }
];

export default function PesiasKitchenDashboard() {
  const [activeTab, setActiveTab] = useState("impact");

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      {/* Top Navigation Tabs */}
      <div className="flex justify-around items-center border-b bg-white p-4 mb-4">
        <div className="flex w-full max-w-md">
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === "activities" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("activities")}
          >
            Activities
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === "impact" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("impact")}
          >
            Impact
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === "nfts" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("nfts")}
          >
            NFTs
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-20">
        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div className="space-y-4">
            {mockActivities.map((activity, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4">
                <div className="mb-2">
                  <h3 className="text-xl font-medium">{activity.name}</h3>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <button className="bg-yellow-400 text-white py-1 px-4 rounded-md text-sm">
                  View Impact
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === "impact" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Impact</h3>
              
              {/* Chart */}
              <div className="h-64 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#e5e7eb"
                      strokeWidth={2}
                    >
                      {mockChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-800 rounded-full mr-2"></div>
                  <span>Volunteers</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
                  <span>Recipients</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                  <span>Volunteers</span>
                  <span className="font-bold">450</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                  <span>Recipients</span>
                  <span className="font-bold">600</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                  <span>Total G$ rewarded</span>
                  <span className="font-bold">$124.00</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                  <span>Total NFTs rewarded</span>
                  <span className="font-bold">132</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                  <span>Quantity of Food</span>
                  <span className="font-bold">132kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NFTs Tab (simple placeholder) */}
        {activeTab === "nfts" && (
          <div className="text-center py-10">
            <p className="text-gray-500">NFTs will be displayed here</p>
          </div>
        )}
      </div>
    </div>
  );
}