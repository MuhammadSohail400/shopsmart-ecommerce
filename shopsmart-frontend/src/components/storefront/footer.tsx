"use client";

import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Headphones, Mail, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSubscribeNewsletter } from '@/features/marketing/hooks/use-newsletter';
import { usePublicSettings } from '@/hooks/use-admin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const footerNewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FooterNewsletterForm = z.infer<typeof footerNewsletterSchema>;

export function Footer() {
  const { data: publicSettings } = usePublicSettings();
  const storeName = publicSettings?.store_name || 'ShopSmart';
  const currency = publicSettings?.currency || 'PKR';
  const freeShipping = publicSettings?.free_shipping_threshold || '2,500';

  const subscribeMutation = useSubscribeNewsletter();
  const { register, handleSubmit, reset } = useForm<FooterNewsletterForm>({
    resolver: zodResolver(footerNewsletterSchema),
  });

  const onSubscribe = (data: FooterNewsletterForm) => {
    subscribeMutation.mutate(data.email, {
      onSuccess: () => {
        toast.success(`Thank you for subscribing to ${storeName} updates!`);
        reset();
      },
      onError: () => {
        toast.error('Subscription failed. Please try again.');
      },
    });
  };

  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-sm text-foreground">
      {/* Trust Badges Banner */}
      <div className="border-b border-border/40 bg-secondary/20">
        <div className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Free Delivery</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">On all orders over {currency} {Number(freeShipping).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Secure Checkout</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">256-bit SSL encrypted</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">30-Day Easy Returns</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">Hassle-free exchange guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Dedicated Support</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">Mon–Sat 9AM–9PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container max-w-7xl mx-auto py-10 md:py-14 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Col */}
          <div className="sm:col-span-2 space-y-3.5">
            <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-xs">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-xl sm:text-2xl tracking-tighter text-foreground font-black">{storeName}</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Discover refined menswear, effortless staples, and premium fashion designed with fine fabrics and tailored silhouettes.
            </p>
            {/* Premium Social Media Links */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Instagram"
                className="h-9 w-9 rounded-xl bg-secondary/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-muted-foreground hover:text-white border border-border/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xs group"
              >
                <svg className="h-4.5 w-4.5 fill-currentColor transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Facebook"
                className="h-9 w-9 rounded-xl bg-secondary/80 hover:bg-[#1877F2] text-muted-foreground hover:text-white border border-border/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xs group"
              >
                <svg className="h-4.5 w-4.5 fill-currentColor transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on X"
                className="h-9 w-9 rounded-xl bg-secondary/80 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-muted-foreground border border-border/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xs group"
              >
                <svg className="h-4 w-4 fill-currentColor transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on TikTok"
                className="h-9 w-9 rounded-xl bg-secondary/80 hover:bg-black hover:text-white text-muted-foreground border border-border/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xs group"
              >
                <svg className="h-4.5 w-4.5 fill-currentColor transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>

              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className="h-9 w-9 rounded-xl bg-secondary/80 hover:bg-[#25D366] text-muted-foreground hover:text-white border border-border/50 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xs group"
              >
                <svg className="h-4.5 w-4.5 fill-currentColor transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shop</p>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/products?category=men" className="text-muted-foreground hover:text-primary transition-colors">
                  Men&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/products?category=women" className="text-muted-foreground hover:text-primary transition-colors">
                  Women&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/products?category=kids" className="text-muted-foreground hover:text-primary transition-colors">
                  Kids & Teens
                </Link>
              </li>
              <li>
                <Link href="/products?category=new-arrivals" className="text-muted-foreground hover:text-primary transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?category=sale" className="text-rose-600 dark:text-rose-400 font-bold hover:underline">
                  Sale (Up to 50% Off)
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Care</p>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us & FAQ
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-primary transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stay in Style</p>
            <p className="text-xs text-muted-foreground">Get new arrivals, exclusive offers and fashion updates.</p>
            <form onSubmit={handleSubmit(onSubscribe)} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  className="pl-9 h-10 rounded-xl text-xs bg-background"
                  {...register('email')}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full rounded-xl font-bold shadow-xs h-9 text-xs"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border/40 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Shipping Information</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
