"use client";

import { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Sliders,
  TrendingDown,
  Warehouse,
  ShieldCheck
} from 'lucide-react';
import { useLowStockInventory, useUpdateInventory } from '@/hooks/use-admin';
import { useProducts } from '@/hooks/use-catalog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminInventoryPage() {
  const { data: lowStock, isLoading: isLoadingLowStock, refetch } = useLowStockInventory();
  const { data: productsData } = useProducts({ limit: 60 });
  const updateInventoryMutation = useUpdateInventory();

  // Edit stock dialog
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editThreshold, setEditThreshold] = useState('');

  const products = productsData?.pages?.[0]?.data || [];

  const handleOpenEdit = (variant: any, productTitle: string) => {
    setSelectedVariant({ ...variant, productTitle });
    setEditQuantity(String(variant.inventory?.quantity ?? 0));
    setEditThreshold(String(variant.inventory?.lowStockThreshold ?? 5));
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    await updateInventoryMutation.mutateAsync({
      variantId: selectedVariant.id,
      data: {
        quantity: Number(editQuantity),
        lowStockThreshold: Number(editThreshold),
        version: selectedVariant.inventory?.version ?? 1,
      },
    });

    setSelectedVariant(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Inventory & Stock Manager
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Monitor real-time warehouse stock levels, low-stock warnings, and concurrency-protected allocations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="font-bold text-xs gap-1.5 rounded-full"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Stock
        </Button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStock && lowStock.length > 0 ? (
        <Card className="p-4 rounded-2xl bg-amber-500/10 border-amber-500/30 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-300">
                {lowStock.length} Variant(s) Need Reordering
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Warehouse inventory for these items has dropped at or below the safety threshold.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 rounded-2xl bg-emerald-500/10 border-emerald-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">
              Healthy Warehouse Inventory
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              All sizes and garment variants have sufficient stock levels above their designated thresholds.
            </p>
          </div>
        </Card>
      )}

      {/* Catalog Stock Breakdown Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-primary" />
            <span>All Product Variants & Stock Levels</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Size / Attributes</th>
                <th className="p-3.5">Available Stock</th>
                <th className="p-3.5">Reserved</th>
                <th className="p-3.5">Threshold</th>
                <th className="p-3.5">Version</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {products.map((p) =>
                p.variants?.map((v) => {
                  const qty = v.inventory?.quantity ?? 0;
                  const threshold = v.inventory?.lowStockThreshold ?? 5;
                  const isLow = qty <= threshold;

                  return (
                    <tr key={v.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground truncate max-w-xs">{p.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">SKU: {v.sku}</div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {v.attributes?.size || v.attributes?.waist || 'Standard'}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-black uppercase ${
                            isLow
                              ? 'bg-destructive/10 text-destructive border-destructive/30'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          }`}
                        >
                          {qty} Units
                        </Badge>
                      </td>
                      <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                        {v.inventory?.reservedQuantity ?? 0}
                      </td>
                      <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                        {threshold}
                      </td>
                      <td className="p-3.5 text-muted-foreground font-mono text-[10px]">
                        v{v.inventory?.version ?? 1}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleOpenEdit(v, p.title)}
                          className="font-bold text-[11px]"
                        >
                          Adjust Stock
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

      {/* Adjust Stock Modal */}
      <Dialog open={!!selectedVariant} onOpenChange={(open) => !open && setSelectedVariant(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">
              Adjust Inventory Stock
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedVariant?.productTitle} (SKU: {selectedVariant?.sku})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveStock} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="qty" className="text-xs font-bold">Total Available Quantity</Label>
              <Input
                id="qty"
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="threshold" className="text-xs font-bold">Low-Stock Alert Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={editThreshold}
                onChange={(e) => setEditThreshold(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-secondary/40 text-[11px] text-muted-foreground">
              <strong>Optimistic Concurrency Check:</strong> Current inventory record version is{' '}
              <code className="text-foreground font-bold">v{selectedVariant?.inventory?.version ?? 1}</code>. Updates will fail safely if another warehouse operator modified it concurrently.
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedVariant(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateInventoryMutation.isPending}
                className="text-xs font-bold"
              >
                {updateInventoryMutation.isPending ? 'Updating...' : 'Save Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
