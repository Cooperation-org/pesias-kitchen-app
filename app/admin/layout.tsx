"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import CreateEventModal from '@/components/CreateEventModal';
import Image from "next/image";
import "../globals.css";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const { user } = useAuth();


  // Direct Reown/Wagmi hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const userRole = user?.role || null;

  // Fetch user role when wallet is connected

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

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  const closeHamburgerMenu = () => {
    setShowHamburgerMenu(false);
  };

  console.log('Admin Layout - Current state:', { isConnected, address, userRole }); // Debug log

  const navigationItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: (
        <path
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    },
    {
      href: "/admin/event",
      label: "Events",
      icon: (
        <>
          <path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
          <path
            d="M17.657 8.343a7 7 0 1 1-9.9-9.9 7 7 0 0 1 9.9 9.9z"
            strokeWidth="1.5"
            strokeDasharray="0.5 3"
          />
        </>
      )
    },
    {
      href: "/admin/activity",
      label: "Activities",
      icon: (
        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      )
    },
    {
      href: "/admin/nfts",
      label: "NFTs",
      icon: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      )
    },
    {
      href: "https://dev-goodcollective.vercel.app/collective/0xbd64264abe852413d30dbf8a3765d7b6ddb04713",
      label: "Donate",
      icon: (
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
      ),
      external: true
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with hamburger menu and wallet connection */}
      <header className="p-4 flex justify-between items-center border-b border-gray-100 fixed w-full bg-white z-20 shadow-sm">
        {/* Left side with logo */}
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <div className="flex items-center">
            <Image
              src="/images/Pesia-logo-black.png"
              alt="Pesia's Kitchen Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
        </div>

        {/* Right side with hamburger menu */}
        <div className="flex items-center">
          <button
            onClick={toggleHamburgerMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hamburger Menu Overlay */}
      {showHamburgerMenu && (
        <div 
          className="fixed inset-0 bg-transparent backdrop-blur-sm z-30"
          onClick={closeHamburgerMenu}
        >
          {/* Menu Panel */}
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header with Wallet Connection */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={closeHamburgerMenu}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Wallet Connection Section */}
              <div className="flex flex-col gap-2">
                {isConnected && address ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-800">
                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleDisconnect();
                        closeHamburgerMenu();
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleConnect();
                      closeHamburgerMenu();
                    }}
                    className="w-full px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="p-4">
              {navigationItems.map((item) => (
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeHamburgerMenu}
                    className="flex items-center gap-4 p-4 rounded-lg mb-2 transition-colors text-gray-700 hover:bg-gray-100"
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
                      className="flex-shrink-0"
                    >
                      {item.icon}
                    </svg>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeHamburgerMenu}
                    className={`flex items-center gap-4 p-4 rounded-lg mb-2 transition-colors ${
                      pathname === item.href
                        ? "bg-yellow-100 text-yellow-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
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
                      className="flex-shrink-0"
                    >
                      {item.icon}
                    </svg>
                    <span>{item.label}</span>
                    {pathname === item.href && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full ml-auto"></div>
                    )}
                  </Link>
                )
              ))}

              {/* Create Event Button */}
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  closeHamburgerMenu();
                }}
                className="flex items-center gap-4 p-4 rounded-lg mb-2 w-full text-left text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Create Event</span>
              </button>

              {/* Settings Button - Only for SuperAdmin */}
              {userRole === 'superadmin' && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <Link
                    href="/admin/settings"
                    onClick={closeHamburgerMenu}
                    className={`flex items-center gap-4 p-4 rounded-lg mb-2 transition-colors ${
                      pathname === "/admin/settings"
                        ? "bg-yellow-100 text-yellow-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
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
                      className="flex-shrink-0"
                    >
                      <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 000 2l.08.15a2 2 0 010 2l-.08.15a2 2 0 000 2l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 000-2l-.08-.15a2 2 0 010-2l.08-.15a2 2 0 000-2l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Settings</span>
                    {pathname === "/admin/settings" && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full ml-auto"></div>
                    )}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

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