"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Flame, Scissors, Zap, ShieldCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useProducts } from '@/hooks/use-catalog';

export function HeroSection() {
  const { data: productsData } = useProducts({ limit: 4 });
  const products = productsData?.pages?.[0]?.data || [];
  
  // Real product images from backend catalog
  const heroImage = products[0]?.images?.[0]?.url || '/products/shirts/shirt-1.jpeg';
  const secondaryImage = products[1]?.images?.[0]?.url || '/products/shirts/shirt-2.jpeg';

  return (
    <section className="relative bg-zinc-950 border-b border-zinc-850 overflow-hidden text-zinc-100">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(225,29,72,0.08),transparent_60%)] pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Actions (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start text-left">
            {/* Small Brand Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-rose-500 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 sm:mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>ASORA / PREMIUM STREETWEAR</span>
            </div>

            {/* Large Cinematic Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-100 uppercase leading-[0.9] sm:leading-[0.88] mb-5 sm:mb-6 font-sans">
              WEAR <br />
              <span className="text-rose-500">YOUR</span> <br />
              STORY.
            </h1>

            {/* Supporting Text */}
            <p className="text-zinc-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mb-8 sm:mb-10 font-normal">
              Premium anime-inspired and graphic T-shirts made for people who want to stand out. Heavyweight cotton, custom prints, engineered for everyday rebellion.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/products"
                className={buttonVariants({
                  size: "lg",
                  className: "h-12 sm:h-14 px-8 text-xs sm:text-sm font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-950/40 rounded flex items-center justify-center gap-2.5 transition-all group",
                })}
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/products?category=custom-t-shirts"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-12 sm:h-14 px-8 text-xs sm:text-sm font-black uppercase tracking-widest bg-zinc-900/80 hover:bg-zinc-850 text-zinc-100 border-zinc-800 hover:border-zinc-700 rounded flex items-center justify-center gap-2 transition-all",
                })}
              >
                <Scissors className="h-4 w-4 text-rose-500" />
                <span>CUSTOMIZE YOUR SHIRT</span>
              </Link>
            </div>

            {/* Brand Pillars Micro-Badge Row */}
            <div className="mt-10 pt-6 border-t border-zinc-850/80 w-full grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-sm sm:text-base font-mono font-bold text-zinc-100 uppercase">240+ GSM</div>
                <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Heavyweight Cotton</div>
              </div>
              <div>
                <div className="text-sm sm:text-base font-mono font-bold text-zinc-100 uppercase">HD PRINTS</div>
                <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Fade-Resistant Art</div>
              </div>
              <div>
                <div className="text-sm sm:text-base font-mono font-bold text-zinc-100 uppercase">CUSTOM CUT</div>
                <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Boxy & Oversized</div>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Editorial Product Visual (5 cols on desktop) */}
          <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group">
              <img
                src={heroImage}
                alt="ASORA Premium Anime Streetwear Collection"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80';
                }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Dark Gradient Overlay for Cinematic Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating Streetwear Badge Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3.5 rounded bg-zinc-950/90 backdrop-blur-md border border-zinc-800 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-100 uppercase font-mono">NEW SEASON DROP</p>
                    <p className="text-[10px] text-zinc-400">Limited Edition Graphic Fits</p>
                  </div>
                </div>
                <Link
                  href="/products?category=new-drops"
                  className="text-xs font-mono font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 uppercase tracking-wider"
                >
                  VIEW <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
