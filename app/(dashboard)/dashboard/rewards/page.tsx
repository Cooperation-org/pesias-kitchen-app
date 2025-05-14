"use client";

import React, { useCallback } from 'react';
import {  Sparkles, Trophy, Gift } from 'lucide-react';
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Image from 'next/image';
import { getRewardsHistory, mintActivityNFT } from '@/services/api';
import { useAuthContext } from '@/providers/web3Provider';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { toast } from 'sonner';
import { SWR_ENDPOINTS } from '@/types/api';
import type { RewardsResponse as APIRewardsResponse } from '@/types/api';

// Utility function
function cn(...inputs: (string | undefined)[]) {
  return twMerge(clsx(inputs));
}

// Button component with animation
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#4CAF50] to-[#43A047] text-white shadow-lg hover:shadow-xl",
        secondary:
          "bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white shadow-lg hover:shadow-xl",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-14 rounded-md px-10 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Custom hook for rewards data
function useRewards() {
  const { data, error, isLoading, mutate } = useSWR<APIRewardsResponse>(
    [SWR_ENDPOINTS.REWARDS.key],
    async () => {
      const response = await getRewardsHistory();
      return response;
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 30000, // Refresh every 30 seconds
      onError: (err) => {
        console.error('Error fetching rewards:', err);
        toast.error('Failed to load rewards. Please try again later.');
      }
    }
  );

  const hasUnclaimedRewards = data?.rewards.some(reward => !reward.nftId.startsWith('nft-')) ?? false;
  const totalUnclaimedRewards = data?.rewards.filter(reward => !reward.nftId.startsWith('nft-')).length ?? 0;

  return {
    rewardsData: data,
    isLoading,
    error,
    mutate,
    hasUnclaimedRewards,
    totalUnclaimedRewards
  };
}

const Rewards = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { 
    rewardsData, 
    isLoading, 
    error, 
    mutate,
    hasUnclaimedRewards,
    totalUnclaimedRewards
  } = useRewards();
  const [claimingRewards, setClaimingRewards] = React.useState(false);
  const [claimSuccess, setClaimSuccess] = React.useState(false);

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

  const handleClaimRewards = useCallback(async () => {
    if (!rewardsData?.rewards.length || !hasUnclaimedRewards) return;
    
    setClaimingRewards(true);
    
    try {
      // Get unclaimed rewards
      const unclaimedRewards = rewardsData.rewards.filter(
        reward => !reward.nftId.startsWith('nft-')
      );

      // Claim rewards in parallel with a concurrency limit
      const batchSize = 3;
      for (let i = 0; i < unclaimedRewards.length; i += batchSize) {
        const batch = unclaimedRewards.slice(i, i + batchSize);
        await Promise.all(
          batch.map(reward => mintActivityNFT(reward.activityId))
        );
        
        // Show progress toast
        const progress = Math.min(i + batchSize, unclaimedRewards.length);
        toast.success(`Claimed ${progress} of ${unclaimedRewards.length} rewards`);
      }
      
      setClaimSuccess(true);
      
      // Refresh rewards data
      await mutate();
      
      // Reset success message after 3 seconds
      setTimeout(() => setClaimSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error claiming rewards:', err);
      toast.error('Failed to claim rewards. Please try again.');
    } finally {
      setClaimingRewards(false);
    }
  }, [rewardsData, hasUnclaimedRewards, mutate]);

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
      className="w-full flex-1 flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full pb-[110px] px-5 md:p-6 lg:p-8 max-w-lg">
      
        
        <motion.div variants={itemVariants} className="relative flex justify-between items-center mt-3 mb-8">
          <h1 className="text-3xl font-bold text-[#303030] absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4CAF50] to-[#43A047] bg-clip-text text-transparent">
            Rewards
          </h1>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-16 h-16 border-4 border-t-[#4CAF50] border-r-[#4CAF50] border-b-[#4CAF50] border-l-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Loading rewards...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div 
            variants={itemVariants}
            className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Animated Balance Card */}
        {!isLoading && !error && (
          <motion.div 
            variants={itemVariants}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center mb-8 border border-gray-100"
            whileHover={{ y: -5 }}
          >
            <motion.div 
              className="flex items-center text-4xl font-bold text-[#303030] mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className='bg-[#4CAF50] rounded-full mr-3'>
                <Image
                  width={32}
                  height={32}
                  src="/images/gooddollar.svg"
                  className="w-8 h-8"
                  alt="G$ token"
                />
              </div>
              {rewardsData?.totalRewards || 0}
            </motion.div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-[#4CAF50]" />
              G$ earned
            </div>
            {hasUnclaimedRewards && (
              <div className="mt-2 text-sm text-[#4CAF50] font-medium">
                {totalUnclaimedRewards} rewards ready to claim
              </div>
            )}
          </motion.div>
        )}

        {/* Success Message */}
        {claimSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 border border-green-200 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Rewards claimed successfully!
          </motion.div>
        )}

        {/* Rewards List */}
        {!isLoading && !error && rewardsData?.rewards && (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="divide-y divide-gray-100">
              {rewardsData.rewards.map((reward, index) => (
                <motion.div
                  key={reward.activityId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, backgroundColor: "rgba(76, 175, 80, 0.02)" }}
                  className={`flex justify-between items-center px-6 py-4 ${
                    index < (rewardsData.rewards.length - 1)
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div>
                    <div className="text-base font-medium text-[#303030] flex items-center gap-2">
                      {formatActivityType(reward.activityType)}
                      {reward.nftId.startsWith('nft-') && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Claimed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(reward.date)} • {reward.location}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-[#4CAF50] flex items-center gap-1">
                    +{reward.rewardAmount}
                    <span className="text-sm">G$</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Fixed Bottom Button with animation */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 w-full flex justify-center"
        >
          <Button
            onClick={handleClaimRewards}
            disabled={!hasUnclaimedRewards || claimingRewards}
            size="lg"
            className="w-[280px] rounded-lg shadow-lg"
          >
            {claimingRewards ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Gift className="w-5 h-5 mr-2" />
            )}
            {claimingRewards 
              ? 'CLAIMING...' 
              : hasUnclaimedRewards 
                ? `CLAIM ${totalUnclaimedRewards} REWARDS`
                : 'ALL REWARDS CLAIMED'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Rewards;