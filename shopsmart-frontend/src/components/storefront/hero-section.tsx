"use client";

import Link from 'next/link';
import { ArrowRight, Flame, Scissors, Zap } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative bg-zinc-950 border-b border-zinc-850 overflow-hidden text-zinc-100">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(225,29,72,0.12),transparent_65%)] pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Actions (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start text-left">
            {/* Small Brand Eyebrow */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-rose-500 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase mb-3 sm:mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>ASORA / PREMIUM ANIME STREETWEAR</span>
            </div>

            {/* Cinematic Headline with Balanced Proportions */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-zinc-100 uppercase leading-[1.0] sm:leading-[0.95] mb-4 font-sans">
              WEAR <br />
              <span className="text-rose-500">YOUR</span> <br />
              STORY.
            </h1>

            {/* Supporting Text */}
            <p className="text-zinc-400 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg mb-6 font-normal">
              Premium anime-inspired and graphic T-shirts made for people who want to stand out. Heavyweight 240+ GSM combed cotton, fade-proof prints, engineered for everyday rebellion.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                href="/products"
                className={buttonVariants({
                  size: "lg",
                  className: "h-11 sm:h-12 px-7 text-xs font-mono font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-950/40 rounded flex items-center justify-center gap-2 transition-all group",
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
                  className: "h-11 sm:h-12 px-7 text-xs font-mono font-bold uppercase tracking-widest bg-zinc-900/80 hover:bg-zinc-850 text-zinc-100 border-zinc-800 hover:border-zinc-700 rounded flex items-center justify-center gap-2 transition-all",
                })}
              >
                <Scissors className="h-4 w-4 text-rose-500" />
                <span>CUSTOMIZE YOUR SHIRT</span>
              </Link>
            </div>

            {/* Brand Pillars Micro-Badge Row */}
            <div className="mt-8 pt-5 border-t border-zinc-850/80 w-full grid grid-cols-3 gap-3 text-left">
              <div>
                <div className="text-xs sm:text-sm font-mono font-bold text-zinc-100 uppercase">240+ GSM</div>
                <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Heavyweight Cotton</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-mono font-bold text-zinc-100 uppercase">HD PRINTS</div>
                <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Fade-Proof Art</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-mono font-bold text-zinc-100 uppercase">BOXY CUT</div>
                <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Oversized Fit</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Streetwear Tee Visual (5 cols on desktop) */}
          <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] max-h-[440px] lg:max-h-[480px] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group">
              <img
                src="/images/asora-hero.jpg"
                alt="ASORA Premium Anime Streetwear Graphic T-Shirt"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80';
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Dark Gradient Overlay for Cinematic Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Streetwear Badge Overlay */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between p-3 rounded bg-zinc-950/95 backdrop-blur-md border border-zinc-800 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-zinc-100 uppercase font-mono leading-tight">LIMITED ANIME DROP</p>
                    <p className="text-[9px] text-zinc-400">Oversized Graphic Heavyweight</p>
                  </div>
                </div>
                <Link
                  href="/products?category=new-drops"
                  className="text-[10px] font-mono font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 uppercase tracking-wider bg-zinc-900 px-2 py-1 rounded border border-zinc-800"
                >
                  VIEW <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
