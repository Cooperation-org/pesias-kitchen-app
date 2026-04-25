'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function CreateEventButton() {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/admin/events/create')}
      className="fixed bottom-8 right-8 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
      aria-label="Create new event"
    >
      <PlusIcon className="h-6 w-6" />
    </motion.button>
  );
} 