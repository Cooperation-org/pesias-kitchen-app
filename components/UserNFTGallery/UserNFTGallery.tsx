'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useSWR from 'swr';
import { getUserNFTs } from '@/services/api';
import { SWR_ENDPOINTS } from '@/types/api';
import type { NFT, NFTsResponse } from '@/types/api';
import { useAuthContext } from '@/providers/web3Provider';

import NFTCard from './NFTCard';
import NFTModal from './NFTModal';
import NFTFilter from './NFTFilter';
import EmptyState from './EmptyState';

// Loading skeleton component
function NFTCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="bg-white p-4 shadow-md">
        <div className="h-5 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

// Custom hook for NFTs data
function useNFTs() {
  const { data, error, isLoading, mutate } = useSWR<NFTsResponse>(
    [SWR_ENDPOINTS.NFTS.key],
    async () => {
      const response = await getUserNFTs();
      return response;
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('Error fetching NFTs:', err);
        toast.error('Failed to load NFT collection. Please try again.');
      }
    }
  );

  return {
    nftsData: data,
    isLoading,
    error,
    mutate
  };
}

export default function UserNFTGallery() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { nftsData, isLoading, error, mutate } = useNFTs();

  // State for filters and modal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'activityType'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track new NFTs for celebration effect
  const [newNFTIds, setNewNFTIds] = useState<Set<string>>(new Set());

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Check for new NFTs and handle modal opening from URL parameters
  React.useEffect(() => {
    if (nftsData?.nfts) {
      const urlParams = new URLSearchParams(window.location.search);
      const newNFTId = urlParams.get('new');
      const openNFTId = urlParams.get('open');

      // Handle new NFT celebration
      if (newNFTId && nftsData.nfts.some(nft => nft.id === newNFTId)) {
        setNewNFTIds(prev => new Set(prev).add(newNFTId));
        // Remove the new NFT highlight after 5 seconds
        setTimeout(() => {
          setNewNFTIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(newNFTId);
            return newSet;
          });
        }, 5000);
      }

      // Handle opening NFT modal from URL
      if (openNFTId) {
        const nftToOpen = nftsData.nfts.find(nft => nft.id === openNFTId);
        if (nftToOpen) {
          setSelectedNFT(nftToOpen);
          setIsModalOpen(true);
        }
      }

      // Clean up URL parameters
      if (newNFTId || openNFTId) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [nftsData]);

  // Filter and sort NFTs
  const filteredAndSortedNFTs = useMemo(() => {
    if (!nftsData?.nfts) return [];

    let filtered = nftsData.nfts.filter((nft) => {
      const matchesSearch = searchQuery === '' || 
        nft.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesActivityType = selectedActivityType === '' || 
        nft.activityType === selectedActivityType;

      return matchesSearch && matchesActivityType;
    });

    // Sort NFTs
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'activityType') {
        comparison = a.activityType.localeCompare(b.activityType);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [nftsData?.nfts, searchQuery, selectedActivityType, sortBy, sortOrder]);

  // Event handlers
  const handleNFTClick = useCallback((nft: NFT) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedNFT(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedActivityType('');
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  const hasActiveFilters = searchQuery !== '' || selectedActivityType !== '';

  if (!isAuthenticated) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            My Collection
          </h1>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div 
            variants={itemVariants}
            className="bg-red-50 text-red-600 p-6 rounded-xl mb-6 border border-red-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Failed to load NFT collection</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => mutate()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}



        {/* Loading State */}
        {isLoading && (
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <NFTCardSkeleton key={i} />
            ))}
          </motion.div>
        )}

        {/* Empty States */}
        {!isLoading && (!nftsData?.nfts || nftsData.nfts.length === 0) && (
          <motion.div variants={itemVariants}>
            <EmptyState />
          </motion.div>
        )}

        {!isLoading && nftsData?.nfts && nftsData.nfts.length > 0 && filteredAndSortedNFTs.length === 0 && (
          <motion.div variants={itemVariants}>
            <EmptyState hasFilters onClearFilters={handleClearFilters} />
          </motion.div>
        )}

        {/* NFT Grid */}
        {!isLoading && filteredAndSortedNFTs.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredAndSortedNFTs.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  onClick={() => handleNFTClick(nft)}
                  isNew={newNFTIds.has(nft.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      {/* NFT Detail Modal */}
      <NFTModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.div>
  );
}