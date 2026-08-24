"use client";

import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Scissors,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  AlertCircle
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
import { formatCurrency, resolveMediaUrl } from '@/lib/utils';
import { CustomGarmentThumbnail } from '@/components/storefront/custom-garment-thumbnail';
import { ThermalShippingLabel } from '@/components/admin/thermal-shipping-label';

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
  const [typeFilter, setTypeFilter] = useState<'all' | 'custom' | 'standard'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: ordersData, isLoading, refetch } = useAdminOrders({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    limit: 50,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  let orders = ordersData?.data || [];

  // Filter by custom vs standard if selected
  if (typeFilter === 'custom') {
    orders = orders.filter((o: any) => o.items?.some((i: any) => Boolean(i.customConfig)));
  } else if (typeFilter === 'standard') {
    orders = orders.filter((o: any) => !o.items?.some((i: any) => Boolean(i.customConfig)));
  }

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
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono font-black uppercase">Confirmed</Badge>;
      case 'processing':
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-mono font-black uppercase">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 text-[10px] font-mono font-black uppercase">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono font-black uppercase">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-950/40 text-rose-400 border-rose-800/80 text-[10px] font-mono font-black uppercase">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-zinc-800/60 text-zinc-400 border-zinc-700 text-[10px] font-mono font-black uppercase">Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-mono font-black uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
            OPERATIONS CONSOLE
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Orders & Custom Fulfillment
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer orders, view custom artwork files, and update shipping progress.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="font-mono text-xs uppercase h-9 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Orders
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 rounded-xl border-border bg-card shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, email, customer name..."
              className="pl-9 text-xs h-9 bg-secondary/30 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex bg-secondary/30 border border-border rounded-lg p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('custom')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${typeFilter === 'custom' ? 'bg-rose-600 text-white font-bold' : 'text-muted-foreground'}`}
              >
                <Scissors className="h-3 w-3" /> CUSTOM ONLY
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('standard')}
                className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'standard' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}
              >
                STANDARD
              </button>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger className="w-[140px] text-xs h-9 bg-secondary/30 font-mono">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((st) => (
                  <SelectItem key={st} value={st} className="text-xs uppercase font-mono">
                    {st === 'all' ? 'All Statuses' : st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-xl border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] font-mono tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Order Number</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs font-mono text-muted-foreground">
                    Loading ASORA orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs font-mono text-muted-foreground">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord: any) => {
                  const hasCustom = ord.items?.some((i: any) => Boolean(i.customConfig));
                  const total = Number(ord.totalAmount ?? ord.total ?? 0);
                  const shipping = ord.shippingAddress;
                  const customerName = shipping?.fullName || ord.user?.profile?.firstName || 'Customer';
                  const customerPhone = shipping?.phone || ord.user?.profile?.phone || '—';

                  return (
                    <tr key={ord.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-[11px] text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>{ord.orderNumber || `#${ord.id.slice(0, 8)}`}</span>
                          {hasCustom && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-600/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold">
                              CUSTOM
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-foreground">
                        <div className="font-bold text-xs">{customerName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {customerPhone} • {ord.user?.email || 'guest'}
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground font-mono">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-xs">
                            {(ord.items?.reduce((sum: number, it: any) => sum + Number(it.quantity || 1), 0) || 1)} piece(s)
                          </span>
                          {(ord.items?.length || 0) > 1 && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              ({ord.items.length} items in parcel)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold font-mono text-foreground">
                        {formatCurrency(total)}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleOpenDetail(ord)}
                          className="font-mono text-[11px] uppercase h-8 px-2.5"
                        >
                          Inspect & Fulfill
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail & Custom Artwork Inspection Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-black font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
              <span>ORDER {selectedOrder?.orderNumber || `#${selectedOrder?.id?.slice(0, 8)}`}</span>
              {selectedOrder?.items?.some((i: any) => Boolean(i.customConfig)) && (
                <Badge className="bg-rose-600/20 text-rose-400 border-rose-500/30 font-mono text-[10px] uppercase">
                  CUSTOM ORDER
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground">
              Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Status Override Selector */}
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-2">
              <Label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Update Fulfillment Status
              </Label>
              <div className="flex items-center gap-3">
                <Select value={newStatus} onValueChange={(val) => val && setNewStatus(val)}>
                  <SelectTrigger className="text-xs h-9 bg-card font-mono uppercase">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((st) => (
                      <SelectItem key={st} value={st} className="text-xs font-mono uppercase">
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleStatusChange}
                  disabled={updateStatusMutation.isPending || newStatus === selectedOrder?.status}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase shrink-0 h-9"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Save Status'}
                </Button>
              </div>
            </div>

            {/* Customer & Shipping Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-secondary/20 font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">Customer Details</span>
                <span className="font-bold text-foreground block text-xs">
                  {selectedOrder?.shippingAddress?.fullName || selectedOrder?.user?.profile?.firstName || 'Customer'}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  Phone: {selectedOrder?.shippingAddress?.phone || selectedOrder?.user?.profile?.phone || '—'}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  Email: {selectedOrder?.user?.email || 'Guest checkout'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">Shipping Destination</span>
                <span className="font-bold text-foreground block text-xs">
                  {selectedOrder?.shippingAddress?.line1 || 'Address on file'}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  {selectedOrder?.shippingAddress?.city}, {selectedOrder?.shippingAddress?.region} ({selectedOrder?.shippingAddress?.country || 'PK'})
                </span>
              </div>
            </div>

            {/* Itemized list with Custom T-Shirt Config */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block">
                Purchased Pieces ({selectedOrder?.items?.length || 0})
              </span>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {selectedOrder?.items?.map((it: any) => {
                  const isCustom = Boolean(it.customConfig);
                  const custom = it.customConfig;
                  const itemPrice = Number(it.priceAtPurchase || it.unitPrice || 0);
                  const artworkDownloadUrl = (custom?.designUrl || custom?.previewUrl)
                    ? resolveMediaUrl(custom.designUrl || custom.previewUrl)
                    : null;

                  return (
                    <div
                      key={it.id}
                      className="p-3 rounded-lg bg-secondary/20 border border-border flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center"
                    >
                      <div className="flex gap-3 items-center">
                        <CustomGarmentThumbnail
                          imageUrl={it.productVariant?.product?.images?.[0]?.url}
                          title="Ordered piece"
                          isCustom={isCustom}
                          customConfig={custom}
                          className="w-16 h-20"
                        />

                        <div className="space-y-0.5">
                          {isCustom ? (
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-600/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono font-bold uppercase">
                                  <Scissors className="h-2.5 w-2.5" /> CUSTOM PIECE
                                </span>
                                <span className="text-[10px] font-mono font-bold text-foreground">
                                  {custom?.shirtType?.toUpperCase() || 'OVERSIZED'} T-SHIRT
                                </span>
                              </div>

                              <div className="text-[10px] font-mono text-muted-foreground">
                                Color: <strong className="text-foreground">{custom?.color}</strong> • Size: <strong className="text-foreground">{custom?.size}</strong> • Print: <strong className="text-rose-400">{custom?.printPosition?.replace('_', ' + ').toUpperCase()}</strong>
                              </div>

                              {artworkDownloadUrl && (
                                <div className="pt-1">
                                  <a
                                    href={artworkDownloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Download Print File (PNG)</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-xs text-foreground">
                                {it.productVariant?.product?.title || it.product?.title || 'ASORA STREETWEAR PIECE'}
                              </div>
                              {it.productVariant?.attributes && (
                                <div className="text-[10px] font-mono text-muted-foreground">
                                  {Object.values(it.productVariant.attributes).join(' / ')}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground font-mono">
                            Qty: {it.quantity} × {formatCurrency(itemPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="font-mono font-bold text-xs text-foreground self-end sm:self-center">
                        {formatCurrency(itemPrice * it.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded-xl border border-border bg-secondary/30 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Subtotal:</span>
                <span className="text-foreground">{formatCurrency(Number(selectedOrder?.subtotal ?? 0))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Shipping:</span>
                <span className="text-foreground">
                  {Number(selectedOrder?.shippingAmount ?? 0) === 0 ? 'FREE' : formatCurrency(Number(selectedOrder?.shippingAmount ?? 0))}
                </span>
              </div>
              {Number(selectedOrder?.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-rose-400 text-[11px]">
                  <span>Discount:</span>
                  <span>-{formatCurrency(Number(selectedOrder?.discountAmount ?? 0))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                <span>Grand Total:</span>
                <span className="text-rose-400">{formatCurrency(Number(selectedOrder?.totalAmount ?? selectedOrder?.total ?? 0))}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between gap-2 border-t border-border pt-3">
            <ThermalShippingLabel
              order={selectedOrder}
              triggerText="Print 4×6 Label / Invoice"
              triggerVariant="default"
              triggerClassName="bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase h-9 gap-1.5"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(null)}
              className="text-xs font-mono uppercase h-9"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
