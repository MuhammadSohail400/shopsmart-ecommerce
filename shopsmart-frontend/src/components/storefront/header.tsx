"use client";

import Link from 'next/link';
import { ShoppingBag, Search, Menu, ShoppingCart, User, Heart } from 'lucide-react';
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
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/use-cart';

export function Header() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const { data: cart } = useCart();
  
  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q');
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q.toString())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            } />
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <ShoppingBag className="h-5 w-5" />
                  <span>ShopSmart</span>
                </Link>
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  Products
                </Link>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                  Categories
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo (Desktop & Mobile) */}
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-primary transition-opacity hover:opacity-80">
          <ShoppingBag className="h-5 w-5" />
          <span className="hidden md:inline-block text-xl">ShopSmart</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium mx-6">
          <Link href="/products" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Products
          </Link>
          <Link href="/categories" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Categories
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Search */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                type="search"
                placeholder="Search products..."
                className="h-9 w-full bg-muted/50 pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </form>
          </div>

          {/* Account */}
          {user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                } />
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-muted-foreground flex items-center">
                      <span className="truncate max-w-[200px]" title={user.email || undefined}>{user.email}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/wishlist')}>
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout.mutate()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "ghost", className: "hidden md:flex" })}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
