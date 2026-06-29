import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NetworkGuard } from '@/components/layout/NetworkGuard';
import type { ReactNode } from 'react';

export default function DappLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <NetworkGuard>
        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </NetworkGuard>
      <Footer />
    </>
  );
}
