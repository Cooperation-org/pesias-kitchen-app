// src/components/QRScanner.tsx
import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanComplete?: () => void;
}

interface ScannerStyles {
  container: React.CSSProperties;
  video: React.CSSProperties;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScanSuccess, 
  onScanComplete
}: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const handleScan = (result: string | null): void => {
    if (result) {
      // Successfully scanned QR code
      setIsScanning(false);
      onScanSuccess(result);
      if (onScanComplete) onScanComplete();
    }
  };

  const handleError = (error: Error): void => {
    console.error(error);
  };

  const scannerStyles: ScannerStyles = {
    container: {
      width: '100%',
      height: '250px',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    },
    video: {
      width: '100%',
      height: '100%',
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4">
      {isScanning ? (
        <div className="w-full relative">
          <div className="rounded-xl overflow-hidden">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              styles={scannerStyles}
            />
          </div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
          </div>
        </div>
      ) : (
        <div className="w-full h-64 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
          <p className="text-gray-500">QR Code captured!</p>
        </div>
      )}
      
      <button 
        onClick={() => setIsScanning(!isScanning)} 
        className={`${isScanning ? 
          'bg-red-500 hover:bg-red-600' : 
          'bg-blue-500 hover:bg-blue-600'
        } text-white border-none rounded-full py-3 px-6 text-base font-semibold cursor-pointer transition-colors w-4/5 max-w-xs mt-4`}
      >
        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>
    </div>
  );
};

export default QRScanner;