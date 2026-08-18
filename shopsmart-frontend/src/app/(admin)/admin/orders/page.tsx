"use client";

import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/use-admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ORDER_STATUSES = [
  'all',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'disputed',
  'refunded',
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: ordersData, isLoading, refetch } = useAdminOrders({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    limit: 50,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const orders = ordersData?.data || [];

  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;

    await updateStatusMutation.mutateAsync({
      orderId: selectedOrder.id,
      status: newStatus,
    });

    setSelectedOrder(null);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-black uppercase">Delivered</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px] font-black uppercase">Shipped</Badge>;
      case 'processing':
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 text-[10px] font-black uppercase">Processing</Badge>;
      case 'confirmed':
        return <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] font-black uppercase">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] font-black uppercase">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-black uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Orders Management
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Inspect customer orders, track package shipments, and execute status overrides.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="font-bold text-xs gap-1.5 rounded-full"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Orders
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-3.5 rounded-2xl border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID or customer email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
          <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-44">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((st) => (
                <SelectItem key={st} value={st} className="text-xs capitalize">
                  {st === 'all' ? 'All Statuses' : st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-[11px] text-foreground">
                      #{ord.id.slice(0, 8)}
                    </td>
                    <td className="p-3.5 text-muted-foreground text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-foreground">
                      <div className="font-bold">
                        {ord.user?.profile?.firstName ? `${ord.user.profile.firstName} ${ord.user.profile.lastName || ''}` : 'Customer'}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {ord.user?.email || 'guest'}
                      </div>
                    </td>
                    <td className="p-3.5 text-muted-foreground font-mono">
                      {ord.items?.length || 1} item(s)
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      Rs. {Number(ord.total).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpenDetail(ord)}
                        className="font-bold text-[11px]"
                      >
                        Inspect & Override
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail & Status Override Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">
              Order #{selectedOrder?.id?.slice(0, 8)}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Status Override Selector */}
            <div className="p-3 rounded-2xl bg-secondary/40 border border-border space-y-2">
              <Label className="text-xs font-black uppercase tracking-wider text-foreground">
                Override Order Status
              </Label>
              <div className="flex items-center gap-3">
                <Select value={newStatus} onValueChange={(val) => val && setNewStatus(val)}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((st) => (
                      <SelectItem key={st} value={st} className="text-xs capitalize font-bold">
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleStatusChange}
                  disabled={updateStatusMutation.isPending || newStatus === selectedOrder?.status}
                  className="font-bold text-xs shrink-0"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Apply Status'}
                </Button>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Customer</span>
                <span className="font-bold text-foreground block">{selectedOrder?.user?.email}</span>
                <span className="text-muted-foreground block">{selectedOrder?.user?.profile?.phone || 'No phone'}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Shipping Destination</span>
                <span className="font-bold text-foreground block">{selectedOrder?.shippingAddress?.line1 || 'Standard Address'}</span>
                <span className="text-muted-foreground block">{selectedOrder?.shippingAddress?.city || 'Pakistan'}</span>
              </div>
            </div>

            {/* Itemized list */}
            <div>
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground mb-2 block">
                Purchased Items
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder?.items?.map((it: any) => (
                  <div key={it.id} className="p-2.5 rounded-lg bg-secondary/20 border border-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{it.product?.title || 'Product Item'}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">Qty: {it.quantity} × Rs. {Number(it.unitPrice).toLocaleString()}</div>
                    </div>
                    <div className="font-bold text-foreground">
                      Rs. {Number(it.totalPrice).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-border flex justify-between font-black text-sm text-foreground">
              <span>Total Paid:</span>
              <span className="text-primary">Rs. {Number(selectedOrder?.total ?? 0).toLocaleString()}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(null)}
              className="text-xs font-bold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
