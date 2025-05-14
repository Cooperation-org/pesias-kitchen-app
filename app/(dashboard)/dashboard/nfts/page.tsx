'use client';

import { ChevronLeftIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserNFTs } from "@/services/api";
import { useAuthContext } from "@/providers/web3Provider";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";

interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  activityType: string;
  location: string;
  quantity: number;
  date: string;
  txHash: string;
}

export default function NFTs() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    const fetchNFTs = async () => {
      try {
        const response = await getUserNFTs();
        setNfts(response.nfts);
      } catch (err) {
        setError('Failed to load NFTs. Please try again later.');
        console.error('Error fetching NFTs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [isAuthenticated, router]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="px-6 py-4">

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No NFTs yet. Complete activities to earn NFTs!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {nfts.map((nft) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="rounded-xl overflow-hidden cursor-pointer"
                onClick={() => router.push(`/nfts/${nft.id}`)}
              >
                <div className="relative h-[120px] rounded-t-xl">
                  <Image
                    src={nft.imageUrl}
                    alt={nft.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-white p-4 rounded-b-xl shadow-md">
                  <h3 className="font-semibold text-sm mb-2">{nft.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {formatActivityType(nft.activityType)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(nft.date)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
