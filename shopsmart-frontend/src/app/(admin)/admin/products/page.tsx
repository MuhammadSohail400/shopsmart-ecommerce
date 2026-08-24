"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ImagePlus,
  Boxes,
  CheckCircle2,
  Shirt,
  Sparkles,
  Layers,
  Eye,
  AlertCircle,
  Tag,
  FolderTree
} from 'lucide-react';
import { useProducts, useCategories, useBrands } from '@/hooks/use-catalog';
import { useCreateProduct, useDeleteProduct, useAddImage, useAddVariant } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';

// Quick Preset Local Assets for ASORA
const PRESET_SHIRTS = Array.from({ length: 24 }, (_, i) => `/products/shirts/shirt-${i + 1}.jpeg`);
const PRESET_PANTS = Array.from({ length: 22 }, (_, i) => `/products/pants/pant-${i + 1}.jpeg`);

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'STANDARD'];

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [imageCategoryTab, setImageCategoryTab] = useState<'shirts' | 'pants' | 'custom'>('shirts');

  // Quick Add Image Dialog State
  const [selectedProductForImage, setSelectedProductForImage] = useState<any>(null);
  const [extraImageUrl, setExtraImageUrl] = useState('/products/shirts/shirt-1.jpeg');
  const [extraImageCategoryTab, setExtraImageCategoryTab] = useState<'shirts' | 'pants'>('shirts');

  // Queries
  const { data: productsData, isLoading } = useProducts({ limit: 100, q: searchQuery || undefined });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  // Mutations
  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();
  const addImageMutation = useAddImage();
  const addVariantMutation = useAddVariant();

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newBrandId, setNewBrandId] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('/products/shirts/shirt-1.jpeg');
  const [newSize, setNewSize] = useState('M');
  const [newStock, setNewStock] = useState('50');

  // Auto-select category & brand once loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !newCategoryId) {
      setNewCategoryId(categories[0].id);
    }
  }, [categories, newCategoryId]);

  useEffect(() => {
    if (brands && brands.length > 0 && !newBrandId) {
      setNewBrandId(brands[0].id);
    }
  }, [brands, newBrandId]);

  const products = productsData?.pages?.[0]?.data || [];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category?.slug !== selectedCategory && p.categoryId !== selectedCategory) {
      return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalStockCount = products.reduce((acc, p) => {
    return acc + (p.variants?.reduce((sum, v) => sum + (v.inventory?.quantity || 0), 0) || 0);
  }, 0);
  const activeProductsCount = products.filter((p) => p.status === 'approved' || p.status === 'active').length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice || !newCategoryId) {
      toast.error('Please enter product title, base price, and category');
      return;
    }

    const slug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      // 1. Create Product
      const created = await createProductMutation.mutateAsync({
        title: newTitle.trim(),
        slug: slug || `product-${Date.now()}`,
        description: newDescription.trim() || `Official ASORA streetwear collection - ${newTitle.trim()}. 240 GSM heavy combed cotton.`,
        basePrice: Number(newPrice),
        categoryId: newCategoryId,
        brandId: newBrandId && newBrandId !== '' ? newBrandId : undefined,
        status: 'approved',
      });

      // 2. Attach initial Image if provided
      if (created?.id && newImageUrl) {
        try {
          await addImageMutation.mutateAsync({
            productId: created.id,
            data: { url: newImageUrl, sortOrder: 0 },
          });
        } catch {
          // Non-blocking
        }
      }

      // 3. Attach initial Size Variant & Stock if provided
      if (created?.id && newSize) {
        try {
          await addVariantMutation.mutateAsync({
            productId: created.id,
            data: {
              sku: `${slug || 'prod'}-${newSize}-${Math.floor(100 + Math.random() * 900)}`.toUpperCase(),
              attributes: { size: newSize },
              initialStock: Number(newStock) || 50,
            } as any,
          });
        } catch {
          // Non-blocking
        }
      }

      setIsAddOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setNewImageUrl('/products/shirts/shirt-1.jpeg');
      toast.success(`Product "${newTitle}" created & published successfully!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create product');
    }
  };

  const handleAddExtraImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForImage || !extraImageUrl) return;

    try {
      await addImageMutation.mutateAsync({
        productId: selectedProductForImage.id,
        data: { url: extraImageUrl, sortOrder: (selectedProductForImage.images?.length || 0) + 1 },
      });
      setSelectedProductForImage(null);
      setExtraImageUrl('/products/shirts/shirt-1.jpeg');
      toast.success('Image attached to product successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to attach image');
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(id);
    }
  };

  const selectedBrandName = brands?.find((b) => b.id === newBrandId)?.name || 'ASORA';

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
              Inventory & Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">
            Products Catalog
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Manage your store apparel, streetwear drops, sizes, stock levels, and pricing.
          </p>
        </div>

        {/* Add Product Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="font-mono font-black uppercase tracking-wider rounded-xl text-xs gap-2 shadow-lg h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" /> Add New Product
              </Button>
            }
          />
          <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-card border-border shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-border bg-secondary/20">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Shirt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black uppercase tracking-tight">
                    Add & Publish Product
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Create and publish a new anime drop, shirt, or bottom with image presets and size variants.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-5">
              {/* Product Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-mono font-bold text-foreground uppercase">
                  Product Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. ASORA Oversized Jujutsu Anime Heavyweight Tee"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs h-10 bg-secondary/30 border-border focus-visible:ring-primary font-medium"
                  required
                />
              </div>

              {/* Price, Category, Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-mono font-bold text-foreground uppercase">
                    Base Price (PKR) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="2950"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="text-xs h-10 bg-secondary/30 border-border font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-mono font-bold text-foreground uppercase">
                    Category *
                  </Label>
                  <Select value={newCategoryId} onValueChange={(val) => val && setNewCategoryId(val)}>
                    <SelectTrigger className="text-xs h-10 bg-secondary/30 border-border">
                      <SelectValue placeholder="Select Category">
                        {categories?.find((c) => c.id === newCategoryId)?.name || 'Select Category'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs font-medium">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brand" className="text-xs font-mono font-bold text-foreground uppercase">
                    Brand
                  </Label>
                  <Select value={newBrandId} onValueChange={(val) => val && setNewBrandId(val)}>
                    <SelectTrigger className="text-xs h-10 bg-secondary/30 border-border">
                      <SelectValue placeholder="Select Brand">
                        {selectedBrandName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id} className="text-xs font-medium">
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Visual Image Selector & Live Preview */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-secondary/20 border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-mono font-bold text-foreground uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Product Image & Lookbook
                  </Label>
                  <div className="flex items-center gap-1 bg-secondary/60 p-0.5 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setImageCategoryTab('shirts')}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                        imageCategoryTab === 'shirts'
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Shirts ({PRESET_SHIRTS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageCategoryTab('pants')}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                        imageCategoryTab === 'pants'
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Pants ({PRESET_PANTS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageCategoryTab('custom')}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                        imageCategoryTab === 'custom'
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Custom URL
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  {/* Live Thumbnail Preview */}
                  <div className="h-28 rounded-xl bg-zinc-950 border border-zinc-800 relative overflow-hidden flex items-center justify-center group shadow-md">
                    {newImageUrl ? (
                      <Image
                        src={newImageUrl}
                        alt="Product preview"
                        fill
                        sizes="160px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Shirt className="h-8 w-8 text-zinc-700" />
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-[9px] font-mono px-1.5 py-0.5 rounded text-zinc-300">
                      Preview
                    </span>
                  </div>

                  {/* Visual Gallery Selection or Custom Input */}
                  <div className="md:col-span-3 space-y-2">
                    <Input
                      id="imgUrl"
                      placeholder="/products/shirts/shirt-1.jpeg"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="text-xs h-8 bg-zinc-900 border-zinc-800 font-mono text-zinc-200"
                      required
                    />

                    {imageCategoryTab !== 'custom' ? (
                      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        {(imageCategoryTab === 'shirts' ? PRESET_SHIRTS : PRESET_PANTS).map((preset) => {
                          const isSelected = newImageUrl === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNewImageUrl(preset)}
                              className={`relative h-10 w-full rounded-md overflow-hidden border transition-all ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/40 scale-95 shadow-sm'
                                  : 'border-zinc-800 hover:border-zinc-600 opacity-70 hover:opacity-100'
                              }`}
                              title={preset.split('/').pop()}
                            >
                              <Image
                                src={preset}
                                alt="Preset"
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Enter any valid image path from <code className="text-zinc-300 font-mono">/products/shirts/</code> or an HTTPS image link.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Initial Size Variant & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-secondary/20 border border-border">
                <div className="space-y-1.5">
                  <Label htmlFor="initialSize" className="text-xs font-mono font-bold text-foreground uppercase">
                    Initial Size Variant
                  </Label>
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {STANDARD_SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setNewSize(sz)}
                        className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border transition-colors ${
                          newSize === sz
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                  <Input
                    id="initialSize"
                    placeholder="M"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="text-xs h-9 bg-secondary/30 border-border font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="initialStock" className="text-xs font-mono font-bold text-foreground uppercase">
                    Initial Warehouse Inventory
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Units ready for dispatch in warehouse</p>
                  <Input
                    id="initialStock"
                    type="number"
                    placeholder="50"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="text-xs h-9 bg-secondary/30 border-border font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-mono font-bold text-foreground uppercase">
                  Fabric & Story Description
                </Label>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="240 GSM 100% heavy combed cotton, drop-shoulder boxy streetwear cut, premium screen print with high color-fastness..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="text-xs bg-secondary/30 border-border focus-visible:ring-primary leading-relaxed"
                />
              </div>

              <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                  className="text-xs font-mono font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createProductMutation.isPending}
                  className="text-xs font-mono font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                >
                  {createProductMutation.isPending ? 'Publishing Drop...' : 'Publish Product to Store'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Total Products</span>
            <Shirt className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">{products.length}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Catalog items</p>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Active Drops</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">{activeProductsCount}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Live on storefront</p>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Total Stock</span>
            <Boxes className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalStockCount}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Units in inventory</p>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Categories</span>
            <FolderTree className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{categories?.length || 0}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Active collections</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 rounded-2xl border-border flex flex-col sm:flex-row items-center gap-3 bg-card shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by title, slug or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-10 bg-secondary/30 border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
            <SelectTrigger className="h-10 text-xs w-full sm:w-48 bg-secondary/30 border-border font-medium">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Collections" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-xs font-bold">All Collections</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.slug} className="text-xs font-medium">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-mono font-black uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Variants & Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading ASORA catalog items...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6 text-muted-foreground/60" />
                      <p className="font-bold text-foreground">No products found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search query or collection filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const imageSrc = p.images?.[0]?.url || '/products/shirts/shirt-1.jpeg';
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.inventory?.quantity || 0), 0) || 0;

                  return (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors group">
                      {/* Product Name & Thumbnail */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 relative rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-border shadow-xs">
                            <Image
                              src={imageSrc}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              className="font-black text-sm text-foreground hover:text-primary transition-colors truncate block"
                            >
                              {p.title}
                            </Link>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">
                              slug: {p.slug} • {p.brand?.name || 'ASORA'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] font-mono font-bold bg-secondary/80">
                          {p.category?.name || 'Streetwear'}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-mono font-black text-foreground">
                        Rs. {Number(p.basePrice).toLocaleString()}
                      </td>

                      {/* Variants & Stock */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-foreground font-mono">
                            {p.variants?.length || 0} Sizes
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className={`text-[10px] font-mono font-bold ${totalStock < 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {totalStock} in stock
                          </span>
                        </div>
                        {p.variants && p.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.variants.slice(0, 4).map((v) => (
                              <span key={v.id} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-secondary/50 text-muted-foreground">
                                {(v.attributes as any)?.size || v.sku}
                              </span>
                            ))}
                            {p.variants.length > 4 && (
                              <span className="text-[9px] font-mono text-muted-foreground">
                                +{p.variants.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 ${
                            p.status === 'approved' || p.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProductForImage(p)}
                            className="p-2 rounded-xl bg-secondary/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                            title="Add / Upload Lookbook Image"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>

                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="View Live on Storefront"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            disabled={deleteProductMutation.isPending}
                            className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Attach Extra Image Dialog */}
      <Dialog open={!!selectedProductForImage} onOpenChange={(open) => !open && setSelectedProductForImage(null)}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" /> Add Lookbook Photo
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Attach secondary angle or lifestyle photo for <strong className="text-foreground">{selectedProductForImage?.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExtraImage} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="extraImg" className="text-xs font-mono font-bold uppercase">
                Image URL or Local Path
              </Label>
              <Input
                id="extraImg"
                placeholder="/products/shirts/shirt-2.jpeg"
                value={extraImageUrl}
                onChange={(e) => setExtraImageUrl(e.target.value)}
                className="text-xs font-mono bg-secondary/30 border-border"
                required
              />
            </div>

            {/* Quick Presets for Extra Image */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Select from Presets:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraImageCategoryTab('shirts')}
                    className={`text-[10px] ${extraImageCategoryTab === 'shirts' ? 'text-primary font-bold' : ''}`}
                  >
                    Shirts
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraImageCategoryTab('pants')}
                    className={`text-[10px] ${extraImageCategoryTab === 'pants' ? 'text-primary font-bold' : ''}`}
                  >
                    Pants
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
                {(extraImageCategoryTab === 'shirts' ? PRESET_SHIRTS : PRESET_PANTS).slice(0, 18).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setExtraImageUrl(preset)}
                    className={`relative h-10 rounded overflow-hidden border transition-all ${
                      extraImageUrl === preset ? 'border-primary ring-2 ring-primary/40' : 'border-zinc-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={preset} alt="Preset" fill sizes="40px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 text-xs flex items-center gap-3 border border-border">
              <div className="h-12 w-12 rounded-lg bg-zinc-950 relative overflow-hidden shrink-0 border border-border">
                <Image
                  src={extraImageUrl || '/products/shirts/shirt-1.jpeg'}
                  alt="Preview"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="text-[11px] text-muted-foreground leading-snug">
                Image preview. You can use any local asset or external image URL.
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedProductForImage(null)}
                className="text-xs font-mono font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addImageMutation.isPending}
                className="text-xs font-mono font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {addImageMutation.isPending ? 'Attaching...' : 'Add Image'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
