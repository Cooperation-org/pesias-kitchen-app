'use client';

import { motion } from 'framer-motion';

interface QRTypeSelectorProps {
  selectedType: 'volunteer' | 'recipient';
  onTypeChange: (type: 'volunteer' | 'recipient') => void;
}

export default function QRTypeSelector({ selectedType, onTypeChange }: QRTypeSelectorProps) {
  return (
    <div className="flex space-x-2 mb-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onTypeChange('volunteer')}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          selectedType === 'volunteer'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }`}
      >
        Volunteer
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onTypeChange('recipient')}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          selectedType === 'recipient'
            ? 'bg-green-600 text-white shadow-md shadow-green-200/50'
            : 'bg-green-100 text-green-800 hover:bg-green-200'
        }`}
      >
        Recipient
      </motion.button>
    </div>
  );
}