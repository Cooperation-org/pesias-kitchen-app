'use client';
import React from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { useAuth } from '@/providers/web3Provider';

export default function LoginPage() {
  const { isConnected } = useAccount();
  const { redirectToDashboard } = useAuth();

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected) {
      redirectToDashboard();
    }
  }, [isConnected, redirectToDashboard]);

  return (
    <main className='min-h-screen flex flex-col'>
      <Image
        src="/images/home.svg"
        alt="Background"
        className='w-full z-40 -mt-32'
        width={200}
        height={200}
        priority
      />

      <div className='relative flex-1 flex flex-col px-7'>
        <div className='mb-3'>
          <Link href='/' className='inline-flex items-center text-[#303030]'>
            <ChevronLeft className='' size={28} />
          </Link>
        </div>

        <div className='mb-8'>
          <h1 className='text-2xl pb-2 font-bold text-[#303030]'>Connect Wallet</h1>
          <p className='text-sm text-[#303030]/80'>
            Connect your wallet to access the Global Classrooms application
          </p>
        </div>

        <div className='flex flex-col items-center justify-center space-y-6 flex-1 mb-12'>
          {/* Custom styled ConnectKit button */}
          <div className='w-full'>
            <ConnectKitButton.Custom>
              {({ isConnected, isConnecting, show, hide, address, ensName }) => {
                return (
                  <button
                    onClick={show}
                    className="flex items-center justify-center space-x-2 w-full bg-[#f7c334] text-[#303030] font-medium py-4 rounded-3xl shadow-md hover:bg-[#f5bb20] transition-colors"
                  >
                    {isConnected ? (
                      <div className="flex items-center space-x-2">
                        <span>Connected: {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
                      </div>
                    ) : (
                      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                    )}
                  </button>
                );
              }}
            </ConnectKitButton.Custom>
          </div>
          
          <div className='text-center mt-6'>
            <p className='text-sm text-[#303030]/70'>
              New to crypto wallets?
            </p>
            <a 
              href="https://blog.gooddollar.org/how-to-set-up-your-gooddollar-wallet/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className='text-sm text-[#f7c334]'
            >
              Learn how to set up a GoodDollar wallet
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}