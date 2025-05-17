"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { usePathname } from 'next/navigation';
import CreateEventModal from '@/components/CreateEventModal';
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Direct Reown/Wagmi hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleEventCreated = () => {
    // Close the modal
    setShowCreateModal(false);
    // Refresh the page to show the new event
    window.location.reload();
  };

  // Handlers
  const handleConnect = () => {
    console.log('Admin - Connect button clicked'); // Debug log
    open();
  };

  const handleDisconnect = () => {
    console.log('Admin - Disconnect button clicked'); // Debug log
    disconnect();
  };

  console.log('Admin Layout - Current state:', { isConnected, address }); // Debug log

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with menu and notifications */}
      <header className="p-4 flex justify-end items-center border-b border-gray-100 fixed w-full bg-white z-20 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Wallet Connection Button */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleConnect}
                className="flex items-center text-sm font-medium"
              >
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-800">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
              </button>
              <button
                onClick={handleDisconnect}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-3 py-1 bg-yellow-400 text-gray-800 rounded-full text-sm font-medium hover:bg-yellow-500 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main content with proper spacing */}
      <main className="flex-1 pb-24 mt-[4rem] px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Fixed bottom navigation with shadow effect */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white">
        {/* Border with shadow effect */}
        <div className="h-px w-full bg-gradient-to-b from-gray-200 to-transparent shadow-sm"></div>

        {/* Navigation container */}
        <div className="py-4">
          <div className="flex justify-around items-end max-w-md mx-auto">
            {/* Home button */}
            <Link
              href="/dashboard"
              className="flex flex-col items-center w-16"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`mb-2 ${pathname === "/dashboard" ? "text-yellow-400" : "text-gray-500"}`}
              >
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={`text-xs ${pathname === "/dashboard" ? "text-yellow-400" : "text-gray-500"}`}>Home</span>
              {pathname === "/dashboard" && (
                <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
              )}
            </Link>

            {/* Events button */}
            <Link
              href="/admin/event"
              className="flex flex-col items-center w-16"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`mb-2 ${pathname === "/admin/event" ? "text-yellow-400" : "text-gray-500"}`}
              >
                <path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                <path
                  d="M17.657 8.343a7 7 0 1 1-9.9-9.9 7 7 0 0 1 9.9 9.9z"
                  strokeWidth="1.5"
                  strokeDasharray="0.5 3"
                />
              </svg>
              <span className={`text-xs ${pathname === "/admin/event" ? "text-yellow-400" : "text-gray-500"}`}>Events</span>
              {pathname === "/admin/event" && (
                <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
              )}
            </Link>

            {/* Centered Create Event Button */}
            <div className="flex flex-col items-center -mt-10 relative cursor-pointer" onClick={() => setShowCreateModal(true)}>
              <div className="absolute -top-5 w-24 h-24 bg-gray-100 rounded-full shadow-inner flex items-center justify-center">
                <div className="relative">
                  <button
                    className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center z-10 shadow-lg hover:bg-yellow-500 transition-colors"
                  >
                    <svg
                      width="76"
                      height="76"
                      viewBox="0 0 76 76"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g filter="url(#filter0_d_0_1)">
                        <circle cx="38" cy="42" r="31" />
                        <circle cx="38" cy="42" r="32.5" />
                      </g>
                      <path
                        d="M49.7732 42.304H39.5492V52.672H35.4692V42.304H25.2932V38.608H35.4692V28.192H39.5492V38.608H49.7732V42.304Z"
                        fill="white"
                      />
                      <defs>
                        <filter
                          id="filter0_d_0_1"
                          x="0"
                          y="0"
                          width="76"
                          height="76"
                          filterUnits="userSpaceOnUse"
                        >
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="-4" />
                          <feGaussianBlur stdDeviation="2" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_0_1"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_0_1"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                  </button>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-16" style={{ visibility: "hidden" }}>
                Create
              </span>
            </div>

            {/* Activities button */}
            <Link
              href="/admin/activity"
              className="flex flex-col items-center w-16"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`mb-2 ${pathname === "/admin/activity" ? "text-yellow-400" : "text-gray-500"}`}
              >
                <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={`text-xs ${pathname === "/admin/activity" ? "text-yellow-400" : "text-gray-500"}`}>Activities</span>
              {pathname === "/admin/activity" && (
                <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
              )}
            </Link>

            {/* NFTs button */}
            <Link 
              href="/admin/nfts" 
              className="flex flex-col items-center w-16"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`mb-2 ${pathname === "/admin/nfts" ? "text-yellow-400" : "text-gray-500"}`}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className={`text-xs ${pathname === "/admin/nfts" ? "text-yellow-400" : "text-gray-500"}`}>NFTs</span>
              {pathname === "/admin/nfts" && (
                <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
        eventsApiUrl="/api/events"
      />
    </div>
  );
}