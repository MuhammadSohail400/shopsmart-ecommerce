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
    <Card className="group flex flex-col overflow-hidden transition-all hover:shadow-lg border-muted bg-card hover:-translate-y-1 duration-300 relative">
      {/* Fallback Image Area */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
        {/* Placeholder for missing images */}
        {product.images?.[0] ? (
          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover absolute inset-0 z-0" />
        ) : (
          <div className="text-muted-foreground/30 flex flex-col items-center gap-4 relative z-0">
            <Package className="h-16 w-16" strokeWidth={1} />
            <span className="text-4xl font-bold tracking-tighter opacity-40">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-background/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <Button variant="secondary" size="sm" className="shadow-xl scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-75">
            Quick View
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
            className={`absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-background/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background ${isInWishlist ? 'text-primary opacity-100' : 'hover:text-primary'}`}
            onClick={handleToggleWishlist}
            disabled={addToWishlist.isPending || removeFromWishlist.isPending}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-primary text-primary' : ''}`} />
            <span className="sr-only">Toggle wishlist</span>
          </Button>
        )}
      </Link>

      <CardContent className="flex flex-col gap-2 p-4 pt-5 flex-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          {product.brand?.name || 'Generic'}
        </div>
        <Link href={`/products/${product.slug}`} className="hover:underline line-clamp-2">
          <h3 className="font-semibold text-lg leading-tight tracking-tight text-card-foreground">
            {product.title}
          </h3>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary">{formattedPrice}</span>
          {/* Discount placeholder if needed in future */}
        </div>
        
        <Button 
          size="icon" 
          variant={isOutOfStock ? 'outline' : 'default'} 
          disabled={isOutOfStock || addToCart.isPending} 
          className="h-10 w-10 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-sm"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
