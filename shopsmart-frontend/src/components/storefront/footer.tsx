"use client";

import Link from 'next/link';
import { ShieldCheck, Truck, RefreshCw, Headphones, Mail, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSubscribeNewsletter } from '@/features/marketing/hooks/use-newsletter';
import { usePublicSettings } from '@/hooks/use-admin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { formatCurrency, parseNumericAmount, formatWhatsAppUrl } from '@/lib/utils';

const footerNewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FooterNewsletterForm = z.infer<typeof footerNewsletterSchema>;

export function Footer() {
  const { data: publicSettings } = usePublicSettings();
  const storeName = 'ASORA';
  const freeShippingThreshold = parseNumericAmount(publicSettings?.free_shipping_threshold, 2500);
  const whatsappUrl = formatWhatsAppUrl(publicSettings?.whatsapp_number || publicSettings?.support_phone || '03110297772');

  const subscribeMutation = useSubscribeNewsletter();
  const { register, handleSubmit, reset } = useForm<FooterNewsletterForm>({
    resolver: zodResolver(footerNewsletterSchema),
  });

  const onSubscribe = (data: FooterNewsletterForm) => {
    subscribeMutation.mutate(data.email, {
      onSuccess: () => {
        toast.success(`You're on the list! Welcome to ASORA Drops.`);
        reset();
      },
      onError: () => {
        toast.error('Subscription failed. Please try again.');
      },
    });
  };

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-100">
      {/* ── Brand Trust & Value Badges ───────────────────────────── */}
      <div className="border-b border-zinc-850 bg-zinc-900/40">
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">Free Nationwide Shipping</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">On all orders over {formatCurrency(freeShippingThreshold)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">Heavyweight 240+ GSM</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">100% Combed cotton & high-density screenprints</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">30-Day Easy Exchange</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Hassle-free sizing exchanges nationwide</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">Cash On Delivery</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Inspect your drop at doorstep before paying</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ────────────────────────────────────────── */}
      <div className="container max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Manifesto Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="font-black text-2xl tracking-tighter text-white uppercase">
                ASORA
              </span>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded uppercase">
                WEAR YOUR STORY
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Premium anime-inspired streetwear, oversized graphic apparel, and custom engineered prints. Born for creators, otakus, and night city dreamers.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Instagram"
                className="h-9 w-9 rounded bg-zinc-850 hover:bg-gradient-to-tr hover:from-amber-600 hover:via-rose-600 hover:to-purple-600 text-zinc-100 hover:text-white border border-zinc-700 hover:border-transparent flex items-center justify-center transition-all shadow-md group"
              >
                <svg className="h-4.5 w-4.5 fill-currentColor transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Facebook"
                className="h-9 w-9 rounded bg-zinc-850 hover:bg-[#1877F2] text-zinc-100 hover:text-white border border-zinc-700 hover:border-transparent flex items-center justify-center transition-all shadow-md group"
              >
                <svg className="h-4.5 w-4.5 fill-currentColor transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on X"
                className="h-9 w-9 rounded bg-zinc-850 hover:bg-zinc-100 text-zinc-100 hover:text-zinc-950 border border-zinc-700 hover:border-transparent flex items-center justify-center transition-all shadow-md group"
              >
                <svg className="h-4 w-4 fill-currentColor transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className="h-9 w-9 rounded bg-zinc-850 hover:bg-[#25D366] text-zinc-100 hover:text-white border border-zinc-700 hover:border-transparent flex items-center justify-center transition-all shadow-md group"
              >
                <svg className="h-4.5 w-4.5 fill-currentColor transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">Collections</p>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/products?category=anime-collection" className="text-zinc-400 hover:text-white transition-colors">
                  Anime Drops
                </Link>
              </li>
              <li>
                <Link href="/products?category=oversized-t-shirts" className="text-zinc-400 hover:text-white transition-colors">
                  Oversized T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=graphic-prints" className="text-zinc-400 hover:text-white transition-colors">
                  Graphic Prints
                </Link>
              </li>
              <li>
                <Link href="/customizer" className="text-zinc-400 hover:text-white transition-colors">
                  Custom T-Shirt Studio
                </Link>
              </li>
              <li>
                <Link href="/products?category=minimal-collection" className="text-zinc-400 hover:text-white transition-colors">
                  Minimal Series
                </Link>
              </li>
              <li>
                <Link href="/products?category=new-drops" className="text-rose-400 hover:text-rose-300 transition-colors font-bold">
                  New Drops 🔥
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">Customer Care</p>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/orders" className="text-zinc-400 hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  FAQs & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">Exclusive Drops</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Get early access to limited anime t-shirt drops and exclusive discount codes.
            </p>
            <form onSubmit={handleSubmit(onSubscribe)} className="space-y-2">
              <div className="relative">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 focus-visible:ring-rose-500 rounded"
                />
              </div>
              <Button
                type="submit"
                disabled={subscribeMutation.isPending}
                size="sm"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider h-9 rounded"
              >
                {subscribeMutation.isPending ? 'Joining...' : 'Join The Drop'}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Guarantee */}
        <div className="border-t border-zinc-850 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="font-mono text-[11px]">
            © {new Date().getFullYear()} ASORA STREETWEAR. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <Link href="/contact" className="hover:text-zinc-200">PRIVACY POLICY</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-zinc-200">TERMS OF SERVICE</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
