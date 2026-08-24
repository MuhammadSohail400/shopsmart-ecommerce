"use client";

import { useState } from 'react';
import { resolveMediaUrl } from '@/lib/utils';
import { Scissors, ShoppingBag } from 'lucide-react';

interface CustomGarmentThumbnailProps {
  imageUrl?: string | null;
  title?: string;
  isCustom?: boolean;
  customConfig?: {
    shirtType?: string;
    color?: string;
    size?: string;
    printPosition?: string;
    designUrl?: string;
    previewUrl?: string;
  } | null;
  className?: string;
}

const COLOR_MAP: Record<string, string> = {
  'Onyx Black': '#111113',
  'Pure White': '#f4f4f5',
  'Charcoal Grey': '#27272a',
  'Dark Crimson': '#881337',
  'Heather Slate': '#3f3f46',
};

export function CustomGarmentThumbnail({
  imageUrl,
  title = 'Product piece',
  isCustom = false,
  customConfig,
  className = 'w-16 h-20',
}: CustomGarmentThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  const rawArtwork = customConfig?.previewUrl || customConfig?.designUrl || imageUrl;
  const resolvedArtwork = resolveMediaUrl(rawArtwork);
  const shirtColorHex = customConfig?.color ? (COLOR_MAP[customConfig.color] || '#18181b') : '#18181b';
  const isWhiteShirt = customConfig?.color?.toLowerCase().includes('white');

  if (isCustom) {
    return (
      <div className={`relative ${className} bg-zinc-950 rounded-lg border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-inner select-none`}>
        {/* Realistic SVG T-Shirt Silhouette */}
        <svg
          viewBox="0 0 200 220"
          className="w-full h-full drop-shadow-md"
        >
          {/* T-Shirt Body */}
          <path
            d="M 60 15 
               C 75 22, 125 22, 140 15 
               L 185 45 
               L 165 80 
               L 145 68 
               L 145 205 
               C 145 210, 55 210, 55 205 
               L 55 68 
               L 35 80 
               L 15 45 
               Z"
            fill={shirtColorHex}
            stroke={isWhiteShirt ? '#d4d4d8' : '#3f3f46'}
            strokeWidth="2"
          />

          {/* Collar Neck */}
          <path
            d="M 60 15 C 75 32, 125 32, 140 15"
            fill="none"
            stroke={isWhiteShirt ? '#a1a1aa' : '#52525b'}
            strokeWidth="3"
          />
        </svg>

        {/* Uploaded Artwork Graphic Placement */}
        {resolvedArtwork && !imgError ? (
          <div className="absolute inset-0 flex items-center justify-center p-2 pt-3">
            <img
              src={resolvedArtwork}
              alt="Custom Print Artwork"
              className="max-h-[60%] max-w-[65%] object-contain rounded drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
            <Scissors className="h-4 w-4 text-rose-500 mb-0.5" />
            <span className="text-[7px] font-mono font-bold text-zinc-400 uppercase">CUSTOM</span>
          </div>
        )}

        {/* Color / Fit Mini Pip */}
        <div 
          className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-zinc-700 shadow-sm"
          style={{ backgroundColor: shirtColorHex }}
          title={customConfig?.color || 'Custom Shirt'}
        />
      </div>
    );
  }

  // Standard Product Thumbnail
  const standardImg = resolveMediaUrl(imageUrl);

  return (
    <div className={`relative ${className} bg-zinc-950 rounded-lg border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-1`}>
      {standardImg && !imgError ? (
        <img
          src={standardImg}
          alt={title}
          className="object-contain w-full h-full rounded"
          onError={() => setImgError(true)}
        />
      ) : (
        <ShoppingBag className="h-5 w-5 text-zinc-600" />
      )}
    </div>
  );
}
