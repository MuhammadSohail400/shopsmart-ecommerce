import { Suspense } from 'react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { MobileBottomNav } from '@/components/storefront/mobile-bottom-nav';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Suspense fallback={<div className="h-16 w-full bg-zinc-950 border-b border-zinc-800" />}>
        <Header />
      </Suspense>
      <main id="main-content" className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

