"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, Flame, Scissors, Zap, ShieldCheck, 
  Truck, RefreshCw, CheckCircle2, Camera, MessageSquareHeart, 
  Layers, Package, Star 
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductGrid, ProductGridSkeleton } from '@/components/storefront/product-grid';
import { useProducts, useCategories } from '@/hooks/use-catalog';
import { HeroSection } from '@/components/storefront/hero-section';
import { SectionErrorBoundary } from '@/components/shared/section-error-boundary';
import { useSubscribeNewsletter } from '@/features/marketing/hooks/use-newsletter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const dropNewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type DropNewsletterForm = z.infer<typeof dropNewsletterSchema>;

export default function HomePage() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ limit: 40 });
  const { data: categoriesData } = useCategories();
  
  const products = productsData?.pages?.[0]?.data || [];

  // Categorize or slice real products
  const trendingProducts = products.slice(0, 4);
  const newDropsProducts = products.length >= 8 ? products.slice(4, 8) : products.slice(0, 4);

  // Newsletter hook
  const subscribeMutation = useSubscribeNewsletter();
  const { register, handleSubmit, reset } = useForm<DropNewsletterForm>({
    resolver: zodResolver(dropNewsletterSchema),
  });

  const onSubscribe = (data: DropNewsletterForm) => {
    subscribeMutation.mutate(data.email, {
      onSuccess: () => {
        toast.success("You're on the list! Welcome to ASORA Drops.");
        reset();
      },
      onError: () => {
        toast.error('Subscription failed. Please try again.');
      },
    });
  };

  return (
    <div className="flex flex-col gap-0 pb-16 overflow-x-hidden bg-zinc-950 text-zinc-100">
      
      {/* ── 1. CINEMATIC HERO SECTION ─────────────────────────────── */}
      <HeroSection />

      {/* ── 2. TRENDING NOW SECTION ───────────────────────────────── */}
      <SectionErrorBoundary fallbackTitle="Trending items unavailable">
        <section className="container max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-mono font-bold mb-1.5 uppercase tracking-widest">
                <Flame className="h-3.5 w-3.5" /> POPULAR CUTS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-100 uppercase">
                TRENDING NOW
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md">
                The pieces everyone is wearing right now.
              </p>
            </div>
            <Link 
              href="/products" 
              className="text-rose-400 hover:text-rose-300 font-mono font-bold text-xs sm:text-sm flex items-center gap-1 group uppercase tracking-wider"
            >
              <span>EXPLORE ALL</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {isLoadingProducts ? (
            <ProductGridSkeleton count={4} />
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </section>
      </SectionErrorBoundary>

      {/* ── 3. ANIME COLLECTION SECTION ───────────────────────────── */}
      <section className="border-t border-zinc-850/80 bg-zinc-900/30 py-12 sm:py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-mono font-bold mb-2 uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5" /> CURATED CAPSULES
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-100 uppercase">
              ANIME COLLECTION
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Icons, characters and worlds that became part of our story.
            </p>
          </div>

          {/* 4 Editorial Category Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Tile 1: Anime Collection */}
            <Link
              href="/products?category=anime-collection"
              className="group relative rounded-md bg-zinc-900 border border-zinc-800 p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-rose-500/50 hover:bg-zinc-850 min-h-[220px]"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-600/5 rounded-full blur-2xl group-hover:bg-rose-600/15 transition-all pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2">
                  01 / CAPSULE
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-100 uppercase tracking-tight group-hover:text-rose-400 transition-colors">
                  Anime Collection
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Cyberpunk, shonen legends & dark gothic anime aesthetics.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-mono font-bold text-zinc-300 group-hover:text-rose-400 uppercase tracking-wider gap-1.5">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Tile 2: Graphic Prints */}
            <Link
              href="/products?category=graphic-prints"
              className="group relative rounded-md bg-zinc-900 border border-zinc-800 p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-rose-500/50 hover:bg-zinc-850 min-h-[220px]"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-600/5 rounded-full blur-2xl group-hover:bg-rose-600/15 transition-all pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2">
                  02 / PRINTS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-100 uppercase tracking-tight group-hover:text-rose-400 transition-colors">
                  Graphic Prints
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  High-density back prints and bold streetwear statement art.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-mono font-bold text-zinc-300 group-hover:text-rose-400 uppercase tracking-wider gap-1.5">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Tile 3: Oversized T-Shirts */}
            <Link
              href="/products?category=oversized-t-shirts"
              className="group relative rounded-md bg-zinc-900 border border-zinc-800 p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-rose-500/50 hover:bg-zinc-850 min-h-[220px]"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-600/5 rounded-full blur-2xl group-hover:bg-rose-600/15 transition-all pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2">
                  03 / SILHOUETTE
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-100 uppercase tracking-tight group-hover:text-rose-400 transition-colors">
                  Oversized T-Shirts
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Heavyweight 240+ GSM drop-shoulder boxy silhouettes.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-mono font-bold text-zinc-300 group-hover:text-rose-400 uppercase tracking-wider gap-1.5">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Tile 4: Minimal Collection */}
            <Link
              href="/products?category=minimal-collection"
              className="group relative rounded-md bg-zinc-900 border border-zinc-800 p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-rose-500/50 hover:bg-zinc-850 min-h-[220px]"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-600/5 rounded-full blur-2xl group-hover:bg-rose-600/15 transition-all pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2">
                  04 / ESSENTIALS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-100 uppercase tracking-tight group-hover:text-rose-400 transition-colors">
                  Minimal Series
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Clean subtle typography, tonal chest hits & pure cotton.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-mono font-bold text-zinc-300 group-hover:text-rose-400 uppercase tracking-wider gap-1.5">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── 4. CUSTOM T-SHIRT FEATURE (SIGNATURE DIFFERENTIATOR) ──── */}
      <section className="container max-w-7xl mx-auto py-12 sm:py-20 px-4 sm:px-6">
        <div className="relative rounded-lg bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-8 sm:p-12 lg:p-16 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold tracking-widest uppercase">
                <Scissors className="h-3.5 w-3.5" />
                <span>ASORA CUSTOM STUDIO</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-100 uppercase leading-[0.95]">
                MAKE IT <br />
                <span className="text-rose-500">YOURS.</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 font-mono font-semibold">
                Your design. Your fit. Your story.
              </p>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Create a T-shirt that feels like it belongs to you. Whether it&apos;s your original illustration, favorite anime panel, or customized streetwear typography — our studio prints on heavy 240+ GSM combed cotton with high-density fade-proof colors.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>No Minimum Quantity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>240+ GSM Combed Cotton</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>High-Density HD Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Nationwide Cash on Delivery</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/customizer"
                  className={buttonVariants({
                    size: "lg",
                    className: "h-12 sm:h-14 px-8 text-xs sm:text-sm font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white shadow-xl rounded flex items-center justify-center gap-2 transition-all w-full sm:w-auto",
                  })}
                >
                  <Scissors className="h-4 w-4" />
                  <span>CUSTOMIZE YOUR SHIRT</span>
                </Link>
              </div>
            </div>

            {/* Right Graphic Preview Box */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md aspect-square rounded-md bg-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between shadow-2xl relative">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-500 border-b border-zinc-850 pb-3">
                  <span>PRINT STUDIO SPEC</span>
                  <span>ASORA-DTF-01</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center my-auto py-6">
                  <div className="h-16 w-16 rounded-full bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
                    <Layers className="h-8 w-8" />
                  </div>
                  <span className="text-lg font-black uppercase text-zinc-100 tracking-tight">
                    Custom Print Canvas
                  </span>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    Front chest, full back artwork, or oversized print placement.
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 border-t border-zinc-850 pt-3">
                  <span>100% ORGANIC COTTON</span>
                  <span className="text-rose-400">READY TO PRINT</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. NEW DROPS SECTION ─────────────────────────────────── */}
      <SectionErrorBoundary fallbackTitle="New drops unavailable">
        <section className="container max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-mono font-bold mb-1.5 uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> FRESH RELEASES
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-100 uppercase">
                NEW DROPS 🔥
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md">
                Fresh prints. Limited energy. No basic fits.
              </p>
            </div>
            <Link 
              href="/products?category=new-drops" 
              className="text-rose-400 hover:text-rose-300 font-mono font-bold text-xs sm:text-sm flex items-center gap-1 group uppercase tracking-wider"
            >
              <span>SHOP ALL DROPS</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {isLoadingProducts ? (
            <ProductGridSkeleton count={4} />
          ) : newDropsProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {newDropsProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </section>
      </SectionErrorBoundary>

      {/* ── 6. WHY ASORA? BRAND PILLARS ──────────────────────────── */}
      <section className="border-t border-zinc-850/80 bg-zinc-900/40 py-16 sm:py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-mono font-bold mb-2 uppercase tracking-widest">
              <span>CRAFT & ENGINEERING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-100 uppercase">
              WHY ASORA?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Built differently from fabric to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-2xl font-black font-mono text-rose-500 block">01</span>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                PREMIUM FABRIC
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Comfortable heavyweight apparel designed for everyday wear and durability.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-2xl font-black font-mono text-rose-500 block">02</span>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                HIGH-QUALITY PRINTS
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sharp, vibrant artwork made to stay bold through everyday washing.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-2xl font-black font-mono text-rose-500 block">03</span>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                ORIGINAL DESIGNS
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Designed for people who refuse to wear generic, basic clothing.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-2xl font-black font-mono text-rose-500 block">04</span>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                CUSTOM PRINTING
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Turn your individual idea or art into something tangible you can wear.
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-2xl font-black font-mono text-rose-500 block">05</span>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                NATIONWIDE DELIVERY
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ASORA drops delivered across Pakistan with safe Cash on Delivery.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. THE ASORA COMMUNITY ───────────────────────────────── */}
      <section className="container max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-mono font-bold mb-2 uppercase tracking-widest">
            <Camera className="h-3.5 w-3.5" /> #WEARYOURSTORY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-100 uppercase">
            THE ASORA COMMUNITY
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Anime. Streetwear. Your story.
          </p>
        </div>

        {/* Visual Community Grid using authentic streetwear photography */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {['/images/asora-hero.jpg', '/images/asora-streetwear-1.jpg', '/images/asora-streetwear-2.jpg', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80'].map((imgUrl, idx) => (
            <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src={imgUrl}
                alt="ASORA Streetwear Fit"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-700">
                  @asora.pk
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              variant: "outline",
              className: "border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-200 font-mono font-bold text-xs uppercase tracking-widest px-6 h-11 rounded gap-2",
            })}
          >
            <Camera className="h-4 w-4 text-rose-500" />
            <span>FOLLOW @ASORA.PK</span>
          </a>
        </div>
      </section>

      {/* ── 8. CUSTOMER REVIEWS (WHAT THE COMMUNITY SAYS) ─────────── */}
      <section className="border-t border-zinc-850/80 bg-zinc-900/30 py-16 sm:py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-mono font-bold mb-2 uppercase tracking-widest">
              <MessageSquareHeart className="h-3.5 w-3.5" /> VERIFIED DROPS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-100 uppercase">
              WHAT THE COMMUNITY SAYS
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Honest feedback from people wearing their story.
            </p>
          </div>

          {/* Polished Authentic Review Showcase / Community Note */}
          <div className="max-w-2xl mx-auto p-8 rounded-md bg-zinc-950 border border-zinc-800 text-center space-y-4 shadow-xl">
            <div className="flex justify-center gap-1 text-rose-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-rose-500" />
              ))}
            </div>
            <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tight">
              Your story could be next.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
              Verified community reviews and fit photos appear here once drops are delivered. Order your drop today and share your experience with the community.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className={buttonVariants({
                  size: "sm",
                  className: "bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider h-10 px-6 rounded",
                })}
              >
                START SHOPPING
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. JOIN THE DROP (NEWSLETTER) ─────────────────────────── */}
      <section className="container max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6">
        <div className="relative rounded-lg bg-zinc-900 border border-zinc-800 p-8 sm:p-14 text-center max-w-3xl mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.08),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded bg-zinc-950 border border-zinc-800 text-rose-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <Sparkles className="h-3 w-3" /> EXCLUSIVE ACCESS
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-zinc-100 uppercase">
              JOIN THE DROP.
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Be the first to know about new designs, limited drops and exclusive releases.
            </p>

            <form onSubmit={handleSubmit(onSubscribe)} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-4">
              <Input
                {...register('email')}
                type="email"
                placeholder="ENTER YOUR EMAIL"
                className="h-12 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs font-mono uppercase focus-visible:ring-rose-500 rounded flex-1"
              />
              <Button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="h-12 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-widest px-8 rounded shrink-0 shadow-lg"
              >
                {subscribeMutation.isPending ? 'JOINING...' : 'JOIN ASORA'}
              </Button>
            </form>
            
            <p className="text-[10px] font-mono text-zinc-500 pt-2">
              NO SPAM. ONLY PURE STREETWEAR DROPS.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
