"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation";
import "../globals.css";
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { motion } from "framer-motion";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  // Direct Reown/Wagmi hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [shouldShowBackButton, setShouldShowBackButton] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");

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
      href: "/dashboard/events",
      label: "Events",
      icon: (
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
      )
    },
    {
      href: "/dashboard/rewards",
      label: "Rewards",
      icon: (
        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      )
    },
    {
      href: "/dashboard/nfts",
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

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  const closeHamburgerMenu = () => {
    setShowHamburgerMenu(false);
  };

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

  // Handlers
  const handleConnect = () => {
    console.log('Connect button clicked'); // Debug log
    open();
  };

  const handleDisconnect = () => {
    console.log('Disconnect button clicked'); // Debug log
    disconnect();
  };

  console.log('Dashboard Layout - Current state:', { isConnected, address }); // Debug log

  return (
    <div className="flex flex-col min-h-screen bg-white">
          {/* Header with hamburger menu, back button (conditional), title, and wallet connection */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center fixed w-full bg-white z-20 border-b border-gray-100 text-gray-800 p-4 shadow-sm"
          >
            {/* Left side with logo, back button and title */}
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

              {shouldShowBackButton && (
                <Link href="/dashboard" className="text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
              <h1 className="text-xl font-bold">{pageTitle}</h1>
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
          </motion.header>

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
                </nav>
              </div>
            </div>
          )}

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
                    className={`mb-2 ${pathname === "/dashboard" ? "text-yellow-400" : "text-gray-500"}`}
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard" ? "text-yellow-400" : "text-gray-500"}`}>Home</span>
                  {pathname === "/dashboard" && (
                    <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
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
                    className={`mb-2 ${pathname === "/dashboard/events" ? "text-yellow-400" : "text-gray-500"}`}
                  >
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                    <path d="M9 13l2 2 4-4" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard/events" ? "text-yellow-400" : "text-gray-500"}`}>Events</span>
                  {pathname === "/dashboard/events" && (
                    <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
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
                          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3 3H8V8H3V3ZM0 11V0H11V5.99976H13V0H17V6H13V10.0002H16V13.0002H14V17H9V13H13V10.9998H11V11H0ZM22 3H27V8H22V3ZM19 11V0H30V11H19ZM8 22H3V27H8V22ZM0 19V30H11V27.0002H15V30H21V27.0002H24V30H29V27H27V24.0002H18V27H15V24.0002H11V19H0ZM27 19V20.9998H30V23.9998H27V21H24V19V18V13H30V19H27ZM21 20H18V24H14V18H17V17V14V13H21V14V17V20ZM7 13H0V17H7V13Z" fill="white" />
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
                    className={`mb-2 ${pathname === "/dashboard/rewards" ? "text-yellow-400" : "text-gray-500"}`}
                  >
                    <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard/rewards" ? "text-yellow-400" : "text-gray-500"}`}>Rewards</span>
                  {pathname === "/dashboard/rewards" && (
                    <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
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
                    className={`mb-2 ${pathname === "/dashboard/nfts" ? "text-yellow-400" : "text-gray-500"}`}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className={`text-xs ${pathname === "/dashboard/nfts" ? "text-yellow-400" : "text-gray-500"}`}>NFTs</span>
                  {pathname === "/dashboard/nfts" && (
                    <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1"></div>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Debug info */}
          {/* <div className="fixed top-20 right-4 bg-black text-white p-2 text-xs rounded opacity-50 z-50">
            Debug: {isConnected ? `Connected: ${address}` : 'Not connected'}
          </div> */}
    </div>
  );
}