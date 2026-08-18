"use client";

import { useState } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import { useCategories } from '@/hooks/use-catalog';
import { useCreateCategory, useDeleteCategory } from '@/hooks/use-admin';
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

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    await createCategoryMutation.mutateAsync({
      name,
      slug,
      parentId: parentId === 'none' ? undefined : parentId,
    });

    setIsAddOpen(false);
    setName('');
    setSlug('');
    setParentId(undefined);
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Categories Hierarchy
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Organize root and subcategory navigation trees for the storefront.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="font-bold rounded-full text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Create Store Category
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add a new root or nested collection to organize your products.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="catName" className="text-xs font-bold">Category Name</Label>
                <Input
                  id="catName"
                  placeholder="e.g. Linen Shirts"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catSlug" className="text-xs font-bold">URL Slug</Label>
                <Input
                  id="catSlug"
                  placeholder="linen-shirts"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parent" className="text-xs font-bold">Parent Category (Optional)</Label>
                <Select value={parentId || 'none'} onValueChange={(val) => setParentId(val || undefined)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Root Category (No Parent)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">Root Category (None)</SelectItem>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  disabled={createCategoryMutation.isPending}
                  className="text-xs font-bold"
                >
                  {createCategoryMutation.isPending ? 'Saving...' : 'Save Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category List */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="p-4 bg-secondary/30 border-b border-border text-xs font-bold text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>Storefront Categories ({categories?.length || 0})</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading categories...
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No categories configured.
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <FolderTree className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{cat.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      /products?category={cat.slug}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    depth: {cat.depth}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deleteCategoryMutation.isPending}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
