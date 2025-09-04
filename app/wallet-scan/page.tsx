"use client";

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load Dynamic SDK to avoid performance impact on main app
const DynamicWalletProvider = dynamic(
  () => import('../wallet-scan/components/DynamicWalletProvider'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center p-8">Loading wallet system...</div>
  }
);

interface QRData {
  eventId: string;
  type: 'volunteer' | 'recipient';
  quantity?: number;
  rewardAmount?: number;
  expiresAt?: string;
  metadata?: {
    location?: string;
    eventTitle?: string;
  };
}

export default function WalletScanPage() {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract QR data from URL parameter (supports both 'qr' and 'data' parameters)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrParam = urlParams.get('qr');
    const dataParam = urlParams.get('data');
    
    // Try 'qr' parameter first (base64 encoded), then 'data' parameter (URL encoded JSON)
    if (qrParam) {
      try {
        const decoded = JSON.parse(atob(qrParam));
        setQrData(decoded);
      } catch (err) {
        console.error('Error parsing base64 QR data:', err);
        setError('Invalid QR code data format');
      }
    } else if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        setQrData(decoded);
      } catch (err) {
        console.error('Error parsing URL-encoded data:', err);
        setError('Invalid QR code data format');
      }
    } else {
      setError('No QR code data found in URL');
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4cf6A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR code data...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="max-w-md mx-auto px-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid QR Code</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#F4cf6A] text-gray-900 rounded-lg hover:bg-[#F4cf6A]/90 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6">
      {/* QR Code Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-[#F4cf6A]/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-[#F4cf6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {qrData.metadata?.eventTitle || 'Food Rescue Event'}
          </h2>
          <p className="text-sm text-gray-600">
            {qrData.metadata?.location || 'Community Location'}
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Activity Type:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {qrData.type}
            </span>
          </div>
          {qrData.quantity && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="text-sm font-medium text-gray-900">
                {qrData.quantity} meals
              </span>
            </div>
          )}
          {qrData.rewardAmount && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reward:</span>
              <span className="text-sm font-medium text-[#F4cf6A]">
                {qrData.rewardAmount} G$
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Provider Component */}
      <Suspense fallback={
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4cf6A]"></div>
        </div>
      }>
        <DynamicWalletProvider qrData={qrData} />
      </Suspense>
    </div>
  );
}