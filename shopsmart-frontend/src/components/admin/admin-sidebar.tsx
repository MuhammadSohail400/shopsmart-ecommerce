"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Tag,
  Boxes,
  ShoppingBag,
  Truck,
  TicketPercent,
  Image as ImageIcon,
  Settings,
  Store,
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLowStockInventory, useAdminOrders } from '@/hooks/use-admin';

interface SidebarNavGroup {
  label: string;
  items: Array<{
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeVariant?: 'default' | 'destructive' | 'secondary';
  }>;
}

export function AdminSidebar({ isMobile = false, onItemClick }: { isMobile?: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();
  const { data: lowStock } = useLowStockInventory();
  const { data: ordersData } = useAdminOrders({ limit: 1 });

  const lowStockCount = lowStock?.length || 0;

  const navGroups: SidebarNavGroup[] = [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Catalog & Stock (Phase 9)',
      items: [
        { title: 'Products', href: '/admin/products', icon: Shirt },
        { title: 'Categories', href: '/admin/categories', icon: FolderTree },
        { title: 'Brands', href: '/admin/brands', icon: Tag },
        {
          title: 'Inventory & Stock',
          href: '/admin/inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          badgeVariant: 'destructive',
        },
      ],
    },
    {
      label: 'Store Operations (Phase 10)',
      items: [
        { title: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { title: 'Shipping Zones', href: '/admin/shipping', icon: Truck },
        { title: 'Coupons & Promos', href: '/admin/coupons', icon: TicketPercent },
        { title: 'CMS & Banners', href: '/admin/cms', icon: ImageIcon },
        { title: 'Store Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-card border-r border-border select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-black text-sm tracking-tight uppercase block leading-tight text-foreground">
              ShopSmart
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary block">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground px-3 mb-2">
              {group.label}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant || 'secondary'}
                        className="text-[10px] font-black px-1.5 py-0 h-5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / Storefront Link */}
      <div className="p-4 border-t border-border bg-secondary/20">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground hover:border-primary/50 transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <span>View Storefront</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
}
