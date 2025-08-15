'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, Share } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { NFT, NFTDetails } from '@/types/api';
import { getNFTDetails } from '@/services/api';

interface NFTModalProps {
  nft: NFT | null;
  isOpen: boolean;
  onClose: () => void;
}

const getActivityColor = (activityType: string): string => {
  switch (activityType) {
    case 'food_sorting':
      return '#4CAF50';
    case 'food_distribution':
      return '#2196F3';
    case 'food_pickup':
      return '#FF9800';
    default:
      return '#9C27B0';
  }
};

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'EEEE, MMMM do, yyyy');
  } catch {
    return dateString;
  }
};

export default function NFTModal({ nft, isOpen, onClose }: NFTModalProps) {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedDetails, setHasLoadedDetails] = useState(false);

  React.useEffect(() => {
    if (isOpen && nft && !hasLoadedDetails) {
      setIsLoading(true);
      getNFTDetails(nft.id)
        .then(details => {
          setNftDetails(details);
          setHasLoadedDetails(true);
        })
        .catch(error => {
          console.error('Error loading NFT details:', error);
          toast.error('Failed to load NFT details');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, nft, hasLoadedDetails]);

  React.useEffect(() => {
    if (!isOpen) {
      setNftDetails(null);
      setHasLoadedDetails(false);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareNFT = async () => {
    if (!nft) return;
    
    const shareData = {
      title: nft.name,
      text: `Check out my ${nft.name} NFT from Pesia's Kitchen - helping fight food waste!`,
      url: `https://celoscan.io/tx/${nft.txHash}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          copyToClipboard(shareData.url, 'Share link');
        }
      }
    } else {
      copyToClipboard(shareData.url, 'Share link');
    }
  };

  if (!nft) return null;

  const activityColor = getActivityColor(nft.activityType);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div 
              className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ borderTop: `4px solid ${activityColor}` }}
            >
              <h2 className="text-xl font-bold text-gray-800 flex-1 pr-4 line-clamp-1">
                {nft.name}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={shareNFT}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share NFT"
                >
                  <Share size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* NFT Image */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    <Image
                      src="https://gateway.pinata.cloud/ipfs/Qmef6Me5HzCzsrqrQyFeHQJuGSe6Hqu2NDGF5uBTtjnJig"
                      alt={nft.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* NFT Details */}
                <div className="space-y-6">
                  {/* Description */}
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  ) : nftDetails?.description ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{nftDetails.description}</p>
                    </div>
                  ) : null}

                  {/* Activity Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Activity Details</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <p className="font-medium" style={{ color: activityColor }}>
                            {nft.activityType.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </p>
                          <p className="text-sm text-gray-500">Activity Type</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📍</span>
                        <div>
                          <p className="font-medium text-gray-800">{nft.location}</p>
                          <p className="text-sm text-gray-500">Location</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📦</span>
                        <div>
                          <p className="font-medium text-gray-800">{nft.quantity} kg</p>
                          <p className="text-sm text-gray-500">Food Rescued</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="font-medium text-gray-800">{formatDate(nft.date)}</p>
                          <p className="text-sm text-gray-500">Date Earned</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attributes */}
                  {nftDetails?.attributes && nftDetails.attributes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Attributes</h3>
                      <div className="grid gap-2">
                        {nftDetails.attributes.map((attr, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">{attr.trait_type}</span>
                            <span className="text-sm text-gray-800">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blockchain Verification */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Blockchain Verification</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ExternalLink size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Transaction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(nft.txHash, 'Transaction hash')}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Copy size={14} />
                          </button>
                          <a
                            href={`https://celoscan.io/tx/${nft.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View on Celoscan
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ExternalLink size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-900">Token</span>
                        </div>
                        <a
                          href={`https://celoscan.io/token/0x251EEBd7d9469bbcc02Ef23c95D902Cbb7fD73B3?a=${nft.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:text-green-800 transition-colors"
                        >
                          View Token
                        </a>
                      </div>

                      {nftDetails?.image && (
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ExternalLink size={16} className="text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">IPFS Metadata</span>
                          </div>
                          <a
                            href={nftDetails.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            View on IPFS
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}