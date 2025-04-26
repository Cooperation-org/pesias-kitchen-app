/* eslint-disable @next/next/no-img-element */
"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function EventSuccess() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Status bar */}
      <div className="flex justify-between items-center px-4 py-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3"></div>
        </div>
      </div>

      {/* Success banner */}
      <div className="relative bg-green-500 pt-16 pb-24 px-4 text-white text-center overflow-hidden">
        {/* Background Confetti Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/confetti.png"
            alt="Left Confetti"
            className="absolute top-0 left-0 h-full w-auto object-contain opacity-70"
          />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Left side confetti */}
          <img
            src="/confetti.png"
            alt="Left Confetti"
            className="absolute top-0 left-0 h-full w-auto object-contain opacity-70"
          />

          {/* Right side confetti */}
          <img
            src="/confetti.png"
            alt="Right Confetti"
            className="absolute top-0 right-0 h-full w-auto object-contain opacity-70"
          />
        </div>

        <h1 className="text-2xl font-bold relative z-10">Event Created</h1>
      </div>

      {/* Curved shape */}
      <div className="h-6 bg-white relative -mt-6 rounded-t-[50px]"></div>

      {/* Action buttons */}
      <div className="flex-1 px-4 py-4 space-y-4">
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded">
              <img src="/scan.png" alt="Scan QR" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">Download QR Code of Recipient</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded">
              <img src="/scan.png" alt="Scan QR" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">Download QR Code of Volunteers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded">
              <img src="/share.png" alt="Share Event" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">Share Event</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <button className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-colors">
          <span className="text-white text-2xl font-bold">+</span>
        </button>
      </div>
    </div>
  );
}
