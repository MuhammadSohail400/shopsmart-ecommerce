"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Zap, Heart, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { Badge } from '@/components/ui/badge';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: wishlist } = useWishlist();

  const wishlistCount = wishlist?.items?.length || 0;

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
      isActive: pathname === '/products' && !pathname.includes('anime'),
    },
    {
      label: 'Anime',
      href: '/products?category=anime-collection',
      icon: Zap,
      isActive: pathname.includes('anime'),
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-850 pb-[env(safe-area-inset-bottom)] shadow-2xl"
    >
      <div className="flex items-center justify-around h-15 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-150 ${
                item.isActive
                  ? 'text-rose-500 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`h-4.5 w-4.5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && (
                  <Badge className="absolute -top-1.5 -right-2.5 h-3.5 min-w-3.5 px-1 rounded-full p-0 flex items-center justify-center text-[8px] font-black bg-rose-600 text-white border border-zinc-950">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[9px] font-mono tracking-tight mt-1 uppercase leading-none">{item.label}</span>
              {item.isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
