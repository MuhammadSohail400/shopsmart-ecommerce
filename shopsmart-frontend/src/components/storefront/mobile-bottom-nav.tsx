"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Grid, Heart, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { Badge } from '@/components/ui/badge';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { data: wishlist } = useWishlist();

  const wishlistCount = isAuthenticated ? wishlist?.items?.length || 0 : 0;

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Shop',
      href: '/products',
      icon: ShoppingBag,
      isActive: pathname.startsWith('/products'),
    },
    {
      label: 'Categories',
      href: '/categories',
      icon: Grid,
      isActive: pathname.startsWith('/categories'),
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      isActive: pathname.startsWith('/wishlist'),
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      label: isAuthenticated ? 'Account' : 'Sign In',
      href: isAuthenticated ? '/account' : '/login',
      icon: User,
      isActive: pathname.startsWith('/account') || pathname.startsWith('/login'),
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 ${
                item.isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && (
                  <Badge className="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 rounded-full p-0 flex items-center justify-center text-[9px] font-extrabold bg-primary text-primary-foreground border border-background shadow-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">{item.label}</span>
              {item.isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
