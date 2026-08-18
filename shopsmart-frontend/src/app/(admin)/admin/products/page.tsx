"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useProducts, useCategories, useBrands } from '@/hooks/use-catalog';
import { useCreateProduct, useDeleteProduct } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Queries
  const { data: productsData, isLoading } = useProducts({ limit: 100, q: searchQuery || undefined });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  // Mutations
  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newBrandId, setNewBrandId] = useState('');

  const products = productsData?.pages?.[0]?.data || [];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category?.slug !== selectedCategory && p.categoryId !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newCategoryId) return;

    const slug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await createProductMutation.mutateAsync({
      title: newTitle,
      slug: slug || `product-${Date.now()}`,
      description: newDescription || `Premium crafted ${newTitle}.`,
      basePrice: Number(newPrice),
      categoryId: newCategoryId,
      brandId: newBrandId && newBrandId !== '' ? newBrandId : undefined,
      status: 'approved',
    });

    setIsAddOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewPrice('');
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteProductMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Products Catalog
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Manage your store apparel, prices, variants, inventory, and status.
          </p>
        </div>

        {/* Add Product Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="font-bold rounded-full text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Add New Product
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Add New Product
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a new shirt or trouser product in the database.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateProduct} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold">Product Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Royal Blue Oxford Button-Down Shirt"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-bold">Base Price (PKR)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="2950"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold">Category</Label>
                  <Select value={newCategoryId} onValueChange={(val) => val && setNewCategoryId(val)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-bold">Brand (Optional)</Label>
                <Select value={newBrandId} onValueChange={(val) => val && setNewBrandId(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id} className="text-xs">
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-bold">Description</Label>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="Describe material, fabric weave, styling, and fit..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="text-xs"
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
                  disabled={createProductMutation.isPending}
                  className="text-xs font-bold"
                >
                  {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 rounded-2xl border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-44">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.slug} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Variants</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                    Loading catalog items...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                    No products match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const imageSrc = p.images?.[0]?.url || '/products/shirts/shirt-1.jpeg';
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.inventory?.quantity || 0), 0) || 0;

                  return (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Product Name & Thumbnail */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 relative rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                            <Image
                              src={imageSrc}
                              alt={p.title}
                              fill
                              sizes="(max-width: 768px) 100px, 50px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-foreground truncate">{p.title}</div>
                            <div className="text-[10px] text-muted-foreground truncate font-mono">
                              slug: {p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {p.category?.name || 'General'}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-bold text-foreground">
                        Rs. {Number(p.basePrice).toLocaleString()}
                      </td>

                      {/* Variants & Stock */}
                      <td className="p-3.5">
                        <div className="text-[11px] font-bold text-foreground">
                          {p.variants?.length || 0} Sizes
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {totalStock} in stock
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            p.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            disabled={deleteProductMutation.isPending}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
