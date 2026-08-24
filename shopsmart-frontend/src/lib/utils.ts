import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses any number, string with commas/symbols, null, or undefined into a valid number.
 * Guaranteed to NEVER return NaN.
 */
export function parseNumericAmount(amount: number | string | null | undefined, fallback = 0): number {
  if (amount === null || amount === undefined) return fallback;
  if (typeof amount === 'number') return isNaN(amount) ? fallback : amount;
  const sanitized = String(amount).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Formats price in Pakistani Rupees (e.g., "PKR 2,499" or "Rs. 1,825").
 * Always safe from NaN.
 */
export function formatCurrency(amount: number | string | null | undefined, prefix = 'PKR'): string {
  const numeric = parseNumericAmount(amount, 0);
  return `${prefix} ${Math.round(numeric).toLocaleString('en-PK')}`;
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

/**
 * Returns a friendly, human display name for an authenticated user.
 */
export function getUserDisplayName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
} | null): string {
  if (!user) return 'Account';
  if (user.firstName) return user.firstName.trim();
  if (user.name) return user.name.split(' ')[0].trim();
  if (user.email) {
    const raw = user.email.split('@')[0];
    const cleaned = raw.replace(/[0-9_.-]/g, '');
    if (cleaned.length >= 3) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  if (user.phone) return user.phone;
  return 'Account';
}

/**
 * Returns a single uppercase character avatar initial for a user.
 */
export function getUserInitial(user?: {
  firstName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
} | null): string {
  const name = getUserDisplayName(user);
  if (name && name !== 'Account') return name.charAt(0).toUpperCase();
  return 'U';
}

/**
 * Normalizes any Pakistani or International phone format (e.g. 03110297772, +92 311 0297772)
 * into a valid WhatsApp wa.me click-to-chat URL with optional prefilled message.
 */
export function formatWhatsAppUrl(rawPhone?: string, message?: string): string {
  const defaultNumber = '923110297772';
  if (!rawPhone) {
    return message 
      ? `https://wa.me/${defaultNumber}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${defaultNumber}`;
  }

  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '92' + digits.slice(1);
  } else if (!digits.startsWith('92') && digits.length === 10) {
    digits = '92' + digits;
  }

  const finalNumber = digits || defaultNumber;
  return message 
    ? `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${finalNumber}`;
}

/**
 * Resolves any image URL, safely prefixing backend host if it's a relative path like /uploads
 */
export function resolveMediaUrl(url?: string | null, fallback = '/images/asora-hero.jpg'): string {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const origin = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}



