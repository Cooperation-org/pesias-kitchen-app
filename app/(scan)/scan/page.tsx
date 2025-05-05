"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QrReader } from "react-qr-reader"
import Link from "next/link"
import { verifyQRCode, verifyQRAndMintNFT } from "@/services/api"

// Scanner result type definition
interface ScanResult {
  id: string;
  activity?: {
    id: string;
    type: string;
    quantity: number;
    notes?: string;
  };
  nft?: {
    nftId: string;
    txHash: string;
    rewardAmount: number | string;
  };
  event: {
    title: string;
    activityType: string;
    location: string;
  };
  timestamp: number;
}

export default function ScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  
  // Create a ref to track the last scanned code to prevent duplicates
  const lastScannedCode = useRef<string>("")
  // Create a ref to track the error timeout
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Default quantity - this could be configurable in the UI
  const defaultQuantity = 1
  
  const handleScan = async (result: any) => {
    // If we're already processing, scanning is off, or there's no result, ignore
    if (!result || isProcessing || !isScanning) return;
    
    // Get the QR code text
    const qrCodeText = result?.text;
    
    // Prevent duplicate scans of the same QR code in rapid succession
    if (qrCodeText === lastScannedCode.current) return;
    
    // Update the last scanned code
    lastScannedCode.current = qrCodeText;
    
    // Start processing
    setIsProcessing(true)
    setIsScanning(false)

    try {
      try {
        // First attempt to use the verify-and-mint endpoint
        const response = await verifyQRAndMintNFT(
          qrCodeText, 
          defaultQuantity, 
          "Scanned via mobile app"
        );
        
        // Process the verification and mint response
        const verificationResult = response.data;
        
        // Create a scan result object with data from the response
        const scanData: ScanResult = {
          id: verificationResult.activity?._id || verificationResult.activity?.id || '',
          activity: verificationResult.activity ? {
            id: verificationResult.activity._id || verificationResult.activity.id || '',
            type: verificationResult.activity.type || 'event',
            quantity: verificationResult.activity.quantity || defaultQuantity,
            notes: verificationResult.activity.notes || '',
          } : undefined,
          nft: verificationResult.nft ? {
            nftId: verificationResult.nft.nftId || '',
            txHash: verificationResult.nft.txHash || '',
            rewardAmount: verificationResult.nft.rewardAmount || '~',
          } : undefined,
          event: {
            title: verificationResult.event.title || '',
            activityType: verificationResult.event.activityType || '',
            location: verificationResult.event.location || '',
          },
          timestamp: Date.now(),
        };
        
        setScanResult(scanData);
        
        // Store scan result in localStorage to retrieve in dashboard
        localStorage.setItem('lastScanResult', JSON.stringify(scanData));
        localStorage.setItem('showScanPopup', 'true');
        
      } catch (mintError) {
        console.error("Error in verify-and-mint, falling back to basic verify:", mintError);
        
        // If verify-and-mint fails, fall back to regular verify
        const verifyResponse = await verifyQRCode(qrCodeText);
        const verifyResult = verifyResponse.data;
        
        // Create a simpler scan result from just verification
        const basicScanData: ScanResult = {
          id: verifyResult.qrCode?.id || '',
          event: {
            title: verifyResult.qrCode?.event?.title || '',
            activityType: verifyResult.qrCode?.event?.activityType || '',
            location: verifyResult.qrCode?.event?.location || '',
          },
          timestamp: Date.now(),
        };
        
        setScanResult(basicScanData);
        
        // Store basic scan result
        localStorage.setItem('lastScanResult', JSON.stringify(basicScanData));
        localStorage.setItem('showScanPopup', 'true');
      }
      
      // Short timeout for visual feedback before redirecting
      setTimeout(() => {
        // Directly navigate back to dashboard
        router.push('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error("Error processing scan:", err);
      
      // Extract error message from the response if available
      const errorMsg = err.response?.data?.message || 
                      "Failed to verify QR code. Please try again.";
                      
      // Set the error message
      setErrorMessage(errorMsg);
      
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      // Set a new timeout to clear the error and reset scanning
      errorTimeoutRef.current = setTimeout(() => {
        setErrorMessage("");
        setIsProcessing(false);
        setIsScanning(true);
        // Also reset the last scanned code
        lastScannedCode.current = "";
      }, 3000);
    }
  };

  // Handle errors from scanner
  const handleError = (error: any) => {
    console.error("QR Scanner error:", error);
    
    // Don't show camera error if we already have a different error message
    if (!errorMessage) {
      setErrorMessage("Error accessing camera. Please check permissions and try again.");
      
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      // Set a new timeout to clear the error
      errorTimeoutRef.current = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col relative">
      {/* Fullscreen camera view */}
      <div className="relative flex-1 w-full h-full">
        {isScanning && (
          <>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              onError={handleError}
              scanDelay={1000} // Increased delay to reduce CPU usage & flickering
              videoStyle={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover'
              }}
              videoContainerStyle={{ 
                width: '100%', 
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              videoId="qr-reader-video"
            />
            
            {/* Back button */}
            <div className="absolute top-4 left-4 z-10">
              <Link 
                href="/dashboard" 
                className="bg-white/20 backdrop-blur-md rounded-full p-3 text-white flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Link>
            </div>
            
            {/* Scan frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/70 rounded-lg">
                {/* Corner markers */}
                <div className="absolute w-5 h-5 border-t-2 border-l-2 border-white/70 top-0 left-0"></div>
                <div className="absolute w-5 h-5 border-t-2 border-r-2 border-white/70 top-0 right-0"></div>
                <div className="absolute w-5 h-5 border-b-2 border-l-2 border-white/70 bottom-0 left-0"></div>
                <div className="absolute w-5 h-5 border-b-2 border-r-2 border-white/70 bottom-0 right-0"></div>
              </div>
            </div>
            
            {/* Scanning indicator text */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center">
              <div className="bg-black/50 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
                Scanning for QR code...
              </div>
            </div>
          </>
        )}
        
        {!isScanning && scanResult && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6">
            {/* Success animation */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Success!</h2>
            
            {scanResult.activity && scanResult.nft ? (
              <p className="text-center text-gray-600 mb-2">
                Activity recorded and NFT minted!
              </p>
            ) : (
              <p className="text-center text-gray-600 mb-2">
                QR code verified successfully!
              </p>
            )}
            
            {scanResult.event.title && (
              <p className="text-center text-gray-700 mb-2 font-medium">
                {scanResult.event.title}
              </p>
            )}
            
            {scanResult.nft?.rewardAmount && (
              <div className="flex gap-2 items-center justify-center mb-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  +{scanResult.nft.rewardAmount} points
                </span>
              </div>
            )}
            
            {scanResult.activity?.quantity && scanResult.activity.quantity > 0 && (
              <p className="text-center text-gray-600 mb-6">
                Quantity: {scanResult.activity.quantity}
              </p>
            )}
            
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message - fixed positioning to prevent layout shifts */}
      {errorMessage && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50">
          {errorMessage}
        </div>
      )}
    </div>
  )
}