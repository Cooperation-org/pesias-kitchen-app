import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anonymous Scan - Pesia\'s Kitchen EAT Initiative',
  description: 'Scan QR codes to record your participation in food rescue activities. No signup required.',
  robots: 'noindex, nofollow', // Keep anonymous scanning private
};

export default function AnonymousScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {children}
      
      {/* Simple footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Pesia's Kitchen EAT Initiative</p>
          <p className="mt-1">Privacy-first community impact tracking</p>
        </div>
      </div>
    </div>
  );
}