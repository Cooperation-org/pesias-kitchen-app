'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ExternalLink, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getNFTDetails } from '@/services/api';
import { useAuth } from '@/providers/web3Provider';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTDetails {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  txHash: string;
  owner: string;
}

export default function NFTDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [nft, setNft] = useState<NFTDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    const fetchNFTDetails = async () => {
      try {
        const data = await getNFTDetails(params.id);
        setNft(data);
      } catch (err) {
        setError('Failed to load NFT details. Please try again later.');
        console.error('Error fetching NFT details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTDetails();
  }, [isAuthenticated, router, params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4CAF50] to-[#43A047] bg-clip-text text-transparent">
            NFT Details
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-[400px] mb-6" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ) : nft ? (
          <motion.div
            key={nft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="rounded-xl overflow-hidden cursor-pointer"
            onClick={() => router.push(`/dashboard/nfts/${nft.id}`)}
          >
            {/* NFT Image */}
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-cover"
              />
            </div>

            {/* NFT Info */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{nft.name}</h2>
              <p className="text-gray-600 mb-6">{nft.description}</p>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {nft.attributes.map((attr, index) => (
                  <div 
                    key={index}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="text-sm text-gray-500 mb-1">{attr.trait_type}</div>
                    <div className="font-medium text-gray-900">{attr.value}</div>
                  </div>
                ))}
              </div>

              {/* Transaction Info */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">Transaction Hash</div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-50 px-2 py-1 rounded">
                      {nft.txHash.slice(0, 8)}...{nft.txHash.slice(-6)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(nft.txHash)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <a
                      href={`https://explorer.celo.org/tx/${nft.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Owner</div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-50 px-2 py-1 rounded">
                      {nft.owner.slice(0, 8)}...{nft.owner.slice(-6)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(nft.owner)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <a
                      href={`https://explorer.celo.org/address/${nft.owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">NFT not found</p>
          </div>
        )}
      </div>
    </div>
  );
} 