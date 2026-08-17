import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats price in Pakistani Rupees (e.g., "Rs. 2,499" or "Rs. 1,825")
 */
export function formatCurrency(amount: number | string): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return 'Rs. 0';
  return `Rs. ${Math.round(numeric).toLocaleString('en-PK')}`;
}

/**
 * Calculates a simulated or actual sale discount based on product price/ID
 */
export function getDiscountDetails(basePrice: number | string, slug?: string) {
  const numeric = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
  // Deterministic sale badge for demo: items with even length or specific tags get 30-50% off
  const isSale = slug ? (slug.length % 2 === 0 || slug.includes('sale') || slug.includes('linen') || slug.includes('oxford')) : false;
  const discountPercent = isSale ? (slug && slug.length % 3 === 0 ? 50 : 35) : 0;
  const originalPrice = discountPercent > 0 ? Math.round(numeric / (1 - discountPercent / 100)) : numeric;

  return {
    isSale: discountPercent > 0,
    discountPercent,
    currentPrice: numeric,
    originalPrice,
    formattedCurrent: formatCurrency(numeric),
    formattedOriginal: formatCurrency(originalPrice),
  };
}
