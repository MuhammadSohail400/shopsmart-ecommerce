"use client";

import { useState } from 'react';
import {
  TicketPercent,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCoupons, useCreateCoupon, useDeactivateCoupon } from '@/hooks/use-admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminCouponsPage() {
  const { data: coupons, isLoading } = useCoupons();
  const createCouponMutation = useCreateCoupon();
  const deactivateCouponMutation = useDeactivateCoupon();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    await createCouponMutation.mutateAsync({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: minOrder ? Number(minOrder) : 0,
      usageLimitPerUser: usageLimit ? Number(usageLimit) : undefined,
    });

    setIsAddOpen(false);
    setCode('');
    setDiscountValue('');
    setMinOrder('');
    setUsageLimit('');
  };

  const handleDeactivate = (id: string, couponCode: string) => {
    if (confirm(`Deactivate coupon code "${couponCode}"?`)) {
      deactivateCouponMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Coupons & Promo Codes
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Generate promotional discount vouchers, cart thresholds, and usage caps.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="font-bold rounded-full text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Create Coupon
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Create Discount Coupon
              </DialogTitle>
              <DialogDescription className="text-xs">
                Set up a new promotional voucher for customers at checkout.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-bold">Voucher Code (Uppercase)</Label>
                <Input
                  id="code"
                  placeholder="e.g. SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-bold">Discount Type</Label>
                  <Select value={discountType} onValueChange={(v) => v && setDiscountType(v as any)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage" className="text-xs">Percentage (%)</SelectItem>
                      <SelectItem value="flat" className="text-xs">Flat Amount (PKR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="val" className="text-xs font-bold">Value ({discountType === 'percentage' ? '%' : 'PKR'})</Label>
                  <Input
                    id="val"
                    type="number"
                    placeholder={discountType === 'percentage' ? '15' : '500'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="minOrder" className="text-xs font-bold">Min Cart Amount (PKR)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    placeholder="2500"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="usage" className="text-xs font-bold">Usage Limit (Max Uses)</Label>
                  <Input
                    id="usage"
                    type="number"
                    placeholder="100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createCouponMutation.isPending}
                  className="text-xs font-bold"
                >
                  {createCouponMutation.isPending ? 'Saving...' : 'Create Voucher'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coupons Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Discount</th>
                <th className="p-3.5">Min Order</th>
                <th className="p-3.5">Redemptions</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                    Loading coupons...
                  </td>
                </tr>
              ) : !coupons || coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                    No promo codes active. Click "Create Coupon" to launch a campaign.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-xs text-primary">
                      {c.code}
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `Rs. ${c.discountValue} OFF`}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {c.minOrderAmount ? `Rs. ${Number(c.minOrderAmount).toLocaleString()}` : 'None'}
                    </td>
                    <td className="p-3.5 text-muted-foreground font-mono">
                      {c.usedCount} / {c.usageLimit || '∞'}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-black uppercase ${
                          c.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {c.isActive && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleDeactivate(c.id, c.code)}
                          className="text-muted-foreground hover:text-destructive text-[11px]"
                        >
                          Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
