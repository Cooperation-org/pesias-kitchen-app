import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
// No need to import Image from next/image
import { Download, Loader2, QrCode } from 'lucide-react';

interface QRCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle?: string;
  qrCodeType: 'volunteer' | 'recipient';
  qrCodeData?: {
    ipfsCid: string;
  } | null;
  onGenerateClick?: () => void;
}

const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  qrCodeType,
  qrCodeData,
  onGenerateClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle download button click
  const handleDownload = () => {
    if (qrCodeData?.ipfsCid) {
      try {
        // Create a temporary link to download the QR code
        const qrImageUrl = `https://gateway.pinata.cloud/ipfs/${qrCodeData.ipfsCid}`;
        const link = document.createElement('a');
        link.href = qrImageUrl;
        link.download = `${eventTitle || eventId}-${qrCodeType}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR code downloaded successfully');
      } catch (error) {
        console.error('Error downloading QR code:', error);
        toast.error('Failed to download QR code');
      }
    }
  };

  // Determine title and color based on QR code type
  const typeLabel = qrCodeType === 'volunteer' ? 'Volunteer' : 'Recipient';
  const typeColor = qrCodeType === 'volunteer' ? 'bg-green-500' : 'bg-purple-500';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {qrCodeData ? `${typeLabel} QR Code` : 'Generate QR Code'}
            {eventTitle && ` for ${eventTitle}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* QR Code display when available */}
          {qrCodeData ? (
            <div className="space-y-4">
              <div className={`h-2 w-full ${typeColor}`}></div>
              <div className="flex justify-center">
                <div className="relative h-64 w-64 border rounded-lg overflow-hidden">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
                  
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-4">
                      <p className="text-red-500 text-center">{error}</p>
                    </div>
                  )}
                  
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${qrCodeData.ipfsCid}`}
                    alt={`${typeLabel} QR Code`}
                    className="w-full h-full object-contain"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setError('Failed to load QR code image');
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  disabled={isLoading || !!error}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Generate button when QR code is not available */
            <div className="flex justify-center">
              <button
                onClick={onGenerateClick}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Generate {typeLabel} QR Code
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeViewer;