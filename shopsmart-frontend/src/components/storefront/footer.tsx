"use client";

import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Headphones, Mail } from 'lucide-react';
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
        toast.success('Thank you for subscribing to ShopSmart!');
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
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Fast & Free Shipping</p>
                <p className="text-xs text-muted-foreground">On all orders over $50</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Secure Checkout</p>
                <p className="text-xs text-muted-foreground">256-bit SSL encrypted</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">30-Day Easy Returns</p>
                <p className="text-xs text-muted-foreground">Hassle-free guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">24/7 Dedicated Support</p>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-2xl tracking-tighter text-foreground">ShopSmart</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The intelligent, modern e-commerce storefront delivering top-tier products, guaranteed security, and instant fulfillment.
            </p>
          </div>

          {/* Quick Shop */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shop</p>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Support</p>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-primary transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Newsletter</p>
            <p className="text-xs text-muted-foreground">Subscribe for product updates and insider deals.</p>
            <form onSubmit={handleSubmit(onSubscribe)} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Your email..."
                  className="pl-9 h-10 rounded-xl text-xs bg-background"
                  {...register('email')}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full rounded-xl font-semibold shadow-sm h-9"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ShopSmart AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-primary transition-colors">Help Center</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
