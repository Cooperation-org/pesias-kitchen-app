"use client";
import React from "react";
import Link from "next/link";
import "../globals.css";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">

          {/* Fixed bottom navigation with shadow effect on horizontal line */}
          <div className="fixed bottom-0 left-0 right-0 z-10">
            {/* Border with shadow effect */}

            {/* Navigation container with increased height */}
            <div className="bg-white py-4">
              <div className="flex justify-around items-end">
                {/* Home button */}

                <Link href="/dashboard" className="flex flex-col items-center w-16">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-gray-500">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

                  </svg>
                  <span className="text-xs text-gray-500">Home</span>
                  <div className="w-1 h-1 bg-gray-900 rounded-full mt-1"></div>
  
                {/* Centered QR Code Button with inset effect */}
                <div className="flex flex-col items-center -mt-10 relative">
                  {/* Recessed area/inset effect */}
                  <div className="absolute -top-5 w-24 h-24 bg-gray-100 rounded-full shadow-inner flex items-center justify-center">
                    {/* QR Code Button in center of recessed area */}
                    <div className="relative">
                      {/* White outer glow/shadow effect */}
                      <div className="absolute -inset-2 bg-white rounded-full blur-md"></div>

                          </svg>
                        </div>
                      </Link>
                    </div>
                  </div>

                  </svg>
                  <span className="text-xs text-gray-500">NFTs</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

    </html>
  );
}
