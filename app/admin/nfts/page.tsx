'use client';
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserNFTs } from "@/services/api";
import { useAuthContext } from "@/providers/web3Provider";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import useSWR from 'swr';
import { toast } from 'sonner';
import { SWR_ENDPOINTS } from '@/types/api';
import type { NFTsResponse as APINFTsResponse } from '@/types/api';

// Custom hook for NFTs data
function useNFTs() {
  const { data, error, isLoading } = useSWR<APINFTsResponse>(
    [SWR_ENDPOINTS.NFTS.key],
    async () => {
      const response = await getUserNFTs();
      return response;
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 30000, // Refresh every 30 seconds
      onError: (err) => {
        console.error('Error fetching NFTs:', err);
        toast.error('Failed to load NFTs. Please try again later.');
      }
    }
  );

  return {
    nftsData: data,
    isLoading,
    error
  };
}

export default function NFTs() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { nftsData, isLoading, error } = useNFTs();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  }, []);

  const formatActivityType = useCallback((type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, []);

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
      <div className="px-6 py-4">
     

        {/* Error State */}
        {error && (
          <motion.div 
            variants={itemVariants}
            className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 gap-4"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                <div className="h-[120px] bg-gray-200 rounded-t-xl" />
                <div className="bg-white p-4 rounded-b-xl shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : nftsData?.nfts.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100"
          >
            <p className="text-gray-500">No NFTs yet. Complete activities to earn NFTs!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 gap-4"
          >
            {nftsData?.nfts.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="rounded-xl overflow-hidden cursor-pointer bg-white shadow-md border border-gray-100"
                onClick={() => router.push(`/dashboard/nfts/${nft.id}`)}
              >
                <div className="relative h-[120px] rounded-t-xl">
                  <Image
                    src={nft.imageUrl}
                    alt={nft.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={index < 4}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 text-gray-800">{nft.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {formatActivityType(nft.activityType)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(nft.date)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
