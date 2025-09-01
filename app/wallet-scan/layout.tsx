"use client";

import React from 'react';
import '../globals.css';
import Image from 'next/image';

interface WalletScanLayoutProps {
  children: React.ReactNode;
}

export default function WalletScanLayout({
  children,
}: WalletScanLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple header for wallet scan pages */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
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
      </header>

      {/* Main content */}
      <main className="flex-1 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            Pesia's Kitchen EAT Initiative - Food Rescue with Blockchain Rewards
          </p>
        </div>
      </footer>
    </div>
  );
}