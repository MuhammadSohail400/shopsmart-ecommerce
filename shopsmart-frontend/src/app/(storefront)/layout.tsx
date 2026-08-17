import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { MobileBottomNav } from '@/components/storefront/mobile-bottom-nav';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
