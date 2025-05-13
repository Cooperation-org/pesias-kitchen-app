'use client';
import React, { useEffect, useState, useRef } from 'react';
import { ConnectKitButton } from 'connectkit';
import { useAccount, useSignMessage } from 'wagmi';
import { useAuth } from '@/providers/web3Provider';
import Image from 'next/image';
import { getNonce, verifySignature, storeAuthData } from '@/services/authServices';

export default function LoginPage() {
  const { isConnected, address } = useAccount();
  const { redirectToDashboard } = useAuth();
  const { signMessageAsync } = useSignMessage();
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Use refs to prevent infinite loops
  const hasAttemptedAuth = useRef(false);
  const isProcessing = useRef(false);

  // Handle authentication process
  const authenticate = async () => {
    // Prevent concurrent auth attempts
    if (isProcessing.current || !address) return;
    
    try {
      isProcessing.current = true;
      setAuthLoading(true);
      setAuthError(null);
      
      console.log("Starting authentication for address:", address);
      
      // Step 1: Get nonce from the server
      const nonceResponse = await getNonce(address);
      
      if (nonceResponse.error || !nonceResponse.data) {
        throw new Error(nonceResponse.error || 'Failed to get nonce');
      }
      
      const nonce = nonceResponse.data.nonce;
      console.log("Received nonce from server:", nonce);
      
      // Step 2: Sign the message with the wallet
      const message = `Sign this message to authenticate with Pesia's Kitchen EAT Initiative: ${nonce}`;
      
      try {
        console.log("Requesting signature for message:", message);
        const signature = await signMessageAsync({ message });
        console.log("Obtained signature:", signature.substring(0, 20) + "...");
        
        // Ensure we have all required data before proceeding
        if (!address || !signature) {
          throw new Error("Missing wallet address or signature");
        }
        
        // Step 3: Verify the signature with the server
        console.log("Verifying signature with server", { 
          walletAddress: address, 
          signatureLength: signature.length 
        });
        
        const authResponse = await verifySignature(address, signature);
        
        if (authResponse.error || !authResponse.data) {
          throw new Error(authResponse.error || 'Verification failed');
        }
        
        // Step 4: Store auth data and redirect
        console.log("Authentication successful, storing token");
        storeAuthData(
          authResponse.data.token, 
          authResponse.data.user
        );
        
        // Step 5: Redirect to dashboard
        redirectToDashboard();
      } catch (signError: any) {
        console.error("Error during signing:", signError);
        setAuthError(signError.message || 'Failed to sign message. Please try again.');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
      isProcessing.current = false;
      hasAttemptedAuth.current = true;
    }
  };

  // Effect to handle automatic authentication
  useEffect(() => {
    const checkAndAuthenticate = async () => {
      // Check if we should attempt authentication
      if (
        isConnected && 
        address && 
        !localStorage.getItem('token') && 
        !hasAttemptedAuth.current && 
        !isProcessing.current
      ) {
        await authenticate();
      } else if (isConnected && localStorage.getItem('token')) {
        // If already authenticated, just redirect
        redirectToDashboard();
      }
    };

    checkAndAuthenticate();
    
    // Cleanup function
    return () => {
      // Reset the auth attempt state when component unmounts or dependencies change
      hasAttemptedAuth.current = false;
    };
  }, [isConnected, address, redirectToDashboard]);

  // Handle manual connection/authentication
  const handleConnectClick = (show: () => void) => {
    if (isConnected) {
      // Reset the auth attempt state to allow for another try
      hasAttemptedAuth.current = false;
      authenticate();
    } else {
      // Open wallet connection modal
      show();
    }
  };

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

        {/* Auth Error Message */}
        {authError && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg max-w-md px-6 w-full">
            <p className="text-sm">{authError}</p>
            <button 
              onClick={() => {
                hasAttemptedAuth.current = false; 
                authenticate();
              }}
              className="text-sm font-medium text-red-700 underline mt-1"
            >
              Try again
            </button>
          </div>
        )}

        {/* Connect Wallet button */}
        <div className='w-full max-w-md px-6'>
          <ConnectKitButton.Custom>
            {({ isConnected, isConnecting, show }) => {
              // Determine the button state
              const isLoading = isConnecting || authLoading;
              let buttonText = 'Connect Wallet';
              
              if (isConnected) {
                buttonText = isLoading ? 'Authenticating...' : 'Continue to Dashboard';
              } else if (isConnecting) {
                buttonText = 'Connecting...';
              }
              
              return (
                <button
                onClick={() => handleConnectClick(show ?? (() => {}))}
                  disabled={isLoading}
                  className={`flex items-center justify-center w-full bg-[#f7c334] text-[#303030] font-medium py-4 rounded-3xl shadow-md hover:bg-[#f5bb20] transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#303030]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{buttonText}</span>
                </button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </main>
  );
}