"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QrReader } from "react-qr-reader"
import Link from "next/link"
import { verifyQRCode, recordActivity, mintActivityNFT } from "@/services/api"

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
    nftId?: string;
    txHash?: string;
    rewardAmount: number | string;
    nftTokenId?: string;
  };
  event: {
    title: string;
    activityType: string;
    location: string;
  };
  timestamp: number;
}

// Define processing status stages
type ProcessingStage = 'verifying' | 'recording' | 'minting' | 'complete';

interface ProcessingStatus {
  stage: ProcessingStage;
  message: string;
  progress: number;
}

export default function ScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null)
  
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
      // Step 1: Verify QR Code
      setProcessingStatus({
        stage: 'verifying',
        message: 'Verifying QR code...',
        progress: 33
      });
      
      const verifyResponse = await verifyQRCode(qrCodeText);
      const verifyResult = verifyResponse.data;
      
      // Parse event info from verification
      const eventData = verifyResult.qrCode?.event || {};
      const qrCodeId = verifyResult.qrCode?.id;
      
      // Step 2: Record Activity 
      setProcessingStatus({
        stage: 'recording',
        message: 'Recording activity...',
        progress: 66
      });
      
      let activityResult = null;
      let activityId = null;

      console.log(verifyResult.qrCode, 'letscheck ')
      
      // If no activityId, create a new activity based on QR data
      const activityData = {
        eventId: eventData.id,
        qrCodeId: qrCodeId,
        quantity: eventData.defaultQuantity || defaultQuantity,
        notes: "Scanned via mobile app"
      };
      
      const recordResponse = await recordActivity(activityData);
      activityResult = recordResponse.data.activity; // The response contains activity in a message object
      activityId = activityResult._id || activityResult.id;
      
      // Step 3: Mint NFT
      setProcessingStatus({
        stage: 'minting',
        message: 'Minting NFT...',
        progress: 99
      });
      
      const mintResponse = await mintActivityNFT(activityId);
      const mintResult = mintResponse.data;
      
      // Create a scan result object with all the data
      const scanData: ScanResult = {
        id: activityId,
        activity: {
          id: activityId,
          type: activityResult?.type || verifyResult.qrCode?.type || 'event',
          quantity: activityResult?.rewardAmount || verifyResult.qrCode?.rewardAmount || defaultQuantity,
          notes: activityResult?.description || '',
        },
        nft: {
          nftId: mintResult.nftTokenId,
          txHash: null, // Not returned in our API
          rewardAmount: mintResult.rewardAmount || verifyResult.qrCode?.rewardAmount || '~',
          nftTokenId: mintResult.nftTokenId,
        },
        event: {
          title: eventData.title || '',
          activityType: eventData.activityType || '',
          location: eventData.location || '',
        },
        timestamp: Date.now(),
      };
      
      // Mark as complete
      setProcessingStatus({
        stage: 'complete',
        message: 'Success!',
        progress: 100
      });
      
      setScanResult(scanData);
      
      // Store scan result in localStorage to retrieve in dashboard
      localStorage.setItem('lastScanResult', JSON.stringify(scanData));
      localStorage.setItem('showScanPopup', 'true');
      
      // Short timeout for visual feedback before redirecting
      setTimeout(() => {
        // Directly navigate back to dashboard
        router.push('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error("Error processing scan:", err);
      
      // Extract error message from the response if available
      const errorMsg = err.response?.data?.message || 
                      "Failed to process QR code. Please try again.";
                      
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
        setProcessingStatus(null);
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
        
        {!isScanning && !scanResult && processingStatus && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6">
            {/* Processing animation */}
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">{processingStatus.message}</h2>
            
            {/* Progress bar */}
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{width: `${processingStatus.progress}%`}}
              ></div>
            </div>
            
            {/* Stage indicator */}
            <div className="text-sm text-gray-600 mb-4">
              {processingStatus.stage === 'verifying' && 'Verifying QR code...'}
              {processingStatus.stage === 'recording' && 'Recording your activity...'}
              {processingStatus.stage === 'minting' && 'Minting your NFT reward...'}
              {processingStatus.stage === 'complete' && 'Finalizing...'}
            </div>
          </div>
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
            
            <p className="text-center text-gray-600 mb-2">
              Activity recorded and NFT minted!
            </p>
            
            {scanResult.event.title && (
              <p className="text-center text-gray-700 mb-2 font-medium">
                {scanResult.event.title}
              </p>
            )}
            
            {scanResult.nft?.rewardAmount && (
              <div className="flex gap-2 items-center justify-center mb-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  +{scanResult.nft.rewardAmount} G$ tokens
                </span>
              </div>
            )}
            
            {scanResult.nft?.nftTokenId && (
              <p className="text-center text-gray-500 text-sm mb-4">
                NFT #{scanResult.nft.nftTokenId}
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