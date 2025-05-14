"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { QrReader, OnResultFunction } from "react-qr-reader"
import Link from "next/link"
import { verifyQRCode, recordActivity, mintActivityNFT } from "@/services/api"
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AxiosResponse } from 'axios'

// Types
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

type ProcessingStatus = {
  stage: 'verifying' | 'recording' | 'minting' | 'complete';
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

interface NFTMintResponse {
  nftTokenId: string;
  rewardAmount: number;
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
      progress: 33
    })

    try {
      // Step 1: Verify QR Code
      const verifyResponse = await verifyQRCode(qrCodeText) as unknown as AxiosResponse<QRCodeVerifyResponse>
      const verifyResult = verifyResponse.data
      const eventData = verifyResult.qrCode.event
      const qrCodeId = verifyResult.qrCode.id

      // Step 2: Record Activity
      setProcessingStatus({
        stage: 'recording',
        message: 'Recording activity...',
        progress: 66
      })

      const activityData = {
        eventId: eventData.id,
        qrCodeId: qrCodeId,
        quantity: eventData.defaultQuantity || 1,
        notes: "Scanned via mobile app"
      }

      const recordResponse = await recordActivity(activityData) as unknown as AxiosResponse<ActivityResponse>
      const activityResult = recordResponse.data.activity
      const activityId = activityResult._id || activityResult.id

      // Step 3: Mint NFT
      setProcessingStatus({
        stage: 'minting',
        message: 'Minting NFT...',
        progress: 99
      })

      const mintResponse = await mintActivityNFT(activityId) as AxiosResponse<NFTMintResponse>
      const mintResult = mintResponse.data

      // Create scan result
      const scanData: ScanResult = {
        id: activityId,
        activity: {
          id: activityId,
          type: activityResult.type || verifyResult.qrCode.type || 'event',
          quantity: activityResult.rewardAmount || verifyResult.qrCode.rewardAmount || 1,
          notes: activityResult.description || '',
        },
        nft: {
          nftId: mintResult.nftTokenId,
          txHash: undefined,
          rewardAmount: mintResult.rewardAmount || verifyResult.qrCode.rewardAmount || '~',
          nftTokenId: mintResult.nftTokenId,
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
      localStorage.setItem('lastScanResult', JSON.stringify(scanData))
      localStorage.setItem('showScanPopup', 'true')

      // Redirect after success
      setTimeout(() => router.push('/dashboard'), 2000)

    } catch (err) {
      const error = err as Error
      const errorMsg = error.message || "Failed to process QR code. Please try again."
      toast.error(errorMsg)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [router])

  return {
    scanResult,
    isProcessing,
    processingStatus,
    processScan
  }
}

export default function ScanPage() {
  const {
    isScanning,
    setIsScanning,
    errorMessage,
    setErrorMessage,
    lastScannedCode
  } = useQRScanner()

  const {
    scanResult,
    isProcessing,
    processingStatus,
    processScan
  } = useScanProcessing()

  const handleScan: OnResultFunction = useCallback(async (result) => {
    if (!result || isProcessing || !isScanning) return

    const qrCodeText = result.getText()
    if (qrCodeText === lastScannedCode.current) return

    lastScannedCode.current = qrCodeText
    setIsScanning(false)

    try {
      await processScan(qrCodeText)
    } catch (err) {
      const error = err as Error
      setErrorMessage(error.message || "Failed to process QR code")
      setTimeout(() => {
        setErrorMessage("")
        setIsScanning(true)
        lastScannedCode.current = ""
      }, 3000)
    }
  }, [isProcessing, isScanning, lastScannedCode, processScan, setIsScanning, setErrorMessage])

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
                <QrReader
                  constraints={{ facingMode: "environment" }}
                  onResult={handleScan}
                  scanDelay={500}
                  videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
                  videoContainerStyle={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                  videoId="qr-video"
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
                  <div className="text-sm text-gray-400 mb-4">
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