// app/layout.tsx
import { SWRProvider } from '@/providers/SWRProvider';
import { AppProvider } from '@/providers/web3Provider';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </SWRProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}