import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/services/products.service';

const STORAGE_KEY = 'shopsmart_recently_viewed';
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const addProduct = useCallback((product: Product) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const items: Product[] = stored ? JSON.parse(stored) : [];

      // Filter out duplicate
      const filtered = items.filter((p) => p.id !== product.id);
      // Prepend current product
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const removeProduct = useCallback((productId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const items: Product[] = stored ? JSON.parse(stored) : [];
      const updated = items.filter((p) => p.id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const clearAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentlyViewed([]);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return { recentlyViewed, addProduct, removeProduct, clearAll };
}
