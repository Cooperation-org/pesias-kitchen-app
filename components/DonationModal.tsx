'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MiniPayDonationFlow from './MiniPayDonationFlow';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [showMiniPayFlow, setShowMiniPayFlow] = useState(false);

  const handleMiniPaySuccess = async (txHash: string, amount: string) => {
    console.log('Donation successful!', { txHash, amount });

    // Track donation in backend
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/donations/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash,
          amount,
          currency: 'cUSD',
          method: 'minipay',
          source: 'web'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Donation tracked:', data);
      } else {
        console.error('Failed to track donation:', await response.text());
      }
    } catch (error) {
      console.error('Error tracking donation:', error);
      // Don't show error to user - donation was successful on blockchain
    }
  };

  const handleClose = () => {
    setShowMiniPayFlow(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Show either selection screen or MiniPay flow */}
            {showMiniPayFlow ? (
              <MiniPayDonationFlow
                onClose={handleClose}
                onSuccess={handleMiniPaySuccess}
              />
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#F4cf6A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💝</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Support EAT Initiative</h2>
                  <p className="text-gray-600">Choose your preferred donation method</p>
                </div>

                {/* Donation Options */}
                <div className="space-y-3">
              {/* Option 1: GoodCollective (Primary - Standard Portal) */}
              <Link
                href="https://goodcollective.xyz/collective/0xe4f65e8644c0f3a1c7ef0ba0f1428a82cdc0e7bc"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#F4cf6A] to-[#FFD700] text-black font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">GoodCollective</div>
                      <div className="text-sm text-black/70">Standard donation portal</div>
                    </div>
                  </div>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </Link>

                  {/* Option 2: MiniPay (Secondary - Quick Mobile Donation) */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMiniPayFlow(true)}
                    className="w-full bg-white border-2 border-gray-200 hover:border-[#F4cf6A] text-gray-900 font-semibold py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                  >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4cf6A]/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Mini-EAT Donation</div>
                    <div className="text-sm text-gray-600">Instant via MiniPay (cUSD)</div>
                  </div>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#F4cf6A] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* MiniPay Info - Show for users who don't have it */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Don't have MiniPay?{' '}
                  <Link
                    href="https://www.opera.com/products/minipay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F4cf6A] hover:underline font-medium"
                  >
                    Get it here →
                  </Link>
                </p>
              </div>

                  {/* Info Text */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">💡 Did you know?</span> Your donation directly funds food rescue operations and community programs.
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
