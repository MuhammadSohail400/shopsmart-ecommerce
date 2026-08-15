import Link from 'next/link';
import { Package, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/services/products.service';
import { useCurrentUser } from '@/hooks/use-auth';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { useAddToCart } from '@/features/cart/hooks/use-cart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: user } = useCurrentUser();
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  // Use first 2 letters for initials
  const initials = product.title.substring(0, 2).toUpperCase();
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(product.basePrice));

  const totalInventory = product.variants.reduce((acc, variant) => {
    return acc + (variant.inventory ? variant.inventory.quantity - variant.inventory.reservedQuantity : 0);
  }, 0);
  
  const isOutOfStock = totalInventory <= 0;
  
  const isInWishlist = wishlist?.items?.some(item => item.productId === product.id) ?? false;
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return; // In a real app, might redirect to login or show a toast
    
    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the first available variant to add
    const defaultVariant = product.variants.find(v => {
      const inv = v.inventory;
      return inv ? inv.quantity - inv.reservedQuantity > 0 : false;
    }) || product.variants[0];
    
    if (defaultVariant) {
      addToCart.mutate({ productVariantId: defaultVariant.id, quantity: 1 });
    }
  };

  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:shadow-md border-border bg-card relative rounded-lg">
      {/* Image Area - strict 4/5 aspect ratio for fashion/e-com standard */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] w-full bg-muted/30 flex items-center justify-center overflow-hidden">
        {/* Placeholder for missing images */}
        {product.images?.[0] ? (
          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover absolute inset-0 z-0" />
        ) : (
          <div className="text-muted-foreground/30 flex flex-col items-center gap-4 relative z-0">
            <Package className="h-16 w-16" strokeWidth={1} />
            <span className="text-4xl font-bold tracking-tighter opacity-40">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-end pb-4">
          <Button variant="secondary" size="sm" className="shadow-sm translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 h-8 text-xs px-4 rounded-full">
            View Details
          </Button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {isOutOfStock && (
            <Badge variant="destructive" className="shadow-sm">Out of Stock</Badge>
          )}
          {!isOutOfStock && product.status === 'new' && (
            <Badge className="bg-blue-500 hover:bg-blue-600 shadow-sm">New</Badge>
          )}
        </div>
        
        {/* Wishlist Button Placeholder */}
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-background/80 shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background ${isInWishlist ? 'text-primary opacity-100' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={handleToggleWishlist}
            disabled={addToWishlist.isPending || removeFromWishlist.isPending}
          >
            <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? 'fill-primary text-primary' : ''}`} />
            <span className="sr-only">Toggle wishlist</span>
          </Button>
        )}
      </Link>

      <CardContent className="flex flex-col gap-1 p-3 flex-1">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          {product.brand?.name || 'Generic'}
        </div>
        <Link href={`/products/${product.slug}`} className="hover:underline line-clamp-2">
          <h3 className="font-medium text-sm leading-snug tracking-tight text-foreground">
            {product.title}
          </h3>
        </Link>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">{formattedPrice}</span>
        </div>
        
        <Button 
          size="icon" 
          variant={isOutOfStock ? 'outline' : 'secondary'} 
          disabled={isOutOfStock || addToCart.isPending} 
          className="h-8 w-8 rounded-full transition-transform hover:bg-primary hover:text-primary-foreground shadow-sm"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
