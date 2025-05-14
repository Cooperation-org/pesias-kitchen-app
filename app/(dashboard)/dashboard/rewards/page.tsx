"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Sparkles, Trophy, Gift } from 'lucide-react';
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

interface Reward {
  activityId: string;
  nftId: string;
  activityType: string;
  location: string;
  date: string;
  rewardAmount: number;
}

interface RewardsResponse {
  userInfo: {
    id: string;
    name: string;
    walletAddress: string;
  };
  rewards: Reward[];
  totalRewards: number;
}

const Rewards = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const [rewardsData, setRewardsData] = useState<RewardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingRewards, setClaimingRewards] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    const fetchRewards = async () => {
      try {
        const data = await getRewardsHistory();
        setRewardsData(data);
      } catch (err) {
        setError('Failed to load rewards. Please try again later.');
        console.error('Error fetching rewards:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewards();
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

  const handleClaimRewards = async () => {
    if (!rewardsData?.rewards.length) return;
    
    setClaimingRewards(true);
    setError(null);
    
    try {
      // Claim rewards for each unclaimed activity
      for (const reward of rewardsData.rewards) {
        if (!reward.nftId.startsWith('nft-')) { // Only claim if not already minted
          await mintActivityNFT(reward.activityId);
        }
      }
      
      setClaimSuccess(true);
      // Refresh rewards data
      const updatedData = await getRewardsHistory();
      setRewardsData(updatedData);
      
      // Reset success message after 3 seconds
      setTimeout(() => setClaimSuccess(false), 3000);
      
    } catch (err) {
      setError('Failed to claim rewards. Please try again.');
      console.error('Error claiming rewards:', err);
    } finally {
      setClaimingRewards(false);
    }
  };

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
        {/* Header with animation */}
        <motion.div variants={itemVariants} className="h-[43px]" />
        <motion.button 
          variants={itemVariants}
          onClick={() => router.back()} 
          className="cursor-pointer group"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="h-6 w-6 text-gray-800 group-hover:text-[#4CAF50] transition-colors" />
        </motion.button>
        
        <motion.div variants={itemVariants} className="relative flex justify-between items-center mt-3 mb-8">
          <h1 className="text-3xl font-bold text-[#303030] absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4CAF50] to-[#43A047] bg-clip-text text-transparent">
            Rewards
          </h1>
        </motion.div>

        {/* Animated Balance Card */}
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
              alt="coin"
            />
           </div>
            {isLoading ? '...' : rewardsData?.totalRewards || 0}
          </motion.div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Trophy className="w-4 h-4 text-[#4CAF50]" />
            G$ earned
          </div>
        </motion.div>

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

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Rewards List with staggered animation */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border rounded-2xl shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Trophy className="w-8 h-8 mx-auto mb-2 text-[#4CAF50]" />
              </motion.div>
              Loading rewards...
            </div>
          ) : rewardsData?.rewards.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Gift className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              No rewards yet
            </div>
          ) : (
            rewardsData?.rewards.map((reward, index) => (
              <motion.div
                key={reward.activityId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, backgroundColor: "rgba(76, 175, 80, 0.02)" }}
                className={`flex justify-between items-center px-6 py-4 ${
                  index < (rewardsData?.rewards.length || 0) - 1
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
                 G$
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Fixed Bottom Button with animation */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 w-full flex justify-center"
        >
          <Button
            onClick={handleClaimRewards}
            disabled={!rewardsData?.totalRewards || claimingRewards || !rewardsData?.rewards.some(r => !r.nftId.startsWith('nft-'))}
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
            {claimingRewards ? 'CLAIMING...' : 'CLAIM REWARDS'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Rewards;