"use client";

import { useState } from 'react';
import { Truck, ShieldCheck, Sparkles, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground text-xs py-2 px-4 relative z-50 border-b border-primary/20">
      <div className="container max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left / Center announcement content */}
        <div className="flex-1 flex items-center justify-center gap-3 text-center overflow-hidden">
          <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Special
          </span>
          <p className="font-semibold truncate">
            Free Worldwide Shipping on all orders over $50 • 30-Day Easy Returns
          </p>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-1 font-bold underline hover:opacity-80 transition-opacity ml-1 whitespace-nowrap text-[11px]"
          >
            Shop Now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss announcement"
          className="text-primary-foreground/80 hover:text-primary-foreground p-0.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
