"use client"
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CustodialScanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect old custodial scan URLs to new wallet-scan system
    const data = searchParams.get('data');
    if (data) {
      try {
        // Convert old format to new format  
        const qrParam = btoa(data); // Encode for new system
        router.replace(`/wallet-scan?qr=${qrParam}`);
        return;
      } catch (error) {
        console.error('Invalid QR data, redirecting to wallet-scan anyway');
        router.replace(`/wallet-scan`);
      }
    } else {
      // No data parameter, redirect to wallet-scan home
      router.replace(`/wallet-scan`);
    }
  }, [searchParams, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4cf6A] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to new wallet system...</p>
      </div>
    </div>
  );
}