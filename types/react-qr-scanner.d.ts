declare module '@yudiel/react-qr-scanner' {
  import { CSSProperties } from 'react';

  interface ScannerStyles {
    container: CSSProperties;
    video: CSSProperties;
  }

  interface ScannerProps {
    onScan: (result: string | null) => void;
    onError?: (error: Error) => void;
    constraints?: MediaTrackConstraints;
    styles?: ScannerStyles;
  }

  export const Scanner: React.FC<ScannerProps>;
} 