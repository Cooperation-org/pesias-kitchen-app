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
    <div className="h-full flex flex-col">
      {/* Page Content */}
      <div className="flex-1">{children}</div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white py-4 shadow-lg">
        <div className="flex justify-around items-end">
          {/* Home button */}
          <Link href="/dashboard" className="flex flex-col items-center w-16">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2 text-gray-500"
            >
              <path
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs text-gray-500">Home</span>
          </Link>

          {/* Center Button (Example: QR Code) */}
          <div className="flex flex-col items-center -mt-10 relative">
            <div className="absolute -top-5 w-24 h-24 bg-gray-100 rounded-full shadow-inner flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-white rounded-full blur-md"></div>
                {/* Your QR Icon can go here */}
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-500 relative z-10"
                >
                  <path
                    d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h2v2h-2v-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* NFTs Button */}
          <Link href="/nfts" className="flex flex-col items-center w-16">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2 text-gray-500"
            >
              <path
                d="M12 2l4 4-4 4-4-4 4-4zm0 12l4 4-4 4-4-4 4-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs text-gray-500">NFTs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
