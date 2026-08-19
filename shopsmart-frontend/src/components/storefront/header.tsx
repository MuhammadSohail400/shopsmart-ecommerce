"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Search, Menu, ShoppingCart, User, Heart, Sparkles, 
  Shield, Clock, LogOut, ChevronDown, ChevronRight, X, Phone, 
  HelpCircle, Truck, RefreshCw, Globe 
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { usePublicSettings } from '@/hooks/use-admin';
import { SearchDialog } from '@/components/storefront/search-dialog';

import { getUserDisplayName, getUserInitial } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { data: publicSettings } = usePublicSettings();

  const storeName = publicSettings?.store_name || 'ShopSmart';
  const currency = publicSettings?.currency || 'PKR';
  const freeShipping = publicSettings?.free_shipping_threshold || '2,500';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('men');
  
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
    { label: 'Home', href: '/' },
    { label: 'Shirts', href: '/products?category=formal-shirts' },
    { label: 'Pants', href: '/products?category=pants' },
    { label: 'Men', href: '/products?category=men' },
    { label: 'New Arrivals', href: '/products?category=new-arrivals' },
    { label: 'Sale', href: '/products?category=sale', isSale: true },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="w-full bg-foreground text-background py-1.5 px-3 sm:px-4 text-center text-[10px] sm:text-[11px] font-extrabold tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 border-b border-border/20">
        <Sparkles className="h-3 w-3 text-primary animate-pulse shrink-0" />
        <span className="truncate sm:overflow-visible">FREE DELIVERY ON ORDERS OVER {currency} {Number(freeShipping).toLocaleString()} • CASH ON DELIVERY AVAILABLE</span>
      </div>

      <header className="sticky top-0 z-40 w-full h-16 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all shadow-xs">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between gap-1.5 sm:gap-6 px-2.5 sm:px-6">
          
          {/* Left Section: Mobile Drawer Trigger & Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-1.5 sm:gap-8 min-w-0">
            {/* Mobile Drawer */}
            <div className="md:hidden shrink-0">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation menu" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />}>
                  <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[360px] p-0 flex flex-col h-full bg-background border-r border-border/60">
                  {/* Drawer Header */}
                  <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 font-black text-xl tracking-tight text-foreground"
                    >
                      <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-xs">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <span>{storeName}</span>
                    </Link>
                  </div>

                  {/* Drawer Navigation Content (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                    {/* Logged in User Greeting on Mobile */}
                    {isAuthenticated && (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-border/40">
                        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'Logged In'}</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Search Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 text-muted-foreground text-xs font-semibold text-left border border-border/40 hover:bg-secondary transition-colors"
                    >
                      <Search className="h-4 w-4 text-primary" />
                      <span>Search shirts, trousers, dresses...</span>
                    </button>

                    {/* Department Navigation Accordions */}
                    <div className="space-y-1">
                      {/* MEN SECTION */}
                      <div className="border-b border-border/30 pb-2">
                        <button
                          type="button"
                          onClick={() => toggleSection('men')}
                          className="w-full flex items-center justify-between py-2 text-sm font-extrabold text-foreground uppercase tracking-wider"
                        >
                          <span>Men</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSection === 'men' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                        </button>
                        {expandedSection === 'men' && (
                          <div className="pl-3 py-1 space-y-1 text-xs text-muted-foreground">
                            <Link href="/products?category=formal-shirts" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Formal Shirts</Link>
                            <Link href="/products?category=casual-shirts" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Casual Shirts</Link>
                            <Link href="/products?category=linen-shirts" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Linen Shirts</Link>
                            <Link href="/products?category=oxford-shirts" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Oxford Shirts</Link>
                            <Link href="/products?category=polo-shirts" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Polo Shirts</Link>
                            <Link href="/products?category=t-shirts" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">T-Shirts</Link>
                            <Link href="/products?category=trousers-chinos" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Trousers & Chinos</Link>
                            <Link href="/products?category=jeans" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Jeans</Link>
                            <Link href="/products?category=jackets-outerwear" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Jackets & Outerwear</Link>
                            <Link href="/products?category=traditional-wear" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Traditional Wear / Kurta</Link>
                          </div>
                        )}
                      </div>

                      {/* WOMEN SECTION */}
                      <div className="border-b border-border/30 pb-2">
                        <button
                          type="button"
                          onClick={() => toggleSection('women')}
                          className="w-full flex items-center justify-between py-2 text-sm font-extrabold text-foreground uppercase tracking-wider"
                        >
                          <span>Women</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSection === 'women' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                        </button>
                        {expandedSection === 'women' && (
                          <div className="pl-3 py-1 space-y-1 text-xs text-muted-foreground">
                            <Link href="/products?category=dresses" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Dresses</Link>
                            <Link href="/products?category=tops-blouses" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Tops & Blouses</Link>
                            <Link href="/products?category=women-trousers" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Trousers & Pants</Link>
                          </div>
                        )}
                      </div>

                      {/* KIDS SECTION */}
                      <div className="border-b border-border/30 pb-2">
                        <button
                          type="button"
                          onClick={() => toggleSection('kids')}
                          className="w-full flex items-center justify-between py-2 text-sm font-extrabold text-foreground uppercase tracking-wider"
                        >
                          <span>Kids</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedSection === 'kids' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                        </button>
                        {expandedSection === 'kids' && (
                          <div className="pl-3 py-1 space-y-1 text-xs text-muted-foreground">
                            <Link href="/products?category=boys" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Boys Collection</Link>
                            <Link href="/products?category=girls" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-primary transition-colors font-medium">Girls Collection</Link>
                          </div>
                        )}
                      </div>

                      {/* COLLECTIONS */}
                      <div className="py-2 space-y-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                          Collections
                        </span>
                        <Link href="/products?category=new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-bold text-foreground hover:text-primary py-1">New Arrivals</Link>
                        <Link href="/products?category=best-sellers" onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-bold text-foreground hover:text-primary py-1">Best Sellers</Link>
                        <Link href="/products?category=sale" onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-bold text-rose-600 dark:text-rose-400 py-1">Sale — Up to 50% Off</Link>
                      </div>
                    </div>

                    {/* Customer Care / Support */}
                    <div className="pt-4 border-t border-border/40 space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                        Customer Care
                      </span>
                      <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-1">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" /> Contact Us & FAQ
                      </Link>
                      <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-1">
                        <Truck className="h-3.5 w-3.5 text-primary" /> Track Your Order
                      </Link>
                    </div>

                    {/* Social links */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="h-8 w-8 rounded-lg bg-secondary/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-muted-foreground hover:text-white border border-border/50 flex items-center justify-center transition-all shadow-2xs"
                      >
                        <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="h-8 w-8 rounded-lg bg-secondary/80 hover:bg-[#1877F2] text-muted-foreground hover:text-white border border-border/50 flex items-center justify-center transition-all shadow-2xs"
                      >
                        <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                      <a
                        href="https://x.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="X (Twitter)"
                        className="h-8 w-8 rounded-lg bg-secondary/80 hover:bg-black hover:text-white text-muted-foreground border border-border/50 flex items-center justify-center transition-all shadow-2xs"
                      >
                        <svg className="h-3.5 w-3.5 fill-currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                      <a
                        href="https://whatsapp.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp"
                        className="h-8 w-8 rounded-lg bg-secondary/80 hover:bg-[#25D366] text-muted-foreground hover:text-white border border-border/50 flex items-center justify-center transition-all shadow-2xs"
                      >
                        <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Drawer Footer: User Auth */}
                  <div className="p-4 border-t border-border/50 bg-secondary/20 mt-auto">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-full text-destructive hover:bg-destructive/10 gap-2 font-bold text-xs h-10"
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
                        className={buttonVariants({ className: 'w-full rounded-full font-bold shadow-md text-xs h-10' })}
                      >
                        Sign In / Register
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-black tracking-tight hover:opacity-90 transition-opacity shrink-0">
              <div className="bg-primary text-primary-foreground p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-xs">
                <ShoppingBag className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </div>
              <span className="text-lg sm:text-2xl tracking-tighter text-foreground font-black">{storeName}</span>
            </Link>

            {/* Desktop Navigation Links (Home, Men, Women, Kids, New Arrivals, Sale) */}
            <nav className="hidden md:flex items-center gap-5 text-sm font-semibold ml-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    link.isSale 
                      ? 'text-rose-600 dark:text-rose-400 font-bold hover:opacity-80' 
                      : pathname === link.href ? 'text-primary font-bold border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Desktop Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2.5 h-10 w-[200px] lg:w-[260px] px-3.5 rounded-full bg-secondary/50 hover:bg-secondary/70 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all shadow-2xs"
            >
              <Search className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">Search fashion...</span>
              <kbd className="hidden lg:inline-flex ml-auto pointer-events-none text-[10px] uppercase font-mono font-bold bg-background/80 px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open search dialog"
              className="sm:hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            {/* Wishlist Link (Desktop & Tablet) */}
            <Link href="/wishlist" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View wishlist"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full p-0 flex items-center justify-center text-[9px] font-extrabold bg-primary text-primary-foreground border-2 border-background shadow-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account Menu / Login (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label="Open user account menu" className="h-9 sm:h-10 px-2 sm:px-3 rounded-full hover:bg-secondary/60 transition-colors gap-1.5 text-xs font-semibold" />}>
                    <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                      {userInitial}
                    </div>
                    <span className="hidden md:inline-block max-w-[110px] truncate text-foreground font-bold">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:inline-block" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-border/60">
                    <DropdownMenuGroup>
                      <div className="px-2 py-2 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'Logged in'}</p>
                        </div>
                      </div>
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
                    className: "font-bold hover:text-primary hover:bg-primary/10 rounded-full px-3 sm:px-4 h-9 text-xs",
                  })}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={handleCartClick}
              aria-label={`View shopping cart with ${cartItemCount} items`}
              className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-border/80 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-xs inline-flex items-center justify-center group shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 sm:h-5 sm:min-w-5 px-1 rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black bg-primary text-primary-foreground border-2 border-background shadow-xs animate-in zoom-in-50">
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
