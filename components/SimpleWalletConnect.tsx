'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useState } from 'react';

interface SimpleWalletConnectProps {
  onConnected: (walletAddress: string) => void;
  onError?: (error: string) => void;
}

export default function SimpleWalletConnect({ 
  onConnected, 
  onError 
}: SimpleWalletConnectProps) {
  const { 
    user, 
    isAuthenticated, 
    setShowAuthFlow,
    handleLogOut 
  } = useDynamicContext();
  
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setShowAuthFlow(true);
    } catch (error) {
      console.error('Connection error:', error);
      onError?.('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // If already connected, show wallet info
  if (isAuthenticated && user?.walletPublicKey) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-medium">Wallet Connected</span>
        </div>
        
        <div className="text-sm text-green-700">
          <span className="font-mono">
            {user.walletPublicKey.slice(0, 6)}...{user.walletPublicKey.slice(-4)}
          </span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onConnected(user.walletPublicKey)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Continue with this wallet
          </button>
          
          <button
            onClick={handleLogOut}
            className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            Switch
          </button>
        </div>
      </div>
    );
  }

  // Show connection button
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Create Secure Wallet
        </h3>
        <p className="text-sm text-gray-600">
          Tap below to create your secure wallet using Face ID, Touch ID, or PIN
        </p>
      </div>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating wallet...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>Create Secure Wallet</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500">
        No personal information required • Your keys stay on your device
      </p>
    </div>
  );
}