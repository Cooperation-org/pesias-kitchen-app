'use client';
import React, { useEffect } from 'react';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { useAuth } from '@/providers/web3Provider';
import Image from 'next/image';

export default function LoginPage() {
  const { isConnected } = useAccount();
  const { redirectToDashboard } = useAuth();

  // Handle redirection when wallet is connected
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    
    if (isConnected) {
      // Use a very short timeout to ensure any UI updates complete first
      redirectTimer = setTimeout(() => {
        redirectToDashboard();
      }, 100);
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isConnected, redirectToDashboard]);

  return (
    <main className='h-screen flex flex-col'>
      {/* Top half with background and images */}
      <div className='h-1/2 relative overflow-hidden'>
        {/* Yellow background with curved bottom */}
        <div className='absolute inset-0 bg-[#f7c334]'></div>
        <div className='absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-[50%]'></div>
        
        {/* Cloud image taking full width, positioned a bit lower */}
        <div className='absolute inset-0 flex items-end justify-center pb-12'>
          <Image
            src='/images/cloud.svg'
            alt='Cloud background'
            className='w-full'
            width={400}
            height={200}
            priority
          />
        </div>
        
        {/* Phone illustration positioned over cloud */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <Image
            src='/images/phone.svg'
            alt='Phone with QR code'
            className='w-3/5 max-w-xs'
            width={200}
            height={180}
            priority
          />
        </div>
      </div>
      
      {/* Bottom half with content */}
      <div className='h-1/2 bg-white flex flex-col items-center justify-start pt-6'>
        {/* Welcome text */}
        <div className='text-center mb-8 px-6'>
          <h1 className='text-2xl font-bold text-[#303030] mb-2'>Welcome to</h1>
          <h2 className='text-xl font-bold text-[#303030] mb-1'>Pesia's Kitchen EAT Initiative</h2>
          <p className='text-sm text-[#303030]/70 max-w-xs mx-auto'>
            Rescuing food, helping communities, and making a real impact
          </p>
        </div>

        {/* Connect Wallet button */}
        <div className='w-full max-w-md px-6'>
          <ConnectKitButton.Custom>
            {({ isConnected, isConnecting, show }) => {
              return (
                <button
                  onClick={show}
                  className="flex items-center justify-center w-full bg-[#f7c334] text-[#303030] font-medium py-4 rounded-3xl shadow-md hover:bg-[#f5bb20] transition-colors"
                >
                  {isConnected ? (
                    <span>Continue to Dashboard</span>
                  ) : (
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  )}
                </button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </main>
  );
}