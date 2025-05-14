"use client"

import { motion } from 'framer-motion'

interface StatsCardProps {
  stats: {
    activitiesCount: number
    goodDollarsEarned: number
    nftCount: number
  }
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mx-4 mt-4 bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-6 flex justify-between">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center"
        >
          <div className="bg-yellow-100 p-3 rounded-full mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8.5H10C9.45 8.5 9 8.95 9 9.5V10C9 10.55 9.45 11 10 11H14C14.55 11 15 10.55 15 10V9.5C15 8.95 14.55 8.5 14 8.5Z" fill="#FFD54F"/>
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.25 16H7.75C7.34 16 7 15.66 7 15.25C7 14.84 7.34 14.5 7.75 14.5H16.25C16.66 14.5 17 14.84 17 15.25C17 15.66 16.66 16 16.25 16ZM16.25 12.5H7.75C7.34 12.5 7 12.16 7 11.75C7 11.34 7.34 11 7.75 11H16.25C16.66 11 17 11.34 17 11.75C17 12.16 16.66 12.5 16.25 12.5ZM16.25 9H7.75C7.34 9 7 8.66 7 8.25C7 7.84 7.34 7.5 7.75 7.5H16.25C16.66 7.5 17 7.84 17 8.25C17 8.66 16.66 9 16.25 9Z" fill="#FFD54F"/>
            </svg>
          </div>
          <div className="text-2xl font-bold">{stats.activitiesCount}</div>
          <div className="text-sm text-gray-500">Activities</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center"
        >
          <div className="bg-blue-100 p-3 rounded-full mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#2196F3"/>
              <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#2196F3"/>
            </svg>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-2xl font-bold"
          >
            {stats.goodDollarsEarned}
          </motion.div>
          <div className="text-sm text-gray-500">G$ earned</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center"
        >
          <div className="bg-green-100 p-3 rounded-full mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#4CAF50"/>
            </svg>
          </div>
          <div className="text-2xl font-bold">{stats.nftCount}</div>
          <div className="text-sm text-gray-500">NFTs Minted</div>
        </motion.div>
      </div>
    </motion.div>
  )
} 