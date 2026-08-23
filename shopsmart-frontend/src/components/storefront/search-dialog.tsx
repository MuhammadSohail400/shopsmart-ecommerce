"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProducts, useCategories } from '@/hooks/use-catalog';
import { Search, Sparkles, Clock, X, ArrowRight, ShoppingBag, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POPULAR_SEARCHES = ['Anime T-Shirt', 'Oversized Tee', 'Cyberpunk Drop', 'Custom Print', 'Heavyweight 240 GSM', 'Dark Minimal', 'Gothic Tee'];

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search matches when typing (debounced)
  const { data: searchResults, isLoading } = useProducts({
    q: query.trim().length >= 2 ? query.trim() : undefined,
    limit: 5,
  });

  const { data: categories } = useCategories();

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('asora_recent_searches');
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch {
        // Ignore JSON error
      }
    }
  }, [open]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('asora_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSearchSubmit = (searchTerm: string) => {
    const finalTerm = searchTerm.trim();
    if (!finalTerm) return;
    saveRecentSearch(finalTerm);
    onOpenChange(false);
    router.push(`/products?q=${encodeURIComponent(finalTerm)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('asora_recent_searches');
    } catch {
      // Ignore
    }
  };

  const matchingProducts = searchResults?.pages?.[0]?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800 shadow-2xl top-[25%] sm:top-[30%] translate-y-[-25%] sm:translate-y-[-30%] text-zinc-100">
        <DialogHeader className="p-0 border-b border-zinc-800">
          <DialogTitle className="sr-only">Search ASORA Catalog</DialogTitle>
          <div className="relative flex items-center px-4">
            <Search className="h-5 w-5 text-zinc-400 ml-2 shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit(query);
                }
              }}
              placeholder="Search anime tees, custom streetwear, drops..."
              className="h-14 border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base font-medium px-3 bg-transparent text-zinc-100 placeholder:text-zinc-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
                className="p-1 rounded-full text-muted-foreground hover:text-foreground mr-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {/* Live Search Results */}
          {query.trim().length >= 2 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Matching Products
                </span>
                {matchingProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit(query)}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    View all results <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Searching catalog...</div>
              ) : matchingProducts.length > 0 ? (
                <div className="space-y-2">
                  {matchingProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        saveRecentSearch(product.title);
                        onOpenChange(false);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-secondary/40 transition-colors group"
                    >
                      <div className="h-11 w-11 rounded-xl bg-muted overflow-hidden border border-border/40 shrink-0 flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt="" className="object-cover w-full h-full" />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${parseFloat(product.basePrice).toFixed(2)} • {product.brand?.name || 'ShopSmart'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No products found matching &quot;{query}&quot;.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[11px] text-muted-foreground hover:text-destructive font-medium"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleSearchSubmit(term)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending / Popular Searches */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" /> Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSearchSubmit(term)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              {categories && categories.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Categories
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          router.push(`/products?category=${cat.slug}`);
                        }}
                        className="p-2.5 text-left rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-semibold text-foreground truncate"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
