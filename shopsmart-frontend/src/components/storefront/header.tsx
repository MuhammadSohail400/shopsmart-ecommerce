"use client";

import Link from 'next/link';
import { ShoppingBag, Search, Menu, ShoppingCart, User } from 'lucide-react';
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
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q');
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q.toString())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <ShoppingBag className="h-6 w-6" />
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
          <ShoppingBag className="h-6 w-6" />
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
                className="w-full bg-muted/50 pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </form>
          </div>

          {/* Account */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="hidden md:flex gap-2 relative" />}>
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user.firstName}</span>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground">{user.email}</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout.mutate()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "ghost", className: "hidden md:flex" })}>
              Log in
            </Link>
          )}

          {/* Cart (Phase 5 Placeholder) */}
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Open cart</span>
            {/* Badge Placeholder */}
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
