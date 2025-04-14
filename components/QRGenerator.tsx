// src/components/QRGenerator.tsx
import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRGeneratorProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
  logoUrl?: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({
  value,
  size = 200,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  level = 'H',
  includeMargin = true,
  className = '',
  logoUrl
}) => {
  // Generate a random ID for the QR code if it includes a logo
  const qrId = useMemo(() => logoUrl ? `qr-${Math.random().toString(36).substr(2, 9)}` : undefined, [logoUrl]);

  return (
    <div className={`qr-code-container ${className}`}>
      <QRCodeSVG
        id={qrId}
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
        imageSettings={
          logoUrl
            ? {
                src: logoUrl,
                x: undefined,
                y: undefined,
                height: size * 0.25,
                width: size * 0.25,
                excavate: true,
              }
            : undefined
        }
      />
    </div>
  );
};

export default QRGenerator;