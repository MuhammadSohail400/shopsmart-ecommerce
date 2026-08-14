import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-bold tracking-tight text-primary transition-opacity hover:opacity-80"
      >
        <ShoppingBag className="h-8 w-8" />
        ShopSmart
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
