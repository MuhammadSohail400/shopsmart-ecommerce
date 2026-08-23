"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, ShoppingCart, User, Heart, Sparkles, 
  LogOut, ChevronDown, ChevronRight, X, Phone, 
  HelpCircle, Truck, RefreshCw, Flame, Scissors, Zap, ShieldCheck
} from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { usePublicSettings } from '@/hooks/use-admin';
import { SearchDialog } from '@/components/storefront/search-dialog';
import { getUserDisplayName, getUserInitial, formatCurrency, parseNumericAmount } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { data: publicSettings } = usePublicSettings();

  const storeName = 'ASORA';
  const freeShippingThreshold = parseNumericAmount(publicSettings?.free_shipping_threshold, 2500);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('anime');
  
  const displayName = getUserDisplayName(user);
  const userInitial = getUserInitial(user);

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
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/products' },
    { label: 'ANIME', href: '/products?category=anime-collection' },
    { label: 'CUSTOM', href: '/customizer' },
    { label: 'NEW DROPS', href: '/products?category=new-drops', isHighlight: true },
    { label: 'ABOUT', href: '/contact' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* ── Editorial Announcement Bar ────────────────────────────── */}
      <div className="w-full bg-zinc-950 text-zinc-200 py-2 px-3 sm:px-4 text-center text-[10px] sm:text-xs font-semibold tracking-wider flex items-center justify-center gap-2 border-b border-zinc-800">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="uppercase tracking-widest text-zinc-400 font-mono text-[10px] hidden sm:inline">ASORA STREETWEAR</span>
        <span className="hidden sm:inline text-zinc-600">•</span>
        <span className="truncate">FREE DELIVERY ON ORDERS OVER {formatCurrency(freeShippingThreshold)}</span>
        <span className="text-zinc-600 hidden md:inline">•</span>
        <span className="hidden md:inline text-zinc-400 font-medium">WEAR YOUR STORY</span>
      </div>

      {/* ── Main Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md transition-all shadow-lg">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6">
          
          {/* Left Section: Mobile Menu Trigger & Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            {/* Mobile Drawer */}
            <div className="md:hidden shrink-0">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation menu" className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-md" />}>
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col h-full bg-zinc-950 text-zinc-100 border-r border-zinc-800">
                  {/* Drawer Header */}
                  <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5"
                    >
                      <div className="bg-rose-600 text-white font-black text-xs px-2 py-1 rounded tracking-tighter">
                        ASORA
                      </div>
                      <span className="font-extrabold tracking-widest text-sm text-zinc-400 uppercase font-mono">
                        STREETWEAR
                      </span>
                    </Link>
                  </div>

                  {/* Drawer Navigation Content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* User info if logged in */}
                    {isAuthenticated && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="h-9 w-9 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{user?.email || 'Logged In'}</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Search */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-900 text-zinc-400 text-xs font-medium text-left border border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200 transition-colors"
                    >
                      <Search className="h-4 w-4 text-rose-500" />
                      <span>Search anime tees, custom drops...</span>
                    </button>

                    {/* Mobile Navigation Links */}
                    <div className="space-y-1">
                      <Link 
                        href="/" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-bold text-zinc-200 hover:bg-zinc-900 transition-colors"
                      >
                        <span>HOME</span>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </Link>

                      <Link 
                        href="/products" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-bold text-zinc-200 hover:bg-zinc-900 transition-colors"
                      >
                        <span>ALL PRODUCTS</span>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </Link>

                      <Link 
                        href="/products?category=anime-collection" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-bold text-zinc-200 hover:bg-zinc-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-rose-500" />
                          <span>ANIME COLLECTION</span>
                        </div>
                        <Badge className="bg-rose-600/20 text-rose-400 border border-rose-600/30 text-[9px] px-1.5 py-0 font-mono">HOT</Badge>
                      </Link>

                      <Link 
                        href="/customizer" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-bold text-zinc-200 hover:bg-zinc-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-amber-500" />
                          <span>CUSTOM T-SHIRT STUDIO</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </Link>

                      <Link 
                        href="/products?category=oversized-t-shirts" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-bold text-zinc-200 hover:bg-zinc-900 transition-colors"
                      >
                        <span>OVERSIZED TEES</span>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </Link>

                      <Link 
                        href="/products?category=new-drops" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-bold text-rose-400 hover:bg-zinc-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-rose-500" />
                          <span>NEW DROPS</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </Link>

                      <Link 
                        href="/contact" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-bold text-zinc-200 hover:bg-zinc-900 transition-colors"
                      >
                        <span>ABOUT & CONTACT</span>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </Link>
                    </div>

                    {/* Customer Support Links */}
                    <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                        Customer Care
                      </span>
                      <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 py-1 font-medium">
                        <HelpCircle className="h-3.5 w-3.5 text-rose-500" /> Contact Support & FAQs
                      </Link>
                      <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 py-1 font-medium">
                        <Truck className="h-3.5 w-3.5 text-rose-500" /> Track Your Order
                      </Link>
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 mt-auto">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full border-zinc-800 bg-zinc-900 text-rose-400 hover:bg-zinc-800 hover:text-rose-300 gap-2 font-bold text-xs h-10 rounded-md"
                        onClick={() => {
                          logout.mutate();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </Button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={buttonVariants({ className: 'w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-md shadow-md' })}
                      >
                        Sign In / Register
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* ASORA Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tighter text-zinc-100 uppercase group-hover:text-rose-500 transition-colors">
                  ASORA
                </span>
                <span className="text-[9px] font-mono tracking-widest text-zinc-400 -mt-1 uppercase hidden sm:block">
                  WEAR YOUR STORY
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider ml-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`transition-all py-1 tracking-widest uppercase text-[11px] ${
                      link.isHighlight
                        ? 'text-rose-400 hover:text-rose-300 flex items-center gap-1 font-extrabold'
                        : isActive
                        ? 'text-white border-b-2 border-rose-500 pb-0.5'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {link.isHighlight && <Flame className="h-3 w-3 text-rose-500 inline" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Desktop Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2.5 h-9 w-[180px] lg:w-[220px] px-3 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-all"
            >
              <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="truncate text-[11px]">Search anime & drops...</span>
              <kbd className="hidden lg:inline-flex ml-auto pointer-events-none text-[9px] font-mono font-bold bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open search dialog"
              className="sm:hidden h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            {/* Wishlist Link */}
            <Link href="/wishlist" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View wishlist"
                className="relative h-9 w-9 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-md transition-colors"
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full p-0 flex items-center justify-center text-[9px] font-black bg-rose-600 text-white border-2 border-zinc-950">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account Menu */}
            <div className="hidden sm:flex items-center">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label="Open user account menu" className="h-9 px-2.5 rounded-md hover:bg-zinc-900 transition-colors gap-2 text-xs font-semibold text-zinc-300" />}>
                    <div className="h-6 w-6 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                      {userInitial}
                    </div>
                    <span className="hidden md:inline-block max-w-[100px] truncate text-zinc-200 font-bold text-[11px]">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-zinc-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-md bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100">
                    <DropdownMenuGroup>
                      <div className="px-2 py-2 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem render={<Link href="/account" className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 hover:text-white" />}>
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      My Profile & Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/wishlist" className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 hover:text-white" />}>
                      <Heart className="h-3.5 w-3.5 text-zinc-400" />
                      Saved Items ({wishlistCount})
                    </DropdownMenuItem>
                    {(user?.role === 'ADMIN' || (user?.role as string) === 'admin') && (
                      <DropdownMenuItem render={<Link href="/admin" className="flex items-center gap-2 cursor-pointer text-xs text-rose-400 hover:text-rose-300 font-bold" />}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      onClick={() => logout.mutate()}
                      className="flex items-center gap-2 cursor-pointer text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                    className: 'text-zinc-300 hover:text-white hover:bg-zinc-900 text-xs font-bold uppercase tracking-wider rounded-md h-9 px-3',
                  })}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="View shopping cart"
              onClick={handleCartClick}
              className="relative h-9 w-9 text-zinc-200 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full p-0 flex items-center justify-center text-[9px] font-black bg-rose-600 text-white border-2 border-zinc-950">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>

        </div>
      </header>

      {/* Global Search Dialog Component */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
