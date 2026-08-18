"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative bg-background border-b border-border/40 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[460px] lg:min-h-[500px] lg:max-h-[580px]">
          
          {/* Mobile Image (Shown first on mobile/tablet < 1024px) */}
          <div className="block lg:hidden w-full">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-xs">
              <Image
                src="/images/hero-menswear.jpg"
                alt="Men's Fashion - Tailored Shirts and Smart Trousers"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-[center_15%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Feature Pill Overlay */}
              <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-border/60 text-[11px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Shirts & Trousers
              </div>
            </div>
          </div>

          {/* Left Content (45% width on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-center items-start text-left z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black tracking-widest uppercase mb-3 sm:mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Collection</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-black tracking-tight text-foreground uppercase leading-[1.1] mb-3 sm:mb-4">
              Elevate Your <br />
              <span className="text-primary">Everyday Style</span>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed max-w-md mb-6 sm:mb-8 font-medium">
              Premium shirts and modern trousers designed for effortless confidence.
            </p>

            {/* CTAs (Max 2 buttons, equal height, consistent radii) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/products?category=formal-shirts"
                className={buttonVariants({
                  size: "lg",
                  className: "h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all rounded-full flex items-center justify-center gap-2",
                })}
              >
                <span>Shop Shirts</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/products?category=pants"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wider bg-background/80 hover:bg-secondary border-border/80 rounded-full flex items-center justify-center transition-all",
                })}
              >
                <span>Shop Pants</span>
              </Link>
            </div>

            {/* Catalog Focus Micro-Stats */}
            <div className="mt-8 pt-6 border-t border-border/40 w-full grid grid-cols-2 gap-4 text-left">
              <div>
                <div className="text-base sm:text-lg font-black text-foreground">34+ Styles</div>
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Formal & Linen Shirts</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-foreground">22+ Cuts</div>
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Tailored Pants & Chinos</div>
              </div>
            </div>
          </div>

          {/* Right Image (55% width on desktop, hidden on mobile in favor of top image) */}
          <div className="hidden lg:block lg:col-span-7 h-full w-full">
            <div className="relative w-full h-[480px] xl:h-[520px] rounded-3xl overflow-hidden bg-muted/60 border border-border/50 shadow-md group">
              <Image
                src="/images/hero-menswear.jpg"
                alt="Men's Fashion - Tailored Shirts and Smart Trousers"
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[center_20%] transition-transform duration-700 ease-out group-hover:scale-102"
              />
              
              {/* Subtle gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />

              {/* Floating Quality Tag */}
              <div className="absolute bottom-5 left-5 bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/60 shadow-lg flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground uppercase tracking-wider">100% Fine Weave</div>
                  <div className="text-[11px] text-muted-foreground font-medium">Tailored Fits & Stretch Comfort</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
