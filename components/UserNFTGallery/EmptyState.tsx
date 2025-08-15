'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface EmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function EmptyState({ hasFilters = false, onClearFilters }: EmptyStateProps) {
  const router = useRouter();

  const handleFindActivities = () => {
    router.push('/dashboard/events');
  };

  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="empty-nft-state bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">No NFTs Found</h3>
        <p className="text-gray-600 mb-6">
          No NFT badges match your current search criteria. Try adjusting your filters.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClearFilters}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={handleFindActivities}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Find Activities
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="empty-nft-state bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md border border-gray-100 p-12 text-center"
    >
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" />
        <div className="relative w-full h-full bg-white rounded-full shadow-lg flex items-center justify-center">
          <span className="text-5xl">🏆</span>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Start Your Hero Journey!</h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        Complete food rescue activities to earn exclusive NFT badges. Each badge represents your impact in fighting food waste and helping communities.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-lg mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <h4 className="font-semibold text-green-700">Food Sorting</h4>
          <p className="text-sm text-gray-600">Organize rescued food</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚚</span>
          </div>
          <h4 className="font-semibold text-blue-700">Food Distribution</h4>
          <p className="text-sm text-gray-600">Help distribute meals</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏪</span>
          </div>
          <h4 className="font-semibold text-orange-700">Food Pickup</h4>
          <p className="text-sm text-gray-600">Collect surplus food</p>
        </div>
      </div>

      <button
        onClick={handleFindActivities}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        Find Activities
      </button>

      <div className="mt-8 p-4 bg-white/50 rounded-lg">
        <p className="text-sm text-gray-600">
          🌱 Every action counts • 🏆 Earn unique badges • 🌍 Make a real impact
        </p>
      </div>
    </motion.div>
  );
}