"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QrReader } from "react-qr-reader"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

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
    if (result && !isProcessing) {
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
        
        // Simulate API verification
        setTimeout(() => {
          setIsProcessing(false);
          // In a real app, you would verify with your backend here
          // For now, we'll simulate success and redirect after 2 seconds
          setTimeout(() => {
            router.push(`/scan-success?id=${scanData.id}&type=${scanData.type}&reward=${scanData.reward}`);
          }, 2000);
        }, 1500);
        
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

  // Format activity type for display
  const formatActivityType = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Scan QR Code</h1>
      <p className="text-gray-600 mb-6">Scan the QR code at your volunteer location to verify participation</p>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Scanner UI */}
          {isScanning && !scanResult && (
            <div className="relative">
              <div className="w-full aspect-square max-h-[400px] overflow-hidden">
                <QrReader
                  constraints={{ facingMode: 'environment' }}
                  onResult={handleScan}
                  scanDelay={500}
                  videoStyle={{ width: '100%', height: '100%' }}
                  videoContainerStyle={{ 
                    width: '100%', 
                    height: '100%',
                    overflow: 'hidden',
                  }}
                  videoId="qr-reader-video"
                />
              </div>
              
              {/* Scanner overlay */}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white rounded-lg opacity-70"></div>
              </div>
            </div>
          )}
          
          {/* Scan Result UI */}
          {scanResult && (
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">QR Code Scanned!</h3>
                <p className="text-gray-600 mb-4">Processing your verification</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Activity:</span>
                    <Badge variant="outline">{formatActivityType(scanResult.type)}</Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium">{scanResult.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reward:</span>
                    <span className="text-sm font-medium">G$ {scanResult.reward}</span>
                  </div>
                </div>
                
                {isProcessing && (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying with server...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}
        
        <CardFooter className="p-4 border-t border-gray-200">
          {isScanning && !scanResult ? (
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => setIsScanning(false)}
            >
              Cancel Scan
            </Button>
          ) : !scanResult ? (
            <Button 
              className="w-full" 
              onClick={() => setIsScanning(true)}
            >
              Start Scanning
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setScanResult(null);
                setIsScanning(true);
              }}
              disabled={isProcessing}
            >
              Scan Again
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Scanning Tips</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="mr-2 mt-0.5 text-blue-600">•</div>
            <p className="text-gray-600">Make sure the entire QR code is visible in the camera view</p>
          </li>
          <li className="flex items-start">
            <div className="mr-2 mt-0.5 text-blue-600">•</div>
            <p className="text-gray-600">Hold your device steady and ensure good lighting</p>
          </li>
          <li className="flex items-start">
            <div className="mr-2 mt-0.5 text-blue-600">•</div>
            <p className="text-gray-600">If scanning doesn't work, ask a staff member for assistance</p>
          </li>
        </ul>
      </div>
    </div>
  )
}