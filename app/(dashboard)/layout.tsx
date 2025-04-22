"use client";
import React from "react";
import Link from "next/link";
import "../globals.css";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="flex flex-col min-h-screen bg-white">
          {/* Header with menu and notifications */}
          <header className="p-4 flex justify-between items-center border-b border-gray-100 fixed w-full bg-white">
            <Dialog.Root>
              {/* Trigger: Hamburger Button */}
              <Dialog.Trigger asChild>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </Dialog.Trigger>

              {/* Portal with Overlay and Drawer */}
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />

                <Dialog.Content className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white z-50 p-6 flex flex-col gap-6 shadow-lg animate-slide-in">
                  {/* Hidden but accessible title */}
                  <Dialog.Title>
                    <VisuallyHidden>Navigation Menu</VisuallyHidden>
                  </Dialog.Title>

                  {/* Close Button */}
                  <Dialog.Close asChild>
                    <button
                      title="close"
                      className="absolute top-4 right-4 text-gray-500 hover:text-black"
                    >
                      <Cross1Icon />
                    </button>
                  </Dialog.Close>

                  {/* Navigation Menu */}
                  <nav className="flex flex-col gap-4 mt-8 font-semibold text-black">
                    <Link href="/dashboard">Home</Link>
                    <Link href="/activities">Activities</Link>
                    <Link href="/rewards">Rewards</Link>
                    <Link href="/nfts">NFTs</Link>
                    <Link href="/profile">Profile</Link>
                  </nav>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <button title="n">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </button>
          </header>

          <main className="flex-1 pb-24 mt-[4rem]">{children}</main>

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
                  <div className="w-1 h-1 bg-gray-900 rounded-full mt-1"></div>
                </Link>

                {/* Activities button */}
                <Link
                  href="/activities"
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
                    className="mb-2 text-gray-500"
                  >
                    <path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                    <path
                      d="M17.657 8.343a7 7 0 1 1-9.9-9.9 7 7 0 0 1 9.9 9.9z"
                      strokeWidth="1.5"
                      strokeDasharray="0.5 3"
                    />
                  </svg>
                  <span className="text-xs text-gray-500">Activities</span>
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
                      <Link
                        href="/scan"
                        className="relative flex items-center justify-center"
                      >
                        <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center z-10 shadow-lg">
                          {/* QR Code SVG */}
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="15"
                              y="15"
                              width="20"
                              height="20"
                              fill="white"
                            />
                            <rect
                              x="40"
                              y="15"
                              width="5"
                              height="20"
                              fill="white"
                            />
                            <rect
                              x="50"
                              y="15"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="60"
                              y="15"
                              width="20"
                              height="20"
                              fill="white"
                            />

                            <rect
                              x="15"
                              y="40"
                              width="5"
                              height="10"
                              fill="white"
                            />
                            <rect
                              x="25"
                              y="40"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="35"
                              y="40"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="45"
                              y="40"
                              width="10"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="60"
                              y="40"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="70"
                              y="40"
                              width="5"
                              height="5"
                              fill="white"
                            />

                            <rect
                              x="15"
                              y="55"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="25"
                              y="55"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="35"
                              y="55"
                              width="10"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="50"
                              y="55"
                              width="10"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="65"
                              y="55"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="75"
                              y="55"
                              width="5"
                              height="5"
                              fill="white"
                            />

                            <rect
                              x="15"
                              y="65"
                              width="20"
                              height="20"
                              fill="white"
                            />
                            <rect
                              x="40"
                              y="65"
                              width="10"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="55"
                              y="65"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="65"
                              y="65"
                              width="15"
                              height="5"
                              fill="white"
                            />

                            <rect
                              x="40"
                              y="75"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="50"
                              y="75"
                              width="15"
                              height="10"
                              fill="white"
                            />
                            <rect
                              x="70"
                              y="75"
                              width="10"
                              height="5"
                              fill="white"
                            />

                            <rect
                              x="40"
                              y="85"
                              width="5"
                              height="5"
                              fill="white"
                            />
                            <rect
                              x="70"
                              y="85"
                              width="5"
                              height="5"
                              fill="white"
                            />
                          </svg>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <span
                    className="text-xs  text-gray-500 mt-16"
                    style={{ visibility: "hidden" }}
                  >
                    Scan
                  </span>
                </div>

                {/* Rewards button */}
                <Link
                  href="/rewards"
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
                    className="mb-2 text-gray-500"
                  >
                    <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">Rewards</span>
                </Link>

                {/* NFTs button */}
                <Link href="/nfts" className="flex flex-col items-center w-16">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-2 text-gray-500"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">NFTs</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
