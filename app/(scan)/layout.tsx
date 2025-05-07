"use client"
import React from "react"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
    <body className="h-full">
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main content area with increased bottom padding to accommodate taller navbar */}
      <main className="flex-1 pb-24">
        {children}
      </main>
    </div>
    </body>
    </html>
  )
}