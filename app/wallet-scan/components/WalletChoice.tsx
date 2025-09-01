"use client";

import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAccount, useConnect } from 'wagmi';
import WalletScanner from './WalletScanner';

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

interface WalletChoiceProps {
  qrData: QRData;
}

export default function WalletChoice({ qrData }: WalletChoiceProps) {
  const [selectedWalletType, setSelectedWalletType] = useState<'dynamic' | 'external' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Dynamic SDK hooks
  const { primaryWallet, user, setShowAuthFlow } = useDynamicContext();
  
  // Wagmi hooks for external wallets (existing implementation)
  const { address: externalAddress, isConnected: isExternalConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Check for existing Dynamic wallet on component mount
  useEffect(() => {
    if (primaryWallet && user) {
      setWalletAddress(primaryWallet.address);
      setSelectedWalletType('dynamic');
    } else if (isExternalConnected && externalAddress) {
      setWalletAddress(externalAddress);
      setSelectedWalletType('external');
    }
  }, [primaryWallet, user, isExternalConnected, externalAddress]);

  // Handle anonymous wallet creation
  const handleAnonymousWallet = async () => {
    setIsConnecting(true);
    try {
      setShowAuthFlow(true);
      
      // Wait for Dynamic SDK to handle the authentication
      // The useEffect above will catch the successful connection
    } catch (error) {
      console.error('Error creating anonymous wallet:', error);
      setIsConnecting(false);
    }
  };

  // Handle external wallet connection  
  const handleExternalWallet = async () => {
    setIsConnecting(true);
    try {
      const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector });
      } else {
        // Fallback to first available connector
        await connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Error connecting external wallet:', error);
      setIsConnecting(false);
    }
  };

  // Reset wallet selection
  const handleResetWallet = () => {
    setSelectedWalletType(null);
    setWalletAddress(null);
    setIsConnecting(false);
  };

  // If wallet is connected, show scanner
  if (walletAddress && selectedWalletType) {
    return (
      <WalletScanner
        qrData={qrData}
        walletAddress={walletAddress}
        walletType={selectedWalletType}
        onReset={handleResetWallet}
      />
    );
  }

  // Show wallet choice interface
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your Wallet
        </h3>
        <p className="text-sm text-gray-600">
          How would you like to participate in this food rescue activity?
        </p>
      </div>

      {/* Anonymous Wallet Option */}
      <button
        onClick={handleAnonymousWallet}
        disabled={isConnecting}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
          isConnecting 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-200 bg-white hover:border-[#F4cf6A] hover:bg-[#F4cf6A]/5'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[#F4cf6A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[#F4cf6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">🔒 Anonymous Wallet</h4>
            <p className="text-sm text-gray-600 mb-2">
              Quick & private - no sign-up required
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Face ID/Touch ID security
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No personal data required
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Instant wallet creation
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* External Wallet Option */}
      <button
        onClick={handleExternalWallet}
        disabled={isConnecting}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
          isConnecting 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-200 bg-white hover:border-[#F4cf6A] hover:bg-[#F4cf6A]/5'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">💰 Your Wallet</h4>
            <p className="text-sm text-gray-600 mb-2">
              Use your existing MetaMask or other wallet
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Full control of your funds
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Works on any device
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Compatible with all wallets
              </div>
            </div>
          </div>
        </div>
      </button>

      {isConnecting && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F4cf6A] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Connecting wallet...</p>
        </div>
      )}

      {/* Help text */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-gray-700 font-medium mb-1">First time here?</p>
            <p className="text-gray-600">
              Choose "Anonymous Wallet" for quick access. Your rewards will be secured with your device's Face ID, Touch ID, or PIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}