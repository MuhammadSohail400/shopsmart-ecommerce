import Link from 'next/link';
import { PackageSearch, Home, ShoppingBag } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center container py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="p-5 rounded-3xl bg-secondary/50 text-muted-foreground/40 w-fit mx-auto">
          <PackageSearch className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">404 Error</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page or product you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className={buttonVariants({ className: 'w-full sm:w-auto rounded-full gap-2 font-semibold shadow-md' })}
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-auto rounded-full gap-2 font-semibold' })}
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
