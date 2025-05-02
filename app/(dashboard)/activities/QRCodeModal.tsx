'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import QRTypeSelector from './QRTypeSelector';

interface QRCodeModalProps {
  isOpen: boolean;
  qrCodeUrl: string;
  eventName: string;
  onClose: () => void;
  onGenerate?: (type: 'volunteer' | 'recipient') => void;
  qrCodeType?: 'volunteer' | 'recipient';
  isGenerating?: boolean;
}

export default function QRCodeModal({
  isOpen,
  qrCodeUrl,
  eventName,
  onClose,
  onGenerate,
  qrCodeType = 'volunteer',
  isGenerating = false
}: QRCodeModalProps) {
  const [selectedType, setSelectedType] = useState<'volunteer' | 'recipient'>(qrCodeType);
  
  // Function to download the QR code image - defined with useCallback before any conditional returns
  const downloadQRCode = useCallback(() => {
    if (!qrCodeUrl) {
      toast.error('No QR code available to download');
      return;
    }
    
    try {
      // Create a link element
      const link = document.createElement('a');
      
      // If the qrCodeUrl is a data URL (base64 encoded image)
      if (qrCodeUrl.startsWith('data:image')) {
        link.href = qrCodeUrl;
      } 
      // If it's a URL path to the server
      else {
        link.href = qrCodeUrl;
      }
      
      // Set the filename for the download
      const typePrefix = qrCodeType.charAt(0).toUpperCase() + qrCodeType.slice(1);
      const filename = `${typePrefix}-QRCode-${eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      link.download = filename;
      
      // Append to the body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR Code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  }, [qrCodeUrl, eventName, qrCodeType]);

  const handleTypeChange = (type: 'volunteer' | 'recipient') => {
    setSelectedType(type);
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(selectedType);
    }
  };

  // We can return early, but only after all hooks have been called
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full bg-card rounded-2xl shadow-xl p-6 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {isGenerating ? `Generate QR Code for ${eventName}` : `QR Code for ${eventName}`}
            </h3>
            
            {isGenerating && !qrCodeUrl && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-2">QR Code Type:</h4>
                <QRTypeSelector 
                  selectedType={selectedType} 
                  onTypeChange={handleTypeChange} 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Select the type of QR code to generate for this event.
                </p>
              </div>
            )}
            
            {qrCodeUrl ? (
              <div className="bg-white p-6 rounded-xl flex items-center justify-center border shadow-inner">
                <motion.img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-64 h-64" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />
              </div>
            ) : isGenerating ? (
              <div className="mb-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-sm"
                >
                  Generate {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} QR Code
                </motion.button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl flex items-center justify-center border shadow-inner h-64">
                <div className="text-muted-foreground animate-pulse">
                  Loading QR code...
                </div>
              </div>
            )}
            
            {qrCodeUrl && (
              <>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {qrCodeType === 'volunteer' 
                      ? 'For volunteer check-in at the event.' 
                      : 'For recipient check-in at the event.'}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    qrCodeType === 'volunteer'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-green-100 text-green-800 border border-green-300'
                  }`}>
                    {qrCodeType === 'volunteer' ? 'Volunteer' : 'Recipient'}
                  </span>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={downloadQRCode}
                    className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all font-medium shadow-sm"
                  >
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-sm"
                  >
                    Close
                  </motion.button>
                </div>
              </>
            )}
            
            {!qrCodeUrl && !isGenerating && (
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-sm"
                >
                  Close
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}