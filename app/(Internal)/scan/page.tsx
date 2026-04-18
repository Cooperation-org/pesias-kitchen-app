"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Scanner } from "@yudiel/react-qr-scanner"
import Link from "next/link"
import { verifyQRCode, recordActivity } from "@/services/api"
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AxiosResponse } from 'axios'

// Types
interface ScanResult {
  id?: string;
  activity?: {
    id: string;
    type: string;
    quantity: number;
    notes?: string;
    rewardAmount: number;
  };
  event?: {
    title: string;
    activityType: string;
    location: string;
  };
  timestamp?: number;
  success?: boolean;
  message?: string;
  isDuplicate?: boolean;
  existingActivity?: {
    id: string;
    eventTitle: string;
    timestamp: string;
    rewardAmount: number;
  };
}

type ProcessingStatus = {
  stage: 'verifying' | 'recording' | 'complete';
  message: string;
  progress: number;
}

interface QRCodeVerifyResponse {
  qrCode: {
    id: string;
    event: {
      id: string;
      title: string;
      activityType: string;
      location: string;
      defaultQuantity?: number;
    };
    type?: string;
    rewardAmount?: number;
  };
}

interface ActivityResponse {
  activity: {
    _id: string;
    id: string;
    type: string;
    rewardAmount: number;
    description?: string;
  };
}

// Custom hooks
const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const lastScannedCode = useRef("")
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    }
  }, [])

  return {
    isScanning,
    setIsScanning,
    errorMessage,
    setErrorMessage,
    lastScannedCode
  }
}

const useScanProcessing = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null)
  const router = useRouter()

  const processScan = useCallback(async (qrCodeText: string) => {
    if (!qrCodeText) return

    setIsProcessing(true)
    setProcessingStatus({
      stage: 'verifying',
      message: 'Verifying QR code...',
      progress: 50
    })

    try {
      // Step 1: Verify QR Code
      const verifyResponse = await verifyQRCode(qrCodeText) as unknown as AxiosResponse<QRCodeVerifyResponse>
      const verifyResult = verifyResponse.data
      try {
        console.log('[Scan] verify response', verifyResult)
        console.log('[Scan] qrCode payload', verifyResult?.qrCode)
        console.log('[Scan] qrCode.rewardAmount', verifyResult?.qrCode?.rewardAmount)
        console.log('[Scan] qrCode.event', verifyResult?.qrCode?.event)
        console.log('[Scan] qrCode.event.defaultQuantity', verifyResult?.qrCode?.event?.defaultQuantity)
      } catch {}
      const eventData = verifyResult.qrCode.event
      const qrCodeId = verifyResult.qrCode.id

      // Step 2: Record Activity
      setProcessingStatus({
        stage: 'recording',
        message: 'Recording activity...',
        progress: 100
      })

      const activityData = {
        eventId: eventData.id,
        qrCodeId: qrCodeId,
        quantity: eventData.defaultQuantity || 1,
        notes: "Scanned via mobile app",
        // Pass reward amount from verification so backend can persist it
        rewardAmount: verifyResult.qrCode.rewardAmount ?? undefined
      }
      try {
        console.log('[Scan] record request body', activityData)
      } catch {}

      const recordResponse = await recordActivity(activityData) as unknown as AxiosResponse<ActivityResponse>
      const activityResult = recordResponse.data.activity
      try {
        console.log('[Scan] record response', recordResponse.data)
      } catch {}
      const activityId = activityResult._id || activityResult.id

      // Create scan result with proper reward amount calculation
      const rewardAmount = verifyResult.qrCode.rewardAmount || 1;
      
      const scanData: ScanResult = {
        id: activityId,
        activity: {
          id: activityId,
          type: activityResult.type || verifyResult.qrCode.type || 'event',
          quantity: eventData.defaultQuantity || 1,
          notes: activityResult.description || '',
          rewardAmount: rewardAmount
        },
        event: {
          title: eventData.title || '',
          activityType: eventData.activityType || '',
          location: eventData.location || '',
        },
        timestamp: Date.now(),
      }

      setProcessingStatus({
        stage: 'complete',
        message: 'Success!',
        progress: 100
      })

      setScanResult(scanData)
      try {
        console.log('[Scan] derived scan data', scanData)
      } catch {}
      localStorage.setItem('lastScanResult', JSON.stringify(scanData))
      localStorage.setItem('showScanPopup', 'true')

      // Show success toast (updated message for manual claiming)
      toast.success('Activity recorded! 🎯 Claim your rewards in the dashboard.')

      // Redirect after success
      setTimeout(() => router.push('/dashboard'), 2000)

    } catch (err) {
      const error = err as any
      // Extract user-friendly message from backend response
      const errorMsg = error.response?.data?.message || error.message || "Failed to process QR code. Please try again."
      
      // Check if it's a duplicate participation message (friendly info, not error)
      if (errorMsg.includes("already participated") || errorMsg.includes("already been recorded")) {
        // Show notification in middle like anonymous scanner
        setScanResult({
          success: false,
          message: errorMsg,
          isDuplicate: true,
          existingActivity: error.response?.data?.existingActivity
        })
        toast.success(errorMsg) // Use success toast for friendly duplicate message
      } else {
        toast.error(errorMsg) // Use error toast for actual errors
      }
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [router])

  return {
    scanResult,
    setScanResult,
    isProcessing,
    processingStatus,
    processScan
  }
}

export default function ScanPage() {
  const router = useRouter()
  
  const {
    isScanning,
    setIsScanning,
    errorMessage,
    setErrorMessage,
    lastScannedCode
  } = useQRScanner()

  const {
    scanResult,
    setScanResult,
    isProcessing,
    processingStatus,
    processScan
  } = useScanProcessing()

  const handleScan = useCallback(async (result: string | null) => {
    if (!result || isProcessing || !isScanning) return
    if (result === lastScannedCode.current) return

    lastScannedCode.current = result
    setIsScanning(false)

    try {
      await processScan(result)
    } catch (err) {
      const error = err as any
      // Extract user-friendly message from backend response
      const errorMsg = error.response?.data?.message || error.message || "Failed to process QR code"
      
      // Check if it's a duplicate participation message (friendly info, not error)
      if (errorMsg.includes("already participated") || errorMsg.includes("already been recorded")) {
        setErrorMessage("") // Don't show error message for friendly duplicate info
        toast.success(errorMsg) // Show friendly success toast instead
      } else {
        setErrorMessage(errorMsg) // Show error message for actual errors
      }
      
      setTimeout(() => {
        setErrorMessage("")
        setIsScanning(true)
        lastScannedCode.current = ""
      }, 3000)
    }
  }, [isProcessing, isScanning, lastScannedCode, processScan, setIsScanning, setErrorMessage])

  // Turn off scanner when duplicate is detected
  useEffect(() => {
    if (scanResult?.isDuplicate) {
      setIsScanning(false)
    }
  }, [scanResult?.isDuplicate, setIsScanning])

  // Duplicate participation notification - same approach as anonymous scanner
  if (scanResult?.isDuplicate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2D166]/20 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 mx-auto mb-6 bg-[#F4cf6A]/20 rounded-full flex items-center justify-center"
          >
            <svg className="w-16 h-16 text-[#F4cf6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-black mb-4"
          >
            Thank you for your participation! ✅
          </motion.h1>
          
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="text-xl text-[#F4cf6A] font-semibold mb-6"
           >
             You've already made an impact! 🌟
           </motion.p>

           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.0 }}
             className="flex items-center justify-center space-x-2 text-[#F4cf6A] mb-6"
           >
            <div className="w-8 h-8">
              <img src="/images/Pesia-logo-black.png" alt="Pesia's Kitchen" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold">Pesia's Kitchen - EAT Initiative</span>
          </motion.div>

           <motion.button
             onClick={() => {
               router.push('/dashboard')
             }}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.2 }}
             className="inline-block bg-[#F4cf6A] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#F4cf6A]/90 transition-colors"
           >
             Back to Dashboard
           </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
              <p className="text-gray-400">Scan a QR code to record your activity</p>
            </div>

            <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-800 shadow-xl">
              {isScanning && !isProcessing && (
                <Scanner
                  onScan={handleScan}
                  onError={(error) => {
                    console.error(error);
                    setErrorMessage("Failed to access camera. Please check permissions.");
                  }}
                  constraints={{ facingMode: "environment" }}
                  styles={{
                    container: {
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    },
                    video: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }
                  }}
                />
              )}


              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4 text-center"
                >
                  <div className="text-red-400">{errorMessage}</div>
                </motion.div>
              )}

              {isProcessing && processingStatus && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4"
                >
                  <div className="w-16 h-16 mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full border-4 border-t-blue-500 border-r-blue-500 border-b-blue-500 border-l-transparent rounded-full"
                    />
                  </div>
                  <div className="text-lg font-medium mb-2">{processingStatus.message}</div>
                  <div className="w-full max-w-xs bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${processingStatus.progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {scanResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mb-4 text-green-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  <div className="text-xl font-bold mb-2">Success!</div>
                  <div className="text-sm text-gray-400 mb-2">
                    Activity recorded successfully
                  </div>
                  <div className="text-sm text-yellow-400 font-medium mb-4">
                    You can now claim your {scanResult.activity?.rewardAmount || 0} G$ rewards!
                  </div>
                  <div className="text-sm text-gray-400 mt-4">
                    Redirecting to dashboard...
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}