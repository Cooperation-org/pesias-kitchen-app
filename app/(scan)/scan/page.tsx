"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QrReader } from "react-qr-reader"
import Link from "next/link"

// Scanner result type definition
interface ScanResult {
  id: string;
  type: string;
  reward: number;
  location: string;
  timestamp: number;
}

export default function ScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const handleScan = async (result: any) => {
    if (result && !isProcessing && isScanning) {
      setIsProcessing(true)
      setIsScanning(false)

      try {
        // Parse the QR code content
        let scanData: ScanResult;
        
        try {
          // Try to parse as JSON
          scanData = JSON.parse(result?.text);
        } catch (e) {
          // If not JSON, try to extract info from URL
          const url = new URL(result?.text);
          scanData = {
            id: url.searchParams.get('id') || '',
            type: url.searchParams.get('type') || '',
            reward: Number(url.searchParams.get('reward') || 5),
            location: url.searchParams.get('location') || '',
            timestamp: Date.now()
          };
        }
        
        setScanResult(scanData);
        
        // Simulate API verification and redirect to success screen
        setTimeout(() => {
          router.push(`/scan-success?id=${scanData.id}&type=${scanData.type}&reward=${scanData.reward}`);
        }, 2000);
        
      } catch (err) {
        setIsProcessing(false);
        setErrorMessage("Invalid QR code format. Please try again.");
        setIsScanning(true);
        console.error("Error processing scan:", err);
      }
    }
  };

  // Handle errors from scanner
  const handleError = (error: any) => {
    setErrorMessage("Error accessing camera. Please check permissions and try again.");
    console.error("QR Scanner error:", error);
  };

  return (
    <div className="h-screen w-full flex flex-col relative">
      {/* Fullscreen camera view */}
      <div className="relative flex-1 w-full h-full">
        {isScanning && (
          <>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              scanDelay={500}
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
            <p className="text-center text-gray-600 mb-6">
              QR code scanned successfully. Redirecting you to the confirmation screen...
            </p>
            
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center">
          {errorMessage}
        </div>
      )}
    </div>
  )
}