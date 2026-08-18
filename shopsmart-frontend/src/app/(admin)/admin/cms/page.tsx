"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAdminBanners, useCreateBanner, useDeleteBanner } from '@/hooks/use-admin';
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

export default function AdminCmsPage() {
  const { data: banners, isLoading } = useAdminBanners();
  const createBannerMutation = useCreateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/hero-menswear.jpg');
  const [linkUrl, setLinkUrl] = useState('/products?category=formal-shirts');
  const [sortOrder, setSortOrder] = useState('0');

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    await createBannerMutation.mutateAsync({
      title,
      imageUrl,
      linkUrl: linkUrl || undefined,
      sortOrder: Number(sortOrder),
    });

    setIsAddBannerOpen(false);
    setTitle('');
  };

  const handleDeleteBanner = (id: string, bTitle: string) => {
    if (confirm(`Delete banner "${bTitle}"?`)) {
      deleteBannerMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            CMS & Hero Banners
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Manage storefront promotional campaigns, hero creatives, and visual announcements.
          </p>
        </div>

        <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
          <DialogTrigger
            render={
              <Button className="font-bold rounded-full text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Add Hero Banner
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Add Promotional Banner
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload or link a campaign banner for the storefront header.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateBanner} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="btitle" className="text-xs font-bold">Campaign Title</Label>
                <Input
                  id="btitle"
                  placeholder="e.g. Summer Cotton Shirts Collection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bimg" className="text-xs font-bold">Image URL / Path</Label>
                <Input
                  id="bimg"
                  placeholder="/images/hero-menswear.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="blink" className="text-xs font-bold">Target Route Link</Label>
                  <Input
                    id="blink"
                    placeholder="/products?category=formal-shirts"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bsort" className="text-xs font-bold">Display Order</Label>
                  <Input
                    id="bsort"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddBannerOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createBannerMutation.isPending}
                  className="text-xs font-bold"
                >
                  {createBannerMutation.isPending ? 'Saving...' : 'Save Banner'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-xs text-muted-foreground">
            Loading banners...
          </div>
        ) : !banners || banners.length === 0 ? (
          <Card className="col-span-full p-8 text-center rounded-2xl border-border text-xs text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto text-primary mb-2 opacity-80" />
            <p className="font-bold text-foreground">No active dynamic banners</p>
            <p className="text-[11px] mt-0.5">The storefront uses the primary Split-Layout Menswear hero by default.</p>
          </Card>
        ) : (
          banners.map((b) => (
            <Card key={b.id} className="rounded-2xl border-border overflow-hidden shadow-2xs group">
              <div className="relative aspect-[16/9] w-full bg-muted">
                <Image
                  src={b.imageUrl}
                  alt={b.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-foreground uppercase">{b.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
                    link: {b.linkUrl || '/products'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteBanner(b.id, b.title)}
                    disabled={deleteBannerMutation.isPending}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
