import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-primary transition-opacity hover:opacity-80">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xl">ShopSmart</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your one-stop destination for everything you need. Experience smart shopping today.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ShopSmart AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
