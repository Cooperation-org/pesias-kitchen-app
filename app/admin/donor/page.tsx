import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Menu } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-4 space-y-4 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative"></div>
      </div>

      {/* Donation Summary Card */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="flex justify-between p-6 text-center">
          <div>
            <p className="text-xl font-bold">$234</p>
            <p className="text-sm text-gray-500">Amount Donated</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <img src="/G.png" alt="G$ icon" className="w-5 h-5 mr-2" />
              <span className="text-xl font-bold">$234</span>
            </div>
            <p className="text-sm text-gray-500">G$ rewarded</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Receipts */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Receipts</h2>
        <span className="text-yellow-500 text-sm font-medium cursor-pointer">
          See all
        </span>
      </div>

      {/* Receipts List */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="divide-y divide-gray-200 p-4">
          {Array(4)
            .fill(null)
            .map((_, idx) => (
              <div key={idx} className="py-3 flex justify-between">
                <div>
                  <p className="font-semibold">Donation ID</p>
                  <p className="text-xs text-gray-500">Date - 26 Nov 2021</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$321.00</p>
                  <p className="text-sm text-gray-500">$321.00</p>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
