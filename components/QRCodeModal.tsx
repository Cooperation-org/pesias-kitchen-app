import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { generateQRCode } from '@/services/api';
import { AxiosError } from 'axios';
import { Download, Loader2, QrCode, Eye } from 'lucide-react';

type QRCodeType = 'volunteer' | 'recipient';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle?: string;
  initialType?: QRCodeType;
  eventQRCodes?: {
    volunteer?: {
      qrImage?: string;
      _id?: string;
      ipfsCid?: string;
    };
    recipient?: {
      qrImage?: string;
      _id?: string;
      ipfsCid?: string;
    };
  };
  onQRCodeGenerated?: (type: QRCodeType) => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle = 'Event',
  initialType = 'volunteer',
  eventQRCodes,
  onQRCodeGenerated,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeType, setQrCodeType] = useState<QRCodeType>(initialType);
  
  // Check if QR codes exist
  const hasVolunteerQRCode = !!eventQRCodes?.volunteer?.ipfsCid || !!eventQRCodes?.volunteer?.qrImage;
  const hasRecipientQRCode = !!eventQRCodes?.recipient?.ipfsCid || !!eventQRCodes?.recipient?.qrImage;
  
  // Log QR code status for debugging
  console.log('Event QR Codes:', eventQRCodes);
  
  // Get IPFS gateway URL for a CID - try multiple gateways
  const getIpfsUrl = (cid: string) => {
    if (!cid) return null;
    // Try a more reliable gateway
    return `https://ipfs.io/ipfs/${cid}`;
  };
  
  // Reset state when modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      setQrCodeType(initialType);
      setIsGenerating(false);
      // Clear the current QR code URL when opening modal
      setQrCodeUrl(null);
      // Then update with the correct QR code
      updateQrCodeUrl();
    }
  }, [isOpen, initialType]);
  
  // Update QR code URL when type changes
  useEffect(() => {
    // Clear current QR code when type changes
    setQrCodeUrl(null);
    // Then update with the new type's QR code
    updateQrCodeUrl();
  }, [qrCodeType]);
  
  const handleTypeChange = (type: QRCodeType) => {
    if (type !== qrCodeType) {
      console.log('Changing type to:', type);
      // Clear current QR code before changing type
      setQrCodeUrl(null);
      setQrCodeType(type);
    }
  };

  // Centralized function to update QR code URL from eventQRCodes
  const updateQrCodeUrl = () => {
    let url = null;
    
    if (qrCodeType === 'volunteer' && hasVolunteerQRCode) {
      if (eventQRCodes?.volunteer?.qrImage?.startsWith('data:image')) {
        url = eventQRCodes.volunteer.qrImage;
      } else if (eventQRCodes?.volunteer?.ipfsCid) {
        url = getIpfsUrl(eventQRCodes.volunteer.ipfsCid);
      }
    } else if (qrCodeType === 'recipient' && hasRecipientQRCode) {
      if (eventQRCodes?.recipient?.qrImage?.startsWith('data:image')) {
        url = eventQRCodes.recipient.qrImage;
      } else if (eventQRCodes?.recipient?.ipfsCid) {
        url = getIpfsUrl(eventQRCodes.recipient.ipfsCid);
      }
    }
    
    console.log(`Setting QR URL for ${qrCodeType} type:`, url);
    
    // Always update the URL and force re-render when type changes
    setQrCodeUrl(url);
  };

  const handleGenerateQRCode = async () => {
    // Check if current type already has a QR code
    const hasQRCode = qrCodeType === 'volunteer' ? hasVolunteerQRCode : hasRecipientQRCode;
    
    // If QR code already exists, just display it
    if (hasQRCode) {
      console.log('QR code already exists, updating display');
      updateQrCodeUrl();
      return;
    }
    
    // Generate new QR code
    setIsGenerating(true);
    
    try {
      const response = await generateQRCode({ eventId, type: qrCodeType });
      console.log('Generated QR code response:', response);
      
      // Validate response
      if (!response?.data?.qrCode) {
        throw new Error('QR code data not found in response');
      }

      const { qrCode } = response.data;
      
      // Set the QR code URL - handle both IPFS and base64
      let qrCodeUrl = null;
      if (qrCode.qrImage?.startsWith('data:image')) {
        // If we have a base64 image, use it directly
        qrCodeUrl = qrCode.qrImage;
      } else if (qrCode.ipfsCid) {
        // If we have an IPFS CID, use the gateway URL
        qrCodeUrl = getIpfsUrl(qrCode.ipfsCid);
      } else {
        throw new Error('No valid QR code image found in response');
      }

      console.log('Setting QR code URL:', qrCodeUrl);
      
      // Update the local state with the new QR code
      setQrCodeUrl(qrCodeUrl);
      
      // Notify parent immediately with the new QR code
      onQRCodeGenerated?.(qrCodeType);
      
      // Show success message
      toast.success(`${qrCodeType === 'volunteer' ? 'Volunteer' : 'Recipient'} QR code generated successfully`);
    } catch (error) {
      console.error('Error generating QR code:', error);
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
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `${eventTitle}-${qrCodeType}-qr.png`;
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

  const hasCurrentQRCode = qrCodeType === 'volunteer' ? hasVolunteerQRCode : hasRecipientQRCode;
  const currentTypeLabel = qrCodeType === 'volunteer' ? 'Volunteer' : 'Recipient';
  const otherTypeLabel = qrCodeType === 'volunteer' ? 'Recipient' : 'Volunteer';
  const otherTypeExists = qrCodeType === 'volunteer' ? hasRecipientQRCode : hasVolunteerQRCode;
  const otherTypeActionText = otherTypeExists ? `View ${otherTypeLabel}` : `Generate ${otherTypeLabel}`;

  // Get the appropriate button text based on QR code status
  const getActionButtonText = () => {
    if (hasCurrentQRCode) {
      return `View ${currentTypeLabel} QR Code`;
    } else {
      return `Generate ${currentTypeLabel} QR Code`;
    }
  };

  // Option labels with dynamic text based on QR code existence
  const volunteerLabel = hasVolunteerQRCode ? 'View Volunteer QR Code' : 'Generate Volunteer QR Code';
  const recipientLabel = hasRecipientQRCode ? 'View Recipient QR Code' : 'Generate Recipient QR Code';
  
  // QR code type options
  const qrCodeTypeOptions = [
    { 
      value: 'volunteer' as QRCodeType, 
      label: volunteerLabel,
      description: 'QR code for volunteer check-in at the event',
      exists: hasVolunteerQRCode
    },
    { 
      value: 'recipient' as QRCodeType, 
      label: recipientLabel,
      description: 'QR code for recipient check-in and verification',
      exists: hasRecipientQRCode
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasCurrentQRCode ? 'View QR Code' : 'Generate QR Code'}
          </DialogTitle>
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
                  onClick={() => handleTypeChange(option.value)}
                >
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className={`block text-sm font-medium ${
                        qrCodeType === option.value ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </span>
                      {/* <span className="mt-1 block text-sm text-gray-500">
                        {option.description}
                      </span> */}
                      {option.exists && (
                        <span className="mt-1 text-xs text-green-600 font-medium">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex h-5 items-center">
                    <input
                      type="radio"
                      name="qr-code-type"
                      value={option.value}
                      checked={qrCodeType === option.value}
                      onChange={() => handleTypeChange(option.value)}
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
                <div className="relative h-34 w-34 overflow-hidden border rounded-md">
                  <img
                    key={`qr-image-${qrCodeType}-${qrCodeUrl.substring(0, 50)}`}
                    src={qrCodeUrl}
                    alt={`${currentTypeLabel} QR Code`}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    const otherType = qrCodeType === 'volunteer' ? 'recipient' : 'volunteer';
                    handleTypeChange(otherType);
                  }}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {otherTypeActionText}
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
                    {hasCurrentQRCode ? <Eye className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
                    {getActionButtonText()}
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