'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { NFT } from '@/types/api';

interface NFTCardProps {
  nft: NFT;
  onClick: () => void;
  isNew?: boolean;
}

const getActivityColor = (activityType: string): string => {
  switch (activityType) {
    case 'food_sorting':
      return '#10B981'; // Brand green
    case 'food_distribution':
      return '#F59E0B'; // Brand yellow/gold
    case 'food_pickup':
      return '#F97316'; // Brand orange
    default:
      return '#8B5CF6'; // Brand purple
  }
};

const formatActivityType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

export default function NFTCard({ nft, onClick, isNew = false }: NFTCardProps) {
  const activityColor = getActivityColor(nft.activityType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`nft-card relative cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 ${
        isNew ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
      }`}
      onClick={onClick}
    >
      {isNew && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            NEW!
          </span>
        </div>
      )}

      <div className="relative aspect-square w-full bg-gray-50">
        <Image
          src="https://gateway.pinata.cloud/ipfs/Qmef6Me5HzCzsrqrQyFeHQJuGSe6Hqu2NDGF5uBTtjnJig"
          alt={nft.name}
          fill
          className="object-cover rounded-t-2xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="nft-details p-5">
        <h3 className="font-semibold text-lg mb-3 text-gray-900 line-clamp-2">
          {nft.name}
        </h3>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-base">📍</span>
            <span className="truncate">{nft.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <span className="font-medium text-gray-900">{nft.quantity} kg food rescued</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-base">📅</span>
            <span>{formatDate(nft.date)}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: activityColor }}
          >
            {formatActivityType(nft.activityType)}
          </span>
          <a
            href={`https://celoscan.io/tx/${nft.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span>🔗</span>
            <span>View</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}