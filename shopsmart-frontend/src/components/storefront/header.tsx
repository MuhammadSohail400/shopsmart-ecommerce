"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, ShoppingCart, User, Heart, Sparkles, Shield, Clock, LogOut, ChevronDown } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { SearchDialog } from '@/components/storefront/search-dialog';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const cartItemCount = isAuthenticated
    ? cart?.items.reduce((total, item) => total + item.quantity, 0) || 0
    : 0;

  const wishlistCount = isAuthenticated ? wishlist?.items?.length || 0 : 0;

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

  const navLinks = [
    { label: 'Shop All', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Support', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 transition-all shadow-xs">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation menu" className="h-9 w-9 rounded-full" />}>
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6">
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle className="flex items-center gap-2 text-xl font-extrabold text-foreground">
                      <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-xs">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <span>ShopSmart</span>
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col gap-4 text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 text-muted-foreground text-xs font-semibold text-left"
                    >
                      <Search className="h-4 w-4 text-primary" />
                      <span>Search products, categories...</span>
                    </button>

                    <div className="flex flex-col gap-1 pt-2">
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-2 px-3 rounded-xl transition-colors ${
                          pathname === '/' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        Home
                      </Link>
                      <Link
                        href="/products"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-2 px-3 rounded-xl transition-colors ${
                          pathname === '/products' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        All Products
                      </Link>
                      <Link
                        href="/categories"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-2 px-3 rounded-xl transition-colors ${
                          pathname === '/categories' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        Categories
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`py-2 px-3 rounded-xl transition-colors ${
                          pathname === '/contact' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        Contact & Support
                      </Link>
                    </div>

                    {isAuthenticated && (
                      <div className="pt-2 border-t border-border/50 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1">
                          Account
                        </span>
                        <Link
                          href="/account"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 px-3 rounded-xl text-foreground hover:bg-secondary/40"
                        >
                          Account Overview
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 px-3 rounded-xl text-foreground hover:bg-secondary/40"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2 px-3 rounded-xl text-foreground hover:bg-secondary/40 flex items-center justify-between"
                        >
                          <span>Wishlist</span>
                          {wishlistCount > 0 && <Badge className="text-[10px]">{wishlistCount}</Badge>}
                        </Link>
                      </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-border/60">
                      {isAuthenticated ? (
                        <Button
                          variant="outline"
                          className="w-full rounded-full text-destructive hover:bg-destructive/10 gap-2 font-semibold text-xs h-10"
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
                          className={buttonVariants({ className: 'w-full rounded-full font-bold shadow-md text-xs h-10' })}
                        >
                          Sign In / Register
                        </Link>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 font-black tracking-tight hover:opacity-90 transition-opacity">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-xs">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-xl sm:text-2xl tracking-tighter text-foreground font-black">ShopSmart</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold ml-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    pathname === link.href ? 'text-primary font-bold border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center/Right: Interactive Search & User Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2.5 h-10 w-[200px] lg:w-[280px] px-3.5 rounded-full bg-secondary/50 hover:bg-secondary/70 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all shadow-2xs"
            >
              <Search className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">Search products...</span>
              <kbd className="hidden lg:inline-flex ml-auto pointer-events-none text-[10px] uppercase font-mono font-bold bg-background/80 px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open search dialog"
              className="sm:hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Wishlist Link (Desktop) */}
            <Link href="/wishlist" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View wishlist"
                className="relative h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full p-0 flex items-center justify-center text-[9px] font-extrabold bg-primary text-primary-foreground border-2 border-background shadow-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account Menu / Login */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label="Open user account menu" className="h-10 px-3 rounded-full hover:bg-secondary/60 transition-colors gap-1.5 text-xs font-semibold" />}>
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline-block max-w-[90px] truncate text-foreground">
                    {user?.firstName || 'Account'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:inline-block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-border/60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-bold text-primary text-[11px] uppercase tracking-wider">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="text-xs text-muted-foreground py-1 focus:bg-transparent">
                      <span className="truncate max-w-[190px]" title={user?.email || undefined}>
                        {user?.email || 'Logged In'}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium text-xs focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/account')}>
                    Account Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium text-xs focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/orders')}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium text-xs focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/wishlist')}>
                    Wishlist ({wishlistCount})
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer rounded-xl font-medium text-xs focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/sessions')}>
                    Active Sessions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl font-semibold text-xs gap-1.5" onClick={() => logout.mutate()}>
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  className: "hidden sm:flex font-bold hover:text-primary hover:bg-primary/10 rounded-full px-4 h-9 text-xs",
                })}
              >
                Sign In
              </Link>
            )}

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={handleCartClick}
              aria-label={`View shopping cart with ${cartItemCount} items`}
              className="relative h-10 w-10 rounded-full border border-border/80 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-xs inline-flex items-center justify-center group"
            >
              <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full p-0 flex items-center justify-center text-[10px] font-black bg-primary text-primary-foreground border-2 border-background shadow-xs animate-in zoom-in-50">
                  {cartItemCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
