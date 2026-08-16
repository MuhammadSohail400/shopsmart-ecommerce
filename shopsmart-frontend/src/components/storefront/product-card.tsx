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
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/40 bg-card relative rounded-2xl h-full">
      {/* Image Area - strict square aspect ratio for balanced e-com standard */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-secondary/30 flex items-center justify-center overflow-hidden">
        {/* Placeholder for missing images */}
        {product.images?.[0] ? (
          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="text-muted-foreground/30 flex flex-col items-center gap-4 relative z-0">
            <Package className="h-16 w-16" strokeWidth={1} />
            <span className="text-4xl font-bold tracking-tighter opacity-40">{initials}</span>
          </div>
        )}
        
        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-end pb-6">
          <Button variant="secondary" size="sm" className="shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 h-9 font-medium px-6 rounded-full hover:bg-primary hover:text-primary-foreground">
            View Details
          </Button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {isOutOfStock && (
            <Badge variant="destructive" className="shadow-sm font-semibold tracking-wide">Out of Stock</Badge>
          )}
          {!isOutOfStock && product.status === 'new' && (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-semibold tracking-wide">New</Badge>
          )}
        </div>
        
        {/* Wishlist Button */}
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-background/90 shadow-sm backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-background ${isInWishlist ? 'text-primary opacity-100' : 'text-muted-foreground hover:text-primary'}`}
            onClick={handleToggleWishlist}
            disabled={addToWishlist.isPending || removeFromWishlist.isPending}
          >
            <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? 'fill-primary text-primary' : ''}`} />
            <span className="sr-only">Toggle wishlist</span>
          </Button>
        )}
      </Link>

      <CardContent className="flex flex-col gap-1.5 p-4 flex-1">
        <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
          {product.brand?.name || 'Generic'}
        </div>
        <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors line-clamp-2">
          <h3 className="font-semibold text-sm leading-snug tracking-tight text-foreground">
            {product.title}
          </h3>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-end justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-foreground tracking-tight">{formattedPrice}</span>
        </div>
        
        <Button 
          size="icon" 
          variant={isOutOfStock ? 'outline' : 'secondary'} 
          disabled={isOutOfStock || addToCart.isPending} 
          className="h-10 w-10 rounded-full transition-transform hover:scale-110 hover:bg-primary hover:text-primary-foreground shadow-sm bg-secondary/80"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
