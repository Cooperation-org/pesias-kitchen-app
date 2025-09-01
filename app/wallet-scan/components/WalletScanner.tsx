"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';

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

interface WalletScannerProps {
  qrData: QRData;
  walletAddress: string;
  walletType: 'dynamic' | 'external';
  onReset: () => void;
}

interface ScanResult {
  success: boolean;
  isNewUser?: boolean;
  message?: string;
  user?: {
    id: string;
    walletAddress: string;
    name: string;
    provider: string;
    isAnonymous: boolean;
  };
  activity?: {
    id: string;
    type: string;
    quantity: number;
    rewardAmount: number;
    eventTitle: string;
    timestamp: string;
  };
  event?: {
    id: string;
    title: string;
    location: string;
  };
}

export default function WalletScanner({ qrData, walletAddress, walletType, onReset }: WalletScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanActivity = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/wallet-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          anonymous: walletType === 'dynamic',
          qrData: qrData
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast.success(data.message || 'Activity recorded successfully!');
      } else {
        setError(data.message || 'Failed to record activity');
        toast.error(data.message || 'Failed to record activity');
      }
    } catch (err) {
      console.error('Error recording activity:', err);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Success state
  if (result && result.success) {
    return (
      <div className="space-y-6">
        {/* Success header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Activity Recorded! 🎉
          </h3>
          <p className="text-sm text-gray-600">
            {result.isNewUser ? 'Welcome to Pesia\'s Kitchen!' : 'Welcome back!'}
          </p>
        </div>

        {/* Activity details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Activity Summary</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium text-gray-900">
                {result.activity?.eventTitle || result.event?.title}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-gray-900">
                {result.event?.location || qrData.metadata?.location}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900 capitalize">
                {result.activity?.type || qrData.type}
              </span>
            </div>
            
            {result.activity?.quantity && (
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium text-gray-900">
                  {result.activity.quantity} meals
                </span>
              </div>
            )}
            
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-gray-600">Reward Earned:</span>
              <span className="font-bold text-[#F4cf6A] text-lg">
                +{result.activity?.rewardAmount || qrData.rewardAmount || 0} G$
              </span>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h5 className="font-medium text-gray-900 mb-2">Wallet Information</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium">{result.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Address:</span>
              <span className="font-mono text-xs">
                {result.user?.walletAddress.slice(0, 6)}...{result.user?.walletAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium capitalize">
                {result.user?.isAnonymous ? 'Anonymous' : 'External'} Wallet
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 bg-[#F4cf6A] text-gray-900 rounded-lg font-semibold hover:bg-[#F4cf6A]/90 transition-colors"
          >
            View Dashboard
          </button>
          
          <button 
            onClick={onReset}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Scan Another QR Code
          </button>
        </div>
      </div>
    );
  }

  // Default scanning interface
  return (
    <div className="space-y-6">
      {/* Connected wallet info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-green-900">
              {walletType === 'dynamic' ? 'Anonymous Wallet' : 'External Wallet'} Connected
            </p>
            <p className="text-sm text-green-700 font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ready to scan */}
      <div className="text-center">
        <div className="w-20 h-20 bg-[#F4cf6A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-[#F4cf6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ready to Record Activity
        </h3>
        <p className="text-gray-600 mb-6">
          Click below to record your {qrData.type} activity and earn G$ rewards!
        </p>
      </div>

      {/* Action button */}
      <button
        onClick={handleScanActivity}
        disabled={isProcessing}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
          isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#F4cf6A] text-gray-900 hover:bg-[#F4cf6A]/90 hover:shadow-lg'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            <span>Recording Activity...</span>
          </div>
        ) : (
          `Record ${qrData.type} Activity`
        )}
      </button>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}