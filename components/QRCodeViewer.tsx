import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { QRCode as QRCodeType } from '@/components/EventDetailsModal';

interface QRCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  volunteerQRCode?: QRCodeType;
  recipientQRCode?: QRCodeType;
  onGenerateVolunteerQR: () => void;
  onGenerateRecipientQR: () => void;
}

const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  isOpen,
  onClose,
  eventTitle,
  volunteerQRCode,
  recipientQRCode,
  onGenerateVolunteerQR,
  onGenerateRecipientQR
}) => {
  // State to track if images are loaded
  const [volunteerImageLoaded, setVolunteerImageLoaded] = useState(false);
  const [volunteerImageError, setVolunteerImageError] = useState(false);
  const [recipientImageLoaded, setRecipientImageLoaded] = useState(false);
  const [recipientImageError, setRecipientImageError] = useState(false);
  const [expandedQRCode, setExpandedQRCode] = useState<'volunteer' | 'recipient' | null>(null);
  
  // Reset states when component opens
  useEffect(() => {
    if (isOpen) {
      setVolunteerImageLoaded(false);
      setVolunteerImageError(false);
      setRecipientImageLoaded(false);
      setRecipientImageError(false);
      setExpandedQRCode(null);
    }
  }, [isOpen, volunteerQRCode, recipientQRCode]);

  // Get QR code image URL from IPFS
  const getQRCodeImageUrl = (cid: string | undefined) => {
    if (!cid) return null;
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  };

  // Render a single QR code section
  const renderQRCodeSection = (
    type: 'volunteer' | 'recipient',
    qrCode: QRCodeType | undefined,
    isLoaded: boolean,
    hasError: boolean,
    onLoad: () => void,
    onError: () => void,
    onGenerate: () => void
  ) => {
    const displayType = type.charAt(0).toUpperCase() + type.slice(1);
    const isExpanded = expandedQRCode === type;
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">{displayType} QR Code</h3>
          {qrCode && !isExpanded && (
            <button
              onClick={() => setExpandedQRCode(type)}
              className="py-1.5 px-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              View Code
            </button>
          )}
        </div>
        
        {!qrCode ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No QR code has been generated yet</p>
            <button
              onClick={onGenerate}
              className="py-2 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Generate {displayType} QR Code
            </button>
          </div>
        ) : isExpanded ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {hasError ? (
                <div className="flex items-center justify-center w-[200px] h-[200px] bg-gray-100 text-gray-500 text-center p-4">
                  QR code image could not be loaded
                </div>
              ) : (
                <img 
                  src={getQRCodeImageUrl(qrCode.ipfsCid) || ''}
                  alt={`${displayType} QR Code for ${eventTitle}`}
                  width="200"
                  height="200"
                  className="mx-auto"
                  onLoad={onLoad}
                  onError={onError}
                />
              )}
            </div>
            
            {isLoaded && !hasError && (
              <>
                <p className="mt-3 text-sm text-gray-500">
                  Scan this QR code for {type} check-in
                </p>
                <div className="mt-3 p-2 bg-blue-50 text-blue-700 rounded-md text-sm w-full text-center">
                  <p>QR Code ID: {qrCode._id}</p>
                  <p className="text-xs mt-1">Used {qrCode.usedCount} times</p>
                  {hasError && (
                    <p className="text-xs text-red-500 mt-1">
                      Tip: You may need to try a different IPFS gateway
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    className="py-2 px-4 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = getQRCodeImageUrl(qrCode.ipfsCid) || '';
                      link.download = `${eventTitle}-${type}-qrcode.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => setExpandedQRCode(null)}
                    className="py-2 px-4 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Hide
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">QR Code ID: {qrCode._id}</p>
                <p className="text-xs text-gray-500 mt-1">Used {qrCode.usedCount} times</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-lg p-6 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">QR Codes</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-gray-700 mb-1 font-medium">Event</h3>
              <p className="text-gray-900">{eventTitle}</p>
            </div>
            
            {/* Volunteer QR Code */}
            {renderQRCodeSection(
              'volunteer',
              volunteerQRCode,
              volunteerImageLoaded,
              volunteerImageError,
              () => setVolunteerImageLoaded(true),
              () => setVolunteerImageError(true),
              onGenerateVolunteerQR
            )}
            
            {/* Recipient QR Code */}
            {renderQRCodeSection(
              'recipient',
              recipientQRCode,
              recipientImageLoaded,
              recipientImageError,
              () => setRecipientImageLoaded(true),
              () => setRecipientImageError(true),
              onGenerateRecipientQR
            )}
            
            <button
              onClick={onClose}
              className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QRCodeViewer;