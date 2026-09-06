import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'WatchTogether - Birlikte İzle, Birlikte Konuş',
  description: 'Arkadaşlarınla aynı odada buluş. Sesli konuş, sohbet et ve YouTube veya Netflix videolarını senkronize şekilde birlikte izle.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-[#0B0D12] text-white antialiased selection:bg-violet-600 selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
