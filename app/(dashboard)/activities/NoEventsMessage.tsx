'use client';

import { motion } from 'framer-motion';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { TimeFilter } from './types';

interface NoEventsMessageProps {
  timeFilter: TimeFilter;
}

export default function NoEventsMessage({ timeFilter }: NoEventsMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 bg-secondary/10 rounded-2xl mt-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
      >
        <div className="bg-secondary/30 p-4 rounded-full inline-flex mx-auto mb-4">
          <CalendarIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No {timeFilter} events found
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {timeFilter === 'upcoming'
          ? 'Check back later for upcoming events or create your own!'
          : timeFilter === 'past'
          ? 'No past events to display'
          : 'No events available at this time'}
      </p>
    </motion.div>
  );
}