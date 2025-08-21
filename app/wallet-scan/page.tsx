"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import WalletChoice from '@/components/WalletChoice';

export default function QuickJoinPage() {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<unknown>(null);
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<unknown>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, isAuthenticated } = useDynamicContext();

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setQrData(decoded);
      } catch {
        console.error('Invalid QR data');
      }
    }
  }, [searchParams]);

  // Auto-submit when wallet is connected
  useEffect(() => {
    if (walletAddress && qrData && !success && !loading) {
      handleSubmitWithWallet(walletAddress);
    }
  }, [walletAddress, qrData, success, loading]);

  const handleWalletConnected = (address: string, isAnonymous: boolean) => {
    setWalletAddress(address);
    sessionStorage.setItem('walletType', isAnonymous ? 'anonymous' : 'external');
  };

  const handleSubmitWithWallet = async (address: string) => {
    setLoading(true);

    try {
      const walletType = sessionStorage.getItem('walletType') || 'anonymous';
      const isAnonymous = walletType === 'anonymous';
      
      const response = await fetch('/api/proxy/wallet-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: address,
          qrData: qrData,
          anonymous: isAnonymous
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        setUserInfo(result);
        
        sessionStorage.setItem('walletAddress', address);
        sessionStorage.setItem('lastActivity', JSON.stringify(result.activity));
      } else {
        alert(`Oops! ${result.message || 'Something went wrong. Please try again.'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Unable to connect. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToApp = () => {
    router.push('/dashboard');
  };

  const handleBackToHome = () => {
    window.location.href = 'https://pesiaskitchen.org';
  };

  if (!qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4cf6A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4cf6A]/10 to-white p-4">
        <div className="max-w-md mx-auto mt-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#F4cf6A]/20 rounded-full p-4 animate-bounce">
              <CheckCircleIcon className="w-16 h-16 text-[#F4cf6A]" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-center mb-4 text-black">
            🎉 Amazing!
          </h1>
          <p className="text-center text-gray-600 mb-2 text-lg">
            You&apos;re all set and ready to go!
          </p>
          <p className="text-center text-gray-600 mb-8">
            Thank you for fighting food waste and helping our community!
          </p>

          {/* Reward Display */}
          {userInfo?.activity?.rewardAmount && (
            <div className="bg-gradient-to-r from-[#F4cf6A]/20 to-[#F4cf6A]/10 border border-[#F4cf6A]/30 rounded-xl p-6 mb-6 text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-bold text-xl text-black">You Earned Rewards!</h3>
              <p className="text-2xl font-bold text-black">
                {userInfo.activity.rewardAmount} G$
              </p>
              <p className="text-sm text-gray-600 mt-2">These will appear in your account</p>
            </div>
          )}

          {/* Event Details */}
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold mb-4 text-black">Event Summary:</h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-medium text-black">Activity:</span> {qrData.type}
              </p>
              <p className="text-gray-600">
                <span className="font-medium text-black">Your ID:</span> {walletAddress?.substring(0, 8)}...{walletAddress?.substring(-4)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium text-black">When:</span> {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinueToApp}
              className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              View My Activities 📊
            </button>
            
            <button
              onClick={handleBackToHome}
              className="w-full bg-white text-gray-700 border-2 border-gray-300 p-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Pesia&apos;s Kitchen 🏠
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Loading state while processing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4cf6A]/10 to-white p-4">
        <div className="max-w-md mx-auto mt-8">
          <div className="text-center">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#F4cf6A] border-t-transparent mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-black mb-2">
                Recording Your Activity...
              </h2>
              <p className="text-gray-600">
                Setting up your secure account and tracking your contribution
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main flow - wallet connection
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4cf6A]/10 to-white p-4">
      <div className="max-w-md mx-auto mt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black">Pesia&apos;s Kitchen</h1>
          <p className="text-gray-600 mt-2">Fighting Food Waste Together</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4 text-black">Join This Event</h2>
          
          <div className="bg-gradient-to-r from-[#F4cf6A]/20 to-[#F4cf6A]/10 border border-[#F4cf6A]/30 rounded-xl p-4 mb-6">
            <p className="text-black font-semibold">
              Activity: {qrData.type}
            </p>
          </div>

          <WalletChoice 
            onWalletConnected={handleWalletConnected}
            onError={(error) => {
              console.error('Connection error:', error);
              alert(error);
            }}
          />
        </div>

      </div>
    </div>
  );
}