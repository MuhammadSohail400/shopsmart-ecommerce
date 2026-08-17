"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, ShoppingCart, User, Heart, X, Sparkles, Shield, Clock, LogOut } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/use-cart';

export function Header() {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { data: cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const cartItemCount = isAuthenticated
    ? cart?.items.reduce((total, item) => total + item.quantity, 0) || 0
    : 0;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(
      () => {
        router.push('/cart');
      },
      {
        message: 'Please sign in to view your cart',
        returnUrl: '/cart',
      }
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container flex h-16 items-center justify-between gap-4">
        
        {/* Left Section: Mobile Nav & Logo & Desktop Nav */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open mobile menu" className="h-10 w-10 rounded-full" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6">
                <nav className="flex flex-col gap-6 text-base font-medium mt-6">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-xl font-extrabold text-foreground"
                  >
                    <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-xs">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <span>ShopSmart</span>
                  </Link>
                  
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="q"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search catalog..."
                      className="h-11 w-full rounded-full bg-secondary/50 pl-10 pr-9 text-sm border-transparent focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        aria-label="Clear search text"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </form>

                  <div className="flex flex-col gap-3 pt-2 text-sm">
                    <Link
                      href="/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      All Products
                    </Link>
                    <Link
                      href="/categories"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      Categories
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      Contact Support
                    </Link>

                    {isAuthenticated && (
                      <>
                        <div className="h-px bg-border/60 my-2" />
                        <Link
                          href="/account"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          Account Overview
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          Wishlist
                        </Link>
                        <Link
                          href="/sessions"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          Active Sessions
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-border/60">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-full text-destructive hover:bg-destructive/10 gap-2 font-semibold"
                        onClick={() => {
                          logout.mutate();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={buttonVariants({ className: 'w-full rounded-full font-bold shadow-md' })}
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight transition-opacity hover:opacity-80">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="hidden md:inline-block text-2xl tracking-tighter text-foreground">ShopSmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold ml-6">
            <Link href="/products" className="transition-colors hover:text-primary text-muted-foreground">
              Products
            </Link>
            <Link href="/categories" className="transition-colors hover:text-primary text-muted-foreground">
              Categories
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary text-muted-foreground">
              Contact
            </Link>
          </nav>
        </div>

        {/* Right Section: Search & User Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          
          {/* Desktop Search Bar with Clear Icon */}
          <div className="hidden md:block w-auto flex-none max-w-sm">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                ref={searchInputRef}
                name="q"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="h-10 w-full rounded-full bg-secondary/50 pl-10 pr-9 border-transparent focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all md:w-[200px] lg:w-[300px] text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Open user account menu" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" />}>
                    <User className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-xl border-border/60">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-bold text-primary text-xs uppercase tracking-wider">
                        My Account
                      </DropdownMenuLabel>
                      <DropdownMenuItem className="text-xs text-muted-foreground py-1.5 focus:bg-transparent">
                        <span className="truncate max-w-[200px]" title={user?.email || undefined}>{user?.email || 'Logged In'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/account')}>
                      Account Overview
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/orders')}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/wishlist')}>
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/sessions')}>
                      Active Sessions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl font-semibold" onClick={() => logout.mutate()}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href="/wishlist" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="icon" aria-label="Open wishlist" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login" className={buttonVariants({ variant: "ghost", className: "hidden sm:flex font-semibold hover:text-primary hover:bg-primary/10 rounded-full px-5 h-9 text-xs" })}>
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={handleCartClick}
              aria-label={`View shopping cart with ${cartItemCount} items`}
              className="group relative h-10 w-10 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-xs ml-1 inline-flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground border-2 border-background shadow-xs">
                  {cartItemCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
