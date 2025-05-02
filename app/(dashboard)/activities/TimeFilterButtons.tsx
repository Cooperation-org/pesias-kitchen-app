'use client';

import { motion } from 'framer-motion';
import { TimeFilter } from './types';

interface TimeFilterButtonsProps {
  currentFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

export default function TimeFilterButtons({ 
  currentFilter, 
  onFilterChange 
}: TimeFilterButtonsProps) {
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {(['upcoming', 'past', 'all'] as TimeFilter[]).map((filter) => (
        <motion.button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
            currentFilter === filter
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)} Events
        </motion.button>
      ))}
    </div>
  );
}