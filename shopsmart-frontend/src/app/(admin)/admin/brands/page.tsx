"use client";

import { useState } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { useBrands } from '@/hooks/use-catalog';
import { useCreateBrand, useDeleteBrand } from '@/hooks/use-admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminBrandsPage() {
  const { data: brands, isLoading } = useBrands();
  const createBrandMutation = useCreateBrand();
  const deleteBrandMutation = useDeleteBrand();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    await createBrandMutation.mutateAsync({ name, slug });
    setIsAddOpen(false);
    setName('');
    setSlug('');
  };

  const handleDelete = (id: string, brandName: string) => {
    if (confirm(`Are you sure you want to delete brand "${brandName}"?`)) {
      deleteBrandMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Fashion Brands
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Manage designer labels and manufacturer collections.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="font-bold rounded-full text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Add New Brand
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Add Brand Label
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a new clothing brand or designer line.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="brandName" className="text-xs font-bold">Brand Name</Label>
                <Input
                  id="brandName"
                  placeholder="e.g. Royal Weave"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brandSlug" className="text-xs font-bold">Brand Slug</Label>
                <Input
                  id="brandSlug"
                  placeholder="royal-weave"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="text-xs"
                  required
                />
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
                  disabled={createBrandMutation.isPending}
                  className="text-xs font-bold"
                >
                  {createBrandMutation.isPending ? 'Saving...' : 'Save Brand'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-xs text-muted-foreground">
            Loading brands...
          </div>
        ) : !brands || brands.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-muted-foreground">
            No brands registered yet.
          </div>
        ) : (
          brands.map((b) => (
            <Card key={b.id} className="p-4 rounded-2xl border-border flex items-center justify-between shadow-2xs hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground uppercase">{b.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-mono">slug: {b.slug}</p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(b.id, b.name)}
                disabled={deleteBrandMutation.isPending}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
