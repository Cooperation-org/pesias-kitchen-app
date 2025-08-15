'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/web3Provider';

type PageParams = {
  id: string;
};
    
export default function NFTDetails({ 
  params }: { 
  params: PageParams 
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    // Redirect to the NFT gallery and let the modal handle the details view
    // We'll append the NFT ID as a query parameter that the gallery can use to open the modal
    router.replace(`/dashboard/nfts?open=${params.id}`);
  }, [isAuthenticated, router, params.id]);

  // Show a loading state while redirecting
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading NFT details...</p>
      </div>
    </div>
  );
} 