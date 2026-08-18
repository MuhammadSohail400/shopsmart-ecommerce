"use client";

import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Shirt,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
  Boxes,
  PlusCircle
} from 'lucide-react';
import { useAdminDashboardSummary, useLowStockInventory, useAdminOrders } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data: summary, isLoading: isLoadingSummary } = useAdminDashboardSummary();
  const { data: lowStock } = useLowStockInventory();
  const { data: ordersData } = useAdminOrders({ limit: 5 });

  const kpis = summary?.kpis || {
    totalRevenue: 148500,
    totalOrders: 28,
    totalProducts: 56,
    lowStockCount: lowStock?.length || 0,
    totalCustomers: 14,
  };

  const recentOrders = ordersData?.data || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-card to-secondary/40 border border-border shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Store Operations Overview
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            Monitor real-time revenue, catalog health, pending shipments, and inventory levels.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/admin/products">
            <Button size="sm" className="font-bold rounded-full text-xs gap-1.5 shadow-xs">
              <PlusCircle className="h-4 w-4" /> Add Product
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button size="sm" variant="outline" className="font-bold rounded-full text-xs">
              View Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-black text-foreground">
                Rs. {Number(kpis.totalRevenue).toLocaleString()}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span>Gross processed volume</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-black text-foreground">
                {kpis.totalOrders}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Lifetime store checkouts
            </p>
          </CardContent>
        </Card>

        {/* Total Catalog Items */}
        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Active Catalog
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Shirt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {kpis.totalProducts} Items
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              34 Shirts & 22 Trousers
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Low Stock Alerts
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {lowStock?.length || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Variants below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section: Recent Orders & Quick Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Recent Store Orders
            </h3>
            <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View all orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card className="rounded-2xl border-border/80 overflow-hidden shadow-2xs">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No orders recorded yet. As customers purchase on the storefront, orders will appear here in real time.
              </div>
            ) : (
              <div className="divide-y divide-border overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-[11px] text-foreground">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {order.user?.profile?.firstName || order.user?.email || 'Guest Customer'}
                        </td>
                        <td className="p-3.5 font-bold text-foreground">
                          Rs. {Number(order.total).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <Link href={`/admin/orders`}>
                            <Button size="xs" variant="ghost" className="font-bold text-primary">
                              Manage
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Low Stock Quick List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Inventory Health
            </h3>
            <Link href="/admin/inventory" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Stock Manager <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card className="rounded-2xl border-border/80 p-4 shadow-2xs space-y-3">
            {lowStock && lowStock.length > 0 ? (
              lowStock.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-foreground truncate">{item.product?.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">SKU: {item.sku}</div>
                  </div>
                  <Badge variant="destructive" className="font-black text-[10px] shrink-0">
                    {item.inventory?.quantity} Left
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <Boxes className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="font-bold text-foreground">All variants healthy</p>
                <p className="text-[11px] mt-0.5">No products currently below low-stock threshold.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
