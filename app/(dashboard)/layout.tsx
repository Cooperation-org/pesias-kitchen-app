"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation";
import "../globals.css";
import { ConnectKitButton } from "connectkit";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [shouldShowBackButton, setShouldShowBackButton] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  
  // Determine if we should show back button based on current route
  useEffect(() => {
    // If the path is exactly /dashboard, don't show back button
    const isExactDashboard = pathname === "/dashboard";
    setShouldShowBackButton(!isExactDashboard);
    
    // Set page title based on route
    if (pathname.includes("/activities")) {
      setPageTitle("Activities");
    } else if (pathname.includes("/events")) {
      setPageTitle("Events");
    } else if (pathname.includes("/rewards")) {
      setPageTitle("Rewards");
    } else if (pathname.includes("/nfts")) {
      setPageTitle("My NFTs");
    } else if (pathname.includes("/scan")) {
      setPageTitle("Scan QR");
    } else {
      setPageTitle("Dashboard");
    }
  }, [pathname]);

  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="flex flex-col min-h-screen bg-white">
          {/* Header with back button (conditional), title, wallet connection, and notifications */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center fixed w-full bg-white z-20 bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 shadow-md"
          >
            {/* Left side with back button and title */}
            <div className="flex items-center gap-2">
              {shouldShowBackButton && (
                <Link href="/dashboard" className="text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
              <h1 className="text-xl font-bold">{pageTitle}</h1>
            </div>
            
            {/* Right side with wallet connection */}
            <div className="flex items-center gap-4">
              {/* Wallet Connection Button */}
              <ConnectKitButton.Custom>
                {({ isConnected, isConnecting, show, address, ensName }) => {
                  return (
                    <button
                      onClick={show}
                      className="flex items-center text-sm font-medium"
                    >
                      {isConnected ? (
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-800">
                          {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-400 text-gray-800 rounded-full">
                          {isConnecting ? 'Connecting...' : 'Connect'}
                        </span>
                      )}
                    </button>
                  );
                }}
              </ConnectKitButton.Custom>
            </div>
          </motion.header>

          <main className="flex-1 pb-24 mt-[4rem]">
            {children}
          </main>

          {/* Fixed bottom navigation with shadow effect on horizontal line */}
          <div className="fixed bottom-0 left-0 right-0 z-10">
            {/* Border with shadow effect */}
            <div className="h-px w-full bg-gradient-to-b from-gray-200 to-transparent shadow-sm"></div>

            {/* Navigation container with increased height */}
            <div className="bg-white py-4">
              <div className="flex justify-around items-end">
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
                    className={`mb-2 ${pathname === "/dashboard" ? "text-blue-500" : "text-gray-500"}`}
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard" ? "text-blue-500" : "text-gray-500"}`}>Home</span>
                  {pathname === "/dashboard" && (
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </Link>

                {/* Activities button */}
                <Link 
                  href="/dashboard/events" 
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
                    className={`mb-2 ${pathname === "/dashboard/events" ? "text-blue-500" : "text-gray-500"}`}
                  >
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                    <path d="M9 13l2 2 4-4" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard/events" ? "text-blue-500" : "text-gray-500"}`}>Events</span>
                  {pathname === "/dashboard/events" && (
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </Link>

                {/* Centered QR Code Button with inset effect */}
                <div className="flex flex-col items-center -mt-10 relative">
                  {/* Recessed area/inset effect */}
                  <div className="absolute -top-5 w-24 h-24 bg-gray-100 rounded-full shadow-inner flex items-center justify-center">
                    {/* QR Code Button in center of recessed area */}
                    <div className="relative">
                      {/* White outer glow/shadow effect */}
                      <div className="absolute -inset-2 bg-white rounded-full blur-md"></div>

                      {/* Yellow circle with QR code */}
                      <Link href="/scan" className="relative flex items-center justify-center">
                        <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center z-10 shadow-lg">
                          {/* QR Code SVG */}
                          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="15" y="15" width="20" height="20" fill="white" />
                            <rect x="40" y="15" width="5" height="20" fill="white" />
                            <rect x="50" y="15" width="5" height="5" fill="white" />
                            <rect x="60" y="15" width="20" height="20" fill="white" />

                            <rect x="15" y="40" width="5" height="10" fill="white" />
                            <rect x="25" y="40" width="5" height="5" fill="white" />
                            <rect x="35" y="40" width="5" height="5" fill="white" />
                            <rect x="45" y="40" width="10" height="5" fill="white" />
                            <rect x="60" y="40" width="5" height="5" fill="white" />
                            <rect x="70" y="40" width="5" height="5" fill="white" />

                            <rect x="15" y="55" width="5" height="5" fill="white" />
                            <rect x="25" y="55" width="5" height="5" fill="white" />
                            <rect x="35" y="55" width="10" height="5" fill="white" />
                            <rect x="50" y="55" width="10" height="5" fill="white" />
                            <rect x="65" y="55" width="5" height="5" fill="white" />
                            <rect x="75" y="55" width="5" height="5" fill="white" />

                            <rect x="15" y="65" width="20" height="20" fill="white" />
                            <rect x="40" y="65" width="10" height="5" fill="white" />
                            <rect x="55" y="65" width="5" height="5" fill="white" />
                            <rect x="65" y="65" width="15" height="5" fill="white" />

                            <rect x="40" y="75" width="5" height="5" fill="white" />
                            <rect x="50" y="75" width="15" height="10" fill="white" />
                            <rect x="70" y="75" width="10" height="5" fill="white" />

                            <rect x="40" y="85" width="5" height="5" fill="white" />
                            <rect x="70" y="85" width="5" height="5" fill="white" />
                          </svg>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <span className="text-xs text-gray-500 mt-16" style={{ visibility: 'hidden' }}>Scan</span>
                </div>

                {/* Rewards button */}
                <Link 
                  href="/dashboard/rewards" 
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
                    className={`mb-2 ${pathname === "/dashboard/rewards" ? "text-blue-500" : "text-gray-500"}`}
                  >
                    <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard/rewards" ? "text-blue-500" : "text-gray-500"}`}>Rewards</span>
                  {pathname === "/dashboard/rewards" && (
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </Link>

                {/* NFTs button */}
                <Link 
                  href="/dashboard/nfts" 
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
                    className={`mb-2 ${pathname === "/dashboard/nfts" ? "text-blue-500" : "text-gray-500"}`}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard/nfts" ? "text-blue-500" : "text-gray-500"}`}>NFTs</span>
                  {pathname === "/dashboard/nfts" && (
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}