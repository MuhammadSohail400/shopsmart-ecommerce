import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { siteConfig } from '@/config/site';
import { Toaster } from '@/components/ui/sonner';

const outfit = Outfit({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Modern AI-Powered E-Commerce`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['e-commerce', 'online store', 'shopping', 'electronics', 'apparel', 'ShopSmart'],
  authors: [{ name: 'ShopSmart Team' }],
  metadataBase: new URL('https://shopsmart-ecommerce-store.netlify.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shopsmart-ecommerce-store.netlify.app',
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Modern AI-Powered E-Commerce`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
