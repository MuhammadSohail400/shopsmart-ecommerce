"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useAdminReviews,
  useAdminReviewStats,
  useUpdateReviewStatus,
  useDeleteReview,
} from '@/hooks/use-admin';
import { AdminReview } from '@/services/admin-operations.service';
import { resolveMediaUrl } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmReview, setDeleteConfirmReview] = useState<AdminReview | null>(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useAdminReviewStats();
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch,
    isFetching,
  } = useAdminReviews({
    status: statusFilter,
    rating: ratingFilter !== 'all' ? parseInt(ratingFilter, 10) : undefined,
    search: searchQuery || undefined,
  });

  const updateStatusMutation = useUpdateReviewStatus();
  const deleteReviewMutation = useDeleteReview();

  const reviews = reviewsData?.data || [];
  const stats = statsData || { total: 0, published: 0, hidden: 0, averageRating: 5.0 };

  const handleToggleStatus = (review: AdminReview) => {
    updateStatusMutation.mutate({
      id: review.id,
      hidden: !review.hidden,
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmReview) return;
    deleteReviewMutation.mutate(deleteConfirmReview.id, {
      onSuccess: () => setDeleteConfirmReview(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600/10 border border-rose-500/20 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
            <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
            <span>Storefront Governance</span>
          </div>
          <h1 className="text-2xl font-black font-sans tracking-tight text-foreground uppercase">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            Inspect, approve, and manage customer UGC ratings and verified buyer feedback.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="font-mono text-xs uppercase gap-1.5 h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Total Reviews
            </span>
            <CardTitle className="text-2xl font-black font-mono text-foreground">
              {statsLoading ? <Skeleton className="h-7 w-16" /> : stats.total}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Average Store Rating
            </span>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-black font-mono text-amber-400 flex items-center gap-1">
                <span>{statsLoading ? '5.0' : stats.averageRating.toFixed(1)}</span>
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Published & Live
            </span>
            <CardTitle className="text-2xl font-black font-mono text-emerald-400">
              {statsLoading ? <Skeleton className="h-7 w-16" /> : stats.published}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Moderated / Hidden
            </span>
            <CardTitle className="text-2xl font-black font-mono text-rose-400">
              {statsLoading ? <Skeleton className="h-7 w-16" /> : stats.hidden}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3.5 rounded-xl bg-card border border-border">
        {/* Status Tabs */}
        <div className="flex rounded-lg border border-border p-1 bg-secondary/40 text-xs font-mono">
          {(['all', 'published', 'hidden'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-bold uppercase transition-colors ${
                statusFilter === tab
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'All Reviews' : tab === 'published' ? 'Live' : 'Hidden'}
            </button>
          ))}
        </div>

        {/* Rating & Search Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={ratingFilter} onValueChange={(val) => val && setRatingFilter(val)}>
            <SelectTrigger className="w-36 h-9 font-mono text-xs bg-secondary/30 border-border">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent className="font-mono text-xs">
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">★ 5 Stars Only</SelectItem>
              <SelectItem value="4">★ 4 Stars Only</SelectItem>
              <SelectItem value="3">★ 3 Stars Only</SelectItem>
              <SelectItem value="2">★ 2 Stars Only</SelectItem>
              <SelectItem value="1">★ 1 Star Only</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search comments, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs font-mono bg-secondary/30 border-border"
            />
          </div>
        </div>
      </div>

      {/* ── REVIEWS LIST / GRID ── */}
      {reviewsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center space-y-3">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-mono font-bold uppercase text-foreground">
            No Customer Reviews Found
          </h3>
          <p className="text-xs font-mono text-muted-foreground max-w-sm mx-auto">
            {searchQuery || ratingFilter !== 'all' || statusFilter !== 'all'
              ? 'No reviews match your current filter criteria.'
              : 'Customer product reviews will appear here once verified buyers share feedback.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: AdminReview) => {
            const product = review.product;
            const user = review.user;
            const isLive = !review.hidden;
            const productImg = resolveMediaUrl(product?.images?.[0]?.url);

            return (
              <div
                key={review.id}
                className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-border/80 transition-colors"
              >
                {/* Left: Product & Customer Info */}
                <div className="flex gap-3 items-start md:items-center">
                  <div className="w-14 h-16 rounded-lg bg-secondary/50 border border-border shrink-0 overflow-hidden flex items-center justify-center p-1">
                    <img
                      src={productImg}
                      alt={product?.title || 'Product'}
                      className="object-contain w-full h-full rounded"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={product?.slug ? `/products/${product.slug}` : '#'}
                        target="_blank"
                        className="font-bold text-xs text-foreground hover:text-rose-400 transition-colors uppercase inline-flex items-center gap-1"
                      >
                        <span>{product?.title || 'ASORA STREETWEAR PIECE'}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      <Badge
                        className={`text-[9px] font-mono font-bold uppercase h-4 px-1.5 ${
                          isLive
                            ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-600/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {isLive ? 'LIVE ON STORE' : 'HIDDEN'}
                      </Badge>

                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified Buyer</span>
                      </span>
                    </div>

                    {/* Star Rating Visualization */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-mono font-bold text-foreground ml-1">
                        {review.rating}.0
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground ml-2">
                        by <strong className="text-foreground">{user?.email || 'Anonymous'}</strong>
                      </span>
                      {review.order?.orderNumber && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          (Order: {review.order.orderNumber})
                        </span>
                      )}
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-xs text-zinc-300 font-sans italic bg-secondary/30 p-2 rounded border border-border/60 mt-1 max-w-xl">
                        "{review.comment}"
                      </p>
                    )}

                    <span className="text-[10px] font-mono text-muted-foreground block pt-0.5">
                      Submitted on {new Date(review.createdAt).toLocaleString('en-PK', { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(review)}
                    disabled={updateStatusMutation.isPending}
                    className={`font-mono text-xs uppercase h-8 px-3 gap-1.5 ${
                      isLive
                        ? 'border-amber-900/40 text-amber-400 hover:bg-amber-950/30'
                        : 'border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/30'
                    }`}
                  >
                    {isLive ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Hide Review</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>Approve & Publish</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirmReview(review)}
                    className="border-rose-900/40 text-rose-400 hover:bg-rose-950/30 font-mono text-xs uppercase h-8 px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deleteConfirmReview)} onOpenChange={(open) => !open && setDeleteConfirmReview(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-mono font-bold uppercase text-rose-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Confirm Permanent Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-zinc-400">
              Are you sure you want to permanently delete this customer review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmReview(null)}
              className="font-mono text-xs uppercase"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteReviewMutation.isPending}
              className="font-mono text-xs uppercase bg-rose-600 hover:bg-rose-700"
            >
              {deleteReviewMutation.isPending ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
