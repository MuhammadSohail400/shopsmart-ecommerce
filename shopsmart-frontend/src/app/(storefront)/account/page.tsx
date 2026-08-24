"use client";

import { useAuth, useLogout } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { User, ShoppingBag, Heart, LogOut, Mail, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';

function AccountContent() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: ordersData } = useOrders({ limit: 5 });
  const { data: wishlistData } = useWishlist();

  const recentOrders = ordersData?.data || [];
  const wishlistCount = wishlistData?.items?.length || 0;

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'My Account' }]} className="mb-6" />

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/60">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-extrabold text-2xl">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Account Dashboard'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
              {user?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              )}
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-destructive hover:bg-destructive/10 gap-1.5 font-semibold text-xs"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* Orders Card */}
        <Link href="/orders" className="block group">
          <Card className="rounded-2xl border-border/60 hover:border-primary/50 hover:shadow-md transition-all h-full">
            <CardHeader className="pb-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-2">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                My Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Track status and view history
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                View orders <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Wishlist Card */}
        <Link href="/wishlist" className="block group">
          <Card className="rounded-2xl border-border/60 hover:border-primary/50 hover:shadow-md transition-all h-full">
            <CardHeader className="pb-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-2">
                <Heart className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                Wishlist ({wishlistCount})
              </CardTitle>
              <CardDescription className="text-xs">
                Saved favorite items
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                View wishlist <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
          {recentOrders.length > 0 && (
            <Link href="/orders" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-border/70 bg-card/30">
            <p className="text-sm text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className={buttonVariants({ size: 'sm', className: 'rounded-full px-6' })}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.slice(0, 3).map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                <Card className="rounded-xl border-border/50 hover:border-primary/40 transition-all">
                  <CardContent className="p-4 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-mono font-bold group-hover:text-primary transition-colors">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-foreground">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                      <span className="block text-[11px] font-semibold capitalize text-primary">
                        {order.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
