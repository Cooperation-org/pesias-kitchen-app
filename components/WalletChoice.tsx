'use client';

import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
// import { injected } from 'wagmi/connectors';

interface WalletChoiceProps {
  onWalletConnected: (walletAddress: string, isAnonymous: boolean) => void;
  onError?: (error: string) => void;
}

export default function WalletChoice({ onWalletConnected, onError }: WalletChoiceProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedType, setSelectedType] = useState<'anonymous' | 'external' | null>(null);

  // Dynamic (anonymous) wallet
  const { 
    user: dynamicUser, 
    isAuthenticated: isDynamicAuthenticated, 
    setShowAuthFlow,
    handleLogOut: dynamicLogout 
  } = useDynamicContext();

  // External wallet (MetaMask, etc.)
  const { address: externalAddress, isConnected: isExternalConnected } = useAccount();
  const { connect: connectExternal, connectors } = useConnect();
  const { disconnect: disconnectExternal } = useDisconnect();

  const handleMainWallet = async () => {
    try {
      setIsConnecting(true);
      setSelectedType('external');
      
      const connector = connectors.find(c => c.id === 'injected') || connectors[0];
      if (connector) {
        connectExternal({ connector });
      } else {
        throw new Error('No wallet connector found');
      }
    } catch (error) {
      console.error('Main wallet error:', error);
      onError?.('Please install a wallet app first, then try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQuickStart = async () => {
    try {
      setIsConnecting(true);
      setSelectedType('anonymous');
      setShowAuthFlow(true);
    } catch (error) {
      console.error('Quick start error:', error);
      onError?.('Unable to start. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle successful connections
  if (isDynamicAuthenticated && dynamicUser?.walletPublicKey && selectedType === 'anonymous') {
    return (
      <div className="bg-[#F4cf6A]/10 border border-[#F4cf6A]/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-[#F4cf6A] rounded-full"></div>
          <span className="text-black font-semibold">Ready to go!</span>
        </div>
        
        <div className="text-sm text-gray-700">
          <span className="font-mono bg-white px-2 py-1 rounded">
            {dynamicUser.walletPublicKey.slice(0, 6)}...{dynamicUser.walletPublicKey.slice(-4)}
          </span>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => onWalletConnected(dynamicUser.walletPublicKey, true)}
            className="flex-1 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
          >
            Start Volunteering
          </button>
          
          <button
            onClick={() => {
              dynamicLogout();
              setSelectedType(null);
            }}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (isExternalConnected && externalAddress && selectedType === 'external') {
    return (
      <div className="bg-[#F4cf6A]/10 border border-[#F4cf6A]/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-[#F4cf6A] rounded-full"></div>
          <span className="text-black font-semibold">Wallet connected!</span>
        </div>
        
        <div className="text-sm text-gray-700">
          <span className="font-mono bg-white px-2 py-1 rounded">
            {externalAddress.slice(0, 6)}...{externalAddress.slice(-4)}
          </span>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => onWalletConnected(externalAddress, false)}
            className="flex-1 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
          >
            Continue
          </button>
          
          <button
            onClick={() => {
              disconnectExternal();
              setSelectedType(null);
            }}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // Show wallet choice
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-black mb-3">
          Join the Movement
        </h3>
        <p className="text-gray-600">
          Start volunteering and earning rewards
        </p>
      </div>

      {/* Main Wallet Option - First and Primary */}
      <div className="bg-gradient-to-br from-[#F4cf6A]/20 to-[#F4cf6A]/10 border-2 border-[#F4cf6A] rounded-xl p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-black mb-2">Use My Wallet</h4>
            <p className="text-gray-700">
              Connect your existing wallet app
            </p>
          </div>
        </div>
        
        <button
          onClick={handleMainWallet}
          disabled={isConnecting && selectedType === 'external'}
          className="w-full bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition-colors font-bold text-lg disabled:opacity-50"
        >
          {isConnecting && selectedType === 'external' ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-gray-500 text-sm">or</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Quick Start Option - Secondary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-10 h-10 bg-[#F4cf6A] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-black mb-2">Quick Start</h4>
            <p className="text-gray-700">
              Connect using device
            </p>
          </div>
        </div>
        
        <button
          onClick={handleQuickStart}
          disabled={isConnecting && selectedType === 'anonymous'}
          className="w-full bg-[#F4cf6A] text-black px-6 py-4 rounded-xl hover:bg-[#F4cf6A]/80 transition-colors font-semibold disabled:opacity-50"
        >
          {isConnecting && selectedType === 'anonymous' ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Setting up...</span>
            </span>
          ) : (
            'Quick Start'
          )}
        </button>
      </div>

    </div>
  );
}