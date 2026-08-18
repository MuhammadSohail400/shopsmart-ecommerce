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
import { SearchDialog } from '@/components/storefront/search-dialog';

import { getUserDisplayName, getUserInitial } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();

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
    { label: 'Men', href: '/products?category=men' },
    { label: 'Women', href: '/products?category=women' },
    { label: 'Kids', href: '/products?category=kids' },
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
        <span className="truncate sm:overflow-visible">FREE DELIVERY ON ORDERS OVER RS. 2,500 • CASH ON DELIVERY ACROSS PAKISTAN</span>
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
                      <span>ShopSmart</span>
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
                    <div className="flex items-center gap-3 pt-2">
                      <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 rounded-full bg-secondary/60 text-muted-foreground hover:text-primary transition-colors text-xs font-bold">
                        IG
                      </a>
                      <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded-full bg-secondary/60 text-muted-foreground hover:text-primary transition-colors text-xs font-bold">
                        FB
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
              <span className="text-lg sm:text-2xl tracking-tighter text-foreground font-black">ShopSmart</span>
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
              className="sm:hidden h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Wishlist Link */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View wishlist"
                className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
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
                <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label="Open user account menu" className="h-8 sm:h-10 px-1 sm:px-3 rounded-full hover:bg-secondary/60 transition-colors gap-1 sm:gap-1.5 text-xs font-semibold" />}>
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
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
              <>
                {/* Mobile Guest Account Icon */}
                <Link
                  href="/login"
                  aria-label="Sign In"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    className: "sm:hidden h-8 w-8 rounded-full text-muted-foreground hover:text-foreground",
                  })}
                >
                  <User className="h-4 w-4" />
                </Link>
                {/* Desktop Guest Sign In Button */}
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "ghost",
                    className: "hidden sm:flex font-bold hover:text-primary hover:bg-primary/10 rounded-full px-3 sm:px-4 h-9 text-xs",
                  })}
                >
                  Sign In
                </Link>
              </>
            )}

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
