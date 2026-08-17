"use client";

import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Headphones, Mail, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSubscribeNewsletter } from '@/features/marketing/hooks/use-newsletter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const footerNewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FooterNewsletterForm = z.infer<typeof footerNewsletterSchema>;

export function Footer() {
  const subscribeMutation = useSubscribeNewsletter();
  const { register, handleSubmit, reset } = useForm<FooterNewsletterForm>({
    resolver: zodResolver(footerNewsletterSchema),
  });

  const onSubscribe = (data: FooterNewsletterForm) => {
    subscribeMutation.mutate(data.email, {
      onSuccess: () => {
        toast.success('Thank you for subscribing to ShopSmart Fashion updates!');
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
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">On all orders over Rs. 2,500</p>
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
              <span className="text-xl sm:text-2xl tracking-tighter text-foreground font-black">ShopSmart</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Discover refined menswear, effortless staples, and premium fashion designed with fine fabrics and tailored silhouettes.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 rounded-full bg-secondary/60 text-muted-foreground hover:text-primary transition-colors text-xs font-bold">
                IG
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded-full bg-secondary/60 text-muted-foreground hover:text-primary transition-colors text-xs font-bold">
                FB
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
          <p>© {new Date().getFullYear()} ShopSmart Fashion. All rights reserved.</p>
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
