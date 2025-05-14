import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { generateQRCode } from '@/services/api';
import Image from 'next/image';
import { AxiosError } from 'axios';
import { Download, Loader2, QrCode } from 'lucide-react';
import { QRCodeResponse as ApiQRCodeResponse } from '@/types/api';

type QRCodeType = 'volunteer' | 'recipient';

interface QRCodeData {
  id: string;
  ipfsCid: string;
  expiresAt: string;
  qrImage: string;
  eventTitle: string;
  eventLocation: string;
  eventType: string;
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onQRCodeGenerated?: (url: string) => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onQRCodeGenerated,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeType, setQrCodeType] = useState<QRCodeType>('volunteer');

  const qrCodeTypeOptions = [
    { value: 'volunteer', label: 'Volunteer QR Code', description: 'QR code for volunteer check-in at the event' },
    { value: 'recipient', label: 'Recipient QR Code', description: 'QR code for recipient check-in and verification' },
  ];

  const handleGenerateQRCode = async () => {
    setIsGenerating(true);
    try {
      const response = await generateQRCode({ eventId, type: qrCodeType });
      
      // More detailed response validation
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Handle the response using the imported type
      const qrCodeData = (response.data as unknown as ApiQRCodeResponse).qrCode;
      if (!qrCodeData || !qrCodeData.qrImage) {
        console.error('Response data:', response.data);
        throw new Error('QR code image not found in response');
      }

      // The qrImage is already a base64 data URL, so we can use it directly
      setQrCodeUrl(qrCodeData.qrImage);
      onQRCodeGenerated?.(qrCodeData.qrImage);
      
      // Show success message
      toast.success('QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      // More specific error message
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message 
        : error instanceof Error 
          ? error.message 
          : 'Failed to generate QR code';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      try {
        // Create a temporary link to download the QR code
        const link = document.createElement('a');
        link.href = qrCodeUrl; // This is already a data URL
        link.download = `${eventId}-${qrCodeType}-qr.png`;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              QR Code Type
            </label>
            <div className="grid gap-4">
              {qrCodeTypeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                    qrCodeType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 bg-white'
                  }`}
                  onClick={() => setQrCodeType(option.value as QRCodeType)}
                >
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className={`block text-sm font-medium ${
                        qrCodeType === option.value ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        {option.description}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex h-5 items-center">
                    <input
                      type="radio"
                      name="qr-code-type"
                      value={option.value}
                      checked={qrCodeType === option.value}
                      onChange={() => setQrCodeType(option.value as QRCodeType)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {qrCodeUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative h-64 w-64">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </button>
                <button
                  onClick={() => {
                    setQrCodeUrl(null);
                    setQrCodeType('volunteer');
                  }}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Generate New QR Code
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleGenerateQRCode}
                disabled={isGenerating}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal; 