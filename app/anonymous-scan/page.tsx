'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { generatePseudonymousId, getPseudonymousId } from '@/utils/pseudonymous';
import { getGeolocation } from '@/utils/geolocation';

interface QRData {
  eventId: string;
  type: 'volunteer' | 'recipient';
  quantity?: number;
  rewardAmount?: number;
}

interface ScanResult {
  success: boolean;
  message: string;
  event?: {
    title: string;
    location: string;
  };
  activity?: {
    type: string;
    quantity: number;
    rewardAmount: number;
  };
}

export default function AnonymousScanPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate or retrieve pseudonymous ID
    const id = getPseudonymousId() || generatePseudonymousId();
    
    // Parse QR data from URL and process
    parseQRFromURL(id);
  }, []);

  const parseQRFromURL = (pseudonymousId: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrParam = urlParams.get('qr');
    const dataParam = urlParams.get('data');

    try {
      let parsedData: QRData;
      
      if (qrParam) {
        // Base64 encoded QR data (new format)
        const decoded = atob(qrParam);
        parsedData = JSON.parse(decoded);
      } else if (dataParam) {
        // URL encoded QR data (legacy format)
        const decoded = decodeURIComponent(dataParam);
        parsedData = JSON.parse(decoded);
      } else {
        // No URL parameters - show error
        setError('No QR data found in URL. Please scan a valid QR code.');
        return;
      }

      // Process the scan
      processPseudonymousScan(parsedData, pseudonymousId);
    } catch (err) {
      console.error('Error parsing QR data:', err);
      setError('Invalid QR code format. Please try scanning again.');
    }
  };

  const processPseudonymousScan = async (data: QRData, pseudonymousId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get geolocation (optional)
      let location = null;
      try {
        location = await getGeolocation();
      } catch (error) {
        console.warn('Geolocation failed, proceeding without location');
      }
      
      // Prepare scan data
      const scanData = {
        pseudonymousId,
        qrData: data,
        timestamp: new Date().toISOString(),
        geolocation: location,
        sessionFingerprint: generateSessionFingerprint()
      };

      // Send to backend
      const response = await fetch('/api/proxy/anonymous-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanData)
      });

      const result = await response.json();
      
      if (result.success) {
        setScanResult(result);
      } else {
        setError(result.message || 'Scan verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Scan processing error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSessionFingerprint = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Pesia\'s Kitchen Fingerprint', 2, 2);
    
    return canvas.toDataURL();
  };

  const retryQRScan = () => {
    window.location.reload();
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2D166]/20 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <ArrowPathIcon className="w-16 h-16 text-[#F4cf6A]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-black mb-4">
            Verifying Your Participation...
          </h2>
          <p className="text-gray-600">
            Please wait while we record your community impact.
          </p>
        </motion.div>
      </div>
    );
  }

  if (scanResult?.success) {
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
            <CheckCircleIcon className="w-16 h-16 text-[#F4cf6A]" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-black mb-4"
          >
            Thank You for Your Participation!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-[#F4cf6A] font-semibold mb-6"
          >
            You helped make an impact today! 🌟
          </motion.p>

          {scanResult.event && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-50 rounded-lg p-4 mb-6 text-left"
            >
              <h3 className="font-semibold text-gray-800 mb-2">Event Details:</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Event:</span> {scanResult.event.title}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Location:</span> {scanResult.event.location}
              </p>
              {scanResult.activity && (
                <p className="text-gray-600">
                  <span className="font-medium">Type:</span> {scanResult.activity.type}
                </p>
              )}
            </motion.div>
          )}

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

          <motion.a
            href="https://pesias-kitchen-app-brown.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="inline-block bg-[#F4cf6A] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#F4cf6A]/90 transition-colors"
          >
            Learn More
          </motion.a>
          
          {/* Hidden canvas for fingerprinting */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
            width="200"
            height="50"
          />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
          >
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-black mb-4">
            Oops! Something went wrong
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>

          <button
            onClick={retryQRScan}
            className="bg-[#F4cf6A] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#F4cf6A]/90 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // This should not be reached since we always process URL parameters
  return null;
}