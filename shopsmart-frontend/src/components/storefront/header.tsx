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
    <header className="sticky top-0 z-50 w-full h-16 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        
        {/* Left Section: Mobile Nav & Logo & Desktop Nav */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="h-10 w-10" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  <Link href="/" className="flex items-center gap-3 text-lg font-bold text-primary">
                    <div className="bg-primary/10 p-2 rounded-xl">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <span>ShopSmart</span>
                  </Link>
                  
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative mt-2 mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="q"
                      type="search"
                      placeholder="Search products..."
                      className="h-12 w-full rounded-full bg-muted/40 pl-10 border-transparent focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </form>

                  <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                    Products
                  </Link>
                  <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                    Categories
                  </Link>
                  {user && (
                    <Link href="/orders" className="text-muted-foreground hover:text-primary transition-colors">
                      My Orders
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight transition-opacity hover:opacity-80">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-xl shadow-sm">
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
          </nav>
        </div>

        {/* Right Section: Search & User Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          
          {/* Desktop Search Bar */}
          <div className="hidden md:block w-auto flex-none max-w-sm">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                name="q"
                type="search"
                placeholder="Search products..."
                className="h-10 w-full rounded-full bg-muted/40 pl-10 border-transparent focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all md:w-[200px] lg:w-[320px]"
              />
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" />}>
                    <User className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-lg border-border/50">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-semibold text-primary">My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-muted-foreground flex items-center py-2">
                        <span className="truncate max-w-[200px]" title={user.email || undefined}>{user.email}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="py-2 cursor-pointer focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/wishlist')}>
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-2 cursor-pointer focus:bg-primary/10 focus:text-primary" onClick={() => router.push('/orders')}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => logout.mutate()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors hidden sm:inline-flex">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Wishlist</span>
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login" className={buttonVariants({ variant: "ghost", className: "hidden sm:flex font-semibold hover:text-primary hover:bg-primary/10 rounded-full px-6" })}>
                Log in
              </Link>
            )}

            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm ml-1">
                <ShoppingCart className="h-4 w-4" />
                <span className="sr-only">Cart</span>
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-2 border-background shadow-sm">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
